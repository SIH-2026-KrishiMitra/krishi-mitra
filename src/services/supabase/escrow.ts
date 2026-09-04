import { supabase } from '../../lib/supabase'
import type { DbEscrowTransaction, EscrowStatus } from '../../types'

export interface ExpandedEscrow extends DbEscrowTransaction {
  lot_info: { crop: string; grade: string; variety: string } | null
  buyer_info: { full_name: string } | null
}

export async function fetchFarmerEscrow(): Promise<ExpandedEscrow[]> {
  // RLS "escrow_farmer_select" restricts to current farmer automatically
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select(`
      *,
      lot_info:lots!lot_id(crop, grade, variety),
      buyer_info:profiles!buyer_id(full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ExpandedEscrow[]
}

export async function fetchBuyerEscrow(): Promise<ExpandedEscrow[]> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select(`
      *,
      lot_info:lots!lot_id(crop, grade, variety),
      buyer_info:profiles!buyer_id(full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ExpandedEscrow[]
}

export async function fetchEscrowByDeal(dealId: string): Promise<DbEscrowTransaction | null> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('deal_id', dealId)
    .maybeSingle()

  if (error) throw error
  return data as DbEscrowTransaction | null
}

export async function createEscrowTransaction(input: {
  deal_id: string
  lot_id: string
  buyer_id: string
  farmer_id: string
  amount: number
}): Promise<DbEscrowTransaction> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .insert({
      deal_id: input.deal_id,
      lot_id: input.lot_id,
      buyer_id: input.buyer_id,
      farmer_id: input.farmer_id,
      amount: input.amount,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data as DbEscrowTransaction
}

export async function updateEscrowStatus(
  id: string,
  status: EscrowStatus,
  patch?: { transaction_ref?: string; dispute_note?: string }
): Promise<void> {
  const updates: Record<string, unknown> = { status, ...patch }
  if (status === 'protected') updates.deposited_at = new Date().toISOString()
  if (status === 'released') updates.released_at = new Date().toISOString()

  const { error } = await supabase
    .from('escrow_transactions')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}
