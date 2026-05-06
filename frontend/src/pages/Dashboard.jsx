import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Plus, Clock, CheckCircle, AlertCircle, BookOpen, GitBranch, TrendingUp, Zap, Search, FileText, Upload, BarChart3, FileCheck, Timer, Mail, Lightbulb, ArrowRight, Sparkles, Globe, Brain, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkeletonStatCard, SkeletonProjectRow } from '../components/Skeleton'

// Animated stat card
function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="bg-white border border-[#eee] rounded-2xl p-5 hover:shadow-lg hover:shadow-black/5 transition-all cursor-default dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '10' }}
        >
          <Icon size={20} style={{ color }} />
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-2xl font-bold tracking-tight dark:text-white"
          >
            {value}
          </motion.p>
          <p className="text-[11px] text-[#999]">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Quick action card
function QuickAction({ icon: Icon, title, desc, to, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link
        to={to}
        className="block bg-white border border-[#eee] rounded-2xl p-5 hover:border-[#ddd] hover:shadow-lg hover:shadow-black/5 transition-all group dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:hover:border-[#444]"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 3 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: color + '10' }}
        >
          <Icon size={20} style={{ color }} />
        </motion.div>
        <h3 className="font-medium text-sm group-hover:text-[#2563eb] transition-colors dark:text-white">{title}</h3>
        <p className="text-xs text-[#999] mt-1">{desc}</p>
      </Link>
    </motion.div>
  )
}

// Animated counter
function AnimatedCounter({ value, duration = 1.5, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (value === 0 || hasAnimated.current) return
    hasAnimated.current = true
    const start = Date.now()
    const end = start + duration * 1000
    function tick() {
      const now = Date.now()
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// Mini sparkline
function MiniSparkline({ color }) {
  const points = [4, 7, 5, 9, 6, 8, 10, 7, 11, 9, 12]
  const max = Math.max(...points)
  const width = 60
  const height = 20
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - (p / max) * height
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="opacity-60">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Trending topics suggestions
function TrendingTopics() {
  const topics = [
    { title: 'Large Language Models in Education', papers: '12.4K', trend: '+24%' },
    { title: 'AI-Driven Drug Discovery', papers: '8.7K', trend: '+18%' },
    { title: 'Federated Learning Privacy', papers: '5.2K', trend: '+31%' },
    { title: 'Multimodal Foundation Models', papers: '9.1K', trend: '+42%' },
    { title: 'Quantum Machine Learning', papers: '3.8K', trend: '+15%' },
  ]

  return (
    <div className="space-y-2">
      {topics.map((topic, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.05 }}
        >
          <Link
            to={`/new`}
            className="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl px-4 py-3 hover:border-[#ddd] dark:hover:border-[#444] hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb]/10 to-[#7c3aed]/10 flex items-center justify-center shrink-0">
              <TrendingUp size={14} className="text-[#2563eb]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-[#2563eb] transition-colors dark:text-white">{topic.title}</p>
              <p className="text-[10px] text-[#aaa]">{topic.papers} papers</p>
            </div>
            <span className="text-[10px] text-[#059669] font-medium bg-[#059669]/5 px-2 py-0.5 rounded-full">{topic.trend}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

// Getting started steps
function GettingStarted({ hasProjects }) {
  const steps = [
    { num: 1, title: 'Start a Research', desc: 'Enter your topic and let AI find papers', icon: Search, done: hasProjects, to: '/new' },
    { num: 2, title: 'Explore Results', desc: 'View themes, gaps, and hypotheses', icon: Lightbulb, done: false, to: '/app' },
    { num: 3, title: 'Generate Writing', desc: 'Auto-write literature review with citations', icon: FileText, done: false, to: '/app' },
    { num: 4, title: 'Export & Share', desc: 'Download as Word, LaTeX, or share with team', icon: Upload, done: false, to: '/app' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.08 }}
        >
          <Link
            to={step.to}
            className={`block bg-white dark:bg-[#1a1a1a] border rounded-xl p-4 transition-all group ${
              step.done
                ? 'border-[#059669]/30 bg-[#059669]/5 dark:bg-[#059669]/5'
                : 'border-[#eee] dark:border-[#2a2a2a] hover:border-[#ddd] dark:hover:border-[#444] hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step.done ? 'bg-[#059669] text-white' : 'bg-[#f0f0f0] dark:bg-[#333] text-[#888]'
              }`}>
                {step.done ? '✓' : step.num}
              </span>
              <step.icon size={14} className={step.done ? 'text-[#059669]' : 'text-[#aaa]'} />
            </div>
            <h4 className="text-xs font-medium dark:text-white group-hover:text-[#2563eb] transition-colors">{step.title}</h4>
            <p className="text-[10px] text-[#aaa] mt-0.5">{step.desc}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

// Platform capabilities
function Capabilities() {
  const items = [
    { icon: Globe, title: '3 Sources', desc: 'Semantic Scholar, arXiv, Google Scholar', color: '#2563eb' },
    { icon: Brain, title: '5 AI Agents', desc: 'Retrieve, Analyze, Synthesize, Write, Critique', color: '#7c3aed' },
    { icon: Target, title: 'Gap Analysis', desc: 'Auto-detect research gaps & contradictions', color: '#d97706' },
    { icon: Sparkles, title: 'Quality Score', desc: 'Critic agent ensures 7+/10 quality', color: '#059669' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 + i * 0.05 }}
          className="bg-gradient-to-br from-white to-[#fafaf9] dark:from-[#1a1a1a] dark:to-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-4 text-center"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: item.color + '10' }}>
            <item.icon size={18} style={{ color: item.color }} />
          </div>
          <p className="text-xs font-semibold dark:text-white">{item.title}</p>
          <p className="text-[10px] text-[#999] mt-0.5">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [graphStats, setGraphStats] = useState(null)
  const [researchStats, setResearchStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [projectsRes, graphRes, statsRes] = await Promise.all([
        api.get('/api/research/list'),
        api.get('/api/graph/stats'),
        api.get('/api/research/stats').catch(() => ({ data: null })),
      ])
      setProjects(projectsRes.data.projects || [])
      setGraphStats(graphRes.data)
      if (statsRes.data) setResearchStats(statsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const completedCount = projects.filter(p => p.status === 'completed').length
  const activeCount = projects.filter(p => p.status === 'started').length
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div>
      {/* Email verification banner */}
      {user && user.verified === false && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3 dark:bg-amber-900/20 dark:border-amber-800"
        >
          <Mail size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please verify your email address. Check your inbox for a verification link.
          </p>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-start mb-8"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold tracking-tight dark:text-white"
          >
            {greeting}{user.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#888] text-sm mt-1"
          >
            Your AI-powered research workspace
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/new"
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#333] transition-all hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={16} />
            New Research
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} label="Projects" value={projects.length} color="#2563eb" delay={0.1} />
          <StatCard icon={CheckCircle} label="Completed" value={completedCount} color="#059669" delay={0.15} />
          <StatCard icon={GitBranch} label="Graph Nodes" value={graphStats?.total_nodes || 0} color="#7c3aed" delay={0.2} />
          <StatCard icon={Zap} label="In Progress" value={activeCount} color="#d97706" delay={0.25} />
        </div>
      )}

      {/* Getting Started */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Getting Started</h2>
        <GettingStarted hasProjects={projects.length > 0} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={Plus} title="New Research" desc="Start a pipeline" to="/new" color="#2563eb" delay={0.35} />
          <QuickAction icon={Search} title="Search Papers" desc="Find literature" to="/search" color="#059669" delay={0.4} />
          <QuickAction icon={Upload} title="Upload PDF" desc="Parse papers" to="/pdf" color="#d97706" delay={0.45} />
          <QuickAction icon={GitBranch} title="Knowledge Graph" desc="Visualize network" to="/graph" color="#7c3aed" delay={0.5} />
        </div>
      </motion.div>

      {/* Two column: Trending + Capabilities */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider">Trending Topics</h2>
            <Link to="/new" className="text-[10px] text-[#2563eb] hover:underline flex items-center gap-0.5">
              Explore <ArrowRight size={10} />
            </Link>
          </div>
          <TrendingTopics />
        </motion.div>

        {/* Platform Capabilities */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
        >
          <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Platform Capabilities</h2>
          <Capabilities />

          {/* Powered by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 bg-gradient-to-r from-[#2563eb]/5 to-[#7c3aed]/5 border border-[#2563eb]/10 rounded-xl p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-white dark:bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-[#eee] dark:border-[#333]">
              <Sparkles size={16} className="text-[#2563eb]" />
            </div>
            <div>
              <p className="text-xs font-medium dark:text-white">Powered by Groq</p>
              <p className="text-[10px] text-[#888]">Llama 3.3 70B - Ultra-fast inference</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Research Insights (only if has data) */}
      {researchStats && researchStats.completed_projects > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Research Insights</h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white border border-[#eee] rounded-2xl p-4 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
                  <FileCheck size={16} className="text-[#2563eb]" />
                </div>
                <MiniSparkline color="#2563eb" />
              </div>
              <p className="text-xl font-bold tracking-tight dark:text-white">
                <AnimatedCounter value={researchStats.total_papers_analyzed} />
              </p>
              <p className="text-[10px] text-[#999] mt-0.5">Papers Analyzed</p>
            </div>
            <div className="bg-white border border-[#eee] rounded-2xl p-4 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center">
                  <BookOpen size={16} className="text-[#059669]" />
                </div>
                <MiniSparkline color="#059669" />
              </div>
              <p className="text-xl font-bold tracking-tight dark:text-white">
                <AnimatedCounter value={researchStats.total_words_generated} />
              </p>
              <p className="text-[10px] text-[#999] mt-0.5">Words Generated</p>
            </div>
            <div className="bg-white border border-[#eee] rounded-2xl p-4 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center">
                  <BarChart3 size={16} className="text-[#7c3aed]" />
                </div>
                <MiniSparkline color="#7c3aed" />
              </div>
              <p className="text-xl font-bold tracking-tight dark:text-white">
                <AnimatedCounter value={Math.round((researchStats.avg_score || 0) * 10)} suffix="%" />
              </p>
              <p className="text-[10px] text-[#999] mt-0.5">Avg Quality Score</p>
            </div>
            <div className="bg-white border border-[#eee] rounded-2xl p-4 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#d97706]/10 flex items-center justify-center">
                  <Timer size={16} className="text-[#d97706]" />
                </div>
                <MiniSparkline color="#d97706" />
              </div>
              <p className="text-xl font-bold tracking-tight dark:text-white">
                <AnimatedCounter value={Math.round((researchStats.total_duration_seconds || 0) / 60)} suffix="m" />
              </p>
              <p className="text-[10px] text-[#999] mt-0.5">Total Research Time</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider">Recent Projects</h2>
          {projects.length > 0 && (
            <span className="text-[10px] text-[#aaa] font-mono bg-[#f5f5f4] dark:bg-[#222] px-2 py-0.5 rounded-full">{projects.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonProjectRow key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white border border-[#eee] rounded-2xl dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 bg-gradient-to-br from-[#2563eb]/10 to-[#7c3aed]/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <BookOpen size={24} className="text-[#2563eb]" />
            </motion.div>
            <p className="text-sm font-medium mb-1 dark:text-white">No projects yet</p>
            <p className="text-xs text-[#888] mb-5">Start your first AI-powered literature review</p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#333] transition-all hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5"
            >
              <Plus size={14} />
              Create Project
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                >
                  <Link
                    to={`/research/${project.id}`}
                    className="flex items-center gap-4 bg-white border border-[#eee] rounded-xl px-5 py-4 hover:border-[#ddd] hover:shadow-md hover:shadow-black/5 transition-all group hover:-translate-y-0.5 dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:hover:border-[#444]"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        project.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                        project.status === 'started' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      {project.status === 'completed' && <CheckCircle size={20} className="text-emerald-500" />}
                      {project.status === 'started' && (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                          <Clock size={20} className="text-amber-500" />
                        </motion.div>
                      )}
                      {project.status === 'failed' && <AlertCircle size={20} className="text-red-500" />}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate group-hover:text-[#2563eb] transition-colors dark:text-white">
                        {project.topic}
                      </h3>
                      {project.status === 'started' && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 max-w-[200px] bg-[#f0f0f0] dark:bg-[#333] rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] h-1.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(project.progress || 0) * 100}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                          <span className="text-[10px] text-[#999] font-mono">{Math.round((project.progress || 0) * 100)}%</span>
                        </div>
                      )}
                      {project.status === 'completed' && (
                        <p className="text-[10px] text-[#059669] mt-1 font-medium">Completed</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-[#ccc] group-hover:text-[#2563eb] shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}
