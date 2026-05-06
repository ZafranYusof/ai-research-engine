"""Activity tracking service for research timeline."""

from datetime import datetime, timezone, timedelta
from typing import Optional, List
from app.db.mongodb import mongodb


class ActivityService:
    """Tracks user activities for timeline and analytics."""

    async def log_activity(
        self,
        user_email: str,
        action: str,
        details: str,
        project_id: Optional[str] = None,
    ):
        """Log a user activity."""
        doc = {
            "user_email": user_email,
            "action": action,
            "details": details,
            "project_id": project_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await mongodb.activities.insert_one(doc)

    async def get_timeline(
        self, user_email: str, limit: int = 50, offset: int = 0
    ) -> List[dict]:
        """Get user's activity timeline (paginated)."""
        cursor = (
            mongodb.activities.find(
                {"user_email": user_email}, {"_id": 0}
            )
            .sort("timestamp", -1)
            .skip(offset)
            .limit(limit)
        )
        activities = []
        async for doc in cursor:
            activities.append(doc)
        return activities

    async def get_project_timeline(
        self, project_id: str, limit: int = 30
    ) -> List[dict]:
        """Get activities for a specific project."""
        cursor = (
            mongodb.activities.find(
                {"project_id": project_id}, {"_id": 0}
            )
            .sort("timestamp", -1)
            .limit(limit)
        )
        activities = []
        async for doc in cursor:
            activities.append(doc)
        return activities

    async def get_stats_by_day(
        self, user_email: str, days: int = 30
    ) -> List[dict]:
        """Get daily activity counts for chart visualization."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        cutoff_iso = cutoff.isoformat()

        cursor = mongodb.activities.find(
            {"user_email": user_email, "timestamp": {"$gte": cutoff_iso}},
            {"_id": 0, "timestamp": 1},
        ).sort("timestamp", 1)

        # Aggregate by day
        day_counts = {}
        async for doc in cursor:
            ts = doc["timestamp"][:10]  # YYYY-MM-DD
            day_counts[ts] = day_counts.get(ts, 0) + 1

        # Fill in missing days
        result = []
        for i in range(days):
            day = (cutoff + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            result.append({"date": day, "count": day_counts.get(day, 0)})

        return result


activity_service = ActivityService()
