import { supabase } from '../../lib/supabase'
import type { DbGrievance, ComplaintStatus, ComplaintType, DbGrievanceEvent } from '../../types'

let grievanceCounter = 1000

function generateGrievanceId(): string {
  return `GR-${String(++grievanceCounter).padStart(4, '0')}`
}

export interface CreateGrievanceInput {
  deal_id?: string
  lot_id?: string
  type: ComplaintType
  title: string
  description: string
  escrow_amount?: number
}

export async function fetchReporterGrievances(reporterId: string): Promise<DbGrievance[]> {
  const { data, error } = await supabase
    .from('grievances')
    .select('*')
    .eq('reporter_id', reporterId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DbGrievance[]
}

export async function fetchAllGrievances(): Promise<DbGrievance[]> {
  const { data, error } = await supabase
    .from('grievances')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DbGrievance[]
}

export async function fetchGrievanceById(id: string): Promise<DbGrievance | null> {
  const { data, error } = await supabase
    .from('grievances')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as DbGrievance | null
}

export async function createGrievance(input: CreateGrievanceInput): Promise<DbGrievance> {
  const now = new Date().toISOString()
  const initialTimeline: DbGrievanceEvent[] = [
    { status: 'submitted', label: 'Complaint submitted', timestamp: now }
  ]

  const { data, error } = await supabase
    .from('grievances')
    .insert({
      id: generateGrievanceId(),
      deal_id: input.deal_id ?? null,
      lot_id: input.lot_id ?? null,
      type: input.type,
      title: input.title,
      description: input.description,
      escrow_amount: input.escrow_amount ?? null,
      status: 'submitted',
      timeline: initialTimeline,
    })
    .select()
    .single()

  if (error) throw error
  return data as DbGrievance
}

export async function updateGrievanceStatus(
  id: string,
  status: ComplaintStatus,
  detail?: string
): Promise<void> {
  const { data: current, error: fetchErr } = await supabase
    .from('grievances')
    .select('timeline')
    .eq('id', id)
    .single()

  if (fetchErr) throw fetchErr

  const LABELS: Record<ComplaintStatus, string> = {
    submitted: 'Submitted',
    under_review: 'Under review',
    evidence_requested: 'Evidence requested',
    resolution: 'Resolution in progress',
    closed: 'Closed',
  }

  const newEvent: DbGrievanceEvent = {
    status,
    label: LABELS[status],
    timestamp: new Date().toISOString(),
    ...(detail ? { detail } : {}),
  }

  const timeline = [...((current.timeline as DbGrievanceEvent[]) ?? []), newEvent]

  const { error } = await supabase
    .from('grievances')
    .update({ status, timeline })
    .eq('id', id)

  if (error) throw error
}

export async function addGrievanceResolution(
  id: string,
  resolution_note: string
): Promise<void> {
  await updateGrievanceStatus(id, 'closed', resolution_note)
  const { error } = await supabase
    .from('grievances')
    .update({ resolution_note, status: 'closed' })
    .eq('id', id)

  if (error) throw error
}

export async function uploadGrievanceEvidence(
  grievanceId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${grievanceId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('grievance-evidence')
    .upload(path, file)

  if (error) throw error

  const { data } = await supabase.storage
    .from('grievance-evidence')
    .createSignedUrl(path, 60 * 60 * 24 * 7) // 7 days

  if (!data?.signedUrl) throw new Error('Failed to get signed URL')
  return data.signedUrl
}

export async function addEvidenceUrl(id: string, url: string): Promise<void> {
  const { data: current, error: fetchErr } = await supabase
    .from('grievances')
    .select('evidence_urls')
    .eq('id', id)
    .single()

  if (fetchErr) throw fetchErr

  const evidence_urls = [...(current.evidence_urls as string[]), url]
  const { error } = await supabase
    .from('grievances')
    .update({ evidence_urls })
    .eq('id', id)

  if (error) throw error
}
