import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, BookOpen, User } from 'lucide-react'
import api from '../utils/api'
import { toast } from '../utils/toast'
import { PageShell, BrandMark, Card, Pill, btn, input } from '../components/ui'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.removeItem('guest')
      toast.success('Welcome back')
      navigate('/app')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      name: 'Guest Researcher',
      email: 'guest@researchengine.local',
      isGuest: true,
    }
    localStorage.setItem('user', JSON.stringify(guestUser))
    localStorage.setItem('guest', 'true')
    localStorage.removeItem('token')
    toast.success('Exploring as guest')
    navigate('/app')
  }

  return (
    <PageShell>
      <div className="relative flex items-center justify-center min-h-screen px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center justify-center gap-2 mb-10 text-[#f5efe0]">
            <BrandMark size={32} />
            <span className="font-serif text-xl font-medium tracking-tight">ResearchEngine</span>
          </Link>

          <div className="text-center mb-8">
            <Pill icon={BookOpen} className="mb-5">Return to your library</Pill>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#f5efe0] mb-3">
              Sign in
            </h1>
            <p className="text-[#c8bfa8]/70 text-sm">
              Pick up where you left off with your research projects.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={input.label}>Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7a8b]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="researcher@university.edu"
                    className={`${input.base} pl-11`}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={input.label}>Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#c89b3c] hover:text-[#d9ae4e] transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7a8b]" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className={`${input.base} pl-11`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${btn.accent} w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0b1626]/30 border-t-[#0b1626] rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1c2f42]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#c8bfa8]/40">or</span>
              <div className="flex-1 h-px bg-[#1c2f42]" />
            </div>

            <button
              type="button"
              onClick={handleGuest}
              className={`${btn.secondary} w-full py-3 mt-4`}
            >
              <User size={15} />
              Continue as guest
            </button>
            <p className="text-center text-[11px] text-[#c8bfa8]/45 mt-2.5 leading-relaxed">
              Explore the interface without an account. Guest sessions don't save drafts.
            </p>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#c8bfa8]/60">
                New to ResearchEngine?{' '}
                <Link to="/register" className="text-[#c89b3c] hover:text-[#d9ae4e] font-medium transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </Card>

          <p className="text-center text-xs text-[#c8bfa8]/40 mt-6 italic font-serif">
            Built for researchers, by researchers.
          </p>
        </motion.div>
      </div>
    </PageShell>
  )
}
