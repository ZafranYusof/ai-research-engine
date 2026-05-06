from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import papers, research, auth, knowledge_graph, writing, pdf
from app.core.config import settings
from app.db.mongodb import mongodb


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await mongodb.connect()
    yield
    # Shutdown
    await mongodb.disconnect()

app = FastAPI(
    title="AI Research Paper Engine",
    description="Multi-agent system for automated literature review and research synthesis",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(papers.router, prefix="/api/papers", tags=["papers"])
app.include_router(research.router, prefix="/api/research", tags=["research"])
app.include_router(knowledge_graph.router, prefix="/api/graph", tags=["knowledge-graph"])
app.include_router(writing.router, prefix="/api/writing", tags=["writing"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
