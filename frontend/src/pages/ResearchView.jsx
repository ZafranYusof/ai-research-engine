import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function ResearchView() {
  const { id } = useParams()
  const [status, setStatus] = useState(null)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('papers')

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await axios.get(`/api/research/status/${id}`)
        setStatus(res.data)

        if (res.data.status === 'completed') {
          clearInterval(poll)
          const resultsRes = await axios.get(`/api/research/results/${id}`)
          setResults(resultsRes.data)
        }
        if (res.data.status === 'failed') {
          clearInterval(poll)
        }
      } catch (err) {
        console.error(err)
      }
    }, 3000)

    return () => clearInterval(poll)
  }, [id])

  if (!status) return <div className="text-gray-400">Loading...</div>

  if (status.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-400 text-xl mb-2">❌ Research Failed</p>
        <p className="text-gray-400">{status.message}</p>
        <Link to="/new" className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-lg">
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
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-xl font-semibold mb-2">Research in Progress</h2>
        <p className="text-gray-400 mb-2 capitalize">{status.current_step?.replace(/_/g, ' ')}</p>
        <p className="text-sm text-gray-500 mb-4">{status.message}</p>
        <div className="w-80 bg-gray-800 rounded-full h-3">
          <motion.div
            className="bg-emerald-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(status.progress || 0) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">{Math.round((status.progress || 0) * 100)}%</p>
      </div>
    )
  }

  const tabs = [
    { id: 'papers', label: `📄 Papers (${results?.papers?.length || 0})` },
    { id: 'themes', label: `🎯 Themes (${results?.themes?.length || 0})` },
    { id: 'gaps', label: `🔍 Gaps (${results?.gaps?.length || 0})` },
    { id: 'hypotheses', label: `💡 Hypotheses (${results?.hypotheses?.length || 0})` },
    { id: 'draft', label: '✍️ Draft' },
    { id: 'framework', label: '🧠 Framework' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{status.topic}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Completed • {results?.papers?.length || 0} papers analyzed
          </p>
        </div>
        <Link
          to={`/write/${id}`}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          ✍️ Write Paper
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gray-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
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
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4"
            >
              <h3 className="font-medium">{paper.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {paper.authors?.slice(0, 3).join(', ')}{paper.authors?.length > 3 ? ' et al.' : ''} • {paper.year}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>📊 {paper.citation_count} citations</span>
                <span>📍 {paper.venue || paper.source}</span>
              </div>
              {paper.tldr && (
                <p className="text-sm text-gray-300 mt-2 italic">{paper.tldr}</p>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5"
            >
              <h3 className="font-medium text-emerald-400 text-lg">{theme.theme}</h3>
              <p className="text-sm text-gray-400 mt-2">{theme.description}</p>
              {theme.paper_count && (
                <span className="inline-block mt-3 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
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
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4"
            >
              <span className="text-yellow-400 text-lg">⚡</span>
              <p className="text-gray-300">{gap}</p>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'hypotheses' && (
        <div className="space-y-4">
          {results?.hypotheses?.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5"
            >
              <h3 className="font-medium text-lg">{h.hypothesis}</h3>
              <p className="text-sm text-gray-400 mt-2">{h.reasoning}</p>
              {h.methodology && (
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-gray-400">Methodology:</span> {h.methodology}
                </p>
              )}
              <div className="flex gap-4 mt-3">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
                  Novelty: {h.novelty}/5
                </span>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                  Feasibility: {h.feasibility}/5
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'draft' && results?.draft && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Auto-Generated Literature Review</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{results.draft.word_count} words</span>
              {results.review && (
                <span className={`text-sm px-2 py-1 rounded ${
                  results.review.score >= 7 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  Score: {results.review.score}/10
                </span>
              )}
            </div>
          </div>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            {results.draft.content}
          </div>
        </div>
      )}

      {activeTab === 'framework' && results?.framework && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="font-semibold text-xl mb-4">{results.framework.name}</h2>

          {results.framework.layers?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Layers</h3>
              <div className="flex flex-wrap gap-2">
                {results.framework.layers.map((layer, i) => (
                  <span key={i} className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-sm">
                    {layer}
                  </span>
                ))}
              </div>
            </div>
          )}

          {results.framework.core_concepts?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Core Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {results.framework.core_concepts.map((concept, i) => (
                  <span key={i} className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-sm">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {results.framework.relationships?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Relationships</h3>
              <ul className="space-y-1">
                {results.framework.relationships.map((rel, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-blue-400">→</span> {rel}
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
