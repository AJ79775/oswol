'use client'

import { useState } from 'react'
import {
  Newspaper, Eye, Download, Sparkles, AlertTriangle,
  TrendingUp, TrendingDown, Clock, FileText, Globe
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Template = 'daily' | 'weekly-macro' | 'single-thesis' | 'crypto-watch'
type Tone = 'professional' | 'sharp' | 'educational'
type Language = 'en' | 'ar' | 'bilingual'

interface SectionToggle {
  id: string
  label: string
  default: boolean
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const TEMPLATES: { id: Template; label: string; desc: string }[] = [
  { id: 'daily', label: 'The Daily', desc: 'Full daily brief, all sections' },
  { id: 'weekly-macro', label: 'Weekly Macro', desc: 'Deep macro themes weekly' },
  { id: 'single-thesis', label: 'Single Thesis', desc: 'Deep dive on one asset' },
  { id: 'crypto-watch', label: 'Crypto Watch', desc: 'Focused crypto intelligence' },
]

const SECTION_TOGGLES: SectionToggle[] = [
  { id: 'overview', label: 'Market Overview', default: true },
  { id: 'movers', label: 'Top Movers', default: true },
  { id: 'smart-money', label: 'Smart Money', default: true },
  { id: 'social', label: 'Social Narratives', default: true },
  { id: 'macro', label: 'Macro Calendar', default: true },
  { id: 'watchlist', label: 'Watchlist Movers', default: false },
  { id: 'chart', label: 'Star of the Day Chart', default: true },
  { id: 'disclaimer', label: 'Safety Disclaimer', default: true },
  { id: 'ai-note', label: 'AI Commentary', default: false },
]

// ─── CHART DATA ──────────────────────────────────────────────────────────────

const NVDA_CHART = [
  { t: '9:30', p: 839.10 }, { t: '10:00', p: 845.30 }, { t: '10:30', p: 851.20 },
  { t: '11:00', p: 848.90 }, { t: '11:30', p: 858.40 }, { t: '12:00', p: 861.70 },
  { t: '12:30', p: 856.20 }, { t: '13:00', p: 863.10 }, { t: '13:30', p: 870.40 },
  { t: '14:00', p: 868.20 }, { t: '14:30', p: 873.90 }, { t: '15:00', p: 878.50 },
  { t: '15:30', p: 875.42 },
]

// ─── CONTENT BY TONE ─────────────────────────────────────────────────────────

const TONE_CONTENT: Record<Tone, { headline: string; bullets: string[] }> = {
  professional: {
    headline: 'Markets Stage Tech-Led Rally as AI Capex Momentum Persists',
    bullets: [
      'NVDA +4.21% on clean Q1 beat; data center revenue +427% YoY to $22.6B',
      'AMD +4.27% following NVDA; MI300X competitive positioning strengthening',
      'Fed cut expectations cooling — 10Y yield holds 4.28% ahead of PCE Friday',
      'Social: AI Power Demand narrative at peak velocity (94/100, 48.2k mentions)',
      'Smart money: 7 Congressional NVDA purchases; Lisa Su open-market AMD buy',
    ],
  },
  sharp: {
    headline: 'NVDA rips 4%. AMD follows. The AI trade is very much alive.',
    bullets: [
      'NVDA Q1: revenue $26B vs $24.6B est. EPS $5.98 vs $5.59 est. Fifth straight beat.',
      'AMD at $168 — MI300X eating into NVDA\'s data center share. Watch this rivalry.',
      'TSLA down 2.36%. Delivery guidance cut. Stay cautious.',
      'PCE print Friday. If hot, kiss the rate cut narrative goodbye for Q2.',
      '7 Congress members bought NVDA last month. That\'s not nothing.',
    ],
  },
  educational: {
    headline: 'Understanding Today\'s Tech Rally: AI Infrastructure, Earnings Beats, and What Comes Next',
    bullets: [
      'Why NVDA leads: Data center revenue is the key metric — $22.6B represents AI chip demand',
      'What "earnings beat" means: Company reported higher revenue and profit than analyst forecasts',
      'Smart money context: Congressional buys are public filings — but carry 30-45 day delays',
      'PCE explained: Personal Consumption Expenditures measures inflation; key Fed metric',
      'Sentiment vs fundamentals: High social velocity doesn\'t guarantee continued price action',
    ],
  },
}

const SMART_PARA: Record<Tone, string> = {
  professional:
    'Smart money positioning shows constructive sentiment toward AI infrastructure names. Seven Congressional NVDA purchases were disclosed in the past 30 days, with a ~38-day average reporting delay. Lisa Su\'s open-market AMD purchase is the most notable insider signal — a non-10b5-1 buy at recent lows.',
  sharp:
    '7 Congress buys on NVDA. Lisa Su put her own money in AMD. Jensen\'s sale was pre-planned — don\'t read into it. The smart money isn\'t running from AI semis.',
  educational:
    'Smart money data comes from public disclosures: Congressional trades (STOCK Act), insider filings (SEC Form 4), and quarterly 13F fund reports. These all have legal reporting delays — 30-45 days for politicians, 2 days for insiders, 45 days for funds. They show where institutions were, not necessarily where they are now.',
}

// ─── PREVIEW COMPONENT ───────────────────────────────────────────────────────

function NewsletterPreview({
  tone, language, activeSections,
}: {
  tone: Tone
  language: Language
  activeSections: Set<string>
}) {
  const content = TONE_CONTENT[tone]
  const today = 'May 15, 2025'

  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden"
      style={{ background: 'var(--bg-0)', border: '1px solid var(--border)', fontFamily: 'var(--font-sans, sans-serif)' }}
    >
      {/* Newsletter header */}
      <div
        className="px-6 py-5"
        style={{ background: 'linear-gradient(135deg, var(--ai) 0%, var(--social) 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-white/20 flex items-center justify-center">
              <span className="text-white text-[14px] font-bold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>O</span>
            </div>
            <div>
              <p className="text-white text-[14px] font-semibold" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>Oswol Daily</p>
              <p className="text-white/70 text-[11px]">{today}</p>
            </div>
          </div>
          {language !== 'en' && (
            <span className="px-2 py-0.5 bg-white/20 rounded text-white text-[10px] font-medium">
              {language === 'ar' ? 'عربي' : 'EN | عربي'}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Headline */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'var(--ai-soft)', color: 'var(--ai)' }}
            >
              AI BRIEF
            </span>
          </div>
          <h2 className="text-[17px] font-bold leading-snug mb-3" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-display, sans-serif)' }}>
            {content.headline}
          </h2>
          {activeSections.has('overview') && (
            <ul className="space-y-1.5">
              {content.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: 'var(--ink-md)' }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--ai)' }} />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Star of the day chart */}
        {activeSections.has('chart') && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-dim)' }}>
              Star of the Day — NVDA
            </p>
            <div
              className="rounded-[var(--radius-md)] p-3"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold font-mono" style={{ color: 'var(--ink-hi)' }}>NVDA</span>
                <span className="text-[13px] font-semibold font-mono" style={{ color: 'var(--up)' }}>+4.21%</span>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={NVDA_CHART} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="nvdaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: 'var(--ink-dim)' }}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="p"
                    stroke="#047857"
                    strokeWidth={1.5}
                    fill="url(#nvdaGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top movers grid */}
        {activeSections.has('movers') && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-dim)' }}>
              Top Movers
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { symbol: 'NVDA', change: 4.21 },
                { symbol: 'AMD', change: 4.27 },
                { symbol: 'TSLA', change: -2.36 },
              ].map(m => (
                <div key={m.symbol}
                  className="px-3 py-2.5 rounded-[var(--radius-sm)] text-center"
                  style={{ background: 'var(--bg-2)' }}
                >
                  <p className="text-[12px] font-bold font-mono" style={{ color: 'var(--ink-hi)' }}>{m.symbol}</p>
                  <p
                    className="text-[13px] font-semibold font-mono"
                    style={{ color: m.change >= 0 ? 'var(--up)' : 'var(--down)' }}
                  >
                    {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart money paragraph */}
        {activeSections.has('smart-money') && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-dim)' }}>
              Smart Money
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-md)' }}>
              {SMART_PARA[tone]}
            </p>
            <div
              className="mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px]"
              style={{ background: 'rgba(180,83,9,0.06)', color: 'var(--warn)' }}
            >
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              STOCK Act filings carry 30–45 day reporting delay
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {activeSections.has('disclaimer') && (
          <div
            className="px-3 py-2.5 rounded-[var(--radius-sm)] text-[10px] leading-relaxed"
            style={{ background: 'var(--bg-2)', color: 'var(--ink-dim)', borderLeft: '3px solid var(--warn)' }}
          >
            <span className="font-semibold" style={{ color: 'var(--warn)' }}>Demo Data Only. </span>
            This newsletter is for informational purposes only and does not constitute financial advice.
            All data is simulated. Past performance does not indicate future results.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PAGE ROOT ───────────────────────────────────────────────────────────────

export default function NewsletterClient() {
  const [template, setTemplate] = useState<Template>('daily')
  const [tone, setTone] = useState<Tone>('professional')
  const [language, setLanguage] = useState<Language>('en')
  const [sections, setSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTION_TOGGLES.map(s => [s.id, s.default]))
  )
  const [exporting, setExporting] = useState(false)

  const activeSections = new Set(Object.entries(sections).filter(([, v]) => v).map(([k]) => k))

  const wordCount = 320 + (activeSections.size - 5) * 40
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  function toggleSection(id: string) {
    setSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleExport() {
    setExporting(true)
    setTimeout(() => setExporting(false), 1500)
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Newspaper className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
                Output
              </span>
            </div>
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-display, sans-serif)' }}>
              Newsletter Builder
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>
              AI-powered professional market newsletters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/newsletter/history"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-medium"
              style={{ background: 'var(--bg-2)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
            >
              <Clock className="w-3.5 h-3.5" />
              History
            </a>
          </div>
        </div>
      </div>

      <div className="flex h-full min-h-0">
        {/* Left sidebar controls */}
        <div
          className="w-[320px] flex-shrink-0 border-r overflow-y-auto flex flex-col gap-4 p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}
        >
          {/* Template selector */}
          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>
              Template
            </p>
            <div className="space-y-1.5">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-left transition-all"
                  style={{
                    background: template === t.id ? 'var(--ai-soft)' : 'var(--bg-2)',
                    border: `1px solid ${template === t.id ? 'rgba(8,145,178,0.3)' : 'var(--border)'}`,
                  }}
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: template === t.id ? 'var(--ai)' : 'var(--ink-dim)' }} />
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: template === t.id ? 'var(--ai)' : 'var(--ink-hi)' }}>
                      {t.label}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>
              Tone
            </p>
            <div className="space-y-1.5">
              {[
                { id: 'professional' as const, label: 'Calm & analytical', desc: 'Institutional tone, measured' },
                { id: 'sharp' as const, label: 'Sharp & punchy', desc: 'Direct, opinionated, bold' },
                { id: 'educational' as const, label: 'Educational', desc: 'Context-rich, explanatory' },
              ].map(t => (
                <label
                  key={t.id}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] cursor-pointer transition-all"
                  style={{
                    background: tone === t.id ? 'var(--ai-soft)' : 'var(--bg-2)',
                    border: `1px solid ${tone === t.id ? 'rgba(8,145,178,0.3)' : 'var(--border)'}`,
                  }}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={t.id}
                    checked={tone === t.id}
                    onChange={() => setTone(t.id)}
                    className="mt-0.5"
                    style={{ accentColor: 'var(--ai)' }}
                  />
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: tone === t.id ? 'var(--ai)' : 'var(--ink-hi)' }}>
                      {t.label}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{t.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>
              Language
            </p>
            <div className="flex items-center gap-1 p-1 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-2)' }}>
              {[
                { id: 'en' as const, label: 'English' },
                { id: 'ar' as const, label: 'العربية' },
                { id: 'bilingual' as const, label: 'Bilingual' },
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className="flex-1 px-2 py-1.5 rounded text-[11px] font-medium transition-all"
                  style={{
                    background: language === l.id ? 'var(--bg-0)' : 'transparent',
                    color: language === l.id ? 'var(--ink-hi)' : 'var(--ink-lo)',
                    boxShadow: language === l.id ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
            {language !== 'en' && (
              <p className="text-[10px] mt-2" style={{ color: 'var(--ink-dim)' }}>
                Arabic translation is AI-generated. Review before sending.
              </p>
            )}
          </div>

          {/* Section toggles */}
          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>
              Sections
            </p>
            <div className="space-y-1">
              {SECTION_TOGGLES.map(s => (
                <label
                  key={s.id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer transition-colors"
                  style={{ opacity: sections[s.id] ? 1 : 0.6 }}
                >
                  <div
                    className="w-8 h-4 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: sections[s.id] ? 'var(--ai)' : 'var(--bg-4)' }}
                    onClick={() => toggleSection(s.id)}
                  >
                    <div
                      className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                      style={{ left: sections[s.id] ? '17px' : '2px' }}
                    />
                  </div>
                  <span className="text-[12px]" style={{ color: sections[s.id] ? 'var(--ink-hi)' : 'var(--ink-lo)' }}>
                    {s.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main preview area */}
        <div className="flex-1 overflow-y-auto">
          {/* Preview header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-0)' }}
          >
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
              <span className="text-[12px] font-medium" style={{ color: 'var(--ink-md)' }}>
                Live preview · <span style={{ color: 'var(--ai)' }}>{tone}</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-2)', color: 'var(--ink-dim)' }}>
                ~{readingTime} min read · ~{wordCount} words
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-medium transition-all"
                style={{ background: 'var(--bg-2)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview email
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-medium transition-all"
                style={{ background: 'var(--ai)', color: 'white' }}
              >
                <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>

          <div className="p-5">
            <NewsletterPreview
              tone={tone}
              language={language}
              activeSections={activeSections}
            />
          </div>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  )
}
