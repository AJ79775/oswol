import { NextResponse } from 'next/server'
import { mockHeatmapData } from '@/lib/data/mockMarketData'

export async function GET() {
  return NextResponse.json({
    tiles: mockHeatmapData,
    totalCount: mockHeatmapData.length,
    isDemoData: true,
    disclaimer: 'Demo data only. Not financial advice.',
  })
}
