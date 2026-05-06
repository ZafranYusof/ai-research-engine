from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api import papers, research, auth, knowledge_graph, writing, pdf, recommendations, plagiarism, activity, chat, analytics
from app.core.config import settings
from app.core.rate_limit import limiter
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

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(plagiarism.router, prefix="/api/plagiarism", tags=["plagiarism"])
app.include_router(activity.router, prefix="/api/activity", tags=["activity"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
