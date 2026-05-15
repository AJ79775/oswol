import { PrismaClient, AssetClass } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with demo data...')

  // Create Assets - Equities
  const equities = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software' },
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services', industry: 'Internet' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', industry: 'E-Commerce' },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services', industry: 'Social Media' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors' },
    { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', industry: 'Semiconductors' },
    { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', industry: 'Streaming' },
    { symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer Staples', industry: 'Retail' },
    { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', industry: 'Software' },
    { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology', industry: 'Semiconductors' },
    { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors' },
    { symbol: 'PYPL', name: 'PayPal Holdings', sector: 'Financials', industry: 'Fintech' },
    { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', industry: 'Software' },
    { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', industry: 'Software' },
    { symbol: 'UBER', name: 'Uber Technologies', sector: 'Consumer Discretionary', industry: 'Ride Hailing' },
    { symbol: 'SPOT', name: 'Spotify Technology', sector: 'Communication Services', industry: 'Music Streaming' },
    { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', industry: 'Cloud Data' },
    { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', industry: 'AI/Analytics' },
    { symbol: 'ARM', name: 'Arm Holdings', sector: 'Technology', industry: 'Semiconductors' },
  ]

  for (const eq of equities) {
    await prisma.asset.upsert({
      where: { symbol: eq.symbol },
      update: {},
      create: {
        symbol: eq.symbol,
        name: eq.name,
        assetClass: AssetClass.EQUITY,
        exchange: 'NASDAQ',
        sector: eq.sector,
        industry: eq.industry,
        isDemoData: true,
      },
    })
  }

  // ETFs
  const etfs = [
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF' },
    { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
    { symbol: 'XLK', name: 'Technology Select Sector SPDR' },
    { symbol: 'XLF', name: 'Financial Select Sector SPDR' },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR' },
    { symbol: 'XLV', name: 'Health Care Select Sector SPDR' },
    { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
    { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF' },
    { symbol: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF' },
    { symbol: 'GLD', name: 'SPDR Gold Shares' },
    { symbol: 'IBIT', name: 'iShares Bitcoin Trust' },
  ]

  for (const etf of etfs) {
    await prisma.asset.upsert({
      where: { symbol: etf.symbol },
      update: {},
      create: {
        symbol: etf.symbol,
        name: etf.name,
        assetClass: AssetClass.ETF,
        exchange: 'NYSE',
        isDemoData: true,
      },
    })
  }

  // Crypto
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'XRP', name: 'XRP' },
  ]

  for (const crypto of cryptos) {
    await prisma.asset.upsert({
      where: { symbol: crypto.symbol },
      update: {},
      create: {
        symbol: crypto.symbol,
        name: crypto.name,
        assetClass: AssetClass.CRYPTO,
        currency: 'USD',
        isDemoData: true,
      },
    })
  }

  // FX
  const fxPairs = [
    { symbol: 'DXY', name: 'US Dollar Index' },
    { symbol: 'EURUSD', name: 'Euro / US Dollar' },
    { symbol: 'GBPUSD', name: 'British Pound / US Dollar' },
    { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen' },
    { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc' },
  ]

  for (const fx of fxPairs) {
    await prisma.asset.upsert({
      where: { symbol: fx.symbol },
      update: {},
      create: {
        symbol: fx.symbol,
        name: fx.name,
        assetClass: AssetClass.FX,
        isDemoData: true,
      },
    })
  }

  // Commodities
  const commodities = [
    { symbol: 'GOLD', name: 'Gold Spot' },
    { symbol: 'SILVER', name: 'Silver Spot' },
    { symbol: 'OIL', name: 'Crude Oil WTI' },
    { symbol: 'NATGAS', name: 'Natural Gas' },
  ]

  for (const commodity of commodities) {
    await prisma.asset.upsert({
      where: { symbol: commodity.symbol },
      update: {},
      create: {
        symbol: commodity.symbol,
        name: commodity.name,
        assetClass: AssetClass.COMMODITY,
        isDemoData: true,
      },
    })
  }

  // Rates
  const rates = [
    { symbol: 'US10Y', name: 'US 10-Year Treasury Yield', assetClass: AssetClass.RATE },
    { symbol: 'US02Y', name: 'US 2-Year Treasury Yield', assetClass: AssetClass.RATE },
    { symbol: 'US30Y', name: 'US 30-Year Treasury Yield', assetClass: AssetClass.RATE },
    { symbol: 'VIX', name: 'CBOE Volatility Index', assetClass: AssetClass.VOLATILITY },
  ]

  for (const rate of rates) {
    await prisma.asset.upsert({
      where: { symbol: rate.symbol },
      update: {},
      create: {
        symbol: rate.symbol,
        name: rate.name,
        assetClass: rate.assetClass,
        isDemoData: true,
      },
    })
  }

  // Price Snapshots for key assets
  const priceData = [
    { symbol: 'NVDA', price: 875.42, open: 865.0, high: 882.3, low: 860.1, changePct: 1.21, changeAmt: 10.52, volume: 48200000, marketCap: 2150000000000 },
    { symbol: 'MSFT', price: 415.32, open: 412.0, high: 418.5, low: 410.2, changePct: 0.80, changeAmt: 3.32, volume: 22100000, marketCap: 3090000000000 },
    { symbol: 'AAPL', price: 195.64, open: 193.8, high: 197.2, low: 192.9, changePct: 0.95, changeAmt: 1.84, volume: 61500000, marketCap: 2980000000000 },
    { symbol: 'GOOGL', price: 178.42, open: 177.0, high: 179.8, low: 175.3, changePct: 0.80, changeAmt: 1.42, volume: 28700000, marketCap: 2210000000000 },
    { symbol: 'AMZN', price: 199.12, open: 196.5, high: 201.3, low: 195.8, changePct: 1.33, changeAmt: 2.62, volume: 35800000, marketCap: 2080000000000 },
    { symbol: 'META', price: 524.38, open: 520.0, high: 528.7, low: 518.4, changePct: 0.84, changeAmt: 4.38, volume: 19200000, marketCap: 1340000000000 },
    { symbol: 'TSLA', price: 242.15, open: 248.0, high: 250.1, low: 238.5, changePct: -2.36, changeAmt: -5.85, volume: 125600000, marketCap: 771000000000 },
    { symbol: 'AMD', price: 168.92, open: 162.0, high: 171.3, low: 161.5, changePct: 4.27, changeAmt: 6.92, volume: 78900000, marketCap: 274000000000 },
    { symbol: 'BTC', price: 67842.50, open: 66200.0, high: 68500.0, low: 65800.0, changePct: 2.48, changeAmt: 1642.50, volume: 28500000000, marketCap: 1335000000000 },
    { symbol: 'ETH', price: 3524.80, open: 3480.0, high: 3580.0, low: 3420.0, changePct: 1.29, changeAmt: 44.80, volume: 15200000000, marketCap: 424000000000 },
    { symbol: 'SPY', price: 524.87, open: 521.3, high: 526.2, low: 520.5, changePct: 0.68, changeAmt: 3.57, volume: 68200000, marketCap: 0 },
    { symbol: 'QQQ', price: 448.92, open: 445.0, high: 450.8, low: 443.5, changePct: 0.88, changeAmt: 3.92, volume: 42100000, marketCap: 0 },
    { symbol: 'VIX', price: 13.42, open: 14.1, high: 14.5, low: 13.1, changePct: -4.82, changeAmt: -0.68, volume: 0, marketCap: 0 },
  ]

  for (const pd of priceData) {
    const asset = await prisma.asset.findUnique({ where: { symbol: pd.symbol } })
    if (asset) {
      await prisma.priceSnapshot.create({
        data: {
          assetId: asset.id,
          price: pd.price,
          open: pd.open,
          high: pd.high,
          low: pd.low,
          changePct: pd.changePct,
          changeAmt: pd.changeAmt,
          volume: pd.volume,
          marketCap: pd.marketCap,
          timestamp: new Date(),
          isDemoData: true,
        },
      })
    }
  }

  // Politician Trades
  const nvdaAsset = await prisma.asset.findUnique({ where: { symbol: 'NVDA' } })
  const msftAsset = await prisma.asset.findUnique({ where: { symbol: 'MSFT' } })
  const googleAsset = await prisma.asset.findUnique({ where: { symbol: 'GOOGL' } })

  const politicianTrades = [
    {
      politicianName: 'Nancy Pelosi',
      chamber: 'House',
      party: 'Democrat',
      stateOrDistrict: 'CA-11',
      assetId: nvdaAsset?.id,
      ticker: 'NVDA',
      companyName: 'NVIDIA Corporation',
      assetType: 'Stock',
      transactionType: 'Purchase',
      valueRange: '$500,001 - $1,000,000',
      transactionDate: new Date('2024-11-15'),
      disclosureDate: new Date('2024-12-28'),
      reportingDelayDays: 43,
      sourceName: 'STOCK Act',
      signalScore: 87,
      signalLabel: 'High Conviction Buy',
      aiInterpretation: 'Significant purchase ahead of AI infrastructure legislation. Pattern consistent with prior tech buys.',
    },
    {
      politicianName: 'Dan Crenshaw',
      chamber: 'House',
      party: 'Republican',
      stateOrDistrict: 'TX-02',
      assetId: msftAsset?.id,
      ticker: 'MSFT',
      companyName: 'Microsoft Corporation',
      assetType: 'Stock',
      transactionType: 'Purchase',
      valueRange: '$50,001 - $100,000',
      transactionDate: new Date('2024-12-03'),
      disclosureDate: new Date('2025-01-14'),
      reportingDelayDays: 42,
      sourceName: 'STOCK Act',
      signalScore: 62,
      signalLabel: 'Moderate',
      aiInterpretation: 'Moderate purchase of cloud leader. No committee overlap flagged.',
    },
    {
      politicianName: 'Tommy Tuberville',
      chamber: 'Senate',
      party: 'Republican',
      stateOrDistrict: 'Alabama',
      assetId: googleAsset?.id,
      ticker: 'GOOGL',
      companyName: 'Alphabet Inc.',
      assetType: 'Stock',
      transactionType: 'Sale',
      valueRange: '$100,001 - $250,000',
      transactionDate: new Date('2024-11-28'),
      disclosureDate: new Date('2025-01-08'),
      reportingDelayDays: 41,
      sourceName: 'STOCK Act',
      signalScore: 55,
      signalLabel: 'Neutral Exit',
      aiInterpretation: 'Exit from GOOGL position. Timing pre-antitrust ruling. Watch for re-entry.',
    },
  ]

  for (const trade of politicianTrades) {
    await prisma.politicianTrade.create({ data: { ...trade, isDemoData: true } })
  }

  // Insider Trades
  const insiderTrades = [
    {
      insiderName: 'Jensen Huang',
      role: 'CEO',
      companyName: 'NVIDIA Corporation',
      assetId: nvdaAsset?.id,
      ticker: 'NVDA',
      transactionType: 'Sale',
      shares: 120000,
      price: 874.20,
      value: 104904000,
      transactionDate: new Date('2024-12-10'),
      filingDate: new Date('2024-12-12'),
      formType: 'Form 4',
      sourceName: 'SEC EDGAR',
      is10b5_1: true,
      signalScore: 42,
      signalLabel: 'Planned Sale (10b5-1)',
      aiInterpretation: 'Pre-planned 10b5-1 sale. Not indicative of bearish outlook.',
    },
    {
      insiderName: 'Satya Nadella',
      role: 'CEO',
      companyName: 'Microsoft Corporation',
      assetId: msftAsset?.id,
      ticker: 'MSFT',
      transactionType: 'Sale',
      shares: 15000,
      price: 412.50,
      value: 6187500,
      transactionDate: new Date('2024-12-05'),
      filingDate: new Date('2024-12-07'),
      formType: 'Form 4',
      sourceName: 'SEC EDGAR',
      is10b5_1: true,
      signalScore: 38,
      signalLabel: 'Planned Sale',
      aiInterpretation: 'Regular planned disposal. No unusual activity.',
    },
    {
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
      formType: 'Form 4',
      sourceName: 'SEC EDGAR',
      isOpenMarketPurchase: true,
      signalScore: 82,
      signalLabel: 'Strong Buy Signal',
      aiInterpretation: 'Open market purchase by CEO at 52-week lows. Strong insider confidence signal.',
    },
  ]

  for (const trade of insiderTrades) {
    await prisma.insiderTrade.create({ data: { ...trade, isDemoData: true } })
  }

  // Funds & Holdings
  const fund1 = await prisma.fund.create({
    data: {
      name: 'Ark Investment Management',
      managerName: 'Cathie Wood',
      cik: '0001579982',
      aum: 12800000000,
      isDemoData: true,
    },
  })

  const fund2 = await prisma.fund.create({
    data: {
      name: 'Bridgewater Associates',
      managerName: 'Ray Dalio',
      cik: '0001350694',
      aum: 150000000000,
      isDemoData: true,
    },
  })

  const filing1 = await prisma.institutionalFiling.create({
    data: {
      fundId: fund1.id,
      filingPeriod: 'Q3 2024',
      filingDate: new Date('2024-11-14'),
      isDemoData: true,
    },
  })

  const filing2 = await prisma.institutionalFiling.create({
    data: {
      fundId: fund2.id,
      filingPeriod: 'Q3 2024',
      filingDate: new Date('2024-11-15'),
      isDemoData: true,
    },
  })

  const holdingsData1 = [
    { ticker: 'TSLA', companyName: 'Tesla Inc.', shares: 15200000, marketValue: 3680000000, portfolioWeight: 28.7, changeInShares: 2100000, changePercent: 16.0, actionType: 'Increased' },
    { ticker: 'NVDA', companyName: 'NVIDIA Corporation', shares: 2800000, marketValue: 2450000000, portfolioWeight: 19.1, changeInShares: 500000, changePercent: 21.7, actionType: 'Increased' },
    { ticker: 'AMD', companyName: 'Advanced Micro Devices', shares: 8500000, marketValue: 1436000000, portfolioWeight: 11.2, changeInShares: -1200000, changePercent: -12.4, actionType: 'Reduced' },
    { ticker: 'ORCL', companyName: 'Oracle Corporation', shares: 6200000, marketValue: 874000000, portfolioWeight: 6.8, changeInShares: 1800000, changePercent: 40.9, actionType: 'Increased' },
  ]

  for (const h of holdingsData1) {
    const asset = await prisma.asset.findUnique({ where: { symbol: h.ticker } })
    await prisma.institutionalHolding.create({
      data: {
        filingId: filing1.id,
        assetId: asset?.id,
        ticker: h.ticker,
        companyName: h.companyName,
        shares: h.shares,
        marketValue: h.marketValue,
        portfolioWeight: h.portfolioWeight,
        changeInShares: h.changeInShares,
        changePercent: h.changePercent,
        actionType: h.actionType,
        isDemoData: true,
      },
    })
  }

  const holdingsData2 = [
    { ticker: 'GLD', companyName: 'SPDR Gold Shares', shares: 42500000, marketValue: 8200000000, portfolioWeight: 5.5, changeInShares: 5000000, changePercent: 13.3, actionType: 'Increased' },
    { ticker: 'SPY', companyName: 'SPDR S&P 500 ETF', shares: 8200000, marketValue: 4310000000, portfolioWeight: 2.9, changeInShares: -1500000, changePercent: -15.5, actionType: 'Reduced' },
    { ticker: 'TLT', companyName: 'iShares 20+ Year Treasury Bond', shares: 12000000, marketValue: 1048000000, portfolioWeight: 0.7, changeInShares: 3000000, changePercent: 33.3, actionType: 'Increased' },
  ]

  for (const h of holdingsData2) {
    const asset = await prisma.asset.findUnique({ where: { symbol: h.ticker } })
    await prisma.institutionalHolding.create({
      data: {
        filingId: filing2.id,
        assetId: asset?.id,
        ticker: h.ticker,
        companyName: h.companyName,
        shares: h.shares,
        marketValue: h.marketValue,
        portfolioWeight: h.portfolioWeight,
        changeInShares: h.changeInShares,
        changePercent: h.changePercent,
        actionType: h.actionType,
        isDemoData: true,
      },
    })
  }

  // Social Sentiment Snapshots
  const sentimentData = [
    { ticker: 'NVDA', sentimentScore: 0.82, mentionVolume: 142500, bullishPct: 74.2, bearishPct: 12.1, neutralPct: 13.7, velocityScore: 92, hypeRiskScore: 68, topTopics: ['AI chips', 'datacenter', 'earnings beat'] },
    { ticker: 'TSLA', sentimentScore: 0.31, mentionVolume: 198200, bullishPct: 42.3, bearishPct: 38.8, neutralPct: 18.9, velocityScore: 85, hypeRiskScore: 82, topTopics: ['Elon', 'delivery numbers', 'FSD progress'] },
    { ticker: 'AMD', sentimentScore: 0.71, mentionVolume: 78300, bullishPct: 68.4, bearishPct: 14.2, neutralPct: 17.4, velocityScore: 78, hypeRiskScore: 45, topTopics: ['MI300X', 'AI competition', 'Lisa Su'] },
    { ticker: 'BTC', sentimentScore: 0.68, mentionVolume: 312000, bullishPct: 62.1, bearishPct: 21.4, neutralPct: 16.5, velocityScore: 89, hypeRiskScore: 74, topTopics: ['ETF inflows', 'halving', 'institutional buying'] },
    { ticker: 'META', sentimentScore: 0.74, mentionVolume: 54200, bullishPct: 70.2, bearishPct: 11.8, neutralPct: 18.0, velocityScore: 65, hypeRiskScore: 42, topTopics: ['AI investments', 'Llama', 'ad revenue'] },
  ]

  for (const s of sentimentData) {
    await prisma.socialSentimentSnapshot.create({
      data: {
        ticker: s.ticker,
        sentimentScore: s.sentimentScore,
        mentionVolume: s.mentionVolume,
        bullishPct: s.bullishPct,
        bearishPct: s.bearishPct,
        neutralPct: s.neutralPct,
        velocityScore: s.velocityScore,
        hypeRiskScore: s.hypeRiskScore,
        topTopics: s.topTopics,
        snapshotAt: new Date(),
        isDemoData: true,
      },
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
