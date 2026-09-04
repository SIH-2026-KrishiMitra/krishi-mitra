import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  fetchOffersForFarmer,
  fetchBuyerOffers,
  createOffer,
  updateOfferStatus,
  type CreateOfferInput,
} from '../services/supabase/offers'
import type { DbOffer } from '../types'

interface UseFarmerOffersResult {
  offers: (DbOffer & { lot: { crop: string; variety: string; quantity: number; unit: string } })[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  accept: (offerId: string) => Promise<void>
  reject: (offerId: string) => Promise<void>
}

export function useFarmerOffers(): UseFarmerOffersResult {
  const { user } = useAuth()
  const [offers, setOffers] = useState<(DbOffer & { lot: { crop: string; variety: string; quantity: number; unit: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setOffers(await fetchOffersForFarmer(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Real-time: new offers on farmer's lots
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('farmer-offers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers' }, () => {
        load()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, load])

  const accept = useCallback(async (offerId: string) => {
    await updateOfferStatus(offerId, 'accepted')
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'accepted' } : o))
  }, [])

  const reject = useCallback(async (offerId: string) => {
    await updateOfferStatus(offerId, 'rejected')
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'rejected' } : o))
  }, [])

  return { offers, loading, error, reload: load, accept, reject }
}

interface UseBuyerOffersResult {
  offers: (DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } })[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  submit: (input: CreateOfferInput) => Promise<DbOffer>
  cancel: (offerId: string) => Promise<void>
}

export function useBuyerOffers(): UseBuyerOffersResult {
  const { user } = useAuth()
  const [offers, setOffers] = useState<(DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setOffers(await fetchBuyerOffers(user.id))
    } catch (e) {
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
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'cancelled' } : o))
  }, [])

  return { offers, loading, error, reload: load, submit, cancel }
}
