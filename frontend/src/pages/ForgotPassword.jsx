import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import { toast } from '../utils/toast'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
      toast.success('Check your email for reset instructions')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
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
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-3xl font-bold tracking-tight mb-2">Forgot password?</h1>
              <p className="text-[#c8bfa8]/60 text-sm mb-8">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c8bfa8] mb-1.5">Email</label>
                  <div className={`relative rounded-xl transition-all duration-300 ${focused ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="you@university.edu"
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
                      Sending...
                    </span>
                  ) : 'Send Reset Link →'}
                </motion.button>
              </form>

              <p className="text-center text-sm text-[#c8bfa8]/60 mt-6">
                <Link to="/login" className="text-[#c89b3c] hover:underline font-medium inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#c89b3c]/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-[#c89b3c]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-[#c8bfa8]/60 text-sm mb-6">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
              </p>
              <Link
                to="/login"
                className="inline-block text-[#c89b3c] text-sm font-medium hover:underline"
              >
                ← Back to Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
