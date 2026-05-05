import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function ResearchView() {
  const { id } = useParams()
  const [status, setStatus] = useState(null)
  const [results, setResults] = useState(null)

  useEffect(() => {
    const poll = setInterval(async () => {
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
    }, 2000)

    return () => clearInterval(poll)
  }, [id])

  if (!status) return <div className="text-gray-400">Loading...</div>

  if (status.status !== 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-xl font-semibold mb-2">Research in Progress</h2>
        <p className="text-gray-400 mb-4">{status.current_step?.replace(/_/g, ' ')}</p>
        <div className="w-64 bg-gray-800 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(status.progress || 0) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">{Math.round((status.progress || 0) * 100)}%</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Research Results</h1>
        <Link
          to={`/write/${id}`}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          ✍️ Generate Writing
        </Link>
      </div>

      {/* Papers Found */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">📄 Papers Found ({results?.papers_found})</h2>
        <div className="space-y-3">
          {results?.papers?.slice(0, 10).map((paper, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-medium">{paper.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {paper.authors?.slice(0, 3).join(', ')} • {paper.year} • Citations: {paper.citation_count}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Themes */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🎯 Themes Identified</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results?.themes?.map((theme, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-emerald-400">{theme.theme}</h3>
              <p className="text-sm text-gray-400 mt-2">{theme.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gaps */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🔍 Research Gaps</h2>
        <ul className="space-y-2">
          {results?.gaps?.map((gap, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300">
              <span className="text-yellow-400 mt-1">•</span>
              {gap}
            </li>
          ))}
        </ul>
      </section>

      {/* Hypotheses */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">💡 Suggested Hypotheses</h2>
        <div className="space-y-4">
          {results?.hypotheses?.map((h, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-medium">{h.hypothesis}</h3>
              <p className="text-sm text-gray-400 mt-2">{h.reasoning}</p>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="text-emerald-400">Novelty: {h.novelty}/5</span>
                <span className="text-blue-400">Feasibility: {h.feasibility}/5</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
