import { NextResponse } from 'next/server'

const ETF_TILES = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', changePct: 0.68, marketCap: 524e9, sector: 'Broad Market', weight: 100 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', changePct: 1.12, marketCap: 248e9, sector: 'Technology', weight: 100 },
  { symbol: 'IWM', name: 'iShares Russell 2000', changePct: -0.42, marketCap: 68e9, sector: 'Small Cap', weight: 100 },
  { symbol: 'DIA', name: 'SPDR Dow Jones ETF', changePct: 0.31, marketCap: 42e9, sector: 'Broad Market', weight: 100 },
  { symbol: 'VTI', name: 'Vanguard Total Market', changePct: 0.54, marketCap: 388e9, sector: 'Broad Market', weight: 100 },
  { symbol: 'XLK', name: 'Technology Select SPDR', changePct: 2.84, marketCap: 72e9, sector: 'Technology', weight: 100 },
  { symbol: 'XLF', name: 'Financial Select SPDR', changePct: -0.18, marketCap: 48e9, sector: 'Financials', weight: 100 },
  { symbol: 'XLE', name: 'Energy Select SPDR', changePct: -0.88, marketCap: 28e9, sector: 'Energy', weight: 100 },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury', changePct: 0.38, marketCap: 54e9, sector: 'Bonds', weight: 100 },
  { symbol: 'HYG', name: 'iShares High Yield Corp Bond', changePct: 0.12, marketCap: 18e9, sector: 'Bonds', weight: 100 },
  { symbol: 'GLD', name: 'SPDR Gold Shares', changePct: 0.84, marketCap: 72e9, sector: 'Commodities', weight: 100 },
  { symbol: 'IBIT', name: 'iShares Bitcoin Trust ETF', changePct: 2.48, marketCap: 28e9, sector: 'Crypto', weight: 100 },
]

export async function GET() {
  return NextResponse.json({
    tiles: ETF_TILES,
    label: 'Key ETFs',
    totalCount: ETF_TILES.length,
    isDemoData: true,
    disclaimer: 'Demo data only. Not financial advice.',
  })
}
