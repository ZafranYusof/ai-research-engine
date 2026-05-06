import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import { toast } from '../utils/toast'

// Animated feature list
function FeatureList() {
  const features = [
    { icon: '🔍', text: 'Search 200M+ papers from Semantic Scholar, arXiv & Google Scholar', delay: 0.5 },
    { icon: '🧠', text: 'AI identifies themes, gaps, and contradictions automatically', delay: 0.7 },
    { icon: '✍️', text: 'Auto-generate cited literature reviews with quality scoring', delay: 0.9 },
    { icon: '🕸️', text: 'Visual knowledge graph of paper relationships', delay: 1.1 },
    { icon: '📊', text: 'Export to Word, LaTeX, or Markdown instantly', delay: 1.3 },
  ]

  return (
    <div className="space-y-3">
      {features.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: item.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ x: 5, backgroundColor: 'rgba(37, 99, 235, 0.05)' }}
          className="flex items-center gap-3 bg-[#111]/50 backdrop-blur-sm border border-[#222] rounded-xl px-4 py-3 transition-all cursor-default"
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-sm text-[#aaa]">{item.text}</span>
        </motion.div>
      ))}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const [step, setStep] = useState(1) // 1 = name/email, 2 = password

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Account created!')
      navigate('/app')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = form.name.trim() && form.email.trim()

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e] items-center justify-center relative overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 left-1/3 w-72 h-72 bg-[#2563eb] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-[#7c3aed] rounded-full blur-[100px]"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 px-12 max-w-md"
        >
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-3"
          >
            Accelerate your research
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#888] mb-8 text-sm"
          >
            Join researchers using AI to complete literature reviews in minutes instead of weeks.
          </motion.p>

          <FeatureList />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {['#2563eb', '#7c3aed', '#059669', '#d97706'].map((color, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#1a1a2e]" style={{ backgroundColor: color }} />
              ))}
            </div>
            <p className="text-xs text-[#666]">Trusted by 1,000+ researchers worldwide</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Link to="/" className="flex items-center gap-2 mb-12 group">
              <motion.svg whileHover={{ rotate: 5, scale: 1.05 }} width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
                <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
                <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
              </motion.svg>
              <span className="text-lg font-semibold tracking-tight group-hover:text-[#2563eb] transition-colors">ResearchAI</span>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create your account</h1>
            <p className="text-[#888] text-sm mb-8">Start your AI-powered research journey</p>
          </motion.div>

          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#2563eb]' : 'bg-[#e5e5e5]'}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#2563eb]' : 'bg-[#e5e5e5]'}`} />
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

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-[#555] mb-1.5">Full Name</label>
                    <div className={`rounded-xl transition-all duration-300 ${focused === 'name' ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        placeholder="Dr. Jane Smith"
                        className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-[#ccc]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#555] mb-1.5">Email</label>
                    <div className={`rounded-xl transition-all duration-300 ${focused === 'email' ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
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
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => canProceed && setStep(2)}
                    disabled={!canProceed}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-xl font-medium text-sm hover:bg-[#333] disabled:bg-[#e5e5e5] disabled:text-[#999] disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-black/10 mt-2"
                  >
                    Continue →
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-[#555] mb-1.5">Password</label>
                    <div className={`rounded-xl transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused(null)}
                        placeholder="Min 6 characters"
                        className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-[#ccc]"
                        required
                      />
                    </div>
                    {form.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                form.password.length >= i * 3
                                  ? form.password.length >= 12 ? 'bg-[#059669]' : form.password.length >= 8 ? 'bg-[#2563eb]' : 'bg-[#d97706]'
                                  : 'bg-[#e5e5e5]'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-[#aaa] mt-1">
                          {form.password.length < 6 ? 'Too short' : form.password.length < 8 ? 'Fair' : form.password.length < 12 ? 'Good' : 'Strong'}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#555] mb-1.5">Confirm Password</label>
                    <div className={`rounded-xl transition-all duration-300 ${focused === 'confirm' ? 'ring-2 ring-[#2563eb]/20 shadow-lg shadow-[#2563eb]/5' : ''}`}>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        onFocus={() => setFocused('confirm')}
                        onBlur={() => setFocused(null)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#2563eb] transition-all placeholder:text-[#ccc]"
                        required
                      />
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 mt-1">
                        Passwords don't match
                      </motion.p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <motion.button
                      type="button"
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3.5 rounded-xl text-sm font-medium border border-[#e5e5e5] text-[#555] hover:bg-[#f5f5f4] transition-all"
                    >
                      ← Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-[#1a1a1a] text-white py-3.5 rounded-xl font-medium text-sm hover:bg-[#333] disabled:bg-[#ccc] disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-black/10"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          Creating...
                        </span>
                      ) : 'Create Account'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-[#888] mt-6"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563eb] hover:underline font-medium">Sign in</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
