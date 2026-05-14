<div align="center">

# AI Research Engine

**Multi-Agent Literature Review and Academic Writing Assistant**

An automated research platform that retrieves, analyzes, and synthesizes academic papers across multiple scholarly databases, then drafts literature reviews with proper citations through a five-agent pipeline.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)

[Live Demo](https://ai-research-engine-wine.vercel.app) · [API](https://ai-research-engine-8ctr.onrender.com) · [Report Issue](https://github.com/Vexccz/ai-research-engine/issues)

</div>

---

## Overview

Writing a literature review is time-intensive. Researchers spend hours searching across Google Scholar, Semantic Scholar, and PubMed, then manually organizing findings, identifying gaps, and drafting narrative prose with citations.

This platform automates that pipeline. A multi-agent system retrieves relevant papers, extracts structured findings, synthesizes connections across sources, drafts academic text with proper citations, and runs a critic pass for coherence and quality.

## Core Features

### Research

- Multi-source paper search (Google Scholar, Semantic Scholar, PubMed)
- PDF full-text parsing via PyMuPDF
- Citation network analysis with PageRank scoring
- Smart recommendations based on reading history
- Knowledge graph visualization

### Writing

- Auto-generated literature reviews with APA citations
- Citation style switcher: APA, MLA, Chicago, IEEE (preference persisted per user)
- Streaming draft generation with typewriter reveal and live generating indicator
- Export drafts to Microsoft Word (.docx) with formatted Title, Abstract, Body, and References
- Iterative writing with critic feedback loop
- Plagiarism detection against source corpus
- Auto-save drafts and activity timeline

### Collaboration

- Collaborative research projects
- Email verification and password reset flows
- Analytics dashboard per project
- AI chat widget for in-context Q&A

### Productivity

- Keyboard shortcuts and command palette
- Theme customization
- Export-ready prose output

## Agent Pipeline

| Agent         | Responsibility                                                     |
| ------------- | ------------------------------------------------------------------ |
| Retriever     | Finds papers across Semantic Scholar, Google Scholar, and PubMed   |
| Analyzer      | Extracts findings, methodology, and research gaps                  |
| Synthesizer   | Connects themes, builds narratives, generates hypotheses           |
| Writer        | Generates academic prose with APA citations                        |
| Critic        | Reviews coherence, citation accuracy, and overall quality          |

## Tech Stack

| Layer         | Technologies                                                  |
| ------------- | ------------------------------------------------------------- |
| Backend       | Python, FastAPI, MongoDB, PyMuPDF, NetworkX                   |
| Frontend      | React 19, Vite, TailwindCSS, Framer Motion                    |
| AI            | LLM-based agent pipeline with retrieval-augmented generation  |
| Auth          | bcrypt and hashlib hashing, JWT                               |
| Deployment    | Vercel (frontend), Render (backend)                           |

## Project Structure

```
ai-research-engine/
├── backend/                Python FastAPI server
│   ├── app/                Application package
│   ├── data/               Seed data and corpora
│   └── venv/               Python virtual environment
└── frontend/               React SPA (Vite)
    └── src/
        ├── pages/          Dashboard, Search, Project, Writing, Settings
        ├── components/     Graph, ChatWidget, Editor, CommandPalette
        ├── hooks/          Custom React hooks
        ├── styles/         Global styles and themes
        ├── utils/          Helper functions
        └── services/       API client, auth context
```

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- MongoDB (local or Atlas, requires `dnspython` for `mongodb+srv://`)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env       # configure MONGODB_URI, JWT_SECRET, LLM credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API Integrations

- Semantic Scholar (note: subject to 429 rate limits at peak hours)
- Google Scholar (scraped via compliant proxy)
- PubMed E-utilities
- MongoDB Atlas for persistent storage

## Roadmap

- LaTeX export alongside DOCX
- Custom LLM fine-tuning on domain corpora
- Real-time collaborative editing
- Zotero and Mendeley import/export
- Multi-language paper support
- PDF annotations and highlights synced across sessions

## License

Distributed under the MIT License. See `LICENSE` for details.
