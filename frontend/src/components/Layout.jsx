import { Outlet, Link, useLocation } from 'react-router-dom'
import { BookOpen, Search, GitBranch, PenTool, Home } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/search', icon: Search, label: 'Search Papers' },
  { path: '/new', icon: BookOpen, label: 'New Research' },
  { path: '/graph', icon: GitBranch, label: 'Knowledge Graph' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-emerald-400">🧠 Research Engine</h1>
          <p className="text-xs text-gray-500 mt-1">AI-Powered Literature Review</p>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}
