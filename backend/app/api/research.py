from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from app.services.pipeline import ResearchPipeline
from app.db.mongodb import mongodb
import asyncio
import uuid

router = APIRouter()


class ResearchRequest(BaseModel):
    topic: str
    max_papers: int = 50
    year_from: Optional[int] = 2019
    year_to: Optional[int] = 2026
    focus_areas: List[str] = []

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
    }
    await mongodb.projects.insert_one(project_doc)

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

@router.get("/list")
async def list_research_projects():
    """List all research projects."""
    projects = []
    cursor = mongodb.projects.find({}, {"_id": 0, "id": 1, "topic": 1, "status": 1, "progress": 1})
    async for doc in cursor:
        projects.append({
            "id": doc["id"],
            "topic": doc["topic"],
            "status": doc["status"],
            "progress": doc["progress"],
        })
    return {"projects": projects}

async def run_research_pipeline(project_id: str, request: ResearchRequest):
    """Execute the full research pipeline."""

    def on_progress(step: str, progress: float, message: str):
        """Sync callback that schedules async MongoDB update."""
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
    else:
        await mongodb.projects.update_one(
            {"id": project_id},
            {"$set": {
                "status": "failed",
                "message": results.get("error", "Unknown error"),
            }}
        )
