'use client'

import { useState, useMemo } from 'react'
import { HeatmapTile } from '@/types'
import DisclaimerFooter from '@/components/shared/DisclaimerFooter'
import { AlertTriangle, Map } from 'lucide-react'

const SCOPES = ['Nasdaq-100', 'S&P 500', 'Sectors', 'ETFs', 'Crypto', 'Watchlist'] as const
type Scope = typeof SCOPES[number]

interface Props {
  tiles: HeatmapTile[]
}

function getTileSize(marketCap: number): { cols: number; rows: number } {
  if (marketCap >= 2e12) return { cols: 3, rows: 2 }
  if (marketCap >= 1e12) return { cols: 2, rows: 2 }
  if (marketCap >= 500e9) return { cols: 2, rows: 1 }
  return { cols: 1, rows: 1 }
}

function getTileColor(changePct: number): { bg: string; text: string } {
  const absVal = Math.abs(changePct)
  const intensity = Math.min(absVal / 5, 1)

  if (changePct >= 0) {
    const alpha = 0.15 + intensity * 0.7
    const textAlpha = intensity > 0.4 ? 1 : 0.85
    return {
      bg: `rgba(4,120,87,${alpha})`,
      text: intensity > 0.5 ? '#fff' : `rgba(4,120,87,${textAlpha + 0.15})`,
    }
  } else {
    const alpha = 0.15 + intensity * 0.7
    return {
      bg: `rgba(220,38,38,${alpha})`,
      text: intensity > 0.5 ? '#fff' : `rgba(220,38,38,0.95)`,
    }
  }
}

const SECTOR_ORDER = ['Technology', 'Communication Services', 'Consumer Discretionary', 'Healthcare', 'Financials', 'Energy']

function getSectorPerf(tiles: HeatmapTile[], sector: string): number {
  const sectorTiles = tiles.filter(t => t.sector === sector)
  if (!sectorTiles.length) return 0
  return sectorTiles.reduce((sum, t) => sum + t.changePct, 0) / sectorTiles.length
}

export default function HeatmapClient({ tiles }: Props) {
  const [activeScope, setActiveScope] = useState<Scope>('S&P 500')
  const [hoveredTile, setHoveredTile] = useState<string | null>(null)

  const sectors = useMemo(() => {
    const sectorMap: Record<string, HeatmapTile[]> = {}
    tiles.forEach(tile => {
      if (!sectorMap[tile.sector]) sectorMap[tile.sector] = []
      sectorMap[tile.sector].push(tile)
    })
    return sectorMap
  }, [tiles])

  const sectorPerformance = useMemo(() =>
    SECTOR_ORDER.map(s => ({
      sector: s,
      perf: getSectorPerf(tiles, s),
      count: tiles.filter(t => t.sector === s).length,
    })).filter(s => s.count > 0),
    [tiles]
  )

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Map className="w-4 h-4" style={{ color: 'var(--ink-dim)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>
                Intelligence
              </span>
            </div>
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-sora, sans-serif)' }}>
              Market Heat Map
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-lo)' }}>
              Visual performance by sector and market cap weight
            </p>
          </div>
          <span className="demo-badge">
            <AlertTriangle className="w-3 h-3" />
            Demo Data
          </span>
        </div>

        {/* Scope toggle */}
        <div className="flex items-center gap-1 mt-4 p-1 rounded-[var(--radius-sm)] w-fit" style={{ background: 'var(--bg-2)' }}>
          {SCOPES.map((scope) => (
            <button
              key={scope}
              onClick={() => setActiveScope(scope)}
              className="px-3 py-1.5 rounded text-[12px] font-medium transition-colors"
              style={{
                background: activeScope === scope ? 'var(--bg-1)' : 'transparent',
                color: activeScope === scope ? 'var(--ink-hi)' : 'var(--ink-lo)',
                boxShadow: activeScope === scope ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Legend */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[11px]" style={{ color: 'var(--ink-dim)' }}>Performance:</span>
          <div className="flex items-center gap-1.5">
            {[
              { label: '< -4%', bg: 'rgba(220,38,38,0.85)', text: '#fff' },
              { label: '-2%', bg: 'rgba(220,38,38,0.50)', text: 'var(--down)' },
              { label: '0%', bg: 'var(--bg-3)', text: 'var(--ink-dim)' },
              { label: '+2%', bg: 'rgba(4,120,87,0.50)', text: 'var(--up)' },
              { label: '+4%', bg: 'rgba(4,120,87,0.85)', text: '#fff' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm" style={{ background: l.bg }} />
                <span className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{l.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[11px] ml-3" style={{ color: 'var(--ink-dim)' }}>Tile size = market cap weight</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Main heatmap grid */}
          <div className="xl:col-span-3 space-y-5">
            {SECTOR_ORDER.map((sector) => {
              const sectorTiles = sectors[sector]
              if (!sectorTiles?.length) return null
              const sectorPerf = getSectorPerf(tiles, sector)

              return (
                <div key={sector}>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[12px] font-semibold" style={{ color: 'var(--ink-md)' }}>{sector}</h3>
                    <span
                      className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        color: sectorPerf >= 0 ? 'var(--up)' : 'var(--down)',
                        background: sectorPerf >= 0 ? 'rgba(4,120,87,0.1)' : 'rgba(220,38,38,0.1)',
                        fontFamily: 'var(--font-jetbrains-mono, monospace)',
                      }}
                    >
                      {sectorPerf >= 0 ? '+' : ''}{sectorPerf.toFixed(2)}%
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--ink-dim)' }}>{sectorTiles.length} stocks</span>
                  </div>
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
                    {sectorTiles.map((tile) => {
                      const { bg, text } = getTileColor(tile.changePct)
                      const size = getTileSize(tile.marketCap)
                      const isHovered = hoveredTile === tile.symbol

                      return (
                        <div
                          key={tile.symbol}
                          className="relative flex flex-col items-center justify-center rounded-[var(--radius-sm)] cursor-pointer transition-all"
                          style={{
                            background: bg,
                            gridColumn: `span ${size.cols}`,
                            gridRow: `span ${size.rows}`,
                            padding: size.cols > 1 ? '14px 10px' : '10px 6px',
                            minHeight: size.rows > 1 ? 80 : 52,
                            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: isHovered ? 'var(--shadow-md)' : 'none',
                            zIndex: isHovered ? 1 : 0,
                          }}
                          onMouseEnter={() => setHoveredTile(tile.symbol)}
                          onMouseLeave={() => setHoveredTile(null)}
                        >
                          <span
                            className="font-bold leading-tight text-center"
                            style={{
                              color: text,
                              fontSize: size.cols > 1 ? 14 : 11,
                              fontFamily: 'var(--font-jetbrains-mono, monospace)',
                            }}
                          >
                            {tile.symbol}
                          </span>
                          <span
                            className="leading-tight text-center mt-0.5"
                            style={{
                              color: text,
                              fontSize: size.cols > 1 ? 13 : 10,
                              fontFamily: 'var(--font-jetbrains-mono, monospace)',
                              fontWeight: 600,
                            }}
                          >
                            {tile.changePct >= 0 ? '+' : ''}{tile.changePct.toFixed(2)}%
                          </span>
                          {size.cols > 1 && (
                            <span
                              className="text-[10px] mt-1 opacity-70 text-center truncate max-w-full px-1"
                              style={{ color: text }}
                            >
                              {tile.name}
                            </span>
                          )}

                          {/* Hover tooltip */}
                          {isHovered && (
                            <div
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-[var(--radius-sm)] text-left whitespace-nowrap z-50"
                              style={{
                                background: 'var(--slate)',
                                color: '#fff',
                                boxShadow: 'var(--shadow-md)',
                              }}
                            >
                              <p className="text-[12px] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                                {tile.symbol}
                              </p>
                              <p className="text-[11px] opacity-80">{tile.name}</p>
                              <p
                                className="text-[13px] font-semibold mt-0.5"
                                style={{
                                  color: tile.changePct >= 0 ? 'rgba(52,211,153,1)' : 'rgba(248,113,113,1)',
                                  fontFamily: 'var(--font-jetbrains-mono, monospace)',
                                }}
                              >
                                {tile.changePct >= 0 ? '+' : ''}{tile.changePct.toFixed(2)}%
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sidebar: Sector Rankings */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--ink-hi)' }}>
                Sector Rankings
              </h3>
              <div className="space-y-3">
                {sectorPerformance
                  .sort((a, b) => b.perf - a.perf)
                  .map((s, i) => {
                    const isPos = s.perf >= 0
                    const barWidth = `${Math.min(Math.abs(s.perf) * 20, 100)}%`
                    return (
                      <div key={s.sector}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium truncate flex-1 mr-2" style={{ color: 'var(--ink-md)' }}>
                            {s.sector}
                          </span>
                          <span
                            className="text-[11px] font-semibold flex-shrink-0"
                            style={{
                              color: isPos ? 'var(--up)' : 'var(--down)',
                              fontFamily: 'var(--font-jetbrains-mono, monospace)',
                            }}
                          >
                            {isPos ? '+' : ''}{s.perf.toFixed(2)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: barWidth,
                              background: isPos ? 'var(--up)' : 'var(--down)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Top Gainers */}
            <div className="card p-5">
              <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--ink-hi)' }}>Top Gainers</h3>
              <div className="space-y-2">
                {[...tiles].sort((a, b) => b.changePct - a.changePct).slice(0, 5).map(tile => (
                  <div key={tile.symbol} className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      {tile.symbol}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--up)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      +{tile.changePct.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="card p-5">
              <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--ink-hi)' }}>Top Losers</h3>
              <div className="space-y-2">
                {[...tiles].sort((a, b) => a.changePct - b.changePct).slice(0, 5).map(tile => (
                  <div key={tile.symbol} className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--ink-hi)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      {tile.symbol}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--down)', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
                      {tile.changePct.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  )
}
