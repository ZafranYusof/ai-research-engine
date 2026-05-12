import { BookOpen } from 'lucide-react'

/*
 * Academic UI Primitives
 * -------------------------------------------------------------
 * Design direction: scholarly, paper-inspired, library vibe
 *   Base:        Deep navy (#0b1626)
 *   Surface:     Warm ivory (#faf7f2) for light | Slate navy for dark
 *   Accent:      Scholarly amber (#c89b3c) — used for highlights
 *   Secondary:   Desaturated teal (#4a7c7e) — citations/tags
 *   Typography:  Serif headings ('Fraunces'/'Cormorant' fallback to system)
 *                Sans body (Inter fallback)
 * -------------------------------------------------------------
 */

// Shared brand mark used across all pages
export function BrandMark({ size = 32 }) {
  return (
    <div
      className="relative rounded-[10px] bg-gradient-to-br from-[#c89b3c] to-[#a37c2a] flex items-center justify-center shadow-[0_4px_18px_-4px_rgba(200,155,60,0.5)]"
      style={{ width: size, height: size }}
    >
      <BookOpen size={Math.round(size * 0.55)} className="text-[#0b1626]" strokeWidth={2.25} />
    </div>
  )
}

// Atmospheric page background — subtle paper texture feel
export function PageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* paper lines — faint ruled notebook effect */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(transparent 31px, rgba(200,155,60,0.4) 32px)',
          backgroundSize: '100% 32px',
        }}
      />
      {/* ambient glows */}
      <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-[#c89b3c]/[0.08] rounded-full blur-[160px]" />
      <div className="absolute bottom-1/3 -right-32 w-[500px] h-[500px] bg-[#4a7c7e]/[0.08] rounded-full blur-[140px]" />
    </div>
  )
}

// Page shell — dark scholarly base
export function PageShell({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen bg-[#0b1626] text-[#e8e2d4] antialiased ${className}`} style={{ fontFeatureSettings: '"liga", "ss01"' }}>
      <PageBackground />
      {children}
    </div>
  )
}

// Section heading with eyebrow tag and descriptive subtitle
export function SectionHeading({ eyebrow, title, desc, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`max-w-2xl ${alignment} mb-12`}>
      {eyebrow && (
        <div className="text-[10px] tracking-[0.35em] uppercase text-[#c89b3c] font-medium mb-4">
          {eyebrow}
        </div>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.02em] text-[#f5efe0] leading-[1.1]">
        {title}
      </h2>
      {desc && <p className="mt-4 text-base sm:text-lg text-[#c8bfa8]/80 leading-relaxed">{desc}</p>}
    </div>
  )
}

// Standard paper-feel surface card
export function Card({ children, className = '', hover = false }) {
  const hoverClass = hover ? 'hover:border-[#c89b3c]/40 transition-colors' : ''
  return (
    <div className={`bg-[#11202f] border border-[#1c2f42] rounded-2xl ${hoverClass} ${className}`}>
      {children}
    </div>
  )
}

// Highlighted card — for primary CTAs
export function HighlightCard({ children, className = '' }) {
  return (
    <div
      className={`relative bg-gradient-to-br from-[#c89b3c]/10 via-[#11202f] to-[#11202f] border border-[#c89b3c]/30 rounded-2xl shadow-[0_30px_80px_-40px_rgba(200,155,60,0.4)] ${className}`}
    >
      {children}
    </div>
  )
}

// Eyebrow pill label
export function Pill({ children, icon: Icon, className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#c89b3c]/25 bg-[#c89b3c]/[0.06] text-[#c89b3c] text-xs font-medium tracking-wide ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </div>
  )
}

// Button class composition
export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#faf7f2] text-[#0b1626] rounded-full font-medium hover:bg-white transition-colors',
  secondary:
    'inline-flex items-center justify-center gap-2 px-6 py-3 text-[#e8e2d4]/80 border border-[#e8e2d4]/15 hover:border-[#e8e2d4]/30 hover:text-[#f5efe0] rounded-full font-medium transition-colors',
  ghost:
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-[#e8e2d4]/70 hover:text-[#f5efe0] transition-colors',
  accent:
    'inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c89b3c] to-[#a37c2a] text-[#0b1626] rounded-full font-semibold hover:from-[#d9ae4e] hover:to-[#b58c35] transition-colors shadow-[0_8px_24px_-8px_rgba(200,155,60,0.6)]',
}

// Input composition
export const input = {
  base:
    'w-full px-4 py-3 bg-[#0b1626] border border-[#1c2f42] rounded-xl text-[#f5efe0] placeholder:text-[#6a7a8b] focus:outline-none focus:border-[#c89b3c]/50 focus:ring-2 focus:ring-[#c89b3c]/20 transition-all',
  label: 'block text-[11px] font-medium text-[#c8bfa8]/70 mb-2 tracking-[0.15em] uppercase',
}

// Citation-style tag (academic touch)
export function CitationTag({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md bg-[#4a7c7e]/10 border border-[#4a7c7e]/30 text-[#7db9b9] text-[11px] font-mono ${className}`}
    >
      {children}
    </span>
  )
}
