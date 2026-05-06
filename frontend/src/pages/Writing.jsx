import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '../utils/toast'
import { Save, Check, Clock } from 'lucide-react'

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

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saving' | 'saved'
  const [lastSaved, setLastSaved] = useState(null)
  const [draftRestoreOffer, setDraftRestoreOffer] = useState(null)
  const saveTimerRef = useRef(null)
  const contentRef = useRef(null)

  // Check for existing draft on load / section change
  useEffect(() => {
    if (!projectId) return
    const checkDraft = async () => {
      try {
        const res = await api.get(`/api/writing/drafts/${projectId}/${sectionType}`)
        if (res.data.draft && res.data.draft.content) {
          setDraftRestoreOffer(res.data.draft)
        } else {
          setDraftRestoreOffer(null)
        }
      } catch {
        setDraftRestoreOffer(null)
      }
    }
    checkDraft()
  }, [projectId, sectionType])

  // Auto-save debounced (30s after content changes)
  useEffect(() => {
    if (!generated?.content || !projectId) return

    // Track content changes
    if (contentRef.current === generated.content) return
    contentRef.current = generated.content

    // Clear existing timer
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    // Set new 30s timer
    saveTimerRef.current = setTimeout(() => {
      saveDraft()
    }, 30000)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [generated?.content, projectId])

  const saveDraft = useCallback(async () => {
    if (!generated?.content || !projectId) return
    setSaveStatus('saving')
    try {
      const res = await api.post('/api/writing/drafts/save', {
        project_id: projectId,
        section_type: sectionType,
        content: generated.content,
        citations: generated.citations || [],
        word_count: generated.word_count || 0,
      })
      setSaveStatus('saved')
      setLastSaved(new Date())
      // Reset to null after 3s
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      setSaveStatus(null)
      console.error('Draft save failed:', err)
    }
  }, [generated, projectId, sectionType])

  const restoreDraft = () => {
    if (!draftRestoreOffer) return
    setGenerated({
      content: draftRestoreOffer.content,
      citations: draftRestoreOffer.citations || [],
      word_count: draftRestoreOffer.word_count || 0,
    })
    contentRef.current = draftRestoreOffer.content
    setLastSaved(new Date(draftRestoreOffer.updated_at))
    setDraftRestoreOffer(null)
    toast.success('Draft restored!')
  }

  const dismissDraft = () => {
    setDraftRestoreOffer(null)
  }

  const getTimeSince = (date) => {
    if (!date) return ''
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const endpoint = iterative ? '/api/writing/generate-iterative' : '/api/writing/generate'
      const res = await api.post(endpoint, {
        section_type: sectionType,
        project_id: projectId,
        max_words: maxWords,
        style: 'APA',
      })
      setGenerated(res.data)
      setDraftRestoreOffer(null)
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
      const res = await api.post('/api/writing/revise', {
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
        const res = await api.post('/api/writing/export', {
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
        const res = await api.post('/api/writing/export', {
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
      toast.success('Downloaded!')
    } catch (err) {
      toast.error('Export failed')
      console.error(err)
    }
  }

  const review = generated?.final_review || generated?.review

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2 dark:text-white">Academic Writing</h1>
        <p className="text-[#888] text-sm mb-8">Generate publication-ready sections with AI critique and revision.</p>

        {/* Draft restore offer */}
        <AnimatePresence>
          {draftRestoreOffer && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 bg-[#2563eb]/5 border border-[#2563eb]/20 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2563eb]/10 rounded-lg flex items-center justify-center">
                  <Save size={16} className="text-[#2563eb]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a] dark:text-[#e5e5e5]">Draft found</p>
                  <p className="text-xs text-[#888]">
                    {draftRestoreOffer.word_count} words · Last saved {getTimeSince(draftRestoreOffer.updated_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={dismissDraft}
                  className="px-3 py-1.5 text-xs text-[#888] hover:text-[#555] dark:text-[#ccc] transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={restoreDraft}
                  className="px-4 py-1.5 bg-[#2563eb] text-white text-xs font-medium rounded-lg hover:bg-[#1d4ed8] transition-all"
                >
                  Restore Draft
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-8">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#555] dark:text-[#ccc] mb-1.5">Section Type</label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
              >
                {SECTION_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#555] dark:text-[#ccc] mb-1.5">Max Words</label>
              <input
                type="number"
                value={maxWords}
                onChange={(e) => setMaxWords(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
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
              <label htmlFor="iterative" className="text-xs text-[#666] dark:text-[#bbb]">
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
                className="bg-white border border-[#eee] rounded-xl p-4 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
              >
                <h3 className="font-medium text-xs text-[#555] dark:text-[#ccc] mb-2">Quality Review</h3>
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
              <div className="bg-white border border-[#eee] rounded-xl p-4 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                <h3 className="font-medium text-xs text-[#555] dark:text-[#ccc] mb-2">Iterations: {generated.total_iterations}</h3>
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
              <div className="space-y-2 border-t border-[#eee] dark:border-[#333] pt-4 dark:border-[#2a2a2a]">
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
                      className="flex-1 bg-white border border-[#e5e5e5] rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] dark:bg-[#1a1a1a] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
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
                <div className="bg-white border border-[#eee] rounded-xl p-6 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-medium text-sm capitalize">
                      {sectionType.replace(/_/g, ' ')}
                    </h2>
                    <div className="flex items-center gap-3">
                      {/* Auto-save indicator */}
                      <AnimatePresence mode="wait">
                        {saveStatus === 'saving' && (
                          <motion.span
                            key="saving"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1.5 text-[10px] text-[#888]"
                          >
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="inline-block w-3 h-3 border border-[#ccc] border-t-[#2563eb] rounded-full"
                            />
                            Saving...
                          </motion.span>
                        )}
                        {saveStatus === 'saved' && (
                          <motion.span
                            key="saved"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1 text-[10px] text-[#059669]"
                          >
                            <Check size={12} />
                            Saved
                          </motion.span>
                        )}
                        {saveStatus === null && lastSaved && (
                          <motion.span
                            key="lastsaved"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-1 text-[10px] text-[#aaa]"
                          >
                            <Clock size={10} />
                            Last saved: {getTimeSince(lastSaved)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span className="text-xs text-[#aaa] font-mono">{generated.word_count} words</span>
                      {/* Manual save button */}
                      {projectId && (
                        <button
                          onClick={saveDraft}
                          className="p-1.5 rounded-lg hover:bg-[#f5f5f4] transition-colors dark:hover:bg-[#222]"
                          title="Save draft"
                        >
                          <Save size={14} className="text-[#888]" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none text-[#444] dark:text-[#ccc] leading-relaxed dark:text-[#ccc]">
                    <ReactMarkdown>{generated.content}</ReactMarkdown>
                  </div>

                  {generated.citations?.length > 0 && (
                    <div className="mt-6 border-t border-[#eee] dark:border-[#333] pt-4 dark:border-[#2a2a2a]">
                      <h3 className="font-medium text-xs text-[#555] dark:text-[#ccc] mb-2">References ({generated.citations.length})</h3>
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
                <div className="bg-white border border-[#eee] rounded-xl p-4 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                  <h3 className="font-medium text-xs text-[#555] dark:text-[#ccc] mb-2">Request Revision</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reviseInput}
                      onChange={(e) => setReviseInput(e.target.value)}
                      placeholder="e.g., Make it more concise, add more citations..."
                      className="flex-1 bg-[#fafaf9] border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all dark:bg-[#0f0f0f] dark:border-[#2a2a2a] dark:text-[#e5e5e5]"
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
              <div className="flex items-center justify-center h-96 bg-white border border-[#eee] rounded-xl dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                <div className="text-center">
                  <p className="text-3xl mb-3">✍️</p>
                  <p className="text-sm text-[#555] dark:text-[#ccc]">Select a section type and click Generate</p>
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
