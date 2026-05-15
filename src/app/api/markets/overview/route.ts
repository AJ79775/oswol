import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'market_open',
    marketRegime: 'risk-on',
    indices: [
      { symbol: 'SPY', name: 'S&P 500 ETF', price: 524.87, changePct: 0.68, changeAmt: 3.54 },
      { symbol: 'QQQ', name: 'Nasdaq-100 ETF', price: 448.92, changePct: 1.12, changeAmt: 4.97 },
      { symbol: 'DIA', name: 'Dow Jones ETF', price: 392.14, changePct: 0.31, changeAmt: 1.21 },
      { symbol: 'IWM', name: 'Russell 2000 ETF', price: 208.45, changePct: -0.42, changeAmt: -0.88 },
      { symbol: 'VIX', name: 'CBOE Volatility Index', price: 13.42, changePct: -4.82, changeAmt: -0.68 },
    ],
    macro: {
      tenYearYield: 4.28,
      dxy: 104.12,
      goldSpot: 2042.30,
      oilWTI: 78.45,
    },
    timestamp: new Date().toISOString(),
    isDemoData: true,
    disclaimer: 'Demo data only. Not financial advice.',
  })
}
