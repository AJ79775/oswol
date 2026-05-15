'use client'

import { MarketAsset, PoliticianTrade, SocialSentiment, HeatmapTile } from '@/types'
import Sparkline from '@/components/shared/Sparkline'
import ChangeChip from '@/components/shared/ChangeChip'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { emitExplainMove } from '@/lib/explainEvents'
import {
  Zap, TrendingUp, AlertTriangle, Calendar, BookMarked,
  Activity, ArrowRight, Clock,
  Flame, BarChart2, Sparkles
} from 'lucide-react'

interface Props {
  indices: MarketAsset[]
  topMovers: MarketAsset[]
  politicianTrades: PoliticianTrade[]
  socialSentiment: SocialSentiment[]
  heatmapData: HeatmapTile[]
  macroEvents: { date: string; label: string; type: string; impact: string }[]
  watchlistItems: MarketAsset[]
}

function formatPrice(price: number, symbol: string): string {
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 100) return price.toFixed(2)
  return price.toFixed(2)
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(0)}B`
  return `$${(cap / 1e6).toFixed(0)}M`
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(0)}M`
  return `${(vol / 1e3).toFixed(0)}K`
}

const signalColors: Record<string, string> = {
  'High Conviction Buy': 'var(--up)',
  'Strong Buy Signal': 'var(--up)',
  'Notable Buy': 'var(--up)',
  'Moderate': 'var(--warn)',
  'Neutral Exit': 'var(--ink-lo)',
  'Planned Sale (10b5-1)': 'var(--ink-lo)',
  'Planned Sale': 'var(--ink-lo)',
}

function HeatmapMini({ tiles }: { tiles: HeatmapTile[] }) {
  const displayed = tiles.slice(0, 40)
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
      {displayed.map((tile) => {
        const pct = tile.changePct
        const intensity = Math.min(Math.abs(pct) / 5, 1)
        const bg = pct >= 0
          ? `rgba(4,120,87,${0.12 + intensity * 0.55})`
          : `rgba(220,38,38,${0.12 + intensity * 0.55})`
        const textColor = intensity > 0.4 ? '#fff' : pct >= 0 ? 'var(--up)' : 'var(--down)'
        return (
          <div
            key={tile.symbol}
            className="flex flex-col items-center justify-center rounded text-center cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: bg, padding: '6px 4px', minHeight: 40 }}
          >
            <span className="text-[10px] font-bold leading-tight" style={{ color: textColor, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
              {tile.symbol}
            </span>
            <span className="text-[9px] leading-tight" style={{ color: textColor, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
              {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardClient({
  indices, topMovers, politicianTrades, socialSentiment,
  heatmapData, macroEvents, watchlistItems,
}: Props) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--ink-hi)] font-display" style={{ fontFamily: 'var(--font-sora, sans-serif)' }}>
              Good morning, Tariq.
            </h1>
            <p className="text-[13px] text-[var(--ink-lo)] mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="demo-badge">
              <AlertTriangle className="w-3 h-3" />
              Demo Data
            </span>
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--ink-lo)] px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-2)] border border-[var(--border)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--up)] animate-pulse" />
              <span>Markets Open · NYSE · 3h 12m left</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* AI Brief Hero Card */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden" style={{ background: 'var(--bg-1)' }}>
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--ai) 0%, rgba(8,145,178,0.4) 100%)' }} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center" style={{ background: 'var(--ai-soft)' }}>
                  <Zap className="w-4 h-4" style={{ color: 'var(--ai)' }} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ai)' }}>AI Brief</span>
                  <p className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>Updated 8:31 AM · 3 key signals</p>
                </div>
              </div>
              <span className="demo-badge">Demo</span>
            </div>

            <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-sora, sans-serif)' }}>
              Tech rally extends as AI semiconductor demand accelerates. Smart money rotates into defensives ahead of FOMC.
            </h2>

            <div className="space-y-2">
              {[
                { label: 'Semiconductor Surge', text: 'NVDA and AMD both up 4%+ on AI infrastructure spend reports. Institutional buying detected at scale.', type: 'up' },
                { label: 'FOMC Watch', text: 'Fed rate decision Wednesday. Market pricing 92% hold. Bond yields falling — positioning for dovish tone.', type: 'warn' },
                { label: 'Social Momentum', text: 'BTC sentiment velocity hitting 6-week highs. 312K mentions/24h. Whale wallets accumulating at $65K level.', type: 'ai' },
              ].map((pt, i) => (
                <div key={i} className="flex gap-3 p-2.5 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-2)' }}>
                  <span className={`text-[11px] font-semibold shrink-0 mt-0.5 ${
                    pt.type === 'up' ? 'text-[var(--up)]' : pt.type === 'warn' ? 'text-[var(--warn)]' : 'text-[var(--ai)]'
                  }`}>
                    {i + 1}.
                  </span>
                  <div>
                    <span className={`text-[11px] font-semibold ${
                      pt.type === 'up' ? 'text-[var(--up)]' : pt.type === 'warn' ? 'text-[var(--warn)]' : 'text-[var(--ai)]'
                    }`}>{pt.label} · </span>
                    <span className="text-[12px]" style={{ color: 'var(--ink-md)' }}>{pt.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3">
              {['STOCK Act', 'SEC EDGAR', 'Social Signals', 'Macro Calendar'].map((src) => (
                <span key={src} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--border-md)', color: 'var(--ink-dim)' }}>
                  {src}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column: Market Pulse + Top Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Market Pulse */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Market Pulse</h3>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
            </div>
            <div className="space-y-3">
              {indices.map((asset) => (
                <div key={asset.symbol} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                        {asset.symbol}
                      </span>
                      <span className="text-[12px]" style={{ color: 'var(--ink-md)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                        {formatPrice(asset.price, asset.symbol)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>{asset.name}</span>
                      <ChangeChip value={asset.changePct} />
                    </div>
                  </div>
                  {asset.sparkline && (
                    <div className="flex-shrink-0">
                      <Sparkline data={asset.sparkline} positive={asset.changePct >= 0} width={60} height={28} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Top Movers Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Top Movers</h3>
              <button className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--ai)' }}>
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topMovers.map((asset) => (
                <div
                  key={asset.symbol}
                  className="card p-3.5 cursor-pointer hover:border-[var(--champagne)] transition-colors group relative"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                        {asset.symbol}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--ink-dim)', maxWidth: 90 }}>{asset.name}</p>
                    </div>
                    <ChangeChip value={asset.changePct} size="xs" />
                  </div>
                  {asset.sparkline && (
                    <div className="my-2">
                      <Sparkline data={asset.sparkline} positive={asset.changePct >= 0} width={120} height={36} />
                    </div>
                  )}
                  <div className="flex items-end justify-between mt-1">
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                        {formatPrice(asset.price, asset.symbol)}
                      </p>
                      {asset.marketCap && asset.marketCap > 0 && (
                        <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>
                          MCap {formatMarketCap(asset.marketCap)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        emitExplainMove(asset.symbol, asset.changePct)
                      }}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
                      style={{
                        background: 'var(--ai-soft)',
                        color: 'var(--ai)',
                        border: '1px solid rgba(8,145,178,0.2)',
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Explain
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Three-column: Smart Money + Social + Macro */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Smart Money Preview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: 'var(--ai)' }} />
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Smart Money</h3>
              </div>
              <button className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--ai)' }}>
                See all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {politicianTrades.slice(0, 3).map((trade) => (
                <div key={trade.id} className="p-3 rounded-[var(--radius-sm)] border" style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--ink-hi)' }}>
                        {trade.politicianName}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>
                        {trade.chamber} · {trade.party}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0`}
                      style={{
                        background: trade.transactionType === 'Purchase' ? 'rgba(4,120,87,0.1)' : 'rgba(220,38,38,0.1)',
                        color: trade.transactionType === 'Purchase' ? 'var(--up)' : 'var(--down)',
                      }}
                    >
                      {trade.transactionType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)', color: 'var(--ink-hi)' }}>
                      {trade.ticker}
                    </span>
                    {trade.valueRange && (
                      <span className="text-[11px]" style={{ color: 'var(--ink-lo)' }}>{trade.valueRange}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock className="w-3 h-3" style={{ color: 'var(--warn)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--warn)' }}>
                      {trade.reportingDelayDays}d disclosure delay
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Narratives Preview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" style={{ color: 'var(--social)' }} />
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Social Pulse</h3>
              </div>
              <button className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--ai)' }}>
                See all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {socialSentiment.map((s) => (
                <div key={s.ticker} className="p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-2)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)', color: 'var(--ink-hi)' }}>
                      {s.ticker}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: s.sentimentScore > 0.6 ? 'var(--up)' : s.sentimentScore > 0.4 ? 'var(--warn)' : 'var(--down)' }}>
                      {s.sentimentScore > 0.6 ? 'Bullish' : s.sentimentScore > 0.4 ? 'Neutral' : 'Bearish'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.bullishPct ?? 50}%`, background: 'var(--up)' }}
                      />
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      {(s.mentionVolume / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.topTopics?.slice(0, 2).map((topic) => (
                      <span key={topic} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-3)', color: 'var(--ink-lo)' }}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Macro Events + Risk Meter */}
          <div className="space-y-4">
            {/* Macro Events */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
                  <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Macro Calendar</h3>
                </div>
              </div>
              <div className="space-y-2">
                {macroEvents.map((ev, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-center flex-shrink-0 w-8">
                      <p className="text-[10px] font-bold" style={{ color: 'var(--warn)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                        {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-[14px] font-bold leading-none" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                        {new Date(ev.date).getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate" style={{ color: 'var(--ink-hi)' }}>{ev.label}</p>
                      <span className={`text-[10px] font-semibold ${ev.impact === 'high' ? 'text-[var(--down)]' : 'text-[var(--warn)]'}`}>
                        {ev.impact === 'high' ? 'High Impact' : 'Medium'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Meter */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
                  <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Risk Sentiment</h3>
                </div>
              </div>
              <div className="text-center py-2">
                <p className="text-[28px] font-bold" style={{ fontFamily: 'var(--font-sora, sans-serif)', color: 'var(--up)' }}>
                  RISK-ON
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--ink-dim)' }}>Equities favored over bonds</p>
                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                  <div className="h-full rounded-full" style={{ width: '72%', background: 'linear-gradient(90deg, var(--up), rgba(4,120,87,0.6))' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: 'var(--down)' }}>Risk-Off</span>
                  <span className="text-[10px]" style={{ color: 'var(--up)' }}>Risk-On</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heat Map Preview + Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Heat Map Preview */}
          <div className="lg:col-span-3 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Market Heat Map</h3>
              </div>
              <a href="/heatmap" className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--ai)' }}>
                Full map <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <HeatmapMini tiles={heatmapData} />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--ink-dim)' }}>
                <span>S&P 500 · Today</span>
                <span className="demo-badge">Demo</span>
              </div>
              <div className="flex items-center gap-1.5">
                {['-5%', '-3%', '-1%', '0', '+1%', '+3%', '+5%'].map((label, i) => {
                  const val = [-5, -3, -1, 0, 1, 3, 5][i]
                  const bg = val === 0 ? 'var(--bg-3)' : val > 0 ? `rgba(4,120,87,${0.15 + Math.abs(val) * 0.12})` : `rgba(220,38,38,${0.15 + Math.abs(val) * 0.12})`
                  return (
                    <div key={label} className="w-4 h-3 rounded-sm" style={{ background: bg }} />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Watchlist */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Watchlist</h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--ai-soft)', color: 'var(--ai)' }}>5</span>
            </div>
            <div className="space-y-2.5">
              {watchlistItems.map((asset) => (
                <div key={asset.symbol} className="flex items-center gap-3 py-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      {asset.symbol}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--ink-dim)' }}>{asset.name}</p>
                  </div>
                  {asset.sparkline && (
                    <Sparkline data={asset.sparkline} positive={asset.changePct >= 0} width={48} height={24} />
                  )}
                  <div className="text-right">
                    <p className="text-[12px] font-medium" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      {formatPrice(asset.price, asset.symbol)}
                    </p>
                    <ChangeChip value={asset.changePct} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  )
}
