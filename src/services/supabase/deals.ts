import { supabase } from '../../lib/supabase'
import type { DbDeal, DealStatus, DbDealEvent } from '../../types'

export async function fetchFarmerDeals(farmerId: string): Promise<DbDeal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DbDeal[]
}

export async function fetchBuyerDeals(buyerId: string): Promise<DbDeal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DbDeal[]
}

export async function fetchDealById(id: string): Promise<DbDeal | null> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as DbDeal | null
}

export async function createDealFromOffer(offerId: string): Promise<DbDeal> {
  // Fetch offer + lot to build deal
  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .select('*, lot:lots(crop, variety, unit, farmer_id)')
    .eq('id', offerId)
    .single()

  if (offerErr) throw offerErr

  const lot = offer.lot as { crop: string; variety: string; unit: string; farmer_id: string }

  const now = new Date().toISOString()
  const initialTimeline: DbDealEvent[] = [
    { status: 'offer_accepted', label: 'Offer accepted', timestamp: now }
  ]

  const { data, error } = await supabase
    .from('deals')
    .insert({
      lot_id: offer.lot_id,
      offer_id: offerId,
      farmer_id: lot.farmer_id,
      buyer_id: offer.buyer_id,
      crop: lot.crop,
      variety: lot.variety,
      quantity: offer.quantity,
      unit: lot.unit,
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
