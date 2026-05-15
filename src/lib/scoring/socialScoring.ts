export interface NarrativeScore {
  velocityScore: number      // 0-100: how fast mentions are growing
  hypeRiskScore: number      // 0-100: risk that it's hype not fundamentals
  sentimentScore: number     // -100 to 100
  newsConfirmation: 'confirmed' | 'partial' | 'unconfirmed'
}

export function getHypeRiskLabel(score: number): string {
  if (score >= 70) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

export function getHypeRiskColor(score: number): string {
  if (score >= 70) return 'var(--down)'
  if (score >= 40) return 'var(--warn)'
  return 'var(--up)'
}

export function getSentimentLabel(score: number): string {
  if (score > 0.5) return 'Bullish'
  if (score > 0.2) return 'Leaning Bullish'
  if (score > -0.2) return 'Neutral'
  if (score > -0.5) return 'Leaning Bearish'
  return 'Bearish'
}

export function getSentimentColor(score: number): string {
  if (score > 0.3) return 'var(--up)'
  if (score < -0.3) return 'var(--down)'
  return 'var(--warn)'
}
