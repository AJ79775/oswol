import { NextRequest, NextResponse } from 'next/server'
import { mockAllAssets } from '@/lib/data/mockMarketData'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  if (!query || query.length < 1) {
    return NextResponse.json({
      results: [],
      query,
      isDemoData: true,
    })
  }

  const q = query.toLowerCase()
  const results = mockAllAssets
    .filter(
      a =>
        a.symbol.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.sector && a.sector.toLowerCase().includes(q))
    )
    .slice(0, 20)

  return NextResponse.json({
    results,
    query,
    total: results.length,
    isDemoData: true,
    disclaimer: 'Demo data only. Not financial advice.',
  })
}
