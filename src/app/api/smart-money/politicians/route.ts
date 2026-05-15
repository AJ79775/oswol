import { NextRequest, NextResponse } from 'next/server'
import { mockAllPoliticianTrades } from '@/lib/data/mockSmartMoney'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')

  let trades = mockAllPoliticianTrades
  if (ticker) {
    trades = trades.filter(t => t.ticker.toUpperCase() === ticker.toUpperCase())
  }

  return NextResponse.json({
    isDemoData: true,
    trades,
    count: trades.length,
    source: 'STOCK Act (45-day disclosure window)',
  })
}
