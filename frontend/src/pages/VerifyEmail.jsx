import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    const verify = async () => {
      try {
        const res = await api.post('/api/auth/verify', { token })
        setStatus('success')
        setMessage(res.data.message || 'Email verified successfully!')
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.detail || 'Verification failed')
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
            <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
            <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
          </svg>
          <span className="text-lg font-semibold tracking-tight">ResearchAI</span>
        </Link>

        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 shadow-sm">
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-12 h-12 text-[#2563eb] animate-spin" />
              <p className="text-[#555] text-sm">Verifying your email...</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Email Verified!</h2>
              <p className="text-[#888] text-sm">{message}</p>
              <Link
                to="/app"
                className="mt-4 inline-block bg-[#1a1a1a] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#333] transition-colors"
              >
                Go to Dashboard →
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold">Verification Failed</h2>
              <p className="text-[#888] text-sm">{message}</p>
              <Link
                to="/login"
                className="mt-4 inline-block text-[#2563eb] text-sm font-medium hover:underline"
              >
                Back to Login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
