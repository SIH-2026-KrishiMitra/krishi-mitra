import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchFarmerProfile,
  fetchBuyerProfile,
  updateProfile,
  updateFarmerProfile,
  updateBuyerProfile,
  uploadProfilePhoto,
} from '../services/supabase/profiles'
import type { DbFarmerProfile, DbBuyerProfile, DbProfile } from '../types'

interface UseFarmerProfileResult {
  farmerProfile: DbFarmerProfile | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  saveBase: (patch: Partial<Pick<DbProfile, 'full_name' | 'phone' | 'language'>>) => Promise<void>
  saveFarmer: (patch: Partial<Omit<DbFarmerProfile, 'id'>>) => Promise<void>
  uploadPhoto: (file: File) => Promise<string>
}

export function useFarmerProfile(): UseFarmerProfileResult {
  const { user, refreshProfile } = useAuth()
  const [farmerProfile, setFarmerProfile] = useState<DbFarmerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setFarmerProfile(await fetchFarmerProfile(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const saveBase = useCallback(async (patch: Partial<Pick<DbProfile, 'full_name' | 'phone' | 'language'>>) => {
    if (!user) return
    await updateProfile(user.id, patch)
    await refreshProfile()
  }, [user, refreshProfile])

  const saveFarmer = useCallback(async (patch: Partial<Omit<DbFarmerProfile, 'id'>>) => {
    if (!user) return
    const updated = await updateFarmerProfile(user.id, patch)
    setFarmerProfile(updated)
  }, [user])

  const uploadPhoto = useCallback(async (file: File) => {
    if (!user) throw new Error('Not authenticated')
    const url = await uploadProfilePhoto(user.id, file)
    await updateProfile(user.id, { avatar_url: url })
    await refreshProfile()
    return url
  }, [user, refreshProfile])

  return { farmerProfile, loading, error, reload: load, saveBase, saveFarmer, uploadPhoto }
}

interface UseBuyerProfileResult {
  buyerProfile: DbBuyerProfile | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  saveBase: (patch: Partial<Pick<DbProfile, 'full_name' | 'phone' | 'language'>>) => Promise<void>
  saveBuyer: (patch: Partial<Omit<DbBuyerProfile, 'id' | 'verified' | 'trust_score' | 'completed_deals'>>) => Promise<void>
  uploadPhoto: (file: File) => Promise<string>
}

export function useBuyerProfile(): UseBuyerProfileResult {
  const { user, refreshProfile } = useAuth()
  const [buyerProfile, setBuyerProfile] = useState<DbBuyerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setBuyerProfile(await fetchBuyerProfile(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const saveBase = useCallback(async (patch: Partial<Pick<DbProfile, 'full_name' | 'phone' | 'language'>>) => {
    if (!user) return
    await updateProfile(user.id, patch)
    await refreshProfile()
  }, [user, refreshProfile])

  const saveBuyer = useCallback(async (patch: Partial<Omit<DbBuyerProfile, 'id' | 'verified' | 'trust_score' | 'completed_deals'>>) => {
    if (!user) return
    const updated = await updateBuyerProfile(user.id, patch)
    setBuyerProfile(updated)
  }, [user])

  const uploadPhoto = useCallback(async (file: File) => {
    if (!user) throw new Error('Not authenticated')
    const url = await uploadProfilePhoto(user.id, file)
    await updateProfile(user.id, { avatar_url: url })
    await refreshProfile()
    return url
  }, [user, refreshProfile])

  return { buyerProfile, loading, error, reload: load, saveBase, saveBuyer, uploadPhoto }
}
