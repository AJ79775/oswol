import { NextResponse } from 'next/server'
import { mockTopMovers } from '@/lib/data/mockMarketData'

export async function GET() {
  const sorted = [...mockTopMovers].sort((a, b) => b.changePct - a.changePct)
  const gainers = sorted.filter(a => a.changePct > 0).slice(0, 10)
  const losers = sorted.filter(a => a.changePct < 0).slice(0, 10)

  return NextResponse.json({
    gainers,
    losers,
    timestamp: new Date().toISOString(),
    isDemoData: true,
    disclaimer: 'Demo data only. Not financial advice.',
  })
}
