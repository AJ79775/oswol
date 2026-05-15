import { MarketAsset, PoliticianTrade, InsiderTrade, SocialSentiment, HeatmapTile } from '@/types'

// Generate realistic sparkline data
function generateSparkline(basePrice: number, trend: number, points = 12): number[] {
  const result: number[] = []
  let price = basePrice * (1 - trend * 0.015)
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.48) * basePrice * 0.008
    price = price + (basePrice * trend * 0.003) + noise
    result.push(Math.max(price, basePrice * 0.8))
  }
  return result
}

export interface PricePoint {
  time: string
  price: number
  volume?: number
}

// Generate mock price series for charts
export function generatePriceSeries(
  basePrice: number,
  points: number,
  trend: number,
  volatility: number,
  interval: '1h' | '1d' = '1d'
): PricePoint[] {
  const result: PricePoint[] = []
  let price = basePrice * (1 - trend * points * 0.001)
  const now = Date.now()

  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * basePrice * volatility
    price = Math.max(price + basePrice * trend * 0.002 + noise, basePrice * 0.5)
    const msAgo = (points - i) * (interval === '1h' ? 3600000 : 86400000)
    const date = new Date(now - msAgo)
    const time = interval === '1h'
      ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    result.push({
      time,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000 + 1000000),
    })
  }
  return result
}

export interface NewsItem {
  id: string
  headline: string
  source: string
  timestamp: string
  sentiment: 'positive' | 'negative' | 'neutral'
  verified: boolean
}

export const mockNewsItems: Record<string, NewsItem[]> = {
  NVDA: [
    {
      id: '1',
      headline: 'NVIDIA Q1 Results Smash Expectations; Data Center Revenue Up 427% YoY',
      source: 'Bloomberg',
      timestamp: '2h ago',
      sentiment: 'positive',
      verified: true,
    },
    {
      id: '2',
      headline: 'NVIDIA CFO Files Form 4 — Pre-Scheduled 10b5-1 Sale, Analysts Unmoved',
      source: 'Reuters',
      timestamp: '4h ago',
      sentiment: 'neutral',
      verified: true,
    },
    {
      id: '3',
      headline: 'Hyperscalers Reaffirm Multi-Year AI Capex Plans, NVDA Primary Beneficiary',
      source: 'WSJ',
      timestamp: '6h ago',
      sentiment: 'positive',
      verified: true,
    },
  ],
  TSLA: [
    {
      id: '1',
      headline: 'Tesla Q1 Deliveries Miss Estimates by ~7%, Shares Under Pressure',
      source: 'Reuters',
      timestamp: '3h ago',
      sentiment: 'negative',
      verified: true,
    },
    {
      id: '2',
      headline: 'Analysts Cut Tesla Price Targets Following Delivery Shortfall',
      source: 'Bloomberg',
      timestamp: '5h ago',
      sentiment: 'negative',
      verified: true,
    },
  ],
  BTC: [
    {
      id: '1',
      headline: 'BlackRock IBIT ETF Records $480M Inflow Day — Largest Since March',
      source: 'Bloomberg ETF Monitor',
      timestamp: '1h ago',
      sentiment: 'positive',
      verified: true,
    },
    {
      id: '2',
      headline: 'Bitcoin Halving Supply Dynamics May Support Price Floor, Analysts Say',
      source: 'CoinDesk',
      timestamp: '4h ago',
      sentiment: 'positive',
      verified: false,
    },
  ],
  AMD: [
    {
      id: '1',
      headline: 'AMD Rides NVDA Earnings Halo; MI300X Shipments Tracking Ahead of Guide',
      source: 'Bloomberg',
      timestamp: '3h ago',
      sentiment: 'positive',
      verified: true,
    },
    {
      id: '2',
      headline: 'Lisa Su Open-Market Purchase (Form 4) at Lower Levels — Insider Confidence Signal',
      source: 'SEC EDGAR',
      timestamp: '2d ago',
      sentiment: 'positive',
      verified: true,
    },
  ],
}

export const mockIndices: MarketAsset[] = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    price: 524.87,
    changePct: 0.68,
    changeAmt: 3.57,
    volume: 68200000,
    assetClass: 'ETF',
    sparkline: generateSparkline(524.87, 1),
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100',
    price: 448.92,
    changePct: 1.12,
    changeAmt: 4.96,
    volume: 42100000,
    assetClass: 'ETF',
    sparkline: generateSparkline(448.92, 1.2),
  },
  {
    symbol: 'DIA',
    name: 'Dow Jones',
    price: 392.14,
    changePct: 0.31,
    changeAmt: 1.21,
    volume: 8400000,
    assetClass: 'ETF',
    sparkline: generateSparkline(392.14, 0.4),
  },
  {
    symbol: 'IWM',
    name: 'Russell 2000',
    price: 208.45,
    changePct: -0.42,
    changeAmt: -0.88,
    volume: 32100000,
    assetClass: 'ETF',
    sparkline: generateSparkline(208.45, -0.5),
  },
  {
    symbol: 'VIX',
    name: 'VIX',
    price: 13.42,
    changePct: -4.82,
    changeAmt: -0.68,
    volume: 0,
    assetClass: 'VOLATILITY',
    sparkline: generateSparkline(13.42, -1),
  },
  {
    symbol: 'DXY',
    name: 'US Dollar',
    price: 104.38,
    changePct: 0.22,
    changeAmt: 0.23,
    volume: 0,
    assetClass: 'FX',
    sparkline: generateSparkline(104.38, 0.3),
  },
]

export const mockTopMovers: MarketAsset[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.42,
    changePct: 4.21,
    changeAmt: 35.32,
    volume: 48200000,
    marketCap: 2150000000000,
    sector: 'Technology',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(875.42, 1.5),
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    price: 168.92,
    changePct: 4.27,
    changeAmt: 6.92,
    volume: 78900000,
    marketCap: 274000000000,
    sector: 'Technology',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(168.92, 1.4),
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 242.15,
    changePct: -2.36,
    changeAmt: -5.85,
    volume: 125600000,
    marketCap: 771000000000,
    sector: 'Consumer Discretionary',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(242.15, -0.8),
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 195.64,
    changePct: 0.95,
    changeAmt: 1.84,
    volume: 61500000,
    marketCap: 2980000000000,
    sector: 'Technology',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(195.64, 0.5),
  },
  {
    symbol: 'META',
    name: 'Meta Platforms',
    price: 524.38,
    changePct: 1.84,
    changeAmt: 9.48,
    volume: 19200000,
    marketCap: 1340000000000,
    sector: 'Communication Services',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(524.38, 0.9),
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67842.50,
    changePct: 2.48,
    changeAmt: 1642.50,
    volume: 28500000000,
    marketCap: 1335000000000,
    sector: 'Crypto',
    assetClass: 'CRYPTO',
    sparkline: generateSparkline(67842.50, 1.1),
  },
]

export const mockAllAssets: MarketAsset[] = [
  ...mockTopMovers,
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.32,
    changePct: 0.80,
    changeAmt: 3.32,
    volume: 22100000,
    marketCap: 3090000000000,
    sector: 'Technology',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(415.32, 0.4),
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 178.42,
    changePct: 0.80,
    changeAmt: 1.42,
    volume: 28700000,
    marketCap: 2210000000000,
    sector: 'Communication Services',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(178.42, 0.4),
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 199.12,
    changePct: 1.33,
    changeAmt: 2.62,
    volume: 35800000,
    marketCap: 2080000000000,
    sector: 'Consumer Discretionary',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(199.12, 0.7),
  },
  {
    symbol: 'AVGO',
    name: 'Broadcom Inc.',
    price: 1642.80,
    changePct: 2.14,
    changeAmt: 34.50,
    volume: 8400000,
    marketCap: 765000000000,
    sector: 'Technology',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(1642.80, 1),
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    price: 685.42,
    changePct: 1.52,
    changeAmt: 10.28,
    volume: 6800000,
    marketCap: 296000000000,
    sector: 'Communication Services',
    assetClass: 'EQUITY',
    sparkline: generateSparkline(685.42, 0.8),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3524.80,
    changePct: 1.29,
    changeAmt: 44.80,
    volume: 15200000000,
    marketCap: 424000000000,
    sector: 'Crypto',
    assetClass: 'CRYPTO',
    sparkline: generateSparkline(3524.80, 0.6),
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 182.45,
    changePct: 3.82,
    changeAmt: 6.72,
    volume: 4800000000,
    marketCap: 82000000000,
    sector: 'Crypto',
    assetClass: 'CRYPTO',
    sparkline: generateSparkline(182.45, 1.5),
  },
]

export const mockPoliticianTrades: PoliticianTrade[] = [
  {
    id: '1',
    politicianName: 'Nancy Pelosi',
    chamber: 'House',
    party: 'Democrat',
    stateOrDistrict: 'CA-11',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    transactionType: 'Purchase',
    valueRange: '$500K - $1M',
    transactionDate: new Date('2024-11-15'),
    disclosureDate: new Date('2024-12-28'),
    reportingDelayDays: 43,
    signalScore: 87,
    signalLabel: 'High Conviction Buy',
    aiInterpretation: 'Significant purchase ahead of AI infrastructure legislation. Pattern consistent with prior tech buys.',
  },
  {
    id: '2',
    politicianName: 'Dan Crenshaw',
    chamber: 'House',
    party: 'Republican',
    stateOrDistrict: 'TX-02',
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    transactionType: 'Purchase',
    valueRange: '$50K - $100K',
    transactionDate: new Date('2024-12-03'),
    disclosureDate: new Date('2025-01-14'),
    reportingDelayDays: 42,
    signalScore: 62,
    signalLabel: 'Moderate',
    aiInterpretation: 'Moderate purchase of cloud leader. No committee overlap flagged.',
  },
  {
    id: '3',
    politicianName: 'Tommy Tuberville',
    chamber: 'Senate',
    party: 'Republican',
    stateOrDistrict: 'Alabama',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    transactionType: 'Sale',
    valueRange: '$100K - $250K',
    transactionDate: new Date('2024-11-28'),
    disclosureDate: new Date('2025-01-08'),
    reportingDelayDays: 41,
    signalScore: 55,
    signalLabel: 'Neutral Exit',
    aiInterpretation: 'Exit from GOOGL position. Timing pre-antitrust ruling. Watch for re-entry.',
  },
  {
    id: '4',
    politicianName: 'Michael McCaul',
    chamber: 'House',
    party: 'Republican',
    stateOrDistrict: 'TX-10',
    ticker: 'AMD',
    companyName: 'Advanced Micro Devices',
    transactionType: 'Purchase',
    valueRange: '$15K - $50K',
    transactionDate: new Date('2024-12-10'),
    disclosureDate: new Date('2025-01-18'),
    reportingDelayDays: 39,
    signalScore: 71,
    signalLabel: 'Notable Buy',
    aiInterpretation: 'Purchase from Armed Services Committee member. AMD has significant defense exposure.',
  },
]

export const mockInsiderTrades: InsiderTrade[] = [
  {
    id: '1',
    insiderName: 'Jensen Huang',
    role: 'CEO',
    companyName: 'NVIDIA Corporation',
    ticker: 'NVDA',
    transactionType: 'Sale',
    shares: 120000,
    price: 874.20,
    value: 104904000,
    transactionDate: new Date('2024-12-10'),
    filingDate: new Date('2024-12-12'),
    is10b5_1: true,
    isOpenMarketPurchase: false,
    signalScore: 42,
    signalLabel: 'Planned Sale (10b5-1)',
    aiInterpretation: 'Pre-planned 10b5-1 sale. Not indicative of bearish outlook.',
  },
  {
    id: '2',
    insiderName: 'Lisa Su',
    role: 'CEO',
    companyName: 'Advanced Micro Devices',
    ticker: 'AMD',
    transactionType: 'Purchase',
    shares: 5000,
    price: 155.30,
    value: 776500,
    transactionDate: new Date('2024-12-01'),
    filingDate: new Date('2024-12-03'),
    is10b5_1: false,
    isOpenMarketPurchase: true,
    signalScore: 82,
    signalLabel: 'Strong Buy Signal',
    aiInterpretation: 'Open market purchase by CEO at 52-week lows. Strong insider confidence signal.',
  },
  {
    id: '3',
    insiderName: 'Satya Nadella',
    role: 'CEO',
    companyName: 'Microsoft Corporation',
    ticker: 'MSFT',
    transactionType: 'Sale',
    shares: 15000,
    price: 412.50,
    value: 6187500,
    transactionDate: new Date('2024-12-05'),
    filingDate: new Date('2024-12-07'),
    is10b5_1: true,
    isOpenMarketPurchase: false,
    signalScore: 38,
    signalLabel: 'Planned Sale',
    aiInterpretation: 'Regular planned disposal. No unusual activity.',
  },
]

export const mockSocialSentiment: SocialSentiment[] = [
  {
    ticker: 'NVDA',
    sentimentScore: 0.82,
    mentionVolume: 142500,
    bullishPct: 74.2,
    bearishPct: 12.1,
    neutralPct: 13.7,
    velocityScore: 92,
    hypeRiskScore: 68,
    topTopics: ['AI chips', 'datacenter', 'earnings beat'],
  },
  {
    ticker: 'TSLA',
    sentimentScore: 0.31,
    mentionVolume: 198200,
    bullishPct: 42.3,
    bearishPct: 38.8,
    neutralPct: 18.9,
    velocityScore: 85,
    hypeRiskScore: 82,
    topTopics: ['delivery numbers', 'FSD progress', 'price cuts'],
  },
  {
    ticker: 'BTC',
    sentimentScore: 0.68,
    mentionVolume: 312000,
    bullishPct: 62.1,
    bearishPct: 21.4,
    neutralPct: 16.5,
    velocityScore: 89,
    hypeRiskScore: 74,
    topTopics: ['ETF inflows', 'halving', 'institutional buying'],
  },
  {
    ticker: 'AMD',
    sentimentScore: 0.71,
    mentionVolume: 78300,
    bullishPct: 68.4,
    bearishPct: 14.2,
    neutralPct: 17.4,
    velocityScore: 78,
    hypeRiskScore: 45,
    topTopics: ['MI300X', 'AI competition', 'Lisa Su'],
  },
]

export const mockHeatmapData: HeatmapTile[] = [
  // Technology
  { symbol: 'NVDA', name: 'NVIDIA', changePct: 4.21, marketCap: 2150e9, sector: 'Technology', weight: 5.2 },
  { symbol: 'MSFT', name: 'Microsoft', changePct: 0.80, marketCap: 3090e9, sector: 'Technology', weight: 7.4 },
  { symbol: 'AAPL', name: 'Apple', changePct: 0.95, marketCap: 2980e9, sector: 'Technology', weight: 7.1 },
  { symbol: 'AVGO', name: 'Broadcom', changePct: 2.14, marketCap: 765e9, sector: 'Technology', weight: 1.8 },
  { symbol: 'AMD', name: 'AMD', changePct: 4.27, marketCap: 274e9, sector: 'Technology', weight: 0.7 },
  { symbol: 'ADBE', name: 'Adobe', changePct: -0.52, marketCap: 245e9, sector: 'Technology', weight: 0.6 },
  { symbol: 'QCOM', name: 'Qualcomm', changePct: 1.24, marketCap: 198e9, sector: 'Technology', weight: 0.5 },
  { symbol: 'INTC', name: 'Intel', changePct: -1.82, marketCap: 132e9, sector: 'Technology', weight: 0.3 },
  { symbol: 'CRM', name: 'Salesforce', changePct: 0.38, marketCap: 285e9, sector: 'Technology', weight: 0.7 },
  { symbol: 'ORCL', name: 'Oracle', changePct: 1.92, marketCap: 342e9, sector: 'Technology', weight: 0.8 },
  // Communication Services
  { symbol: 'GOOGL', name: 'Alphabet', changePct: 0.80, marketCap: 2210e9, sector: 'Communication Services', weight: 5.3 },
  { symbol: 'META', name: 'Meta', changePct: 1.84, marketCap: 1340e9, sector: 'Communication Services', weight: 3.2 },
  { symbol: 'NFLX', name: 'Netflix', changePct: 1.52, marketCap: 296e9, sector: 'Communication Services', weight: 0.7 },
  { symbol: 'SPOT', name: 'Spotify', changePct: 2.18, marketCap: 68e9, sector: 'Communication Services', weight: 0.2 },
  // Consumer Discretionary
  { symbol: 'AMZN', name: 'Amazon', changePct: 1.33, marketCap: 2080e9, sector: 'Consumer Discretionary', weight: 5.0 },
  { symbol: 'TSLA', name: 'Tesla', changePct: -2.36, marketCap: 771e9, sector: 'Consumer Discretionary', weight: 1.8 },
  { symbol: 'COST', name: 'Costco', changePct: 0.24, marketCap: 392e9, sector: 'Consumer Discretionary', weight: 0.9 },
  { symbol: 'UBER', name: 'Uber', changePct: 1.12, marketCap: 168e9, sector: 'Consumer Discretionary', weight: 0.4 },
  // Financials
  { symbol: 'JPM', name: 'JPMorgan', changePct: 0.42, marketCap: 596e9, sector: 'Financials', weight: 1.4 },
  { symbol: 'BAC', name: 'Bank of America', changePct: -0.18, marketCap: 298e9, sector: 'Financials', weight: 0.7 },
  { symbol: 'GS', name: 'Goldman Sachs', changePct: 0.88, marketCap: 168e9, sector: 'Financials', weight: 0.4 },
  // Healthcare
  { symbol: 'LLY', name: 'Eli Lilly', changePct: 1.42, marketCap: 824e9, sector: 'Healthcare', weight: 2.0 },
  { symbol: 'UNH', name: 'UnitedHealth', changePct: -0.72, marketCap: 485e9, sector: 'Healthcare', weight: 1.2 },
  { symbol: 'JNJ', name: 'J&J', changePct: 0.14, marketCap: 384e9, sector: 'Healthcare', weight: 0.9 },
  // Energy
  { symbol: 'XOM', name: 'ExxonMobil', changePct: -0.38, marketCap: 456e9, sector: 'Energy', weight: 1.1 },
  { symbol: 'CVX', name: 'Chevron', changePct: -0.52, marketCap: 298e9, sector: 'Energy', weight: 0.7 },
]

export const mockMacroEvents = [
  { date: '2025-01-29', label: 'FOMC Rate Decision', type: 'fed', impact: 'high' },
  { date: '2025-01-30', label: 'US GDP Q4 Advance', type: 'macro', impact: 'high' },
  { date: '2025-01-31', label: 'PCE Price Index', type: 'inflation', impact: 'high' },
  { date: '2025-02-07', label: 'US Nonfarm Payrolls', type: 'jobs', impact: 'high' },
  { date: '2025-02-12', label: 'US CPI (Jan)', type: 'inflation', impact: 'high' },
]

export const mockWatchlistItems: MarketAsset[] = [
  mockTopMovers[0], // NVDA
  mockTopMovers[1], // AMD
  mockAllAssets.find(a => a.symbol === 'MSFT')!,
  mockTopMovers[4], // META
  mockTopMovers[5], // BTC
]
