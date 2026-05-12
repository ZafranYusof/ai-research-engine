import { useState, useCallback } from 'react'
import api from '../utils/api'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PDFUpload() {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedPaper, setSelectedPaper] = useState(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    setFiles(prev => [...prev, ...dropped])
  }, [])

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type === 'application/pdf')
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setLoading(true)
    setResults([])

    try {
      if (files.length === 1) {
        const formData = new FormData()
        formData.append('file', files[0])
        const res = await api.post('/api/pdf/parse-full', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setResults([{ filename: files[0].name, ...res.data, success: true }])
      } else {
        const formData = new FormData()
        files.forEach(f => formData.append('files', f))
        const res = await api.post('/api/pdf/batch-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setResults(res.data.parsed.map(p => ({ ...p, success: true })))
      }
    } catch (err) {
      console.error(err)
      setResults([{ filename: files[0]?.name, success: false, error: err.response?.data?.detail || 'Upload failed' }])
    } finally {
      setLoading(false)
    }
  }

  const viewPaper = async (index) => {
    if (results[index]?.full_text) {
      setSelectedPaper(results[index])
      return
    }
    // For batch results, re-parse the individual file
    const formData = new FormData()
    formData.append('file', files[index])
    try {
      const res = await api.post('/api/pdf/parse-full', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSelectedPaper({ filename: files[index].name, ...res.data })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2 dark:text-white">PDF Parser</h1>
        <p className="text-[#c8bfa8]/60 text-sm mb-8">Upload research papers to extract text, metadata, sections, and references.</p>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-2xl p-10 text-center dark:bg-[#11202f] transition-all cursor-pointer ${
            dragOver ? 'border-[#c89b3c] bg-[#c89b3c]/5' : 'border-[#e5e5e5] hover:border-[#ccc] bg-[#11202f] dark:bg-[#11202f]'
          }`}
          onClick={() => document.getElementById('pdf-input').click()}
        >
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload size={32} className={`mx-auto mb-3 ${dragOver ? 'text-[#c89b3c]' : 'text-[#c8bfa8]/50'}`} />
          <p className="text-sm text-[#c8bfa8] dark:text-[#c8bfa8]/50">Drop PDF files here or click to browse</p>
          <p className="text-xs text-[#c8bfa8]/70 mt-1">Max 50MB per file, up to 10 files</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-[#c8bfa8] dark:text-[#c8bfa8]/50 uppercase tracking-wider">
                Files ({files.length})
              </h2>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-[#c8bfa8]/50 hover:text-[#c8bfa8] dark:text-[#c8bfa8]/50 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {files.map((file, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-xl px-4 py-3"
                >
                  <FileText size={16} className="text-[#c89b3c] shrink-0" />
                  <span className="text-sm text-[#333] dark:text-[#c8bfa8]/40 truncate flex-1">{file.name}</span>
                  <span className="text-[10px] text-[#c8bfa8]/70 font-mono shrink-0">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                  <button onClick={() => removeFile(i)} className="text-[#c8bfa8]/50 hover:text-[#c8bfa8]/60 transition-colors shrink-0">
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full bg-[#11202f] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#333] disabled:bg-[#e5e5e5] disabled:text-[#c8bfa8]/50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-black/10 active:translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Parsing...
                </span>
              ) : `Parse ${files.length} PDF${files.length > 1 ? 's' : ''} →`}
            </button>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && !selectedPaper && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h2 className="text-xs font-medium text-[#c8bfa8] dark:text-[#c8bfa8]/50 uppercase tracking-wider mb-3">Results</h2>
              <div className="space-y-3">
                {results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-xl p-5 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => viewPaper(i)}
                  >
                    {result.success ? (
                      <>
                        <div className="flex items-start gap-3">
                          <CheckCircle size={16} className="text-[#059669] mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {result.metadata?.title || result.title || result.filename}
                            </h3>
                            {(result.metadata?.authors || result.authors)?.length > 0 && (
                              <p className="text-xs text-[#c8bfa8]/60 mt-1">
                                {(result.metadata?.authors || result.authors).slice(0, 3).join(', ')}
                                {(result.metadata?.authors || result.authors).length > 3 ? ' et al.' : ''}
                                {(result.metadata?.year || result.year) && ` (${result.metadata?.year || result.year})`}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-[10px] text-[#c8bfa8]/70">
                              <span>{result.sections_count || result.sections?.length || 0} sections</span>
                              <span>{result.references_count || result.references?.length || 0} references</span>
                              <span>{result.word_count?.toLocaleString()} words</span>
                              <span>{result.metadata?.pages || result.pages} pages</span>
                            </div>
                          </div>
                        </div>
                        {(result.metadata?.abstract || result.abstract) && (
                          <p className="text-xs text-[#666] dark:text-[#bbb] mt-3 line-clamp-2 leading-relaxed pl-7">
                            {result.metadata?.abstract || result.abstract}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{result.filename}</p>
                          <p className="text-xs text-red-500 mt-0.5">{result.error}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paper Detail View */}
        <AnimatePresence>
          {selectedPaper && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8"
            >
              <button
                onClick={() => setSelectedPaper(null)}
                className="text-xs text-[#c8bfa8]/60 hover:text-[#c8bfa8] dark:text-[#c8bfa8]/50 mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back to results
              </button>

              <div className="bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-xl p-6 mb-4">
                <h2 className="font-semibold text-lg">{selectedPaper.metadata?.title}</h2>
                {selectedPaper.metadata?.authors?.length > 0 && (
                  <p className="text-sm text-[#c8bfa8]/60 mt-1">
                    {selectedPaper.metadata.authors.join(', ')}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-[#c8bfa8]/70">
                  {selectedPaper.metadata?.year && <span>📅 {selectedPaper.metadata.year}</span>}
                  {selectedPaper.metadata?.doi && <span>🔗 {selectedPaper.metadata.doi}</span>}
                  <span>📄 {selectedPaper.metadata?.pages} pages</span>
                  <span>📝 {selectedPaper.word_count?.toLocaleString()} words</span>
                </div>
                {selectedPaper.metadata?.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedPaper.metadata.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] bg-[#c89b3c]/5 text-[#c89b3c] px-2 py-0.5 rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sections */}
              {selectedPaper.sections?.length > 0 && (
                <div className="bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-xl p-6 mb-4">
                  <h3 className="text-xs font-medium text-[#c8bfa8] dark:text-[#c8bfa8]/50 uppercase tracking-wider mb-4">
                    Sections ({selectedPaper.sections.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedPaper.sections.map((section, i) => (
                      <div key={i} className="border-l-2 border-[#1c2f42] pl-4">
                        <h4 className={`font-medium text-sm ${section.level === 1 ? 'text-[#f5efe0]' : 'text-[#c8bfa8] dark:text-[#c8bfa8]/50'}`}>
                          {section.heading}
                        </h4>
                        <p className="text-xs text-[#c8bfa8]/60 mt-1 line-clamp-3 leading-relaxed">
                          {section.content.slice(0, 300)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {selectedPaper.references?.length > 0 && (
                <div className="bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-xl p-6">
                  <h3 className="text-xs font-medium text-[#c8bfa8] dark:text-[#c8bfa8]/50 uppercase tracking-wider mb-4">
                    References ({selectedPaper.references.length})
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {selectedPaper.references.map((ref, i) => (
                      <p key={i} className="text-xs text-[#666] dark:text-[#bbb] leading-relaxed">
                        <span className="text-[#c8bfa8]/70 font-mono mr-2">[{i + 1}]</span>
                        {ref}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
