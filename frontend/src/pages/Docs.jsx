import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Book, Code, Zap, GitBranch, FileText, Search, ChevronRight, ExternalLink } from 'lucide-react'

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: [
      {
        title: 'Quick Start',
        body: `ResearchAI is a multi-agent system that automates academic literature reviews. Here's how to get started:

1. **Create an account** — Sign up with your email
2. **Start a research project** — Enter your topic and parameters
3. **Wait for the pipeline** — 5 AI agents work in sequence (~2-3 min)
4. **Explore results** — Themes, gaps, hypotheses, knowledge graph
5. **Generate writing** — Auto-produce cited literature reviews
6. **Export** — Download as Markdown, LaTeX, or BibTeX`
      },
      {
        title: 'System Requirements',
        body: `- Modern browser (Chrome, Firefox, Safari, Edge)
- Internet connection (API calls to Groq + Semantic Scholar)
- No installation needed for the web app`
      }
    ]
  },
  {
    id: 'pipeline',
    title: 'Pipeline Architecture',
    icon: GitBranch,
    content: [
      {
        title: 'Overview',
        body: `The research pipeline consists of 5 specialized AI agents that execute in sequence:

\`\`\`
Topic → Retriever → Analyzer → Synthesizer → Writer → Critic → Output
                                                         ↑         |
                                                         └─────────┘
                                                        (revision loop)
\`\`\`

Each agent has a specific role and passes structured data to the next.`
      },
      {
        title: 'Agent 1: Retriever',
        body: `**Purpose:** Find relevant papers from multiple academic databases.

**Process:**
1. Takes your research topic
2. Uses Groq LLM to generate 5 diverse search queries (synonyms, related concepts)
3. Searches Semantic Scholar API (200M+ papers)
4. Searches arXiv API (preprints)
5. Deduplicates results (DOI/title matching)
6. Ranks by citation count + recency

**Output:** List of papers with title, abstract, authors, year, citations

**Rate Limits:** Semantic Scholar allows 100 req/5min. The system handles this with automatic retry + backoff.`
      },
      {
        title: 'Agent 2: Analyzer',
        body: `**Purpose:** Extract structured insights from each paper.

**Process:**
1. Processes papers in batches of 5 (saves API calls)
2. For each batch, extracts:
   - Key findings (bullet points)
   - Methodology used
   - Limitations acknowledged
   - Future work suggested
3. Cross-paper analysis:
   - Common themes identification
   - Research gap detection
   - Contradiction finding

**Output:** Structured analyses, themes, gaps, contradictions`
      },
      {
        title: 'Agent 3: Synthesizer',
        body: `**Purpose:** Connect findings across papers into coherent narratives.

**Process:**
1. Builds narrative threads from themes (how the field evolved)
2. Generates research hypotheses from identified gaps
3. Creates conceptual framework (layers, relationships, core concepts)

**Output:** Narrative threads, hypotheses (with novelty/feasibility scores), framework`
      },
      {
        title: 'Agent 4: Writer',
        body: `**Purpose:** Generate publication-ready academic text.

**Process:**
1. Builds citation map from papers (AuthorYear format)
2. Uses narrative threads as structural guide
3. Generates section with inline citations
4. Targets specified word count and style (APA default)

**Output:** Academic text with citations, word count, reference list`
      },
      {
        title: 'Agent 5: Critic',
        body: `**Purpose:** Quality assurance — reviews and scores generated content.

**Dimensions scored (1-10):**
- Clarity — Is it well-written?
- Flow — Logical progression?
- Depth — Sufficient analysis?
- Synthesis — Connects sources vs just lists them?
- Citations — Claims properly supported?
- Coherence — Argument holds together?

**Threshold:** Score must be ≥ 7/10 to pass. If it fails, Writer revises based on Critic's suggestions (up to 3 iterations).`
      }
    ]
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Code,
    content: [
      {
        title: 'Base URL',
        body: `\`\`\`
Production: https://your-domain.com/api
Local: http://localhost:8000/api
\`\`\`

All endpoints return JSON. Authentication via Bearer token in Authorization header.`
      },
      {
        title: 'Authentication',
        body: `**POST /api/auth/register**
\`\`\`json
{
  "name": "Dr. Jane Smith",
  "email": "jane@university.edu",
  "password": "securepass123"
}
\`\`\`
Returns: \`{ "token": "jwt...", "user": { "email", "name" } }\`

**POST /api/auth/login**
\`\`\`json
{
  "email": "jane@university.edu",
  "password": "securepass123"
}
\`\`\`
Returns: \`{ "token": "jwt...", "user": { "email", "name" } }\``
      },
      {
        title: 'Papers',
        body: `**POST /api/papers/search**
\`\`\`json
{
  "query": "transformer attention mechanism",
  "max_results": 20,
  "year_from": 2020,
  "year_to": 2026,
  "sources": ["semantic_scholar", "arxiv"]
}
\`\`\`
Returns: \`{ "papers": [...], "total": 20 }\`

**GET /api/papers/{paper_id}?source=semantic_scholar**
Returns: Full paper details

**GET /api/papers/{paper_id}/citations?limit=50**
Returns: \`{ "citations": [...], "total": 50 }\``
      },
      {
        title: 'Research Pipeline',
        body: `**POST /api/research/start**
\`\`\`json
{
  "topic": "large language models for code generation",
  "max_papers": 50,
  "year_from": 2022,
  "year_to": 2026,
  "focus_areas": ["code synthesis", "program repair"]
}
\`\`\`
Returns: \`{ "project_id": "uuid", "status": "started" }\`

**GET /api/research/status/{project_id}**
Returns: \`{ "id", "topic", "status", "progress", "current_step", "message" }\`

**GET /api/research/results/{project_id}**
Returns: Full results (papers, themes, gaps, hypotheses, draft, review, framework)

**GET /api/research/list**
Returns: \`{ "projects": [...] }\``
      },
      {
        title: 'Writing',
        body: `**POST /api/writing/generate**
\`\`\`json
{
  "section_type": "literature_review",
  "narrative_threads": [...],
  "papers": [...],
  "style": "APA",
  "max_words": 2000
}
\`\`\`

**POST /api/writing/generate-iterative**
Same params, but auto-revises until Critic passes (max 3 iterations).

**POST /api/writing/revise**
\`\`\`json
{
  "content": "existing text...",
  "feedback": "make it more concise",
  "section_type": "literature_review"
}
\`\`\`

**POST /api/writing/export**
\`\`\`json
{
  "sections": [{"section_type": "...", "content": "...", "citations": [...]}],
  "title": "My Paper",
  "authors": ["Jane Smith"],
  "format": "latex"  // or "markdown", "bibtex"
}
\`\`\``
      },
      {
        title: 'Knowledge Graph',
        body: `**GET /api/graph/full**
Returns: \`{ "graph": { "nodes": [...], "links": [...] }, "stats": {...} }\`

**GET /api/graph/network/{paper_id}?depth=2**
Returns: Subgraph around a paper

**GET /api/graph/themes**
Returns: \`{ "clusters": [{ "theme", "description", "papers", "paper_count" }] }\`

**GET /api/graph/bridges**
Returns: Papers connecting multiple theme clusters

**GET /api/graph/collaborations**
Returns: Co-authorship network

**GET /api/graph/stats**
Returns: \`{ "total_nodes", "total_edges", "node_types", "density" }\``
      }
    ]
  },
  {
    id: 'tech-stack',
    title: 'Tech Stack',
    icon: FileText,
    content: [
      {
        title: 'Backend',
        body: `- **Framework:** FastAPI (Python)
- **AI:** Groq API (Llama 3.3 70B) — OpenAI-compatible
- **Paper APIs:** Semantic Scholar, arXiv
- **Graph:** NetworkX (local, persists to JSON)
- **Auth:** JWT (python-jose + bcrypt)
- **Task Queue:** Background tasks (FastAPI built-in)
- **Server:** Uvicorn`
      },
      {
        title: 'Frontend',
        body: `- **Framework:** React 19
- **Build:** Vite 5
- **Styling:** Tailwind CSS 3
- **Animation:** Framer Motion
- **Graph Viz:** react-force-graph-2d (D3-based)
- **Markdown:** react-markdown
- **HTTP:** Axios
- **Routing:** React Router 7`
      },
      {
        title: 'Infrastructure',
        body: `- **Local Dev:** Uvicorn + Vite dev server
- **Production:** Render (backend) + Vercel (frontend)
- **Tunneling:** Cloudflare Tunnel (dev access)
- **Database:** In-memory (dev) / PostgreSQL (prod)
- **Graph Storage:** JSON file (dev) / Neo4j (prod)
- **Docker:** docker-compose.yml included`
      }
    ]
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: Search,
    content: [
      {
        title: 'How much does it cost?',
        body: `Free for personal use. The system uses Groq's free tier (30 req/min, 14,400 req/day). Paper search APIs (Semantic Scholar, arXiv) are also free.`
      },
      {
        title: 'How accurate are the citations?',
        body: `Citations are sourced from real papers found via Semantic Scholar and arXiv. The Writer agent uses actual paper metadata (author, year, title) for inline citations. However, AI can occasionally hallucinate citation placement — always verify critical citations.`
      },
      {
        title: 'Can I use the generated text in my paper?',
        body: `The generated text is a starting point. It should be reviewed, edited, and verified before submission. Think of it as a first draft that saves you 80% of the work, not a final product.`
      },
      {
        title: 'What models are supported?',
        body: `Currently uses Groq (Llama 3.3 70B). The system is OpenAI-compatible, so you can swap to GPT-4, Claude, or any provider by changing the base URL and API key in \`.env\`.`
      },
      {
        title: 'How long does a full pipeline take?',
        body: `Typically 2-4 minutes depending on:
- Number of papers requested (more = longer)
- Groq rate limits (12k TPM on free tier)
- Semantic Scholar response time
- Number of revision iterations needed`
      },
      {
        title: 'Can I add my own papers/PDFs?',
        body: `Not yet in the current version. Planned for Phase 6: PDF upload → GROBID parsing → add to knowledge graph. For now, the system discovers papers automatically from Semantic Scholar and arXiv.`
      }
    ]
  }
]

export default function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const currentSection = sections.find(s => s.id === activeSection)

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#fafaf9]/80 border-b border-[#eee]/50">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
              <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
              <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
            </svg>
            <span className="text-base font-semibold tracking-tight">ResearchAI</span>
            <span className="text-[#999] text-sm ml-2">/ docs</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Home</Link>
            <Link to="/app" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Dashboard</Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1 text-[#555] hover:text-[#1a1a1a] transition-colors"
            >
              GitHub <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto py-8 px-4 border-r border-[#eee]">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    activeSection === section.id
                      ? 'bg-[#f0f0f0] text-[#1a1a1a] font-medium'
                      : 'text-[#888] hover:text-[#555] hover:bg-[#f8f8f8]'
                  }`}
                >
                  <Icon size={15} />
                  {section.title}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 py-8 px-12 max-w-4xl">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              {(() => { const Icon = currentSection.icon; return <Icon size={20} className="text-[#2563eb]" /> })()}
              <h1 className="text-2xl font-bold tracking-tight">{currentSection.title}</h1>
            </div>

            <div className="space-y-10">
              {currentSection.content.map((item, i) => (
                <article key={i} className="group">
                  <h2 className="text-lg font-semibold mb-3 text-[#1a1a1a]">{item.title}</h2>
                  <div className="prose prose-sm max-w-none text-[#555] leading-relaxed">
                    {item.body.split('\n').map((line, j) => {
                      // Code blocks
                      if (line.startsWith('```')) return null
                      if (line.startsWith('- **')) {
                        const [bold, rest] = line.slice(2).split('**').filter(Boolean)
                        return <p key={j} className="ml-4 my-1"><strong className="text-[#1a1a1a]">{bold}</strong>{rest}</p>
                      }
                      if (line.startsWith('- ')) return <p key={j} className="ml-4 my-1">• {line.slice(2)}</p>
                      if (line.match(/^\d+\./)) return <p key={j} className="ml-4 my-1">{line}</p>
                      if (line.startsWith('`') && line.endsWith('`')) return <code key={j} className="bg-[#f0f0f0] px-2 py-0.5 rounded text-xs font-mono text-[#333]">{line.slice(1, -1)}</code>
                      if (line.trim() === '') return <br key={j} />
                      return <p key={j} className="my-1">{line}</p>
                    })}
                  </div>
                </article>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
