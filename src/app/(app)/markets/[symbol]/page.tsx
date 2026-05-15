import { mockAllAssets, mockPoliticianTrades, mockSocialSentiment, mockNewsItems } from '@/lib/data/mockMarketData'
import AssetDetailClient from './AssetDetailClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ symbol: string }>
}

export default async function AssetPage({ params }: PageProps) {
  const { symbol } = await params
  const upperSymbol = symbol.toUpperCase()
  const asset = mockAllAssets.find(a => a.symbol === upperSymbol)

  if (!asset) {
    notFound()
  }

  const socialSentiment = mockSocialSentiment.find(s => s.ticker === upperSymbol)
  const politicianTrades = mockPoliticianTrades.filter(t => t.ticker === upperSymbol)
  const newsItems = mockNewsItems[upperSymbol] || []

  return (
    <AssetDetailClient
      asset={asset}
      socialSentiment={socialSentiment}
      politicianTrades={politicianTrades}
      newsItems={newsItems}
    />
  )
}

export function generateStaticParams() {
  return mockAllAssets.map(a => ({ symbol: a.symbol.toLowerCase() }))
}
