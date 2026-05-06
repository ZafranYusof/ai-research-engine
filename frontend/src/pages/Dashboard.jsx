import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Plus, Clock, CheckCircle, AlertCircle, BookOpen, GitBranch, TrendingUp, Zap, Search, FileText, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Animated stat card
function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, shadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
      className="bg-white border border-[#eee] rounded-2xl p-5 hover:shadow-lg hover:shadow-black/5 transition-all cursor-default"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '10' }}
        >
          <Icon size={20} style={{ color }} />
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-2xl font-bold tracking-tight"
          >
            {value}
          </motion.p>
          <p className="text-[11px] text-[#999]">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Quick action card
function QuickAction({ icon: Icon, title, desc, to, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link
        to={to}
        className="block bg-white border border-[#eee] rounded-2xl p-5 hover:border-[#ddd] hover:shadow-lg hover:shadow-black/5 transition-all group"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 3 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: color + '10' }}
        >
          <Icon size={20} style={{ color }} />
        </motion.div>
        <h3 className="font-medium text-sm group-hover:text-[#2563eb] transition-colors">{title}</h3>
        <p className="text-xs text-[#999] mt-1">{desc}</p>
      </Link>
    </motion.div>
  )
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [graphStats, setGraphStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)

    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

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
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div>
      {/* Header with greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-start mb-8"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold tracking-tight"
          >
            {greeting}{user.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#888] text-sm mt-1"
          >
            Your research workspace
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/new"
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#333] transition-all hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={16} />
            New Research
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Projects" value={projects.length} color="#2563eb" delay={0.1} />
        <StatCard icon={CheckCircle} label="Completed" value={completedCount} color="#059669" delay={0.15} />
        <StatCard icon={GitBranch} label="Graph Nodes" value={graphStats?.total_nodes || 0} color="#7c3aed" delay={0.2} />
        <StatCard icon={Zap} label="In Progress" value={activeCount} color="#d97706" delay={0.25} />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={Plus} title="New Research" desc="Start a pipeline" to="/new" color="#2563eb" delay={0.35} />
          <QuickAction icon={Search} title="Search Papers" desc="Find literature" to="/search" color="#059669" delay={0.4} />
          <QuickAction icon={Upload} title="Upload PDF" desc="Parse papers" to="/pdf" color="#d97706" delay={0.45} />
          <QuickAction icon={GitBranch} title="Knowledge Graph" desc="Visualize network" to="/graph" color="#7c3aed" delay={0.5} />
        </div>
      </motion.div>

      {/* Projects */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium text-[#888] uppercase tracking-wider">Recent Projects</h2>
          {projects.length > 0 && (
            <span className="text-[10px] text-[#aaa] font-mono bg-[#f5f5f4] px-2 py-0.5 rounded-full">{projects.length} total</span>
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-16 bg-white border border-[#eee] rounded-2xl"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 bg-gradient-to-br from-[#2563eb]/10 to-[#7c3aed]/10 rounded-2xl flex items-center justify-center mx-auto mb-5"
            >
              <BookOpen size={28} className="text-[#2563eb]" />
            </motion.div>
            <p className="text-base font-medium mb-1">No projects yet</p>
            <p className="text-sm text-[#888] mb-6">Start by entering a research topic</p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#333] transition-all hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5"
            >
              <Plus size={16} />
              Create Your First Project
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  <Link
                    to={`/research/${project.id}`}
                    className="flex items-center gap-4 bg-white border border-[#eee] rounded-xl px-5 py-4 hover:border-[#ddd] hover:shadow-md hover:shadow-black/5 transition-all group hover:-translate-y-0.5"
                  >
                    {/* Status icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        project.status === 'completed' ? 'bg-emerald-50' :
                        project.status === 'started' ? 'bg-amber-50' : 'bg-red-50'
                      }`}
                    >
                      {project.status === 'completed' && <CheckCircle size={20} className="text-emerald-500" />}
                      {project.status === 'started' && (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                          <Clock size={20} className="text-amber-500" />
                        </motion.div>
                      )}
                      {project.status === 'failed' && <AlertCircle size={20} className="text-red-500" />}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate group-hover:text-[#2563eb] transition-colors">
                        {project.topic}
                      </h3>
                      {project.status === 'started' && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 max-w-[200px] bg-[#f0f0f0] rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] h-1.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(project.progress || 0) * 100}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                          <span className="text-[10px] text-[#999] font-mono">{Math.round((project.progress || 0) * 100)}%</span>
                        </div>
                      )}
                      {project.status === 'completed' && (
                        <p className="text-[10px] text-[#059669] mt-1 font-medium">Completed</p>
                      )}
                    </div>

                    {/* Arrow */}
                    <motion.svg
                      className="w-4 h-4 text-[#ccc] group-hover:text-[#2563eb] shrink-0"
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}
