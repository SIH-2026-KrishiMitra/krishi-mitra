import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../cloudinary'
import type { DbProfile, DbFarmerProfile, DbBuyerProfile, DbAdminProfile } from '../../types'

export async function fetchProfile(userId: string): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as DbProfile | null
}

export async function fetchFarmerProfile(userId: string): Promise<DbFarmerProfile | null> {
  const { data, error } = await supabase
    .from('farmer_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as DbFarmerProfile | null
}

export async function fetchBuyerProfile(userId: string): Promise<DbBuyerProfile | null> {
  const { data, error } = await supabase
    .from('buyer_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as DbBuyerProfile | null
}

export async function fetchAdminProfile(userId: string): Promise<DbAdminProfile | null> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as DbAdminProfile | null
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<DbProfile, 'full_name' | 'phone' | 'avatar_url' | 'language'>>
): Promise<DbProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as DbProfile
}

export async function updateFarmerProfile(
  userId: string,
  patch: Partial<Omit<DbFarmerProfile, 'id'>>
): Promise<DbFarmerProfile> {
  const { data, error } = await supabase
    .from('farmer_profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as DbFarmerProfile
}

export async function updateBuyerProfile(
  userId: string,
  patch: Partial<Omit<DbBuyerProfile, 'id' | 'verified' | 'trust_score' | 'completed_deals'>>
): Promise<DbBuyerProfile> {
  const { data, error } = await supabase
    .from('buyer_profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as DbBuyerProfile
}

export async function uploadProfilePhoto(
  _userId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const result = await uploadToCloudinary(file, 'krishi-mitra/profiles', onProgress)
  return result.secure_url
}

// Admin-only: fetch all profiles with pagination
export async function fetchAllProfiles(
  page = 0,
  pageSize = 50
): Promise<DbProfile[]> {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return data as DbProfile[]
}

// Admin-only: suspend or unsuspend a user
export async function setUserSuspended(userId: string, suspended: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ suspended })
    .eq('id', userId)

  if (error) throw error
}
