from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class MongoDB:
    """Singleton MongoDB client using motor async driver."""

    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db = None

    async def connect(self):
        """Connect to MongoDB."""
        uri = settings.MONGODB_URI
        print(f"[MongoDB] Connecting to: {uri[:30]}...")
        self.client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            tls=True if "mongodb.net" in uri else False,
        )
        self.db = self.client["ai_research_engine"]
        # Create indexes
        await self.db.users.create_index("email", unique=True)
        await self.db.projects.create_index("id", unique=True)
        await self.db.drafts.create_index(
            [("project_id", 1), ("section_type", 1)], unique=True
        )
        await self.db.activities.create_index([("user_email", 1), ("timestamp", -1)])
        await self.db.activities.create_index([("project_id", 1), ("timestamp", -1)])
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

    @property
    def activities(self):
        return self.db["activities"]

# Singleton instance
mongodb = MongoDB()
