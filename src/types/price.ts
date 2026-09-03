export type PriceTrend = 'up' | 'down' | 'flat'

export interface PricePoint {
  date: string
  price: number
}

export interface CropMarketData {
  id: string
  crop: string
  variety: string
  mandi: string
  currentPrice: number
  unit: 'qtl'
  trend: PriceTrend
  delta: number
  deltaPercent: number
  msp: number
  priceHistory: PricePoint[]
  source: string
  updatedAt: string
}
