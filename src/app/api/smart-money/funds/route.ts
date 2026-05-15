import { NextResponse } from 'next/server'
import { mockFunds, mockFundHoldings } from '@/lib/data/mockSmartMoney'

export async function GET() {
  return NextResponse.json({
    isDemoData: true,
    funds: mockFunds,
    holdings: mockFundHoldings,
    count: mockFundHoldings.length,
    source: 'SEC 13F (quarterly, 45-day lag)',
  })
}
