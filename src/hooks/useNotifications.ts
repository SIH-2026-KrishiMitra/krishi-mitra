import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/supabase/notifications'
import type { DbNotification } from '../types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<DbNotification[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications()
      setNotifications(data)
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    // Realtime: new notifications appear instantly
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        payload => {
          setNotifications(prev => [payload.new as DbNotification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        payload => {
          setNotifications(prev =>
            prev.map(n => n.id === payload.new.id ? payload.new as DbNotification : n)
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  const markRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await markNotificationRead(id)
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await markAllNotificationsRead()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, loading, unreadCount, markRead, markAllRead }
}
