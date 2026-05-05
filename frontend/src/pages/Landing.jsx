import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400/30 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg font-bold">
            R
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ResearchAI
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/search" className="text-gray-400 hover:text-white transition-colors text-sm">
            Search
          </Link>
          <Link to="/graph" className="text-gray-400 hover:text-white transition-colors text-sm">
            Graph
          </Link>
          <Link
            to="/new"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Start Research
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-indigo-300 text-sm">Powered by Multi-Agent AI</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] mb-6">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Research Papers.
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Analyzed by AI.
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
              Five specialized AI agents work together to find, analyze, synthesize, 
              and write academic literature reviews. From topic to paper in minutes, not weeks.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/new"
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 flex items-center gap-3"
              >
                Start Research
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/search"
                className="px-8 py-4 rounded-xl text-lg font-medium border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white transition-all"
              >
                Search Papers
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {[
            { value: '200M+', label: 'Papers Accessible', icon: '📄' },
            { value: '5', label: 'AI Agents', icon: '🤖' },
            { value: '<3min', label: 'Full Analysis', icon: '⚡' },
            { value: '7+/10', label: 'Quality Score', icon: '✨' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
              <span className="text-2xl mb-2 block">{stat.icon}</span>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24 border-t border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Multi-Agent Pipeline
            </span>
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            Five specialized agents collaborate to deliver comprehensive research analysis
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { name: 'Retriever', desc: 'Searches Semantic Scholar & arXiv for relevant papers', icon: '🔍', color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30' },
            { name: 'Analyzer', desc: 'Extracts findings, methodology, and limitations', icon: '🔬', color: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/30' },
            { name: 'Synthesizer', desc: 'Connects dots, builds narratives, finds gaps', icon: '🧠', color: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30' },
            { name: 'Writer', desc: 'Generates academic text with proper citations', icon: '✍️', color: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500/30' },
            { name: 'Critic', desc: 'Reviews quality, coherence, and citation accuracy', icon: '⚖️', color: 'from-red-500/20 to-red-600/20', border: 'border-red-500/30' },
          ].map((agent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-gradient-to-b ${agent.color} border ${agent.border} rounded-2xl p-5 text-center`}
            >
              {i < 4 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xl z-10">
                  →
                </div>
              )}
              <span className="text-3xl block mb-3">{agent.icon}</span>
              <h3 className="font-bold text-sm mb-2">{agent.name}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{agent.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24 border-t border-white/[0.06]">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Everything You Need
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Knowledge Graph', desc: 'Visual citation networks showing how papers connect, theme clusters, and bridge papers', icon: '🕸️' },
            { title: 'Gap Analysis', desc: 'AI identifies unexplored research opportunities and generates testable hypotheses', icon: '🔍' },
            { title: 'Auto Writing', desc: 'Generate literature reviews with proper APA citations and iterative quality refinement', icon: '📝' },
            { title: 'Multi-Source', desc: 'Search across Semantic Scholar, arXiv, and more with intelligent query expansion', icon: '📚' },
            { title: 'Export Anywhere', desc: 'Download as Markdown, LaTeX, or BibTeX. Ready for your paper or thesis', icon: '📤' },
            { title: 'Quality Scoring', desc: 'Critic agent rates clarity, flow, depth, synthesis, and citation coverage', icon: '⭐' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
            >
              <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">{feature.icon}</span>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-12"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to accelerate your research?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Enter a topic and let AI do the heavy lifting. Literature review in minutes, not weeks.
          </p>
          <Link
            to="/new"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25"
          >
            🚀 Start Your Research
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center text-sm text-gray-500">
        <p>Built with FastAPI, React, Groq AI, NetworkX</p>
      </footer>
    </div>
  )
}
