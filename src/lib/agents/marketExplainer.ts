import { ExplainMoveOutput } from '@/lib/validators/explainMoveSchema'
import { OSWOL_DISCLAIMER } from '@/lib/compliance/financialSafety'

// Mock data for known symbols
const SYMBOL_CONTEXTS: Record<string, Partial<ExplainMoveOutput>> = {
  NVDA: {
    assetName: "NVIDIA Corporation",
    summary: "NVDA moved on strong earnings results and accelerating AI infrastructure demand signals.",
    whyMoving: [
      "Q1 earnings beat consensus by ~8% — Data Center segment grew 427% YoY",
      "Q2 revenue guide came in ~8% above street estimates",
      "Hyperscaler customers reiterated multi-year AI capital expenditure plans",
      "April CPI print was softer than expected, lifting duration-sensitive names",
    ],
    newsContext: "Bloomberg and Reuters confirmed Q1 results. SEC Form 4 filing from CFO indicated a pre-scheduled 10b5-1 sale — typically not a bearish signal.",
    macroContext: "April CPI printed 3.4% YoY vs 3.5% expected. 10Y yield fell 6bp. Cooler inflation may support rate-cut expectations for September.",
    smartMoneyContext: "Two Congressional disclosures filed today show NVDA purchases executed 43 days ago — lagging signals, not real-time. Net institutional flow appears positive over the past 30 trading days.",
    socialContext: "48.2k mentions in 24h (▲ 312%). Sentiment score +0.82. Top narrative: 'AI power demand.' Velocity is rising but hype risk is medium — not yet at retail-blowoff levels.",
    technicalContext: "Move cleared the prior week high. Next resistance area around 970. Implied volatility dropped from ~48 to ~39 post-earnings — options market repricing lower.",
    whatToWatch: [
      "Powell speech — language on disinflation trajectory",
      "SOXX breadth — is the rally sector-wide or just NVDA?",
      "Hyperscaler capex follow-throughs at MSFT/GOOGL earnings",
      "970 resistance / IV of ~39 — momentum vs mean-reversion setup",
    ],
    riskNotes: [
      "Valuation remains stretched at elevated multiples vs historical average",
      "Concentration risk — top 3 customers account for ~50%+ of revenue",
      "Social sentiment hype risk scored medium — monitor for retail-blowoff signals",
      "Congressional trades shown are delayed disclosures — not real-time positioning",
    ],
    confidence: 'high',
    sources: [
      { name: "Bloomberg", verified: true, url: "" },
      { name: "Reuters", verified: true, url: "" },
      { name: "SEC EDGAR (10-Q)", verified: true, url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=NVDA&type=10-Q" },
      { name: "SEC Form 4", verified: true, url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=NVDA&type=4" },
      { name: "BLS CPI Report", verified: true, url: "https://www.bls.gov/cpi/" },
      { name: "CME FedWatch", verified: false, url: "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" },
    ],
  },
  TSLA: {
    assetName: "Tesla Inc.",
    summary: "TSLA declined amid delivery shortfall concerns and broader EV demand uncertainty.",
    whyMoving: [
      "Q1 delivery numbers came in below analyst expectations",
      "EV demand concerns persist as traditional automakers push back pricing",
      "CEO distractions and political controversy weighing on brand sentiment",
    ],
    newsContext: "Multiple outlets reporting delivery miss. Reuters noted CEO public statements continue to generate media friction.",
    macroContext: "Consumer discretionary sector lagging broader market. Higher rates relative to recent history pressuring EV financing economics.",
    smartMoneyContext: "Hedge fund 13F data (lagging by one quarter) shows mixed institutional positioning. No notable recent political disclosures.",
    socialContext: "198.2k mentions in 24h. Sentiment score mixed at 0.31. High hype risk score at 82 — retail community is highly divided.",
    technicalContext: "Testing key support level. Volume above 30-day average suggesting elevated conviction in current move.",
    whatToWatch: [
      "Monthly delivery data releases",
      "FSD regulatory approvals progress",
      "Margin guidance at next earnings",
      "EV competitive landscape in China",
    ],
    riskNotes: [
      "High short interest may amplify price moves in either direction",
      "Social sentiment is highly polarized — hype risk score at 82",
      "CEO-related headline risk is elevated and unpredictable",
      "Delivery numbers are a lagging indicator of demand",
    ],
    confidence: 'medium',
    sources: [
      { name: "Reuters", verified: true },
      { name: "SEC Filings", verified: true },
      { name: "Social Sentiment (X/Reddit)", verified: false },
    ],
  },
  BTC: {
    assetName: "Bitcoin",
    summary: "BTC moved on ETF inflow data and broader macro risk appetite shifts.",
    whyMoving: [
      "Spot BTC ETF inflows showed continued institutional accumulation",
      "Post-halving supply dynamics reducing available sell pressure",
      "Risk-on macro environment as rate-cut expectations firmed",
    ],
    newsContext: "BlackRock IBIT and Fidelity FBTC reported positive net inflow days. CME futures open interest elevated.",
    macroContext: "Softer CPI data and declining yields boosted risk appetite broadly. DXY declined 0.2%, typically a tailwind for BTC.",
    smartMoneyContext: "On-chain data suggests whale accumulation patterns. No STOCK Act disclosures directly relevant to BTC.",
    socialContext: "312k mentions in 24h (▲ 48%). Sentiment +0.68. Top topics: ETF inflows, halving supply, institutional buying. Hype risk moderate at 74.",
    technicalContext: "Trading above 200-day MA. RSI elevated but not extreme. Key levels: support ~62k, resistance ~72k.",
    whatToWatch: [
      "Daily ETF flow data (IBIT, FBTC)",
      "CME futures funding rates",
      "On-chain long-term holder behavior",
      "DXY movement — inverse correlation often meaningful",
    ],
    riskNotes: [
      "Crypto assets are highly volatile and speculative in nature",
      "ETF flows are retroactive data — not predictive",
      "Social hype risk at 74 — monitor for sentiment reversal",
      "Regulatory headlines can cause rapid price dislocations",
    ],
    confidence: 'medium',
    sources: [
      { name: "Bloomberg ETF Monitor", verified: true },
      { name: "CME FedWatch", verified: false },
      { name: "Glassnode On-Chain", verified: false },
    ],
  },
  AMD: {
    assetName: "Advanced Micro Devices",
    summary: "AMD surged alongside NVDA on broad semiconductor sector strength driven by AI demand signals.",
    whyMoving: [
      "Sector-wide AI infrastructure tailwind lifted semiconductor names broadly",
      "MI300X GPU shipment data tracking ahead of initial estimates",
      "CEO Lisa Su open-market purchase (Form 4) interpreted as insider confidence",
      "SOXX index rebalancing may have added mechanical buying pressure",
    ],
    newsContext: "AMD benefited from sector halo effect around NVDA earnings. No AMD-specific catalyst confirmed — move appears primarily sector-driven.",
    macroContext: "Cooler CPI print broadly lifted rate-sensitive tech names. Semiconductor sector outperformed broader tech index by ~1.8%.",
    smartMoneyContext: "Lisa Su Form 4 open-market purchase at lower levels remains the most notable recent insider signal. Congressional disclosures show one AMD purchase (~6 weeks delayed).",
    socialContext: "78.3k mentions in 24h. Sentiment +0.71. Top topics: MI300X competition, AI market share narrative. Hype risk moderate at 45.",
    technicalContext: "Broke above near-term resistance. Watch $175 area for next technical test. Volume confirmed the move.",
    whatToWatch: [
      "MI300X volume update at next earnings",
      "Hyperscaler AI chip procurement decisions",
      "NVDA relative performance — leadership vs follow-through",
      "Lisa Su commentary at upcoming conferences",
    ],
    riskNotes: [
      "Secondary beneficiary to NVDA — dependent on sector halo, not standalone catalyst",
      "MI300X market share gains are still being established vs incumbent",
      "Valuation elevated relative to near-term earnings growth expectations",
      "Insider purchase signal is lagging — not real-time positioning",
    ],
    confidence: 'medium',
    sources: [
      { name: "SEC Form 4 (Lisa Su)", verified: true, url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AMD&type=4" },
      { name: "SOXX Index Data", verified: true },
      { name: "Social Sentiment (X/Reddit)", verified: false },
    ],
  },
  AAPL: {
    assetName: "Apple Inc.",
    summary: "AAPL moved modestly higher on broad market strength and continued services segment optimism.",
    whyMoving: [
      "Broad market risk-on sentiment lifted large-cap tech",
      "Services revenue growth narrative remains intact",
      "iPhone cycle resilience in emerging markets being highlighted by analysts",
    ],
    newsContext: "No major AAPL-specific news catalyst. Move appears correlated with QQQ index performance.",
    macroContext: "Large-cap tech broadly benefited from cooler inflation data and softening rate expectations.",
    smartMoneyContext: "No notable recent Congressional or large insider transactions in available public data.",
    socialContext: "92.4k mentions in 24h. Sentiment neutral-to-positive at 0.58. Top topics: iPhone sales, AI features, services growth.",
    technicalContext: "Trading near prior all-time high range. Volume in-line with 30-day average — no exceptional conviction signal.",
    whatToWatch: [
      "Services revenue growth trajectory at next earnings",
      "AI feature adoption data and App Store metrics",
      "China market share reports",
      "Macro consumer spending environment",
    ],
    riskNotes: [
      "Move lacks strong individual catalyst — primarily market-driven",
      "Regulatory risk in EU and potential antitrust actions",
      "China revenue concentration remains a geopolitical risk factor",
      "Valuation premium requires sustained services growth to justify",
    ],
    confidence: 'medium',
    sources: [
      { name: "Bloomberg", verified: true },
      { name: "SEC EDGAR", verified: true },
      { name: "Social Sentiment", verified: false },
    ],
  },
  META: {
    assetName: "Meta Platforms",
    summary: "META moved higher on AI monetization optimism and strong engagement metrics outlook.",
    whyMoving: [
      "AI-powered feed and Reels recommendation improvements driving engagement",
      "Ad revenue per user metrics tracking ahead of prior-year comps",
      "Llama model open-source strategy gaining developer mindshare",
      "Reality Labs losses stable — investor concern on spending trajectory abating",
    ],
    newsContext: "Meta AI announced expanded integrations. Advertising market broadly showing recovery from prior-year softness.",
    macroContext: "Digital advertising market recovering alongside consumer spending. Rate-sensitive growth names broadly outperforming.",
    smartMoneyContext: "No notable recent Congressional trades in META. Institutional 13F data (lagging) shows broad ownership concentration.",
    socialContext: "84.2k mentions in 24h. Sentiment positive at 0.72. Top topics: Meta AI features, Instagram growth, ad revenue recovery.",
    technicalContext: "Trending above 50-day MA. Breaking out of recent consolidation range. Options market showing moderating volatility expectations.",
    whatToWatch: [
      "Ad revenue growth rate at next earnings",
      "Daily/monthly active user trends across platforms",
      "Reality Labs investment pace commentary",
      "Regulatory developments in EU digital markets",
    ],
    riskNotes: [
      "Regulatory risk elevated — multiple ongoing proceedings in US and EU",
      "Reality Labs spending trajectory remains a long-term uncertainty",
      "Heavy AI infrastructure capex competing with near-term free cash flow",
      "Social sentiment hype risk moderate — monitor for narrative shift",
    ],
    confidence: 'medium',
    sources: [
      { name: "Bloomberg", verified: true },
      { name: "SEC EDGAR", verified: true },
      { name: "eMarketer Ad Forecasts", verified: false },
    ],
  },
  MSFT: {
    assetName: "Microsoft Corporation",
    summary: "MSFT moved on Azure AI revenue growth expectations and continued enterprise cloud adoption.",
    whyMoving: [
      "Azure cloud growth reaccelerating on AI workload demand",
      "Copilot enterprise adoption tracking ahead of initial seat estimates",
      "OpenAI partnership providing differentiated AI infrastructure narrative",
    ],
    newsContext: "No single major catalyst. Azure growth commentary from industry checks positive. Copilot seat expansion data positive.",
    macroContext: "Enterprise software broadly benefiting from rate stabilization and renewed IT spending confidence.",
    smartMoneyContext: "Satya Nadella 10b5-1 sale (Form 4) is pre-scheduled — not a bearish signal per se. Institutional positioning broadly positive.",
    socialContext: "68.9k mentions in 24h. Sentiment +0.65. Top topics: Azure AI, Copilot adoption, OpenAI partnership.",
    technicalContext: "Near all-time highs. Consolidating above prior breakout level. Low implied volatility suggests market expects continued stability.",
    whatToWatch: [
      "Azure growth rate at next earnings — market expects reacceleration",
      "Copilot seat count and enterprise attach rate",
      "OpenAI financial structure and risk exposure updates",
      "Enterprise IT spending environment commentary from CIOs",
    ],
    riskNotes: [
      "Near all-time high valuation requires continued execution",
      "OpenAI financial exposure remains a complex, opaque risk",
      "Regulatory scrutiny of AI practices growing in US and EU",
      "Satya Nadella 10b5-1 sale is pre-scheduled but worth monitoring frequency",
    ],
    confidence: 'high',
    sources: [
      { name: "Bloomberg", verified: true },
      { name: "SEC EDGAR (Form 4)", verified: true, url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=MSFT&type=4" },
      { name: "Gartner IT Forecasts", verified: false },
    ],
  },
}

function getGenericExplanation(symbol: string, changePct: number): Partial<ExplainMoveOutput> {
  const direction = changePct >= 0 ? 'higher' : 'lower'
  const magnitude = Math.abs(changePct) > 3 ? 'significantly' : Math.abs(changePct) > 1 ? 'moderately' : 'modestly'
  return {
    assetName: symbol,
    summary: `${symbol} moved ${magnitude} ${direction} today. Based on available public data, the move appears related to broader market conditions and sector-level flows.`,
    whyMoving: [
      `General market risk sentiment shifted ${direction} for this asset class`,
      "Sector-level positioning may be influencing price action",
      "No confirmed single catalyst identified from available public sources",
    ],
    newsContext: "No major confirmed news catalyst identified from available public sources at this time.",
    macroContext: "Broad macro conditions — rate expectations, dollar movement, and risk appetite — may be contributing to price action.",
    smartMoneyContext: "No recent significant insider, institutional, or political disclosures identified for this symbol in available public data.",
    socialContext: "Social sentiment data for this asset is being processed. Hype risk assessment pending.",
    technicalContext: "Asset is moving within normal volatility parameters. Check relevant support/resistance levels on a charting platform.",
    whatToWatch: [
      "Related sector and index performance",
      "Upcoming earnings or catalyst dates",
      "Macro data releases this week",
    ],
    riskNotes: [
      "This analysis is based on limited available public data",
      "Demo data — treat as illustrative only",
      "Always verify from primary sources before making decisions",
    ],
    confidence: 'low',
    sources: [{ name: "Oswol Demo Data", verified: false }],
  }
}

export async function explainMove(symbol: string, changePct: number = 0): Promise<ExplainMoveOutput> {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 800))

  const upperSymbol = symbol.toUpperCase()
  const symbolContext = SYMBOL_CONTEXTS[upperSymbol] || getGenericExplanation(upperSymbol, changePct)

  // Build mock price data
  const currentPrice = upperSymbol === 'NVDA' ? 875.42
    : upperSymbol === 'TSLA' ? 242.15
    : upperSymbol === 'BTC' ? 67842.50
    : upperSymbol === 'AMD' ? 168.92
    : upperSymbol === 'AAPL' ? 195.64
    : upperSymbol === 'META' ? 524.38
    : upperSymbol === 'MSFT' ? 415.32
    : 100.00

  const output: ExplainMoveOutput = {
    symbol: upperSymbol,
    assetName: symbolContext.assetName || upperSymbol,
    summary: symbolContext.summary || `${upperSymbol} moved today.`,
    whyMoving: symbolContext.whyMoving || [],
    priceContext: {
      currentPrice,
      changePct,
      changeAmt: currentPrice * (changePct / 100),
      volumeContext: "Volume is above the 30-day average, suggesting elevated conviction.",
    },
    newsContext: symbolContext.newsContext || "No major news catalyst confirmed.",
    macroContext: symbolContext.macroContext || "Macro conditions are mixed.",
    smartMoneyContext: symbolContext.smartMoneyContext || "No notable smart-money activity identified.",
    socialContext: symbolContext.socialContext || "Social sentiment data pending.",
    technicalContext: symbolContext.technicalContext || "No technical context available.",
    whatToWatch: symbolContext.whatToWatch || [],
    riskNotes: symbolContext.riskNotes || ["This is demo data."],
    confidence: symbolContext.confidence || 'low',
    sources: symbolContext.sources || [],
    disclaimer: OSWOL_DISCLAIMER,
    isDemoData: true,
    generatedAt: new Date().toISOString(),
  }

  return output
}
