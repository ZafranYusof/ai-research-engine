import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api, { API_URL } from '../utils/api'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, Share2 } from 'lucide-react'
import ShareModal from '../components/ShareModal'
import { toast } from '../utils/toast'

export default function ResearchView() {
  const { id } = useParams()
  const [status, setStatus] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('papers')

  const wsRef = useRef(null)

  useEffect(() => {
    let poll = null
    let wsConnected = false

    // Try WebSocket first
    const connectWS = () => {
      try {
        const wsBase = (API_URL || window.location.origin).replace(/^http/, 'ws')
        const ws = new WebSocket(`${wsBase}/api/research/ws/${id}`)
        wsRef.current = ws

        ws.onopen = () => {
          wsConnected = true
          // Clear polling if WS connects
          if (poll) {
            clearInterval(poll)
            poll = null
          }
        }

        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data)
          if (data.type === 'ping') return

          setStatus(prev => ({
            ...prev,
            ...data,
            topic: prev?.topic || data.topic,
          }))

          if (data.status === 'completed') {
            toast.success('Research complete!')
            const resultsRes = await api.get(`/api/research/results/${id}`)
            setResults(resultsRes.data)
            ws.close()
          }
          if (data.status === 'failed') {
            toast.error(data.message || 'Research failed')
            ws.close()
          }
        }

        ws.onerror = () => {
          wsConnected = false
          startPolling()
        }

        ws.onclose = () => {
          wsConnected = false
        }
      } catch {
        startPolling()
      }
    }

    // Fallback polling
    const startPolling = () => {
      if (poll) return
      poll = setInterval(async () => {
        try {
          const res = await api.get(`/api/research/status/${id}`)
          setStatus(res.data)

          if (res.data.status === 'completed') {
            clearInterval(poll)
            poll = null
            const resultsRes = await api.get(`/api/research/results/${id}`)
            setResults(resultsRes.data)
          }
          if (res.data.status === 'failed') {
            clearInterval(poll)
            poll = null
          }
        } catch (err) {
          console.error(err)
        }
      }, 3000)
    }

    // Initial status fetch then try WS
    api.get(`/api/research/status/${id}`).then(res => {
      setStatus(res.data)
      if (res.data.status === 'completed') {
        api.get(`/api/research/results/${id}`).then(r => setResults(r.data))
      } else if (res.data.status !== 'failed') {
        connectWS()
        // Start polling as backup in case WS doesn't connect within 3s
        setTimeout(() => {
          if (!wsConnected) startPolling()
        }, 3000)
      }
    }).catch(() => startPolling())

    return () => {
      if (poll) clearInterval(poll)
      if (wsRef.current) wsRef.current.close()
    }
  }, [id])

  if (!status) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-6 h-6 border-2 border-[#e5e5e5] border-t-[#2563eb] rounded-full" />
    </div>
  )

  if (status.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={24} className="text-red-500" />
        </div>
        <p className="text-base font-medium mb-1">Research Failed</p>
        <p className="text-sm text-[#888]">{status.message}</p>
        <Link to="/new" className="mt-6 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#333] transition-all">
          Try Again
        </Link>
      </div>
    )
  }

  if (status.status !== 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-[3px] border-[#e5e5e5] border-t-[#2563eb] rounded-full mb-6"
        />
        <h2 className="text-lg font-semibold mb-1">Research in Progress</h2>
        <p className="text-sm text-[#888] capitalize mb-4">{status.current_step?.replace(/_/g, ' ')}</p>
        <p className="text-xs text-[#aaa] mb-4">{status.message}</p>
        <div className="w-72 bg-[#f0f0f0] rounded-full h-2">
          <motion.div
            className="bg-[#2563eb] h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(status.progress || 0) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-[#aaa] mt-2 font-mono">{Math.round((status.progress || 0) * 100)}%</p>
      </div>
    )
  }

  const tabs = [
    { id: 'papers', label: `Papers (${results?.papers?.length || 0})`, emoji: '📄' },
    { id: 'themes', label: `Themes (${results?.themes?.length || 0})`, emoji: '🎯' },
    { id: 'gaps', label: `Gaps (${results?.gaps?.length || 0})`, emoji: '🔍' },
    { id: 'hypotheses', label: `Hypotheses (${results?.hypotheses?.length || 0})`, emoji: '💡' },
    { id: 'draft', label: 'Draft', emoji: '✍️' },
    { id: 'framework', label: 'Framework', emoji: '🧠' },
  ]

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">{status.topic}</h1>
          <p className="text-[#888] text-sm mt-1">
            Completed &middot; {results?.papers?.length || 0} papers analyzed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-2 border border-[#e5e5e5] dark:border-[#333] text-[#555] dark:text-[#ccc] dark:text-[#aaa] px-4 py-2.5 rounded-xl text-sm font-medium hover:border-[#ccc] hover:bg-[#f8f8f8] dark:hover:bg-[#222] transition-all"
          >
            <Share2 size={15} />
            Share
          </button>
          <Link
            to={`/write/${id}`}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#333] transition-all hover:shadow-lg hover:shadow-black/10"
          >
            ✍️ Write Paper
          </Link>
        </div>

        <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} projectId={id} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#eee] dark:border-[#333] pb-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#2563eb] text-[#2563eb] font-medium'
                : 'border-transparent text-[#888] hover:text-[#555] dark:text-[#ccc]'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'papers' && (
        <div className="space-y-3">
          {results?.papers?.map((paper, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-5 hover:border-[#ddd] dark:hover:border-[#444] hover:shadow-sm transition-all"
            >
              <h3 className="font-medium text-sm dark:text-white">{paper.title}</h3>
              <p className="text-xs text-[#888] mt-1.5">
                {paper.authors?.slice(0, 3).join(', ')}{paper.authors?.length > 3 ? ' et al.' : ''} &middot; {paper.year}
              </p>
              <div className="flex gap-4 mt-2 text-[10px] text-[#aaa]">
                <span>📊 {paper.citation_count} citations</span>
                <span>📍 {paper.venue || paper.source}</span>
              </div>
              {paper.tldr && (
                <p className="text-xs text-[#666] dark:text-[#bbb] mt-2 italic leading-relaxed">{paper.tldr}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results?.themes?.map((theme, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-5 hover:shadow-sm transition-all"
            >
              <h3 className="font-medium text-sm text-[#2563eb]">{theme.theme}</h3>
              <p className="text-xs text-[#666] dark:text-[#bbb] mt-2 leading-relaxed">{theme.description}</p>
              {theme.paper_count && (
                <span className="inline-block mt-3 text-[10px] bg-[#f5f5f4] dark:bg-[#333] text-[#888] px-2 py-0.5 rounded-full border border-[#eee] dark:border-[#2a2a2a]">
                  {theme.paper_count} papers
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'gaps' && (
        <div className="space-y-3">
          {results?.gaps?.map((gap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-4"
            >
              <span className="text-amber-500 text-sm mt-0.5">⚡</span>
              <p className="text-sm text-[#555] dark:text-[#ccc] leading-relaxed">{gap}</p>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'hypotheses' && (
        <div className="space-y-3">
          {results?.hypotheses?.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-5 hover:shadow-sm transition-all"
            >
              <h3 className="font-medium text-sm dark:text-white">{h.hypothesis}</h3>
              <p className="text-xs text-[#666] dark:text-[#bbb] mt-2 leading-relaxed">{h.reasoning}</p>
              {h.methodology && (
                <p className="text-xs text-[#888] mt-2">
                  <span className="font-medium text-[#555] dark:text-[#ccc]">Methodology:</span> {h.methodology}
                </p>
              )}
              <div className="flex gap-3 mt-3">
                <span className="text-[10px] bg-[#2563eb]/5 text-[#2563eb] px-2.5 py-1 rounded-full font-medium">
                  Novelty: {h.novelty}/5
                </span>
                <span className="text-[10px] bg-[#059669]/5 text-[#059669] px-2.5 py-1 rounded-full font-medium">
                  Feasibility: {h.feasibility}/5
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'draft' && results?.draft && (
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-sm">Auto-Generated Literature Review</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#aaa] font-mono">{results.draft.word_count} words</span>
              {results.review && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  results.review.score >= 7 ? 'bg-[#059669]/5 text-[#059669]' : 'bg-amber-50 text-amber-600'
                }`}>
                  Score: {results.review.score}/10
                </span>
              )}
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-[#444] dark:text-[#ccc] leading-relaxed">
            {results.draft.content}
          </div>
        </div>
      )}

      {activeTab === 'framework' && results?.framework && (
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4 dark:text-white">{results.framework.name}</h2>

          {results.framework.layers?.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">Layers</h3>
              <div className="flex flex-wrap gap-2">
                {results.framework.layers.map((layer, i) => (
                  <span key={i} className="bg-[#7c3aed]/5 text-[#7c3aed] px-3 py-1 rounded-lg text-xs font-medium">
                    {layer}
                  </span>
                ))}
              </div>
            </div>
          )}

          {results.framework.core_concepts?.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">Core Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {results.framework.core_concepts.map((concept, i) => (
                  <span key={i} className="bg-[#059669]/5 text-[#059669] px-3 py-1 rounded-lg text-xs font-medium">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {results.framework.relationships?.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">Relationships</h3>
              <ul className="space-y-1.5">
                {results.framework.relationships.map((rel, i) => (
                  <li key={i} className="text-xs text-[#555] dark:text-[#ccc] flex items-center gap-2">
                    <span className="text-[#2563eb]">→</span> {rel}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
