import { supabase } from '../../lib/supabase'
import type { DbOffer } from '../../types'
import { createDealFromOffer } from './deals'
import { updateLotStatus } from './lots'
import { createEscrowTransaction } from './escrow'

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

export interface BuyerJoin {
  full_name: string
  avatar_url: string | null
  buyer_profile: {
    org_name: string | null
    buyer_type: string | null
    trust_score: number
    completed_deals: number
    verified: boolean
  } | null
}

export type ExpandedOffer = DbOffer & {
  lot: { crop: string; variety: string; quantity: number; unit: string } | null
  buyer: BuyerJoin | null
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

export async function fetchOffersForFarmer(): Promise<ExpandedOffer[]> {
  // RLS "offers_farmer_select" restricts to the authenticated farmer's lots automatically
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      lot:lots!lot_id(crop, variety, quantity, unit),
      buyer:profiles!buyer_id(
        full_name,
        avatar_url,
        buyer_profile:buyer_profiles(org_name, buyer_type, trust_score, completed_deals, verified)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ExpandedOffer[]
}

export async function fetchBuyerOffers(buyerId: string): Promise<(DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } | null })[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*, lot:lots!lot_id(crop, variety, mandi, grade)')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } | null })[]
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

/** Accept an offer: update offer status, create deal, optionally create escrow, update lot status */
export async function acceptOfferWithDeal(offerId: string): Promise<{ dealId: string }> {
  // 1. Fetch the offer first to get lot info
  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .select('*, lot:lots!lot_id(farmer_id, status)')
    .eq('id', offerId)
    .single()

  if (offerErr) throw offerErr

  const lot = offer.lot as { farmer_id: string; status: string } | null

  // 2. Create the deal
  const deal = await createDealFromOffer(offerId)

  // 3. Mark offer as accepted (other pending offers on same lot get expired via trigger or manually)
  await updateOfferStatus(offerId, 'accepted')

  // 4. Update lot status to deal_accepted
  await updateLotStatus(offer.lot_id, 'deal_accepted')

  // 5. If escrow payment, create escrow transaction
  if (offer.escrow_protected && lot) {
    await createEscrowTransaction({
      deal_id: deal.id,
      lot_id: offer.lot_id,
      buyer_id: offer.buyer_id,
      farmer_id: lot.farmer_id,
      amount: offer.quantity * offer.offer_price,
    })
  }

  return { dealId: deal.id }
}
