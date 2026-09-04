import { useState, useMemo } from 'react'
import { Search, CheckCircle, XCircle, Users } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import type { AdminProfile } from '../../services/supabase/admin'
import styles from './AdminUsers.module.css'

type RoleFilter = 'all' | 'farmer' | 'buyer' | 'admin'

export default function AdminUsers() {
  const { profiles, loading, verifyUser } = useAdmin()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [selected, setSelected] = useState<AdminProfile | null>(null)
  const [verifying, setVerifying] = useState(false)

  const filtered = useMemo(() => profiles.filter(p => {
    const matchRole = roleFilter === 'all' || p.role === roleFilter
    const matchSearch = !search || [p.full_name, p.email, p.phone].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
    return matchRole && matchSearch
  }), [profiles, roleFilter, search])

  async function handleVerify(id: string, role: 'farmer' | 'buyer', verified: boolean) {
    setVerifying(true)
    await verifyUser(id, role, verified)
    setVerifying(false)
    setSelected(prev => prev?.id === id ? { ...prev,
      farmer_profile: prev.farmer_profile ? { ...prev.farmer_profile, verified } : null,
      buyer_profile: prev.buyer_profile ? { ...prev.buyer_profile, verified } : null,
    } : prev)
  }

  function isVerified(p: AdminProfile): boolean {
    return !!(p.farmer_profile?.verified || p.buyer_profile?.verified)
  }

  const ROLE_LABELS: Record<string, string> = { farmer: 'Farmer', buyer: 'Buyer', admin: 'Admin' }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>02 · USER MANAGEMENT</p>
            <h1 className={styles.title}>Users</h1>
            <p className={styles.subtitle}>{profiles.length} registered users</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} aria-hidden />
            <input type="search" placeholder="Search by name, email, phone…" className={styles.searchInput}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.roleChips}>
            {(['all', 'farmer', 'buyer', 'admin'] as RoleFilter[]).map(r => (
              <button key={r} type="button"
                className={`${styles.chip} ${roleFilter === r ? styles.chipActive : ''}`}
                onClick={() => setRoleFilter(r)}>
                {r === 'all' ? 'All' : ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* User table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className={styles.loadingRow}>Loading users…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className={styles.emptyRow}><Users size={20} /> No users found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id}
                    className={`${styles.tableRow} ${selected?.id === p.id ? styles.tableRowActive : ''}`}
                    onClick={() => setSelected(p)}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{p.full_name.charAt(0).toUpperCase()}</div>
                        <span className={styles.userName}>{p.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[`role_${p.role}`]}`}>
                        {ROLE_LABELS[p.role]}
                      </span>
                    </td>
                    <td className={styles.contactCell}>
                      <span>{p.email ?? p.phone ?? '—'}</span>
                    </td>
                    <td>
                      {isVerified(p)
                        ? <CheckCircle size={16} className={styles.verifiedIcon} />
                        : <XCircle size={16} className={styles.unverifiedIcon} />
                      }
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User detail */}
          {selected && (
            <div className={styles.detailPanel}>
              <div className={styles.detailAvatar}>{selected.full_name.charAt(0).toUpperCase()}</div>
              <h2 className={styles.detailName}>{selected.full_name}</h2>
              <p className={styles.detailRole}>
                <span className={`${styles.roleBadge} ${styles[`role_${selected.role}`]}`}>
                  {ROLE_LABELS[selected.role]}
                </span>
              </p>

              <div className={styles.detailRows}>
                <DetailRow label="Email" value={selected.email ?? '—'} />
                <DetailRow label="Phone" value={selected.phone ? `+91 ${selected.phone}` : '—'} />
                <DetailRow label="Joined" value={new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                {selected.farmer_profile && <>
                  <DetailRow label="Village" value={selected.farmer_profile.village ?? '—'} />
                  <DetailRow label="District" value={selected.farmer_profile.district ?? '—'} />
                  <DetailRow label="KYC" value={selected.farmer_profile.kyc_status ?? 'pending'} />
                </>}
                {selected.buyer_profile && <>
                  <DetailRow label="Organisation" value={selected.buyer_profile.org_name ?? '—'} />
                  <DetailRow label="Buyer type" value={selected.buyer_profile.buyer_type ?? '—'} />
                  <DetailRow label="Trust score" value={`${selected.buyer_profile.trust_score}%`} />
                  <DetailRow label="Completed deals" value={String(selected.buyer_profile.completed_deals)} />
                </>}
              </div>

              {(selected.role === 'farmer' || selected.role === 'buyer') && (
                <div className={styles.detailActions}>
                  <button type="button"
                    className={isVerified(selected) ? styles.unverifyBtn : styles.verifyBtn}
                    disabled={verifying}
                    onClick={() => handleVerify(selected.id, selected.role as 'farmer' | 'buyer', !isVerified(selected))}>
                    {verifying ? 'Updating…' : isVerified(selected) ? 'Remove verification' : 'Verify user'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  )
}
