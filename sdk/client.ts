import type {
  MarketOverviewResponse,
  AssetSnapshotResponse,
  TopMoversResponse,
  HeatmapResponse,
  SmartMoneyResponse,
  SocialSentimentResponse,
  NarrativesResponse,
  ExplainMoveResponse,
  NewsletterRequest,
  NewsletterResponse,
  OswolSDKConfig,
} from './types'

export class OswolSDK {
  private baseUrl: string
  private apiKey: string

  constructor(config: OswolSDKConfig = {}) {
    this.baseUrl = config.baseUrl || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_URL || '' : '') || 'http://localhost:3000'
    this.apiKey = config.apiKey || (typeof process !== 'undefined' ? process.env.OSWOL_API_KEY || '' : '') || ''
  }

  // markets namespace
  markets = {
    overview: (): Promise<MarketOverviewResponse> =>
      this.get('/api/markets/overview'),
    topMovers: (): Promise<TopMoversResponse> =>
      this.get('/api/markets/top-movers'),
    asset: (symbol: string): Promise<AssetSnapshotResponse> =>
      this.get(`/api/markets/${symbol}`),
    explainMove: (symbol: string, changePct?: number): Promise<ExplainMoveResponse> =>
      this.post('/api/ai/explain-move', { symbol, changePct }),
    search: (query: string): Promise<unknown> =>
      this.get('/api/markets/search', { q: query }),
  }

  // smartMoney namespace
  smartMoney = {
    all: (): Promise<SmartMoneyResponse> =>
      this.get('/api/smart-money'),
    politicians: (symbol?: string): Promise<SmartMoneyResponse> =>
      this.get('/api/smart-money/politicians', symbol ? { ticker: symbol } : {}),
    insiders: (symbol?: string): Promise<SmartMoneyResponse> =>
      this.get('/api/smart-money/insiders', symbol ? { ticker: symbol } : {}),
    funds: (): Promise<SmartMoneyResponse> =>
      this.get('/api/smart-money/funds'),
    forSymbol: (symbol: string): Promise<SmartMoneyResponse> =>
      this.get(`/api/smart-money/ticker/${symbol}`),
  }

  // social namespace
  social = {
    narratives: (): Promise<NarrativesResponse> =>
      this.get('/api/social/narratives'),
    trending: (): Promise<NarrativesResponse> =>
      this.get('/api/social/trending'),
    sentiment: (symbol: string): Promise<SocialSentimentResponse> =>
      this.get(`/api/social/sentiment/${symbol}`),
    ticker: (symbol: string): Promise<SocialSentimentResponse> =>
      this.get(`/api/social/ticker/${symbol}`),
  }

  // heatmap namespace
  heatmap = {
    all: (): Promise<HeatmapResponse> =>
      this.get('/api/heatmap'),
    nasdaq100: (): Promise<HeatmapResponse> =>
      this.get('/api/heatmap/nasdaq100'),
    sectors: (): Promise<HeatmapResponse> =>
      this.get('/api/heatmap/sectors'),
    etfs: (): Promise<HeatmapResponse> =>
      this.get('/api/heatmap/etfs'),
    crypto: (): Promise<HeatmapResponse> =>
      this.get('/api/heatmap/crypto'),
  }

  // ai namespace
  ai = {
    explainMove: (symbol: string, changePct?: number): Promise<ExplainMoveResponse> =>
      this.post('/api/ai/explain-move', { symbol, changePct }),
    newsletter: (params: NewsletterRequest): Promise<NewsletterResponse> =>
      this.post('/api/ai/newsletter', params),
  }

  private async get<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    const res = await fetch(url.toString(), {
      headers: { 'x-api-key': this.apiKey },
    })
    if (!res.ok) throw new Error(`Oswol SDK: ${res.status} ${res.statusText}`)
    return res.json() as Promise<T>
  }

  private async post<T = unknown>(path: string, body: object): Promise<T> {
    const url = new URL(path, this.baseUrl)
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Oswol SDK: ${res.status} ${res.statusText}`)
    return res.json() as Promise<T>
  }
}

export const oswol = new OswolSDK()
