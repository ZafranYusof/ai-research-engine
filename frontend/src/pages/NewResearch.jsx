import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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
      const response = await axios.post('/api/research/start', {
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
      <h1 className="text-3xl font-bold mb-2">New Research Project</h1>
      <p className="text-gray-400 mb-8">Define your research topic and let AI find, analyze, and synthesize the literature.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Research Topic</label>
          <textarea
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="e.g., The impact of transformer architectures on natural language understanding tasks"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none min-h-[100px]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Year From</label>
            <input
              type="number"
              value={form.yearFrom}
              onChange={(e) => setForm({ ...form, yearFrom: parseInt(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Year To</label>
            <input
              type="number"
              value={form.yearTo}
              onChange={(e) => setForm({ ...form, yearTo: parseInt(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Max Papers to Analyze</label>
          <input
            type="number"
            value={form.maxPapers}
            onChange={(e) => setForm({ ...form, maxPapers: parseInt(e.target.value) })}
            min={10}
            max={200}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Focus Areas (comma separated)</label>
          <input
            type="text"
            value={form.focusAreas}
            onChange={(e) => setForm({ ...form, focusAreas: e.target.value })}
            placeholder="e.g., attention mechanisms, pre-training, fine-tuning"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.topic}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Starting Research Pipeline...' : '🚀 Start Research'}
        </button>
      </form>
    </div>
  )
}
