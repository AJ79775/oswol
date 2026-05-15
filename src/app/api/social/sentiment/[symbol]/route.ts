import { NextRequest, NextResponse } from 'next/server'
import { mockTickerSentiment } from '@/lib/data/mockSocialData'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const ticker = symbol.toUpperCase()
  const data = mockTickerSentiment[ticker]

  if (!data) {
    return NextResponse.json({ isDemoData: true, error: 'No sentiment data for this symbol', ticker }, { status: 404 })
  }

  return NextResponse.json({
    isDemoData: true,
    sentiment: data,
  })
}
