import { useEffect } from 'react'

export default function useKeyboardShortcuts({ onOpenSearch, onNewResearch, onGoGraph, onGoDashboard, onEscape }) {
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't trigger when typing in inputs
      const tag = e.target.tagName.toLowerCase()
      const isInput = tag === 'input' || tag === 'textarea' || e.target.isContentEditable

      if (e.key === 'Escape') {
        onEscape?.()
        return
      }

      // Skip if user is typing in an input (except for Escape)
      if (isInput) return

      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key === 'k') {
        e.preventDefault()
        onOpenSearch?.()
      } else if (mod && e.key === 'n') {
        e.preventDefault()
        onNewResearch?.()
      } else if (mod && e.key === 'g') {
        e.preventDefault()
        onGoGraph?.()
      } else if (mod && e.key === 'd') {
        e.preventDefault()
        onGoDashboard?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenSearch, onNewResearch, onGoGraph, onGoDashboard, onEscape])
}
