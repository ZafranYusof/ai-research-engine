import { useState } from 'react'
import api from '../utils/api'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { SkeletonPaperCard } from '../components/Skeleton'
import { toast } from '../utils/toast'

const SOURCES = [
  { id: 'semantic_scholar', label: 'Semantic Scholar', color: '#2563eb' },
  { id: 'arxiv', label: 'arXiv', color: '#b31b1b' },
  { id: 'google_scholar', label: 'Google Scholar', color: '#4285f4' },
]

export default function PaperSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState(['semantic_scholar', 'arxiv', 'google_scholar'])
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await api.post('/api/papers/search', {
        query,
        max_results: 20,
        sources,
        year_from: yearFrom ? parseInt(yearFrom) : null,
        year_to: yearTo ? parseInt(yearTo) : null,
      })
      setResults(res.data.papers)
      toast.success(`Found ${res.data.total} papers`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Search failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2 dark:text-white">Search Papers</h1>
        <p className="text-[#c8bfa8]/60 text-sm mb-6">Search across Semantic Scholar and arXiv databases.</p>

        <form onSubmit={handleSearch} className="space-y-4 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 text-[#c8bfa8]/50" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search academic papers..."
                className="w-full bg-[#11202f] border border-[#e5e5e5] rounded-xl dark:bg-[#11202f] dark:border-[#1c2f42] dark:text-white pl-11 pr-4 py-3 text-sm text-[#f5efe0] placeholder:text-[#c8bfa8]/50 focus:outline-none focus:border-[#c89b3c] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#11202f] hover:bg-[#333] disabled:bg-[#e5e5e5] disabled:text-[#c8bfa8]/50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-black/10"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Sources */}
            <div className="flex items-center gap-2">
              {SOURCES.map(src => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setSources(prev =>
                    prev.includes(src.id)
                      ? prev.filter(s => s !== src.id)
                      : [...prev, src.id]
                  )}
                  className={`text-[11px] px-3 py-1.5 rounded-full border transition-all font-medium ${
                    sources.includes(src.id)
                      ? 'border-current text-white'
                      : 'border-[#e5e5e5] text-[#c8bfa8]/70 hover:border-[#ccc]'
                  }`}
                  style={sources.includes(src.id) ? { backgroundColor: src.color, borderColor: src.color } : {}}
                >
                  {src.label}
                </button>
              ))}
            </div>

            {/* Year range */}
            <div className="flex items-center gap-1.5 text-xs text-[#c8bfa8]/60">
              <span>Year:</span>
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="2019"
                className="w-16 bg-[#11202f] border border-[#e5e5e5] rounded-lg dark:bg-[#11202f] dark:border-[#1c2f42] dark:text-white px-2 py-1.5 text-xs text-[#f5efe0] focus:outline-none focus:border-[#c89b3c]"
              />
              <span>-</span>
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="2026"
                className="w-16 bg-[#11202f] border border-[#e5e5e5] rounded-lg dark:bg-[#11202f] dark:border-[#1c2f42] dark:text-white px-2 py-1.5 text-xs text-[#f5efe0] focus:outline-none focus:border-[#c89b3c]"
              />
            </div>
          </div>
        </form>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonPaperCard key={i} />
            ))}
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-20 text-[#c8bfa8]/50">
            <Search size={32} className="mx-auto mb-3 text-[#c8bfa8]/40" />
            <p className="text-sm">Enter a topic to search papers</p>
          </div>
        )}

        <div className="space-y-3">
          {results.map((paper, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#11202f] border border-[#1c2f42] rounded-xl p-5 hover:border-[#ddd] hover:shadow-sm transition-all dark:bg-[#11202f] dark:border-[#1c2f42] dark:hover:border-[#444]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm leading-snug dark:text-white">{paper.title}</h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-full shrink-0 font-medium ${
                  paper.source === 'google_scholar' ? 'bg-[#4285f4]/10 text-[#4285f4]' :
                  paper.source === 'arxiv' ? 'bg-[#b31b1b]/10 text-[#b31b1b]' :
                  'bg-[#c89b3c]/10 text-[#c89b3c]'
                }`}>
                  {paper.source === 'google_scholar' ? 'Scholar' : paper.source === 'arxiv' ? 'arXiv' : 'S2'}
                </span>
              </div>
              <p className="text-xs text-[#c8bfa8]/60 mt-1.5">
                {paper.authors?.slice(0, 5).join(', ')}{paper.authors?.length > 5 ? ' et al.' : ''}
              </p>
              <p className="text-xs text-[#c8bfa8]/70 mt-1">
                {paper.venue} &middot; {paper.year} &middot; {paper.citation_count} citations
              </p>
              {paper.abstract && (
                <p className="text-xs text-[#666] dark:text-[#bbb] mt-3 line-clamp-3 leading-relaxed">{paper.abstract}</p>
              )}
              {paper.fields_of_study?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {paper.fields_of_study.map((field, j) => (
                    <span key={j} className="text-[10px] bg-[#f5f5f4] dark:bg-[#333] text-[#c8bfa8]/60 px-2 py-0.5 rounded-full border border-[#1c2f42]">
                      {field}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
