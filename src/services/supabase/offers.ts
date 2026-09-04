import { supabase } from '../../lib/supabase'
import type { DbOffer } from '../../types'

export interface CreateOfferInput {
  lot_id: string
  offer_price: number
  quantity: number
  pickup_timeline: string
  payment_terms: string
  payment_mode: 'escrow' | 'direct'
  escrow_protected: boolean
  valid_until?: string
  notes?: string
}

export async function fetchOffersForLot(lotId: string): Promise<DbOffer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('lot_id', lotId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DbOffer[]
}

export async function fetchOffersForFarmer(_farmerId: string): Promise<(DbOffer & { lot: { crop: string; variety: string; quantity: number; unit: string } })[]> {
  // RLS policy "offers_farmer_select" already restricts results to the authenticated farmer's lots
  const { data, error } = await supabase
    .from('offers')
    .select('*, lot:lots(crop, variety, quantity, unit)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (DbOffer & { lot: { crop: string; variety: string; quantity: number; unit: string } })[]
}

export async function fetchBuyerOffers(buyerId: string): Promise<(DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } })[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*, lot:lots(crop, variety, mandi, grade)')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } })[]
}

export async function createOffer(input: CreateOfferInput): Promise<DbOffer> {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      lot_id: input.lot_id,
      offer_price: input.offer_price,
      quantity: input.quantity,
      pickup_timeline: input.pickup_timeline,
      payment_terms: input.payment_terms,
      payment_mode: input.payment_mode,
      escrow_protected: input.escrow_protected,
      valid_until: input.valid_until ?? null,
      notes: input.notes ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data as DbOffer
}

export async function updateOfferStatus(
  id: string,
  status: 'accepted' | 'rejected' | 'cancelled'
): Promise<void> {
  const { error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}
