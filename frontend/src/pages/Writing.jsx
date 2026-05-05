import { useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'

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
  const [iterative, setIterative] = useState(true)
  const [generated, setGenerated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reviseInput, setReviseInput] = useState('')
  const [sections, setSections] = useState([])
  const [exportFormat, setExportFormat] = useState('markdown')

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const endpoint = iterative ? '/api/writing/generate-iterative' : '/api/writing/generate'
      const res = await axios.post(endpoint, {
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

  const handleRevise = async () => {
    if (!reviseInput.trim() || !generated) return
    setLoading(true)
    try {
      const res = await axios.post('/api/writing/revise', {
        content: generated.content,
        feedback: reviseInput,
        section_type: sectionType,
      })
      setGenerated({
        ...generated,
        content: res.data.revised_content,
        word_count: res.data.word_count,
        review: res.data.review,
        final_review: res.data.review,
      })
      setReviseInput('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSection = () => {
    if (!generated) return
    setSections([...sections, {
      section_type: sectionType,
      content: generated.content,
      citations: generated.citations || [],
    }])
  }

  const handleExport = async () => {
    if (sections.length === 0) return
    try {
      const res = await axios.post('/api/writing/export', {
        sections,
        title: 'Research Paper',
        authors: [],
        format: exportFormat,
      })
      // Download as file
      const blob = new Blob([res.data.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ext = exportFormat === 'latex' ? 'tex' : exportFormat === 'bibtex' ? 'bib' : 'md'
      a.download = `research_paper.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  const review = generated?.final_review || generated?.review

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">✍️ Academic Writing</h1>

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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="iterative"
              checked={iterative}
              onChange={(e) => setIterative(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="iterative" className="text-sm text-gray-300">
              Iterative refinement (auto-revise until quality passes)
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-white py-3 rounded-lg font-medium"
          >
            {loading ? '⏳ Generating...' : '🚀 Generate Section'}
          </button>

          {/* Review Score */}
          {review && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4"
            >
              <h3 className="font-medium mb-2">Quality Review</h3>
              <div className={`text-3xl font-bold ${review.score >= 7 ? 'text-emerald-400' : review.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {review.score}/10
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {review.pass ? '✅ Passed' : '⚠️ Needs improvement'}
              </p>

              {/* Dimension scores */}
              {review.dimensions && (
                <div className="mt-3 space-y-1">
                  {Object.entries(review.dimensions).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-400 capitalize">{key}</span>
                      <span className={val >= 7 ? 'text-emerald-400' : 'text-yellow-400'}>{val}/10</span>
                    </div>
                  ))}
                </div>
              )}

              {review.suggestions?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                  {review.suggestions.map((s, i) => (
                    <p key={i} className="text-xs text-yellow-400">• {s}</p>
                  ))}
                </div>
              )}

              {review.strengths?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Strengths:</p>
                  {review.strengths.map((s, i) => (
                    <p key={i} className="text-xs text-emerald-400">• {s}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Iterations info */}
          {generated?.iterations && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2 text-sm">Iterations: {generated.total_iterations}</h3>
              {generated.iterations.map((iter, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-400 py-1">
                  <span>v{iter.version}</span>
                  <span>{iter.word_count} words</span>
                  <span className={iter.score >= 7 ? 'text-emerald-400' : 'text-yellow-400'}>
                    {iter.score ? `${iter.score}/10` : '...'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Save & Export */}
          {generated && (
            <div className="space-y-2 border-t border-gray-800 pt-4">
              <button
                onClick={handleSaveSection}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
              >
                💾 Save Section ({sections.length} saved)
              </button>

              {sections.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-100"
                  >
                    <option value="markdown">Markdown</option>
                    <option value="latex">LaTeX</option>
                    <option value="bibtex">BibTeX</option>
                  </select>
                  <button
                    onClick={handleExport}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    📥 Export
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generated Content */}
        <div className="col-span-2">
          {generated ? (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg capitalize">
                    {sectionType.replace(/_/g, ' ')}
                  </h2>
                  <span className="text-sm text-gray-500">{generated.word_count} words</span>
                </div>
                <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                  <ReactMarkdown>{generated.content}</ReactMarkdown>
                </div>

                {generated.citations?.length > 0 && (
                  <div className="mt-6 border-t border-gray-800 pt-4">
                    <h3 className="font-medium mb-2 text-sm">References ({generated.citations.length})</h3>
                    <ul className="space-y-1 text-xs text-gray-400">
                      {generated.citations.map((c, i) => (
                        <li key={i}>
                          {c.authors?.slice(0, 3).join(', ')}{c.authors?.length > 3 ? ' et al.' : ''} ({c.year}). <em>{c.title}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Revise input */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-sm">✏️ Request Revision</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviseInput}
                    onChange={(e) => setReviseInput(e.target.value)}
                    placeholder="e.g., Make it more concise, add more citations, strengthen the argument..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleRevise()}
                  />
                  <button
                    onClick={handleRevise}
                    disabled={loading || !reviseInput.trim()}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Revise
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <p className="text-4xl mb-4">✍️</p>
                <p>Select a section type and click Generate</p>
                <p className="text-sm mt-2 text-gray-600">
                  Iterative mode will auto-revise until quality score ≥ 7/10
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
