from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Research Engine"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/research_engine"
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Vector Store
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "research-papers"

    # AI - Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # Embeddings (local)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # External APIs
    SEMANTIC_SCHOLAR_API_KEY: str = ""
    SERPAPI_KEY: str = ""  # Optional: for reliable Google Scholar search

    # Auth
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "https://frontend-kappa-six-83.vercel.app", "https://frontend-f0osbvdt5-vexcczs-projects.vercel.app"]

    class Config:
        env_file = ".env"


settings = Settings()
