import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  fetchFarmerDeals,
  fetchBuyerDeals,
  updateDealStatus,
  type ExpandedDeal,
} from '../services/supabase/deals'
import type { DealStatus } from '../types'
import { MOCK_FARMER_DEALS, MOCK_BUYER_DEALS } from '../data/mockDbData'

interface UseDealsResult {
  deals: ExpandedDeal[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  advance: (dealId: string, status: DealStatus, detail?: string) => Promise<void>
}

export function useFarmerDeals(): UseDealsResult {
  const { user } = useAuth()
  const [deals, setDeals] = useState<ExpandedDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFarmerDeals()
      setDeals(data.length > 0 ? data : MOCK_FARMER_DEALS)
    } catch (e) {
      setDeals(MOCK_FARMER_DEALS)
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
    let channel: ReturnType<typeof supabase.channel> | undefined
    try {
      channel = supabase
        .channel(`farmer-deals-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'deals', filter: `farmer_id=eq.${user.id}` },
          () => { load() }
        )
        .subscribe()
    } catch (e) {
      console.warn('[useFarmerDeals] realtime subscribe failed', e)
    }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [user, load])

  const advance = useCallback(async (dealId: string, status: DealStatus, detail?: string) => {
    await updateDealStatus(dealId, status, detail)
    await load()
  }, [load])

  return { deals, loading, error, reload: load, advance }
}

export function useBuyerDeals(): UseDealsResult {
  const { user } = useAuth()
  const [deals, setDeals] = useState<ExpandedDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBuyerDeals()
      setDeals(data.length > 0 ? data : MOCK_BUYER_DEALS)
    } catch (e) {
      setDeals(MOCK_BUYER_DEALS)
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
    let channel: ReturnType<typeof supabase.channel> | undefined
    try {
      channel = supabase
        .channel(`buyer-deals-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'deals', filter: `buyer_id=eq.${user.id}` },
          () => { load() }
        )
        .subscribe()
    } catch (e) {
      console.warn('[useBuyerDeals] realtime subscribe failed', e)
    }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [user, load])

  const advance = useCallback(async (dealId: string, status: DealStatus, detail?: string) => {
    await updateDealStatus(dealId, status, detail)
    await load()
  }, [load])

  return { deals, loading, error, reload: load, advance }
}
