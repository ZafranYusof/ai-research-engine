import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Plus, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
    const interval = setInterval(loadProjects, 5000) // Poll for updates
    return () => clearInterval(interval)
  }, [])

  const loadProjects = async () => {
    try {
      const res = await axios.get('/api/research/list')
      setProjects(res.data.projects || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-emerald-400" />
      case 'started': return <Clock size={16} className="text-yellow-400 animate-pulse" />
      case 'failed': return <AlertCircle size={16} className="text-red-400" />
      default: return <Clock size={16} className="text-gray-400" />
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Research Projects</h1>
          <p className="text-gray-400 mt-1">Your AI-powered literature reviews</p>
        </div>
        <Link
          to="/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          New Research
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-lg">No research projects yet</p>
          <p className="mt-2 text-sm">Start by creating a new research topic</p>
          <Link
            to="/new"
            className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/research/${project.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1">{project.topic}</h3>
                  {getStatusIcon(project.status)}
                </div>

                <div className="mt-4">
                  {project.status === 'started' && (
                    <div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(project.progress || 0) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{Math.round((project.progress || 0) * 100)}%</p>
                    </div>
                  )}
                  {project.status === 'completed' && (
                    <span className="text-xs text-emerald-400">✅ Ready to explore</span>
                  )}
                  {project.status === 'failed' && (
                    <span className="text-xs text-red-400">❌ Failed</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
