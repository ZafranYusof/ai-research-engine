import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Sparkles, TrendingUp, RefreshCw, Plus, ExternalLink, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '../utils/toast'

const SOURCE_COLORS = {
  semantic_scholar: { bg: '#2563eb', label: 'S2' },
  arxiv: { bg: '#b31b1b', label: 'arXiv' },
  google_scholar: { bg: '#4285f4', label: 'Scholar' },
}

function RelevanceBar({ score }) {
  const getColor = (s) => {
    if (s >= 8) return '#16a34a'
    if (s >= 6) return '#2563eb'
    if (s >= 4) return '#eab308'
    return '#dc2626'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: getColor(score) }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color: getColor(score) }}>
        {score}/10
      </span>
    </div>
  )
}

function PaperCard({ paper, index }) {
  const source = SOURCE_COLORS[paper.source] || { bg: '#888', label: paper.source }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="bg-white border border-[#eee] rounded-2xl p-5 hover:shadow-lg hover:shadow-black/5 transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: source.bg }}
            >
              {source.label}
            </span>
            {paper.year && (
              <span className="text-[11px] text-[#999]">{paper.year}</span>
            )}
            {paper.citation_count > 0 && (
              <span className="text-[11px] text-[#999]">
                {paper.citation_count} citations
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold leading-snug mb-1.5 dark:text-white line-clamp-2">
            {paper.title}
          </h3>

          <p className="text-[12px] text-[#888] mb-2 line-clamp-1">
            {paper.authors?.slice(0, 3).join(', ')}
            {paper.authors?.length > 3 && ` +${paper.authors.length - 3} more`}
          </p>

          {paper.relevance_score !== undefined && (
            <div className="mb-2">
              <RelevanceBar score={paper.relevance_score} />
            </div>
          )}

          {paper.recommendation_reason && (
            <p className="text-[12px] text-[#7c3aed] dark:text-[#a78bfa] italic leading-relaxed">
              💡 {paper.recommendation_reason}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f8f8f8] hover:bg-[#f0f0f0] transition-colors dark:bg-[#2a2a2a] dark:hover:bg-[#333]"
            >
              <ExternalLink size={14} className="text-[#888]" />
            </a>
          )}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2563eb]/10 hover:bg-[#2563eb]/20 transition-colors"
            title="Add to Project"
          >
            <Plus size={14} className="text-[#2563eb]" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function TrendingCard({ paper, index }) {
  const source = SOURCE_COLORS[paper.source] || { bg: '#888', label: paper.source }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-white border border-[#eee] rounded-2xl p-5 hover:shadow-lg hover:shadow-black/5 transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: source.bg }}
        >
          {source.label}
        </span>
        {paper.year && <span className="text-[11px] text-[#999]">{paper.year}</span>}
      </div>

      <h3 className="text-sm font-semibold leading-snug mb-2 dark:text-white line-clamp-2">
        {paper.title}
      </h3>

      <p className="text-[12px] text-[#888] mb-3 line-clamp-1">
        {paper.authors?.slice(0, 3).join(', ')}
        {paper.authors?.length > 3 && ` +${paper.authors.length - 3}`}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-[#16a34a]" />
          <span className="text-xs font-medium text-[#16a34a]">
            {paper.citation_count} citations
          </span>
        </div>
        {paper.url && (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#2563eb] hover:underline"
          >
            View →
          </a>
        )}
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#eee] rounded-2xl p-5 dark:bg-[#1a1a1a] dark:border-[#2a2a2a] animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-4 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded-full" />
        <div className="w-8 h-3 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded" />
      </div>
      <div className="w-full h-4 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded mb-2" />
      <div className="w-3/4 h-4 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded mb-3" />
      <div className="w-1/2 h-3 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded mb-3" />
      <div className="w-24 h-2 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded" />
    </div>
  )
}

export default function Recommendations() {
  const [activeTab, setActiveTab] = useState('research')
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [trending, setTrending] = useState([])
  const [trendingTopic, setTrendingTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [trendingLoading, setTrendingLoading] = useState(false)

  // Load projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/api/research/projects')
        const completed = (res.data.projects || []).filter(p => p.status === 'completed')
        setProjects(completed)
        if (completed.length > 0) {
          setSelectedProject(completed[0].id)
          setTrendingTopic(completed[0].topic || '')
        }
      } catch (err) {
        console.error('Failed to load projects:', err)
      }
    }
    fetchProjects()
  }, [])

  // Fetch recommendations when project changes
  useEffect(() => {
    if (selectedProject && activeTab === 'research') {
      fetchRecommendations()
    }
  }, [selectedProject])

  const fetchRecommendations = async () => {
    if (!selectedProject) return
    setLoading(true)
    try {
      const res = await api.get(`/api/recommendations/${selectedProject}`)
      setRecommendations(res.data.recommendations || [])
      if (res.data.recommendations?.length > 0) {
        toast.success(`Found ${res.data.count} recommendations`)
      } else {
        toast.info('No new recommendations found')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get recommendations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!selectedProject) return
    setLoading(true)
    try {
      const res = await api.post(`/api/recommendations/${selectedProject}/refresh`)
      setRecommendations(res.data.recommendations || [])
      toast.success('Recommendations refreshed!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to refresh')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrending = async (e) => {
    e?.preventDefault()
    if (!trendingTopic.trim()) return
    setTrendingLoading(true)
    try {
      const res = await api.get('/api/recommendations/trending/papers', {
        params: { topic: trendingTopic },
      })
      setTrending(res.data.papers || [])
      toast.success(`Found ${res.data.count} trending papers`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch trending')
    } finally {
      setTrendingLoading(false)
    }
  }

  const tabs = [
    { id: 'research', label: 'For Your Research', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
            <Sparkles size={20} className="text-[#7c3aed]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight dark:text-white">Discover</h1>
            <p className="text-[#888] text-sm">Smart paper recommendations based on your research.</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 mt-6 mb-6 bg-[#f5f5f5] dark:bg-[#1a1a1a] p-1 rounded-xl w-fit"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-[#1a1a1a] shadow-sm dark:bg-[#2a2a2a] dark:text-white'
                : 'text-[#888] hover:text-[#555] dark:hover:text-[#ccc]'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'research' && (
          <motion.div
            key="research"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Project selector + refresh */}
            <div className="flex items-center gap-3 mb-5">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="flex-1 max-w-md px-4 py-2.5 rounded-xl border border-[#eee] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:text-white"
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.topic}
                  </option>
                ))}
              </select>

              <button
                onClick={handleRefresh}
                disabled={loading || !selectedProject}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Results */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((paper, i) => (
                  <PaperCard key={paper.id || paper.title + i} paper={paper} index={i} />
                ))}
              </div>
            ) : selectedProject ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <BookOpen size={40} className="mx-auto text-[#ddd] dark:text-[#444] mb-3" />
                <p className="text-[#888] text-sm">
                  Click "Refresh" to generate recommendations for this project.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Sparkles size={40} className="mx-auto text-[#ddd] dark:text-[#444] mb-3" />
                <p className="text-[#888] text-sm">
                  Select a completed research project to get personalized recommendations.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'trending' && (
          <motion.div
            key="trending"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Topic search */}
            <form onSubmit={fetchTrending} className="flex items-center gap-3 mb-6">
              <input
                type="text"
                value={trendingTopic}
                onChange={(e) => setTrendingTopic(e.target.value)}
                placeholder="Enter a research topic..."
                className="flex-1 max-w-md px-4 py-2.5 rounded-xl border border-[#eee] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:text-white"
              />
              <button
                type="submit"
                disabled={trendingLoading || !trendingTopic.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrendingUp size={14} className={trendingLoading ? 'animate-pulse' : ''} />
                Find Trending
              </button>
            </form>

            {/* Trending results */}
            {trendingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : trending.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trending.map((paper, i) => (
                  <TrendingCard key={paper.id || paper.title + i} paper={paper} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <TrendingUp size={40} className="mx-auto text-[#ddd] dark:text-[#444] mb-3" />
                <p className="text-[#888] text-sm">
                  Enter a topic to discover trending high-impact papers from the last 2 years.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
