#!/usr/bin/env node
// Oswol CLI — oswol command line interface

const command = process.argv[2]
const args = process.argv.slice(3)

async function main(): Promise<void> {
  switch (command) {
    case 'dev':
      console.log('Starting Oswol development server...')
      console.log('Run: npm run dev')
      break

    case 'explain': {
      const ticker = args.find((a: string) => !a.startsWith('-')) || 'NVDA'
      console.log(`\nOswol AI — Explaining move for ${ticker.toUpperCase()}...\n`)
      await explainMove(ticker)
      break
    }

    case 'brief':
      console.log("\nGenerating today's market brief...\n")
      await generateBrief()
      break

    case 'heatmap': {
      const type = args[0] || 'nasdaq100'
      console.log(`\nHeat map: ${type}\n`)
      await showHeatmap(type)
      break
    }

    case 'assets':
      await handleAssets(args)
      break

    default:
      showHelp()
  }
}

function showHelp(): void {
  console.log(`
  ██████╗ ███████╗██╗    ██╗ ██████╗ ██╗
 ██╔═══██╗██╔════╝██║    ██║██╔═══██╗██║
 ██║   ██║███████╗██║ █╗ ██║██║   ██║██║
 ██║   ██║╚════██║██║███╗██║██║   ██║██║
 ╚██████╔╝███████║╚███╔███╔╝╚██████╔╝███████╗
  ╚═════╝ ╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚══════╝

  Oswol AI Market Intelligence Terminal CLI

  Usage: oswol <command> [options]

  Commands:
    dev                    Start development server
    explain <ticker>       Explain a market move (e.g. oswol explain NVDA)
    brief                  Generate today's AI market brief
    heatmap [type]         Show heat map (nasdaq100|sectors|crypto)
    assets import          Import asset universe
    assets list            List seeded assets

  Examples:
    npx tsx cli/index.ts explain NVDA
    npx tsx cli/index.ts brief
    npx tsx cli/index.ts heatmap sectors
  `)
}

async function explainMove(symbol: string): Promise<void> {
  try {
    const response = await fetch('http://localhost:3000/api/ai/explain-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: symbol.toUpperCase(), changePct: 0 }),
    })
    const data = (await response.json()) as Record<string, unknown>
    console.log(`${String(data.symbol)} — ${String(data.assetName)}`)
    console.log(`\n${String(data.summary)}\n`)
    if (Array.isArray(data.whyMoving)) {
      console.log('Why it moved:')
      ;(data.whyMoving as string[]).forEach((r: string, i: number) => console.log(`  ${i + 1}. ${r}`))
    }
    console.log(`\nConfidence: ${String(data.confidence).toUpperCase()}`)
    console.log(`\n${String(data.disclaimer)}`)
  } catch {
    console.error('Error: Could not reach Oswol server. Is it running? (npm run dev)')
  }
}

async function generateBrief(): Promise<void> {
  console.log(
    'Market Brief — ' +
      new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  )
  console.log('-'.repeat(60))
  console.log('Market regime: RISK-ON')
  console.log('Top movers: NVDA +4.21%, AMD +4.27%, TSLA -2.36%')
  console.log('Macro: CPI 3.4% vs 3.5%E · Yields down 6bp')
  console.log('Social: AI Power Demand narrative surging (48.2k mentions)')
  console.log('\nDemo data — not financial advice.')
}

async function showHeatmap(type: string): Promise<void> {
  const types: Record<string, Array<{ s: string; v: number }>> = {
    nasdaq100: [
      { s: 'NVDA', v: 4.21 },
      { s: 'AMD', v: 4.27 },
      { s: 'META', v: 1.84 },
      { s: 'AAPL', v: 0.95 },
      { s: 'MSFT', v: 0.80 },
      { s: 'TSLA', v: -2.36 },
    ],
    sectors: [
      { s: 'XLK', v: 2.84 },
      { s: 'XLY', v: 0.34 },
      { s: 'XLF', v: -0.18 },
      { s: 'XLE', v: -0.88 },
      { s: 'XLV', v: -0.12 },
      { s: 'XLI', v: 0.42 },
    ],
    crypto: [
      { s: 'BTC', v: 2.48 },
      { s: 'ETH', v: 1.29 },
      { s: 'SOL', v: 3.82 },
      { s: 'BNB', v: 0.54 },
      { s: 'XRP', v: -0.82 },
    ],
  }
  const tiles = types[type] || types.nasdaq100
  tiles.forEach((t: { s: string; v: number }) => {
    const bar = t.v >= 0 ? '^' : 'v'
    const color = t.v >= 0 ? '\x1b[32m' : '\x1b[31m'
    console.log(`  ${color}${bar} ${t.s.padEnd(6)} ${t.v >= 0 ? '+' : ''}${t.v.toFixed(2)}%\x1b[0m`)
  })
  console.log('\nDemo data — not financial advice.')
}

async function handleAssets(args: string[]): Promise<void> {
  const sub = args[0]
  if (sub === 'list') {
    console.log('\nSeeded asset universe (demo):')
    const categories: [string, string][] = [
      ['Equities', 'NVDA MSFT AAPL GOOGL AMZN META TSLA AMD AVGO NFLX'],
      ['ETFs', 'SPY QQQ IWM DIA VTI XLK XLF XLE TLT HYG GLD IBIT'],
      ['Crypto', 'BTC ETH SOL BNB XRP'],
      ['FX', 'DXY EURUSD GBPUSD USDJPY USDCHF'],
      ['Commodities', 'GOLD OIL SILVER NATGAS'],
      ['Rates', 'US10Y US02Y US30Y VIX'],
    ]
    categories.forEach(([label, symbols]: [string, string]) => {
      console.log(`\n  ${label}:`)
      console.log(`    ${symbols}`)
    })
  } else {
    console.log('Usage: npx tsx cli/index.ts assets list | npx tsx cli/index.ts assets import')
  }
}

main().catch(console.error)
