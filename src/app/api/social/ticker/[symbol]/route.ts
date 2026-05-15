import { NextRequest, NextResponse } from 'next/server'
import { mockTickerSentiment, mockNarratives } from '@/lib/data/mockSocialData'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const ticker = symbol.toUpperCase()
  const sentiment = mockTickerSentiment[ticker]
  const relatedNarratives = mockNarratives.filter(n => n.relatedAssets.includes(ticker))

  if (!sentiment) {
    return NextResponse.json({ isDemoData: true, error: 'No data for this symbol', ticker }, { status: 404 })
  }

  return NextResponse.json({
    isDemoData: true,
    ticker,
    sentiment,
    relatedNarratives,
  })
}
