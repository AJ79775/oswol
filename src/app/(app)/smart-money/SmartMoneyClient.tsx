'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Building2,
  BarChart3,
  Info,
} from 'lucide-react'
import DemoBadge from '@/components/shared/DemoBadge'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { mockAllPoliticianTrades, mockAllInsiderTrades, mockFundHoldings } from '@/lib/data/mockSmartMoney'
import { getSignalLabel, getSignalColor } from '@/lib/scoring/signalScoring'
import { PoliticianTrade, InsiderTrade } from '@/types'
import { FundHolding } from '@/lib/data/mockSmartMoney'

type Tab = 'all' | 'politicians' | 'insiders' | 'funds'

type UnifiedRow =
  | { kind: 'politician'; data: PoliticianTrade }
  | { kind: 'insider'; data: InsiderTrade }
  | { kind: 'fund'; data: FundHolding }

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

function DelayPill({ days }: { days: number }) {
  const isRed = days > 30
  const isAmber = days > 5
  const color = isRed ? 'var(--warn)' : isAmber ? 'var(--warn)' : 'var(--up)'
  const bg = isRed ? 'rgba(180,83,9,0.10)' : isAmber ? 'rgba(180,83,9,0.06)' : 'rgba(4,120,87,0.08)'
  const border = isRed ? 'rgba(180,83,9,0.25)' : isAmber ? 'rgba(180,83,9,0.15)' : 'rgba(4,120,87,0.20)'

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono-nums"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <Clock className="w-2.5 h-2.5" />
      {days}d
    </span>
  )
}

function SignalBar({ score }: { score: number }) {
  const color = getSignalColor(score)
  const label = getSignalLabel(score)
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-3)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-semibold font-mono-nums" style={{ color }}>
        {score}
      </span>
      <span className="text-[10px] text-[var(--ink-dim)] hidden xl:block">{label}</span>
    </div>
  )
}

function AvatarBadge({ kind }: { kind: 'politician' | 'insider' | 'fund' }) {
  const configs = {
    politician: { label: 'GOV', bg: 'rgba(109,40,217,0.12)', color: '#6D28D9' },
    insider: { label: 'INS', bg: 'rgba(8,145,178,0.12)', color: 'var(--ai)' },
    fund: { label: 'FND', bg: 'rgba(216,198,167,0.30)', color: 'var(--champagne-deep)' },
  }
  const cfg = configs[kind]
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-bold tracking-wide flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

function ActionBadge({ type }: { type: string }) {
  const isBuy = type === 'Purchase' || type === 'increased' || type === 'new position'
  const isExit = type === 'Sale' || type === 'exited' || type === 'reduced'
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold"
      style={{ color: isBuy ? 'var(--up)' : isExit ? 'var(--down)' : 'var(--ink-lo)' }}
    >
      {isBuy ? <TrendingUp className="w-3 h-3" /> : isExit ? <TrendingDown className="w-3 h-3" /> : null}
      {type}
    </span>
  )
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: React.ElementType }) {
  return (
    <div className="card px-4 py-3 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[var(--ai-soft)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[var(--ai)]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] mb-0.5">{label}</p>
        <p className="text-xl font-bold font-mono-nums text-[var(--ink-hi)] leading-none">{value}</p>
        <p className="text-[11px] text-[var(--ink-lo)] mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

export default function SmartMoneyClient() {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: mockAllPoliticianTrades.length + mockAllInsiderTrades.length + mockFundHoldings.length },
    { id: 'politicians', label: 'Politicians', count: mockAllPoliticianTrades.length },
    { id: 'insiders', label: 'Insiders', count: mockAllInsiderTrades.length },
    { id: 'funds', label: 'Hedge Funds', count: mockFundHoldings.length },
  ]

  const rows: UnifiedRow[] = (() => {
    if (activeTab === 'politicians') return mockAllPoliticianTrades.map(d => ({ kind: 'politician' as const, data: d }))
    if (activeTab === 'insiders') return mockAllInsiderTrades.map(d => ({ kind: 'insider' as const, data: d }))
    if (activeTab === 'funds') return mockFundHoldings.map(d => ({ kind: 'fund' as const, data: d }))
    return [
      ...mockAllPoliticianTrades.map(d => ({ kind: 'politician' as const, data: d })),
      ...mockAllInsiderTrades.map(d => ({ kind: 'insider' as const, data: d })),
      ...mockFundHoldings.map(d => ({ kind: 'fund' as const, data: d })),
    ]
  })()

  return (
    <div className="min-h-full">
      {/* Demo Warning Banner */}
      <div
        className="flex items-center gap-2 px-6 py-2.5 text-[12px]"
        style={{ background: 'rgba(180,83,9,0.06)', borderBottom: '1px solid rgba(180,83,9,0.12)' }}
      >
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
        <span style={{ color: 'var(--warn)' }}>
          This page shows demo data for illustration. No real trade disclosures are shown.
        </span>
      </div>

      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--ai)]">SMART MONEY RADAR</span>
            <DemoBadge />
          </div>
          <h1 className="text-2xl font-bold text-[var(--ink-hi)] font-display mb-1">
            Who&apos;s buying what, and when did they actually do it
          </h1>
          <p className="text-[13px] text-[var(--ink-lo)] max-w-2xl">
            Politicians, insiders, and institutional funds — with the gap between trade date and filing date made explicit.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 mb-5 p-1 rounded-lg bg-[var(--bg-2)] w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--bg-0)] text-[var(--ink-hi)] shadow-sm'
                  : 'text-[var(--ink-lo)] hover:text-[var(--ink-md)]'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id ? 'bg-[var(--ai-soft)] text-[var(--ai)]' : 'bg-[var(--bg-3)] text-[var(--ink-dim)]'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Stat Strip */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          <StatCard label="Filings today" value="142" sub="▲18 vs avg" icon={BarChart3} />
          <StatCard label="Net political flow (7d)" value="+$48M" sub="Tech & defense leading" icon={TrendingUp} />
          <StatCard label="Avg reporting delay" value="32 days" sub="Median 28 · STOCK Act" icon={Clock} />
          <StatCard label="High-signal trades" value="9" sub="Score ≥ 70" icon={Zap} />
        </div>

        {/* Delay Warning Callout */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-5"
          style={{ background: 'rgba(180,83,9,0.05)', border: '1px solid rgba(180,83,9,0.18)' }}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-[var(--ink-md)]">
              <span className="font-bold text-[var(--ink-hi)]">Trade date ≠ filing date.</span>{' '}
              Under the STOCK Act, members of Congress have up to 45 days to disclose trades after they occur.
              By the time you see a trade, the market may have already moved. Treat every politician disclosure
              as a research signal, never as a real-time alert.
            </p>
          </div>
          <button
            className="text-[11px] font-semibold px-3 py-1.5 rounded-md flex-shrink-0 transition-colors hover:opacity-80"
            style={{ background: 'rgba(180,83,9,0.12)', color: 'var(--warn)' }}
          >
            Read methodology
          </button>
        </div>

        {/* Sub-navigation links */}
        <div className="flex items-center gap-3 mb-4">
          {[
            { href: '/smart-money/politicians', label: 'Politicians view', icon: Users },
            { href: '/smart-money/insiders', label: 'Insiders view', icon: Users },
            { href: '/smart-money/funds', label: 'Funds view', icon: Building2 },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 text-[12px] text-[var(--ink-lo)] hover:text-[var(--ai)] transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <ExternalLink className="w-3 h-3" />
            </Link>
          ))}
        </div>

        {/* Filings Table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <h2 className="text-[13px] font-semibold text-[var(--ink-hi)]">
                {activeTab === 'all' ? 'All Filings' :
                 activeTab === 'politicians' ? 'Politician Disclosures' :
                 activeTab === 'insiders' ? 'Insider Form 4 Filings' :
                 'Fund 13F Holdings'}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-2)] text-[var(--ink-dim)]">
                {rows.length} entries
              </span>
            </div>
            <DemoBadge />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-2)]">
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px] w-10"></th>
                  <th className="text-left px-4 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Who</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Action</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Asset</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Size</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Trade Date</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Filed</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Delay</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Signal</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-[var(--ink-dim)] uppercase tracking-wide text-[10px]">Source</th>
                  <th className="px-3 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  if (row.kind === 'politician') {
                    const t = row.data
                    return (
                      <tr key={t.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors ${i % 2 === 0 ? '' : 'bg-[rgba(0,0,0,0.01)]'}`}>
                        <td className="px-4 py-3"><AvatarBadge kind="politician" /></td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--ink-hi)]">{t.politicianName}</p>
                          <p className="text-[10px] text-[var(--ink-dim)]">{t.chamber} · {t.party[0]} · {t.stateOrDistrict}</p>
                        </td>
                        <td className="px-3 py-3"><ActionBadge type={t.transactionType} /></td>
                        <td className="px-3 py-3">
                          <span className="font-semibold font-mono-nums text-[var(--ink-hi)]">{t.ticker}</span>
                          <p className="text-[10px] text-[var(--ink-dim)] truncate max-w-[100px]">{t.companyName}</p>
                        </td>
                        <td className="px-3 py-3 text-[var(--ink-md)] font-mono-nums">{t.valueRange ?? '—'}</td>
                        <td className="px-3 py-3 text-[var(--ink-lo)]">{formatDate(t.transactionDate)}</td>
                        <td className="px-3 py-3 text-[var(--ink-lo)]">{formatDate(t.disclosureDate)}</td>
                        <td className="px-3 py-3"><DelayPill days={t.reportingDelayDays} /></td>
                        <td className="px-3 py-3"><SignalBar score={t.signalScore ?? 0} /></td>
                        <td className="px-3 py-3">
                          <span className="text-[10px] text-[var(--ink-dim)] bg-[var(--bg-2)] px-1.5 py-0.5 rounded">STOCK Act</span>
                        </td>
                        <td className="px-3 py-3">
                          <ExternalLink className="w-3 h-3 text-[var(--ink-dim)] hover:text-[var(--ai)] cursor-pointer" />
                        </td>
                      </tr>
                    )
                  }

                  if (row.kind === 'insider') {
                    const t = row.data
                    return (
                      <tr key={t.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors ${i % 2 === 0 ? '' : 'bg-[rgba(0,0,0,0.01)]'}`}>
                        <td className="px-4 py-3"><AvatarBadge kind="insider" /></td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--ink-hi)]">{t.insiderName}</p>
                          <p className="text-[10px] text-[var(--ink-dim)]">{t.role} · {t.companyName}</p>
                        </td>
                        <td className="px-3 py-3">
                          <ActionBadge type={t.transactionType} />
                          {t.is10b5_1 && (
                            <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-[var(--bg-3)] text-[var(--ink-dim)]">10b5-1</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-semibold font-mono-nums text-[var(--ink-hi)]">{t.ticker}</span>
                          <p className="text-[10px] text-[var(--ink-dim)]">{t.shares?.toLocaleString()} sh</p>
                        </td>
                        <td className="px-3 py-3 text-[var(--ink-md)] font-mono-nums">{formatValue(t.value)}</td>
                        <td className="px-3 py-3 text-[var(--ink-lo)]">{formatDate(t.transactionDate)}</td>
                        <td className="px-3 py-3 text-[var(--ink-lo)]">{formatDate(t.filingDate)}</td>
                        <td className="px-3 py-3">
                          <DelayPill days={Math.max(0, Math.round((new Date(t.filingDate).getTime() - new Date(t.transactionDate).getTime()) / 86400000))} />
                        </td>
                        <td className="px-3 py-3"><SignalBar score={t.signalScore ?? 0} /></td>
                        <td className="px-3 py-3">
                          <span className="text-[10px] text-[var(--ink-dim)] bg-[var(--bg-2)] px-1.5 py-0.5 rounded">Form 4</span>
                        </td>
                        <td className="px-3 py-3">
                          <ExternalLink className="w-3 h-3 text-[var(--ink-dim)] hover:text-[var(--ai)] cursor-pointer" />
                        </td>
                      </tr>
                    )
                  }

                  if (row.kind === 'fund') {
                    const t = row.data
                    return (
                      <tr key={t.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors ${i % 2 === 0 ? '' : 'bg-[rgba(0,0,0,0.01)]'}`}>
                        <td className="px-4 py-3"><AvatarBadge kind="fund" /></td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--ink-hi)]">{t.fundName}</p>
                          <p className="text-[10px] text-[var(--ink-dim)]">{t.quarter} · 13F</p>
                        </td>
                        <td className="px-3 py-3"><ActionBadge type={t.actionType} /></td>
                        <td className="px-3 py-3">
                          <span className="font-semibold font-mono-nums text-[var(--ink-hi)]">{t.ticker}</span>
                          <p className="text-[10px] text-[var(--ink-dim)] truncate max-w-[100px]">{t.companyName}</p>
                        </td>
                        <td className="px-3 py-3 text-[var(--ink-md)] font-mono-nums">{formatValue(t.value)}</td>
                        <td className="px-3 py-3 text-[var(--ink-lo)]">{t.quarter}</td>
                        <td className="px-3 py-3 text-[var(--ink-lo)]">Feb 14</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono-nums"
                            style={{ color: 'var(--warn)', background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.15)' }}>
                            <Clock className="w-2.5 h-2.5" />~45d
                          </span>
                        </td>
                        <td className="px-3 py-3"><SignalBar score={t.signalScore} /></td>
                        <td className="px-3 py-3">
                          <span className="text-[10px] text-[var(--ink-dim)] bg-[var(--bg-2)] px-1.5 py-0.5 rounded">13F</span>
                        </td>
                        <td className="px-3 py-3">
                          <ExternalLink className="w-3 h-3 text-[var(--ink-dim)] hover:text-[var(--ai)] cursor-pointer" />
                        </td>
                      </tr>
                    )
                  }

                  return null
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="flex items-start gap-2 mt-4 p-3 rounded-lg" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[var(--ink-dim)]" />
          <p className="text-[11px] text-[var(--ink-dim)] leading-relaxed">
            This disclosure was filed after the transaction. All delays shown are informational.
            Politician trade data is sourced from STOCK Act filings; insider data from SEC Form 4;
            institutional data from SEC 13F quarterly filings. Data is for research purposes only.
          </p>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  )
}
