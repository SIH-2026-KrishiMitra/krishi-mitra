import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  fetchFarmerDeals,
  fetchBuyerDeals,
  updateDealStatus,
} from '../services/supabase/deals'
import type { DbDeal, DealStatus } from '../types'

interface UseDealsResult {
  deals: DbDeal[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  advance: (dealId: string, status: DealStatus, detail?: string) => Promise<void>
}

export function useFarmerDeals(): UseDealsResult {
  const { user } = useAuth()
  const [deals, setDeals] = useState<DbDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setDeals(await fetchFarmerDeals(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Real-time
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('farmer-deals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals', filter: `farmer_id=eq.${user.id}` },
        () => { load() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, load])

  const advance = useCallback(async (dealId: string, status: DealStatus, detail?: string) => {
    const updated = await updateDealStatus(dealId, status, detail)
    setDeals(prev => prev.map(d => d.id === dealId ? updated : d))
  }, [])

  return { deals, loading, error, reload: load, advance }
}

export function useBuyerDeals(): UseDealsResult {
  const { user } = useAuth()
  const [deals, setDeals] = useState<DbDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setDeals(await fetchBuyerDeals(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('buyer-deals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals', filter: `buyer_id=eq.${user.id}` },
        () => { load() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, load])

  const advance = useCallback(async (dealId: string, status: DealStatus, detail?: string) => {
    const updated = await updateDealStatus(dealId, status, detail)
    setDeals(prev => prev.map(d => d.id === dealId ? updated : d))
  }, [])

  return { deals, loading, error, reload: load, advance }
}
