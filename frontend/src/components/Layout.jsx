import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, BookOpen, GitBranch, LogOut, User, Upload, Sparkles, Shield, Activity, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import CommandPalette from './CommandPalette'
import ChatWidget from './ChatWidget'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import { BrandMark, PageBackground } from './ui'
import '../utils/theme'

const navItems = [
  { path: '/app', icon: Home, label: 'Dashboard' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/new', icon: BookOpen, label: 'New Research' },
  { path: '/graph', icon: GitBranch, label: 'Graph' },
  { path: '/recommendations', icon: Sparkles, label: 'Discover' },
  { path: '/plagiarism', icon: Shield, label: 'Originality' },
  { path: '/pdf', icon: Upload, label: 'PDF Parser' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useKeyboardShortcuts({
    onOpenSearch: () => setCommandPaletteOpen(true),
    onNewResearch: () => navigate('/new'),
    onGoGraph: () => navigate('/graph'),
    onGoDashboard: () => navigate('/app'),
    onEscape: () => setCommandPaletteOpen(false),
  })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    } else {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen bg-[#0b1626] text-[#e8e2d4] antialiased">
      <PageBackground />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a1420]/80 backdrop-blur-xl border-r border-[#1c2f42] p-5 flex flex-col z-20">
        <Link to="/" className="flex items-center gap-3 mb-10 group">
          <BrandMark size={32} />
          <div>
            <div className="font-serif text-base font-medium text-[#f5efe0] tracking-tight leading-none">ResearchAI</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#c8bfa8]/50 mt-1">Literature Engine</div>
          </div>
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  isActive
                    ? 'bg-[#c89b3c]/10 text-[#f5efe0] font-medium border border-[#c89b3c]/25'
                    : 'text-[#c8bfa8]/60 hover:text-[#f5efe0] hover:bg-[#11202f] border border-transparent'
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-[#c89b3c]' : ''} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[#1c2f42] pt-4 mt-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 bg-[#c89b3c]/10 border border-[#c89b3c]/25 rounded-lg flex items-center justify-center shrink-0">
                  <User size={15} className="text-[#c89b3c]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate text-[#f5efe0]">{user.name}</p>
                  <p className="text-[10px] text-[#c8bfa8]/50 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-[#c8bfa8]/40 hover:text-[#c89b3c] transition-colors shrink-0">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-[#c8bfa8]/60 hover:text-[#f5efe0] transition-colors"
            >
              <User size={16} />
              <span>Sign in</span>
            </Link>
          )}

          <div className="mt-3 bg-[#11202f] border border-[#1c2f42] rounded-xl p-3">
            <p className="text-[10px] text-[#c8bfa8]/40 font-mono uppercase tracking-[0.2em]">Powered by</p>
            <p className="text-xs text-[#c8bfa8]/80 font-medium mt-1">Groq Llama 3.3 70B</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8 min-h-screen relative">
        <Outlet />
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}
