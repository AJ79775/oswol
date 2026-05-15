export type AssetClass = 'EQUITY' | 'ETF' | 'CRYPTO' | 'FX' | 'COMMODITY' | 'RATE' | 'INDEX' | 'BOND' | 'VOLATILITY' | 'MACRO'

export interface Asset {
  id: string
  symbol: string
  name: string
  assetClass: AssetClass
  exchange?: string
  currency: string
  sector?: string
  industry?: string
  country: string
  isActive: boolean
}

export interface PriceSnapshot {
  id: string
  assetId: string
  symbol: string
  price: number
  open?: number
  high?: number
  low?: number
  volume?: number
  changeAmt?: number
  changePct?: number
  marketCap?: number
  timestamp: Date
}

export interface MarketAsset {
  symbol: string
  name: string
  price: number
  changePct: number
  changeAmt: number
  volume?: number
  marketCap?: number
  sector?: string
  assetClass: AssetClass
  sparkline?: number[]
}

export interface PoliticianTrade {
  id: string
  politicianName: string
  chamber: string
  party: string
  stateOrDistrict?: string
  ticker: string
  companyName?: string
  transactionType: string
  valueRange?: string
  transactionDate: Date
  disclosureDate: Date
  reportingDelayDays: number
  signalScore?: number
  signalLabel?: string
  aiInterpretation?: string
}

export interface InsiderTrade {
  id: string
  insiderName: string
  role: string
  companyName: string
  ticker: string
  transactionType: string
  shares?: number
  price?: number
  value?: number
  transactionDate: Date
  filingDate: Date
  is10b5_1: boolean
  isOpenMarketPurchase: boolean
  signalScore?: number
  signalLabel?: string
  aiInterpretation?: string
}

export interface SocialSentiment {
  ticker: string
  sentimentScore: number
  mentionVolume: number
  bullishPct?: number
  bearishPct?: number
  neutralPct?: number
  velocityScore?: number
  hypeRiskScore?: number
  topTopics?: string[]
}

export interface HeatmapTile {
  symbol: string
  name: string
  changePct: number
  marketCap: number
  sector: string
  weight?: number
}

export interface NavItem {
  label: string
  href: string
  badge?: number | string
  icon?: React.ComponentType<{ className?: string }>
}

export interface NavSection {
  title: string
  items: NavItem[]
}
