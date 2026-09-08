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

export type PredictionMatchLevel =
  | 'exact'
  | 'no_variety'
  | 'no_market'
  | 'no_district'
  | 'national'
  | 'national_all_time'

export interface PricePrediction {
  predictedPrice: number
  unit: string
  matchLevel: PredictionMatchLevel
  matchNote: string
  usedVariety: string | null
  usedGrade: string | null
  historyPointsUsed: number
  priceRangeHint: { recentMin: number; recentMax: number } | null
}
