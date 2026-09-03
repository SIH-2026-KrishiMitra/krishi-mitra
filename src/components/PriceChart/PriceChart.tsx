import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import type { PricePoint } from '../../types/price'
import styles from './PriceChart.module.css'

interface PriceChartProps {
  data: PricePoint[]
  msp?: number
  height?: number
}

export default function PriceChart({ data, msp, height = 160 }: PriceChartProps) {
  const prices = data.map(d => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const pad = Math.max((max - min) * 0.15, 50)

  return (
    <div className={styles.chart} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 10,
              fill: 'var(--text-muted)',
              fontFamily: 'var(--font-core)',
            }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis domain={[min - pad, max + pad]} hide />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'var(--font-core)',
              boxShadow: 'var(--shadow-md)',
            }}
            formatter={(value: number) => [
              `₹${value.toLocaleString('en-IN')}`,
              'Price',
            ]}
            labelStyle={{ color: 'var(--text-muted)', fontSize: '11px' }}
            cursor={{ stroke: 'var(--border-brand)', strokeWidth: 1 }}
          />
          {msp !== undefined && (
            <ReferenceLine
              y={msp}
              stroke="var(--amber-600)"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: `MSP ₹${msp.toLocaleString('en-IN')}`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: 'var(--text-accent)',
                fontFamily: 'var(--font-core)',
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--green-500)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--green-600)', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
