import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import {
  fetchAllNotifications, sendNotification, broadcastNotification,
  type AdminNotification,
} from '../../services/supabase/admin'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'
import notifStyles from './AdminNotifications.module.css'

const TYPE_CLASSES: Record<string, string> = {
  offer: styles.pill_blue,
  deal: styles.pill_green,
  payment: styles.pill_amber,
  complaint: styles.pill_danger,
  system: styles.pill_muted,
}

export default function AdminNotifications() {
  const { profiles, permissions, logAction } = useAdmin()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Form state
  const [mode, setMode] = useState<'user' | 'broadcast'>('broadcast')
  const [targetUser, setTargetUser] = useState('')
  const [broadcastRole, setBroadcastRole] = useState<'farmer' | 'buyer' | 'all'>('all')
  const [notifType, setNotifType] = useState('system')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody, setNotifBody] = useState('')

  useEffect(() => {
    fetchAllNotifications(50)
      .then(setNotifications)
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSend() {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast.error('Title and body are required')
      return
    }
    if (mode === 'user' && !targetUser) {
      toast.error('Select a user')
      return
    }
    setSending(true)
    try {
      if (mode === 'broadcast') {
        await broadcastNotification(broadcastRole, notifType, notifTitle.trim(), notifBody.trim())
        await logAction('broadcast_notification', 'notification', 'broadcast', { role: broadcastRole, type: notifType })
        toast.success(`Notification sent to all ${broadcastRole === 'all' ? 'users' : broadcastRole + 's'}`)
      } else {
        await sendNotification(targetUser, notifType, notifTitle.trim(), notifBody.trim())
        await logAction('send_notification', 'notification', targetUser, { type: notifType })
        toast.success('Notification sent')
      }
      setNotifTitle(''); setNotifBody('')
      const updated = await fetchAllNotifications(50)
      setNotifications(updated)
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const allUsers = profiles.filter(p => p.role !== 'admin')

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canManageNotifications">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>05 · SUPPORT</p>
              <h1 className={styles.title}>Notifications</h1>
              <p className={styles.subtitle}>Send and review platform notifications</p>
            </div>
          </div>

          <div className={notifStyles.twoCol}>
            {/* Send form */}
            <div className={notifStyles.sendCard}>
              <h2 className={notifStyles.sendTitle}>Send notification</h2>

              <div className={notifStyles.modeChips}>
                <button type="button"
                  className={`${notifStyles.modeChip} ${mode === 'broadcast' ? notifStyles.modeChipActive : ''}`}
                  onClick={() => setMode('broadcast')}>Broadcast</button>
                <button type="button"
                  className={`${notifStyles.modeChip} ${mode === 'user' ? notifStyles.modeChipActive : ''}`}
                  onClick={() => setMode('user')}>To specific user</button>
              </div>

              {mode === 'broadcast' ? (
                <div className={notifStyles.field}>
                  <label className={notifStyles.label}>Recipients</label>
                  <select value={broadcastRole} onChange={e => setBroadcastRole(e.target.value as 'farmer' | 'buyer' | 'all')} className={notifStyles.select}>
                    <option value="all">All users</option>
                    <option value="farmer">All farmers</option>
                    <option value="buyer">All buyers</option>
                  </select>
                </div>
              ) : (
                <div className={notifStyles.field}>
                  <label className={notifStyles.label}>User</label>
                  <select value={targetUser} onChange={e => setTargetUser(e.target.value)} className={notifStyles.select}>
                    <option value="">Select user…</option>
                    {allUsers.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={notifStyles.field}>
                <label className={notifStyles.label}>Type</label>
                <select value={notifType} onChange={e => setNotifType(e.target.value)} className={notifStyles.select}>
                  <option value="system">System</option>
                  <option value="deal">Deal</option>
                  <option value="payment">Payment</option>
                  <option value="complaint">Complaint</option>
                  <option value="offer">Offer</option>
                </select>
              </div>

              <div className={notifStyles.field}>
                <label className={notifStyles.label}>Title</label>
                <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                  placeholder="Notification title" className={notifStyles.input} maxLength={120} />
              </div>

              <div className={notifStyles.field}>
                <label className={notifStyles.label}>Body</label>
                <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)}
                  placeholder="Notification body…" rows={4} className={notifStyles.textarea} maxLength={500} />
              </div>

              <button type="button" className={styles.verifyBtn} disabled={sending} onClick={handleSend}>
                {sending ? 'Sending…' : 'Send notification'}
              </button>
            </div>

            {/* Recent notifications */}
            <div className={notifStyles.historyCard}>
              <h2 className={notifStyles.sendTitle}>Recent notifications</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Read</th>
                      <th>Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className={styles.loadingCell}>Loading…</td></tr>
                    ) : notifications.length === 0 ? (
                      <tr><td colSpan={5} className={styles.emptyCell}>No notifications sent yet</td></tr>
                    ) : notifications.map(n => {
                      const na = n as { user?: { full_name: string; role: string } | null }
                      return (
                        <tr key={n.id} className={styles.tableRow}>
                          <td>
                            <p className={styles.userName}>{na.user?.full_name ?? '—'}</p>
                            <p className={styles.muted}>{na.user?.role ?? ''}</p>
                          </td>
                          <td><span className={`${styles.pill} ${TYPE_CLASSES[n.type] ?? styles.pill_muted}`}>{n.type}</span></td>
                          <td className={styles.muted} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</td>
                          <td><span className={`${styles.pill} ${n.read ? styles.pill_green : styles.pill_muted}`}>{n.read ? 'Read' : 'Unread'}</span></td>
                          <td className={styles.dateCell}>{new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </PermissionGate>
    </AdminLayout>
  )
}
