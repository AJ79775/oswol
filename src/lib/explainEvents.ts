// Simple browser event bus for triggering the explain panel from anywhere
export function emitExplainMove(symbol: string, changePct: number) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('oswol:explain-move', {
      detail: { symbol, changePct },
    })
  )
}

export function onExplainMove(
  callback: (symbol: string, changePct: number) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ symbol: string; changePct: number }>).detail
    callback(detail.symbol, detail.changePct)
  }

  window.addEventListener('oswol:explain-move', handler)
  return () => window.removeEventListener('oswol:explain-move', handler)
}
