import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Home, BookOpen, GitBranch, FileText, Upload, Command } from 'lucide-react'

const actions = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: Home, path: '/app', shortcut: '⌘D' },
  { id: 'search', label: 'Search Papers', icon: Search, path: '/search', shortcut: '⌘K' },
  { id: 'new', label: 'New Research', icon: BookOpen, path: '/new', shortcut: '⌘N' },
  { id: 'graph', label: 'Knowledge Graph', icon: GitBranch, path: '/graph', shortcut: '⌘G' },
  { id: 'pdf', label: 'Upload PDF', icon: Upload, path: '/pdf' },
  { id: 'docs', label: 'Documentation', icon: FileText, path: '/docs' },
]

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (action) => {
    navigate(action.path)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      handleSelect(filtered[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-2xl overflow-hidden dark:bg-[#1a1a1a] dark:border-[#333]">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#eee] dark:border-[#333]">
                <Search size={18} className="text-[#999]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search actions..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#999] dark:text-white"
                />
                <kbd className="text-[10px] text-[#999] bg-[#f5f5f4] px-1.5 py-0.5 rounded font-mono dark:bg-[#333]">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[300px] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[#999]">No results found</div>
                ) : (
                  filtered.map((action, i) => {
                    const Icon = action.icon
                    const isSelected = i === selectedIndex
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleSelect(action)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                          isSelected
                            ? 'bg-[#f0f0f0] dark:bg-[#2a2a2a]'
                            : 'hover:bg-[#f8f8f8] dark:hover:bg-[#222]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#2563eb]/10' : 'bg-[#f5f5f4] dark:bg-[#333]'
                        }`}>
                          <Icon size={16} className={isSelected ? 'text-[#2563eb]' : 'text-[#888]'} />
                        </div>
                        <span className={`flex-1 text-sm ${isSelected ? 'font-medium' : ''}`}>
                          {action.label}
                        </span>
                        {action.shortcut && (
                          <kbd className="text-[10px] text-[#999] bg-[#f5f5f4] px-1.5 py-0.5 rounded font-mono dark:bg-[#333]">
                            {action.shortcut}
                          </kbd>
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[#eee] px-5 py-2.5 flex items-center gap-4 text-[10px] text-[#999] dark:border-[#333]">
                <span className="flex items-center gap-1"><kbd className="bg-[#f5f5f4] px-1 rounded dark:bg-[#333]">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-[#f5f5f4] px-1 rounded dark:bg-[#333]">↵</kbd> Select</span>
                <span className="flex items-center gap-1"><kbd className="bg-[#f5f5f4] px-1 rounded dark:bg-[#333]">esc</kbd> Close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
