import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { motion } from 'framer-motion'

export default function NewResearch() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    topic: '',
    maxPapers: 50,
    yearFrom: 2019,
    yearTo: 2026,
    focusAreas: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/api/research/start', {
        topic: form.topic,
        max_papers: form.maxPapers,
        year_from: form.yearFrom,
        year_to: form.yearTo,
        focus_areas: form.focusAreas.split(',').map(s => s.trim()).filter(Boolean),
      })

      navigate(`/research/${response.data.project_id}`)
    } catch (error) {
      console.error('Failed to start research:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2">New Research Project</h1>
        <p className="text-[#888] text-sm mb-8">Define your research topic and let AI find, analyze, and synthesize the literature.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#555] mb-1.5">Research Topic</label>
            <textarea
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g., The impact of transformer architectures on natural language understanding tasks"
              className="w-full bg-white border border-[#e5e5e5] rounded-xl p-4 text-sm text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1.5">Year From</label>
              <input
                type="number"
                value={form.yearFrom}
                onChange={(e) => setForm({ ...form, yearFrom: parseInt(e.target.value) })}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1.5">Year To</label>
              <input
                type="number"
                value={form.yearTo}
                onChange={(e) => setForm({ ...form, yearTo: parseInt(e.target.value) })}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#555] mb-1.5">Max Papers to Analyze</label>
            <input
              type="number"
              value={form.maxPapers}
              onChange={(e) => setForm({ ...form, maxPapers: parseInt(e.target.value) })}
              min={10}
              max={200}
              className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#555] mb-1.5">Focus Areas (comma separated)</label>
            <input
              type="text"
              value={form.focusAreas}
              onChange={(e) => setForm({ ...form, focusAreas: e.target.value })}
              placeholder="e.g., attention mechanisms, pre-training, fine-tuning"
              className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.topic}
            className="w-full bg-[#1a1a1a] text-white font-medium py-3.5 rounded-xl hover:bg-[#333] disabled:bg-[#e5e5e5] disabled:text-[#999] disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-black/10 active:translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Starting Pipeline...
              </span>
            ) : 'Start Research →'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
