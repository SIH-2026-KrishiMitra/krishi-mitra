import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import {
  fetchAllProfiles, fetchAllLots, fetchAllDeals, fetchAllGrievances,
  fetchAllEscrow, fetchPlatformStats, verifyBuyer, verifyFarmer,
  updateGrievanceStatus, assignGrievance, logAdminAction,
  type AdminProfile,
} from '../services/supabase/admin'
import { getPermissions, type AdminSubRole, type AdminPermissions } from '../lib/adminPermissions'
import type { DbLot, DbDeal, DbGrievance, DbEscrowTransaction, ComplaintStatus } from '../types'

interface PlatformStats {
  farmers: number; buyers: number; activeLots: number; activeDeals: number
  pendingGrievances: number; totalEscrow: number
}

type AdminDeal = DbDeal & { farmer: { full_name: string } | null; buyer: { full_name: string } | null }
type AdminGrievance = DbGrievance & { reporter: { full_name: string } | null }
type AdminEscrow = DbEscrowTransaction & { farmer: { full_name: string } | null; buyer: { full_name: string } | null; lot_info: { crop: string; grade: string; variety: string } | null }
type AdminLot = DbLot & { farmer: { full_name: string } | null }

interface AdminContextValue {
  stats: PlatformStats | null
  profiles: AdminProfile[]
  lots: AdminLot[]
  deals: AdminDeal[]
  grievances: AdminGrievance[]
  escrow: AdminEscrow[]
  loading: boolean
  adminSubRole: AdminSubRole | null
  permissions: AdminPermissions
  reload: () => Promise<void>
  verifyUser: (id: string, role: 'buyer' | 'farmer', verified: boolean) => Promise<void>
  resolveGrievance: (id: string, status: ComplaintStatus, note?: string) => Promise<void>
  assignToSelf: (grievanceId: string) => Promise<void>
  logAction: (action: string, targetType: string, targetId: string, details?: Record<string, unknown>) => Promise<void>
  logout: () => Promise<void>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [profiles, setProfiles] = useState<AdminProfile[]>([])
  const [lots, setLots] = useState<AdminLot[]>([])
  const [deals, setDeals] = useState<AdminDeal[]>([])
  const [grievances, setGrievances] = useState<AdminGrievance[]>([])
  const [escrow, setEscrow] = useState<AdminEscrow[]>([])
  const [loading, setLoading] = useState(true)
  const [adminSubRole, setAdminSubRole] = useState<AdminSubRole | null>(null)
  const [permissions, setPermissions] = useState<AdminPermissions>(getPermissions(null))

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [s, p, l, d, g, e, adminProfileRes] = await Promise.all([
        fetchPlatformStats(),
        fetchAllProfiles(),
        fetchAllLots(),
        fetchAllDeals(),
        fetchAllGrievances(),
        fetchAllEscrow(),
        supabase.from('admin_profiles').select('sub_role').eq('id', user.id).single(),
      ])
      setStats(s); setProfiles(p); setLots(l); setDeals(d); setGrievances(g); setEscrow(e)
      const subRole = (adminProfileRes.data?.sub_role ?? null) as AdminSubRole | null
      setAdminSubRole(subRole)
      setPermissions(getPermissions(subRole))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  async function verifyUser(id: string, role: 'buyer' | 'farmer', verified: boolean): Promise<void> {
    try {
      if (role === 'buyer') await verifyBuyer(id, verified)
      else await verifyFarmer(id, verified)
      await load()
      toast.success(verified ? 'User verified' : 'Verification removed')
    } catch {
      toast.error('Failed to update verification')
    }
  }

  async function resolveGrievance(id: string, status: ComplaintStatus, note?: string): Promise<void> {
    try {
      await updateGrievanceStatus(id, status, note)
      setGrievances(prev => prev.map(g => g.id === id ? { ...g, status, resolution_note: note ?? g.resolution_note } : g))
      toast.success('Grievance updated')
    } catch {
      toast.error('Failed to update grievance')
    }
  }

  async function assignToSelf(grievanceId: string): Promise<void> {
    if (!user) return
    try {
      await assignGrievance(grievanceId, user.id)
      setGrievances(prev => prev.map(g => g.id === grievanceId ? { ...g, assigned_to: user.id } : g))
      toast.success('Assigned to you')
    } catch {
      toast.error('Failed to assign')
    }
  }

  async function logAction(
    action: string,
    targetType: string,
    targetId: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      await logAdminAction(action, targetType, targetId, details)
    } catch {
      // Audit log failures are non-fatal
    }
  }

  return (
    <AdminContext.Provider value={{
      stats, profiles, lots, deals, grievances, escrow, loading,
      adminSubRole, permissions,
      reload: load, verifyUser, resolveGrievance, assignToSelf, logAction,
      logout: signOut,
    }}>
      {children}
    </AdminContext.Provider>
  )
}
