import { NextRequest, NextResponse } from 'next/server'
import { mockAllInsiderTrades } from '@/lib/data/mockSmartMoney'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')

  let trades = mockAllInsiderTrades
  if (ticker) {
    trades = trades.filter(t => t.ticker.toUpperCase() === ticker.toUpperCase())
  }

  return NextResponse.json({
    isDemoData: true,
    trades,
    count: trades.length,
    source: 'SEC Form 4 (2-day disclosure window)',
  })
}
