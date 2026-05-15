'use client'

import { useState } from 'react'
import { mockAllAssets } from '@/lib/data/mockMarketData'
import Sparkline from '@/components/shared/Sparkline'
import ChangeChip from '@/components/shared/ChangeChip'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { Search, TrendingUp, AlertTriangle } from 'lucide-react'

const CLASSES = ['All', 'Equities', 'ETFs', 'Crypto', 'FX', 'Commodities'] as const

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toFixed(2)
}

export default function MarketsPage() {
  const [search, setSearch] = useState('')
  const [activeClass, setActiveClass] = useState<string>('All')

  const filtered = mockAllAssets.filter(a => {
    const matchSearch = !search || a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
    const matchClass = activeClass === 'All' ||
      (activeClass === 'Equities' && a.assetClass === 'EQUITY') ||
      (activeClass === 'ETFs' && a.assetClass === 'ETF') ||
      (activeClass === 'Crypto' && a.assetClass === 'CRYPTO') ||
      (activeClass === 'FX' && a.assetClass === 'FX') ||
      (activeClass === 'Commodities' && a.assetClass === 'COMMODITY')
    return matchSearch && matchClass
  })

  return (
    <div className="min-h-full">
      <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>Workspace</span>
            </div>
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-sora, sans-serif)' }}>Markets</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>Browse equities, ETFs, crypto, FX, and commodities</p>
          </div>
          <span className="demo-badge"><AlertTriangle className="w-3 h-3" />Demo Data</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="flex items-center gap-2 flex-1 max-w-sm px-3 py-2 rounded-[var(--radius-sm)] border" style={{ borderColor: 'var(--border-md)', background: 'var(--bg-2)' }}>
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--ink-dim)' }} />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: 'var(--ink-hi)' }}
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-2)' }}>
            {CLASSES.map(cls => (
              <button
                key={cls}
                onClick={() => setActiveClass(cls)}
                className="px-3 py-1.5 rounded text-[12px] font-medium transition-colors"
                style={{
                  background: activeClass === cls ? 'var(--bg-1)' : 'transparent',
                  color: activeClass === cls ? 'var(--ink-hi)' : 'var(--ink-lo)',
                  boxShadow: activeClass === cls ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(asset => (
            <a
              key={asset.symbol}
              href={`/markets/${asset.symbol}`}
              className="card p-4 block hover:border-[var(--champagne)] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[14px] font-bold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>{asset.symbol}</p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-dim)', maxWidth: 140 }}>{asset.name}</p>
                </div>
                <ChangeChip value={asset.changePct} showIcon size="xs" />
              </div>
              {asset.sparkline && (
                <div className="my-2">
                  <Sparkline data={asset.sparkline} positive={asset.changePct >= 0} width={160} height={40} />
                </div>
              )}
              <p className="text-[16px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                {formatPrice(asset.price)}
              </p>
              {asset.sector && (
                <p className="text-[10px] mt-1 px-1.5 py-0.5 rounded inline-block" style={{ background: 'var(--bg-3)', color: 'var(--ink-lo)' }}>
                  {asset.sector}
                </p>
              )}
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px]" style={{ color: 'var(--ink-dim)' }}>No assets found matching "{search}"</p>
          </div>
        )}
      </div>

      <DisclaimerFooter />
    </div>
  )
}
