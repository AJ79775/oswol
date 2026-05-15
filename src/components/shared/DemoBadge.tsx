'use client'

interface DemoBadgeProps {
  className?: string
}

export default function DemoBadge({ className = '' }: DemoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${className}`}
      style={{
        background: 'rgba(180,83,9,0.08)',
        color: 'var(--warn)',
        border: '1px solid rgba(180,83,9,0.15)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: 'var(--warn)', opacity: 0.7 }}
      />
      Demo Data
    </span>
  )
}
