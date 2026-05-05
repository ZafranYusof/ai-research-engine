from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from app.agents import RetrieverAgent, AnalyzerAgent, SynthesizerAgent

router = APIRouter()


class ResearchRequest(BaseModel):
    topic: str
    max_papers: int = 50
    year_from: Optional[int] = 2019
    year_to: Optional[int] = 2026
    focus_areas: List[str] = []


class ResearchStatus(BaseModel):
    project_id: str
    status: str
    progress: float
    current_step: str


# In-memory store (replace with DB in production)
research_jobs = {}


@router.post("/start")
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """Start a new research pipeline."""
    import uuid

    project_id = str(uuid.uuid4())

    research_jobs[project_id] = {
        "status": "started",
        "progress": 0,
        "current_step": "retrieving_papers",
        "results": None,
    }

    background_tasks.add_task(run_research_pipeline, project_id, request)

    return {"project_id": project_id, "status": "started"}


@router.get("/status/{project_id}")
async def get_research_status(project_id: str):
    """Get status of a research pipeline."""
    if project_id not in research_jobs:
        return {"error": "Project not found"}
    return research_jobs[project_id]


@router.get("/results/{project_id}")
async def get_research_results(project_id: str):
    """Get results of completed research."""
    if project_id not in research_jobs:
        return {"error": "Project not found"}

    job = research_jobs[project_id]
    if job["status"] != "completed":
        return {"error": "Research not yet completed", "status": job["status"]}

    return job["results"]


async def run_research_pipeline(project_id: str, request: ResearchRequest):
    """Execute the full research pipeline."""
    try:
        # Step 1: Retrieve papers
        research_jobs[project_id]["current_step"] = "retrieving_papers"
        research_jobs[project_id]["progress"] = 0.1

        retriever = RetrieverAgent()
        retrieval_result = await retriever.execute({
            "topic": request.topic,
            "max_papers": request.max_papers,
            "year_range": (request.year_from, request.year_to),
        })

        research_jobs[project_id]["progress"] = 0.3

        # Step 2: Analyze papers
        research_jobs[project_id]["current_step"] = "analyzing_papers"

        analyzer = AnalyzerAgent()
        analysis_result = await analyzer.execute({
            "papers": retrieval_result["papers"],
            "focus_areas": request.focus_areas,
        })

        research_jobs[project_id]["progress"] = 0.6

        # Step 3: Synthesize findings
        research_jobs[project_id]["current_step"] = "synthesizing"

        synthesizer = SynthesizerAgent()
        synthesis_result = await synthesizer.execute({
            "analyses": analysis_result["analyses"],
            "themes": analysis_result["common_themes"],
            "gaps": analysis_result["gaps"],
            "topic": request.topic,
        })

        research_jobs[project_id]["progress"] = 0.9

        # Complete
        research_jobs[project_id]["status"] = "completed"
        research_jobs[project_id]["progress"] = 1.0
        research_jobs[project_id]["current_step"] = "done"
        research_jobs[project_id]["results"] = {
            "papers_found": len(retrieval_result["papers"]),
            "papers": retrieval_result["papers"][:20],  # Top 20
            "themes": analysis_result["common_themes"],
            "gaps": analysis_result["gaps"],
            "contradictions": analysis_result["contradictions"],
            "narrative_threads": synthesis_result["narrative_threads"],
            "hypotheses": synthesis_result["hypothesis_suggestions"],
            "framework": synthesis_result["conceptual_framework"],
        }

    except Exception as e:
        research_jobs[project_id]["status"] = "failed"
        research_jobs[project_id]["error"] = str(e)
