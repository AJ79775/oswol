import { NextResponse } from 'next/server'

const CRYPTO_TILES = [
  { symbol: 'BTC', name: 'Bitcoin', changePct: 2.48, marketCap: 1340e9, sector: 'Layer 1', weight: 52.1 },
  { symbol: 'ETH', name: 'Ethereum', changePct: 1.29, marketCap: 428e9, sector: 'Layer 1', weight: 16.6 },
  { symbol: 'SOL', name: 'Solana', changePct: 3.82, marketCap: 68e9, sector: 'Layer 1', weight: 2.6 },
  { symbol: 'BNB', name: 'BNB', changePct: 0.54, marketCap: 84e9, sector: 'Exchange Token', weight: 3.3 },
  { symbol: 'XRP', name: 'XRP', changePct: -0.82, marketCap: 72e9, sector: 'Payments', weight: 2.8 },
  { symbol: 'USDC', name: 'USD Coin', changePct: 0.01, marketCap: 44e9, sector: 'Stablecoin', weight: 1.7 },
  { symbol: 'DOGE', name: 'Dogecoin', changePct: 1.84, marketCap: 28e9, sector: 'Meme', weight: 1.1 },
  { symbol: 'ADA', name: 'Cardano', changePct: -1.22, marketCap: 22e9, sector: 'Layer 1', weight: 0.9 },
  { symbol: 'AVAX', name: 'Avalanche', changePct: 2.14, marketCap: 18e9, sector: 'Layer 1', weight: 0.7 },
  { symbol: 'LINK', name: 'Chainlink', changePct: 1.48, marketCap: 14e9, sector: 'Oracle', weight: 0.5 },
]

export async function GET() {
  return NextResponse.json({
    tiles: CRYPTO_TILES,
    label: 'Crypto',
    totalCount: CRYPTO_TILES.length,
    isDemoData: true,
    disclaimer: 'Demo data only. Not financial advice. Crypto assets are highly volatile.',
  })
}
