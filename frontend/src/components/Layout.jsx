import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, BookOpen, GitBranch, LogOut, User, Upload, Sparkles, Shield, Activity, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import CommandPalette from './CommandPalette'
import ChatWidget from './ChatWidget'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
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
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a] dark:bg-[#0f0f0f] dark:text-[#e5e5e5]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-[#eee] p-5 flex flex-col dark:bg-[#0f0f0f] dark:border-[#222]">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M4 6C4 4.9 4.9 4 6 4h4v20H6c-1.1 0-2-.9-2-2V6z" fill="#2563eb" opacity="0.8"/>
            <path d="M12 4h4v20h-4V4z" fill="#7c3aed" opacity="0.6"/>
            <path d="M18 4h4c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-4V4z" fill="#2563eb" opacity="0.4"/>
          </svg>
          <span className="text-base font-semibold tracking-tight">ResearchAI</span>
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
                    ? 'bg-[#f0f0f0] text-[#1a1a1a] font-medium dark:bg-[#1a1a1a] dark:text-[#e5e5e5]'
                    : 'text-[#888] hover:text-[#555] hover:bg-[#f8f8f8] dark:hover:text-[#ccc] dark:hover:bg-[#1a1a1a]'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[#eee] pt-4 mt-4 dark:border-[#222]">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#2563eb]/10 rounded-lg flex items-center justify-center">
                  <User size={14} className="text-[#2563eb]" />
                </div>
                <div>
                  <p className="text-xs font-medium truncate max-w-[100px]">{user.name}</p>
                  <p className="text-[10px] text-[#999] truncate max-w-[100px]">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-[#ccc] hover:text-[#888] transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-[#888] hover:text-[#555] transition-colors"
            >
              <User size={16} />
              <span>Sign in</span>
            </Link>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="bg-[#f8f8f8] border border-[#eee] rounded-xl p-3 flex-1 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              <p className="text-[10px] text-[#999] font-mono uppercase tracking-wider">Powered by</p>
              <p className="text-xs text-[#555] font-medium mt-0.5 dark:text-[#aaa]">Groq Llama 3.3 70B</p>
            </div>
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 p-8 min-h-screen">
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
