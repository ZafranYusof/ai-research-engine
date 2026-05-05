import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Search, BookOpen, GitBranch, PenTool } from 'lucide-react'

const navItems = [
  { path: '/app', icon: Home, label: 'Dashboard' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/new', icon: BookOpen, label: 'New Research' },
  { path: '/graph', icon: GitBranch, label: 'Graph' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0d1321] border-r border-white/[0.06] p-5 flex flex-col">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-sm font-bold">
            R
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ResearchAI
          </span>
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path || 
              (path === '/app' && location.pathname.startsWith('/app'))
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom info */}
        <div className="border-t border-white/[0.06] pt-4 mt-4">
          <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-xl p-3">
            <p className="text-xs text-gray-500">Powered by</p>
            <p className="text-xs text-indigo-400 font-medium">Groq Llama 3.3 70B</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
