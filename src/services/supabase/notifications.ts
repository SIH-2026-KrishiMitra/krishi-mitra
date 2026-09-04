import { supabase } from '../../lib/supabase'
import type { DbNotification } from '../../types'

export async function fetchNotifications(): Promise<DbNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('read', false)
}
