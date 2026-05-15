import { NextResponse } from 'next/server'
import { mockAllPoliticianTrades, mockAllInsiderTrades, mockFunds, mockFundHoldings } from '@/lib/data/mockSmartMoney'

export async function GET() {
  const politicianBuys = mockAllPoliticianTrades.filter(t => t.transactionType === 'Purchase').length
  const politicianSells = mockAllPoliticianTrades.filter(t => t.transactionType === 'Sale').length
  const highSignalTrades = [
    ...mockAllPoliticianTrades.filter(t => (t.signalScore ?? 0) >= 70),
    ...mockAllInsiderTrades.filter(t => (t.signalScore ?? 0) >= 70),
    ...mockFundHoldings.filter(t => (t.signalScore ?? 0) >= 70),
  ]

  return NextResponse.json({
    isDemoData: true,
    stats: {
      filingsToday: 142,
      filingsVsAvg: 18,
      netPoliticalFlow7d: '+$48M',
      netPoliticalFlowNote: 'Tech & defense leading',
      avgReportingDelay: 32,
      medianReportingDelay: 28,
      highSignalCount: highSignalTrades.length,
    },
    summary: {
      politicianBuys,
      politicianSells,
      insiderBuys: mockAllInsiderTrades.filter(t => t.transactionType === 'Purchase').length,
      insiderSells: mockAllInsiderTrades.filter(t => t.transactionType === 'Sale').length,
      fundsCount: mockFunds.length,
      holdingsCount: mockFundHoldings.length,
    },
  })
}
