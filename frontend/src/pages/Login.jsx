import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import { toast } from '../utils/toast'

// Floating particles background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
          }}
          animate={{
            y: [Math.random() * 100 + '%', Math.random() * 100 + '%', Math.random() * 100 + '%'],
            x: [Math.random() * 100 + '%', Math.random() * 100 + '%', Math.random() * 100 + '%'],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// Animated terminal lines
function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0)
  const lines = [
    { text: '▸ Searching Semantic Scholar + arXiv...', color: '#888' },
    { text: '▸ 47 papers found', color: '#28c840' },
    { text: '▸ Analyzing themes & contradictions...', color: '#888' },
    { text: '▸ 12 themes identified', color: '#febc2e' },
    { text: '▸ 7 research gaps found', color: '#2563eb' },
    { text: '▸ 5 hypotheses generated', color: '#7c3aed' },
    { text: '▸ Generating literature review...', color: '#888' },
    { text: '▸ Score: 8.1/10 ✓ PASSED', color: '#28c840' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= lines.length) {
          setTimeout(() => setVisibleLines(0), 2000)
          return prev
        }
        return prev + 1
      })
    }, 800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-[#222] shadow-2xl shadow-black/50 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[10px] text-[#555] font-mono">research-pipeline</span>
      </div>
      <div className="font-mono text-xs space-y-1.5 min-h-[180px]">
        <AnimatePresence>
          {lines.slice(0, visibleLines).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ color: line.color }}
            >
              {line.text}
            </motion.p>
          ))}
        </AnimatePresence>
        {visibleLines < lines.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-2 h-3 bg-[#2563eb]"
          />
        )}
      </div>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Welcome back!')
      navigate('/app')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/" className="flex items-center gap-2 mb-12 group">
              <motion.svg
                whileHover={{ rotate: 5, scale: 1.05 }}
                width="28" height="28" viewBox="0 0 28 28" fill="none"
              >
                <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
                <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
                <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
              </motion.svg>
              <span className="text-lg font-semibold tracking-tight group-hover:text-[#2563eb] transition-colors">ResearchAI</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-[#888] text-sm mb-8">Sign in to continue your research</p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-[#555] mb-1.5">Email</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'email' ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@university.edu"
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-[#ccc]"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-[#555] mb-1.5">Password</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-[#ccc]"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-xl font-medium text-sm hover:bg-[#333] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-black/10"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-[#888] mt-6 space-y-2"
          >
            <p>
              <Link to="/forgot-password" className="text-[#2563eb] hover:underline font-medium">Forgot password?</Link>
            </p>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="text-[#2563eb] hover:underline font-medium">Create one</Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e] items-center justify-center relative overflow-hidden">
        <FloatingParticles />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#2563eb]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#7c3aed]/10 rounded-full blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 px-12"
        >
          <AnimatedTerminal />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-[#666] text-xs text-center mt-6 max-w-xs mx-auto"
          >
            Five AI agents working together to accelerate your literature review.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
