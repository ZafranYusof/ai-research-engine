from fastapi import APIRouter, BackgroundTasks, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Set
from app.services.pipeline import ResearchPipeline
from app.services.activity import activity_service
from app.db.mongodb import mongodb
import asyncio
import uuid
import json

# WebSocket connections per project
_ws_connections: Dict[str, Set[WebSocket]] = {}

router = APIRouter()


class ResearchRequest(BaseModel):
    topic: str
    max_papers: int = 50
    year_from: Optional[int] = 2019
    year_to: Optional[int] = 2026
    focus_areas: List[str] = []

@router.websocket("/ws/{project_id}")
async def websocket_progress(websocket: WebSocket, project_id: str):
    """WebSocket endpoint for real-time pipeline progress."""
    await websocket.accept()

    if project_id not in _ws_connections:
        _ws_connections[project_id] = set()
    _ws_connections[project_id].add(websocket)

    try:
        # Send current status immediately
        job = await mongodb.projects.find_one({"id": project_id}, {"_id": 0})
        if job:
            await websocket.send_json({
                "step": job.get("current_step", "initializing"),
                "progress": job.get("progress", 0),
                "message": job.get("message", ""),
                "status": job.get("status", "started"),
            })

        # Keep connection alive until client disconnects or pipeline completes
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=60)
            except asyncio.TimeoutError:
                # Send ping to keep alive
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
    except WebSocketDisconnect:
        pass
    finally:
        _ws_connections.get(project_id, set()).discard(websocket)
        if project_id in _ws_connections and not _ws_connections[project_id]:
            del _ws_connections[project_id]


async def _broadcast_progress(project_id: str, step: str, progress: float, message: str, status: str = "running"):
    """Broadcast progress to all connected WebSocket clients."""
    connections = _ws_connections.get(project_id, set()).copy()
    payload = {
        "step": step,
        "progress": progress,
        "message": message,
        "status": status,
    }
    for ws in connections:
        try:
            await ws.send_json(payload)
        except Exception:
            _ws_connections.get(project_id, set()).discard(ws)


class ShareRequest(BaseModel):
    email: str


@router.post("/start")
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """Start a new research pipeline."""
    project_id = str(uuid.uuid4())

    project_doc = {
        "id": project_id,
        "topic": request.topic,
        "status": "started",
        "progress": 0,
        "current_step": "initializing",
        "message": "Starting research pipeline...",
        "results": None,
        "owner_email": "",
        "collaborators": [],
    }
    await mongodb.projects.insert_one(project_doc)

    # Log activity
    await activity_service.log_activity(
        user_email="",
        action="research_started",
        details=f"Started research: {request.topic}",
        project_id=project_id,
    )

    background_tasks.add_task(run_research_pipeline, project_id, request)

    return {"project_id": project_id, "status": "started"}

@router.get("/status/{project_id}")
async def get_research_status(project_id: str):
    """Get status of a research pipeline."""
    job = await mongodb.projects.find_one({"id": project_id}, {"_id": 0})
    if not job:
        return {"error": "Project not found"}

    return {
        "id": job["id"],
        "topic": job["topic"],
        "status": job["status"],
        "progress": job["progress"],
        "current_step": job["current_step"],
        "message": job["message"],
    }

@router.get("/results/{project_id}")
async def get_research_results(project_id: str):
    """Get results of completed research."""
    job = await mongodb.projects.find_one({"id": project_id}, {"_id": 0})
    if not job:
        return {"error": "Project not found"}

    if job["status"] != "completed":
        return {"error": "Research not yet completed", "status": job["status"]}

    return job["results"]

@router.get("/stats")
async def get_research_stats():
    """Get aggregated research statistics."""
    completed_projects = []
    cursor = mongodb.projects.find({"status": "completed"}, {"_id": 0})
    async for doc in cursor:
        completed_projects.append(doc)

    total_projects = await mongodb.projects.count_documents({})
    completed_count = len(completed_projects)

    total_papers = 0
    total_words = 0
    total_themes = 0
    total_gaps = 0
    total_duration = 0
    scores = []

    for proj in completed_projects:
        results = proj.get("results", {}) or {}
        papers = results.get("papers", [])
        total_papers += len(papers)

        # Count words from synthesis/report
        report = results.get("report", "") or results.get("synthesis", "")
        if isinstance(report, str):
            total_words += len(report.split())

        # Themes and gaps
        themes = results.get("themes", []) or []
        total_themes += len(themes)
        gaps = results.get("gaps", []) or results.get("research_gaps", [])
        if isinstance(gaps, list):
            total_gaps += len(gaps)

        # Score
        score = results.get("quality_score") or results.get("score")
        if score is not None:
            scores.append(float(score))

        # Duration
        duration = results.get("duration_seconds") or results.get("duration")
        if duration is not None:
            total_duration += float(duration)

    avg_score = round(sum(scores) / len(scores), 2) if scores else 0

    return {
        "total_projects": total_projects,
        "completed_projects": completed_count,
        "total_papers_analyzed": total_papers,
        "total_words_generated": total_words,
        "total_themes_found": total_themes,
        "total_gaps_found": total_gaps,
        "avg_score": avg_score,
        "total_duration_seconds": round(total_duration, 1),
    }

@router.get("/list")
async def list_research_projects():
    """List all research projects (owned + collaborated)."""
    projects = []
    cursor = mongodb.projects.find(
        {},
        {"_id": 0, "id": 1, "topic": 1, "status": 1, "progress": 1, "owner_email": 1, "collaborators": 1}
    )
    async for doc in cursor:
        projects.append({
            "id": doc["id"],
            "topic": doc["topic"],
            "status": doc["status"],
            "progress": doc["progress"],
            "owner_email": doc.get("owner_email", ""),
            "collaborators": doc.get("collaborators", []),
        })
    return {"projects": projects}


@router.post("/{project_id}/share")
async def add_collaborator(project_id: str, request: ShareRequest):
    """Add a collaborator to a project by email."""
    project = await mongodb.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    collaborators = project.get("collaborators", [])
    if request.email in collaborators:
        return {"status": "already_added", "collaborators": collaborators}

    collaborators.append(request.email)
    await mongodb.projects.update_one(
        {"id": project_id},
        {"$set": {"collaborators": collaborators}}
    )
    return {"status": "added", "collaborators": collaborators}


@router.delete("/{project_id}/share/{email}")
async def remove_collaborator(project_id: str, email: str):
    """Remove a collaborator from a project."""
    project = await mongodb.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    collaborators = project.get("collaborators", [])
    if email not in collaborators:
        raise HTTPException(status_code=404, detail="Collaborator not found")

    collaborators.remove(email)
    await mongodb.projects.update_one(
        {"id": project_id},
        {"$set": {"collaborators": collaborators}}
    )
    return {"status": "removed", "collaborators": collaborators}


@router.get("/{project_id}/collaborators")
async def get_collaborators(project_id: str):
    """List collaborators for a project."""
    project = await mongodb.projects.find_one({"id": project_id}, {"_id": 0, "collaborators": 1, "owner_email": 1})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "owner_email": project.get("owner_email", ""),
        "collaborators": project.get("collaborators", []),
    }

async def run_research_pipeline(project_id: str, request: ResearchRequest):
    """Execute the full research pipeline."""

    def on_progress(step: str, progress: float, message: str):
        """Sync callback that schedules async MongoDB update + WS broadcast."""
        try:
            loop = asyncio.get_event_loop()
            loop.create_task(
                mongodb.projects.update_one(
                    {"id": project_id},
                    {"$set": {
                        "current_step": step,
                        "progress": max(0, progress),
                        "message": message,
                    }}
                )
            )
            # Broadcast to WebSocket clients
            loop.create_task(
                _broadcast_progress(project_id, step, max(0, progress), message, "running")
            )
        except Exception:
            pass  # Don't let progress updates break the pipeline

    pipeline = ResearchPipeline(on_progress=on_progress)

    results = await pipeline.run({
        "topic": request.topic,
        "max_papers": request.max_papers,
        "year_range": (request.year_from, request.year_to),
        "focus_areas": request.focus_areas,
    })

    if results.get("status") == "completed":
        await mongodb.projects.update_one(
            {"id": project_id},
            {"$set": {
                "status": "completed",
                "progress": 1.0,
                "results": results,
            }}
        )
        await _broadcast_progress(project_id, "completed", 1.0, "Research complete!", "completed")
        # Log completion
        await activity_service.log_activity(
            user_email="",
            action="research_completed",
            details=f"Research completed: {request.topic}",
            project_id=project_id,
        )
    else:
        await mongodb.projects.update_one(
            {"id": project_id},
            {"$set": {
                "status": "failed",
                "message": results.get("error", "Unknown error"),
            }}
        )
        await _broadcast_progress(project_id, "failed", 0, results.get("error", "Unknown error"), "failed")
