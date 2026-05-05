from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from app.services.pipeline import ResearchPipeline
import uuid

router = APIRouter()

# In-memory store (replace with DB later)
research_jobs = {}


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

    research_jobs[project_id] = {
        "id": project_id,
        "topic": request.topic,
        "status": "started",
        "progress": 0,
        "current_step": "initializing",
        "message": "Starting research pipeline...",
        "results": None,
    }

    background_tasks.add_task(run_research_pipeline, project_id, request)

    return {"project_id": project_id, "status": "started"}


@router.get("/status/{project_id}")
async def get_research_status(project_id: str):
    """Get status of a research pipeline."""
    if project_id not in research_jobs:
        return {"error": "Project not found"}
    
    job = research_jobs[project_id]
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
    if project_id not in research_jobs:
        return {"error": "Project not found"}

    job = research_jobs[project_id]
    if job["status"] != "completed":
        return {"error": "Research not yet completed", "status": job["status"]}

    return job["results"]


@router.get("/list")
async def list_research_projects():
    """List all research projects."""
    projects = []
    for pid, job in research_jobs.items():
        projects.append({
            "id": pid,
            "topic": job["topic"],
            "status": job["status"],
            "progress": job["progress"],
        })
    return {"projects": projects}


async def run_research_pipeline(project_id: str, request: ResearchRequest):
    """Execute the full research pipeline."""
    
    def on_progress(step: str, progress: float, message: str):
        research_jobs[project_id]["current_step"] = step
        research_jobs[project_id]["progress"] = max(0, progress)
        research_jobs[project_id]["message"] = message

    pipeline = ResearchPipeline(on_progress=on_progress)
    
    results = await pipeline.run({
        "topic": request.topic,
        "max_papers": request.max_papers,
        "year_range": (request.year_from, request.year_to),
        "focus_areas": request.focus_areas,
    })

    if results.get("status") == "completed":
        research_jobs[project_id]["status"] = "completed"
        research_jobs[project_id]["progress"] = 1.0
        research_jobs[project_id]["results"] = results
    else:
        research_jobs[project_id]["status"] = "failed"
        research_jobs[project_id]["message"] = results.get("error", "Unknown error")
