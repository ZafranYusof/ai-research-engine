import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Plus, Clock, CheckCircle, AlertCircle, BookOpen, GitBranch, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [graphStats, setGraphStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [projectsRes, graphRes] = await Promise.all([
        axios.get('/api/research/list'),
        axios.get('/api/graph/stats'),
      ])
      setProjects(projectsRes.data.projects || [])
      setGraphStats(graphRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const completedCount = projects.filter(p => p.status === 'completed').length
  const activeCount = projects.filter(p => p.status === 'started').length

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Research Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Your AI-powered literature review workspace</p>
        </div>
        <Link
          to="/new"
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 font-medium"
        >
          <Plus size={18} />
          New Research
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-xs text-gray-500">Total Projects</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <GitBranch size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{graphStats?.total_nodes || 0}</p>
              <p className="text-xs text-gray-500">Graph Nodes</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projects */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-300">Recent Projects</h2>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading...
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-indigo-400" />
          </div>
          <p className="text-lg text-gray-300 mb-2">No research projects yet</p>
          <p className="text-sm text-gray-500 mb-6">Start by entering a research topic</p>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Plus size={18} />
            Create First Project
          </Link>
        </motion.div>
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
                className="block bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold line-clamp-2 flex-1 group-hover:text-indigo-300 transition-colors">
                    {project.topic}
                  </h3>
                  <div className="ml-3">
                    {project.status === 'completed' && <CheckCircle size={18} className="text-emerald-400" />}
                    {project.status === 'started' && <Clock size={18} className="text-amber-400 animate-pulse" />}
                    {project.status === 'failed' && <AlertCircle size={18} className="text-red-400" />}
                  </div>
                </div>

                {project.status === 'started' && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-800/50 rounded-full h-1.5">
                      <motion.div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(project.progress || 0) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">{Math.round((project.progress || 0) * 100)}% complete</p>
                  </div>
                )}

                {project.status === 'completed' && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                    <span className="text-xs text-gray-500">Click to explore →</span>
                  </div>
                )}

                {project.status === 'failed' && (
                  <p className="mt-3 text-xs text-red-400">Failed - click to retry</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
