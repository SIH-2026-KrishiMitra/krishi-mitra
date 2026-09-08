import { supabase } from '../../lib/supabase'
import type { DbLot, DbDeal, DbGrievance, DbEscrowTransaction, ComplaintStatus, LotStatus, EscrowStatus } from '../../types'
import type { AdminSubRole } from '../../lib/adminPermissions.tsx'

export type GrievancePriority = 'low' | 'medium' | 'high' | 'urgent'

export interface AdminProfile {
  id: string
  role: 'farmer' | 'buyer' | 'admin'
  full_name: string
  phone: string | null
  email: string | null
  avatar_url: string | null
  suspended: boolean
  created_at: string
  farmer_profile: {
    village: string | null
    district: string | null
    state: string | null
    kyc_status: string | null
    verified: boolean
    bank_account: string | null
    ifsc: string | null
    bank_name: string | null
  } | null
  buyer_profile: {
    org_name: string | null
    buyer_type: string | null
    trust_score: number
    completed_deals: number
    verified: boolean
    district: string | null
    state: string | null
    location: string | null
  } | null
}

export async function fetchAllProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, role, full_name, phone, email, avatar_url, suspended, created_at,
      farmer_profile:farmer_profiles(village, district, state, kyc_status, verified, bank_account, ifsc, bank_name),
      buyer_profile:buyer_profiles(org_name, buyer_type, trust_score, completed_deals, verified, district, state, location)
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

// ─── Enhanced stats with date range ──────────────────────────────────────────

export interface EnhancedStats {
  totalFarmers: number
  totalBuyers: number
  activeLots: number
  ordersInRange: number
  totalTransactionValue: number
  pendingKyc: number
  pendingComplaints: number
  pendingPayouts: number
  pendingRefunds: number
  successfulTransactions: number
  newRegistrations: number
}

export async function fetchEnhancedStats(dateFrom: string, dateTo: string): Promise<EnhancedStats> {
  const [
    farmersRes,
    buyersRes,
    activeLotsRes,
    ordersRes,
    kycRes,
    complaintsRes,
    payoutsRes,
    refundsRes,
    successRes,
    registrationsRes,
    dealsValueRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'farmer'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
    supabase.from('lots').select('id', { count: 'exact', head: true }).in('status', ['listed', 'offers_received']),
    supabase.from('deals').select('id', { count: 'exact', head: true }).gte('created_at', dateFrom).lte('created_at', dateTo),
    supabase.from('farmer_profiles').select('id', { count: 'exact', head: true }).neq('kyc_status', 'complete'),
    supabase.from('grievances').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review', 'evidence_requested']),
    supabase.from('escrow_transactions').select('id', { count: 'exact', head: true }).eq('status', 'release_pending'),
    supabase.from('escrow_transactions').select('id', { count: 'exact', head: true }).eq('status', 'disputed'),
    supabase.from('escrow_transactions').select('id', { count: 'exact', head: true }).eq('status', 'released').gte('created_at', dateFrom).lte('created_at', dateTo),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', dateFrom).lte('created_at', dateTo).neq('role', 'admin'),
    supabase.from('deals').select('total_value').gte('created_at', dateFrom).lte('created_at', dateTo),
  ])

  const totalTransactionValue = (dealsValueRes.data ?? []).reduce((s, d) => s + (d.total_value ?? 0), 0)

  return {
    totalFarmers: farmersRes.count ?? 0,
    totalBuyers: buyersRes.count ?? 0,
    activeLots: activeLotsRes.count ?? 0,
    ordersInRange: ordersRes.count ?? 0,
    totalTransactionValue,
    pendingKyc: kycRes.count ?? 0,
    pendingComplaints: complaintsRes.count ?? 0,
    pendingPayouts: payoutsRes.count ?? 0,
    pendingRefunds: refundsRes.count ?? 0,
    successfulTransactions: successRes.count ?? 0,
    newRegistrations: registrationsRes.count ?? 0,
  }
}

// ─── Time-series data (minimal fields) ───────────────────────────────────────

export async function fetchOrdersTimeSeries(
  dateFrom: string,
  dateTo: string
): Promise<{ created_at: string; total_value: number }[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('created_at, total_value')
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as { created_at: string; total_value: number }[]
}

export async function fetchRegistrationsTimeSeries(
  dateFrom: string,
  dateTo: string
): Promise<{ created_at: string; role: string }[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('created_at, role')
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo)
    .in('role', ['farmer', 'buyer'])
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as { created_at: string; role: string }[]
}

export async function fetchLotsTimeSeries(
  dateFrom: string,
  dateTo: string
): Promise<{ created_at: string }[]> {
  const { data, error } = await supabase
    .from('lots')
    .select('created_at')
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as { created_at: string }[]
}

// ─── Recent items (limited, never full table) ─────────────────────────────────

export interface RecentUser {
  id: string
  full_name: string
  role: string
  email: string | null
  created_at: string
}

export async function fetchRecentRegistrations(limit = 5): Promise<RecentUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, email, created_at')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as RecentUser[]
}

export interface RecentOrder {
  id: string
  crop: string
  variety: string
  total_value: number
  status: string
  created_at: string
  farmer: { full_name: string } | null
  buyer: { full_name: string } | null
}

export async function fetchRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('id, crop, variety, total_value, status, created_at, farmer:profiles!farmer_id(full_name), buyer:profiles!buyer_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as RecentOrder[]
}

export interface RecentComplaint {
  id: string
  title: string
  type: string
  status: string
  created_at: string
  reporter: { full_name: string } | null
}

export async function fetchRecentComplaints(limit = 5): Promise<RecentComplaint[]> {
  const { data, error } = await supabase
    .from('grievances')
    .select('id, title, type, status, created_at, reporter:profiles!reporter_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as RecentComplaint[]
}

export interface RecentTransaction {
  id: string
  amount: number
  status: string
  created_at: string
  transaction_ref: string | null
  farmer: { full_name: string } | null
  buyer: { full_name: string } | null
}

export async function fetchRecentTransactions(limit = 5): Promise<RecentTransaction[]> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('id, amount, status, created_at, transaction_ref, farmer:profiles!farmer_id(full_name), buyer:profiles!buyer_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as RecentTransaction[]
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export interface KycEntry {
  id: string
  kyc_status: string
  village: string | null
  district: string | null
  state: string | null
  bank_account: string | null
  verified: boolean
  profile: { full_name: string; email: string | null; phone: string | null; created_at: string } | null
}

export async function fetchKycQueue(): Promise<KycEntry[]> {
  const { data, error } = await supabase
    .from('farmer_profiles')
    .select('id, kyc_status, village, district, state, bank_account, verified, profile:profiles!id(full_name, email, phone, created_at)')
    .neq('kyc_status', 'complete')
    .order('id', { ascending: false })

  if (error) throw error
  return data as unknown as KycEntry[]
}

export async function updateKycStatus(
  farmerId: string,
  status: 'complete' | 'pending' | 'not_started'
): Promise<void> {
  const { error } = await supabase
    .from('farmer_profiles')
    .update({ kyc_status: status })
    .eq('id', farmerId)

  if (error) throw error
}

// ─── Admin management ─────────────────────────────────────────────────────────

export interface AdminWithSubRole {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  created_at: string
  admin_profile: { department: string | null; sub_role: string } | null
}

export async function fetchAllAdmins(): Promise<AdminWithSubRole[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, created_at, admin_profile:admin_profiles(department, sub_role)')
    .eq('role', 'admin')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as AdminWithSubRole[]
}

export async function updateAdminSubRole(id: string, subRole: AdminSubRole): Promise<void> {
  const { error } = await supabase
    .from('admin_profiles')
    .update({ sub_role: subRole })
    .eq('id', id)

  if (error) throw error
}

// ─── Audit logs ───────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  details: Record<string, unknown> | null
  created_at: string
  admin: { full_name: string } | null
}

export async function logAdminAction(
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase
    .from('audit_logs')
    .insert({ admin_id: user.id, action, target_type: targetType, target_id: targetId, details: details ?? null })

  if (error) console.error('audit log failed:', error)
}

export async function fetchAuditLogs(limit = 100): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, admin:profiles!admin_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as AuditLog[]
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface AdminNotification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  read: boolean
  link_to: string | null
  created_at: string
  user: { full_name: string; role: string } | null
}

export async function fetchAllNotifications(limit = 50): Promise<AdminNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, user:profiles!user_id(full_name, role)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as AdminNotification[]
}

export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  linkTo?: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, body, link_to: linkTo ?? null, read: false })

  if (error) throw error
}

export async function broadcastNotification(
  role: 'farmer' | 'buyer' | 'all',
  type: string,
  title: string,
  body: string
): Promise<void> {
  const query = supabase.from('profiles').select('id')
  if (role !== 'all') query.eq('role', role)

  const { data: users, error: usersErr } = await query
  if (usersErr) throw usersErr

  const rows = (users ?? []).map(u => ({ user_id: u.id, type, title, body, read: false, link_to: null }))
  if (rows.length === 0) return

  const { error } = await supabase.from('notifications').insert(rows)
  if (error) throw error
}

// ─── Categories (market_prices) ───────────────────────────────────────────────

export interface MarketPriceRow {
  id: string
  crop: string
  variety: string
  mandi: string
  current_price: number
  unit: string
  trend: string
  demand_level: string
  msp: number | null
  updated_at: string
  is_active: boolean
}

export async function fetchCategories(): Promise<MarketPriceRow[]> {
  const { data, error } = await supabase
    .from('market_prices')
    .select('id, crop, variety, mandi, current_price, unit, trend, demand_level, msp, updated_at, is_active')
    .order('crop', { ascending: true })

  if (error) throw error
  return (data ?? []) as MarketPriceRow[]
}

export async function updateMarketPrice(id: string, patch: Partial<MarketPriceRow>): Promise<void> {
  const { error } = await supabase
    .from('market_prices')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ─── Suspend user ─────────────────────────────────────────────────────────────

export async function setUserSuspended(id: string, suspended: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ suspended })
    .eq('id', id)

  if (error) throw error
}

// ─── Full KYC list (all statuses) ────────────────────────────────────────────

export async function fetchAllKyc(): Promise<KycEntry[]> {
  const { data, error } = await supabase
    .from('farmer_profiles')
    .select('id, kyc_status, village, district, state, bank_account, verified, profile:profiles!id(full_name, email, phone, created_at)')
    .order('kyc_status', { ascending: false })

  if (error) throw error
  return data as unknown as KycEntry[]
}

export async function fetchKycAuditLogs(farmerId: string): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, admin:profiles!admin_id(full_name)')
    .eq('target_id', farmerId)
    .in('action', ['approve_kyc', 'reject_kyc', 'update_kyc'])
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error
  return data as unknown as AuditLog[]
}

// ─── Lot admin controls ───────────────────────────────────────────────────────

export async function setLotStatus(lotId: string, status: LotStatus): Promise<void> {
  const { error } = await supabase
    .from('lots')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', lotId)

  if (error) throw error
}

// ─── Category management ──────────────────────────────────────────────────────

export interface NewCategory {
  crop: string
  variety: string
  mandi: string
  current_price: number
  unit: string
  msp: number
  trend: 'up' | 'down' | 'flat'
  demand_level: 'high' | 'medium' | 'low'
}

export async function insertCategory(data: NewCategory): Promise<MarketPriceRow> {
  const { data: row, error } = await supabase
    .from('market_prices')
    .insert({
      ...data,
      delta: 0,
      delta_percent: 0,
      source: 'Admin',
      price_history: [],
      updated_at: new Date().toISOString(),
      is_active: true,
    })
    .select('id, crop, variety, mandi, current_price, unit, trend, demand_level, msp, updated_at, is_active')
    .single()

  if (error) throw error
  return row as MarketPriceRow
}

export async function setMarketPriceActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from('market_prices')
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ─── Escrow / refund management ───────────────────────────────────────────────

export async function updateEscrowStatus(
  id: string,
  status: EscrowStatus,
  note?: string
): Promise<void> {
  const { error } = await supabase
    .from('escrow_transactions')
    .update({ status, ...(note ? { dispute_note: note } : {}) })
    .eq('id', id)

  if (error) throw error
}

// ─── Grievance admin helpers ──────────────────────────────────────────────────

export async function setGrievancePriority(
  grievanceId: string,
  priority: GrievancePriority
): Promise<void> {
  const { error } = await supabase
    .from('grievances')
    .update({ priority })
    .eq('id', grievanceId)

  if (error) throw error
}

export interface AdminNote {
  note: string
  admin: string
  at: string
}

export async function appendGrievanceNote(
  grievanceId: string,
  note: string,
  adminName: string
): Promise<AdminNote[]> {
  const { data: current, error: fetchErr } = await supabase
    .from('grievances')
    .select('admin_notes')
    .eq('id', grievanceId)
    .single()

  if (fetchErr) throw fetchErr

  const existing: AdminNote[] = (current?.admin_notes as AdminNote[] | null) ?? []
  const newNote: AdminNote = { note, admin: adminName, at: new Date().toISOString() }
  const updated = [...existing, newNote]

  const { error } = await supabase
    .from('grievances')
    .update({ admin_notes: updated })
    .eq('id', grievanceId)

  if (error) throw error
  return updated
}
