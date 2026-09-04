import { useState, useEffect, useCallback } from 'react'
import { fetchMarketPrices, fetchMarketPriceByCrop } from '../services/supabase/market'
import { MARKET_PRICES } from '../data/mockData'
import type { MarketPrice } from '../types'

interface UseMarketPricesResult {
  prices: MarketPrice[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useMarketPrices(): UseMarketPricesResult {
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dbPrices = await fetchMarketPrices()

      if (dbPrices.length === 0) {
        // Fall back to mock prices if the DB is empty (before seed data is run)
        setPrices(MARKET_PRICES)
      } else {
        // Map DB rows (snake_case) → frontend MarketPrice type (camelCase)
        setPrices(dbPrices.map(p => ({
          id: p.id,
          crop: p.crop,
          variety: p.variety,
          mandi: p.mandi,
          currentPrice: p.current_price,
          unit: p.unit,
          trend: p.trend,
          delta: p.delta,
          deltaPercent: p.delta_percent,
          msp: p.msp,
          priceHistory: Array.isArray(p.price_history) ? p.price_history : [],
          source: p.source,
          updatedAt: new Date(p.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          demandLevel: p.demand_level,
        })))
      }
    } catch {
      // On error fall back to mock data so the UI stays functional
      setPrices(MARKET_PRICES)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { prices, loading, error, reload: load }
}

export function useMarketPriceByCrop(crop: string): UseMarketPricesResult {
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!crop) return
    setLoading(true)
    setError(null)
    try {
      const dbPrices = await fetchMarketPriceByCrop(crop)
      setPrices(dbPrices.map(p => ({
        id: p.id,
        crop: p.crop,
        variety: p.variety,
        mandi: p.mandi,
        currentPrice: p.current_price,
        unit: p.unit,
        trend: p.trend,
        delta: p.delta,
        deltaPercent: p.delta_percent,
        msp: p.msp,
        priceHistory: Array.isArray(p.price_history) ? p.price_history : [],
        source: p.source,
        updatedAt: new Date(p.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        demandLevel: p.demand_level,
      })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prices')
    } finally {
      setLoading(false)
    }
  }, [crop])

  useEffect(() => {
    load()
  }, [load])

  return { prices, loading, error, reload: load }
}
