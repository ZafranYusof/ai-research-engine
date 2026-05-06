import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Trash2, Users } from 'lucide-react'
import api from '../utils/api'
import { toast } from '../utils/toast'

export default function ShareModal({ isOpen, onClose, projectId }) {
  const [email, setEmail] = useState('')
  const [collaborators, setCollaborators] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && projectId) {
      loadCollaborators()
    }
  }, [isOpen, projectId])

  const loadCollaborators = async () => {
    try {
      const res = await api.get(`/api/research/${projectId}/collaborators`)
      setCollaborators(res.data.collaborators || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await api.post(`/api/research/${projectId}/share`, { email: email.trim() })
      setCollaborators(prev => [...prev, email.trim()])
      setEmail('')
      toast.success(`Added ${email.trim()}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add collaborator')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (emailToRemove) => {
    try {
      await api.delete(`/api/research/${projectId}/share/${encodeURIComponent(emailToRemove)}`)
      setCollaborators(prev => prev.filter(e => e !== emailToRemove))
      toast.success(`Removed ${emailToRemove}`)
    } catch (err) {
      toast.error('Failed to remove collaborator')
    }
  }

  const getInitials = (email) => {
    const name = email.split('@')[0]
    return name.slice(0, 2).toUpperCase()
  }

  const getColor = (email) => {
    const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2']
    let hash = 0
    for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333] rounded-2xl shadow-2xl w-full max-w-md p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#2563eb]" />
              <h2 className="font-semibold text-lg dark:text-white">Share Project</h2>
            </div>
            <button onClick={onClose} className="text-[#ccc] hover:text-[#888] dark:text-[#555] dark:hover:text-[#aaa] transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Add collaborator */}
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@university.edu"
              className="flex-1 bg-white dark:bg-[#111] border border-[#e5e5e5] dark:border-[#333] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all placeholder:text-[#ccc] dark:text-white dark:placeholder:text-[#555]"
            />
            <motion.button
              type="submit"
              disabled={loading || !email.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#2563eb] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] disabled:bg-[#e5e5e5] disabled:text-[#999] transition-all flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              Add
            </motion.button>
          </form>

          {/* Collaborators list */}
          <div>
            <p className="text-xs text-[#888] uppercase tracking-wider font-medium mb-3">
              Collaborators ({collaborators.length})
            </p>

            {collaborators.length === 0 ? (
              <p className="text-sm text-[#aaa] dark:text-[#555] text-center py-6">
                No collaborators yet. Add someone by email.
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {collaborators.map((collab, i) => (
                  <motion.div
                    key={collab}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 bg-[#f8f8f8] dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-xl px-3 py-2.5"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: getColor(collab) }}
                    >
                      {getInitials(collab)}
                    </div>
                    <span className="text-sm text-[#333] dark:text-[#ccc] truncate flex-1">{collab}</span>
                    <button
                      onClick={() => handleRemove(collab)}
                      className="text-[#ccc] hover:text-red-500 dark:text-[#555] dark:hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
