import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  fetchFarmerLots,
  fetchActiveLots,
  createLot,
  updateLot,
  updateLotStatus,
  deleteLot,
  type CreateLotInput,
} from '../services/supabase/lots'
import type { DbLot, LotStatus } from '../types'

interface UseLotsResult {
  lots: DbLot[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  create: (input: CreateLotInput) => Promise<DbLot>
  update: (id: string, patch: Partial<DbLot>) => Promise<DbLot>
  setStatus: (id: string, status: LotStatus) => Promise<void>
  remove: (id: string) => Promise<void>
}

export function useFarmerLots(): UseLotsResult {
  const { user } = useAuth()
  const [lots, setLots] = useState<DbLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setLots(await fetchFarmerLots(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lots')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Real-time subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('farmer-lots')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lots', filter: `farmer_id=eq.${user.id}` },
        () => { load() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, load])

  const create = useCallback(async (input: CreateLotInput) => {
    const lot = await createLot(input)
    setLots(prev => [lot, ...prev])
    return lot
  }, [])

  const update = useCallback(async (id: string, patch: Partial<DbLot>) => {
    const updated = await updateLot(id, patch)
    setLots(prev => prev.map(l => l.id === id ? updated : l))
    return updated
  }, [])

  const setStatus = useCallback(async (id: string, status: LotStatus) => {
    await updateLotStatus(id, status)
    setLots(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteLot(id)
    setLots(prev => prev.filter(l => l.id !== id))
  }, [])

  return { lots, loading, error, reload: load, create, update, setStatus, remove }
}

interface UseMarketplaceLotsResult {
  lots: DbLot[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useMarketplaceLots(): UseMarketplaceLotsResult {
  const [lots, setLots] = useState<DbLot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setLots(await fetchActiveLots())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load marketplace')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { lots, loading, error, reload: load }
}
