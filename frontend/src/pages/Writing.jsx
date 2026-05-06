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
      if (exportFormat === 'docx') {
        const res = await axios.post('/api/writing/export', {
          sections,
          title: 'Research Paper',
          authors: [],
          format: 'docx',
        }, { responseType: 'blob' })
        const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'research_paper.docx'
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const res = await axios.post('/api/writing/export', {
          sections,
          title: 'Research Paper',
          authors: [],
          format: exportFormat,
        })
        const blob = new Blob([res.data.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const ext = exportFormat === 'latex' ? 'tex' : exportFormat === 'bibtex' ? 'bib' : 'md'
        a.download = `research_paper.${ext}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const review = generated?.final_review || generated?.review

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Academic Writing</h1>
        <p className="text-[#888] text-sm mb-8">Generate publication-ready sections with AI critique and revision.</p>

        <div className="grid grid-cols-3 gap-8">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Section Type</label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
              >
                {SECTION_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Max Words</label>
              <input
                type="number"
                value={maxWords}
                onChange={(e) => setMaxWords(parseInt(e.target.value))}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="iterative"
                checked={iterative}
                onChange={(e) => setIterative(e.target.checked)}
                className="rounded border-[#ddd] text-[#2563eb] focus:ring-[#2563eb]/20"
              />
              <label htmlFor="iterative" className="text-xs text-[#666]">
                Iterative refinement (auto-revise until quality passes)
              </label>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#333] disabled:bg-[#e5e5e5] disabled:text-[#999] disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-black/10 active:translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Generating...
                </span>
              ) : 'Generate Section →'}
            </button>

            {/* Review Score */}
            {review && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#eee] rounded-xl p-4"
              >
                <h3 className="font-medium text-xs text-[#555] mb-2">Quality Review</h3>
                <div className={`text-2xl font-bold ${review.score >= 7 ? 'text-[#059669]' : review.score >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                  {review.score}/10
                </div>
                <p className="text-xs text-[#888] mt-1">
                  {review.pass ? '✅ Passed' : '⚠️ Needs improvement'}
                </p>

                {review.dimensions && (
                  <div className="mt-3 space-y-1.5">
                    {Object.entries(review.dimensions).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[10px]">
                        <span className="text-[#888] capitalize">{key}</span>
                        <span className={val >= 7 ? 'text-[#059669] font-medium' : 'text-amber-500 font-medium'}>{val}/10</span>
                      </div>
                    ))}
                  </div>
                )}

                {review.suggestions?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-[#aaa] mb-1">Suggestions:</p>
                    {review.suggestions.map((s, i) => (
                      <p key={i} className="text-[10px] text-amber-600 leading-relaxed">• {s}</p>
                    ))}
                  </div>
                )}

                {review.strengths?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-[#aaa] mb-1">Strengths:</p>
                    {review.strengths.map((s, i) => (
                      <p key={i} className="text-[10px] text-[#059669] leading-relaxed">• {s}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Iterations info */}
            {generated?.iterations && (
              <div className="bg-white border border-[#eee] rounded-xl p-4">
                <h3 className="font-medium text-xs text-[#555] mb-2">Iterations: {generated.total_iterations}</h3>
                {generated.iterations.map((iter, i) => (
                  <div key={i} className="flex justify-between text-[10px] text-[#888] py-1">
                    <span>v{iter.version}</span>
                    <span>{iter.word_count} words</span>
                    <span className={iter.score >= 7 ? 'text-[#059669]' : 'text-amber-500'}>
                      {iter.score ? `${iter.score}/10` : '...'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Save & Export */}
            {generated && (
              <div className="space-y-2 border-t border-[#eee] pt-4">
                <button
                  onClick={handleSaveSection}
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 rounded-xl text-xs font-medium transition-all"
                >
                  Save Section ({sections.length} saved)
                </button>

                {sections.length > 0 && (
                  <div className="flex gap-2">
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="flex-1 bg-white border border-[#e5e5e5] rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#2563eb]"
                    >
                      <option value="markdown">Markdown</option>
                      <option value="docx">Word (.docx)</option>
                      <option value="latex">LaTeX</option>
                      <option value="bibtex">BibTeX</option>
                    </select>
                    <button
                      onClick={handleExport}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-xl text-xs font-medium transition-all"
                    >
                      Export
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
                <div className="bg-white border border-[#eee] rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-medium text-sm capitalize">
                      {sectionType.replace(/_/g, ' ')}
                    </h2>
                    <span className="text-xs text-[#aaa] font-mono">{generated.word_count} words</span>
                  </div>
                  <div className="prose prose-sm max-w-none text-[#444] leading-relaxed">
                    <ReactMarkdown>{generated.content}</ReactMarkdown>
                  </div>

                  {generated.citations?.length > 0 && (
                    <div className="mt-6 border-t border-[#eee] pt-4">
                      <h3 className="font-medium text-xs text-[#555] mb-2">References ({generated.citations.length})</h3>
                      <ul className="space-y-1">
                        {generated.citations.map((c, i) => (
                          <li key={i} className="text-[10px] text-[#888] leading-relaxed">
                            {c.authors?.slice(0, 3).join(', ')}{c.authors?.length > 3 ? ' et al.' : ''} ({c.year}). <em>{c.title}</em>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Revise input */}
                <div className="bg-white border border-[#eee] rounded-xl p-4">
                  <h3 className="font-medium text-xs text-[#555] mb-2">Request Revision</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reviseInput}
                      onChange={(e) => setReviseInput(e.target.value)}
                      placeholder="e.g., Make it more concise, add more citations..."
                      className="flex-1 bg-[#fafaf9] border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleRevise()}
                    />
                    <button
                      onClick={handleRevise}
                      disabled={loading || !reviseInput.trim()}
                      className="bg-[#d97706] hover:bg-[#b45309] disabled:bg-[#e5e5e5] disabled:text-[#999] text-white px-4 py-2 rounded-xl text-xs font-medium transition-all"
                    >
                      Revise
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-white border border-[#eee] rounded-xl">
                <div className="text-center">
                  <p className="text-3xl mb-3">✍️</p>
                  <p className="text-sm text-[#555]">Select a section type and click Generate</p>
                  <p className="text-xs text-[#aaa] mt-1.5">
                    Iterative mode will auto-revise until quality score ≥ 7/10
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
