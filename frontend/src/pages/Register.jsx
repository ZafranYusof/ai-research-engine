import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Check, GraduationCap } from 'lucide-react'
import api from '../utils/api'
import { toast } from '../utils/toast'
import { PageShell, BrandMark, Card, Pill, btn, input } from '../components/ui'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
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
      toast.success('Account created')
      navigate('/app')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const perks = [
    'Unlimited literature searches',
    'PDF parsing and citation graphs',
    'Critic-reviewed drafts with APA citations',
  ]

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
            <span className="font-serif text-xl font-medium tracking-tight">ResearchAI</span>
          </Link>

          <div className="text-center mb-8">
            <Pill icon={GraduationCap} className="mb-5">Join the library</Pill>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#f5efe0] mb-3">
              Create your account
            </h1>
            <p className="text-[#c8bfa8]/70 text-sm">
              Start your first literature review in minutes.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={input.label}>Full name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7a8b]" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Jane Researcher"
                    className={`${input.base} pl-11`}
                    required
                  />
                </div>
              </div>

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
                <label className={input.label}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7a8b]" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className={`${input.base} pl-11`}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className={input.label}>Confirm password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7a8b]" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className={`${input.base} pl-11`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${btn.accent} w-full py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0b1626]/30 border-t-[#0b1626] rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#c8bfa8]/60">
                Already have an account?{' '}
                <Link to="/login" className="text-[#c89b3c] hover:text-[#d9ae4e] font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>

          <div className="mt-6 space-y-2">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-2 text-xs text-[#c8bfa8]/60">
                <div className="w-4 h-4 rounded-full bg-[#c89b3c]/10 border border-[#c89b3c]/30 flex items-center justify-center">
                  <Check size={10} className="text-[#c89b3c]" />
                </div>
                {p}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageShell>
  )
}
