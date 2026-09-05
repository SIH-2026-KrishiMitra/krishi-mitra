import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  fetchOffersForFarmer,
  fetchBuyerOffers,
  createOffer,
  updateOfferStatus,
  type ExpandedOffer,
  type CreateOfferInput,
} from '../services/supabase/offers'
import type { DbOffer } from '../types'
import { MOCK_FARMER_OFFERS, MOCK_BUYER_OFFERS } from '../data/mockDbData'

interface UseFarmerOffersResult {
  offers: ExpandedOffer[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  accept: (offerId: string) => Promise<void>
  reject: (offerId: string) => Promise<void>
}

export function useFarmerOffers(): UseFarmerOffersResult {
  const { user } = useAuth()
  const [offers, setOffers] = useState<ExpandedOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOffersForFarmer()
      setOffers(data.length > 0 ? data : MOCK_FARMER_OFFERS)
    } catch (e) {
      setOffers(MOCK_FARMER_OFFERS)
      setError(e instanceof Error ? e.message : 'Failed to load offers')
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
        .channel(`farmer-offers-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
          load()
        })
        .subscribe()
    } catch (e) {
      console.warn('[useFarmerOffers] realtime subscribe failed', e)
    }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [user, load])

  const accept = useCallback(async (offerId: string) => {
    await updateOfferStatus(offerId, 'accepted')
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o))
  }, [])

  const reject = useCallback(async (offerId: string) => {
    await updateOfferStatus(offerId, 'rejected')
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'rejected' as const } : o))
  }, [])

  return { offers, loading, error, reload: load, accept, reject }
}

interface UseBuyerOffersResult {
  offers: (DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } | null })[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  submit: (input: CreateOfferInput) => Promise<DbOffer>
  cancel: (offerId: string) => Promise<void>
}

export function useBuyerOffers(): UseBuyerOffersResult {
  const { user } = useAuth()
  const [offers, setOffers] = useState<(DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBuyerOffers(user.id)
      setOffers(data.length > 0 ? data : MOCK_BUYER_OFFERS)
    } catch (e) {
      setOffers(MOCK_BUYER_OFFERS)
      setError(e instanceof Error ? e.message : 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const submit = useCallback(async (input: CreateOfferInput) => {
    const offer = await createOffer(input)
    await load()
    return offer
  }, [load])

  const cancel = useCallback(async (offerId: string) => {
    await updateOfferStatus(offerId, 'cancelled')
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'cancelled' as const } : o))
  }, [])

  return { offers, loading, error, reload: load, submit, cancel }
}
