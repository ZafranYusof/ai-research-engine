const STORAGE_KEY = 'theme'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'system'
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
}

export function toggleTheme() {
  const current = getTheme()
  const resolved = current === 'system' ? getSystemTheme() : current
  const next = resolved === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

export function onThemeChange(callback) {
  const handler = (e) => callback(e.detail)
  window.addEventListener('theme-change', handler)
  return () => window.removeEventListener('theme-change', handler)
}

// Initialize on load
applyTheme(getTheme())

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (getTheme() === 'system') {
    applyTheme('system')
  }
})
