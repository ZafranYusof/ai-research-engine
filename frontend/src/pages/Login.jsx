import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2 mb-12">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
              <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
              <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
            </svg>
            <span className="text-lg font-semibold tracking-tight">ResearchAI</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-[#888] text-sm mb-8">Sign in to continue your research</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@university.edu"
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all placeholder:text-[#ccc]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#555] mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 transition-all placeholder:text-[#ccc]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#333] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-black/10 active:translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#888] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2563eb] hover:underline font-medium">Create one</Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-[#1a1a1a] items-center justify-center relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <div className="font-mono text-sm text-[#555] mb-8 text-left bg-[#111] rounded-xl p-5 border border-[#333]">
            <p className="text-[#28c840]">▸ 47 papers analyzed</p>
            <p className="text-[#febc2e]">▸ 12 themes identified</p>
            <p className="text-[#2563eb]">▸ 7 research gaps found</p>
            <p className="text-[#7c3aed]">▸ 5 hypotheses generated</p>
            <p className="text-[#28c840]">▸ Score: 8.1/10 ✓</p>
          </div>
          <p className="text-[#666] text-sm max-w-xs mx-auto">
            Your AI research assistant is ready. Five agents working together to accelerate your literature review.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
