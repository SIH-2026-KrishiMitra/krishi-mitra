import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import {
  fetchAllAdmins, updateAdminSubRole, type AdminWithSubRole,
} from '../../services/supabase/admin'
import type { AdminSubRole } from '../../lib/adminPermissions'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'

const SUB_ROLE_LABELS: Record<AdminSubRole, string> = {
  super_admin: 'Super Admin',
  finance_admin: 'Finance Admin',
  support_admin: 'Support Admin',
  verification_admin: 'Verification Admin',
}

const SUB_ROLE_DESC: Record<AdminSubRole, string> = {
  super_admin: 'Full access to everything',
  finance_admin: 'Transactions, payouts, refunds, analytics',
  support_admin: 'Complaints, notifications, orders view',
  verification_admin: 'KYC verification, user management',
}

const SUB_ROLE_CLASSES: Record<AdminSubRole, string> = {
  super_admin: styles.pill_danger,
  finance_admin: styles.pill_green,
  support_admin: styles.pill_blue,
  verification_admin: styles.pill_amber,
}

export default function AdminAdmins() {
  const { permissions, adminSubRole, logAction } = useAdmin()
  const [admins, setAdmins] = useState<AdminWithSubRole[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAllAdmins()
      .then(setAdmins)
      .catch(() => toast.error('Failed to load admins'))
      .finally(() => setLoading(false))
  }, [])

  async function handleRoleChange(admin: AdminWithSubRole, newRole: AdminSubRole) {
    const old = admin.admin_profile?.sub_role as AdminSubRole
    if (old === newRole) return
    setUpdatingId(admin.id)
    try {
      await updateAdminSubRole(admin.id, newRole)
      await logAction('update_admin_role', 'admin_profile', admin.id, { from: old, to: newRole })
      setAdmins(prev => prev.map(a => a.id === admin.id
        ? { ...a, admin_profile: { ...a.admin_profile!, sub_role: newRole } }
        : a
      ))
      toast.success(`${admin.full_name} is now ${SUB_ROLE_LABELS[newRole]}`)
    } catch {
      toast.error('Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const isSuperAdmin = adminSubRole === 'super_admin' || adminSubRole === null

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canManageAdmins">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>07 · ADMIN MANAGEMENT</p>
              <h1 className={styles.title}>Roles & Permissions</h1>
              <p className={styles.subtitle}>{admins.length} admin accounts</p>
            </div>
          </div>

          {/* Role reference */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {(Object.keys(SUB_ROLE_LABELS) as AdminSubRole[]).map(role => (
              <div key={role} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
                <span className={`${styles.pill} ${SUB_ROLE_CLASSES[role]}`}>{SUB_ROLE_LABELS[role]}</span>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 8 }}>{SUB_ROLE_DESC[role]}</p>
              </div>
            ))}
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joined</th>
                  {isSuperAdmin && <th>Change role</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={isSuperAdmin ? 6 : 5} className={styles.loadingCell}>Loading admins…</td></tr>
                ) : admins.length === 0 ? (
                  <tr><td colSpan={isSuperAdmin ? 6 : 5} className={styles.emptyCell}>No admins found</td></tr>
                ) : admins.map(admin => {
                  const sr = (admin.admin_profile?.sub_role ?? 'super_admin') as AdminSubRole
                  return (
                    <tr key={admin.id} className={styles.tableRow}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar}>{admin.full_name.charAt(0).toUpperCase()}</div>
                          <span className={styles.userName}>{admin.full_name}</span>
                        </div>
                      </td>
                      <td className={styles.muted}>{admin.email ?? '—'}</td>
                      <td className={styles.muted}>{admin.admin_profile?.department ?? '—'}</td>
                      <td>
                        <span className={`${styles.pill} ${SUB_ROLE_CLASSES[sr]}`}>
                          {SUB_ROLE_LABELS[sr]}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {new Date(admin.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      {isSuperAdmin && (
                        <td>
                          <select
                            value={sr}
                            disabled={updatingId === admin.id}
                            onChange={e => handleRoleChange(admin, e.target.value as AdminSubRole)}
                            style={{ padding: '4px 8px', border: '1px solid var(--border-default)', borderRadius: 6, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-core)' }}
                          >
                            {(Object.keys(SUB_ROLE_LABELS) as AdminSubRole[]).map(r => (
                              <option key={r} value={r}>{SUB_ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </PermissionGate>
    </AdminLayout>
  )
}
