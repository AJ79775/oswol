'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Plus, ChevronRight, AlertTriangle, ExternalLink, Bot, X } from 'lucide-react'
import SourceBadge from '@/components/shared/SourceBadge'

interface Source {
  name: string
  verified?: boolean
  url?: string
}

interface TableRow {
  politician: string
  party: string
  trade: string
  value: string
  date: string
}

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  bullets?: string[]
  table?: { headers: string[]; rows: TableRow[] }
  sources?: Source[]
  confidence?: number
  delay?: boolean
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    text: "What's driving the rally in NVDA today?",
  },
  {
    id: '2',
    role: 'ai',
    text: "NVDA is up 4.21% today following a clean Q1 earnings beat that exceeded Wall Street estimates on both revenue and EPS. The data center segment posted record revenue of $22.6B, up 427% year-over-year, driven by continued hyperscaler AI infrastructure spending.",
    bullets: [
      "Q1 EPS of $5.98 beat the $5.59 consensus by 7% — the fifth consecutive beat",
      "Hyperscalers reaffirmed multi-year AI capex commitments totaling >$200B combined",
      "Blackwell GPU supply constraints easing — Goldman noted improving delivery lead times",
    ],
    sources: [
      { name: 'NVDA Q1 Earnings', verified: true },
      { name: 'Bloomberg', verified: true },
      { name: 'Goldman Sachs', verified: false },
    ],
    confidence: 82,
  },
  {
    id: '3',
    role: 'user',
    text: 'Show me politicians who bought NVDA in the last 6 months',
  },
  {
    id: '4',
    role: 'ai',
    text: 'In the last 180 days, 7 members of Congress disclosed purchases of NVDA. Note that STOCK Act filings carry a 30–45 day reporting delay, so the most recent transactions shown may not reflect current positions.',
    table: {
      headers: ['Politician', 'Party', 'Trade', 'Value', 'Filed'],
      rows: [
        { politician: 'Sen. Mark Warner', party: 'D', trade: 'Purchase', value: '$15K–$50K', date: 'Nov 12' },
        { politician: 'Rep. Nancy Pelosi', party: 'D', trade: 'Purchase', value: '$50K–$100K', date: 'Oct 28' },
        { politician: 'Rep. Dan Crenshaw', party: 'R', trade: 'Purchase', value: '$1K–$15K', date: 'Oct 14' },
        { politician: 'Sen. Tommy Tuberville', party: 'R', trade: 'Purchase', value: '$15K–$50K', date: 'Sep 30' },
      ],
    },
    delay: true,
    sources: [
      { name: 'STOCK Act EFTS', verified: true },
      { name: 'SEC EDGAR', verified: true },
    ],
    confidence: 71,
  },
]

const SUGGESTED_PROMPTS = [
  "What's smart money buying this week?",
  "Why is TSLA underperforming?",
  "Which ETFs have the most politician overlap?",
  "Summarize the AI power demand narrative",
  "Compare NVDA vs AMD institutional preference",
  "What macro events should I watch this week?",
]

const QUICK_ACTIONS = [
  { label: 'Generate market brief', icon: Sparkles },
  { label: 'Summarize top movers', icon: Bot },
  { label: 'Smart money digest', icon: AlertTriangle },
  { label: 'Build newsletter draft', icon: Plus },
]

const MOCK_AI_RESPONSES: Message[] = [
  {
    id: '',
    role: 'ai',
    text: 'Based on current market data and available public filings, here is a structured analysis. Note that all data shown is for demonstration purposes only and should not be used as the basis for any investment decision.',
    bullets: [
      'Demo response — connect an API key to activate real AI analysis',
      'All source data is simulated for illustration',
      'Oswol does not provide investment advice',
    ],
    sources: [{ name: 'Demo Mode', verified: false }],
    confidence: 40,
  },
]

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 75 ? 'var(--up)' : value >= 50 ? 'var(--warn)' : 'var(--down)'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)', maxWidth: 60 }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold font-mono" style={{ color }}>
        {value}% confidence
      </span>
    </div>
  )
}

function AIMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--ai) 0%, var(--social) 100%)' }}
      >
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="rounded-[var(--radius-md)] rounded-tl-sm px-4 py-3"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-hi)' }}>
            {msg.text}
          </p>

          {msg.bullets && msg.bullets.length > 0 && (
            <ol className="mt-3 space-y-1.5">
              {msg.bullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-[12px]" style={{ color: 'var(--ink-md)' }}>
                  <span className="font-bold flex-shrink-0 font-mono" style={{ color: 'var(--ai)' }}>{i + 1}.</span>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          )}

          {msg.table && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr>
                    {msg.table.headers.map(h => (
                      <th key={h} className="text-left pb-1.5 pr-3 font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--ink-dim)', borderBottom: '1px solid var(--border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {msg.table.rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-1.5 pr-3 font-medium" style={{ color: 'var(--ink-hi)' }}>{row.politician}</td>
                      <td className="py-1.5 pr-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: row.party === 'D' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                            color: row.party === 'D' ? '#3b82f6' : '#ef4444'
                          }}>
                          {row.party}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3" style={{ color: 'var(--up)' }}>{row.trade}</td>
                      <td className="py-1.5 pr-3 font-mono" style={{ color: 'var(--ink-md)' }}>{row.value}</td>
                      <td className="py-1.5" style={{ color: 'var(--ink-dim)' }}>{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {msg.delay && (
            <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded" style={{ background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.2)' }}>
              <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--warn)' }} />
              <p className="text-[10px]" style={{ color: 'var(--warn)' }}>
                STOCK Act filings may carry a 30–45 day reporting delay. These trades may not reflect current positions.
              </p>
            </div>
          )}

          {(msg.sources || msg.confidence) && (
            <div className="mt-3 pt-2.5 flex flex-wrap items-center gap-2" style={{ borderTop: '1px solid var(--border)' }}>
              {msg.sources && msg.sources.map((s, i) => (
                <SourceBadge key={i} name={s.name} verified={s.verified} url={s.url} />
              ))}
              {msg.confidence !== undefined && (
                <div className="ml-auto">
                  <ConfidenceBar value={msg.confidence} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[75%] rounded-[var(--radius-md)] rounded-tr-sm px-4 py-3 text-[13px] leading-relaxed"
        style={{ background: 'var(--champagne)', color: 'var(--ink-hi)', boxShadow: 'var(--shadow-sm)' }}
      >
        {msg.text}
      </div>
    </div>
  )
}

function LoadingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--ai) 0%, var(--social) 100%)' }}
      >
        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
      <div
        className="rounded-[var(--radius-md)] rounded-tl-sm px-4 py-3"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        <p className="text-[12px] italic" style={{ color: 'var(--ink-dim)' }}>
          searching filings · news · social...
        </p>
      </div>
    </div>
  )
}

const TAGS = ['@asset', '@filing', '@news', '@macro', '#explain', '#compare', '#summarize']

export default function CopilotClient() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  function handleSend(text?: string) {
    const msg = text ?? input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    setTimeout(() => {
      const aiMsg: Message = {
        ...MOCK_AI_RESPONSES[0],
        id: (Date.now() + 1).toString(),
      }
      setMessages(prev => [...prev, aiMsg])
      setLoading(false)
    }, 900)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="flex h-full min-h-0" style={{ height: 'calc(100vh - var(--topbar-height))' }}>
      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--ai)' }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
                  AI COPILOT
                </span>
              </div>
              <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-display, sans-serif)' }}>
                Ask anything about the market
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>
                Cited responses. Source links. Confidence on every answer.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: 'var(--ai-soft)', color: 'var(--ai)', border: '1px solid rgba(8,145,178,0.2)' }}
              >
                Oswol AI · v1
              </span>
              <button
                onClick={() => setMessages([])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors"
                style={{ background: 'var(--bg-2)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                New chat
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {messages.map(msg =>
            msg.role === 'user'
              ? <UserMessage key={msg.id} msg={msg} />
              : <AIMessage key={msg.id} msg={msg} />
          )}
          {loading && <LoadingIndicator />}
        </div>

        {/* Composer */}
        <div className="flex-shrink-0 px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-0)' }}>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setInput(prev => prev + tag + ' ')}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors"
                style={{ background: 'var(--bg-2)', color: 'var(--ink-lo)', border: '1px solid var(--border)' }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div
            className="flex items-end gap-2 rounded-[var(--radius-md)] p-3"
            style={{ border: '1px solid var(--border-md)', background: 'var(--bg-1)', boxShadow: 'var(--shadow-sm)' }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any asset, trade, narrative, or macro event..."
              rows={1}
              className="flex-1 bg-transparent text-[13px] outline-none resize-none leading-relaxed"
              style={{ color: 'var(--ink-hi)', minHeight: 24, maxHeight: 120 }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center transition-opacity"
              style={{
                background: input.trim() && !loading ? 'var(--ai)' : 'var(--bg-3)',
                color: input.trim() && !loading ? 'white' : 'var(--ink-dim)',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--ink-dim)' }}>
            Press Enter to send · Shift+Enter for newline · Demo mode — not financial advice
          </p>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className="w-[280px] flex-shrink-0 border-l overflow-y-auto flex flex-col gap-4 p-4"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}
      >
        {/* Suggested prompts */}
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>
            Try asking
          </p>
          <div className="space-y-1.5">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="w-full text-left px-2.5 py-2 rounded text-[12px] leading-snug transition-colors hover:opacity-80"
                style={{ background: 'var(--bg-2)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-dim)' }}>
            Quick actions
          </p>
          <div className="space-y-1">
            {QUICK_ACTIONS.map(({ label, icon: Icon }, i) => (
              <button
                key={i}
                onClick={() => handleSend(label)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-[12px] transition-colors hover:opacity-80"
                style={{ background: 'var(--bg-2)', color: 'var(--ink-md)', border: '1px solid var(--border)' }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--ai)' }} />
                <span className="flex-1 text-left">{label}</span>
                <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--ink-dim)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-dim)' }}>
            How Copilot works
          </p>
          <div className="space-y-2.5">
            {[
              { step: '1', label: 'Ask in plain English', desc: 'No special syntax required' },
              { step: '2', label: 'Sources are cited', desc: 'Every claim is linked to a source' },
              { step: '3', label: 'Confidence scored', desc: 'Each answer carries a confidence rating' },
              { step: '4', label: 'Demo data only', desc: 'Connect an API key for real data' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'var(--ai)' }}
                >
                  {step}
                </div>
                <div>
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--ink-hi)' }}>{label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2.5 flex items-start gap-1.5" style={{ borderTop: '1px solid var(--border)' }}>
            <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--warn)' }} />
            <p className="text-[10px] leading-snug" style={{ color: 'var(--warn)' }}>
              Not financial advice. Demo data only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
