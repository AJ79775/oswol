'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import DemoBadge from '@/components/shared/DemoBadge'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { mockTickerSentiment, mockNarratives } from '@/lib/data/mockSocialData'
import { getSentimentLabel, getSentimentColor, getHypeRiskLabel, getHypeRiskColor } from '@/lib/scoring/socialScoring'

function generateMentionData(base: number) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date()
    day.setDate(day.getDate() - (6 - i))
    const label = day.toLocaleDateString('en-US', { weekday: 'short' })
    const val = Math.max(0, Math.round(base * (0.7 + Math.random() * 0.6)))
    return { day: label, mentions: val }
  })
}

export default function SocialTickerPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params)
  const ticker = symbol.toUpperCase()
  const data = mockTickerSentiment[ticker]
  const relatedNarratives = mockNarratives.filter(n => n.relatedAssets.includes(ticker))

  if (!data) {
    return (
      <div className="min-h-full px-6 py-10">
        <Link href="/social" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink-lo)] hover:text-[var(--ai)] mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Social Scanner
        </Link>
        <div className="card p-8 text-center max-w-md mx-auto">
          <p className="text-[var(--ink-dim)] text-[14px]">No social data available for <span className="font-bold font-mono-nums text-[var(--ink-hi)]">{ticker}</span></p>
          <p className="text-[12px] text-[var(--ink-dim)] mt-1">Try: NVDA, TSLA, BTC, AMD, META</p>
        </div>
      </div>
    )
  }

  const mentionData = generateMentionData(data.mentionVolume / 7)
  const sentimentColor = getSentimentColor(data.sentimentScore)
  const hypeColor = getHypeRiskColor(data.hypeRiskScore)
  const sentimentPct = Math.round((data.sentimentScore + 1) / 2 * 100)

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
        <Link href="/social" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink-lo)] hover:text-[var(--ai)] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Social Scanner
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--social)' }}>SOCIAL SENTIMENT</span>
              <DemoBadge />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-mono-nums text-[var(--ink-hi)]">{ticker}</h1>
              <span className="text-[16px] text-[var(--ink-lo)]">{data.name}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-[var(--ink-dim)] mb-0.5">24h Mentions</p>
            <p className="text-2xl font-bold font-mono-nums text-[var(--ink-hi)]">{data.mentionVolume.toLocaleString()}</p>
            <p className="text-[12px] font-semibold" style={{ color: data.mentionChange24h >= 0 ? 'var(--up)' : 'var(--down)' }}>
              {data.mentionChange24h >= 0 ? '+' : ''}{data.mentionChange24h}% vs yesterday
            </p>
          </div>
        </div>

        {/* Two-column */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left 2/3 */}
          <div className="col-span-2 space-y-4">
            {/* Sentiment Gauge */}
            <div className="card p-5">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-4">Sentiment Overview</h3>
              <div className="flex items-center gap-6 mb-4">
                {/* Gauge-style circle */}
                <div className="relative flex-shrink-0">
                  <svg width="88" height="88" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="38" fill="none" stroke="var(--bg-3)" strokeWidth="7" />
                    <circle
                      cx="44" cy="44" r="38"
                      fill="none"
                      stroke={sentimentColor}
                      strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 38 * sentimentPct / 100} ${2 * Math.PI * 38 * (1 - sentimentPct / 100)}`}
                      strokeDashoffset={2 * Math.PI * 38 * 0.25}
                      strokeLinecap="round"
                    />
                    <text x="44" y="40" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--ink-hi)"
                      fontFamily="JetBrains Mono, monospace">{sentimentPct}</text>
                    <text x="44" y="54" textAnchor="middle" fontSize="9" fill="var(--ink-dim)">/ 100</text>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold font-display mb-1" style={{ color: sentimentColor }}>
                    {getSentimentLabel(data.sentimentScore)}
                  </p>
                  <div className="space-y-2 mt-2">
                    {[
                      { label: 'Bullish', pct: data.bullishPct, color: 'var(--up)' },
                      { label: 'Bearish', pct: data.bearishPct, color: 'var(--down)' },
                      { label: 'Neutral', pct: data.neutralPct, color: 'var(--ink-dim)' },
                    ].map(({ label, pct, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold w-14" style={{ color }}>{label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-3)]">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="text-[11px] font-mono-nums text-[var(--ink-md)] w-10 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mention Volume Chart */}
            <div className="card p-5">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-4">Mention Volume (7d)</h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={mentionData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--ink-dim)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--ink-dim)' }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                    cursor={{ fill: 'var(--bg-2)' }}
                    formatter={(val) => {
                      const v = Array.isArray(val) ? val[0] : val
                      return [typeof v === 'number' ? v.toLocaleString() : String(v ?? ''), 'Mentions'] as [string, string]
                    }}
                  />
                  <Bar dataKey="mentions" radius={[3, 3, 0, 0]}>
                    {mentionData.map((_, i) => (
                      <Cell key={i} fill={i === mentionData.length - 1 ? 'var(--social)' : 'var(--bg-3)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Posts */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <h3 className="text-[13px] font-semibold text-[var(--ink-hi)]">Recent Posts</h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {data.recentPosts.map((post, i) => {
                  const postSentColor = post.sentiment === 'bullish' ? 'var(--up)' : post.sentiment === 'bearish' ? 'var(--down)' : 'var(--ink-dim)'
                  return (
                    <div key={i} className="p-4 hover:bg-[var(--bg-2)] transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-[var(--ai)]">{post.platform}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold capitalize flex items-center gap-1" style={{ color: postSentColor }}>
                            {post.sentiment === 'bullish' ? <TrendingUp className="w-3 h-3" /> : post.sentiment === 'bearish' ? <TrendingDown className="w-3 h-3" /> : null}
                            {post.sentiment}
                          </span>
                          <span className="text-[10px] text-[var(--ink-dim)]">{post.engagement.toLocaleString()} engmt · {post.time}</span>
                          <ExternalLink className="w-3 h-3 text-[var(--ink-dim)] hover:text-[var(--ai)] cursor-pointer" />
                        </div>
                      </div>
                      <p className="text-[12px] text-[var(--ink-md)] leading-relaxed">&quot;{post.text}&quot;</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right 1/3 */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="card p-4 space-y-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Key Metrics</h3>
              {[
                { label: 'Velocity Score', value: `${data.velocityScore}`, color: 'var(--social)', sub: 'out of 100' },
                { label: 'Hype Risk', value: getHypeRiskLabel(data.hypeRiskScore), color: hypeColor, sub: `${data.hypeRiskScore}/100` },
              ].map(({ label, value, color, sub }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-1">{label}</p>
                  <p className="text-xl font-bold font-mono-nums leading-none" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-[var(--ink-dim)] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Platform Breakdown */}
            <div className="card p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-3">Platform Split</h3>
              <div className="space-y-2">
                {[
                  { label: 'X (Twitter)', pct: data.platforms.twitter, color: '#1DA1F2' },
                  { label: 'Reddit', pct: data.platforms.reddit, color: '#FF4500' },
                  { label: 'TikTok', pct: data.platforms.tiktok, color: '#69C9D0' },
                  { label: 'Discord', pct: data.platforms.discord, color: '#5865F2' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--ink-lo)] w-16 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-3)]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-[10px] font-mono-nums text-[var(--ink-md)] w-7 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Topics */}
            <div className="card p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-3">Top Topics</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.topTopics.map(topic => (
                  <span key={topic}
                    className="px-2 py-0.5 rounded text-[11px] font-medium"
                    style={{ background: 'rgba(109,40,217,0.08)', color: 'var(--social)', border: '1px solid rgba(109,40,217,0.15)' }}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Related Narratives */}
            {relatedNarratives.length > 0 && (
              <div className="card p-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-3">Related Narratives</h3>
                <div className="space-y-2">
                  {relatedNarratives.map(n => (
                    <button
                      key={n.id}
                      onClick={() => {/* link back to social with narrative */}}
                      className="w-full text-left p-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
                    >
                      <p className="text-[12px] font-semibold text-[var(--ink-hi)]">{n.name}</p>
                      <p className="text-[10px] text-[var(--ink-dim)]">Velocity {n.velocityScore} · {n.trend}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  )
}
