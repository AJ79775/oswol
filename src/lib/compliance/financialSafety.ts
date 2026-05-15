// Financial safety guardrails for Oswol AI outputs
export const OSWOL_DISCLAIMER =
  "Oswol provides market data, public-disclosure summaries, social sentiment, and AI-generated educational analysis. It does not provide investment, legal, tax, or financial advice. Public filings may be delayed, incomplete, amended, or historical. Verify original sources before making decisions."

export const FORBIDDEN_PHRASES = [
  "buy this stock", "sell this stock", "guaranteed return",
  "risk-free", "sure thing", "definitely going up", "definitely going down",
  "will definitely", "100% certain", "you should buy", "you should sell",
  "invest now", "don't miss out", "can't lose"
]

export function sanitizeAIOutput(text: string): string {
  let safe = text
  const forbidden = FORBIDDEN_PHRASES
  for (const phrase of forbidden) {
    const regex = new RegExp(phrase, 'gi')
    safe = safe.replace(regex, '[financial advice removed]')
  }
  return safe
}

export function addDisclaimer(content: string): string {
  return `${content}\n\n---\n*${OSWOL_DISCLAIMER}*`
}

export const ALLOWED_LANGUAGE = {
  uncertainty: ["may suggest", "could indicate", "worth monitoring", "appears to", "based on available data"],
  dataLimitations: ["signal is delayed", "data may be incomplete", "filing is lagging", "as of the filing date"],
  actionNeutral: ["monitor", "watch", "track", "research further", "consider the context"]
}
