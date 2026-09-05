import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../cloudinary'
import type { DbLot, LotStatus } from '../../types'

export interface CreateLotInput {
  crop_id?: string
  crop: string
  variety: string
  grade: 'A' | 'B' | 'C'
  quantity: number
  unit: string
  expected_price: number
  payment_mode: 'escrow' | 'direct'
  assaying: boolean
  mandi: string
  description?: string
  selling_method?: string
  image_urls?: string[]
}

export async function fetchFarmerLots(farmerId: string): Promise<DbLot[]> {
  const { data, error } = await supabase
    .from('lots')
    .select('*')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DbLot[]
}

export async function fetchActiveLots(): Promise<DbLot[]> {
  const { data, error } = await supabase
    .from('lots')
    .select('*')
    .in('status', ['listed', 'offers_received'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DbLot[]
}

export async function fetchLotById(id: string): Promise<DbLot | null> {
  const { data, error } = await supabase
    .from('lots')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as DbLot | null
}

export async function createLot(input: CreateLotInput): Promise<DbLot> {
  const { data, error } = await supabase
    .from('lots')
    .insert({
      crop_id: input.crop_id ?? input.crop.toLowerCase(),
      crop: input.crop,
      variety: input.variety,
      grade: input.grade,
      quantity: input.quantity,
      unit: input.unit,
      expected_price: input.expected_price,
      payment_mode: input.payment_mode,
      assaying: input.assaying,
      mandi: input.mandi,
      description: input.description ?? null,
      selling_method: input.selling_method ?? 'direct',
      image_urls: input.image_urls ?? [],
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return data as DbLot
}

export async function updateLotStatus(id: string, status: LotStatus): Promise<void> {
  const { error } = await supabase
    .from('lots')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

export async function updateLot(
  id: string,
  patch: Partial<Omit<DbLot, 'id' | 'farmer_id' | 'created_at' | 'updated_at'>>
): Promise<DbLot> {
  const { data, error } = await supabase
    .from('lots')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as DbLot
}

export async function deleteLot(id: string): Promise<void> {
  const { error } = await supabase
    .from('lots')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function uploadLotImage(
  _farmerId: string,
  _lotId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const result = await uploadToCloudinary(file, 'krishi-mitra/lots', onProgress)
  return result.secure_url
}
