export type SignalStrength = 'Very Weak' | 'Weak' | 'Low' | 'Medium' | 'Strong' | 'Very Strong'

export function getSignalLabel(score: number): SignalStrength {
  if (score >= 81) return 'Very Strong'
  if (score >= 61) return 'Strong'
  if (score >= 41) return 'Medium'
  if (score >= 21) return 'Low'
  if (score >= 11) return 'Weak'
  return 'Very Weak'
}

export function getSignalColor(score: number): string {
  if (score >= 70) return 'var(--up)'
  if (score >= 50) return 'var(--warn)'
  return 'var(--ink-lo)'
}

export function scorePoliticianTrade(trade: {
  reportingDelayDays: number
  valueRange: string
  transactionType: string
  ticker: string
}): number {
  let score = 50 // base
  // recency
  if (trade.reportingDelayDays <= 5) score += 15
  else if (trade.reportingDelayDays <= 14) score += 8
  else if (trade.reportingDelayDays > 30) score -= 20
  // value range
  const isLarge =
    trade.valueRange?.includes('$1M') ||
    trade.valueRange?.includes('$5M') ||
    trade.valueRange?.includes('$500K - $1M')
  if (isLarge) score += 15
  // transaction type
  if (trade.transactionType === 'Purchase') score += 10
  else score -= 5
  return Math.max(0, Math.min(100, score))
}

export function scoreInsiderTrade(trade: {
  is10b5_1: boolean
  isOpenMarketPurchase: boolean
  transactionType: string
  value?: number
}): number {
  let score = 40
  if (trade.is10b5_1) score -= 25
  if (trade.isOpenMarketPurchase && trade.transactionType === 'Purchase') score += 30
  if (trade.value && trade.value > 1000000) score += 15
  if (trade.value && trade.value > 10000000) score += 10
  return Math.max(0, Math.min(100, score))
}

export function scoreHedgeFundTrade(holding: {
  actionType: string
  portfolioWeight?: number
  changePercent?: number
}): number {
  let score = 40
  if (holding.actionType === 'new position') score += 20
  else if (holding.actionType === 'increased') score += 15
  else if (holding.actionType === 'reduced') score -= 10
  else if (holding.actionType === 'exited') score -= 20
  if (holding.portfolioWeight && holding.portfolioWeight > 5) score += 15
  if (holding.changePercent && Math.abs(holding.changePercent) > 25) score += 10
  return Math.max(0, Math.min(100, score))
}
