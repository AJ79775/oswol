'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

type SparklineWidth = number | `${number}%`

interface SparklineProps {
  data: number[]
  positive?: boolean
  width?: SparklineWidth
  height?: number
}

export default function Sparkline({ data, positive = true, width = 80, height = 32 }: SparklineProps) {
  const chartData = data.map((v, i) => ({ v, i }))
  const color = positive ? 'var(--up)' : 'var(--down)'

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
