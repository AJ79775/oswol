import { NextResponse } from 'next/server'
import { mockTrendingTickers, mockTickerSentiment } from '@/lib/data/mockSocialData'

export async function GET() {
  const trending = mockTrendingTickers.map(t => ({
    ...t,
    name: mockTickerSentiment[t.ticker]?.name ?? t.ticker,
  }))

  return NextResponse.json({
    isDemoData: true,
    trending,
    count: trending.length,
  })
}
