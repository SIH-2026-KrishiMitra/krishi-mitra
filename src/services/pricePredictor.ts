import type { PricePrediction } from '../types/price'

const ML_API_URL = (import.meta.env.VITE_ML_API_URL as string | undefined) ?? 'http://localhost:8000'

// Maps Krishi Mitra APMC names → predictor mandi/state/district names
const MANDI_MAP: Record<string, { mandi: string; state: string; district: string }> = {
  'Nashik APMC':     { mandi: 'Nashik Mandi',    state: 'Maharashtra', district: 'Nashik' },
  'Lasalgaon APMC':  { mandi: 'Lasalgaon Mandi', state: 'Maharashtra', district: 'Nashik' },
  'Pune APMC':       { mandi: 'Pune Market Yard', state: 'Maharashtra', district: 'Pune' },
  'Nagpur APMC':     { mandi: 'Nashik Mandi',    state: 'Maharashtra', district: 'Nashik' },
  'Amravati APMC':   { mandi: 'Nashik Mandi',    state: 'Maharashtra', district: 'Nashik' },
  'Akola APMC':      { mandi: 'Nashik Mandi',    state: 'Maharashtra', district: 'Nashik' },
  'Latur APMC':      { mandi: 'Manchar Mandi',   state: 'Maharashtra', district: 'Pune' },
  'Solapur APMC':    { mandi: 'Manchar Mandi',   state: 'Maharashtra', district: 'Pune' },
}

const DEFAULT_LOCATION = { mandi: 'Nashik Mandi', state: 'Maharashtra', district: 'Nashik' }

function futureDateString(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().split('T')[0]
}

export interface PredictParams {
  crop: string
  mandi: string
  variety?: string
}

export async function predictPrice(params: PredictParams, daysAhead = 7): Promise<PricePrediction> {
  const location = MANDI_MAP[params.mandi] ?? DEFAULT_LOCATION

  const body = {
    state: location.state,
    district: location.district,
    market: location.mandi,
    commodity: params.crop,
    variety: params.variety ?? null,
    grade: null,
    prediction_date: futureDateString(daysAhead),
  }

  const res = await fetch(`${ML_API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Prediction failed')
  }

  const data = await res.json()
  return {
    predictedPrice: data.predicted_price,
    unit: data.unit,
    matchLevel: data.match_level,
    matchNote: data.match_note,
    usedVariety: data.used_variety,
    usedGrade: data.used_grade,
    historyPointsUsed: data.history_points_used,
    priceRangeHint: data.price_range_hint
      ? { recentMin: data.price_range_hint.recent_min, recentMax: data.price_range_hint.recent_max }
      : null,
  }
}
