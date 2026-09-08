import { useState, useEffect, useRef } from 'react'
import { predictPrice, type PredictParams } from '../services/pricePredictor'
import type { PricePrediction } from '../types/price'

interface UsePricePredictionResult {
  prediction: PricePrediction | null
  loading: boolean
  available: boolean  // false when ML service is unreachable
}

export function usePricePrediction(
  params: PredictParams | null,
  daysAhead = 7,
): UsePricePredictionResult {
  const [prediction, setPrediction] = useState<PricePrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [available, setAvailable] = useState(true)
  const lastKey = useRef<string | null>(null)

  useEffect(() => {
    if (!params) {
      setPrediction(null)
      return
    }

    const key = `${params.crop}|${params.mandi}|${params.variety ?? ''}|${daysAhead}`
    if (key === lastKey.current) return
    lastKey.current = key

    let cancelled = false
    setLoading(true)

    predictPrice(params, daysAhead)
      .then(result => {
        if (!cancelled) {
          setPrediction(result)
          setAvailable(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPrediction(null)
          setAvailable(false)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [params?.crop, params?.mandi, params?.variety, daysAhead])

  return { prediction, loading, available }
}
