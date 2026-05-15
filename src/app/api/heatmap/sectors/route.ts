import { NextResponse } from 'next/server'

const SECTOR_TILES = [
  { symbol: 'XLK', name: 'Technology', changePct: 2.84, marketCap: 8200e9, sector: 'Technology', weight: 29.2 },
  { symbol: 'XLC', name: 'Communication Services', changePct: 1.12, marketCap: 4800e9, sector: 'Communication Services', weight: 8.6 },
  { symbol: 'XLY', name: 'Consumer Discretionary', changePct: 0.34, marketCap: 4200e9, sector: 'Consumer Discretionary', weight: 10.4 },
  { symbol: 'XLF', name: 'Financials', changePct: -0.18, marketCap: 5600e9, sector: 'Financials', weight: 13.2 },
  { symbol: 'XLV', name: 'Healthcare', changePct: -0.12, marketCap: 5200e9, sector: 'Healthcare', weight: 12.4 },
  { symbol: 'XLI', name: 'Industrials', changePct: 0.42, marketCap: 3100e9, sector: 'Industrials', weight: 8.8 },
  { symbol: 'XLP', name: 'Consumer Staples', changePct: -0.28, marketCap: 2800e9, sector: 'Consumer Staples', weight: 5.8 },
  { symbol: 'XLE', name: 'Energy', changePct: -0.88, marketCap: 2400e9, sector: 'Energy', weight: 4.8 },
  { symbol: 'XLU', name: 'Utilities', changePct: 0.62, marketCap: 1200e9, sector: 'Utilities', weight: 2.4 },
  { symbol: 'XLRE', name: 'Real Estate', changePct: -0.44, marketCap: 1000e9, sector: 'Real Estate', weight: 2.2 },
  { symbol: 'XLB', name: 'Materials', changePct: 0.18, marketCap: 900e9, sector: 'Materials', weight: 2.2 },
]

export async function GET() {
  return NextResponse.json({
    tiles: SECTOR_TILES,
    label: 'S&P 500 Sectors',
    totalCount: SECTOR_TILES.length,
    isDemoData: true,
    disclaimer: 'Demo data only. Not financial advice.',
  })
}
