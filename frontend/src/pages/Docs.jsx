import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, Code, Zap, GitBranch, FileText, Search, ChevronRight, ExternalLink, Copy, Check, ArrowLeft } from 'lucide-react'

function CodeBlock({ code, language = 'json' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-[#e5e5e5]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#11202f] border-b border-[#e5e5e5]">
        <span className="text-[10px] font-mono text-[#c8bfa8]/50 uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[#c8bfa8]/50 hover:text-[#c8bfa8] transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 bg-[#fafafa] overflow-x-auto text-[13px] leading-relaxed font-mono text-[#333]">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Endpoint({ method, path, description }) {
  const methodColors = {
    GET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    POST: 'bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30',
    PUT: 'bg-amber-50 text-amber-700 border-amber-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${methodColors[method]}`}>
        {method}
      </span>
      <code className="text-sm font-mono text-[#333]">{path}</code>
      {description && <span className="text-xs text-[#c8bfa8]/50 ml-auto">{description}</span>}
    </div>
  )
}

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: Book,
    content: () => (
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Documentation</h1>
        <p className="text-[#666] text-lg leading-relaxed mb-8">
          ResearchAI is a multi-agent system that automates academic literature reviews using five specialized AI agents.
        </p>

        <div className="bg-gradient-to-br from-[#f8f9ff] to-[#f0f4ff] border border-[#e0e7ff] rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-3 text-[#1e40af]">Quick Start</h3>
          <ol className="space-y-2 text-sm text-[#444]">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#c89b3c] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span><strong>Create account</strong> — Register with email and password</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#c89b3c] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span><strong>Start research</strong> — Enter topic, year range, and focus areas</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#c89b3c] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span><strong>Wait for pipeline</strong> — 5 agents process in sequence (~2-3 min)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#c89b3c] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <span><strong>Explore results</strong> — Themes, gaps, hypotheses, knowledge graph</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#c89b3c] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <span><strong>Generate & export</strong> — Literature review in Markdown, LaTeX, or BibTeX</span>
            </li>
          </ol>
        </div>

        <h3 className="font-semibold text-lg mb-3">Architecture Overview</h3>
        <div className="bg-[#11202f] rounded-2xl p-6 font-mono text-xs text-[#c8bfa8]/50 overflow-x-auto">
          <pre>{`┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                │
│   Landing │ Auth │ Dashboard │ Graph │ Writing │ Docs    │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (HTTPS)
┌────────────────────────┴────────────────────────────────┐
│                   Backend (FastAPI)                       │
├──────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌───────────┐             │
│  │Retriever │──│ Analyzer │──│Synthesizer│             │
│  └──────────┘  └──────────┘  └───────────┘             │
│       │                            │                     │
│  ┌──────────┐                ┌──────────┐               │
│  │  Writer  │◄───────────────│  Critic  │               │
│  └──────────┘  (revision)    └──────────┘               │
├──────────────────────────────────────────────────────────┤
│  Semantic Scholar API │ arXiv API │ Groq LLM │ NetworkX  │
└──────────────────────────────────────────────────────────┘`}</pre>
        </div>
      </div>
    )
  },
  {
    id: 'agents',
    title: 'AI Agents',
    icon: GitBranch,
    content: () => (
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">AI Agents</h1>
        <p className="text-[#666] mb-8">Five specialized agents collaborate in a pipeline architecture.</p>

        {[
          {
            num: '01', name: 'Retriever Agent', color: '#2563eb',
            purpose: 'Discovers relevant papers from multiple academic databases.',
            process: [
              'Receives research topic from user',
              'Uses Groq LLM to generate 5 diverse search queries (synonyms, related concepts, different angles)',
              'Queries Semantic Scholar API (200M+ papers, citation data)',
              'Queries arXiv API (preprints, full-text available)',
              'Deduplicates results by DOI and title similarity',
              'Ranks by citation count + recency bonus',
            ],
            output: 'Ranked list of papers with metadata (title, abstract, authors, year, citations, venue)',
            config: { max_papers: '5-200', year_range: 'configurable', timeout: '30s per source' }
          },
          {
            num: '02', name: 'Analyzer Agent', color: '#059669',
            purpose: 'Extracts structured insights from each paper.',
            process: [
              'Processes papers in batches of 5 (optimizes API calls)',
              'Extracts: key findings, methodology, limitations, future work',
              'Identifies common themes across all papers',
              'Detects research gaps from limitations + future work',
              'Finds contradictions between papers\' findings',
            ],
            output: 'Structured analyses, theme clusters, research gaps, contradictions',
            config: { batch_size: 5, max_papers_analyzed: 15, rate_limit_delay: '5s between batches' }
          },
          {
            num: '03', name: 'Synthesizer Agent', color: '#7c3aed',
            purpose: 'Connects findings into coherent narratives and generates hypotheses.',
            process: [
              'Builds narrative threads from identified themes',
              'Maps how the field has evolved over time',
              'Generates novel research hypotheses from gaps',
              'Rates each hypothesis on novelty (1-5) and feasibility (1-5)',
              'Creates conceptual framework (layers, relationships, core concepts)',
            ],
            output: 'Narrative threads, hypotheses with ratings, conceptual framework',
            config: { max_threads: '3-5', max_hypotheses: '3-5' }
          },
          {
            num: '04', name: 'Writer Agent', color: '#d97706',
            purpose: 'Generates publication-ready academic text with proper citations.',
            process: [
              'Builds citation map (AuthorYear format) from paper metadata',
              'Uses narrative threads as structural guide',
              'Generates section with inline citations (APA style)',
              'Synthesizes across sources (not just summarizes)',
              'Targets specified word count and academic tone',
            ],
            output: 'Academic text with inline citations, reference list, word count',
            config: { styles: 'APA (default)', max_words: '500-5000', temperature: 0.4 }
          },
          {
            num: '05', name: 'Critic Agent', color: '#dc2626',
            purpose: 'Quality assurance — reviews and scores generated content.',
            process: [
              'Evaluates 6 dimensions: clarity, flow, depth, synthesis, citations, coherence',
              'Each dimension scored 1-10',
              'Calculates weighted overall score',
              'Identifies specific weaknesses and suggestions',
              'Pass threshold: ≥ 7/10',
              'If fails: Writer revises based on feedback (max 3 iterations)',
            ],
            output: 'Score breakdown, pass/fail, suggestions, strengths',
            config: { threshold: '7/10', max_iterations: 3 }
          },
        ].map((agent) => (
          <div key={agent.num} className="mb-10 last:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono text-[#c8bfa8]/50">{agent.num}</span>
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: agent.color }} />
              <h2 className="text-xl font-bold">{agent.name}</h2>
            </div>

            <div className="ml-10 space-y-4">
              <div>
                <p className="text-sm font-medium text-[#c8bfa8] mb-1">Purpose</p>
                <p className="text-sm text-[#666]">{agent.purpose}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#c8bfa8] mb-2">Process</p>
                <ol className="space-y-1.5">
                  {agent.process.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#666]">
                      <span className="text-[#c8bfa8]/50 font-mono text-xs mt-0.5">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-sm font-medium text-[#c8bfa8] mb-1">Output</p>
                <p className="text-sm text-[#666] bg-[#11202f] px-3 py-2 rounded-lg border border-[#1c2f42] font-mono">{agent.output}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#c8bfa8] mb-2">Configuration</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(agent.config).map(([key, val]) => (
                    <span key={key} className="text-xs bg-[#152738] border border-[#e5e5e5] px-2.5 py-1 rounded-lg font-mono">
                      <span className="text-[#c8bfa8]/50">{key}:</span> <span className="text-[#333]">{val}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    content: () => (
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">API Reference</h1>
        <p className="text-[#666] mb-4">RESTful API. All responses are JSON. Auth via Bearer token.</p>

        <div className="bg-[#11202f] border border-[#e5e5e5] rounded-xl px-4 py-3 mb-8 flex items-center gap-3">
          <span className="text-xs font-mono text-[#c8bfa8]/50">Base URL</span>
          <code className="text-sm font-mono text-[#333] font-medium">https://ai-research-engine-8ctr.onrender.com/api</code>
        </div>

        {/* Auth */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c89b3c]" />
            Authentication
          </h2>

          <div className="space-y-6">
            <div>
              <Endpoint method="POST" path="/auth/register" description="Create account" />
              <CodeBlock language="json" code={`// Request
{
  "name": "Dr. Jane Smith",
  "email": "jane@university.edu",
  "password": "securepass123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "email": "jane@university.edu",
    "name": "Dr. Jane Smith"
  }
}`} />
            </div>

            <div>
              <Endpoint method="POST" path="/auth/login" description="Sign in" />
              <CodeBlock language="json" code={`// Request
{
  "email": "jane@university.edu",
  "password": "securepass123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "email": "...", "name": "..." }
}

// Response 401
{ "detail": "Invalid credentials" }`} />
            </div>
          </div>
        </div>

        {/* Papers */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            Papers
          </h2>

          <div className="space-y-6">
            <div>
              <Endpoint method="POST" path="/papers/search" description="Search academic papers" />
              <CodeBlock language="json" code={`// Request
{
  "query": "transformer attention mechanism",
  "max_results": 20,
  "year_from": 2020,
  "year_to": 2026,
  "sources": ["semantic_scholar", "arxiv"]
}

// Response 200
{
  "papers": [
    {
      "id": "abc123",
      "title": "Attention Is All You Need",
      "abstract": "...",
      "authors": ["Vaswani, A.", "Shazeer, N.", ...],
      "year": 2017,
      "venue": "NeurIPS",
      "citation_count": 95000,
      "doi": "10.48550/arXiv.1706.03762",
      "source": "semantic_scholar"
    }
  ],
  "total": 20
}`} />
            </div>

            <div>
              <Endpoint method="GET" path="/papers/{paper_id}" description="Get paper details" />
              <Endpoint method="GET" path="/papers/{paper_id}/citations" description="Get citing papers" />
            </div>
          </div>
        </div>

        {/* Research */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4a7c7e]" />
            Research Pipeline
          </h2>

          <div className="space-y-6">
            <div>
              <Endpoint method="POST" path="/research/start" description="Start pipeline" />
              <CodeBlock language="json" code={`// Request
{
  "topic": "large language models for code generation",
  "max_papers": 50,
  "year_from": 2022,
  "year_to": 2026,
  "focus_areas": ["code synthesis", "program repair"]
}

// Response 200
{
  "project_id": "d3f1b216-41c3-4a13-9815-c251b8af552f",
  "status": "started"
}`} />
            </div>

            <div>
              <Endpoint method="GET" path="/research/status/{project_id}" description="Check progress" />
              <CodeBlock language="json" code={`// Response 200
{
  "id": "d3f1b216-...",
  "topic": "large language models for code generation",
  "status": "started",       // started | completed | failed
  "progress": 0.6,           // 0.0 - 1.0
  "current_step": "synthesizing",
  "message": "Synthesizing findings..."
}`} />
            </div>

            <div>
              <Endpoint method="GET" path="/research/results/{project_id}" description="Get full results" />
              <p className="text-xs text-[#c8bfa8]/50 ml-4 mt-1">Returns: papers, themes, gaps, contradictions, hypotheses, framework, draft, review</p>
            </div>

            <div>
              <Endpoint method="GET" path="/research/list" description="List all projects" />
            </div>
          </div>
        </div>

        {/* Writing */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d97706]" />
            Writing
          </h2>

          <div className="space-y-6">
            <div>
              <Endpoint method="POST" path="/writing/generate" description="Generate section" />
              <Endpoint method="POST" path="/writing/generate-iterative" description="Generate with auto-revision" />
              <Endpoint method="POST" path="/writing/revise" description="Revise with feedback" />
              <Endpoint method="POST" path="/writing/export" description="Export document" />
              <CodeBlock language="json" code={`// Export Request
{
  "sections": [
    {
      "section_type": "literature_review",
      "content": "...",
      "citations": [...]
    }
  ],
  "title": "My Research Paper",
  "authors": ["Jane Smith"],
  "format": "latex"    // markdown | latex | bibtex
}`} />
            </div>
          </div>
        </div>

        {/* Knowledge Graph */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
            Knowledge Graph
          </h2>

          <div className="space-y-2">
            <Endpoint method="GET" path="/graph/full" description="Entire graph (nodes + edges)" />
            <Endpoint method="GET" path="/graph/network/{paper_id}?depth=2" description="Subgraph around paper" />
            <Endpoint method="GET" path="/graph/themes" description="Theme clusters" />
            <Endpoint method="GET" path="/graph/bridges" description="Bridge papers" />
            <Endpoint method="GET" path="/graph/collaborations" description="Co-authorship network" />
            <Endpoint method="GET" path="/graph/stats" description="Graph statistics" />
            <Endpoint method="POST" path="/graph/papers" description="Add papers to graph" />
            <Endpoint method="POST" path="/graph/themes" description="Add themes" />
            <Endpoint method="DELETE" path="/graph/clear" description="Clear graph" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: Zap,
    content: () => (
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Deployment</h1>
        <p className="text-[#666] mb-8">Production deployment on Render (backend) + Vercel (frontend).</p>

        <h2 className="text-xl font-bold mb-4">Current Production</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#11202f] border border-[#e5e5e5] rounded-xl p-5">
            <p className="text-xs font-mono text-[#c8bfa8]/50 uppercase tracking-wider mb-2">Frontend</p>
            <p className="font-medium text-sm mb-1">Vercel</p>
            <code className="text-xs text-[#c89b3c] break-all">frontend-kappa-six-83.vercel.app</code>
          </div>
          <div className="bg-[#11202f] border border-[#e5e5e5] rounded-xl p-5">
            <p className="text-xs font-mono text-[#c8bfa8]/50 uppercase tracking-wider mb-2">Backend</p>
            <p className="font-medium text-sm mb-1">Render</p>
            <code className="text-xs text-[#c89b3c] break-all">ai-research-engine-8ctr.onrender.com</code>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Local Development</h2>
        <CodeBlock language="bash" code={`# Clone
git clone https://github.com/Vexccz/ai-research-engine.git
cd ai-research-engine

# Backend
cd backend
python -m venv venv
.\\venv\\Scripts\\activate        # Windows
source venv/bin/activate        # Mac/Linux
pip install -r requirements.txt
cp .env.example .env            # Add your Groq API key
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev`} />

        <h2 className="text-xl font-bold mb-4 mt-8">Environment Variables</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-[#e5e5e5] rounded-xl overflow-hidden">
            <thead className="bg-[#11202f]">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-[#c8bfa8] border-b border-[#e5e5e5]">Variable</th>
                <th className="text-left px-4 py-2.5 font-medium text-[#c8bfa8] border-b border-[#e5e5e5]">Required</th>
                <th className="text-left px-4 py-2.5 font-medium text-[#c8bfa8] border-b border-[#e5e5e5]">Description</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {[
                ['GROQ_API_KEY', 'Yes', 'Groq API key (free at console.groq.com)'],
                ['GROQ_MODEL', 'No', 'Default: llama-3.3-70b-versatile'],
                ['GROQ_BASE_URL', 'No', 'Default: https://api.groq.com/openai/v1'],
                ['JWT_SECRET', 'Yes', 'Random string for token signing'],
                ['CORS_ORIGINS', 'No', 'JSON array of allowed origins'],
                ['VITE_API_URL', 'Yes*', 'Backend URL (frontend build-time)'],
              ].map(([name, req, desc]) => (
                <tr key={name} className="border-b border-[#f0f0f0] last:border-0">
                  <td className="px-4 py-2.5 text-[#333]">{name}</td>
                  <td className="px-4 py-2.5"><span className={req === 'Yes' ? 'text-red-500' : 'text-[#c8bfa8]/50'}>{req}</span></td>
                  <td className="px-4 py-2.5 text-[#666] font-sans">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-4 mt-8">Docker</h2>
        <CodeBlock language="bash" code={`docker-compose up -d

# Services: backend (8000), frontend (5173), postgres, neo4j, redis`} />
      </div>
    )
  },
  {
    id: 'tech-stack',
    title: 'Tech Stack',
    icon: FileText,
    content: () => (
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Tech Stack</h1>
        <p className="text-[#666] mb-8">Built with modern, production-ready technologies.</p>

        <div className="grid grid-cols-2 gap-6">
          {[
            {
              title: 'Backend',
              items: [
                { name: 'FastAPI', desc: 'High-performance Python web framework' },
                { name: 'Groq', desc: 'LLM inference (Llama 3.3 70B, OpenAI-compatible)' },
                { name: 'NetworkX', desc: 'Knowledge graph (local, persists to JSON)' },
                { name: 'Uvicorn', desc: 'ASGI server' },
                { name: 'JWT', desc: 'Authentication (python-jose + bcrypt)' },
              ]
            },
            {
              title: 'Frontend',
              items: [
                { name: 'React 19', desc: 'UI framework' },
                { name: 'Vite 5', desc: 'Build tool' },
                { name: 'Tailwind CSS', desc: 'Utility-first styling' },
                { name: 'Framer Motion', desc: 'Animations' },
                { name: 'react-force-graph-2d', desc: 'Graph visualization (D3-based)' },
              ]
            },
            {
              title: 'External APIs',
              items: [
                { name: 'Semantic Scholar', desc: '200M+ papers, citation data, free tier' },
                { name: 'arXiv', desc: 'Preprints, full-text, unlimited' },
                { name: 'Groq Cloud', desc: '30 req/min, 14.4k req/day free' },
              ]
            },
            {
              title: 'Infrastructure',
              items: [
                { name: 'Vercel', desc: 'Frontend hosting (CDN, auto-deploy)' },
                { name: 'Render', desc: 'Backend hosting (auto-deploy from GitHub)' },
                { name: 'GitHub', desc: 'Source control' },
              ]
            },
          ].map((group) => (
            <div key={group.title} className="bg-[#11202f] border border-[#e5e5e5] rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4 text-[#333]">{group.title}</h3>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c89b3c] mt-1.5 shrink-0" />
                    <div>
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-[#c8bfa8]/50 ml-2">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: Search,
    content: () => {
      const [open, setOpen] = useState(null)
      const faqs = [
        { q: 'How much does it cost?', a: 'Free for personal use. Groq free tier (30 req/min, 14,400 req/day). Semantic Scholar and arXiv APIs are also free. Total infrastructure cost: $0.' },
        { q: 'How accurate are the citations?', a: 'Citations are sourced from real papers via Semantic Scholar and arXiv. The Writer uses actual metadata (author, year, title). However, AI can occasionally misplace citations — always verify before submission.' },
        { q: 'Can I use generated text in my paper?', a: 'Yes, but treat it as a first draft. Review, edit, and verify before submission. It saves ~80% of literature review work but isn\'t a final product.' },
        { q: 'What LLM models are supported?', a: 'Currently Groq (Llama 3.3 70B). The system is OpenAI-compatible — swap to GPT-4, Claude, or any provider by changing GROQ_BASE_URL and GROQ_API_KEY.' },
        { q: 'How long does a full pipeline take?', a: '2-4 minutes depending on: number of papers, Groq rate limits (12k TPM free), Semantic Scholar response time, and revision iterations needed.' },
        { q: 'Can I upload my own PDFs?', a: 'Not yet. Planned for a future release: PDF upload → GROBID parsing → knowledge graph integration. Currently papers are discovered automatically.' },
        { q: 'Is there a paper limit?', a: 'Configurable: 5-200 papers per project. More papers = longer processing time and more API calls. Recommended: 20-50 for best results within free tier limits.' },
        { q: 'How does the knowledge graph persist?', a: 'Currently stored as JSON on disk (NetworkX). In production with Docker, Neo4j is available for larger graphs. The graph accumulates across all your research projects.' },
      ]

      return (
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">FAQ</h1>
          <p className="text-[#666] mb-8">Frequently asked questions about ResearchAI.</p>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#e5e5e5] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#11202f] transition-colors"
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  <ChevronRight size={16} className={`text-[#c8bfa8]/50 transition-transform ${open === i ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-[#666] leading-relaxed border-t border-[#f0f0f0] pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )
    }
  },
]

export default function Docs() {
  const [activeSection, setActiveSection] = useState('introduction')
  const currentSection = sections.find(s => s.id === activeSection)

  return (
    <div className="min-h-screen bg-[#0b1626]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b1626]/80 border-b border-[#1c2f42]/50">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
                <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
                <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
              </svg>
              <span className="text-base font-semibold tracking-tight">ResearchAI</span>
            </Link>
            <span className="text-[#c8bfa8]/40">/</span>
            <span className="text-sm text-[#c8bfa8]/60">Documentation</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-[#c8bfa8] hover:text-[#f5efe0] transition-colors">Home</Link>
            <Link to="/app" className="text-[#c8bfa8] hover:text-[#f5efe0] transition-colors">Dashboard</Link>
            <a
              href="https://github.com/Vexccz/ai-research-engine"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 text-[#c8bfa8] hover:text-[#f5efe0] transition-colors"
            >
              GitHub <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto py-6 pl-8 pr-4">
          <p className="text-[10px] font-mono text-[#c8bfa8]/50 uppercase tracking-wider mb-3 px-3">Navigation</p>
          <nav className="space-y-0.5">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    activeSection === section.id
                      ? 'bg-[#152738] text-[#f5efe0] font-medium'
                      : 'text-[#c8bfa8]/60 hover:text-[#c8bfa8] hover:bg-[#11202f]'
                  }`}
                >
                  <Icon size={14} />
                  {section.title}
                </button>
              )
            })}
          </nav>

          <div className="mt-8 px-3">
            <div className="bg-[#11202f] border border-[#1c2f42] rounded-lg p-3">
              <p className="text-[10px] text-[#c8bfa8]/50 font-mono">Version</p>
              <p className="text-xs font-medium">v0.1.0</p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 py-8 px-12 max-w-4xl border-l border-[#1c2f42] min-h-[calc(100vh-57px)]">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentSection.content()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
