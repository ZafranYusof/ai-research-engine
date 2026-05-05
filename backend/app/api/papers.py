from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from app.services.semantic_scholar import SemanticScholarService
from app.services.arxiv_service import ArxivService

router = APIRouter()
scholar = SemanticScholarService()
arxiv_service = ArxivService()


class PaperSearchRequest(BaseModel):
    query: str
    max_results: int = 20
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    sources: List[str] = ["semantic_scholar", "arxiv"]


@router.post("/search")
async def search_papers(request: PaperSearchRequest):
    """Search for papers across multiple sources."""
    all_papers = []

    year_range = None
    if request.year_from and request.year_to:
        year_range = (request.year_from, request.year_to)

    if "semantic_scholar" in request.sources:
        results = await scholar.search(
            query=request.query,
            limit=request.max_results,
            year_range=year_range,
        )
        all_papers.extend(results)

    if "arxiv" in request.sources:
        results = await arxiv_service.search(
            query=request.query,
            max_results=request.max_results,
        )
        all_papers.extend(results)

    return {"papers": all_papers, "total": len(all_papers)}


@router.get("/{paper_id}")
async def get_paper(paper_id: str, source: str = "semantic_scholar"):
    """Get detailed paper information."""
    if source == "semantic_scholar":
        paper = await scholar.get_paper(paper_id)
    elif source == "arxiv":
        paper = await arxiv_service.get_paper(paper_id)
    else:
        raise HTTPException(status_code=400, detail="Invalid source")

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    return paper


@router.get("/{paper_id}/citations")
async def get_citations(paper_id: str, limit: int = 50):
    """Get papers that cite this paper."""
    citations = await scholar.get_citations(paper_id, limit=limit)
    return {"citations": citations, "total": len(citations)}
