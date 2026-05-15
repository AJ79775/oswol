'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Sparkles, Copy, Download, Send, AlertTriangle,
  CheckCircle, Loader2, ChevronRight
} from 'lucide-react'
import type { ExplainMoveOutput } from '@/lib/validators/explainMoveSchema'
import SourceBadge from '@/components/shared/SourceBadge'
import ConfidenceBadge from '@/components/shared/ConfidenceBadge'
import DemoBadge from '@/components/shared/DemoBadge'

interface ExplainMovePanelProps {
  open: boolean
  onClose: () => void
  symbol?: string
  changePct?: number
}

function SectionHeader({ num, label, accent }: { num: string; label: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        className="text-[10px] font-bold tabular-nums"
        style={{ color: accent || 'var(--ink-dim)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
      >
        {num}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-lo)' }}>
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="border-t my-4" style={{ borderColor: 'var(--border)' }} />
}

export default function ExplainMovePanel({ open, onClose, symbol, changePct = 0 }: ExplainMovePanelProps) {
  const [data, setData] = useState<ExplainMoveOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchExplanation = useCallback(async () => {
    if (!symbol) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch('/api/ai/explain-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, changePct }),
      })
      if (!res.ok) throw new Error('Failed to fetch explanation')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [symbol, changePct])

  useEffect(() => {
    if (open && symbol) {
      fetchExplanation()
    }
  }, [open, symbol, fetchExplanation])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleCopy = () => {
    if (!data) return
    const text = [
      `EXPLAIN THIS MOVE — ${data.symbol}`,
      `${data.priceContext.changePct >= 0 ? '+' : ''}${data.priceContext.changePct.toFixed(2)}%`,
      '',
      data.summary,
      '',
      'WHY IT MOVED:',
      ...data.whyMoving.map((r, i) => `${i + 1}. ${r}`),
      '',
      'WHAT TO WATCH:',
      ...data.whatToWatch.map((w, i) => `${i + 1}. ${w}`),
      '',
      data.disclaimer,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const signColor = changePct >= 0 ? 'var(--up)' : 'var(--down)'
  const signPrefix = changePct >= 0 ? '+' : ''

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(17,20,24,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 bottom-0 z-50 flex flex-col overflow-hidden"
            style={{
              top: 56,
              width: 420,
              background: 'var(--bg-0)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Panel Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-1)' }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* AI pill */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex-shrink-0"
                  style={{ background: 'var(--ai-soft)', color: 'var(--ai)' }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Explain This Move
                </span>

                {symbol && (
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  >
                    {symbol}
                  </span>
                )}

                {changePct !== 0 && (
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: signColor, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  >
                    {signPrefix}{changePct.toFixed(2)}%
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded transition-colors flex-shrink-0"
                style={{ color: 'var(--ink-lo)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loading && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--ai)' }} />
                  <p className="text-[12px]" style={{ color: 'var(--ink-dim)' }}>Analyzing market data...</p>
                  <p className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>
                    Checking public filings, macro signals, social sentiment
                  </p>
                </div>
              )}

              {error && (
                <div
                  className="p-3 rounded-lg flex items-start gap-2"
                  style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--down)' }}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-semibold">Failed to load analysis</p>
                    <p className="text-[11px] mt-0.5">{error}</p>
                    <button
                      onClick={fetchExplanation}
                      className="mt-2 text-[11px] underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {data && (
                <div className="space-y-0">
                  {/* Summary */}
                  <p className="text-[14px] font-medium leading-relaxed mb-3" style={{ color: 'var(--ink-hi)' }}>
                    {data.summary}
                  </p>

                  {/* Confidence + Demo badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
                      Confidence:
                    </span>
                    <ConfidenceBadge level={data.confidence} showBar />
                    {data.isDemoData && <DemoBadge />}
                  </div>

                  <Divider />

                  {/* 01 — Why it moved */}
                  <SectionHeader num="01" label="Why It Moved" accent="var(--ai)" />
                  <div className="space-y-2 mb-4">
                    {data.whyMoving.map((reason, i) => (
                      <div key={i} className="flex gap-2">
                        <ChevronRight
                          className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                          style={{ color: 'var(--ai)' }}
                        />
                        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-md)' }}>
                          {reason}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Divider />

                  {/* 02 — Price context */}
                  <SectionHeader num="02" label="Price Context" />
                  <div
                    className="grid grid-cols-2 gap-2 p-3 rounded-lg mb-4"
                    style={{ background: 'var(--bg-2)' }}
                  >
                    {[
                      { label: 'Price', value: data.priceContext.currentPrice >= 1000
                          ? `$${data.priceContext.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : `$${data.priceContext.currentPrice.toFixed(2)}`
                      },
                      {
                        label: 'Change',
                        value: `${data.priceContext.changePct >= 0 ? '+' : ''}${data.priceContext.changePct.toFixed(2)}%`,
                        color: data.priceContext.changePct >= 0 ? 'var(--up)' : 'var(--down)',
                      },
                      {
                        label: 'Move ($)',
                        value: `${data.priceContext.changeAmt >= 0 ? '+' : ''}$${Math.abs(data.priceContext.changeAmt).toFixed(2)}`,
                        color: data.priceContext.changeAmt >= 0 ? 'var(--up)' : 'var(--down)',
                      },
                      { label: 'Symbol', value: data.symbol },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink-dim)' }}>
                          {label}
                        </p>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: color || 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {data.priceContext.volumeContext && (
                    <p className="text-[11px] mb-4" style={{ color: 'var(--ink-dim)' }}>
                      {data.priceContext.volumeContext}
                    </p>
                  )}

                  <Divider />

                  {/* 03 — News context */}
                  <SectionHeader num="03" label="News Context" />
                  <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--ink-md)' }}>
                    {data.newsContext}
                  </p>

                  <Divider />

                  {/* 04 — Macro context */}
                  <SectionHeader num="04" label="Macro Context" />
                  <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--ink-md)' }}>
                    {data.macroContext}
                  </p>

                  <Divider />

                  {/* 05 — Social context */}
                  <SectionHeader num="05" label="Social Context" accent="var(--social)" />
                  <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--ink-md)' }}>
                    {data.socialContext}
                  </p>

                  <Divider />

                  {/* 06 — Smart-money */}
                  <SectionHeader num="06" label="Smart-Money Context" />
                  <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--ink-md)' }}>
                    {data.smartMoneyContext}
                  </p>

                  <Divider />

                  {/* 07 — What to watch */}
                  <SectionHeader num="07" label="What to Watch Next" accent="var(--champagne-deep)" />
                  <div className="space-y-2 mb-4">
                    {data.whatToWatch.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <span
                          className="text-[10px] font-bold tabular-nums mt-0.5 flex-shrink-0"
                          style={{ color: 'var(--champagne-deep)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-md)' }}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Divider />

                  {/* Risk notes */}
                  <div
                    className="p-3 rounded-lg mb-4 space-y-1.5"
                    style={{ background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.15)' }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--warn)' }} />
                      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--warn)' }}>
                        Risk Notes
                      </span>
                    </div>
                    {data.riskNotes.map((note, i) => (
                      <p key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--warn)' }}>
                        · {note}
                      </p>
                    ))}
                  </div>

                  {/* 08 — Sources */}
                  <SectionHeader num="08" label="Sources" />
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {data.sources.map((src, i) => (
                      <SourceBadge
                        key={i}
                        name={src.name}
                        verified={src.verified}
                        url={src.url || undefined}
                      />
                    ))}
                  </div>

                  {/* Delay warning */}
                  <div
                    className="p-3 rounded-lg mb-4 flex gap-2"
                    style={{ background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.12)' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--warn)' }} />
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--warn)' }}>
                      Congressional trade disclosures are legally required within 45 days of execution — signals shown are lagging indicators, not real-time positioning.
                    </p>
                  </div>

                  {/* Disclaimer */}
                  <div
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                      {data.disclaimer}
                    </p>
                    <p className="text-[10px] mt-1.5" style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      Generated: {new Date(data.generatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            {data && (
              <div
                className="flex items-center gap-2 px-4 py-3 border-t flex-shrink-0"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-1)' }}
              >
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium border transition-colors"
                  style={{
                    borderColor: copied ? 'var(--up)' : 'var(--border-md)',
                    color: copied ? 'var(--up)' : 'var(--ink-md)',
                    background: copied ? 'rgba(4,120,87,0.06)' : 'var(--bg-2)',
                  }}
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium border transition-colors"
                  style={{
                    borderColor: 'var(--border-md)',
                    color: 'var(--ink-md)',
                    background: 'var(--bg-2)',
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>

                <button
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-colors"
                  style={{
                    background: 'var(--ai-soft)',
                    color: 'var(--ai)',
                    border: '1px solid rgba(8,145,178,0.2)',
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send to Brief
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
