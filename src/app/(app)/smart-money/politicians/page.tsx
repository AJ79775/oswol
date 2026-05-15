'use client'

import Link from 'next/link'
import { ArrowLeft, Clock, AlertTriangle, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import DemoBadge from '@/components/shared/DemoBadge'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { mockAllPoliticianTrades } from '@/lib/data/mockSmartMoney'
import { getSignalColor, getSignalLabel } from '@/lib/scoring/signalScoring'

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

export default function PoliticiansPage() {
  const buys = mockAllPoliticianTrades.filter(t => t.transactionType === 'Purchase')
  const sells = mockAllPoliticianTrades.filter(t => t.transactionType === 'Sale')

  return (
    <div className="min-h-full">
      {/* Demo Banner */}
      <div className="flex items-center gap-2 px-6 py-2.5 text-[12px]"
        style={{ background: 'rgba(180,83,9,0.06)', borderBottom: '1px solid rgba(180,83,9,0.12)' }}>
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
        <span style={{ color: 'var(--warn)' }}>Demo data only — no real congressional disclosures shown.</span>
      </div>

      <div className="px-6 py-6">
        <Link href="/smart-money" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink-lo)] hover:text-[var(--ai)] mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Smart Money Radar
        </Link>

        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--ai)]">STOCK ACT DISCLOSURES</span>
              <DemoBadge />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink-hi)] font-display">Politician Trades</h1>
            <p className="text-[13px] text-[var(--ink-lo)] mt-1">
              Congressional trade disclosures. Members have up to 45 days after a transaction to file.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="card px-4 py-3 text-center">
              <p className="text-lg font-bold text-[var(--up)] font-mono-nums">{buys.length}</p>
              <p className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wide">Buys</p>
            </div>
            <div className="card px-4 py-3 text-center">
              <p className="text-lg font-bold text-[var(--down)] font-mono-nums">{sells.length}</p>
              <p className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wide">Sells</p>
            </div>
          </div>
        </div>

        {/* Delay Warning */}
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5"
          style={{ background: 'rgba(180,83,9,0.05)', border: '1px solid rgba(180,83,9,0.18)' }}>
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
          <p className="text-[12px] text-[var(--ink-md)]">
            <span className="font-bold text-[var(--ink-hi)]">Trade date ≠ filing date.</span>{' '}
            Every delay shown in the table below represents actual time between when a trade occurred and when it was disclosed.
            This is a structural limitation — not a data error. Trades reported more than 30 days late should be treated as
            historical context, not actionable signals.
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-[13px] font-semibold text-[var(--ink-hi)]">Congressional Disclosures</h2>
            <DemoBadge />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-2)]">
                  {['Politician', 'Chamber/Party', 'Action', 'Ticker', 'Value', 'Trade Date', 'Filed', 'Delay', 'Signal'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {mockAllPoliticianTrades.map((t, i) => {
                  const score = t.signalScore ?? 0
                  const color = getSignalColor(score)
                  const label = getSignalLabel(score)
                  const isBuy = t.transactionType === 'Purchase'
                  const delayColor = t.reportingDelayDays > 30 ? 'var(--warn)' : t.reportingDelayDays > 5 ? 'var(--warn)' : 'var(--up)'
                  const delayBg = t.reportingDelayDays > 30 ? 'rgba(180,83,9,0.10)' : t.reportingDelayDays > 5 ? 'rgba(180,83,9,0.06)' : 'rgba(4,120,87,0.08)'

                  return (
                    <tr key={t.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors ${i % 2 === 0 ? '' : 'bg-[rgba(0,0,0,0.01)]'}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--ink-hi)]">{t.politicianName}</p>
                        <p className="text-[10px] text-[var(--ink-dim)]">{t.stateOrDistrict}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold" style={{ color: t.party === 'Democrat' ? '#3B82F6' : '#EF4444' }}>
                          {t.party[0]}
                        </span>
                        <span className="text-[11px] text-[var(--ink-lo)] ml-1">{t.chamber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold"
                          style={{ color: isBuy ? 'var(--up)' : 'var(--down)' }}>
                          {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {t.transactionType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold font-mono-nums text-[var(--ink-hi)]">{t.ticker}</span>
                        <p className="text-[10px] text-[var(--ink-dim)] truncate max-w-[90px]">{t.companyName}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-md)] font-mono-nums text-[12px]">{t.valueRange ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--ink-lo)]">{formatDate(t.transactionDate)}</td>
                      <td className="px-4 py-3 text-[var(--ink-lo)]">{formatDate(t.disclosureDate)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono-nums"
                          style={{ color: delayColor, background: delayBg, border: `1px solid ${delayColor}30` }}>
                          <Clock className="w-2.5 h-2.5" />{t.reportingDelayDays}d
                        </span>
                        {t.reportingDelayDays > 30 && (
                          <p className="text-[9px] text-[var(--warn)] mt-0.5">Late disclosure</p>
                        )}
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
