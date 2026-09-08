import { useState, useMemo } from 'react'
import { Search, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import { setUserSuspended, type AdminProfile } from '../../services/supabase/admin'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'

const PAGE_SIZE = 20

type VerifiedFilter = 'all' | 'verified' | 'unverified'
type StatusFilter = 'all' | 'active' | 'suspended'
type BuyerTypeFilter = 'all' | 'processor' | 'trader' | 'retailer' | 'mandi' | 'fpo'
type SortBy = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'trust_desc'
type DetailTab = 'profile' | 'deals' | 'transactions' | 'complaints'

export default function AdminBuyers() {
  const { profiles, deals, escrow, grievances, loading, verifyUser, permissions, logAction } = useAdmin()
  const [search, setSearch] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [buyerTypeFilter, setBuyerTypeFilter] = useState<BuyerTypeFilter>('all')
  const [districtFilter, setDistrictFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminProfile | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('profile')
  const [verifying, setVerifying] = useState(false)
  const [suspending, setSuspending] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'reactivate'; profile: AdminProfile } | null>(null)
  const [localSuspend, setLocalSuspend] = useState<Map<string, boolean>>(new Map())

  const buyers = useMemo(() => profiles.filter(p => p.role === 'buyer'), [profiles])

  const districts = useMemo(() =>
    Array.from(new Set(buyers.map(b => b.buyer_profile?.district).filter((d): d is string => !!d))).sort(),
    [buyers])

  const states = useMemo(() =>
    Array.from(new Set(buyers.map(b => b.buyer_profile?.state).filter((s): s is string => !!s))).sort(),
    [buyers])

  const isSuspended = (p: AdminProfile) =>
    localSuspend.has(p.id) ? localSuspend.get(p.id)! : p.suspended

  const filtered = useMemo(() => {
    let list = buyers.filter(p => {
      const bp = p.buyer_profile
      const suspended = localSuspend.has(p.id) ? localSuspend.get(p.id)! : p.suspended
      if (statusFilter === 'active' && suspended) return false
      if (statusFilter === 'suspended' && !suspended) return false
      if (verifiedFilter === 'verified' && !bp?.verified) return false
      if (verifiedFilter === 'unverified' && bp?.verified) return false
      if (buyerTypeFilter !== 'all' && bp?.buyer_type !== buyerTypeFilter) return false
      if (districtFilter && bp?.district !== districtFilter) return false
      if (stateFilter && bp?.state !== stateFilter) return false
      const q = search.toLowerCase()
      if (q && ![p.full_name, p.email, p.phone, bp?.org_name, bp?.buyer_type, bp?.location].some(v => v?.toLowerCase().includes(q))) return false
      return true
    })
    if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.full_name.localeCompare(b.full_name))
    else if (sortBy === 'name_desc') list = [...list].sort((a, b) => b.full_name.localeCompare(a.full_name))
    else if (sortBy === 'newest') list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))
    else if (sortBy === 'oldest') list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
    else if (sortBy === 'trust_desc') list = [...list].sort((a, b) => (b.buyer_profile?.trust_score ?? 0) - (a.buyer_profile?.trust_score ?? 0))
    return list
  }, [buyers, search, verifiedFilter, statusFilter, buyerTypeFilter, districtFilter, stateFilter, sortBy, localSuspend])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const buyerDeals = useMemo(() => selected ? deals.filter(d => d.buyer_id === selected.id) : [], [selected, deals])
  const buyerEscrow = useMemo(() => selected ? escrow.filter(e => e.buyer_id === selected.id) : [], [selected, escrow])
  const buyerComplaints = useMemo(() => selected ? grievances.filter(g => g.reporter_id === selected.id) : [], [selected, grievances])

  function resetPage() { setPage(0) }

  async function handleVerify(id: string, verified: boolean) {
    setVerifying(true)
    try { await verifyUser(id, 'buyer', verified) }
    catch { toast.error('Failed to update verification') }
    finally { setVerifying(false) }
  }

  async function handleSuspend(profile: AdminProfile, suspend: boolean) {
    setSuspending(true)
    try {
      await setUserSuspended(profile.id, suspend)
      await logAction(suspend ? 'suspend_user' : 'reactivate_user', 'profile', profile.id, { name: profile.full_name, role: 'buyer' })
      setLocalSuspend(prev => new Map(prev).set(profile.id, suspend))
      setConfirmAction(null)
      if (selected?.id === profile.id) setSelected(prev => prev ? { ...prev, suspended: suspend } : null)
      toast.success(suspend ? `${profile.full_name} suspended` : `${profile.full_name} reactivated`)
    } catch {
      toast.error('Failed to update account status')
    } finally {
      setSuspending(false)
    }
  }

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewUsers">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>02 · USER MANAGEMENT</p>
              <h1 className={styles.title}>Buyers</h1>
              <p className={styles.subtitle}>{filtered.length} of {buyers.length} buyers</p>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search name, org, email, location…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); resetPage() }} />
            </div>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 140 }}
              value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
              <option value="trust_desc">Trust score ↓</option>
            </select>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.chips}>
              <span className={styles.filterLabel}>Status:</span>
              {(['all', 'active', 'suspended'] as StatusFilter[]).map(f => (
                <button key={f} type="button"
                  className={`${styles.chip} ${statusFilter === f ? styles.chipActive : ''}`}
                  onClick={() => { setStatusFilter(f); resetPage() }}>
                  {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Suspended'}
                </button>
              ))}
            </div>
            <div className={styles.chips}>
              <span className={styles.filterLabel}>Verified:</span>
              {(['all', 'verified', 'unverified'] as VerifiedFilter[]).map(f => (
                <button key={f} type="button"
                  className={`${styles.chip} ${verifiedFilter === f ? styles.chipActive : ''}`}
                  onClick={() => { setVerifiedFilter(f); resetPage() }}>
                  {f === 'all' ? 'All' : f === 'verified' ? 'Verified' : 'Unverified'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.chips}>
              <span className={styles.filterLabel}>Type:</span>
              {(['all', 'processor', 'trader', 'retailer', 'mandi', 'fpo'] as BuyerTypeFilter[]).map(f => (
                <button key={f} type="button"
                  className={`${styles.chip} ${buyerTypeFilter === f ? styles.chipActive : ''}`}
                  onClick={() => { setBuyerTypeFilter(f); resetPage() }}>
                  {f === 'all' ? 'All types' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {(districts.length > 0 || states.length > 0) && (
            <div className={styles.toolbar}>
              {districts.length > 0 && (
                <select className={styles.searchInput} style={{ flex: 'none', width: 'auto' }}
                  value={districtFilter} onChange={e => { setDistrictFilter(e.target.value); resetPage() }}>
                  <option value="">All districts</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
              {states.length > 0 && (
                <select className={styles.searchInput} style={{ flex: 'none', width: 'auto' }}
                  value={stateFilter} onChange={e => { setStateFilter(e.target.value); resetPage() }}>
                  <option value="">All states</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
          )}

          <div className={styles.contentGrid}>
            <div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Organisation</th>
                      <th>Type</th>
                      <th>Trust</th>
                      <th>Deals</th>
                      <th>Status</th>
                      <th>Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className={styles.loadingCell}>Loading buyers…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={7} className={styles.emptyCell}>No buyers found</td></tr>
                    ) : paginated.map(p => {
                      const suspended = isSuspended(p)
                      return (
                        <tr key={p.id}
                          className={`${styles.tableRow} ${selected?.id === p.id ? styles.tableRowActive : ''}`}
                          onClick={() => { setSelected(p); setDetailTab('profile') }}>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.userAvatar}>{p.full_name.charAt(0).toUpperCase()}</div>
                              <span className={styles.userName}>{p.full_name}</span>
                            </div>
                          </td>
                          <td className={styles.muted}>{p.buyer_profile?.org_name ?? '—'}</td>
                          <td className={styles.muted}>{p.buyer_profile?.buyer_type ?? '—'}</td>
                          <td className={styles.numericCell}>{p.buyer_profile?.trust_score ?? 0}%</td>
                          <td className={styles.numericCell}>{p.buyer_profile?.completed_deals ?? 0}</td>
                          <td>
                            <span className={`${styles.pill} ${suspended ? styles.pill_danger : styles.pill_green}`}>
                              {suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td>
                            {p.buyer_profile?.verified
                              ? <CheckCircle size={16} className={styles.verifiedIcon} />
                              : <XCircle size={16} className={styles.unverifiedIcon} />}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button type="button" className={styles.pageBtn} disabled={safePage === 0}
                    onClick={() => setPage(safePage - 1)}><ChevronLeft size={14} /></button>
                  <span className={styles.pageInfo}>Page {safePage + 1} of {totalPages}</span>
                  <button type="button" className={styles.pageBtn} disabled={safePage >= totalPages - 1}
                    onClick={() => setPage(safePage + 1)}><ChevronRight size={14} /></button>
                </div>
              )}
            </div>

            {selected && (
              <div className={styles.detailPanel}>
                <div className={styles.detailAvatar}>{selected.full_name.charAt(0).toUpperCase()}</div>
                <div>
                  <h2 className={styles.detailName}>{selected.full_name}</h2>
                  <span className={`${styles.pill} ${isSuspended(selected) ? styles.pill_danger : styles.pill_green}`} style={{ marginTop: 4, display: 'inline-block' }}>
                    {isSuspended(selected) ? 'Suspended' : 'Active'}
                  </span>
                </div>

                <div className={styles.detailTabs}>
                  {(['profile', 'deals', 'transactions', 'complaints'] as DetailTab[]).map(tab => (
                    <button key={tab} type="button"
                      className={`${styles.detailTab} ${detailTab === tab ? styles.detailTabActive : ''}`}
                      onClick={() => setDetailTab(tab)}>
                      {tab === 'profile' && 'Profile'}
                      {tab === 'deals' && `Deals${buyerDeals.length ? ` (${buyerDeals.length})` : ''}`}
                      {tab === 'transactions' && `Txns${buyerEscrow.length ? ` (${buyerEscrow.length})` : ''}`}
                      {tab === 'complaints' && `Issues${buyerComplaints.length ? ` (${buyerComplaints.length})` : ''}`}
                    </button>
                  ))}
                </div>

                {detailTab === 'profile' && (
                  <div className={styles.detailRows}>
                    <DetailRow label="Email" value={selected.email ?? '—'} />
                    <DetailRow label="Phone" value={selected.phone ? `+91 ${selected.phone}` : '—'} />
                    <DetailRow label="Organisation" value={selected.buyer_profile?.org_name ?? '—'} />
                    <DetailRow label="Buyer type" value={selected.buyer_profile?.buyer_type ?? '—'} />
                    <DetailRow label="Location" value={selected.buyer_profile?.location ?? '—'} />
                    <DetailRow label="District" value={selected.buyer_profile?.district ?? '—'} />
                    <DetailRow label="State" value={selected.buyer_profile?.state ?? '—'} />
                    <DetailRow label="Trust score" value={`${selected.buyer_profile?.trust_score ?? 0}%`} />
                    <DetailRow label="Completed deals" value={String(selected.buyer_profile?.completed_deals ?? 0)} />
                    <DetailRow label="Joined" value={new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  </div>
                )}

                {detailTab === 'deals' && (
                  buyerDeals.length === 0
                    ? <p className={styles.muted} style={{ textAlign: 'center', padding: 'var(--space-5)' }}>No deals</p>
                    : <MiniTable
                        head={['Crop', 'Value', 'Status']}
                        rows={buyerDeals.slice(0, 8).map(d => [
                          d.crop,
                          `₹${d.total_value.toLocaleString('en-IN')}`,
                          <span key="s" className={`${styles.pill} ${styles.pill_muted}`} style={{ fontSize: 10 }}>{d.status.replace(/_/g, ' ')}</span>
                        ])}
                        extra={buyerDeals.length > 8 ? `+${buyerDeals.length - 8} more` : undefined}
                      />
                )}

                {detailTab === 'transactions' && (
                  buyerEscrow.length === 0
                    ? <p className={styles.muted} style={{ textAlign: 'center', padding: 'var(--space-5)' }}>No transactions</p>
                    : <MiniTable
                        head={['Amount', 'Status', 'Date']}
                        rows={buyerEscrow.slice(0, 8).map(e => [
                          `₹${e.amount.toLocaleString('en-IN')}`,
                          <span key="s" className={`${styles.pill} ${styles.pill_muted}`} style={{ fontSize: 10 }}>{e.status.replace(/_/g, ' ')}</span>,
                          new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        ])}
                        extra={buyerEscrow.length > 8 ? `+${buyerEscrow.length - 8} more` : undefined}
                      />
                )}

                {detailTab === 'complaints' && (
                  buyerComplaints.length === 0
                    ? <p className={styles.muted} style={{ textAlign: 'center', padding: 'var(--space-5)' }}>No complaints filed</p>
                    : <MiniTable
                        head={['Title', 'Type', 'Status']}
                        rows={buyerComplaints.slice(0, 8).map(g => [
                          g.title.length > 18 ? g.title.slice(0, 18) + '…' : g.title,
                          g.type.replace(/_/g, ' '),
                          <span key="s" className={`${styles.pill} ${styles.pill_muted}`} style={{ fontSize: 10 }}>{g.status}</span>
                        ])}
                        extra={buyerComplaints.length > 8 ? `+${buyerComplaints.length - 8} more` : undefined}
                      />
                )}

                {permissions.canManageUsers && (
                  <div className={styles.detailActions}>
                    <button type="button"
                      className={selected.buyer_profile?.verified ? styles.unverifyBtn : styles.verifyBtn}
                      disabled={verifying}
                      onClick={() => handleVerify(selected.id, !selected.buyer_profile?.verified)}>
                      {verifying ? 'Updating…' : selected.buyer_profile?.verified ? 'Remove verification' : 'Verify buyer'}
                    </button>
                    {isSuspended(selected) ? (
                      <button type="button" className={styles.activateBtn}
                        onClick={() => setConfirmAction({ type: 'reactivate', profile: selected })}>
                        Reactivate account
                      </button>
                    ) : (
                      <button type="button" className={styles.dangerBtn}
                        onClick={() => setConfirmAction({ type: 'suspend', profile: selected })}>
                        Suspend account
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {confirmAction && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmCard}>
              <h3 className={styles.confirmTitle}>
                {confirmAction.type === 'suspend' ? 'Suspend account' : 'Reactivate account'}
              </h3>
              <p className={styles.confirmMsg}>
                {confirmAction.type === 'suspend'
                  ? `Suspend ${confirmAction.profile.full_name}? They will lose access to the platform immediately.`
                  : `Reactivate ${confirmAction.profile.full_name}? They will regain full access to the platform.`}
              </p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.unverifyBtn} onClick={() => setConfirmAction(null)}>Cancel</button>
                <button type="button"
                  className={confirmAction.type === 'suspend' ? styles.dangerBtn : styles.activateBtn}
                  disabled={suspending}
                  onClick={() => handleSuspend(confirmAction.profile, confirmAction.type === 'suspend')}>
                  {suspending ? 'Updating…' : confirmAction.type === 'suspend' ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PermissionGate>
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

function MiniTable({ head, rows, extra }: {
  head: string[]
  rows: (string | JSX.Element)[][]
  extra?: string
}) {
  return (
    <table className={styles.miniTable}>
      <thead>
        <tr>{head.map(h => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={styles.miniTableRow}>
            {row.map((cell, j) => <td key={j}>{cell}</td>)}
          </tr>
        ))}
        {extra && (
          <tr><td colSpan={head.length} className={styles.muted} style={{ padding: '6px 12px' }}>{extra}</td></tr>
        )}
      </tbody>
    </table>
  )
}
