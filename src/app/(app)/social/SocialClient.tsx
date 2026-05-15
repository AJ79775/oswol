'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import DemoBadge from '@/components/shared/DemoBadge'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { mockNarratives, Narrative } from '@/lib/data/mockSocialData'
import {
  getHypeRiskLabel,
  getHypeRiskColor,
  getSentimentLabel,
  getSentimentColor,
} from '@/lib/scoring/socialScoring'

type TimeRange = '1h' | '24h' | '7d'

function TrendIcon({ trend }: { trend: Narrative['trend'] }) {
  if (trend === 'surging') return <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--up)' }} />
  if (trend === 'rising') return <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--up)', opacity: 0.7 }} />
  if (trend === 'cooling') return <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--down)' }} />
  return <Minus className="w-3.5 h-3.5 text-[var(--ink-dim)]" />
}

function TrendLabel({ trend }: { trend: Narrative['trend'] }) {
  const map = {
    surging: { label: '▲▲ Surging', color: 'var(--up)' },
    rising: { label: '▲ Rising', color: 'var(--up)' },
    flat: { label: '→ Flat', color: 'var(--ink-dim)' },
    cooling: { label: '▼ Cooling', color: 'var(--down)' },
  }
  const { label, color } = map[trend]
  return <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
}

function HypeRiskBadge({ score }: { score: number }) {
  const label = getHypeRiskLabel(score)
  const color = getHypeRiskColor(score)
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      HYPE {label}
    </span>
  )
}

function NewsConfirmBadge({ status }: { status: Narrative['newsConfirmation'] }) {
  const configs = {
    confirmed: { icon: CheckCircle, label: 'News Confirmed', color: 'var(--up)', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.20)' },
    partial: { icon: HelpCircle, label: 'Partially Confirmed', color: 'var(--warn)', bg: 'rgba(180,83,9,0.08)', border: 'rgba(180,83,9,0.20)' },
    unconfirmed: { icon: XCircle, label: 'Unconfirmed', color: 'var(--down)', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.20)' },
  }
  const { icon: Icon, label, color, bg, border } = configs[status]
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold"
      style={{ color, background: bg, border: `1px solid ${border}` }}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function PlatformBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[var(--ink-lo)] w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-3)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono-nums text-[var(--ink-md)] w-8 text-right">{pct}%</span>
    </div>
  )
}

function StatGrid({ items }: { items: { label: string; value: string; sub?: string; color?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(({ label, value, sub, color }) => (
        <div key={label} className="bg-[var(--bg-2)] rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-1">{label}</p>
          <p className="text-lg font-bold font-mono-nums leading-none" style={{ color: color ?? 'var(--ink-hi)' }}>{value}</p>
          {sub && <p className="text-[10px] text-[var(--ink-dim)] mt-0.5">{sub}</p>}
        </div>
      ))}
    </div>
  )
}

export default function SocialClient() {
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative>(mockNarratives[0])
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')

  const sentimentColor = getSentimentColor(selectedNarrative.sentiment)

  return (
    <div className="min-h-full">
      {/* Demo Banner */}
      <div className="flex items-center gap-2 px-6 py-2.5 text-[12px]"
        style={{ background: 'rgba(180,83,9,0.06)', borderBottom: '1px solid rgba(180,83,9,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
        <span style={{ color: 'var(--warn)' }}>
          Demo data only. Social sentiment can be noisy, manipulated, incomplete, or wrong.
        </span>
      </div>

      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--social)' }}>SOCIAL NARRATIVE SCANNER</span>
              <DemoBadge />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink-hi)] font-display">What the internet is talking about</h1>
            <p className="text-[13px] text-[var(--ink-lo)] mt-1 max-w-xl">
              Ranked by velocity and cross-platform reach. Hype-risk flags help separate real signals from retail froth.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Time Toggle */}
            <div className="flex items-center gap-0.5 p-1 rounded-lg bg-[var(--bg-2)]">
              {(['1h', '24h', '7d'] as TimeRange[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                    timeRange === t ? 'bg-[var(--bg-0)] text-[var(--ink-hi)] shadow-sm' : 'text-[var(--ink-lo)] hover:text-[var(--ink-md)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-[var(--ink-lo)] hover:text-[var(--ink-md)] transition-colors"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              Sources
            </button>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="flex gap-4">
          {/* Left: Narratives List */}
          <div className="w-[380px] flex-shrink-0 space-y-2">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <h2 className="text-[13px] font-semibold text-[var(--ink-hi)]">Trending narratives</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-3)] text-[var(--ink-dim)]">
                  ranked by velocity
                </span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {mockNarratives.map((narrative, idx) => {
                  const isSelected = selectedNarrative.id === narrative.id
                  return (
                    <button
                      key={narrative.id}
                      onClick={() => setSelectedNarrative(narrative)}
                      className={`w-full text-left px-4 py-4 transition-colors hover:bg-[var(--bg-2)] ${isSelected ? 'bg-[var(--bg-2)]' : ''}`}
                      style={isSelected ? { borderLeft: '3px solid var(--social)' } : { borderLeft: '3px solid transparent' }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold font-mono-nums text-[var(--ink-dim)]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[13px] font-semibold text-[var(--ink-hi)]">{narrative.name}</span>
                        </div>
                        <HypeRiskBadge score={narrative.hypeRiskScore} />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendIcon trend={narrative.trend} />
                        <TrendLabel trend={narrative.trend} />
                      </div>
                      <p className="text-[11px] text-[var(--ink-lo)] leading-relaxed mb-3 line-clamp-2">
                        {narrative.description}
                      </p>
                      {/* Velocity bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-[var(--bg-3)]">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${narrative.velocityScore}%`, background: 'var(--social)' }} />
                        </div>
                        <span className="text-[10px] font-mono-nums text-[var(--ink-dim)]">
                          {narrative.mentionVolume.toLocaleString()} mentions
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Main detail card */}
            <div className="rounded-xl overflow-hidden" style={{
              border: '1px solid rgba(109,40,217,0.20)',
              background: 'var(--bg-1)',
              boxShadow: '0 0 0 1px rgba(109,40,217,0.06)',
            }}>
              {/* Cyan-style top stripe */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--social) 0%, rgba(109,40,217,0.2) 100%)' }} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded mb-2 inline-block"
                      style={{ background: 'rgba(109,40,217,0.10)', color: 'var(--social)' }}>
                      NARRATIVE
                    </span>
                    <h2 className="text-xl font-bold text-[var(--ink-hi)] font-display">{selectedNarrative.name}</h2>
                    <p className="text-[12px] text-[var(--ink-lo)] mt-1">{selectedNarrative.description}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <HypeRiskBadge score={selectedNarrative.hypeRiskScore} />
                    <NewsConfirmBadge status={selectedNarrative.newsConfirmation} />
                  </div>
                </div>

                {/* 4-stat grid */}
                <StatGrid items={[
                  { label: 'Velocity', value: `${selectedNarrative.velocityScore}`, sub: 'out of 100', color: 'var(--social)' },
                  { label: 'Mentions 24h', value: selectedNarrative.mentionVolume.toLocaleString(), sub: `${timeRange} window` },
                  { label: 'Hype Risk', value: getHypeRiskLabel(selectedNarrative.hypeRiskScore), color: getHypeRiskColor(selectedNarrative.hypeRiskScore) },
                  { label: 'News Confirm', value: selectedNarrative.newsConfirmation, color: selectedNarrative.newsConfirmation === 'confirmed' ? 'var(--up)' : selectedNarrative.newsConfirmation === 'partial' ? 'var(--warn)' : 'var(--down)' },
                ]} />

                {/* Sentiment bar */}
                <div className="mt-4 p-3 rounded-lg bg-[var(--bg-2)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Narrative Sentiment</span>
                    <span className="text-[12px] font-semibold" style={{ color: sentimentColor }}>
                      {getSentimentLabel(selectedNarrative.sentiment)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-3)]">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(selectedNarrative.sentiment + 1) / 2 * 100}%`, background: sentimentColor }} />
                  </div>
                </div>

                {/* Related Assets */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-2">RELATED ASSETS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNarrative.relatedAssets.map(ticker => (
                      <Link
                        key={ticker}
                        href={`/markets/${ticker}`}
                        className="px-2.5 py-1 rounded-md text-[12px] font-semibold font-mono-nums transition-colors hover:bg-[var(--ai-soft)] hover:text-[var(--ai)]"
                        style={{ background: 'var(--bg-3)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
                      >
                        {ticker}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Platform Breakdown */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-2.5">PLATFORM BREAKDOWN</p>
                  <div className="space-y-1.5">
                    <PlatformBar label="X (Twitter)" pct={selectedNarrative.platforms.twitter} color="#1DA1F2" />
                    <PlatformBar label="Reddit" pct={selectedNarrative.platforms.reddit} color="#FF4500" />
                    <PlatformBar label="TikTok" pct={selectedNarrative.platforms.tiktok} color="#69C9D0" />
                    <PlatformBar label="Discord" pct={selectedNarrative.platforms.discord} color="#5865F2" />
                  </div>
                </div>

                {/* Rumor Warning if HIGH hype */}
                {selectedNarrative.hypeRiskScore >= 70 && (
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-lg"
                    style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)' }}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--down)' }} />
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--down)]">High Hype Risk Warning</p>
                      <p className="text-[11px] text-[var(--ink-lo)] mt-0.5">
                        This narrative shows signs of retail-driven momentum. Engagement may not reflect genuine fundamental change.
                        Cross-check with news sources before acting.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Discussions */}
            {selectedNarrative.topDiscussions.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h3 className="text-[13px] font-semibold text-[var(--ink-hi)]">Top Discussions</h3>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 p-4">
                  {selectedNarrative.topDiscussions.map((post, i) => (
                    <div key={i} className="p-3 rounded-lg"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-[var(--ai)]">{post.platform}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[var(--ink-dim)]">{post.time}</span>
                          <span className="text-[10px] font-mono-nums text-[var(--ink-dim)]">
                            {post.engagement.toLocaleString()} engmt
                          </span>
                          <ExternalLink className="w-3 h-3 text-[var(--ink-dim)] cursor-pointer hover:text-[var(--ai)]" />
                        </div>
                      </div>
                      <p className="text-[12px] text-[var(--ink-md)] leading-relaxed">&quot;{post.text}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Tickers */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <h3 className="text-[13px] font-semibold text-[var(--ink-hi)]">Most Mentioned Tickers</h3>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {['NVDA', 'BTC', 'TSLA', 'AMD', 'META', 'LLY', 'BABA', 'IONQ', 'CCJ', 'PLTR'].map(ticker => (
                  <Link
                    key={ticker}
                    href={`/social/ticker/${ticker}`}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold font-mono-nums transition-colors hover:bg-[var(--ai-soft)] hover:text-[var(--ai)]"
                    style={{ background: 'var(--bg-2)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
                  >
                    {ticker}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  )
}
