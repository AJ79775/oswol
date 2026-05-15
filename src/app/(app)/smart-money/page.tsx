import SmartMoneyClient from './SmartMoneyClient'

export const metadata = {
  title: 'Smart Money Radar — Oswol',
  description: 'Politician trades, insider Form 4 filings, and 13F hedge fund holdings with signal scoring',
}

export default function SmartMoneyPage() {
  return <SmartMoneyClient />
}
