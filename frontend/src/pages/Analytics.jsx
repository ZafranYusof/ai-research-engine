import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { FileText, BookOpen, Type, Star, Clock, TrendingUp } from 'lucide-react'
import api from '../utils/api'



const COLORS = ['#2563eb', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
const THEME_GRADIENT = [
  '#2563eb', '#3b5fe8', '#5159e4', '#6753e0', '#7c3aed',
  '#8a35e0', '#9730d3', '#a42bc6', '#b126b9', '#be21ac',
  '#cb1c9f', '#d81792', '#e51285', '#f20d78', '#ff086b'
]

function AnimatedCounter({ value, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (value === 0) { setCount(0); return }
    let start = 0
    const increment = value / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{typeof value === 'number' && value % 1 !== 0 ? count.toFixed(1) : count}{suffix}</span>
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-[#eee] dark:bg-[#2a2a2a] rounded w-1/3 mb-4" />
      <div className="h-8 bg-[#eee] dark:bg-[#2a2a2a] rounded w-1/2" />
    </div>
  )
}

function ChartSkeleton({ height = 300 }) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-[#eee] dark:bg-[#2a2a2a] rounded w-1/4 mb-6" />
      <div className={`bg-[#f5f5f5] dark:bg-[#222] rounded-xl`} style={{ height }} />
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[#999]">
      <TrendingUp size={40} strokeWidth={1} className="mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function Analytics() {
  const [overview, setOverview] = useState(null)
  const [papersByYear, setPapersByYear] = useState(null)
  const [themes, setThemes] = useState(null)
  const [quality, setQuality] = useState(null)
  const [sources, setSources] = useState(null)
  const [velocity, setVelocity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    Promise.all([
      api.get(`/api/analytics/overview`),
      api.get(`/api/analytics/papers-by-year`),
      api.get(`/api/analytics/themes-distribution`),
      api.get(`/api/analytics/quality-over-time`),
      api.get(`/api/analytics/source-breakdown`),
      api.get(`/api/analytics/research-velocity`),
    ]).then(([ov, pby, th, qu, src, vel]) => {
      setOverview(ov.data)
      setPapersByYear(pby.data)
      setThemes(th.data)
      setQuality(qu.data)
      setSources(src.data)
      setVelocity(vel.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = overview ? [
    { label: 'Total Projects', value: overview.total_projects, icon: BookOpen, color: '#2563eb' },
    { label: 'Papers Analyzed', value: overview.total_papers, icon: FileText, color: '#7c3aed' },
    { label: 'Words Generated', value: overview.total_words, icon: Type, color: '#06b6d4' },
    { label: 'Avg Quality Score', value: overview.avg_score, icon: Star, color: '#f59e0b', suffix: '/10' },
    { label: 'Research Hours', value: overview.total_hours, icon: Clock, color: '#10b981', suffix: 'h' },
  ] : []

  const darkTooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--tooltip-bg, #fff)',
      border: '1px solid var(--tooltip-border, #eee)',
      borderRadius: '12px',
      fontSize: '12px',
    }
  }

  return (
    <div className="max-w-7xl mx-auto [--tooltip-bg:#fff] [--tooltip-border:#eee] dark:[--tooltip-bg:#1a1a1a] dark:[--tooltip-border:#2a2a2a]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold dark:text-white">Analytics</h1>
        <p className="text-sm text-[#888] mt-1">Research patterns, productivity metrics, and insights</p>
      </motion.div>

      {/* Section 1: Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          statCards.map((card, i) => (
            <motion.div
              key={card.label}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon size={16} style={{ color: card.color }} />
                </div>
                <span className="text-xs text-[#888] font-medium">{card.label}</span>
              </div>
              <p className="text-2xl font-bold dark:text-white">
                <AnimatedCounter value={card.value} suffix={card.suffix || ''} />
              </p>
            </motion.div>
          ))
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Section 2: Papers by Year */}
        {loading ? <ChartSkeleton /> : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold mb-4 dark:text-white">Papers by Year</h3>
            {!papersByYear || papersByYear.length === 0 ? (
              <EmptyState message="No paper data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={papersByYear} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--tooltip-border)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip {...darkTooltipStyle} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}

        {/* Section 3: Theme Distribution */}
        {loading ? <ChartSkeleton /> : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold mb-4 dark:text-white">Top Themes</h3>
            {!themes || themes.length === 0 ? (
              <EmptyState message="No themes found yet" />
            ) : (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={themes.map(t => ({ ...t, theme: t.theme.length > 30 ? t.theme.slice(0, 30) + '...' : t.theme }))} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--tooltip-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis type="category" dataKey="theme" tick={{ fontSize: 11, fill: '#999' }} width={180} />
                  <Tooltip {...darkTooltipStyle} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {themes.map((_, idx) => (
                      <Cell key={idx} fill={THEME_GRADIENT[idx % THEME_GRADIENT.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}

        {/* Section 4: Quality Score Trend */}
        {loading ? <ChartSkeleton /> : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold mb-4 dark:text-white">Quality Score Trend</h3>
            {!quality || quality.length === 0 ? (
              <EmptyState message="No quality data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={quality} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--tooltip-border)" />
                  <XAxis dataKey="project_topic" tick={{ fontSize: 10, fill: '#888' }} angle={-20} textAnchor="end" height={50} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip {...darkTooltipStyle} />
                  <ReferenceLine y={7} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Pass', fill: '#f59e0b', fontSize: 10 }} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}

        {/* Section 5: Source Breakdown */}
        {loading ? <ChartSkeleton /> : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold mb-4 dark:text-white">Source Breakdown</h3>
            {!sources || sources.length === 0 ? (
              <EmptyState message="No source data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="source"
                    paddingAngle={3}
                  >
                    {sources.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...darkTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}

        {/* Section 6: Research Velocity */}
        {loading ? <ChartSkeleton /> : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 lg:col-span-2"
          >
            <h3 className="text-sm font-semibold mb-4 dark:text-white">Research Velocity</h3>
            {!velocity || velocity.length === 0 ? (
              <EmptyState message="No velocity data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={velocity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--tooltip-border)" />
                  <XAxis dataKey="project_topic" tick={{ fontSize: 10, fill: '#888' }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip {...darkTooltipStyle} />
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="papers_count" stroke="#7c3aed" strokeWidth={2.5} fill="url(#areaGradient)" dot={{ fill: '#7c3aed', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
