import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ChangeChipProps {
  value: number
  suffix?: string
  showIcon?: boolean
  size?: 'xs' | 'sm' | 'md'
}

export default function ChangeChip({ value, suffix = '%', showIcon = false, size = 'sm' }: ChangeChipProps) {
  const isUp = value > 0
  const isFlat = value === 0
  const color = isFlat ? 'var(--ink-dim)' : isUp ? 'var(--up)' : 'var(--down)'
  const bgColor = isFlat ? 'rgba(157,161,166,0.1)' : isUp ? 'rgba(4,120,87,0.08)' : 'rgba(220,38,38,0.08)'

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-[12px] px-2 py-1',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold font-mono ${sizeClasses[size]}`}
      style={{ color, background: bgColor, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
    >
      {showIcon && !isFlat && (
        isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
      )}
      {!isFlat && (isUp ? '+' : '')}{value.toFixed(2)}{suffix}
    </span>
  )
}
