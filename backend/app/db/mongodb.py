from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class MongoDB:
    """Singleton MongoDB client using motor async driver."""

    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db = None

    async def connect(self):
        """Connect to MongoDB."""
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)
        self.db = self.client["ai_research_engine"]
        # Create indexes
        await self.db.users.create_index("email", unique=True)
        await self.db.projects.create_index("id", unique=True)
        await self.db.drafts.create_index(
            [("project_id", 1), ("section_type", 1)], unique=True
        )
        print(f"Connected to MongoDB: {settings.MONGODB_URI}")

    async def disconnect(self):
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")

    @property
    def users(self):
        return self.db["users"]

    @property
    def projects(self):
        return self.db["projects"]

    @property
    def drafts(self):
        return self.db["drafts"]

# Singleton instance
mongodb = MongoDB()
