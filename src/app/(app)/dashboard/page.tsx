import { mockIndices, mockTopMovers, mockPoliticianTrades, mockSocialSentiment, mockHeatmapData, mockMacroEvents, mockWatchlistItems } from '@/lib/data/mockMarketData'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  return (
    <DashboardClient
      indices={mockIndices}
      topMovers={mockTopMovers}
      politicianTrades={mockPoliticianTrades}
      socialSentiment={mockSocialSentiment}
      heatmapData={mockHeatmapData}
      macroEvents={mockMacroEvents}
      watchlistItems={mockWatchlistItems}
    />
  )
}
