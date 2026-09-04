import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchFarmerEscrow, fetchBuyerEscrow, type ExpandedEscrow } from '../services/supabase/escrow'

interface UseEscrowResult {
  escrow: ExpandedEscrow[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useFarmerEscrow(): UseEscrowResult {
  const { user } = useAuth()
  const [escrow, setEscrow] = useState<ExpandedEscrow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setEscrow(await fetchFarmerEscrow())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load escrow')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { escrow, loading, error, reload: load }
}

export function useBuyerEscrow(): UseEscrowResult {
  const { user } = useAuth()
  const [escrow, setEscrow] = useState<ExpandedEscrow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setEscrow(await fetchBuyerEscrow())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load escrow')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { escrow, loading, error, reload: load }
}
