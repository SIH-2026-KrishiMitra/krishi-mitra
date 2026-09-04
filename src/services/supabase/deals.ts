import { supabase } from '../../lib/supabase'
import type { DbDeal, DealStatus, DbDealEvent } from '../../types'

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

export type ExpandedDeal = DbDeal & {
  buyer: BuyerJoin | null
}

export async function fetchFarmerDeals(): Promise<ExpandedDeal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      buyer:profiles!buyer_id(
        full_name,
        avatar_url,
        buyer_profile:buyer_profiles(org_name, buyer_type, trust_score, completed_deals, verified)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ExpandedDeal[]
}

export async function fetchBuyerDeals(): Promise<ExpandedDeal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      buyer:profiles!buyer_id(
        full_name,
        avatar_url,
        buyer_profile:buyer_profiles(org_name, buyer_type, trust_score, completed_deals, verified)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ExpandedDeal[]
}

export async function fetchDealById(id: string): Promise<ExpandedDeal | null> {
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      buyer:profiles!buyer_id(
        full_name,
        avatar_url,
        buyer_profile:buyer_profiles(org_name, buyer_type, trust_score, completed_deals, verified)
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as ExpandedDeal | null
}

export async function createDealFromOffer(offerId: string): Promise<DbDeal> {
  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .select('*, lot:lots!lot_id(crop, variety, unit, farmer_id)')
    .eq('id', offerId)
    .single()

  if (offerErr) throw offerErr

  const lot = offer.lot as { crop: string; variety: string; unit: string; farmer_id: string } | null

  const now = new Date().toISOString()
  const initialTimeline: DbDealEvent[] = [
    { status: 'offer_accepted', label: 'Offer accepted', timestamp: now }
  ]

  const { data, error } = await supabase
    .from('deals')
    .insert({
      lot_id: offer.lot_id,
      offer_id: offerId,
      farmer_id: lot?.farmer_id ?? '',
      buyer_id: offer.buyer_id,
      crop: lot?.crop ?? '',
      variety: lot?.variety ?? '',
      quantity: offer.quantity,
      unit: lot?.unit ?? 'qtl',
      price_per_unit: offer.offer_price,
      total_value: offer.quantity * offer.offer_price,
      escrow_amount: offer.escrow_protected ? offer.quantity * offer.offer_price : 0,
      status: 'offer_accepted',
      timeline: initialTimeline,
    })
    .select()
    .single()

  if (error) throw error
  return data as DbDeal
}

export async function updateDealStatus(
  id: string,
  status: DealStatus,
  eventDetail?: string
): Promise<DbDeal> {
  const { data: current, error: fetchErr } = await supabase
    .from('deals')
    .select('timeline')
    .eq('id', id)
    .single()

  if (fetchErr) throw fetchErr

  const LABELS: Record<DealStatus, string> = {
    offer_accepted: 'Offer accepted',
    money_deposited: 'Money deposited',
    transport_assigned: 'Transport assigned',
    pickup_scheduled: 'Pickup scheduled',
    delivered: 'Delivered',
    payment_released: 'Payment released',
  }

  const newEvent: DbDealEvent = {
    status,
    label: LABELS[status],
    timestamp: new Date().toISOString(),
    ...(eventDetail ? { detail: eventDetail } : {}),
  }

  const timeline = [...((current.timeline as DbDealEvent[]) ?? []), newEvent]

  const { data, error } = await supabase
    .from('deals')
    .update({ status, timeline })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as DbDeal
}
