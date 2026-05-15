'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  ChevronRight, Sparkles, TrendingUp, TrendingDown,
  Clock, AlertTriangle, ExternalLink, Flame, Zap, BarChart2
} from 'lucide-react'
import type { MarketAsset, SocialSentiment, PoliticianTrade } from '@/types'
import type { PricePoint, NewsItem } from '@/lib/data/mockMarketData'
import ChangeChip from '@/components/shared/ChangeChip'
import ConfidenceBadge from '@/components/shared/ConfidenceBadge'
import SourceBadge from '@/components/shared/SourceBadge'
import DemoBadge from '@/components/shared/DemoBadge'
import ExplainMovePanel from '@/components/ai/ExplainMovePanel'
import { generatePriceSeries } from '@/lib/data/mockMarketData'

interface AssetDetailClientProps {
  asset: MarketAsset
  socialSentiment?: SocialSentiment
  politicianTrades: PoliticianTrade[]
  newsItems: NewsItem[]
}

const TIMEFRAMES = ['1H', '1D', '5D', '1M', '6M', '1Y', '5Y', 'All'] as const
type Timeframe = typeof TIMEFRAMES[number]

function getSeriesConfig(tf: Timeframe): { points: number; interval: '1h' | '1d' } {
  switch (tf) {
    case '1H': return { points: 60, interval: '1h' }
    case '1D': return { points: 24, interval: '1h' }
    case '5D': return { points: 5 * 8, interval: '1h' }
    case '1M': return { points: 30, interval: '1d' }
    case '6M': return { points: 180, interval: '1d' }
    case '1Y': return { points: 252, interval: '1d' }
    case '5Y': return { points: 260, interval: '1d' }
    case 'All': return { points: 500, interval: '1d' }
    default: return { points: 24, interval: '1h' }
  }
}

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toFixed(2)
}

function formatVolume(vol?: number): string {
  if (!vol) return 'N/A'
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(0)}M`
  return `${(vol / 1e3).toFixed(0)}K`
}

function formatMarketCap(cap?: number): string {
  if (!cap) return 'N/A'
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(0)}B`
  return `$${(cap / 1e6).toFixed(0)}M`
}

interface TooltipPayload {
  value: number
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-2.5 py-1.5 rounded border text-[11px]"
      style={{
        background: 'var(--bg-1)',
        borderColor: 'var(--border-md)',
        boxShadow: 'var(--shadow-sm)',
        fontFamily: 'var(--font-jetbrains-mono, monospace)',
      }}
    >
      <p style={{ color: 'var(--ink-dim)' }}>{label}</p>
      <p className="font-semibold" style={{ color: 'var(--ink-hi)' }}>
        ${formatPrice(payload[0].value)}
      </p>
    </div>
  )
}

export default function AssetDetailClient({
  asset, socialSentiment, politicianTrades, newsItems
}: AssetDetailClientProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1D')
  const [explainOpen, setExplainOpen] = useState(false)

  const isPositive = asset.changePct >= 0
  const strokeColor = isPositive ? 'var(--up)' : 'var(--down)'
  const fillColor = isPositive ? 'rgba(4,120,87,0.12)' : 'rgba(220,38,38,0.08)'

  const config = getSeriesConfig(activeTimeframe)
  const trend = isPositive ? 1 : -1
  const priceData: PricePoint[] = generatePriceSeries(
    asset.price,
    config.points,
    trend,
    0.008,
    config.interval
  )

  const tickInterval = Math.floor(priceData.length / 6)

  // Exchange label
  const exchangeLabel = asset.assetClass === 'CRYPTO' ? 'CRYPTO'
    : asset.assetClass === 'ETF' ? 'NYSE ARCA'
    : 'NASDAQ'

  // Key stats
  const stats = [
    { label: 'Open', value: `$${formatPrice(asset.price * 0.9972)}` },
    { label: 'High', value: `$${formatPrice(asset.price * 1.0084)}` },
    { label: 'Low', value: `$${formatPrice(asset.price * 0.9886)}` },
    { label: 'Volume', value: formatVolume(asset.volume) },
    { label: 'Mkt Cap', value: formatMarketCap(asset.marketCap) },
    { label: '52W High', value: `$${formatPrice(asset.price * 1.18)}` },
  ]

  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-1.5 px-6 py-2 border-b text-[11px]"
        style={{ borderColor: 'var(--border)', color: 'var(--ink-dim)' }}
      >
        <Link href="/markets" className="hover:text-[var(--ink-md)] transition-colors">
          Markets
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span style={{ color: 'var(--ink-lo)' }}>
          {asset.assetClass === 'CRYPTO' ? 'Crypto' : asset.sector || 'Equities'}
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold" style={{ color: 'var(--ink-hi)' }}>{asset.symbol}</span>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Asset Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo placeholder */}
            <div
              className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-[14px] font-bold flex-shrink-0"
              style={{
                background: 'var(--ai-soft)',
                color: 'var(--ai)',
                fontFamily: 'var(--font-jetbrains-mono, monospace)',
              }}
            >
              {asset.symbol.slice(0, 2)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-bold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-sora, sans-serif)' }}>
                  {asset.name}
                </h1>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                  style={{ borderColor: 'var(--border-md)', color: 'var(--ink-lo)' }}
                >
                  {exchangeLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--ink-md)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  {asset.symbol}
                </span>
                {asset.sector && (
                  <span className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>· {asset.sector}</span>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-4">
            <div className="text-right">
              <p
                className="text-[28px] font-bold leading-none"
                style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              >
                ${formatPrice(asset.price)}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <ChangeChip value={asset.changePct} size="md" showIcon />
                <span className="text-[12px]" style={{ color: isPositive ? 'var(--up)' : 'var(--down)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                  {isPositive ? '+' : ''}${Math.abs(asset.changeAmt).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Explain button */}
            <button
              onClick={() => setExplainOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium transition-all"
              style={{
                background: 'var(--ai-soft)',
                color: 'var(--ai)',
                border: '1px solid rgba(8,145,178,0.25)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Explain This Move
            </button>
          </div>
        </div>

        {/* Chart Card */}
        <div className="card p-5">
          {/* Timeframe tabs */}
          <div className="flex items-center gap-1 mb-4">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className="px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                style={{
                  background: activeTimeframe === tf ? 'var(--bg-3)' : 'transparent',
                  color: activeTimeframe === tf ? 'var(--ink-hi)' : 'var(--ink-dim)',
                  fontFamily: 'var(--font-jetbrains-mono, monospace)',
                }}
              >
                {tf}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1">
              <DemoBadge />
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#047857' : '#DC2626'} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={isPositive ? '#047857' : '#DC2626'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'var(--ink-dim)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  tickLine={false}
                  axisLine={false}
                  interval={tickInterval}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--ink-dim)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v.toFixed(0)}`}
                  domain={['auto', 'auto']}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  fill={`url(#grad-${asset.symbol})`}
                  dot={false}
                  activeDot={{ r: 3, fill: strokeColor, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {stats.map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink-dim)' }}>
                  {label}
                </p>
                <p
                  className="text-[12px] font-semibold"
                  style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Explain stripe */}
        <div
          className="rounded-[var(--radius-lg)] p-4"
          style={{
            border: '1px solid rgba(8,145,178,0.25)',
            background: 'rgba(8,145,178,0.04)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'var(--ai-soft)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--ai)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--ai)' }}>
                    AI Brief
                  </span>
                  <ConfidenceBadge level="high" />
                  <DemoBadge />
                </div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--ink-hi)' }}>
                  {asset.symbol} moved on {isPositive ? 'strong positive' : 'notable negative'} catalysts.
                  {' '}Public filings, macro signals, and social sentiment all analyzed.
                  {' '}See full breakdown →
                </p>
              </div>
            </div>
            <button
              onClick={() => setExplainOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium flex-shrink-0 transition-colors hover:opacity-80"
              style={{
                background: 'var(--ai)',
                color: '#fff',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Full Analysis
            </button>
          </div>
        </div>

        {/* Three columns: Smart Money + Social + News */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Smart Money mini */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" style={{ color: 'var(--ai)' }} />
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Smart Money</h3>
            </div>
            {politicianTrades.length > 0 ? (
              <div className="space-y-3">
                {politicianTrades.slice(0, 3).map((trade) => (
                  <div
                    key={trade.id}
                    className="p-3 rounded-[var(--radius-sm)]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-semibold" style={{ color: 'var(--ink-hi)' }}>
                        {trade.politicianName}
                      </p>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: trade.transactionType === 'Purchase' ? 'rgba(4,120,87,0.1)' : 'rgba(220,38,38,0.1)',
                          color: trade.transactionType === 'Purchase' ? 'var(--up)' : 'var(--down)',
                        }}
                      >
                        {trade.transactionType}
                      </span>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>
                      {trade.chamber} · {trade.party}
                    </p>
                    {trade.valueRange && (
                      <p className="text-[11px] font-medium mt-1" style={{ color: 'var(--ink-md)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                        {trade.valueRange}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3" style={{ color: 'var(--warn)' }} />
                      <span className="text-[10px]" style={{ color: 'var(--warn)' }}>
                        {trade.reportingDelayDays}d delay
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px]" style={{ color: 'var(--ink-dim)' }}>
                No recent congressional disclosures found for {asset.symbol}.
              </p>
            )}
          </div>

          {/* Social mini */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4" style={{ color: 'var(--social)' }} />
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Social Sentiment</h3>
            </div>
            {socialSentiment ? (
              <div className="space-y-3">
                {/* Sentiment score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>Sentiment</span>
                    <span
                      className="text-[12px] font-semibold"
                      style={{
                        color: socialSentiment.sentimentScore > 0.6 ? 'var(--up)'
                          : socialSentiment.sentimentScore > 0.4 ? 'var(--warn)'
                          : 'var(--down)',
                      }}
                    >
                      {socialSentiment.sentimentScore > 0.6 ? 'Bullish' : socialSentiment.sentimentScore > 0.4 ? 'Mixed' : 'Bearish'}
                      {' '}({socialSentiment.sentimentScore.toFixed(2)})
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(socialSentiment.bullishPct ?? 50)}%`, background: 'var(--up)' }}
                    />
                  </div>
                </div>
                {/* Mentions */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>Mentions (24h)</span>
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                    {(socialSentiment.mentionVolume / 1000).toFixed(0)}K
                  </span>
                </div>
                {/* Hype risk */}
                {socialSentiment.hypeRiskScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>Hype Risk</span>
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        color: socialSentiment.hypeRiskScore > 70 ? 'var(--down)'
                          : socialSentiment.hypeRiskScore > 40 ? 'var(--warn)'
                          : 'var(--up)',
                      }}
                    >
                      {socialSentiment.hypeRiskScore}/100
                    </span>
                  </div>
                )}
                {/* Topics */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {socialSentiment.topTopics?.map((topic) => (
                    <span
                      key={topic}
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-3)', color: 'var(--ink-lo)' }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[12px]" style={{ color: 'var(--ink-dim)' }}>
                No social sentiment data available.
              </p>
            )}
          </div>

          {/* News mini */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
              <h3 className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>Recent News</h3>
            </div>
            {newsItems.length > 0 ? (
              <div className="space-y-3">
                {newsItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="group">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{
                          background: item.sentiment === 'positive' ? 'var(--up)'
                            : item.sentiment === 'negative' ? 'var(--down)'
                            : 'var(--ink-dim)',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium leading-snug mb-1" style={{ color: 'var(--ink-hi)' }}>
                          {item.headline}
                        </p>
                        <div className="flex items-center gap-2">
                          <SourceBadge name={item.source} verified={item.verified} />
                          <span className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{item.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px]" style={{ color: 'var(--ink-dim)' }}>
                No recent news found.
              </p>
            )}
          </div>
        </div>

        {/* Macro Context Strip */}
        <div
          className="rounded-[var(--radius-md)] p-4"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
            <h3 className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-lo)' }}>
              Macro Context
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '10Y Yield', value: '4.28%', change: '-0.06%', down: true },
              { label: 'CPI YoY', value: '3.4%', change: 'vs 3.5% est', down: false },
              { label: 'DXY', value: '104.38', change: '+0.22%', down: false },
              { label: 'VIX', value: '13.42', change: '-4.82%', down: true },
            ].map(({ label, value, change, down }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink-dim)' }}>
                  {label}
                </p>
                <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                  {value}
                </p>
                <p className="text-[10px]" style={{ color: down ? 'var(--down)' : 'var(--up)' }}>
                  {change}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="flex items-start gap-2 p-3 rounded"
          style={{ background: 'rgba(180,83,9,0.05)', border: '1px solid rgba(180,83,9,0.12)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--warn)' }}>
            Oswol provides market data, public-disclosure summaries, and AI-generated educational analysis.
            It does not provide investment advice. Data is demo only — verify all information before making decisions.
          </p>
        </div>
      </div>

      {/* ExplainMovePanel */}
      <ExplainMovePanel
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
        symbol={asset.symbol}
        changePct={asset.changePct}
      />
    </div>
  )
}
