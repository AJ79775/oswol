import { LucideIcon, Construction } from 'lucide-react'
import DisclaimerFooter from './DisclaimerFooter'

interface PlaceholderPageProps {
  section: string
  title: string
  description: string
  icon?: LucideIcon
  phase?: string
  features?: string[]
}

export default function PlaceholderPage({
  section,
  title,
  description,
  icon: Icon = Construction,
  phase = 'Phase 2',
  features = [],
}: PlaceholderPageProps) {
  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
            {section}
          </span>
        </div>
        <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-sora, sans-serif)' }}>
          {title}
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>{description}</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--bg-3)' }}
          >
            <Icon className="w-8 h-8" style={{ color: 'var(--champagne-deep)' }} />
          </div>
          <h2 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-sora, sans-serif)' }}>
            Coming in {phase}
          </h2>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-lo)' }}>
            This feature is under active development and will be available in the next phase of the Oswol platform.
          </p>

          {features.length > 0 && (
            <div className="mt-6 text-left space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink-dim)' }}>
                Planned Features
              </p>
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--champagne-deep)' }} />
                  <span className="text-[12px]" style={{ color: 'var(--ink-md)' }}>{feature}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 px-4 py-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <p className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>
              Meanwhile, explore the{' '}
              <a href="/dashboard" className="font-medium" style={{ color: 'var(--ai)' }}>Dashboard</a>
              {' '}and{' '}
              <a href="/heatmap" className="font-medium" style={{ color: 'var(--ai)' }}>Heat Map</a>
              {' '}— both fully functional in Phase 1.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  )
}
