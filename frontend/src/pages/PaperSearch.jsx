import { useState } from 'react'
import axios from 'axios'
import { Search } from 'lucide-react'

export default function PaperSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await axios.post('/api/papers/search', {
        query,
        max_results: 20,
      })
      setResults(res.data.papers)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Search Papers</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search academic papers..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="space-y-4">
        {results.map((paper, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors">
            <h3 className="font-semibold text-lg">{paper.title}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {paper.authors?.slice(0, 5).join(', ')}{paper.authors?.length > 5 ? ' et al.' : ''}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {paper.venue} • {paper.year} • {paper.citation_count} citations
            </p>
            {paper.abstract && (
              <p className="text-sm text-gray-300 mt-3 line-clamp-3">{paper.abstract}</p>
            )}
            <div className="flex gap-2 mt-3">
              {paper.fields_of_study?.map((field, j) => (
                <span key={j} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                  {field}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
