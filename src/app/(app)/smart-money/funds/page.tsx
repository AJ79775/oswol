'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, ExternalLink, TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react'
import DemoBadge from '@/components/shared/DemoBadge'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { mockFunds, mockFundHoldings, HedgeFund } from '@/lib/data/mockSmartMoney'
import { getSignalColor, getSignalLabel } from '@/lib/scoring/signalScoring'

function formatValue(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${v.toFixed(0)}`
}

function ActionBadge({ type }: { type: string }) {
  const isBuy = type === 'new position' || type === 'increased'
  const isSell = type === 'reduced' || type === 'exited'
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold capitalize"
      style={{ color: isBuy ? 'var(--up)' : isSell ? 'var(--down)' : 'var(--ink-lo)' }}>
      {isBuy ? <TrendingUp className="w-3 h-3" /> : isSell ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {type}
    </span>
  )
}

export default function FundsPage() {
  const [selectedFund, setSelectedFund] = useState<string | null>(null)

  const displayedHoldings = selectedFund
    ? mockFundHoldings.filter(h => h.fundId === selectedFund)
    : mockFundHoldings

  return (
    <div className="min-h-full">
      <div className="flex items-center gap-2 px-6 py-2.5 text-[12px]"
        style={{ background: 'rgba(180,83,9,0.06)', borderBottom: '1px solid rgba(180,83,9,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
        <span style={{ color: 'var(--warn)' }}>Demo data only — 13F filings have a ~45-day lag from quarter end.</span>
      </div>

      <div className="px-6 py-6">
        <Link href="/smart-money" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink-lo)] hover:text-[var(--ai)] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Smart Money Radar
        </Link>

        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--ai)]">SEC 13F QUARTERLY</span>
              <DemoBadge />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink-hi)] font-display">Hedge Fund Holdings</h1>
            <p className="text-[13px] text-[var(--ink-lo)] mt-1">
              Quarterly 13F filings showing institutional position changes. Data is 45–90 days stale by design.
            </p>
          </div>
        </div>

        {/* Fund Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {mockFunds.map((fund: HedgeFund) => (
            <button
              key={fund.id}
              onClick={() => setSelectedFund(selectedFund === fund.id ? null : fund.id)}
              className={`card text-left p-4 transition-all hover:shadow-md ${selectedFund === fund.id ? 'ring-2 ring-[var(--ai)]' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(216,198,167,0.3)' }}>
                  <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--champagne-deep)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--ink-hi)] truncate">{fund.name}</p>
                  <p className="text-[10px] text-[var(--ink-dim)]">{fund.manager}</p>
                </div>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--ink-lo)]">{fund.aum}</span>
                <span className="text-[var(--ink-dim)]">{fund.quarter}</span>
              </div>
              <p className="text-[10px] text-[var(--ai)] mt-1">{fund.style}</p>
            </button>
          ))}
        </div>

        {selectedFund && (
          <button
            onClick={() => setSelectedFund(null)}
            className="text-[12px] text-[var(--ink-lo)] hover:text-[var(--ai)] mb-3 transition-colors"
          >
            Clear filter — show all funds
          </button>
        )}

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <h2 className="text-[13px] font-semibold text-[var(--ink-hi)]">
                {selectedFund ? `${mockFunds.find(f => f.id === selectedFund)?.name} Holdings` : 'All Fund Holdings'}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-2)] text-[var(--ink-dim)]">
                {displayedHoldings.length} positions
              </span>
            </div>
            <DemoBadge />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-2)]">
                  {['Fund', 'Ticker', 'Company', 'Sector', 'Action', 'Change %', 'Value', 'Wt %', 'Quarter', 'Signal'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {displayedHoldings.map((h, i) => {
                  const score = h.signalScore
                  const color = getSignalColor(score)
                  const label = getSignalLabel(score)
                  return (
                    <tr key={h.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors ${i % 2 === 0 ? '' : 'bg-[rgba(0,0,0,0.01)]'}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--ink-hi)] truncate max-w-[120px]">{h.fundName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold font-mono-nums text-[var(--ink-hi)]">{h.ticker}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-lo)] truncate max-w-[120px]">{h.companyName}</td>
                      <td className="px-4 py-3 text-[var(--ink-dim)] text-[11px]">{h.sector}</td>
                      <td className="px-4 py-3"><ActionBadge type={h.actionType} /></td>
                      <td className="px-4 py-3 font-mono-nums">
                        {h.changePercent !== undefined ? (
                          <span style={{ color: h.changePercent >= 0 ? 'var(--up)' : 'var(--down)' }}>
                            {h.changePercent > 0 ? '+' : ''}{h.changePercent}%
                          </span>
                        ) : (
                          <span className="text-[var(--ink-dim)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono-nums text-[var(--ink-md)]">{formatValue(h.value)}</td>
                      <td className="px-4 py-3 font-mono-nums text-[var(--ink-md)]">{h.portfolioWeight.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-[var(--ink-dim)] text-[11px]">{h.quarter}</td>
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
