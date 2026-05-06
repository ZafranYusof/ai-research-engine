import { motion } from 'framer-motion'

const shimmer = {
  hidden: { x: '-100%' },
  visible: { x: '100%' },
}

function ShimmerOverlay() {
  return (
    <motion.div
      className="absolute inset-0 -translate-x-full"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      }}
      variants={shimmer}
      initial="hidden"
      animate="visible"
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function SkeletonText({ width = '100%', height = '12px', className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-[#e5e5e5]/60 ${className}`}
      style={{ width, height }}
    >
      <ShimmerOverlay />
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white border border-[#eee] rounded-2xl p-5 ${className}`}>
      <div className="space-y-3">
        <SkeletonText width="70%" height="14px" />
        <SkeletonText width="90%" height="10px" />
        <SkeletonText width="50%" height="10px" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6, cols = 3, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white border border-[#eee] rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="relative overflow-hidden w-10 h-10 rounded-xl bg-[#e5e5e5]/60">
          <ShimmerOverlay />
        </div>
        <div className="space-y-2">
          <SkeletonText width="48px" height="20px" />
          <SkeletonText width="64px" height="10px" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonProjectRow() {
  return (
    <div className="flex items-center gap-4 bg-white border border-[#eee] rounded-xl px-5 py-4">
      <div className="relative overflow-hidden w-10 h-10 rounded-xl bg-[#e5e5e5]/60 shrink-0">
        <ShimmerOverlay />
      </div>
      <div className="flex-1 space-y-2">
        <SkeletonText width="60%" height="13px" />
        <SkeletonText width="30%" height="9px" />
      </div>
    </div>
  )
}

export function SkeletonPaperCard() {
  return (
    <div className="bg-white border border-[#eee] rounded-xl p-5">
      <div className="space-y-3">
        <SkeletonText width="85%" height="14px" />
        <SkeletonText width="60%" height="10px" />
        <SkeletonText width="40%" height="10px" />
        <div className="pt-2">
          <SkeletonText width="100%" height="10px" />
          <div className="mt-1.5">
            <SkeletonText width="90%" height="10px" />
          </div>
        </div>
      </div>
    </div>
  )
}
