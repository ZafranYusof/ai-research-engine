import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Search, BookOpen, GitBranch, Sparkles, Shield,
  PenTool, Brain, FileText, Quote, Library, Network, ChevronRight, Plus,
  Lightbulb, Check, Database, Users, Clock, Zap
} from 'lucide-react'
import { PageShell, BrandMark, Card, HighlightCard, Pill, btn, input, CitationTag, SectionHeading } from '../components/ui'

// ─── Data ────────────────────────────────────────────────────────────────────

const typingWords = ['literature reviews', 'research synthesis', 'citation networks', 'academic writing']

const agents = [
  { name: 'Retriever', role: 'Searches Semantic Scholar, arXiv, and PubMed', icon: Search },
  { name: 'Analyzer', role: 'Extracts findings, methodology, and gaps', icon: Brain },
  { name: 'Synthesizer', role: 'Connects themes and builds narratives', icon: Network },
  { name: 'Writer', role: 'Drafts prose with APA citations', icon: PenTool },
  { name: 'Critic', role: 'Reviews coherence and citation accuracy', icon: Shield },
]

const features = [
  {
    icon: Search,
    title: 'Multi-source retrieval',
    desc: 'Semantic Scholar, Google Scholar, and PubMed queried in parallel for breadth and depth.',
  },
  {
    icon: FileText,
    title: 'PDF parsing',
    desc: 'Full-text ingestion via PyMuPDF. Section-aware chunking preserves academic structure.',
  },
  {
    icon: GitBranch,
    title: 'Citation graph',
    desc: 'PageRank-scored citation networks visualize influence and surface bridge papers.',
  },
  {
    icon: PenTool,
    title: 'Critic feedback loop',
    desc: 'Iterative drafting with a reviewer agent ensures coherence before you ever read the output.',
  },
  {
    icon: Library,
    title: 'Collaborative projects',
    desc: 'Share workspaces, track revisions, and keep team reading lists in one place.',
  },
  {
    icon: Shield,
    title: 'Plagiarism detection',
    desc: 'Source-attribution checks flag passages that need citation before submission.',
  },
]

const stats = [
  { value: '5', label: 'Specialized agents', sub: 'retriever · analyzer · synthesizer · writer · critic' },
  { value: '3', label: 'Scholarly databases', sub: 'Semantic Scholar · Google Scholar · PubMed' },
  { value: 'APA', label: 'Citation standard', sub: 'MLA and Chicago on roadmap' },
  { value: '< 5min', label: 'Draft turnaround', sub: 'from query to readable review' },
]

const faqData = [
  { q: 'What sources does the engine query?', a: 'The retriever agent queries Semantic Scholar, Google Scholar, and PubMed in parallel. Results are deduplicated and ranked by relevance before analysis.' },
  { q: 'How accurate are the generated reviews?', a: 'Every draft passes through a critic agent that scores coherence and citation accuracy. Drafts below the threshold are automatically revised. You review the final output before any claim is accepted.' },
  { q: 'Does the engine support PDFs?', a: 'Yes. Upload PDFs directly and the parser extracts full text via PyMuPDF. Section-aware chunking preserves the document structure for downstream analysis.' },
  { q: 'Which citation style is used?', a: 'APA 7th edition is the default. MLA, Chicago, and IEEE are on the roadmap.' },
  { q: 'Is my research private?', a: 'Uploaded papers and draft projects stay scoped to your account. Nothing is shared with third parties. You control visibility on collaborative projects.' },
  { q: 'Can I export drafts?', a: 'Markdown export is available today. LaTeX and Word export are on the roadmap.' },
]

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

// ─── Utility Components ─────────────────────────────────────────────────────

function TypeWriter() {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = typingWords[wordIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(word.slice(0, text.length + 1))
        if (text === word) setTimeout(() => setIsDeleting(true), 1800)
      } else {
        setText(word.slice(0, text.length - 1))
        if (text === '') {
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % typingWords.length)
        }
      }
    }, isDeleting ? 40 : 85)
    return () => clearTimeout(timeout)
  }, [text, isDeleting, wordIndex])

  return (
    <span className="inline-flex items-baseline text-[#c89b3c]">
      {text}
      <motion.span
        className="ml-0.5 inline-block w-[3px] h-[0.85em] bg-[#c89b3c] translate-y-[2px]"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
    </span>
  )
}

// Paper/manuscript mockup for hero
function ManuscriptMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Stacked paper effect */}
      <div className="absolute -top-2 -right-2 w-full h-full bg-[#1c2f42] rounded-2xl rotate-2 opacity-40" />
      <div className="absolute top-1 right-1 w-full h-full bg-[#11202f] rounded-2xl rotate-1 opacity-70" />

      {/* Main manuscript */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative bg-gradient-to-br from-[#faf7f2] to-[#f0e9d9] rounded-2xl p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] text-[#2a2014]"
        style={{ fontFamily: 'Fraunces, serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#c89b3c]/30">
          <div className="text-[9px] tracking-[0.35em] uppercase text-[#a37c2a] font-semibold">Literature Review</div>
          <div className="text-[9px] text-[#2a2014]/50">Draft 02</div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold leading-tight mb-3">
          Alternative Credit Scoring in Emerging Markets: A Synthesis
        </h3>

        {/* Author line */}
        <p className="text-[10px] text-[#2a2014]/60 mb-5 italic">
          Auto-generated from 47 sources · Reviewed by Critic agent
        </p>

        {/* Body text simulated */}
        <div className="space-y-2.5 mb-5">
          {[
            { w: '94%', delay: 0 },
            { w: '88%', delay: 0.1 },
            { w: '97%', delay: 0.2 },
            { w: '72%', delay: 0.3 },
            { w: '91%', delay: 0.4 },
            { w: '65%', delay: 0.5 },
          ].map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1 + l.delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 0, width: l.w }}
              className="h-2 rounded-full bg-[#2a2014]/25"
            />
          ))}
        </div>

        {/* Citation tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="flex flex-wrap gap-1.5"
        >
          {['Smith et al., 2023', 'Chen, 2024', 'Rahman & Lee, 2022'].map((c) => (
            <span
              key={c}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#4a7c7e]/15 border border-[#4a7c7e]/40 text-[#4a7c7e] text-[9px] font-mono"
            >
              {c}
            </span>
          ))}
        </motion.div>

        {/* Corner stamp */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: -12 }}
          transition={{ delay: 2, type: 'spring' }}
          className="absolute -bottom-3 -right-3 w-16 h-16 border-2 border-[#c89b3c] rounded-full flex items-center justify-center bg-[#faf7f2] shadow-lg"
        >
          <div className="text-center">
            <div className="text-[7px] font-mono tracking-wider text-[#c89b3c]">CRITIC</div>
            <div className="text-sm font-bold text-[#c89b3c]">8.1</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating callouts */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute -left-6 top-14 hidden md:block"
      >
        <div className="bg-[#11202f] border border-[#c89b3c]/30 rounded-xl px-3 py-2 shadow-lg">
          <div className="text-[9px] tracking-[0.2em] uppercase text-[#c89b3c] font-medium">Agent</div>
          <div className="text-xs text-[#f5efe0] font-medium">Writer · drafting</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute -right-4 bottom-16 hidden md:block"
      >
        <div className="bg-[#11202f] border border-[#4a7c7e]/40 rounded-xl px-3 py-2 shadow-lg">
          <div className="text-[9px] tracking-[0.2em] uppercase text-[#7db9b9] font-medium">Sources</div>
          <div className="text-xs text-[#f5efe0] font-medium">47 papers · 3 databases</div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Sections ───────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all ${scrolled ? 'bg-[#0b1626]/80 backdrop-blur-xl border-b border-[#1c2f42]' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-[#f5efe0] tracking-tight">
          <BrandMark size={28} />
          <div className="leading-none">
            <div className="font-serif text-base font-medium">ResearchAI</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Agents', href: '#agents' },
            { label: 'FAQ', href: '#faq' },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-3 py-2 text-sm text-[#c8bfa8]/70 hover:text-[#f5efe0] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:flex items-center px-4 py-1.5 text-sm font-medium text-[#e8e2d4]/80 hover:text-[#f5efe0] transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium bg-[#faf7f2] text-[#0b1626] rounded-full hover:bg-white transition-colors">
            Start researching
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
        {/* Left */}
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeInUp}>
            <Pill icon={Library} className="mb-6">Academic research, accelerated</Pill>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="font-serif text-5xl sm:text-6xl lg:text-[68px] font-medium tracking-[-0.025em] text-[#f5efe0] leading-[1.05]">
            Write better{' '}
            <TypeWriter />
            <br />
            <span className="italic text-[#c8bfa8]/80">in a fraction of the time.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-6 text-lg text-[#c8bfa8]/70 max-w-xl leading-relaxed">
            A multi-agent research platform that searches, reads, synthesizes, and drafts alongside you. APA citations, critic-reviewed prose, built for the academic voice.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register" className={`${btn.accent}`}>
              Start researching
              <ArrowUpRight size={16} />
            </Link>
            <a href="#agents" className={btn.secondary}>
              See the agents
            </a>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-4 text-xs text-[#c8bfa8]/50">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-[#c89b3c]" />
              <span>APA 7th edition citations</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#c8bfa8]/30" />
            <div className="flex items-center gap-2">
              <Check size={14} className="text-[#c89b3c]" />
              <span>PDF parsing</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — manuscript mockup */}
        <div className="flex items-center justify-center">
          <ManuscriptMockup />
        </div>
      </div>
    </section>
  )
}

function DatabasesBar() {
  const items = ['Semantic Scholar', 'Google Scholar', 'PubMed', 'arXiv', 'CrossRef']
  return (
    <section className="relative py-12 border-y border-[#1c2f42] bg-[#0a1420]/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center text-[10px] tracking-[0.35em] uppercase text-[#c8bfa8]/40 mb-6">
          Integrated with scholarly databases
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {items.map((p) => (
            <div key={p} className="text-[#c8bfa8]/40 hover:text-[#c89b3c] transition-colors text-sm font-medium tracking-wide font-serif italic">
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1c2f42]/60 rounded-2xl overflow-hidden border border-[#1c2f42]"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeInUp}
              className="bg-[#11202f] p-8 hover:bg-[#152738] transition-colors"
            >
              <div className="font-serif text-4xl sm:text-5xl font-medium text-[#f5efe0] tracking-tight tabular-nums">{s.value}</div>
              <div className="mt-3 text-sm text-[#e8e2d4]/80 font-medium">{s.label}</div>
              <div className="mt-1 text-xs text-[#c8bfa8]/50">{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Capabilities"
          title="Tools for the full research cycle"
          desc="From literature search to final draft, every phase of the academic writing process has a purpose-built tool in the engine."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className="group relative bg-[#11202f] border border-[#1c2f42] rounded-2xl p-7 hover:border-[#c89b3c]/30 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-[#c89b3c]/[0.08] border border-[#c89b3c]/20 flex items-center justify-center mb-5 group-hover:bg-[#c89b3c]/15 transition-colors">
                <f.icon size={19} className="text-[#c89b3c]" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#f5efe0] mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-[#c8bfa8]/70 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function Agents() {
  return (
    <section id="agents" className="relative py-28 bg-gradient-to-b from-transparent via-[#c89b3c]/[0.025] to-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Agent pipeline"
          title="Five specialized agents, one coherent workflow"
          desc="Each agent owns a single phase of the pipeline. They hand work off like colleagues in a research lab, with the critic auditing before anything reaches you."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="relative"
        >
          <div className="grid gap-3">
            {agents.map((a, i) => (
              <motion.div
                key={a.name}
                variants={fadeInUp}
                className="flex items-center gap-6 bg-[#11202f] border border-[#1c2f42] rounded-2xl p-6 hover:border-[#c89b3c]/30 transition-colors"
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#c8bfa8]/40 font-mono tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#c89b3c]/10 border border-[#c89b3c]/25 flex items-center justify-center shrink-0">
                    <a.icon size={20} className="text-[#c89b3c]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif text-xl font-medium text-[#f5efe0]">{a.name}</div>
                    <div className="text-sm text-[#c8bfa8]/60">{a.role}</div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#c8bfa8]/30 shrink-0 hidden sm:block" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function WorkflowPreview() {
  const steps = [
    { step: '01', label: 'Query', desc: 'Describe your research topic and the agents begin retrieving sources.' },
    { step: '02', label: 'Review', desc: 'Inspect ranked papers, open PDFs in the parser, mark what matters.' },
    { step: '03', label: 'Draft', desc: 'The writer produces an APA-cited draft. The critic audits before you see it.' },
  ]
  return (
    <section className="relative py-28">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Workflow"
          title="Three phases from question to draft"
          desc="The engine mirrors how research is actually written: start with a question, triage the literature, and produce a defensible synthesis."
        />

        <div className="grid lg:grid-cols-3 gap-5">
          {steps.map((s) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#11202f] border border-[#1c2f42] rounded-2xl p-7 hover:border-[#c89b3c]/30 transition-colors"
            >
              <div className="font-serif text-5xl font-medium tabular-nums bg-gradient-to-b from-[#c89b3c] to-[#c89b3c]/20 bg-clip-text text-transparent mb-5 tracking-tight">
                {s.step}
              </div>
              <h3 className="font-serif text-xl font-medium text-[#f5efe0] mb-2">{s.label}</h3>
              <p className="text-sm text-[#c8bfa8]/65 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState(0)
  return (
    <section id="faq" className="relative py-28">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, annotated"
          desc="Common questions about how the platform works, what sources it uses, and how the academic voice is preserved."
        />

        <div className="divide-y divide-[#1c2f42] border-y border-[#1c2f42]">
          {faqData.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-6 py-5 text-left group"
              >
                <span className="font-serif text-lg font-medium text-[#f5efe0] group-hover:text-[#c89b3c] transition-colors">
                  {f.q}
                </span>
                <motion.div
                  animate={{ rotate: openIdx === i ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full border border-[#1c2f42] flex items-center justify-center text-[#c8bfa8]/60 group-hover:border-[#c89b3c]/40 group-hover:text-[#c89b3c] transition-colors"
                >
                  <Plus size={16} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 pr-16 text-[#c8bfa8]/70 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="relative py-28">
      <div className="max-w-5xl mx-auto px-6">
        <HighlightCard className="p-12 sm:p-16 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#c89b3c]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#4a7c7e]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center">
            <Pill icon={Sparkles} className="mb-6">Research, not rewriting</Pill>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.025em] text-[#f5efe0] leading-[1.05] max-w-3xl mx-auto">
              Your next literature review starts here.
            </h2>
            <p className="mt-5 text-lg text-[#c8bfa8]/70 max-w-2xl mx-auto">
              Spend your time on the thinking. Let the agents handle the searching, reading, and drafting.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className={btn.accent}>
                Create free account
                <ArrowUpRight size={16} />
              </Link>
              <Link to="/login" className={btn.secondary}>
                Sign in
              </Link>
            </div>
          </div>
        </HighlightCard>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative border-t border-[#1c2f42] py-12 bg-[#0a1420]/50">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-[#f5efe0] font-medium tracking-tight">
          <BrandMark size={24} />
          <span className="font-serif">ResearchAI</span>
        </Link>
        <div className="flex items-center gap-6 text-xs text-[#c8bfa8]/50">
          <a href="#features" className="hover:text-[#c89b3c] transition-colors">Features</a>
          <a href="#agents" className="hover:text-[#c89b3c] transition-colors">Agents</a>
          <a href="#faq" className="hover:text-[#c89b3c] transition-colors">FAQ</a>
        </div>
        <div className="text-xs text-[#c8bfa8]/40 italic font-serif">
          © {new Date().getFullYear()} ResearchAI
        </div>
      </div>
    </footer>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <PageShell>
      <Navbar />
      <main>
        <Hero />
        <DatabasesBar />
        <Stats />
        <Features />
        <Agents />
        <WorkflowPreview />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </PageShell>
  )
}
