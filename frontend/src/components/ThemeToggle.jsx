import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { getTheme, toggleTheme, onThemeChange } from '../utils/theme'

function getResolvedTheme() {
  const theme = getTheme()
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => getResolvedTheme() === 'dark')

  useEffect(() => {
    const unsub = onThemeChange(() => {
      setIsDark(getResolvedTheme() === 'dark')
    })
    return unsub
  }, [])

  const handleToggle = () => {
    const next = toggleTheme()
    setIsDark(next === 'dark')
  }

  return (
    <motion.button
      onClick={handleToggle}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888] hover:text-[#555] hover:bg-[#f0f0f0] dark:hover:bg-[#333] dark:text-[#888] dark:hover:text-[#ccc] transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </motion.div>
    </motion.button>
  )
}
