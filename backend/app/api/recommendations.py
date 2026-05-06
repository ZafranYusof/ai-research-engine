from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.recommendations import RecommendationService

router = APIRouter()
recommendation_service = RecommendationService()


@router.get("/{project_id}")
async def get_recommendations(project_id: str):
    """Get personalized paper recommendations for a project."""
    try:
        recommendations = await recommendation_service.get_recommendations(project_id)
        return {
            "project_id": project_id,
            "recommendations": recommendations,
            "count": len(recommendations),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@router.get("/trending/papers")
async def get_trending(topic: str = Query(..., description="Research topic to find trending papers for")):
    """Get trending/high-impact papers in a field."""
    try:
        trending = await recommendation_service.get_trending_in_field(topic)
        return {
            "topic": topic,
            "papers": trending,
            "count": len(trending),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending papers: {str(e)}")


@router.post("/{project_id}/refresh")
async def refresh_recommendations(project_id: str):
    """Force refresh recommendations for a project (regenerate)."""
    try:
        recommendations = await recommendation_service.get_recommendations(project_id)
        return {
            "project_id": project_id,
            "recommendations": recommendations,
            "count": len(recommendations),
            "refreshed": True,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh recommendations: {str(e)}")
