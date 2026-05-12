import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity as ActivityIcon,
  Search,
  BookOpen,
  FileText,
  Upload,
  Shield,
  Users,
  Sparkles,
  Clock,
  Filter,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import api from '../utils/api'

const ACTION_CONFIG = {
  research_started: {
    icon: BookOpen,
    color: 'text-[#c89b3c]',
    bg: 'bg-[#c89b3c]/10',
    label: 'Started Research',
  },
  research_completed: {
    icon: Sparkles,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    label: 'Research Completed',
  },
  paper_searched: {
    icon: Search,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    label: 'Paper Search',
  },
  draft_saved: {
    icon: FileText,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    label: 'Draft Saved',
  },
  draft_exported: {
    icon: FileText,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    label: 'Document Exported',
  },
  pdf_uploaded: {
    icon: Upload,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    label: 'PDF Uploaded',
  },
  plagiarism_checked: {
    icon: Shield,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    label: 'Plagiarism Check',
  },
  collaborator_added: {
    icon: Users,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    label: 'Collaborator Added',
  },
}

function getRelativeTime(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function Activity() {
  const [activities, setActivities] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)

  const userEmail = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.email || ''
    } catch {
      return ''
    }
  })()

  const fetchChart = useCallback(async () => {
    try {
      const res = await api.get('/api/activity/chart', {
        params: { user_email: userEmail, days: 30 },
      })
      setChartData(res.data.stats || [])
    } catch (err) {
      console.error('Failed to load chart:', err)
    }
  }, [userEmail])

  const fetchActivities = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset
    if (reset) setLoading(true)
    else setLoadingMore(true)

    try {
      const res = await api.get('/api/activity/timeline', {
        params: { user_email: userEmail, limit: 20, offset: currentOffset },
      })
      const newActivities = res.data.activities || []
      if (reset) {
        setActivities(newActivities)
        setOffset(20)
      } else {
        setActivities((prev) => [...prev, ...newActivities])
        setOffset((prev) => prev + 20)
      }
      setHasMore(newActivities.length === 20)
    } catch (err) {
      console.error('Failed to load activities:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [userEmail, offset])

  useEffect(() => {
    fetchChart()
    fetchActivities(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredActivities =
    filter === 'all'
      ? activities
      : activities.filter((a) => a.action === filter)

  const maxCount = Math.max(...chartData.map((d) => d.count), 1)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold dark:text-white flex items-center gap-3">
          <ActivityIcon size={24} className="text-[#c89b3c]" />
          Activity
        </h1>
        <p className="text-sm text-[#c8bfa8]/60 mt-1">Your research timeline and activity history</p>
      </motion.div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-xl p-6 mb-6"
      >
        <h2 className="text-sm font-medium text-[#c8bfa8]/60 mb-4">Last 30 Days</h2>
        <div className="flex items-end gap-[3px] h-32">
          {chartData.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ height: 0 }}
              animate={{ height: day.count > 0 ? `${(day.count / maxCount) * 100}%` : '4px' }}
              transition={{ delay: i * 0.02, duration: 0.4, ease: 'easeOut' }}
              className={`flex-1 rounded-sm ${
                day.count > 0
                  ? 'bg-[#c89b3c]'
                  : 'bg-[#1c2f42]'
              }`}
              title={`${day.date}: ${day.count} activities`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[#c8bfa8]/70">
          <span>{chartData[0]?.date || ''}</span>
          <span>{chartData[chartData.length - 1]?.date || ''}</span>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-4"
      >
        <h2 className="text-sm font-medium dark:text-white">Timeline</h2>
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-lg text-[#666] dark:text-[#bbb] hover:border-[#ccc] dark:hover:border-[#444] transition-colors"
          >
            <Filter size={12} />
            {filter === 'all' ? 'All Activities' : ACTION_CONFIG[filter]?.label || filter}
            <ChevronDown size={12} />
          </button>
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-full mt-1 bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-xl shadow-lg z-10 py-1 min-w-[180px]"
              >
                <button
                  onClick={() => { setFilter('all'); setFilterOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f5f5f5] dark:hover:bg-[#1c2f42] transition-colors ${
                    filter === 'all' ? 'text-[#c89b3c] font-medium' : 'text-[#666] dark:text-[#bbb]'
                  }`}
                >
                  All Activities
                </button>
                {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => { setFilter(key); setFilterOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f5f5f5] dark:hover:bg-[#1c2f42] transition-colors flex items-center gap-2 ${
                      filter === key ? 'text-[#c89b3c] font-medium' : 'text-[#666] dark:text-[#bbb]'
                    }`}
                  >
                    <config.icon size={12} className={config.color} />
                    {config.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#c8bfa8]/60" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <ActivityIcon size={48} className="mx-auto text-[#c8bfa8]/50 dark:text-[#444] mb-4" />
          <p className="text-[#c8bfa8]/60 text-sm">No activities yet</p>
          <p className="text-[#c8bfa8]/70 text-xs mt-1">Start researching to see your timeline</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredActivities.map((activity, i) => {
              const config = ACTION_CONFIG[activity.action] || {
                icon: Clock,
                color: 'text-[#c8bfa8]/60',
                bg: 'bg-gray-500/10',
                label: activity.action,
              }
              const Icon = config.icon

              return (
                <motion.div
                  key={`${activity.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-xl p-4 flex items-center gap-4"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-white truncate">
                      {activity.details}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#c8bfa8]/60">{config.label}</span>
                      {activity.project_id && (
                        <Link
                          to={`/research/${activity.project_id}`}
                          className="text-[11px] text-[#c89b3c] hover:underline"
                        >
                          View project →
                        </Link>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#c8bfa8]/70 whitespace-nowrap">
                    {getRelativeTime(activity.timestamp)}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Load More */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center pt-4"
            >
              <button
                onClick={() => fetchActivities(false)}
                disabled={loadingMore}
                className="px-4 py-2 text-xs bg-[#11202f] dark:bg-[#11202f] border border-[#1c2f42] dark:border-[#1c2f42] rounded-lg text-[#666] dark:text-[#bbb] hover:border-[#ccc] dark:hover:border-[#444] transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Load more'
                )}
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
