export interface Narrative {
  id: string
  name: string
  description: string
  velocityScore: number
  mentionVolume: number
  hypeRiskScore: number
  newsConfirmation: 'confirmed' | 'partial' | 'unconfirmed'
  relatedAssets: string[]
  trend: 'surging' | 'rising' | 'flat' | 'cooling'
  sentiment: number
  platforms: { twitter: number; reddit: number; tiktok: number; discord: number }
  topDiscussions: Array<{ platform: string; text: string; engagement: number; time: string }>
}

export interface TickerSentimentData {
  ticker: string
  name: string
  sentimentScore: number
  mentionVolume: number
  mentionChange24h: number
  bullishPct: number
  bearishPct: number
  neutralPct: number
  velocityScore: number
  hypeRiskScore: number
  topTopics: string[]
  platforms: { twitter: number; reddit: number; tiktok: number; discord: number }
  recentPosts: Array<{ platform: string; text: string; engagement: number; time: string; sentiment: 'bullish' | 'bearish' | 'neutral' }>
}

export const mockNarratives: Narrative[] = [
  {
    id: '1',
    name: 'AI Power Demand',
    description: 'Hyperscalers + utilities deal flow + nuclear PPAs driving massive power infrastructure buildout',
    velocityScore: 92,
    mentionVolume: 48200,
    hypeRiskScore: 62,
    newsConfirmation: 'confirmed',
    relatedAssets: ['NVDA', 'VST', 'CEG', 'TLN', 'SMR', 'NLR'],
    trend: 'surging',
    sentiment: 0.78,
    platforms: { twitter: 64, reddit: 22, tiktok: 9, discord: 5 },
    topDiscussions: [
      { platform: 'X · @energy_macro', text: 'Power demand for AI hits the grid. PJM auction prices doubling.', engagement: 4200, time: '1h' },
      { platform: 'Reddit · r/stocks', text: 'Utilities outperform semis next 12 months. VST + CEG already ripping.', engagement: 1800, time: '3h' },
    ],
  },
  {
    id: '2',
    name: 'GLP-1 Drug Race',
    description: 'Oral GLP-1 trial readouts; obesity drug TAM expansion estimates accelerating',
    velocityScore: 71,
    mentionVolume: 21600,
    hypeRiskScore: 42,
    newsConfirmation: 'confirmed',
    relatedAssets: ['LLY', 'NVO', 'VKTX', 'AMGN'],
    trend: 'rising',
    sentiment: 0.65,
    platforms: { twitter: 58, reddit: 28, tiktok: 10, discord: 4 },
    topDiscussions: [
      { platform: 'X · @pharma_watch', text: 'Oral GLP-1 data looking very clean. Next leg up for LLY.', engagement: 2100, time: '2h' },
    ],
  },
  {
    id: '3',
    name: 'China Stimulus Cycle',
    description: 'PBoC RRR cut whispers; property sector support signals; foreign fund inflows',
    velocityScore: 58,
    mentionVolume: 17000,
    hypeRiskScore: 55,
    newsConfirmation: 'partial',
    relatedAssets: ['FXI', 'BABA', 'KWEB', 'PDD', 'NIO'],
    trend: 'rising',
    sentiment: 0.41,
    platforms: { twitter: 70, reddit: 18, tiktok: 7, discord: 5 },
    topDiscussions: [
      { platform: 'X · @china_markets', text: 'PBoC sources hinting at RRR cut before Q2 end.', engagement: 3200, time: '4h' },
    ],
  },
  {
    id: '4',
    name: 'Quantum Computing',
    description: 'IBM Q-Heron specs coverage; retail rotation into small quantum plays',
    velocityScore: 41,
    mentionVolume: 9400,
    hypeRiskScore: 88,
    newsConfirmation: 'unconfirmed',
    relatedAssets: ['IONQ', 'RGTI', 'QBTS', 'IBM'],
    trend: 'cooling',
    sentiment: 0.28,
    platforms: { twitter: 52, reddit: 35, tiktok: 8, discord: 5 },
    topDiscussions: [
      { platform: 'Reddit · r/wallstreetbets', text: 'Quantum is the next AI. Loading up on IONQ calls.', engagement: 8400, time: '5h' },
    ],
  },
  {
    id: '5',
    name: 'Uranium Supply Squeeze',
    description: 'Cameco Q1 + Kazakh export caps; SPUT premium expanding; nuclear renaissance narrative',
    velocityScore: 38,
    mentionVolume: 7100,
    hypeRiskScore: 35,
    newsConfirmation: 'confirmed',
    relatedAssets: ['CCJ', 'UEC', 'URA', 'NLR', 'UUUU'],
    trend: 'rising',
    sentiment: 0.72,
    platforms: { twitter: 48, reddit: 38, tiktok: 6, discord: 8 },
    topDiscussions: [],
  },
  {
    id: '6',
    name: 'Defense Rebuild',
    description: 'Pentagon FY27 budget leak; missiles + autonomous systems focus; NATO 2% floor',
    velocityScore: 34,
    mentionVolume: 5600,
    hypeRiskScore: 28,
    newsConfirmation: 'confirmed',
    relatedAssets: ['LMT', 'RTX', 'KTOS', 'PLTR', 'AXON'],
    trend: 'flat',
    sentiment: 0.54,
    platforms: { twitter: 55, reddit: 30, tiktok: 8, discord: 7 },
    topDiscussions: [],
  },
]

export const mockTickerSentiment: Record<string, TickerSentimentData> = {
  NVDA: {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sentimentScore: 0.82,
    mentionVolume: 142500,
    mentionChange24h: 312,
    bullishPct: 74.2,
    bearishPct: 12.1,
    neutralPct: 13.7,
    velocityScore: 92,
    hypeRiskScore: 68,
    topTopics: ['AI chips', 'datacenter', 'earnings beat', 'H100 demand', 'Blackwell'],
    platforms: { twitter: 62, reddit: 24, tiktok: 9, discord: 5 },
    recentPosts: [
      { platform: 'X · @ai_investor', text: 'NVDA Q1 print confirms the AI infrastructure supercycle is real. DC revenue +427% YoY.', engagement: 8200, time: '1h', sentiment: 'bullish' },
      { platform: 'Reddit · r/stocks', text: 'I keep telling people to not bet against Jensen. The man is always 2 years ahead.', engagement: 3100, time: '2h', sentiment: 'bullish' },
      { platform: 'X · @bearmarket_ben', text: 'P/E at 68x is not sustainable. Great company, terrible entry.', engagement: 1200, time: '3h', sentiment: 'bearish' },
    ],
  },
  TSLA: {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    sentimentScore: 0.31,
    mentionVolume: 198200,
    mentionChange24h: 48,
    bullishPct: 42.3,
    bearishPct: 38.8,
    neutralPct: 18.9,
    velocityScore: 85,
    hypeRiskScore: 82,
    topTopics: ['delivery numbers', 'FSD progress', 'price cuts', 'Cybertruck', 'Elon'],
    platforms: { twitter: 68, reddit: 20, tiktok: 8, discord: 4 },
    recentPosts: [
      { platform: 'X · @tesla_daily', text: 'FSD 12.4 rolling out to more users. This is the turning point.', engagement: 5400, time: '2h', sentiment: 'bullish' },
      { platform: 'Reddit · r/TSLA', text: 'Q1 delivery miss is not the narrative people think it is.', engagement: 2200, time: '4h', sentiment: 'neutral' },
    ],
  },
  BTC: {
    ticker: 'BTC',
    name: 'Bitcoin',
    sentimentScore: 0.68,
    mentionVolume: 312000,
    mentionChange24h: 48,
    bullishPct: 62.1,
    bearishPct: 21.4,
    neutralPct: 16.5,
    velocityScore: 89,
    hypeRiskScore: 74,
    topTopics: ['ETF inflows', 'halving', 'institutional buying', 'BlackRock', 'supply shock'],
    platforms: { twitter: 55, reddit: 28, tiktok: 12, discord: 5 },
    recentPosts: [
      { platform: 'X · @micro_strategy', text: 'IBIT hit new AUM record. Institutional demand is structural not cyclical.', engagement: 12000, time: '1h', sentiment: 'bullish' },
    ],
  },
  AMD: {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    sentimentScore: 0.71,
    mentionVolume: 78300,
    mentionChange24h: 128,
    bullishPct: 68.4,
    bearishPct: 14.2,
    neutralPct: 17.4,
    velocityScore: 78,
    hypeRiskScore: 45,
    topTopics: ['MI300X', 'AI competition', 'Lisa Su', 'data center', 'gaming'],
    platforms: { twitter: 58, reddit: 30, tiktok: 7, discord: 5 },
    recentPosts: [
      { platform: 'X · @chip_analyst', text: 'AMD MI300X winning data center sockets. NVDA not the only game in town.', engagement: 3400, time: '1h', sentiment: 'bullish' },
      { platform: 'Reddit · r/AMD', text: 'Lisa Su open market buy is the signal of the year. She knows.', engagement: 2800, time: '3h', sentiment: 'bullish' },
    ],
  },
  META: {
    ticker: 'META',
    name: 'Meta Platforms',
    sentimentScore: 0.61,
    mentionVolume: 54200,
    mentionChange24h: 87,
    bullishPct: 58.2,
    bearishPct: 22.1,
    neutralPct: 19.7,
    velocityScore: 66,
    hypeRiskScore: 52,
    topTopics: ['Llama 3', 'AI ads', 'Ray-Ban glasses', 'Threads growth', 'capex'],
    platforms: { twitter: 60, reddit: 25, tiktok: 10, discord: 5 },
    recentPosts: [
      { platform: 'X · @social_tech', text: 'Meta AI now 1B+ monthly actives. Zuckerberg execution has been flawless.', engagement: 4100, time: '2h', sentiment: 'bullish' },
    ],
  },
}

export const mockTrendingTickers = [
  { ticker: 'NVDA', mentionChange24h: 312, sentimentScore: 0.82, velocityScore: 92 },
  { ticker: 'BTC', mentionChange24h: 48, sentimentScore: 0.68, velocityScore: 89 },
  { ticker: 'TSLA', mentionChange24h: 48, sentimentScore: 0.31, velocityScore: 85 },
  { ticker: 'AMD', mentionChange24h: 128, sentimentScore: 0.71, velocityScore: 78 },
  { ticker: 'META', mentionChange24h: 87, sentimentScore: 0.61, velocityScore: 66 },
]
