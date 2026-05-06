from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.knowledge_graph import get_kg_service
from app.services.cache import get_stats_cache, set_stats_cache

router = APIRouter()


class AddPapersRequest(BaseModel):
    papers: List[dict]


class AddThemesRequest(BaseModel):
    themes: List[dict]
    papers: List[dict] = []


class AddCitationRequest(BaseModel):
    citing_id: str
    cited_id: str


@router.get("/full")
async def get_full_graph():
    """Get the entire knowledge graph for visualization."""
    kg = get_kg_service()
    graph = kg.get_full_graph()
    stats = kg.get_stats()
    return {"graph": graph, "stats": stats}


@router.get("/network/{paper_id}")
async def get_paper_network(paper_id: str, depth: int = 2):
    """Get citation network around a paper."""
    kg = get_kg_service()
    network = kg.get_paper_network(paper_id, depth=depth)
    return network


@router.get("/themes")
async def get_theme_clusters():
    """Get all theme clusters with papers."""
    kg = get_kg_service()
    clusters = kg.get_theme_clusters()
    return {"clusters": clusters}


@router.get("/bridges")
async def get_bridge_papers():
    """Get papers that bridge multiple themes."""
    kg = get_kg_service()
    bridges = kg.find_bridge_papers()
    return {"bridge_papers": bridges}


@router.get("/collaborations")
async def get_collaboration_network():
    """Get author collaboration network."""
    kg = get_kg_service()
    network = kg.get_author_collaboration_network()
    return network


@router.get("/stats")
async def get_graph_stats():
    """Get graph statistics."""
    cached = get_stats_cache()
    if cached is not None:
        return cached
    kg = get_kg_service()
    stats = kg.get_stats()
    set_stats_cache(stats)
    return stats


@router.post("/papers")
async def add_papers_to_graph(request: AddPapersRequest):
    """Add papers to the knowledge graph."""
    kg = get_kg_service()
    kg.add_papers_batch(request.papers)
    return {"added": len(request.papers), "stats": kg.get_stats()}


@router.post("/themes")
async def add_themes_to_graph(request: AddThemesRequest):
    """Add themes and connect to papers."""
    kg = get_kg_service()
    kg.add_themes_batch(request.themes, request.papers)
    return {"added": len(request.themes), "stats": kg.get_stats()}


@router.post("/citation")
async def add_citation(request: AddCitationRequest):
    """Add a citation relationship."""
    kg = get_kg_service()
    kg.add_citation(request.citing_id, request.cited_id)
    return {"status": "added"}


@router.delete("/clear")
async def clear_graph():
    """Clear the entire graph."""
    kg = get_kg_service()
    kg.clear()
    return {"status": "cleared"}
