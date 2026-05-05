from fastapi import APIRouter
from app.services.knowledge_graph import KnowledgeGraphService

router = APIRouter()
kg = KnowledgeGraphService()


@router.get("/network/{paper_id}")
async def get_paper_network(paper_id: str, depth: int = 2):
    """Get citation network around a paper."""
    network = await kg.get_paper_network(paper_id, depth=depth)
    return network


@router.get("/themes")
async def get_theme_clusters():
    """Get all theme clusters with papers."""
    clusters = await kg.get_theme_clusters()
    return {"clusters": clusters}


@router.get("/bridges")
async def get_bridge_papers():
    """Get papers that bridge multiple themes."""
    bridges = await kg.find_bridge_papers()
    return {"bridge_papers": bridges}


@router.get("/collaborations")
async def get_collaboration_network():
    """Get author collaboration network."""
    network = await kg.get_author_collaboration_network()
    return {"collaborations": network}
