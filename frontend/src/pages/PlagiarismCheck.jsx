import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, Loader2, FileText, Sparkles } from 'lucide-react'
import api from '../utils/api'

export default function PlagiarismCheck() {
  const location = useLocation()
  const [content, setContent] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [checkType, setCheckType] = useState('quick') // 'quick' or 'full'

  // Load content from navigation state (from Writing page)
  useEffect(() => {
    if (location.state?.content) {
      setContent(location.state.content)
    }
    if (location.state?.projectId) {
      setProjectId(location.state.projectId)
      setCheckType('full')
    }
  }, [location.state])

  // Load projects for selector
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/api/research/projects')
        setProjects(res.data || [])
      } catch (err) {
        console.error('Failed to load projects:', err)
      }
    }
    fetchProjects()
  }, [])

  const handleCheck = async () => {
    if (!content.trim()) return
    setLoading(true)
    setResults(null)

    try {
      let res
      if (checkType === 'full' && projectId) {
        res = await api.post('/api/plagiarism/check', {
          content,
          project_id: projectId,
        })
      } else {
        res = await api.post('/api/plagiarism/quick-check', {
          content,
          section_type: 'general',
        })
      }
      setResults(res.data)
    } catch (err) {
      console.error('Plagiarism check failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 85) return { ring: 'text-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' }
    if (score >= 60) return { ring: 'text-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' }
    return { ring: 'text-red-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' }
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
      case 'low': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Originality Check</h1>
            <p className="text-sm text-[#888] dark:text-[#bbb]">Detect similarity and ensure your writing is original</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Content Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium dark:text-white">Paste your content</label>
              <span className="text-xs text-[#999]">{wordCount} words</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your academic writing here to check for originality..."
              className="w-full h-64 p-4 bg-[#fafaf9] dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:text-[#e5e5e5] placeholder:text-[#bbb]"
            />
          </motion.div>

          {/* Options */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-5"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Check Type */}
              <div className="flex-1">
                <label className="text-xs font-medium text-[#888] dark:text-[#bbb] mb-2 block">Check Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckType('quick')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      checkType === 'quick'
                        ? 'bg-violet-500 text-white'
                        : 'bg-[#f5f5f5] dark:bg-[#222] text-[#666] dark:text-[#aaa] hover:bg-[#eee] dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    Quick Check
                  </button>
                  <button
                    onClick={() => setCheckType('full')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      checkType === 'full'
                        ? 'bg-violet-500 text-white'
                        : 'bg-[#f5f5f5] dark:bg-[#222] text-[#666] dark:text-[#aaa] hover:bg-[#eee] dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    Full Check
                  </button>
                </div>
              </div>

              {/* Project Selector */}
              {checkType === 'full' && (
                <div className="flex-1">
                  <label className="text-xs font-medium text-[#888] dark:text-[#bbb] mb-2 block">Compare against project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f5f5f5] dark:bg-[#222] border border-[#eee] dark:border-[#2a2a2a] rounded-lg text-xs dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  >
                    <option value="">Select a project...</option>
                    {projects.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.topic || p.title || 'Untitled'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Check Button */}
            <button
              onClick={handleCheck}
              disabled={loading || !content.trim()}
              className="mt-4 w-full py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-[#ccc] dark:disabled:bg-[#333] text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Check Originality
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-8 flex flex-col items-center justify-center"
              >
                <div className="relative w-24 h-24 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-violet-500/20 border-t-violet-500 rounded-full"
                  />
                  <div className="absolute inset-3 flex items-center justify-center">
                    <Sparkles size={24} className="text-violet-500" />
                  </div>
                </div>
                <p className="text-sm text-[#888] dark:text-[#bbb]">Analyzing originality...</p>
              </motion.div>
            )}

            {results && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Score Circle */}
                <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-[#eee] dark:text-[#2a2a2a]"
                      />
                      <motion.circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className={getScoreColor(results.originality_score).ring}
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - results.originality_score / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={`text-2xl font-bold ${getScoreColor(results.originality_score).text}`}
                      >
                        {results.originality_score}%
                      </motion.span>
                      <span className="text-[10px] text-[#999] uppercase tracking-wider">Original</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 w-full mt-2">
                    <div className="text-center">
                      <p className="text-lg font-semibold dark:text-white">{results.total_sentences}</p>
                      <p className="text-[10px] text-[#999]">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-emerald-500">{results.clean_sentences}</p>
                      <p className="text-[10px] text-[#999]">Clean</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-500">{results.flagged_sentences?.length || 0}</p>
                      <p className="text-[10px] text-[#999]">Flagged</p>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {results.suggestions?.length > 0 && (
                  <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-[#888] dark:text-[#bbb] uppercase tracking-wider mb-3">Suggestions</h3>
                    <div className="space-y-2">
                      {results.suggestions.map((s, i) => (
                        <p key={i} className="text-xs text-[#666] dark:text-[#aaa] leading-relaxed">{s}</p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!results && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-8 flex flex-col items-center justify-center text-center"
              >
                <FileText size={32} className="text-[#ccc] dark:text-[#444] mb-3" />
                <p className="text-sm text-[#888] dark:text-[#bbb]">Paste content and click check to see results</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Flagged Sentences Detail */}
      <AnimatePresence>
        {results?.flagged_sentences?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold dark:text-white">Flagged Sentences</h3>
              <span className="text-xs text-[#999]">({results.flagged_sentences.length})</span>
            </div>

            <div className="space-y-3">
              {results.flagged_sentences.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`p-4 rounded-lg border ${getSeverityStyle(item.severity)}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium leading-relaxed flex-1">"{item.sentence}"</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase whitespace-nowrap ${
                      item.severity === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                      item.severity === 'medium' ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200' :
                      'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                    }`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    <span className="font-medium">Similar to:</span> {item.similar_to}
                  </p>
                  <p className="text-xs opacity-70 mt-0.5">{item.similarity_reason}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
