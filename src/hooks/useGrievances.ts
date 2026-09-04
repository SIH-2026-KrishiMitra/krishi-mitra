import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchReporterGrievances,
  createGrievance,
  updateGrievanceStatus,
  addGrievanceResolution,
  uploadGrievanceEvidence,
  addEvidenceUrl,
  type CreateGrievanceInput,
} from '../services/supabase/grievances'
import type { DbGrievance, ComplaintStatus } from '../types'

interface UseGrievancesResult {
  grievances: DbGrievance[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  submit: (input: CreateGrievanceInput) => Promise<DbGrievance>
  updateStatus: (id: string, status: ComplaintStatus, detail?: string) => Promise<void>
  resolve: (id: string, note: string) => Promise<void>
  uploadEvidence: (id: string, file: File) => Promise<void>
}

export function useGrievances(): UseGrievancesResult {
  const { user } = useAuth()
  const [grievances, setGrievances] = useState<DbGrievance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setGrievances(await fetchReporterGrievances(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const submit = useCallback(async (input: CreateGrievanceInput) => {
    const grievance = await createGrievance(input)
    setGrievances(prev => [grievance, ...prev])
    return grievance
  }, [])

  const updateStatus = useCallback(async (id: string, status: ComplaintStatus, detail?: string) => {
    await updateGrievanceStatus(id, status, detail)
    await load()
  }, [load])

  const resolve = useCallback(async (id: string, note: string) => {
    await addGrievanceResolution(id, note)
    await load()
  }, [load])

  const uploadEvidence = useCallback(async (id: string, file: File) => {
    const url = await uploadGrievanceEvidence(id, file)
    await addEvidenceUrl(id, url)
    await load()
  }, [load])

  return { grievances, loading, error, reload: load, submit, updateStatus, resolve, uploadEvidence }
}
