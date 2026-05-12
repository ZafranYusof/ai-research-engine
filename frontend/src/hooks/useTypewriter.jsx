import { useEffect, useRef, useState } from 'react'

/**
 * useTypewriter — reveal a target string character by character.
 *
 * @param {string} target    full text to reveal
 * @param {object} options
 * @param {boolean} [options.enabled=true]   start typing as soon as target is non-empty
 * @param {number}  [options.charsPerFrame=7] reveal rate (chars per animation frame)
 * @param {function}[options.onDone]         called once the full string is revealed
 */
export function useTypewriter(target, { enabled = true, charsPerFrame = 7, onDone } = {}) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const rafRef = useRef(null)
  const idxRef = useRef(0)
  const targetRef = useRef(target || '')

  useEffect(() => {
    targetRef.current = target || ''
    if (!enabled || !target) {
      setShown(target || '')
      setDone(true)
      return
    }

    // Reset to type from the top whenever the target fully changes.
    idxRef.current = 0
    setShown('')
    setDone(false)

    const tick = () => {
      const total = targetRef.current
      const step = Math.max(1, charsPerFrame)
      idxRef.current = Math.min(total.length, idxRef.current + step)
      setShown(total.slice(0, idxRef.current))
      if (idxRef.current >= total.length) {
        setDone(true)
        if (onDone) onDone()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, enabled, charsPerFrame])

  return { text: shown, done }
}

/**
 * <TypewriterText> — drop-in renderer with trailing blinking cursor while streaming.
 */
export function TypewriterText({
  text = '',
  enabled = true,
  charsPerFrame = 7,
  className = '',
  cursorClassName = '',
  as: Tag = 'div',
  onDone,
}) {
  const { text: shown, done } = useTypewriter(text, { enabled, charsPerFrame, onDone })
  return (
    <Tag className={className}>
      <span style={{ whiteSpace: 'pre-wrap' }}>{shown}</span>
      {!done && (
        <span
          aria-hidden="true"
          className={`inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 bg-[#c89b3c] animate-pulse ${cursorClassName}`}
        />
      )}
    </Tag>
  )
}

/**
 * <GeneratingDots> — "Generating..." with amber animated trailing dots.
 */
export function GeneratingDots({ label = 'Generating', className = '' }) {
  const [n, setN] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v % 3) + 1), 400)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={`inline-flex items-center gap-2 text-[#c89b3c] ${className}`}>
      <span
        className="inline-block w-3 h-3 rounded-full border-2 border-[#c89b3c]/30 border-t-[#c89b3c] animate-spin"
        aria-hidden="true"
      />
      <span className="font-medium text-xs tracking-wide">
        {label}{'.'.repeat(n)}
      </span>
    </span>
  )
}
