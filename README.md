# 🧠 AI Research Paper Engine

Multi-agent AI system for automated literature review, research synthesis, and academic writing.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  Dashboard │ Search │ Knowledge Graph │ Writing      │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────┴──────────────────────────────┐
│                  Backend (FastAPI)                    │
├─────────────────────────────────────────────────────┤
│  Multi-Agent Pipeline                                │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐           │
│  │Retriever │→│ Analyzer │→│Synthesizer│           │
│  └──────────┘ └──────────┘ └───────────┘           │
│       ↓                          ↓                   │
│  ┌──────────┐              ┌──────────┐             │
│  │  Writer  │←─────────────│  Critic  │             │
│  └──────────┘              └──────────┘             │
├─────────────────────────────────────────────────────┤
│  Services                                            │
│  • Semantic Scholar API    • Vector Store            │
│  • arXiv API               • Knowledge Graph (Neo4j)│
│  • PDF Parser              • Celery Tasks           │
└─────────────────────────────────────────────────────┘
         │              │              │
    PostgreSQL       Neo4j          Redis
```

## Tech Stack

**Backend:** Python, FastAPI, Celery, SQLAlchemy
**Frontend:** React 19, Vite, Tailwind, D3.js, Framer Motion
**AI:** OpenAI GPT-4, Sentence Transformers (embeddings)
**Databases:** PostgreSQL (metadata), Neo4j (knowledge graph), Redis (queue/cache)
**APIs:** Semantic Scholar, arXiv

## Quick Start

### With Docker:
```bash
docker-compose up -d
```

### Manual:
```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your API keys
uvicorn app.main:app --reload --port 8000

# Celery worker
celery -A app.core.celery_app worker --loglevel=info

# Frontend
cd frontend
npm install
npm run dev
```

## Agents

| Agent | Role |
|-------|------|
| **Retriever** | Finds papers from Semantic Scholar + arXiv |
| **Analyzer** | Extracts findings, methodology, gaps |
| **Synthesizer** | Connects dots, builds narratives, generates hypotheses |
| **Writer** | Generates academic text with proper citations |
| **Critic** | Reviews quality, citations, coherence (score 0-10) |

## Features

- 🔍 Multi-source paper search (Semantic Scholar + arXiv)
- 🧠 AI-powered analysis and synthesis
- 🕸️ Knowledge graph visualization (citation networks)
- ✍️ Auto-generate literature review with citations
- 📊 Gap analysis and hypothesis generation
- 🔄 Iterative writing with critic feedback loop
- 📑 APA citation formatting
- 🎯 Theme clustering and bridge paper detection

## Roadmap

- [ ] PDF full-text parsing
- [ ] Google Scholar integration
- [ ] LaTeX/Word export
- [ ] Collaborative projects
- [ ] Custom model fine-tuning
- [ ] Plagiarism detection
- [ ] Citation network analysis (PageRank)
- [ ] Real-time collaboration
