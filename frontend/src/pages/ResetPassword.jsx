import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import { toast } from '../utils/toast'
import { CheckCircle, Lock } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [focused, setFocused] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { token, new_password: form.password })
      setDone(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Reset failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0b1626] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
          <p className="text-[#c8bfa8]/60 text-sm mb-4">No reset token found in the URL.</p>
          <Link to="/forgot-password" className="text-[#c89b3c] text-sm font-medium hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1626] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="flex items-center gap-2 mb-10">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
            <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
            <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
          </svg>
          <span className="text-lg font-semibold tracking-tight">ResearchAI</span>
        </Link>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#c89b3c]/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#c89b3c]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">New password</h1>
                  <p className="text-[#c8bfa8]/60 text-xs">Choose a strong password</p>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 overflow-hidden"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c8bfa8] mb-1.5">New Password</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      className="w-full bg-[#11202f] border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#c89b3c] transition-all placeholder:text-[#c8bfa8]/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#c8bfa8] mb-1.5">Confirm Password</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focused === 'confirm' ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      onFocus={() => setFocused('confirm')}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      className="w-full bg-[#11202f] border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#c89b3c] transition-all placeholder:text-[#c8bfa8]/50"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#11202f] text-white py-3.5 rounded-xl font-medium text-sm hover:bg-[#333] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-black/10"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Resetting...
                    </span>
                  ) : 'Reset Password →'}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
              <p className="text-[#c8bfa8]/60 text-sm mb-6">Your password has been updated successfully.</p>
              <Link
                to="/login"
                className="inline-block bg-[#11202f] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#333] transition-colors"
              >
                Sign In →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
