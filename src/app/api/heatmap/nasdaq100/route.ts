import { NextResponse } from 'next/server'
import { mockHeatmapData } from '@/lib/data/mockMarketData'

export async function GET() {
  const tiles = mockHeatmapData.filter(t =>
    ['Technology', 'Communication Services', 'Consumer Discretionary'].includes(t.sector)
  )
  return NextResponse.json({
    tiles,
    label: 'Nasdaq-100',
    totalCount: tiles.length,
    isDemoData: true,
    disclaimer: 'Demo data only. Not financial advice.',
  })
}
