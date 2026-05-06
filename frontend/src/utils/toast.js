/**
 * Simple event-based toast notification system.
 * No external dependencies.
 */

const listeners = new Set()

let toastId = 0

function emit(type, message) {
  toastId++
  const toast = { id: toastId, type, message, timestamp: Date.now() }
  listeners.forEach(fn => fn(toast))
  return toast.id
}

export const toast = {
  success: (msg) => emit('success', msg),
  error: (msg) => emit('error', msg),
  info: (msg) => emit('info', msg),
  warning: (msg) => emit('warning', msg),
}

export function onToast(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}
