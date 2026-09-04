import { supabase } from '../../lib/supabase'
import type { DbMarketPrice } from '../../types'

export async function fetchMarketPrices(): Promise<DbMarketPrice[]> {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as DbMarketPrice[]
}

export async function fetchMarketPriceByCrop(crop: string): Promise<DbMarketPrice[]> {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .ilike('crop', `%${crop}%`)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as DbMarketPrice[]
}

export async function fetchMarketPriceByMandi(mandi: string): Promise<DbMarketPrice[]> {
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .ilike('mandi', `%${mandi}%`)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as DbMarketPrice[]
}
