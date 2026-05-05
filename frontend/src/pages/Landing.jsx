import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Typewriter effect
function Typewriter({ words, className }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[index]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, text.length + 1))
        if (text === word) setTimeout(() => setDeleting(true), 2000)
      } else {
        setText(word.slice(0, text.length - 1))
        if (text === '') {
          setDeleting(false)
          setIndex((i) => (i + 1) % words.length)
        }
      }
    }, deleting ? 50 : 100)
    return () => clearTimeout(timeout)
  }, [text, deleting, index, words])

  return <span className={className}>{text}<span className="animate-pulse">|</span></span>
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a] overflow-hidden">
      {/* Subtle paper texture overlay */}
      <div className="fixed inset-0 opacity-[0.4] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
      }} />

      {/* Nav - minimal, scholarly */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
            <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
            <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
          </svg>
          <span className="text-lg font-semibold tracking-tight">ResearchAI</span>
        </Link>
        <div className="flex items-center gap-8 text-sm">
          <Link to="/search" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Papers</Link>
          <Link to="/graph" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Graph</Link>
          <Link to="/app" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Dashboard</Link>
          <Link
            to="/new"
            className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#333] transition-colors"
          >
            New Research →
          </Link>
        </div>
      </nav>

      {/* Hero - clean, typographic focus */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-mono text-[#888] mb-6 tracking-wide uppercase">Multi-Agent Research System</p>
          
          <h1 className="text-[3.5rem] leading-[1.1] font-bold tracking-tight mb-6">
            From research topic to
            <br />
            <Typewriter
              words={['literature review', 'knowledge graph', 'gap analysis', 'hypothesis generation']}
              className="text-[#2563eb]"
            />
          </h1>

          <p className="text-lg text-[#666] max-w-xl leading-relaxed mb-10">
            Five AI agents collaborate to search, analyze, synthesize, write, and critique 
            academic papers. What takes weeks now takes minutes.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/new"
              className="bg-[#1a1a1a] text-white px-7 py-3.5 rounded-xl font-medium hover:bg-[#333] transition-all hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5"
            >
              Start Research
            </Link>
            <Link
              to="/app"
              className="text-[#555] hover:text-[#1a1a1a] px-4 py-3.5 font-medium transition-colors flex items-center gap-2"
            >
              View Dashboard
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.5 3.5L11 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* Terminal-style demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-2xl"
        >
          <div className="bg-[#1a1a1a] rounded-2xl p-6 font-mono text-sm shadow-2xl shadow-black/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-[#666] text-xs">research-pipeline</span>
            </div>
            <div className="space-y-2 text-[#ccc]">
              <p><span className="text-[#28c840]">▸</span> Topic: "transformer attention mechanisms in NLP"</p>
              <p><span className="text-[#febc2e]">▸</span> Retriever found <span className="text-white">47</span> papers from Semantic Scholar + arXiv</p>
              <p><span className="text-[#febc2e]">▸</span> Analyzer extracted <span className="text-white">12</span> themes, <span className="text-white">7</span> gaps</p>
              <p><span className="text-[#febc2e]">▸</span> Synthesizer generated <span className="text-white">5</span> hypotheses</p>
              <p><span className="text-[#febc2e]">▸</span> Writer produced <span className="text-white">2,100</span> word literature review</p>
              <p><span className="text-[#28c840]">▸</span> Critic score: <span className="text-[#28c840] font-bold">8.1/10</span> ✓ passed</p>
              <p className="text-[#666] pt-2">completed in 2m 34s</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pipeline - horizontal scroll cards */}
      <section className="relative z-10 py-20 border-t border-[#eee]">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">The Pipeline</p>
          <h2 className="text-3xl font-bold tracking-tight mb-12">Five agents, one goal</h2>

          <div className="grid grid-cols-5 gap-3">
            {[
              { num: '01', name: 'Retriever', desc: 'Searches 200M+ papers across Semantic Scholar and arXiv with AI-generated queries', color: '#2563eb' },
              { num: '02', name: 'Analyzer', desc: 'Extracts key findings, methodology, limitations from each paper in batches', color: '#059669' },
              { num: '03', name: 'Synthesizer', desc: 'Builds narrative threads, identifies contradictions, generates hypotheses', color: '#7c3aed' },
              { num: '04', name: 'Writer', desc: 'Produces academic prose with inline citations and proper APA formatting', color: '#d97706' },
              { num: '05', name: 'Critic', desc: 'Scores clarity, flow, depth, synthesis. Rejects drafts below 7/10', color: '#dc2626' },
            ].map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative bg-white border border-[#e5e5e5] rounded-2xl p-5 hover:border-[#ccc] hover:shadow-lg hover:shadow-black/5 transition-all group"
              >
                <span className="text-xs font-mono text-[#bbb] block mb-4">{agent.num}</span>
                <div className="w-8 h-1 rounded-full mb-4" style={{ backgroundColor: agent.color }} />
                <h3 className="font-bold text-base mb-2">{agent.name}</h3>
                <p className="text-xs text-[#777] leading-relaxed">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Output showcase */}
      <section className="relative z-10 py-20 bg-[#f5f5f4] border-t border-[#eee]">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">Output</p>
          <h2 className="text-3xl font-bold tracking-tight mb-12">What you get</h2>

          <div className="grid grid-cols-3 gap-6">
            {[
              { 
                title: 'Knowledge Graph',
                desc: 'Interactive citation network. See how papers connect, find bridge papers between clusters.',
                visual: '🕸️',
                tag: 'Visual'
              },
              { 
                title: 'Literature Review',
                desc: 'Publication-ready academic writing with proper citations. Iteratively refined until quality passes.',
                visual: '📄',
                tag: 'Writing'
              },
              { 
                title: 'Research Gaps',
                desc: 'AI-identified opportunities no one has explored yet. With suggested methodology to test them.',
                visual: '💡',
                tag: 'Discovery'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#e5e5e5] rounded-2xl p-7 hover:shadow-xl hover:shadow-black/5 transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl">{item.visual}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#999] bg-[#f5f5f4] px-2 py-1 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Export formats */}
      <section className="relative z-10 py-20 border-t border-[#eee]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">Export</p>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Ready for your workflow</h2>
              <p className="text-[#666] max-w-md">Export your research in any format. Drop it straight into your thesis, paper, or Overleaf project.</p>
            </div>
            <div className="flex gap-3">
              {['Markdown', 'LaTeX', 'BibTeX', 'Word'].map((fmt) => (
                <div key={fmt} className="bg-white border border-[#e5e5e5] rounded-xl px-5 py-3 text-sm font-mono text-[#555]">
                  .{fmt.toLowerCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 border-t border-[#eee]">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Stop reading papers manually.
          </h2>
          <p className="text-[#666] text-lg mb-8">
            Let AI agents do the systematic review. You focus on the insights.
          </p>
          <Link
            to="/new"
            className="inline-block bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-[#333] transition-all hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5"
          >
            Start Your Research →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#eee] py-8">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between text-sm text-[#999]">
          <p>ResearchAI — Multi-Agent Academic Research Engine</p>
          <p className="font-mono text-xs">FastAPI + React + Groq + NetworkX</p>
        </div>
      </footer>
    </div>
  )
}
