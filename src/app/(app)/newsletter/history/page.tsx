import { Newspaper, Clock } from 'lucide-react'

export default function NewsletterHistoryPage() {
  return (
    <div className="min-h-full">
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
            Output
          </span>
        </div>
        <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-display, sans-serif)' }}>
          Newsletter History
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>
          Previously generated and sent newsletters
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <div
          className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center mb-4"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <Newspaper className="w-8 h-8" style={{ color: 'var(--ink-dim)' }} />
        </div>
        <p className="text-[16px] font-medium mb-2" style={{ color: 'var(--ink-hi)' }}>No newsletters yet</p>
        <p className="text-[13px] mb-6 max-w-xs" style={{ color: 'var(--ink-lo)' }}>
          Generate your first newsletter using the Newsletter Builder to see it appear here.
        </p>
        <a
          href="/newsletter"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium"
          style={{ background: 'var(--ai)', color: 'white' }}
        >
          <Newspaper className="w-4 h-4" />
          Build a newsletter
        </a>
      </div>
    </div>
  )
}
