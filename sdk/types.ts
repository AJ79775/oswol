// Oswol SDK Types

export interface MarketIndex {
  symbol: string
  price: number
  change_pct: number
}

export interface MarketOverviewResponse {
  status: string
  market_open: boolean
  indices: MarketIndex[]
  market_regime: string
  isDemoData: boolean
  disclaimer: string
}

export interface AssetSnapshotResponse {
  symbol: string
  name: string
  price: number
  changePct: number
  isDemoData: boolean
  disclaimer?: string
}

export interface TopMover {
  symbol: string
  change_pct: number
  price: number
}

export interface TopMoversResponse {
  gainers: TopMover[]
  losers: TopMover[]
  isDemoData: boolean
}

export interface MacroEvent {
  date: string
  event: string
  impact: 'high' | 'medium' | 'low'
}

export interface MacroCalendarResponse {
  events: MacroEvent[]
  isDemoData: boolean
}

export interface HeatmapTile {
  symbol: string
  name: string
  changePct: number
  sector: string
  marketCap: number
  weight?: number
}

export interface HeatmapResponse {
  tiles: HeatmapTile[]
  isDemoData: boolean
  disclaimer: string
}

export interface PoliticianTrade {
  id: string
  politicianName: string
  chamber: string
  party: string
  ticker: string
  transactionType: string
  valueRange: string
  transactionDate: string
  disclosureDate: string
  reportingDelayDays: number
  signalScore?: number
  signalLabel?: string
  aiInterpretation?: string
}

export interface SmartMoneyResponse {
  politicians?: PoliticianTrade[]
  insiders?: unknown[]
  funds?: unknown[]
  isDemoData: boolean
  delayWarning?: string
  disclaimer: string
}

export interface SocialSentimentResponse {
  ticker: string
  sentimentScore: number
  mentionVolume: number
  bullishPct?: number
  bearishPct?: number
  neutralPct?: number
  velocityScore?: number
  hypeRiskScore?: number
  topTopics?: string[]
  isDemoData: boolean
  warning?: string
}

export interface SocialNarrative {
  id: string
  title: string
  summary: string
  mentionVolume: number
  velocityScore: number
  hypeRisk: number
  relatedTickers: string[]
  sentiment: 'bullish' | 'bearish' | 'mixed' | 'uncertain'
}

export interface NarrativesResponse {
  narratives: SocialNarrative[]
  isDemoData: boolean
  warning?: string
}

export interface ExplainMoveRequest {
  symbol: string
  changePct?: number
  timeframe?: string
  userContext?: string
}

export interface ExplainMoveResponse {
  symbol: string
  assetName: string
  summary: string
  whyMoving: string[]
  catalysts: string[]
  smartMoneySentiment: string
  socialSentiment: string
  confidence: 'high' | 'medium' | 'low'
  confidenceScore: number
  sources: Array<{ name: string; verified: boolean }>
  isDemoData: boolean
  disclaimer: string
}

export interface NewsletterRequest {
  type?: string
  tone?: 'professional' | 'sharp' | 'educational'
  language?: 'en' | 'ar' | 'bilingual'
  sections?: string[]
  symbols?: string[]
  date?: string
}

export interface NewsletterSection {
  title: string
  content: string
  warning?: string
  regime?: string
}

export interface NewsletterResponse {
  title: string
  summary: string
  sections: NewsletterSection[]
  markdown?: string
  html?: string
  disclaimer: string
  isDemoData: boolean
  readingTimeMinutes?: number
  wordCount?: number
}

export interface OswolSDKConfig {
  baseUrl?: string
  apiKey?: string
}
