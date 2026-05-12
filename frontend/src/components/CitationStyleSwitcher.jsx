import { CITATION_STYLES } from '../utils/citation'

/**
 * Segmented control for choosing citation style.
 * Uses existing academic theme tokens (navy #0b1626 / amber #c89b3c).
 */
export default function CitationStyleSwitcher({ value, onChange, className = '' }) {
  return (
    <div
      role="group"
      aria-label="Citation style"
      className={`inline-flex items-center rounded-full border border-[#1c2f42] bg-[#0b1626] p-0.5 ${className}`}
    >
      {CITATION_STYLES.map((style) => {
        const active = value === style
        return (
          <button
            key={style}
            type="button"
            onClick={() => onChange && onChange(style)}
            aria-pressed={active}
            className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all tracking-wide ${
              active
                ? 'bg-[#c89b3c] text-[#0b1626] shadow-[0_4px_12px_-4px_rgba(200,155,60,0.6)]'
                : 'text-[#c8bfa8]/70 hover:text-[#f5efe0]'
            }`}
          >
            {style}
          </button>
        )
      })}
    </div>
  )
}
