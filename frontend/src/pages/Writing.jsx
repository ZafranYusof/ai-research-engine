import { useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

const SECTION_TYPES = [
  { value: 'introduction', label: 'Introduction' },
  { value: 'literature_review', label: 'Literature Review' },
  { value: 'methodology', label: 'Methodology' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'conclusion', label: 'Conclusion' },
]

export default function Writing() {
  const { projectId } = useParams()
  const [sectionType, setSectionType] = useState('literature_review')
  const [maxWords, setMaxWords] = useState(2000)
  const [generated, setGenerated] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/writing/generate', {
        section_type: sectionType,
        project_id: projectId,
        max_words: maxWords,
        style: 'APA',
      })
      setGenerated(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">✍️ Generate Writing</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Section Type</label>
            <select
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100"
            >
              {SECTION_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Words</label>
            <input
              type="number"
              value={maxWords}
              onChange={(e) => setMaxWords(parseInt(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-white py-3 rounded-lg font-medium"
          >
            {loading ? 'Generating...' : 'Generate Section'}
          </button>

          {/* Review Score */}
          {generated?.review && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Quality Review</h3>
              <div className="text-2xl font-bold text-emerald-400">
                {generated.review.score}/10
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {generated.review.pass ? '✅ Passed' : '⚠️ Needs revision'}
              </p>
              {generated.review.suggestions?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {generated.review.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-yellow-400">• {s}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Generated Content */}
        <div className="col-span-2">
          {generated ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Generated {sectionType.replace(/_/g, ' ')}</h2>
                <span className="text-sm text-gray-500">{generated.word_count} words</span>
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{generated.content}</ReactMarkdown>
              </div>
              {generated.citations?.length > 0 && (
                <div className="mt-6 border-t border-gray-800 pt-4">
                  <h3 className="font-medium mb-2">References Used ({generated.citations.length})</h3>
                  <ul className="space-y-1 text-sm text-gray-400">
                    {generated.citations.map((c, i) => (
                      <li key={i}>{c.authors?.[0]} ({c.year}). {c.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Select a section type and click Generate
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
