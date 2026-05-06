"""Activity timeline API endpoints."""

from fastapi import APIRouter, Query
from typing import Optional
from app.services.activity import activity_service

router = APIRouter()


@router.get("/timeline")
async def get_timeline(
    user_email: str = Query(..., description="User email"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Get user's activity timeline (paginated)."""
    activities = await activity_service.get_timeline(user_email, limit, offset)
    return {"activities": activities, "limit": limit, "offset": offset}


@router.get("/timeline/{project_id}")
async def get_project_timeline(project_id: str, limit: int = Query(30, ge=1, le=100)):
    """Get project-specific activity timeline."""
    activities = await activity_service.get_project_timeline(project_id, limit)
    return {"activities": activities, "project_id": project_id}


@router.get("/chart")
async def get_activity_chart(
    user_email: str = Query(..., description="User email"),
    days: int = Query(30, ge=7, le=90),
):
    """Get daily activity data for chart visualization."""
    stats = await activity_service.get_stats_by_day(user_email, days)
    return {"stats": stats, "days": days}
