import { NextRequest, NextResponse } from 'next/server'
import { mockAllPoliticianTrades, mockAllInsiderTrades, mockFundHoldings } from '@/lib/data/mockSmartMoney'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const ticker = symbol.toUpperCase()

  const politicianTrades = mockAllPoliticianTrades.filter(t => t.ticker === ticker)
  const insiderTrades = mockAllInsiderTrades.filter(t => t.ticker === ticker)
  const fundHoldings = mockFundHoldings.filter(t => t.ticker === ticker)

  return NextResponse.json({
    isDemoData: true,
    ticker,
    politicianTrades,
    insiderTrades,
    fundHoldings,
    sources: ['STOCK Act', 'SEC Form 4', 'SEC 13F'],
  })
}
