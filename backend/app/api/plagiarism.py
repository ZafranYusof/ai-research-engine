from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.plagiarism import plagiarism_service
from app.db.mongodb import mongodb

router = APIRouter()


class PlagiarismCheckRequest(BaseModel):
    content: str
    project_id: Optional[str] = None


class QuickCheckRequest(BaseModel):
    content: str
    section_type: Optional[str] = "general"


@router.post("/check")
async def check_plagiarism(request: PlagiarismCheckRequest):
    """Full plagiarism check against source papers."""
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    source_papers = []
    if request.project_id:
        # Load source papers from project research results
        db = mongodb.get_database()
        project = await db.research_projects.find_one({"_id": request.project_id})
        if not project:
            # Try with ObjectId
            from bson import ObjectId
            try:
                project = await db.research_projects.find_one({"_id": ObjectId(request.project_id)})
            except Exception:
                pass

        if project:
            # Get papers from project results
            papers_cursor = db.papers.find({"project_id": request.project_id})
            async for paper in papers_cursor:
                source_papers.append({
                    "title": paper.get("title", ""),
                    "abstract": paper.get("abstract", paper.get("summary", "")),
                })

            # Also check research_results collection
            if not source_papers:
                results_cursor = db.research_results.find({"project_id": request.project_id})
                async for result in results_cursor:
                    for paper in result.get("papers", []):
                        source_papers.append({
                            "title": paper.get("title", ""),
                            "abstract": paper.get("abstract", paper.get("summary", "")),
                        })

    result = await plagiarism_service.check_similarity(request.content, source_papers)
    return result


@router.post("/quick-check")
async def quick_check(request: QuickCheckRequest):
    """Quick plagiarism pattern check without source papers."""
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    result = await plagiarism_service.check_section(request.content, request.section_type)
    return result
