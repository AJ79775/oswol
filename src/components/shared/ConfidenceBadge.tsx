'use client'

interface ConfidenceBadgeProps {
  level: 'low' | 'medium' | 'high'
  showBar?: boolean
}

const CONFIG = {
  high: {
    label: 'HIGH',
    color: 'var(--ai)',
    bg: 'rgba(8,145,178,0.1)',
    barWidth: '85%',
    barColor: 'var(--ai)',
  },
  medium: {
    label: 'MEDIUM',
    color: 'var(--champagne-deep)',
    bg: 'rgba(216,198,167,0.18)',
    barWidth: '55%',
    barColor: 'var(--champagne-deep)',
  },
  low: {
    label: 'LOW',
    color: 'var(--warn)',
    bg: 'rgba(180,83,9,0.1)',
    barWidth: '25%',
    barColor: 'var(--warn)',
  },
}

export default function ConfidenceBadge({ level, showBar = false }: ConfidenceBadgeProps) {
  const cfg = CONFIG[level]

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest"
        style={{ color: cfg.color, background: cfg.bg }}
      >
        {cfg.label}
      </span>
      {showBar && (
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)', maxWidth: 80 }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: cfg.barWidth, background: cfg.barColor }}
          />
        </div>
      )}
    </div>
  )
}
