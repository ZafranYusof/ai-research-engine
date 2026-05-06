import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Plus, Clock, CheckCircle, AlertCircle, BookOpen, GitBranch, TrendingUp, Zap } from 'lucide-react'
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
        api.get('/api/research/list'),
        api.get('/api/graph/stats'),
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
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[#888] text-sm mt-1">Your research workspace</p>
        </div>
        <Link
          to="/new"
          className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#333] transition-all hover:shadow-lg hover:shadow-black/10"
        >
          <Plus size={16} />
          New Research
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Projects', value: projects.length, color: '#2563eb' },
          { icon: CheckCircle, label: 'Completed', value: completedCount, color: '#059669' },
          { icon: GitBranch, label: 'Graph Nodes', value: graphStats?.total_nodes || 0, color: '#7c3aed' },
          { icon: Zap, label: 'In Progress', value: activeCount, color: '#d97706' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-[#eee] rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '10' }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-[#999]">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Projects */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[#555] uppercase tracking-wider">Projects</h2>
        {projects.length > 0 && (
          <span className="text-xs text-[#999] font-mono">{projects.length} total</span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#999]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-[#e5e5e5] border-t-[#2563eb] rounded-full mx-auto mb-3"
          />
          <p className="text-sm">Loading...</p>
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white border border-[#eee] rounded-2xl"
        >
          <div className="w-14 h-14 bg-[#2563eb]/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookOpen size={24} className="text-[#2563eb]" />
          </div>
          <p className="text-base font-medium mb-1">No projects yet</p>
          <p className="text-sm text-[#888] mb-6">Start by entering a research topic</p>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#333] transition-all"
          >
            <Plus size={16} />
            Create Project
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/research/${project.id}`}
                className="flex items-center gap-4 bg-white border border-[#eee] rounded-xl px-5 py-4 hover:border-[#ddd] hover:shadow-sm transition-all group"
              >
                {/* Status icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  project.status === 'completed' ? 'bg-emerald-50' :
                  project.status === 'started' ? 'bg-amber-50' : 'bg-red-50'
                }`}>
                  {project.status === 'completed' && <CheckCircle size={18} className="text-emerald-500" />}
                  {project.status === 'started' && <Clock size={18} className="text-amber-500" />}
                  {project.status === 'failed' && <AlertCircle size={18} className="text-red-500" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate group-hover:text-[#2563eb] transition-colors">
                    {project.topic}
                  </h3>
                  {project.status === 'started' && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 max-w-[200px] bg-[#f0f0f0] rounded-full h-1.5">
                        <div
                          className="bg-[#2563eb] h-1.5 rounded-full transition-all"
                          style={{ width: `${(project.progress || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#999] font-mono">{Math.round((project.progress || 0) * 100)}%</span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-[#ccc] group-hover:text-[#888] group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
