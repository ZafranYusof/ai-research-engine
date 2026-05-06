import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

// Typewriter with cursor blink
function Typewriter({ words }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[index]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, text.length + 1))
        if (text === word) setTimeout(() => setDeleting(true), 2500)
      } else {
        setText(word.slice(0, text.length - 1))
        if (text === '') {
          setDeleting(false)
          setIndex((i) => (i + 1) % words.length)
        }
      }
    }, deleting ? 40 : 80)
    return () => clearTimeout(timeout)
  }, [text, deleting, index, words])

  return (
    <span className="text-[#2563eb]">
      {text}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="inline-block w-[3px] h-[0.9em] bg-[#2563eb] ml-1 align-middle"
      />
    </span>
  )
}

// Animated counter
function Counter({ target, duration = 2, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true)
        let start = 0
        const step = target / (duration * 60)
        const timer = setInterval(() => {
          start += step
          if (start >= target) {
            setCount(target)
            clearInterval(timer)
          } else {
            setCount(Math.floor(start))
          }
        }, 1000 / 60)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, started])

  return <span ref={ref}>{count}{suffix}</span>
}

// Live pipeline simulation
function PipelineDemo() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)

  const steps = [
    { agent: 'Retriever', action: 'Searching Semantic Scholar + arXiv...', result: '47 papers found', color: '#2563eb', duration: 1200 },
    { agent: 'Retriever', action: 'Deduplicating & ranking by relevance...', result: '32 unique papers', color: '#2563eb', duration: 800 },
    { agent: 'Analyzer', action: 'Extracting findings from batch 1/4...', result: '8 papers analyzed', color: '#059669', duration: 1000 },
    { agent: 'Analyzer', action: 'Identifying themes & contradictions...', result: '12 themes, 3 contradictions', color: '#059669', duration: 900 },
    { agent: 'Analyzer', action: 'Finding research gaps...', result: '7 gaps identified', color: '#059669', duration: 700 },
    { agent: 'Synthesizer', action: 'Building narrative threads...', result: '4 threads constructed', color: '#7c3aed', duration: 1100 },
    { agent: 'Synthesizer', action: 'Generating hypotheses from gaps...', result: '5 novel hypotheses', color: '#7c3aed', duration: 900 },
    { agent: 'Writer', action: 'Drafting literature review...', result: '2,100 words generated', color: '#d97706', duration: 1500 },
    { agent: 'Critic', action: 'Reviewing quality & citations...', result: 'Score: 6.8/10 — revising', color: '#dc2626', duration: 800 },
    { agent: 'Writer', action: 'Revising based on feedback...', result: 'v2: 2,340 words', color: '#d97706', duration: 1200 },
    { agent: 'Critic', action: 'Re-reviewing revised draft...', result: 'Score: 8.1/10 ✓ PASSED', color: '#059669', duration: 600 },
  ]

  const startPipeline = () => {
    setRunning(true)
    setStep(0)
  }

  useEffect(() => {
    if (!running) return
    if (step >= steps.length) {
      setTimeout(() => setRunning(false), 2000)
      return
    }
    const timer = setTimeout(() => setStep(s => s + 1), steps[step].duration)
    return () => clearTimeout(timer)
  }, [step, running])

  return (
    <div className="bg-[#111] rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] border-b border-[#333]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[#666] text-xs font-mono">research-pipeline — live</span>
        {!running && step === 0 && (
          <button
            onClick={startPipeline}
            className="ml-auto text-xs bg-[#28c840] text-black px-3 py-1 rounded-full font-mono font-bold hover:bg-[#32d84a] transition-colors"
          >
            ▶ RUN
          </button>
        )}
        {running && (
          <span className="ml-auto text-xs text-[#febc2e] font-mono animate-pulse">● running</span>
        )}
        {!running && step > 0 && (
          <button
            onClick={startPipeline}
            className="ml-auto text-xs text-[#888] font-mono hover:text-white transition-colors"
          >
            ↻ replay
          </button>
        )}
      </div>

      {/* Terminal body */}
      <div className="p-5 font-mono text-xs h-[320px] overflow-hidden relative">
        {!running && step === 0 && (
          <div className="text-[#666] flex items-center justify-center h-full">
            <p>Click RUN to see the pipeline in action</p>
          </div>
        )}

        <div className="space-y-1.5">
          <AnimatePresence>
            {steps.slice(0, step).map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2"
              >
                <span className="text-[#555] w-[52px] shrink-0">{String(i + 1).padStart(2, '0')}.</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0" style={{ backgroundColor: s.color + '22', color: s.color }}>
                  {s.agent}
                </span>
                <span className="text-[#888]">{s.action}</span>
                <span className="text-[#ccc] ml-auto shrink-0">{s.result}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Current step loading */}
          {running && step < steps.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-[#febc2e]"
            >
              <span className="w-[52px] shrink-0">{String(step + 1).padStart(2, '0')}.</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: steps[step].color + '22', color: steps[step].color }}>
                {steps[step].agent}
              </span>
              <span>{steps[step].action}</span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ml-auto"
              >
                ⏳
              </motion.span>
            </motion.div>
          )}

          {/* Completion */}
          {!running && step >= steps.length && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-3 border-t border-[#333]"
            >
              <p className="text-[#28c840]">✓ Pipeline complete — 2m 34s</p>
              <p className="text-[#888] mt-1">Generated: literature review, knowledge graph, 7 gaps, 5 hypotheses</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// Orbiting nodes animation
function OrbitingNodes() {
  return (
    <div className="relative w-[300px] h-[300px]">
      {/* Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#2563eb] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
        AI
      </div>
      
      {/* Orbiting items */}
      {[
        { label: '📄', delay: 0, radius: 110, speed: 20 },
        { label: '🔬', delay: 1.5, radius: 110, speed: 20 },
        { label: '🧠', delay: 3, radius: 110, speed: 20 },
        { label: '✍️', delay: 4.5, radius: 110, speed: 20 },
        { label: '⚖️', delay: 6, radius: 110, speed: 20 },
        { label: '📊', delay: 7.5, radius: 130, speed: 25 },
        { label: '🕸️', delay: 9, radius: 130, speed: 25 },
        { label: '💡', delay: 10.5, radius: 130, speed: 25 },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-10 h-10 bg-white border border-[#e5e5e5] rounded-xl flex items-center justify-center text-lg shadow-sm"
          animate={{
            x: [
              Math.cos((item.delay / 12) * Math.PI * 2) * item.radius - 20,
              Math.cos(((item.delay + 3) / 12) * Math.PI * 2) * item.radius - 20,
              Math.cos(((item.delay + 6) / 12) * Math.PI * 2) * item.radius - 20,
              Math.cos(((item.delay + 9) / 12) * Math.PI * 2) * item.radius - 20,
              Math.cos((item.delay / 12) * Math.PI * 2) * item.radius - 20,
            ],
            y: [
              Math.sin((item.delay / 12) * Math.PI * 2) * item.radius - 20,
              Math.sin(((item.delay + 3) / 12) * Math.PI * 2) * item.radius - 20,
              Math.sin(((item.delay + 6) / 12) * Math.PI * 2) * item.radius - 20,
              Math.sin(((item.delay + 9) / 12) * Math.PI * 2) * item.radius - 20,
              Math.sin((item.delay / 12) * Math.PI * 2) * item.radius - 20,
            ],
          }}
          transition={{ duration: item.speed, repeat: Infinity, ease: 'linear' }}
        >
          {item.label}
        </motion.div>
      ))}

      {/* Orbit rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] border border-dashed border-[#e5e5e5] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] border border-dashed border-[#eee] rounded-full" />
    </div>
  )
}

// FAQ Accordion Item
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-[#e5e5e5] rounded-2xl overflow-hidden bg-white"
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-[#fafaf9] transition-colors"
      >
        <span className="font-semibold text-[#1a1a1a] pr-4">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl text-[#888] shrink-0"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-[#666] leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Floating tech badges
function FloatingBadges() {
  const techs = [
    { name: 'FastAPI', color: '#059669', x: 0, y: 0 },
    { name: 'React', color: '#2563eb', x: 1, y: 1 },
    { name: 'Groq', color: '#7c3aed', x: 2, y: 0 },
    { name: 'NetworkX', color: '#d97706', x: 0, y: 2 },
    { name: 'Semantic Scholar', color: '#2563eb', x: 1, y: 2 },
    { name: 'arXiv', color: '#dc2626', x: 2, y: 1 },
    { name: 'Google Scholar', color: '#059669', x: 2, y: 2 },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {techs.map((tech, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
          whileHover={{ y: -5, scale: 1.05 }}
          animate={{ y: [0, -6, 0] }}
          className="px-5 py-3 bg-white border border-[#e5e5e5] rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-default"
          style={{ animationDelay: `${i * 0.3}s` }}
        >
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            className="font-medium text-sm"
            style={{ color: tech.color }}
          >
            {tech.name}
          </motion.span>
        </motion.div>
      ))}
    </div>
  )
}

export default function Landing() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50])
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqs = [
    { q: 'How many papers can it search?', a: 'The system queries Semantic Scholar (200M+ papers), arXiv, and Google Scholar simultaneously. The Retriever agent uses AI-powered query expansion to find relevant papers you might miss with manual searches.' },
    { q: 'How long does a full review take?', a: 'A typical literature review with 30-50 papers takes under 2 minutes. The pipeline runs all five agents sequentially, with the Critic agent ensuring quality before delivering results.' },
    { q: 'Is the output publication-ready?', a: 'The Writer agent generates academic prose with proper APA citations. The Critic agent scores output on multiple axes and rejects anything below 7/10, triggering automatic revision. Most outputs need minimal human editing.' },
    { q: 'What makes this different from ChatGPT?', a: 'Unlike single-model approaches, this uses 5 specialized agents in a pipeline. Each agent has a focused role, and the Critic agent provides quality control. The system also searches real academic databases rather than relying on training data.' },
    { q: 'Can I customize the research scope?', a: 'Yes. You can specify date ranges, preferred sources, minimum citation counts, and focus areas. The system also supports iterative refinement where you can guide the agents based on initial results.' },
    { q: 'Is it free to use?', a: 'Yes, the core functionality is free with no signup required. The system is powered by Groq for fast inference and uses open academic APIs for paper retrieval.' },
  ]

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a] overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-[#fafaf9]/80 border-b border-[#eee]/50"
      >
        <div className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
              <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
              <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
            </svg>
            <span className="text-lg font-semibold tracking-tight">ResearchAI</span>
          </Link>
          <div className="flex items-center gap-8 text-sm">
            <a href="#pipeline" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Pipeline</a>
            <a href="#demo" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Demo</a>
            <Link to="/docs" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Docs</Link>
            <Link to="/search" className="text-[#555] hover:text-[#1a1a1a] transition-colors">Papers</Link>
            <Link
              to="/login"
              className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#333] transition-colors"
            >
              Start →
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-6xl mx-auto px-8 pt-20 pb-10">
        <div className="flex items-center justify-between">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-sm font-mono text-[#888] mb-5 tracking-wide uppercase">Multi-Agent Research System</p>
              <h1 className="text-[3.2rem] leading-[1.15] font-bold tracking-tight mb-6">
                From topic to
                <br />
                <Typewriter words={['literature review', 'knowledge graph', 'gap analysis', 'novel hypotheses', 'cited paper']} />
              </h1>
              <p className="text-lg text-[#666] max-w-lg leading-relaxed mb-8">
                Five AI agents search, analyze, synthesize, write, and critique. 
                What takes weeks now takes minutes.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  to="/register"
                  className="bg-[#1a1a1a] text-white px-7 py-3.5 rounded-xl font-medium hover:bg-[#333] transition-all hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Start Research
                </Link>
                <a
                  href="#demo"
                  className="text-[#555] hover:text-[#1a1a1a] px-4 py-3.5 font-medium transition-colors"
                >
                  Watch Demo ↓
                </a>
              </div>
            </motion.div>
          </div>

          {/* Orbiting visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <OrbitingNodes />
          </motion.div>
        </div>
      </motion.section>

      {/* Stats - animated counters */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-4 gap-4">
          {[
            { value: 200, suffix: 'M+', label: 'Papers accessible' },
            { value: 5, suffix: '', label: 'AI agents' },
            { value: 3, suffix: ' min', label: 'Average time' },
            { value: 7, suffix: '+/10', label: 'Quality score' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center py-6"
            >
              <p className="text-4xl font-bold tracking-tight">
                <Counter target={stat.value} />{stat.suffix}
              </p>
              <p className="text-sm text-[#888] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pipeline section */}
      <section id="pipeline" className="relative z-10 py-20 border-t border-[#eee]">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">The Pipeline</p>
            <h2 className="text-3xl font-bold tracking-tight mb-12">Five agents, one goal</h2>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#dc2626] opacity-20 hidden md:block" />

            <div className="grid grid-cols-5 gap-3">
              {[
                { num: '01', name: 'Retriever', desc: 'Multi-source paper discovery with AI query expansion', color: '#2563eb', emoji: '🔍' },
                { num: '02', name: 'Analyzer', desc: 'Batch extraction of findings, methods, limitations', color: '#059669', emoji: '🔬' },
                { num: '03', name: 'Synthesizer', desc: 'Narrative threads, contradictions, hypotheses', color: '#7c3aed', emoji: '🧠' },
                { num: '04', name: 'Writer', desc: 'Academic prose with inline APA citations', color: '#d97706', emoji: '✍️' },
                { num: '05', name: 'Critic', desc: 'Multi-axis review, rejects below 7/10', color: '#dc2626', emoji: '⚖️' },
              ].map((agent, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative bg-white border border-[#e5e5e5] rounded-2xl p-5 hover:shadow-xl hover:shadow-black/5 transition-shadow cursor-default"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#bbb]">{agent.num}</span>
                    <span className="text-xl">{agent.emoji}</span>
                  </div>
                  <div className="w-full h-1 rounded-full mb-4 opacity-60" style={{ backgroundColor: agent.color }} />
                  <h3 className="font-bold text-sm mb-1.5">{agent.name}</h3>
                  <p className="text-[11px] text-[#777] leading-relaxed">{agent.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="relative z-10 py-20 bg-[#f5f5f4] border-t border-[#eee]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-start justify-between gap-12">
            <div className="max-w-sm pt-8">
              <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">Live Demo</p>
              <h2 className="text-3xl font-bold tracking-tight mb-4">See it work</h2>
              <p className="text-[#666] leading-relaxed mb-6">
                Click RUN to watch the pipeline process a real research topic. 
                Each agent hands off to the next, refining until quality passes.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
                  <span className="text-[#555]">Retriever searches multiple databases</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#059669]" />
                  <span className="text-[#555]">Analyzer extracts structured insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                  <span className="text-[#555]">Synthesizer connects the dots</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#d97706]" />
                  <span className="text-[#555]">Writer generates cited prose</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                  <span className="text-[#555]">Critic ensures quality</span>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-2xl">
              <PipelineDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Output cards */}
      <section className="relative z-10 py-20 border-t border-[#eee]">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">Output</p>
          <h2 className="text-3xl font-bold tracking-tight mb-12">What you get</h2>

          <div className="grid grid-cols-3 gap-6">
            {[
              { title: 'Knowledge Graph', desc: 'Interactive force-directed citation network. Theme clusters, bridge papers, author collaborations.', tag: 'Visual', emoji: '🕸️' },
              { title: 'Literature Review', desc: 'Publication-ready writing with APA citations. Auto-revised until critic scores 7+/10.', tag: 'Writing', emoji: '📄' },
              { title: 'Research Gaps & Hypotheses', desc: 'AI-identified unexplored areas with suggested methodology and feasibility ratings.', tag: 'Discovery', emoji: '💡' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="bg-white border border-[#e5e5e5] rounded-2xl p-7 hover:shadow-xl hover:shadow-black/5 transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#999] bg-[#f5f5f4] px-2.5 py-1 rounded-full border border-[#eee]">
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

      {/* ===== NEW SECTIONS START ===== */}

      {/* How It Works - 3 Step Process */}
      <section className="relative z-10 py-24 border-t border-[#eee] bg-[#f5f5f4]">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">How It Works</p>
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">Three steps</span> to breakthrough research
            </h2>
          </motion.div>

          <div className="relative flex items-center justify-between max-w-4xl mx-auto">
            {/* Connecting line */}
            <div className="absolute top-[60px] left-[15%] right-[15%] h-[2px] hidden md:block">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#059669] origin-left"
              />
            </div>

            {[
              { step: '01', title: 'Search', desc: 'Enter your topic. Our Retriever agent queries 200M+ papers across Semantic Scholar, arXiv, and Google Scholar simultaneously.', icon: '🔍', color: '#2563eb' },
              { step: '02', title: 'Analyze', desc: 'AI agents extract findings, identify themes, spot contradictions, and map research gaps automatically.', icon: '🧠', color: '#7c3aed' },
              { step: '03', title: 'Write', desc: 'Get a publication-ready literature review with APA citations, knowledge graph, and novel hypotheses.', icon: '✍️', color: '#059669' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="relative flex flex-col items-center text-center w-[280px]"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-[120px] h-[120px] rounded-3xl bg-white border border-[#e5e5e5] flex items-center justify-center text-4xl shadow-lg mb-6 relative"
                  style={{ boxShadow: `0 20px 40px ${item.color}15` }}
                >
                  {item.icon}
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: item.color }}>
                    {item.step}
                  </span>
                </motion.div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section - Interactive Cards */}
      <section className="relative z-10 py-24 border-t border-[#eee]">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">Meet The Team</p>
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">Five specialized agents</span> working in harmony
            </h2>
          </motion.div>

          <div className="grid grid-cols-5 gap-5">
            {[
              { name: 'Retriever', emoji: '🔍', role: 'Discovery', desc: 'Searches 200M+ papers across multiple databases with AI-powered query expansion', color: '#2563eb', glow: 'shadow-blue-500/20' },
              { name: 'Analyzer', emoji: '🔬', role: 'Extraction', desc: 'Extracts findings, methods, and limitations from each paper in structured batches', color: '#059669', glow: 'shadow-emerald-500/20' },
              { name: 'Synthesizer', emoji: '🧠', role: 'Connection', desc: 'Builds narrative threads, identifies contradictions, generates novel hypotheses', color: '#7c3aed', glow: 'shadow-purple-500/20' },
              { name: 'Writer', emoji: '✍️', role: 'Generation', desc: 'Produces academic prose with proper APA inline citations and logical flow', color: '#d97706', glow: 'shadow-amber-500/20' },
              { name: 'Critic', emoji: '⚖️', role: 'Quality', desc: 'Multi-axis review scoring. Rejects below 7/10 and triggers revision cycles', color: '#dc2626', glow: 'shadow-red-500/20' },
            ].map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative bg-white border border-[#e5e5e5] rounded-2xl p-6 cursor-default transition-all hover:shadow-2xl hover:${agent.glow}`}
                style={{ '--glow-color': agent.color }}
              >
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: `0 0 40px ${agent.color}15, inset 0 0 40px ${agent.color}05` }} />
                
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl mb-4"
                  >
                    {agent.emoji}
                  </motion.div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color: agent.color, borderColor: agent.color + '40', backgroundColor: agent.color + '10' }}>
                    {agent.role}
                  </span>
                  <h3 className="font-bold text-base mt-3 mb-2">{agent.name}</h3>
                  <p className="text-[11px] text-[#666] leading-relaxed">{agent.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Social Proof with Gradient Background */}
      <section className="relative z-10 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/5 via-[#7c3aed]/5 to-[#059669]/5" />
        <div className="absolute inset-0 bg-[#fafaf9]/60" />
        
        <div className="relative max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">By The Numbers</p>
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#2563eb] to-[#059669] bg-clip-text text-transparent">Built for scale</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-4 gap-8">
            {[
              { value: 200, suffix: 'M+', label: 'Papers indexed', desc: 'Across Semantic Scholar, arXiv & Google Scholar', icon: '📚' },
              { value: 5, suffix: '', label: 'AI Agents', desc: 'Specialized roles working in concert', icon: '🤖' },
              { value: 3, suffix: '', label: 'Sources', desc: 'Academic databases queried simultaneously', icon: '🔗' },
              { value: 2, suffix: ' min', label: 'Per review', desc: 'From topic to complete literature review', icon: '⚡' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className="bg-white/80 backdrop-blur-sm border border-[#e5e5e5] rounded-2xl p-8 text-center hover:shadow-xl transition-shadow"
              >
                <span className="text-3xl mb-3 block">{stat.icon}</span>
                <p className="text-5xl font-bold tracking-tight bg-gradient-to-br from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">
                  <Counter target={stat.value} />{stat.suffix}
                </p>
                <p className="font-semibold text-[#1a1a1a] mt-2">{stat.label}</p>
                <p className="text-xs text-[#888] mt-1">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison - Before/After */}
      <section className="relative z-10 py-24 border-t border-[#eee]">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">Comparison</p>
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#dc2626] to-[#2563eb] bg-clip-text text-transparent">Manual vs AI-Powered</span> Research
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before - Manual */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-[#e5e5e5] rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#dc2626]/40" />
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">😩</span>
                <div>
                  <h3 className="font-bold text-lg">Manual Research</h3>
                  <span className="text-xs text-[#dc2626] font-mono">THE OLD WAY</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Time to review', value: '2-4 weeks', bad: true },
                  { label: 'Papers covered', value: '20-30 max', bad: true },
                  { label: 'Missed connections', value: 'Many', bad: true },
                  { label: 'Citation formatting', value: 'Manual', bad: true },
                  { label: 'Quality consistency', value: 'Variable', bad: true },
                  { label: 'Gap identification', value: 'Subjective', bad: true },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0"
                  >
                    <span className="text-sm text-[#666]">{item.label}</span>
                    <span className="text-sm font-medium text-[#dc2626]">{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* After - AI */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-[#e5e5e5] rounded-2xl p-8 relative overflow-hidden shadow-xl shadow-blue-500/5"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563eb] to-[#7c3aed]" />
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="font-bold text-lg">AI Research</h3>
                  <span className="text-xs text-[#2563eb] font-mono">WITH RESEARCHAI</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Time to review', value: '< 2 minutes' },
                  { label: 'Papers covered', value: '50+ papers' },
                  { label: 'Missed connections', value: 'Near zero' },
                  { label: 'Citation formatting', value: 'Auto APA' },
                  { label: 'Quality consistency', value: '7+/10 guaranteed' },
                  { label: 'Gap identification', value: 'Systematic' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0"
                  >
                    <span className="text-sm text-[#666]">{item.label}</span>
                    <span className="text-sm font-medium text-[#2563eb]">{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Time saved callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-3 bg-white border border-[#e5e5e5] rounded-full px-8 py-4 shadow-lg">
              <span className="text-2xl">⏱️</span>
              <span className="text-lg font-bold">Save <span className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">99%</span> of your research time</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack - Floating Badges */}
      <section className="relative z-10 py-24 border-t border-[#eee] bg-[#f5f5f4]">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">Tech Stack</p>
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#059669] to-[#2563eb] bg-clip-text text-transparent">Built with the best</span>
            </h2>
            <p className="text-[#666] mt-4 max-w-lg mx-auto">Modern, fast, and reliable. Every component chosen for performance and developer experience.</p>
          </motion.div>

          <FloatingBadges />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              { label: 'Backend', tech: 'FastAPI + Python', desc: 'Async API with type safety' },
              { label: 'Frontend', tech: 'React + Vite', desc: 'Fast builds, smooth UX' },
              { label: 'AI Inference', tech: 'Groq (LPU)', desc: 'Ultra-fast LLM responses' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-xs font-mono text-[#888] uppercase tracking-wider">{item.label}</p>
                <p className="font-bold mt-1">{item.tech}</p>
                <p className="text-xs text-[#666] mt-0.5">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 border-t border-[#eee]">
        <div className="max-w-3xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-mono text-[#888] mb-3 tracking-wide uppercase">FAQ</p>
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">Common questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFAQ === i}
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEW SECTIONS END ===== */}

      {/* CTA */}
      <section className="relative z-10 py-24 border-t border-[#eee] bg-[#f5f5f4]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto px-8 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Stop reading papers manually.
          </h2>
          <p className="text-[#666] text-lg mb-8">
            Let AI agents do the systematic review. You focus on the insights.
          </p>
          <Link
            to="/register"
            className="inline-block bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-[#333] transition-all hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Your Research →
          </Link>
          <p className="text-xs text-[#999] mt-4 font-mono">Free • No signup • Powered by Groq</p>
        </motion.div>
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
