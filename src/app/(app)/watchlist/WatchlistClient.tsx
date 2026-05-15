'use client'

import { useState } from 'react'
import { BookMarked, Plus, X, Sparkles, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import Sparkline from '@/components/shared/Sparkline'
import ChangeChip from '@/components/shared/ChangeChip'
import SourceBadge from '@/components/shared/SourceBadge'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { mockWatchlistItems } from '@/lib/data/mockMarketData'

const SMART_MONEY_SIGNALS: Record<string, { label: string; color: string; bg: string }> = {
  NVDA: { label: 'Strong Buy', color: 'var(--up)', bg: 'rgba(4,120,87,0.1)' },
  AMD: { label: 'Notable Buy', color: 'var(--up)', bg: 'rgba(4,120,87,0.08)' },
  MSFT: { label: 'Neutral', color: 'var(--ink-lo)', bg: 'var(--bg-3)' },
  META: { label: 'Moderate', color: 'var(--ai)', bg: 'var(--ai-soft)' },
  BTC: { label: 'Momentum', color: 'var(--social)', bg: 'rgba(109,40,217,0.1)' },
}

const AI_SIGNALS: Record<string, string> = {
  NVDA: 'Q1 beat + Blackwell ramp — strong near-term catalyst',
  AMD: 'MI300X gaining share, Lisa Su buy boosts confidence',
  MSFT: 'Copilot monetization slow; Azure growth intact',
  META: 'Ad revenue accelerating, LLaMA cost advantage',
  BTC: 'ETF inflows sustaining — watch halving narrative',
}

const SOCIAL_SCORES: Record<string, number> = {
  NVDA: 82,
  AMD: 71,
  MSFT: 48,
  META: 64,
  BTC: 74,
}

function SocialBar({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--up)' : score >= 50 ? 'var(--ai)' : 'var(--warn)'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{score}</span>
    </div>
  )
}

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toFixed(2)
}

export default function WatchlistClient() {
  const [items, setItems] = useState(mockWatchlistItems)
  const [briefGenerated, setBriefGenerated] = useState(false)

  function removeItem(symbol: string) {
    setItems(prev => prev.filter(a => a.symbol !== symbol))
  }

  function generateBrief() {
    setBriefGenerated(true)
    setTimeout(() => setBriefGenerated(false), 3000)
  }

  const nvdaItem = items.find(a => a.symbol === 'NVDA')
  const amdItem = items.find(a => a.symbol === 'AMD')
  const btcItem = items.find(a => a.symbol === 'BTC')
  const metaItem = items.find(a => a.symbol === 'META')
  const msftItem = items.find(a => a.symbol === 'MSFT')

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookMarked className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
                Intelligence
              </span>
            </div>
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-display, sans-serif)' }}>
              Watchlist Intelligence
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>
              Track assets with AI analysis, smart money signals, and social sentiment
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors"
            style={{ background: 'var(--ai)', color: 'white' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add asset
          </button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* AI Watchlist Brief */}
        <div
          className="rounded-[var(--radius-lg)] p-5 relative overflow-hidden"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
        >
          {/* Left cyan stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-lg)]" style={{ background: 'var(--ai)' }} />

          <div className="pl-3">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'var(--ai-soft)', color: 'var(--ai)', border: '1px solid rgba(8,145,178,0.2)' }}
                >
                  AI WATCHLIST BRIEF
                </div>
              </div>
              <button
                onClick={generateBrief}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-medium transition-all"
                style={{ background: 'var(--bg-2)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
              >
                <RefreshCw className={`w-3 h-3 ${briefGenerated ? 'animate-spin' : ''}`} />
                {briefGenerated ? 'Generating...' : 'Generate new brief'}
              </button>
            </div>

            <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--ink-hi)' }}>
              Your {items.length} watchlist assets are mixed.{' '}
              {nvdaItem && amdItem && (
                <>Tech leaders <strong>NVDA ({nvdaItem.changePct >= 0 ? '+' : ''}{nvdaItem.changePct.toFixed(2)}%)</strong> and{' '}
                <strong>AMD ({amdItem.changePct >= 0 ? '+' : ''}{amdItem.changePct.toFixed(2)}%)</strong> are outperforming. </>
              )}
              {btcItem && <>BTC showing momentum. </>}
              {metaItem && <>META positive. </>}
              {msftItem && <>MSFT flat. </>}
              Overall portfolio sentiment: <span style={{ color: 'var(--up)', fontWeight: 600 }}>risk-on</span>.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="px-3 py-2.5 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-2)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--ink-dim)' }}>Dominant theme</p>
                <p className="text-[13px] font-medium" style={{ color: 'var(--ink-hi)' }}>AI Infrastructure Buildout</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>Capex tailwind driving semis + hyperscalers</p>
              </div>
              <div className="px-3 py-2.5 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-2)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--ink-dim)' }}>Risk exposure</p>
                <p className="text-[13px] font-medium" style={{ color: 'var(--warn)' }}>Rate sensitivity · PCE print Friday</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>Fed cut timeline still uncertain</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <SourceBadge name="NVDA Q1 Earnings" verified={true} />
              <SourceBadge name="SEC EDGAR" verified={true} />
              <SourceBadge name="Social Velocity" verified={false} />
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-10 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                  <div className="h-full rounded-full" style={{ width: '74%', background: 'var(--ai)' }} />
                </div>
                <span className="text-[10px] font-semibold font-mono" style={{ color: 'var(--ai)' }}>74% confidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Watchlist Table */}
        {items.length > 0 ? (
          <div
            className="rounded-[var(--radius-lg)] overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-1)', boxShadow: 'var(--shadow-sm)' }}
          >
            {/* Table header */}
            <div
              className="grid items-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1.5fr 2fr 40px',
                color: 'var(--ink-dim)',
                background: 'var(--bg-2)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span>Asset</span>
              <span>Price</span>
              <span>Change</span>
              <span>Sparkline</span>
              <span>Social</span>
              <span>Smart Money</span>
              <span>AI Signal</span>
              <span></span>
            </div>

            {/* Rows */}
            {items.map((asset, i) => {
              const smartMoney = SMART_MONEY_SIGNALS[asset.symbol] || { label: 'Unknown', color: 'var(--ink-lo)', bg: 'var(--bg-3)' }
              const aiSignal = AI_SIGNALS[asset.symbol] || 'Insufficient data for analysis'
              const socialScore = SOCIAL_SCORES[asset.symbol] || 50

              return (
                <a
                  key={asset.symbol}
                  href={`/markets/${asset.symbol}`}
                  className="grid items-center px-4 py-3 transition-colors hover:opacity-90"
                  style={{
                    gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1.5fr 2fr 40px',
                    borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'var(--bg-1)',
                  }}
                  onClick={e => {
                    const target = e.target as HTMLElement
                    if (target.closest('button')) e.preventDefault()
                  }}
                >
                  {/* Asset */}
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {asset.symbol}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--ink-dim)', maxWidth: 120 }}>{asset.name}</p>
                  </div>

                  {/* Price */}
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-mono, monospace)' }}>
                    {formatPrice(asset.price)}
                  </span>

                  {/* Change */}
                  <ChangeChip value={asset.changePct} showIcon size="xs" />

                  {/* Sparkline */}
                  {asset.sparkline ? (
                    <Sparkline data={asset.sparkline} positive={asset.changePct >= 0} width={60} height={28} />
                  ) : (
                    <span className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>—</span>
                  )}

                  {/* Social */}
                  <SocialBar score={socialScore} />

                  {/* Smart Money */}
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold w-fit"
                    style={{ color: smartMoney.color, background: smartMoney.bg }}
                  >
                    {smartMoney.label}
                  </span>

                  {/* AI Signal */}
                  <p className="text-[11px] leading-snug pr-2" style={{ color: 'var(--ink-md)' }}>
                    {aiSignal}
                  </p>

                  {/* Remove */}
                  <button
                    onClick={e => { e.preventDefault(); removeItem(asset.symbol) }}
                    className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:opacity-70"
                    style={{ color: 'var(--ink-dim)' }}
                    title={`Remove ${asset.symbol}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </a>
              )
            })}
          </div>
        ) : (
          /* Empty state */
          <div
            className="rounded-[var(--radius-lg)] py-20 text-center"
            style={{ border: '2px dashed var(--border-md)', background: 'var(--bg-2)' }}
          >
            <BookMarked className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--ink-dim)' }} />
            <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--ink-hi)' }}>No assets in watchlist</p>
            <p className="text-[13px] mb-4" style={{ color: 'var(--ink-lo)' }}>
              Add assets to track with AI analysis and smart money signals
            </p>
            <button
              onClick={() => setItems(mockWatchlistItems)}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium"
              style={{ background: 'var(--ai)', color: 'white' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add demo assets
            </button>
          </div>
        )}

        {/* Quick add suggestion */}
        {items.length > 0 && items.length < 8 && (
          <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--ink-dim)' }}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add more assets to track:</span>
            {['TSLA', 'GOOGL', 'AAPL', 'ETH'].filter(s => !items.find(a => a.symbol === s)).map(symbol => (
              <button
                key={symbol}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors hover:opacity-80"
                style={{ background: 'var(--bg-2)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
              >
                {symbol}
              </button>
            ))}
          </div>
        )}
      </div>

      <DisclaimerFooter />
    </div>
  )
}
