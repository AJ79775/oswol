export default function DisclaimerFooter() {
  return (
    <footer className="px-6 py-4 mt-8 border-t border-[var(--border)]">
      <p className="text-[11px] text-[var(--ink-dim)] leading-relaxed max-w-4xl">
        <span className="font-semibold text-[var(--warn)]">Demo Data Only.</span>{' '}
        All market data, trades, and analysis shown are simulated for demonstration purposes.
        This is not financial advice. Oswol does not guarantee accuracy of any data. Past performance
        does not indicate future results. Always consult a qualified financial advisor before making
        investment decisions. Smart Money data sourced from public filings (STOCK Act, SEC EDGAR, 13F).
        Social sentiment is algorithmically derived and may not reflect actual market opinion.
      </p>
    </footer>
  )
}
