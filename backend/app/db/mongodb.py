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


# Singleton instance
mongodb = MongoDB()
