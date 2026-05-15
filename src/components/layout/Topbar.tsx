'use client'

import { useState } from 'react'
import { Search, Sun, Moon, Sparkles, Menu, Circle } from 'lucide-react'

const tickerData = [
  { symbol: 'SPY', price: 524.87, change: 0.68 },
  { symbol: 'QQQ', price: 448.92, change: 1.12 },
  { symbol: 'DIA', price: 392.14, change: 0.31 },
  { symbol: 'IWM', price: 208.45, change: -0.42 },
  { symbol: 'VIX', price: 13.42, change: -4.82 },
  { symbol: 'BTC', price: 67842, change: 2.48 },
  { symbol: 'ETH', price: 3524, change: 1.29 },
  { symbol: 'GOLD', price: 2658, change: 0.44 },
  { symbol: 'DXY', price: 104.38, change: 0.22 },
  { symbol: 'US10Y', price: 4.28, change: -0.04 },
]

interface TopbarProps {
  onToggleSidebar?: () => void
  isDark?: boolean
  onToggleTheme?: () => void
  onOpenExplain?: (symbol?: string, changePct?: number) => void
}

export default function Topbar({ onToggleSidebar, isDark = false, onToggleTheme, onOpenExplain }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header
      className="flex items-center gap-3 px-4 border-b border-[var(--border)] bg-[var(--bg-1)] flex-shrink-0 z-10"
      style={{ height: 56 }}
    >
      {/* Menu button */}
      <button
        onClick={onToggleSidebar}
        className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--ink-lo)] hover:bg-[var(--bg-2)] hover:text-[var(--ink-md)] transition-colors flex-shrink-0"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Search bar */}
      <div
        className={`flex items-center gap-2 flex-1 max-w-[560px] px-3 py-1.5 rounded-[var(--radius-sm)] border transition-colors ${
          searchFocused
            ? 'border-[var(--ai)] bg-[var(--bg-1)]'
            : 'border-[var(--border-md)] bg-[var(--bg-2)]'
        }`}
      >
        <Search className="w-3.5 h-3.5 text-[var(--ink-dim)] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search any asset, person, narrative, or event..."
          className="flex-1 bg-transparent text-sm text-[var(--ink-hi)] placeholder:text-[var(--ink-dim)] outline-none min-w-0"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className="hidden sm:flex text-[10px] text-[var(--ink-dim)] bg-[var(--bg-3)] px-1.5 py-0.5 rounded font-mono">
          /
        </kbd>
      </div>

      {/* Ticker strip */}
      <div className="flex-1 overflow-hidden hidden lg:block">
        <div className="overflow-hidden">
          <div className="ticker-track flex items-center gap-5 whitespace-nowrap">
            {[...tickerData, ...tickerData].map((ticker, i) => (
              <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className="text-[11px] font-semibold text-[var(--ink-md)]"
                  style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  {ticker.symbol}
                </span>
                <span
                  className={`text-[11px] font-medium ${ticker.change >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}
                  style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        {/* Market status pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border-md)] bg-[var(--bg-2)] text-[11px]">
          <Circle className="w-2 h-2 text-[var(--up)] fill-[var(--up)] animate-pulse" />
          <span className="text-[var(--ink-md)] font-medium">Markets</span>
          <span className="text-[var(--ink-dim)]">· open ·</span>
          <span className="text-[var(--ink-md)] font-medium" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
            3h 12m
          </span>
        </div>

        {/* Day/Night toggle */}
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--ink-lo)] hover:bg-[var(--bg-2)] hover:text-[var(--ink-md)] transition-colors"
          title={isDark ? 'Switch to day mode' : 'Switch to night mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Explain button */}
        <button
          onClick={() => onOpenExplain?.()}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-md)] text-[var(--ai)] text-[12px] font-medium hover:bg-[var(--ai-soft)] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explain</span>
        </button>
      </div>
    </header>
  )
}
