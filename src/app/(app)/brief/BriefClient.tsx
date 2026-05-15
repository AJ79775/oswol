'use client'

import { useState } from 'react'
import {
  FileText, Sparkles, TrendingUp, TrendingDown, AlertTriangle,
  Calendar, Eye, BookOpen, RefreshCw, ChevronRight, BarChart2,
  Zap, Users, Radio, CheckCircle, XCircle
} from 'lucide-react'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import SourceBadge from '@/components/shared/SourceBadge'
import ChangeChip from '@/components/shared/ChangeChip'

// ─── TODAY'S BRIEF ───────────────────────────────────────────────────────────

const MACRO_EVENTS = [
  { date: 'Thu · May 15', label: 'PCE Price Index', impact: 'high', time: '08:30 ET' },
  { date: 'Thu · May 15', label: 'Initial Jobless Claims', impact: 'medium', time: '08:30 ET' },
  { date: 'Fri · May 16', label: 'Empire State Manufacturing', impact: 'medium', time: '08:30 ET' },
  { date: 'Wed · May 21', label: 'FOMC Meeting Minutes', impact: 'high', time: '14:00 ET' },
  { date: 'Thu · May 22', label: 'US Nonfarm Payrolls', impact: 'high', time: '08:30 ET' },
]

const TOP_MOVERS = [
  { symbol: 'NVDA', name: 'NVIDIA', change: 4.21, price: 875.42, reason: 'Q1 earnings beat' },
  { symbol: 'AMD', name: 'Advanced Micro', change: 4.27, price: 168.92, reason: 'AI optimism spillover' },
  { symbol: 'SOL', name: 'Solana', change: 3.82, price: 148.20, reason: 'Network upgrade' },
  { symbol: 'TSLA', name: 'Tesla', change: -2.36, price: 242.15, reason: 'Delivery guidance cut' },
  { symbol: 'INTC', name: 'Intel', change: -1.82, price: 31.45, reason: 'Foundry margin pressure' },
]

const SMART_MONEY_ITEMS = [
  { name: 'Congressional Buys', value: '7 NVDA purchases · past 30 days', signal: 'bullish', delay: '~38 day avg delay' },
  { name: 'Lisa Su (AMD CEO)', value: 'Open market buy · $776K', signal: 'strong', delay: 'Dec 1' },
  { name: 'Jensen Huang (NVDA CEO)', value: 'Scheduled 10b5-1 sale · $104M', signal: 'neutral', delay: 'Pre-planned' },
  { name: 'Bridgewater Associates', value: 'Added SPY position · Q3 2024', signal: 'neutral', delay: '45-day 13F lag' },
]

const NARRATIVES = [
  { title: 'AI Power Demand', velocity: 94, mentions: '48.2k', sentiment: 'bullish', hype: 62 },
  { title: 'BTC ETF Inflows', velocity: 88, mentions: '38.1k', sentiment: 'bullish', hype: 71 },
  { title: 'Fed Rate Cut Timeline', velocity: 76, mentions: '31.8k', sentiment: 'mixed', hype: 45 },
  { title: 'EV Demand Slowdown', velocity: 68, mentions: '22.4k', sentiment: 'bearish', hype: 58 },
]

const MONITOR_ITEMS = [
  'PCE inflation print Friday — consensus 2.6% YoY. Beat = rate cut hopes alive',
  'NVDA Blackwell supply chain updates — watch for lead-time commentary',
  'BTC ETF weekly flow data — IBIT pace vs. prior weeks',
  'Congressional trade filings — lookout for AI stock purchases post-earnings',
  'China PMI data — second-order commodity and FX effects',
]

function ImpactDot({ impact }: { impact: string }) {
  const color = impact === 'high' ? 'var(--down)' : impact === 'medium' ? 'var(--warn)' : 'var(--ink-dim)'
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
}

function TodaysBrief() {
  const [running, setRunning] = useState(false)
  function runBrief() {
    setRunning(true)
    setTimeout(() => setRunning(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Date + run button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
            WED · MAY 15 · MARKET OPEN
          </p>
          <h2 className="text-[20px] font-semibold mt-0.5" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-display, sans-serif)' }}>
            Markets Stage Tech-Led Rally
          </h2>
          <p className="text-[13px]" style={{ color: 'var(--ink-lo)' }}>
            AI capex momentum persists · Nasdaq-100 outperforms · Defensives lag
          </p>
        </div>
        <button
          onClick={runBrief}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium transition-all"
          style={{ background: 'var(--ai)', color: 'white' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Running AI brief...' : 'Run AI brief'}
        </button>
      </div>

      {/* Market Overview */}
      <Section title="Market Overview" icon={BarChart2} iconColor="var(--ai)">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { symbol: 'SPY', label: 'S&P 500', change: 0.68, price: 524.87, regime: 'RISK-ON' },
            { symbol: 'QQQ', label: 'Nasdaq-100', change: 1.12, price: 448.92 },
            { symbol: 'IWM', label: 'Russell 2000', change: -0.42, price: 208.45 },
            { symbol: 'VIX', label: 'Volatility', change: -4.82, price: 13.42 },
            { symbol: 'US10Y', label: '10Y Yield', change: -0.06, price: 4.28, pct: false },
            { symbol: 'DXY', label: 'US Dollar', change: 0.12, price: 104.12 },
          ].map(item => (
            <div key={item.symbol} className="px-3 py-2.5 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-2)' }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--ink-hi)' }}>{item.symbol}</span>
                <ChangeChip value={item.change} size="xs" />
              </div>
              <p className="text-[13px] font-semibold font-mono" style={{ color: 'var(--ink-hi)' }}>{item.price}</p>
              <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{item.label}</p>
              {'regime' in item && item.regime && (
                <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--up)' }}>{item.regime}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Top Movers */}
      <Section title="Top Movers" icon={TrendingUp} iconColor="var(--up)">
        <div className="space-y-1">
          {TOP_MOVERS.map(m => (
            <div key={m.symbol}
              className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)]"
              style={{ background: 'var(--bg-2)' }}
            >
              <span className="text-[12px] font-bold font-mono w-12" style={{ color: 'var(--ink-hi)' }}>{m.symbol}</span>
              <span className="text-[11px] flex-1" style={{ color: 'var(--ink-md)' }}>{m.reason}</span>
              <span className="text-[12px] font-mono" style={{ color: 'var(--ink-lo)' }}>${m.price}</span>
              <ChangeChip value={m.change} showIcon size="xs" />
            </div>
          ))}
        </div>
      </Section>

      {/* Smart Money */}
      <Section title="Smart Money" icon={Users} iconColor="var(--social)">
        <div className="space-y-2">
          <div className="flex items-start gap-2 px-3 py-2 rounded-[var(--radius-sm)]" style={{ background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.15)' }}>
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
            <p className="text-[11px]" style={{ color: 'var(--warn)' }}>
              STOCK Act filings carry 30–45 day reporting delay. Data may not reflect current positions.
            </p>
          </div>
          {SMART_MONEY_ITEMS.map((item, i) => (
            <div key={i}
              className="flex items-start gap-3 px-3 py-2 rounded-[var(--radius-sm)]"
              style={{ background: 'var(--bg-2)' }}
            >
              <div className="flex-1">
                <p className="text-[12px] font-medium" style={{ color: 'var(--ink-hi)' }}>{item.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--ink-md)' }}>{item.value}</p>
              </div>
              <span className="text-[10px] font-mono" style={{ color: 'var(--ink-dim)' }}>{item.delay}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                style={{
                  background: item.signal === 'bullish' || item.signal === 'strong' ? 'rgba(4,120,87,0.1)' : 'var(--bg-3)',
                  color: item.signal === 'bullish' || item.signal === 'strong' ? 'var(--up)' : 'var(--ink-lo)',
                }}
              >
                {item.signal}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Social Narratives */}
      <Section title="Social Narratives" icon={Radio} iconColor="var(--social)">
        <div className="space-y-2">
          {NARRATIVES.map((n, i) => (
            <div key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)]"
              style={{ background: 'var(--bg-2)' }}
            >
              <div className="flex-1">
                <p className="text-[12px] font-medium" style={{ color: 'var(--ink-hi)' }}>{n.title}</p>
                <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{n.mentions} mentions</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold font-mono" style={{ color: 'var(--ai)' }}>
                  {n.velocity}/100 velocity
                </p>
                <p className="text-[10px]" style={{ color: n.sentiment === 'bullish' ? 'var(--up)' : n.sentiment === 'bearish' ? 'var(--down)' : 'var(--warn)' }}>
                  {n.sentiment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Macro Events */}
      <Section title="Macro Calendar" icon={Calendar} iconColor="var(--warn)">
        <div className="space-y-1">
          {MACRO_EVENTS.map((ev, i) => (
            <div key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)]"
              style={{ background: 'var(--bg-2)', borderLeft: ev.impact === 'high' ? '3px solid var(--down)' : ev.impact === 'medium' ? '3px solid var(--warn)' : '3px solid var(--bg-4)' }}
            >
              <ImpactDot impact={ev.impact} />
              <span className="text-[11px] font-mono" style={{ color: 'var(--ink-dim)', minWidth: 100 }}>{ev.date}</span>
              <span className="flex-1 text-[12px] font-medium" style={{ color: 'var(--ink-hi)' }}>{ev.label}</span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--ink-dim)' }}>{ev.time}</span>
              {ev.impact === 'high' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--down)' }}>
                  HIGH
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* What to monitor */}
      <Section title="What to Monitor Next" icon={Eye} iconColor="var(--ai)">
        <div className="space-y-1.5">
          {MONITOR_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--ai)' }} />
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-md)' }}>{item}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sources + disclaimer */}
      <div className="flex flex-wrap items-center gap-2 pt-3 pb-1" style={{ borderTop: '1px solid var(--border)' }}>
        <SourceBadge name="NVDA Q1 Earnings" verified={true} />
        <SourceBadge name="STOCK Act EFTS" verified={true} />
        <SourceBadge name="Social Velocity" verified={false} />
        <SourceBadge name="Macro Calendar" verified={true} />
        <div className="ml-auto flex items-center gap-2">
          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
            <div className="h-full rounded-full" style={{ width: '79%', background: 'var(--ai)' }} />
          </div>
          <span className="text-[10px] font-semibold font-mono" style={{ color: 'var(--ai)' }}>79% confidence</span>
        </div>
      </div>
    </div>
  )
}

// ─── DESIGN GUIDE ─────────────────────────────────────────────────────────────

const PALETTE = [
  { name: '--bg-0', value: '#FFFFFF', label: 'Surface 0' },
  { name: '--bg-1', value: '#FFFFFF', label: 'Surface 1' },
  { name: '--bg-2', value: '#F7F5EE', label: 'Surface 2' },
  { name: '--bg-3', value: '#ECE6D4', label: 'Surface 3' },
  { name: '--ink-hi', value: '#1F262C', label: 'Ink High' },
  { name: '--ink-md', value: '#3F4A53', label: 'Ink Med' },
  { name: '--ink-lo', value: '#6F7780', label: 'Ink Low' },
  { name: '--ink-dim', value: '#9DA1A6', label: 'Ink Dim' },
  { name: '--ai', value: '#0891B2', label: 'AI / Cyan' },
  { name: '--social', value: '#6D28D9', label: 'Social / Violet' },
  { name: '--up', value: '#047857', label: 'Gain / Up' },
  { name: '--down', value: '#DC2626', label: 'Loss / Down' },
  { name: '--warn', value: '#B45309', label: 'Warning / Amber' },
  { name: '--champagne', value: '#D8C6A7', label: 'Champagne' },
  { name: '--champagne-deep', value: '#8B7350', label: 'Champagne Deep' },
]

const PRINCIPLES = [
  {
    icon: Zap,
    title: 'Signal over noise',
    desc: 'Every UI element either conveys a signal or supports one. Decorative elements have no place in a professional terminal.',
  },
  {
    icon: Eye,
    title: 'Source everything',
    desc: 'Every claim is backed by a source badge and confidence score. The user always knows where the data comes from.',
  },
  {
    icon: AlertTriangle,
    title: 'Safety first',
    desc: 'Financial guardrails are non-negotiable. Demo data labels, filing delays, and disclaimer footers appear on every relevant view.',
  },
  {
    icon: BookOpen,
    title: 'Champagne + Cyan',
    desc: 'Warm champagne background tones ground the UI. AI interactions use cyan. Social uses violet. Up is green, down is red.',
  },
]

function DesignGuide() {
  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--ai) 0%, var(--social) 100%)' }}
        >
          <span className="text-white text-[18px] font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>O</span>
        </div>
        <div>
          <p className="text-[18px] font-bold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-display, sans-serif)' }}>Oswol</p>
          <p className="text-[12px]" style={{ color: 'var(--ink-lo)' }}>AI Market Intelligence Terminal</p>
        </div>
      </div>

      {/* Palette */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>Color Palette</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {PALETTE.map(swatch => (
            <div key={swatch.name}>
              <div
                className="w-full h-12 rounded-[var(--radius-sm)] mb-1.5"
                style={{
                  background: swatch.value,
                  border: swatch.value === '#FFFFFF' ? '1px solid var(--border-md)' : 'none',
                }}
              />
              <p className="text-[10px] font-mono font-medium" style={{ color: 'var(--ink-hi)' }}>{swatch.label}</p>
              <p className="text-[9px] font-mono" style={{ color: 'var(--ink-dim)' }}>{swatch.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Design principles */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>Design Principles</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="p-4 rounded-[var(--radius-md)]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: 'var(--ai)' }} />
                <p className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>{title}</p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-md)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Type system */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>Type System</p>
        <div
          className="p-5 rounded-[var(--radius-md)] space-y-3"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-[24px] font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)', color: 'var(--ink-hi)' }}>
              Sora — Display / Headlines
            </p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--ink-dim)' }}>font-family: Sora · weights: 400/500/600/700</p>
          </div>
          <div>
            <p className="text-[15px]" style={{ color: 'var(--ink-hi)' }}>
              Geist Sans — Body text, labels, UI copy
            </p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--ink-dim)' }}>font-family: Geist Sans · weights: 400/500/600</p>
          </div>
          <div>
            <p className="text-[14px] font-mono" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-mono, monospace)' }}>
              JetBrains Mono — Prices, tickers, values
            </p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--ink-dim)' }}>font-family: JetBrains Mono · weights: 400/500/600</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--ink-dim)' }}>
              UPPERCASE EYEBROW · Section Labels · Navigation
            </p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--ink-dim)' }}>tracking-widest · font-semibold · ink-dim color</p>
          </div>
        </div>
      </div>

      {/* Do / Don't */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>Do / Don&apos;t</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { do: true, text: 'Every claim includes a source badge and confidence score' },
            { do: false, text: "State prices or data without citing where it came from" },
            { do: true, text: 'Show disclaimer footer on all pages with financial data' },
            { do: false, text: "Use buy/sell language — Oswol provides intelligence, not advice" },
            { do: true, text: 'Label all demo/mock data with Demo Data badges' },
            { do: false, text: 'Let users mistake demo data for real live market data' },
            { do: true, text: 'Use champagne backgrounds for AI-generated user responses' },
            { do: false, text: 'Use harsh colors or black backgrounds in day mode' },
          ].map((item, i) => (
            <div key={i}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)]"
              style={{
                background: item.do ? 'rgba(4,120,87,0.05)' : 'rgba(220,38,38,0.05)',
                border: `1px solid ${item.do ? 'rgba(4,120,87,0.15)' : 'rgba(220,38,38,0.15)'}`,
              }}
            >
              {item.do
                ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--up)' }} />
                : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--down)' }} />
              }
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-md)' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Screen nav grid */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>Page Navigation</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { route: '/dashboard', label: 'Dashboard', desc: 'Main market overview' },
            { route: '/markets', label: 'Markets', desc: 'Asset explorer' },
            { route: '/heatmap', label: 'Heat Map', desc: 'Nasdaq-100, sectors, crypto' },
            { route: '/smart-money', label: 'Smart Money', desc: 'Politicians, insiders, funds' },
            { route: '/social', label: 'Social', desc: 'Narrative scanner' },
            { route: '/watchlist', label: 'Watchlist', desc: 'Intelligence watchlist' },
            { route: '/copilot', label: 'AI Copilot', desc: 'Conversational assistant' },
            { route: '/newsletter', label: 'Newsletter', desc: 'Builder + history' },
            { route: '/brief', label: 'Daily Brief', desc: 'AI brief + design guide' },
          ].map(item => (
            <a
              key={item.route}
              href={item.route}
              className="p-3 rounded-[var(--radius-sm)] block transition-colors hover:opacity-80"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <p className="text-[12px] font-semibold font-mono" style={{ color: 'var(--ai)' }}>{item.route}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--ink-hi)' }}>{item.label}</p>
              <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconColor: string
  children: React.ReactNode
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
        <p className="text-[13px] font-semibold" style={{ color: 'var(--ink-hi)' }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

// ─── PAGE ROOT ───────────────────────────────────────────────────────────────

export default function BriefClient() {
  const [tab, setTab] = useState<'brief' | 'design'>('brief')

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>Workspace</span>
            </div>
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-display, sans-serif)' }}>
              {tab === 'brief' ? "Today's Market Brief" : 'Design Guide'}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>
              {tab === 'brief'
                ? 'AI-generated daily market intelligence · Demo data'
                : 'Oswol design system — tokens, principles, and components'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-[var(--radius-sm)] w-fit" style={{ background: 'var(--bg-2)' }}>
          {[
            { id: 'brief' as const, label: "Today's Brief", icon: Sparkles },
            { id: 'design' as const, label: 'Design Guide', icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-all"
              style={{
                background: tab === id ? 'var(--bg-0)' : 'transparent',
                color: tab === id ? 'var(--ink-hi)' : 'var(--ink-lo)',
                boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {tab === 'brief' ? <TodaysBrief /> : <DesignGuide />}
      </div>

      <DisclaimerFooter />
    </div>
  )
}
