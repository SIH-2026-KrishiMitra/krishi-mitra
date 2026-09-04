import { useState } from 'react'
import { LogOut, ShieldAlert } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminSettings.module.css'

export default function AdminSettings() {
  const { logout } = useAdmin()
  const { profile } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <p className={styles.breadcrumb}>07 · SETTINGS</p>
          <h1 className={styles.title}>Settings</h1>
        </div>

        {/* Admin profile card */}
        <div className={styles.card}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <p className={styles.profileName}>{profile?.full_name ?? '—'}</p>
              <div className={styles.adminBadge}><ShieldAlert size={12} /> Admin</div>
            </div>
          </div>
          <div className={styles.profileDetails}>
            <ProfileRow label="Email" value={profile?.email ?? '—'} />
            <ProfileRow label="Phone" value={profile?.phone ? `+91 ${profile.phone}` : '—'} />
            <ProfileRow label="Language" value={profile?.language ?? 'en'} />
          </div>
        </div>

        {/* Security note */}
        <div className={styles.securityNote}>
          <ShieldAlert size={16} />
          <p>Admin accounts are managed through the Supabase dashboard. To add or remove admins, contact your system administrator.</p>
        </div>

        {/* Logout */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout} disabled={loggingOut}>
            <LogOut size={16} />
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.profileDetailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  )
}
