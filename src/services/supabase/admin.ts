import { supabase } from '../../lib/supabase'
import type { DbLot, DbDeal, DbGrievance, DbEscrowTransaction, ComplaintStatus } from '../../types'

export interface AdminProfile {
  id: string
  role: 'farmer' | 'buyer' | 'admin'
  full_name: string
  phone: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
  farmer_profile: { village: string | null; district: string | null; kyc_status: string | null; verified: boolean } | null
  buyer_profile: { org_name: string | null; buyer_type: string | null; trust_score: number; completed_deals: number; verified: boolean } | null
}

export async function fetchAllProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, role, full_name, phone, email, avatar_url, created_at,
      farmer_profile:farmer_profiles(village, district, kyc_status, verified),
      buyer_profile:buyer_profiles(org_name, buyer_type, trust_score, completed_deals, verified)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as AdminProfile[]
}

export async function fetchAllLots(): Promise<(DbLot & { farmer: { full_name: string } | null })[]> {
  const { data, error } = await supabase
    .from('lots')
    .select('*, farmer:profiles!farmer_id(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (DbLot & { farmer: { full_name: string } | null })[]
}

export async function fetchAllDeals(): Promise<(DbDeal & {
  farmer: { full_name: string } | null
  buyer: { full_name: string } | null
})[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, farmer:profiles!farmer_id(full_name), buyer:profiles!buyer_id(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (DbDeal & { farmer: { full_name: string } | null; buyer: { full_name: string } | null })[]
}

export async function fetchAllGrievances(): Promise<(DbGrievance & {
  reporter: { full_name: string } | null
})[]> {
  const { data, error } = await supabase
    .from('grievances')
    .select('*, reporter:profiles!reporter_id(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (DbGrievance & { reporter: { full_name: string } | null })[]
}

export async function fetchAllEscrow(): Promise<(DbEscrowTransaction & {
  farmer: { full_name: string } | null
  buyer: { full_name: string } | null
  lot_info: { crop: string; grade: string; variety: string } | null
})[]> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*, farmer:profiles!farmer_id(full_name), buyer:profiles!buyer_id(full_name), lot_info:lots!lot_id(crop, grade, variety)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (DbEscrowTransaction & {
    farmer: { full_name: string } | null
    buyer: { full_name: string } | null
    lot_info: { crop: string; grade: string; variety: string } | null
  })[]
}

export async function verifyBuyer(id: string, verified: boolean): Promise<void> {
  const { error } = await supabase
    .from('buyer_profiles')
    .update({ verified })
    .eq('id', id)

  if (error) throw error
}

export async function verifyFarmer(id: string, verified: boolean): Promise<void> {
  const { error } = await supabase
    .from('farmer_profiles')
    .update({ verified })
    .eq('id', id)

  if (error) throw error
}

export async function updateGrievanceStatus(
  id: string,
  status: ComplaintStatus,
  resolutionNote?: string
): Promise<void> {
  const { error } = await supabase
    .from('grievances')
    .update({ status, ...(resolutionNote ? { resolution_note: resolutionNote } : {}) })
    .eq('id', id)

  if (error) throw error
}

export async function assignGrievance(grievanceId: string, adminId: string): Promise<void> {
  const { error } = await supabase
    .from('grievances')
    .update({ assigned_to: adminId })
    .eq('id', grievanceId)

  if (error) throw error
}

export async function fetchPlatformStats(): Promise<{
  farmers: number
  buyers: number
  activeLots: number
  activeDeals: number
  pendingGrievances: number
  totalEscrow: number
}> {
  const [farmersRes, buyersRes, lotsRes, dealsRes, grievancesRes, escrowRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'farmer'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
    supabase.from('lots').select('id', { count: 'exact', head: true }).in('status', ['listed', 'offers_received']),
    supabase.from('deals').select('id', { count: 'exact', head: true }).neq('status', 'payment_released'),
    supabase.from('grievances').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review', 'evidence_requested']),
    supabase.from('escrow_transactions').select('amount').eq('status', 'protected'),
  ])

  const totalEscrow = (escrowRes.data ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)

  return {
    farmers: farmersRes.count ?? 0,
    buyers: buyersRes.count ?? 0,
    activeLots: lotsRes.count ?? 0,
    activeDeals: dealsRes.count ?? 0,
    pendingGrievances: grievancesRes.count ?? 0,
    totalEscrow,
  }
}
