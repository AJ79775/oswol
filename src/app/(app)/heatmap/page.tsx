import { mockHeatmapData } from '@/lib/data/mockMarketData'
import HeatmapClient from './HeatmapClient'

export default function HeatmapPage() {
  return <HeatmapClient tiles={mockHeatmapData} />
}
