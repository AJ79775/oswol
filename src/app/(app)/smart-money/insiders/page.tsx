'use client'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle, ExternalLink, TrendingUp, TrendingDown, Info } from 'lucide-react'
import DemoBadge from '@/components/shared/DemoBadge'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { mockAllInsiderTrades } from '@/lib/data/mockSmartMoney'
import { getSignalColor, getSignalLabel } from '@/lib/scoring/signalScoring'

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

function formatValue(v?: number): string {
  if (!v) return '—'
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

export default function InsidersPage() {
  const openMarketBuys = mockAllInsiderTrades.filter(t => t.isOpenMarketPurchase && t.transactionType === 'Purchase')
  const planned = mockAllInsiderTrades.filter(t => t.is10b5_1)

  return (
    <div className="min-h-full">
      <div className="flex items-center gap-2 px-6 py-2.5 text-[12px]"
        style={{ background: 'rgba(180,83,9,0.06)', borderBottom: '1px solid rgba(180,83,9,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
        <span style={{ color: 'var(--warn)' }}>Demo data only — no real SEC Form 4 data shown.</span>
      </div>

      <div className="px-6 py-6">
        <Link href="/smart-money" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink-lo)] hover:text-[var(--ai)] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Smart Money Radar
        </Link>

        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--ai)]">SEC FORM 4</span>
              <DemoBadge />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink-hi)] font-display">Insider Trades</h1>
            <p className="text-[13px] text-[var(--ink-lo)] mt-1">
              Officer and director purchases and sales. Pre-planned 10b5-1 trades are flagged and scored lower.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="card px-4 py-3 text-center">
              <p className="text-lg font-bold text-[var(--up)] font-mono-nums">{openMarketBuys.length}</p>
              <p className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wide">Open Mkt Buys</p>
            </div>
            <div className="card px-4 py-3 text-center">
              <p className="text-lg font-bold text-[var(--ink-dim)] font-mono-nums">{planned.length}</p>
              <p className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wide">10b5-1 Planned</p>
            </div>
          </div>
        </div>

        {/* Context note */}
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5"
          style={{ background: 'rgba(8,145,178,0.05)', border: '1px solid rgba(8,145,178,0.15)' }}>
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--ai)]" />
          <p className="text-[12px] text-[var(--ink-md)]">
            <span className="font-bold text-[var(--ink-hi)]">Signal quality varies significantly.</span>{' '}
            Open market purchases by insiders are generally more informative than pre-planned 10b5-1 sales.
            10b5-1 plans are set up months in advance and do not reflect current management sentiment.
            Focus on open market buys at or below current market prices for the strongest signals.
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-[13px] font-semibold text-[var(--ink-hi)]">Form 4 Filings</h2>
            <DemoBadge />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-2)]">
                  {['Insider', 'Role', 'Ticker', 'Action', 'Shares', 'Price', 'Value', 'Trade Date', 'Filed', 'Type', 'Signal'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {mockAllInsiderTrades.map((t, i) => {
                  const score = t.signalScore ?? 0
                  const color = getSignalColor(score)
                  const label = getSignalLabel(score)
                  const isBuy = t.transactionType === 'Purchase'
                  const filingDelay = Math.max(0, Math.round((new Date(t.filingDate).getTime() - new Date(t.transactionDate).getTime()) / 86400000))

                  return (
                    <tr key={t.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors ${i % 2 === 0 ? '' : 'bg-[rgba(0,0,0,0.01)]'}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--ink-hi)]">{t.insiderName}</p>
                        <p className="text-[10px] text-[var(--ink-dim)]">{t.companyName}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-lo)]">{t.role}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold font-mono-nums text-[var(--ink-hi)]">{t.ticker}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold"
                          style={{ color: isBuy ? 'var(--up)' : 'var(--down)' }}>
                          {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {t.transactionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono-nums text-[var(--ink-md)]">{t.shares?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono-nums text-[var(--ink-md)]">${t.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono-nums text-[var(--ink-md)]">{formatValue(t.value)}</td>
                      <td className="px-4 py-3 text-[var(--ink-lo)]">{formatDate(t.transactionDate)}</td>
                      <td className="px-4 py-3 text-[var(--ink-lo)]">{formatDate(t.filingDate)}</td>
                      <td className="px-4 py-3">
                        {t.is10b5_1 ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-[var(--bg-3)] text-[var(--ink-dim)]">10b5-1</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: 'rgba(4,120,87,0.08)', color: 'var(--up)' }}>Open Mkt</span>
                        )}
                        <p className="text-[9px] text-[var(--ink-dim)] mt-0.5">{filingDelay}d delay</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-3)] min-w-[60px]">
                            <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                          </div>
                          <span className="text-[11px] font-semibold font-mono-nums" style={{ color }}>{score}</span>
                        </div>
                        <p className="text-[10px] text-[var(--ink-dim)] mt-0.5">{label}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ExternalLink className="w-3 h-3 text-[var(--ink-dim)] hover:text-[var(--ai)] cursor-pointer" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DisclaimerFooter />
    </div>
  )
}
