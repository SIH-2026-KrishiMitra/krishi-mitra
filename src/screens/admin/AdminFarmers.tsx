import { useState, useMemo } from 'react'
import { Search, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import { setUserSuspended, type AdminProfile } from '../../services/supabase/admin'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'

const PAGE_SIZE = 20

type KycFilter = 'all' | 'verified' | 'unverified' | 'kyc_pending'
type StatusFilter = 'all' | 'active' | 'suspended'
type SortBy = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'kyc'
type DetailTab = 'profile' | 'lots' | 'deals' | 'transactions' | 'complaints'

export default function AdminFarmers() {
  const { profiles, lots, deals, escrow, grievances, loading, verifyUser, permissions, logAction } = useAdmin()
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState<KycFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [districtFilter, setDistrictFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminProfile | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('profile')
  const [verifying, setVerifying] = useState(false)
  const [suspending, setSuspending] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'reactivate'; profile: AdminProfile } | null>(null)
  const [localSuspend, setLocalSuspend] = useState<Map<string, boolean>>(new Map())

  const farmers = useMemo(() => profiles.filter(p => p.role === 'farmer'), [profiles])

  const districts = useMemo(() =>
    Array.from(new Set(farmers.map(f => f.farmer_profile?.district).filter((d): d is string => !!d))).sort(),
    [farmers])

  const states = useMemo(() =>
    Array.from(new Set(farmers.map(f => f.farmer_profile?.state).filter((s): s is string => !!s))).sort(),
    [farmers])

  const isSuspended = (p: AdminProfile) =>
    localSuspend.has(p.id) ? localSuspend.get(p.id)! : p.suspended

  const filtered = useMemo(() => {
    let list = farmers.filter(p => {
      const fp = p.farmer_profile
      const suspended = localSuspend.has(p.id) ? localSuspend.get(p.id)! : p.suspended
      if (statusFilter === 'active' && suspended) return false
      if (statusFilter === 'suspended' && !suspended) return false
      if (kycFilter === 'verified' && !fp?.verified) return false
      if (kycFilter === 'unverified' && fp?.verified) return false
      if (kycFilter === 'kyc_pending' && fp?.kyc_status === 'complete') return false
      if (districtFilter && fp?.district !== districtFilter) return false
      if (stateFilter && fp?.state !== stateFilter) return false
      if (dateFrom && p.created_at < dateFrom) return false
      if (dateTo && p.created_at > dateTo + 'T23:59:59') return false
      const q = search.toLowerCase()
      if (q && ![p.full_name, p.email, p.phone, fp?.village, fp?.district].some(v => v?.toLowerCase().includes(q))) return false
      return true
    })
    if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.full_name.localeCompare(b.full_name))
    else if (sortBy === 'name_desc') list = [...list].sort((a, b) => b.full_name.localeCompare(a.full_name))
    else if (sortBy === 'newest') list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))
    else if (sortBy === 'oldest') list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
    else if (sortBy === 'kyc') list = [...list].sort((a, b) => (a.farmer_profile?.kyc_status ?? '').localeCompare(b.farmer_profile?.kyc_status ?? ''))
    return list
  }, [farmers, search, kycFilter, statusFilter, districtFilter, stateFilter, sortBy, dateFrom, dateTo, localSuspend])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const farmerLots = useMemo(() => selected ? lots.filter(l => l.farmer_id === selected.id) : [], [selected, lots])
  const farmerDeals = useMemo(() => selected ? deals.filter(d => d.farmer_id === selected.id) : [], [selected, deals])
  const farmerEscrow = useMemo(() => selected ? escrow.filter(e => e.farmer_id === selected.id) : [], [selected, escrow])
  const farmerComplaints = useMemo(() => selected ? grievances.filter(g => g.reporter_id === selected.id) : [], [selected, grievances])

  function resetPage() { setPage(0) }

  async function handleVerify(id: string, verified: boolean) {
    setVerifying(true)
    try { await verifyUser(id, 'farmer', verified) }
    catch { toast.error('Failed to update verification') }
    finally { setVerifying(false) }
  }

  async function handleSuspend(profile: AdminProfile, suspend: boolean) {
    setSuspending(true)
    try {
      await setUserSuspended(profile.id, suspend)
      await logAction(suspend ? 'suspend_user' : 'reactivate_user', 'profile', profile.id, { name: profile.full_name, role: 'farmer' })
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
              <h1 className={styles.title}>Farmers</h1>
              <p className={styles.subtitle}>{filtered.length} of {farmers.length} farmers</p>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search name, email, phone, village…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); resetPage() }} />
            </div>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 140 }}
              value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
              <option value="kyc">KYC status</option>
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
              <span className={styles.filterLabel}>KYC:</span>
              {(['all', 'verified', 'unverified', 'kyc_pending'] as KycFilter[]).map(f => (
                <button key={f} type="button"
                  className={`${styles.chip} ${kycFilter === f ? styles.chipActive : ''}`}
                  onClick={() => { setKycFilter(f); resetPage() }}>
                  {f === 'all' ? 'All' : f === 'verified' ? 'Verified' : f === 'unverified' ? 'Unverified' : 'KYC Pending'}
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
              <input type="date" className={styles.searchInput} style={{ flex: 'none', width: 'auto' }}
                value={dateFrom} onChange={e => { setDateFrom(e.target.value); resetPage() }} />
              <input type="date" className={styles.searchInput} style={{ flex: 'none', width: 'auto' }}
                value={dateTo} onChange={e => { setDateTo(e.target.value); resetPage() }} />
            </div>
          )}

          <div className={styles.contentGrid}>
            <div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>KYC</th>
                      <th>Status</th>
                      <th>Verified</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className={styles.loadingCell}>Loading farmers…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={6} className={styles.emptyCell}>No farmers found</td></tr>
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
                          <td className={styles.muted}>
                            {[p.farmer_profile?.village, p.farmer_profile?.district].filter(Boolean).join(', ') || '—'}
                          </td>
                          <td><KycChip status={p.farmer_profile?.kyc_status ?? null} /></td>
                          <td>
                            <span className={`${styles.pill} ${suspended ? styles.pill_danger : styles.pill_green}`}>
                              {suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td>
                            {p.farmer_profile?.verified
                              ? <CheckCircle size={16} className={styles.verifiedIcon} />
                              : <XCircle size={16} className={styles.unverifiedIcon} />}
                          </td>
                          <td className={styles.dateCell}>
                            {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                  {(['profile', 'lots', 'deals', 'transactions', 'complaints'] as DetailTab[]).map(tab => (
                    <button key={tab} type="button"
                      className={`${styles.detailTab} ${detailTab === tab ? styles.detailTabActive : ''}`}
                      onClick={() => setDetailTab(tab)}>
                      {tab === 'profile' && 'Profile'}
                      {tab === 'lots' && `Lots${farmerLots.length ? ` (${farmerLots.length})` : ''}`}
                      {tab === 'deals' && `Deals${farmerDeals.length ? ` (${farmerDeals.length})` : ''}`}
                      {tab === 'transactions' && `Txns${farmerEscrow.length ? ` (${farmerEscrow.length})` : ''}`}
                      {tab === 'complaints' && `Issues${farmerComplaints.length ? ` (${farmerComplaints.length})` : ''}`}
                    </button>
                  ))}
                </div>

                {detailTab === 'profile' && (
                  <div className={styles.detailRows}>
                    <DetailRow label="Email" value={selected.email ?? '—'} />
                    <DetailRow label="Phone" value={selected.phone ? `+91 ${selected.phone}` : '—'} />
                    <DetailRow label="Village" value={selected.farmer_profile?.village ?? '—'} />
                    <DetailRow label="District" value={selected.farmer_profile?.district ?? '—'} />
                    <DetailRow label="State" value={selected.farmer_profile?.state ?? '—'} />
                    <DetailRow label="KYC status" value={(selected.farmer_profile?.kyc_status ?? 'pending').replace(/_/g, ' ')} />
                    <DetailRow label="Bank account" value={selected.farmer_profile?.bank_account ?? 'Not provided'} />
                    <DetailRow label="Bank / IFSC" value={[selected.farmer_profile?.bank_name, selected.farmer_profile?.ifsc].filter(Boolean).join(' · ') || '—'} />
                    <DetailRow label="Joined" value={new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  </div>
                )}

                {detailTab === 'lots' && (
                  farmerLots.length === 0
                    ? <p className={styles.muted} style={{ textAlign: 'center', padding: 'var(--space-5)' }}>No lots listed</p>
                    : <MiniTable
                        head={['Lot ID', 'Crop', 'Status', 'Qty']}
                        rows={farmerLots.slice(0, 8).map(l => [
                          l.id.slice(-6), l.crop,
                          <span key="s" className={`${styles.pill} ${styles.pill_muted}`} style={{ fontSize: 10 }}>{l.status.replace(/_/g, ' ')}</span>,
                          `${l.quantity} ${l.unit}`
                        ])}
                        extra={farmerLots.length > 8 ? `+${farmerLots.length - 8} more` : undefined}
                      />
                )}

                {detailTab === 'deals' && (
                  farmerDeals.length === 0
                    ? <p className={styles.muted} style={{ textAlign: 'center', padding: 'var(--space-5)' }}>No deals</p>
                    : <MiniTable
                        head={['Crop', 'Value', 'Status']}
                        rows={farmerDeals.slice(0, 8).map(d => [
                          d.crop,
                          `₹${d.total_value.toLocaleString('en-IN')}`,
                          <span key="s" className={`${styles.pill} ${styles.pill_muted}`} style={{ fontSize: 10 }}>{d.status.replace(/_/g, ' ')}</span>
                        ])}
                        extra={farmerDeals.length > 8 ? `+${farmerDeals.length - 8} more` : undefined}
                      />
                )}

                {detailTab === 'transactions' && (
                  farmerEscrow.length === 0
                    ? <p className={styles.muted} style={{ textAlign: 'center', padding: 'var(--space-5)' }}>No transactions</p>
                    : <MiniTable
                        head={['Amount', 'Status', 'Date']}
                        rows={farmerEscrow.slice(0, 8).map(e => [
                          `₹${e.amount.toLocaleString('en-IN')}`,
                          <span key="s" className={`${styles.pill} ${styles.pill_muted}`} style={{ fontSize: 10 }}>{e.status.replace(/_/g, ' ')}</span>,
                          new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        ])}
                        extra={farmerEscrow.length > 8 ? `+${farmerEscrow.length - 8} more` : undefined}
                      />
                )}

                {detailTab === 'complaints' && (
                  farmerComplaints.length === 0
                    ? <p className={styles.muted} style={{ textAlign: 'center', padding: 'var(--space-5)' }}>No complaints filed</p>
                    : <MiniTable
                        head={['Title', 'Type', 'Status']}
                        rows={farmerComplaints.slice(0, 8).map(g => [
                          g.title.length > 18 ? g.title.slice(0, 18) + '…' : g.title,
                          g.type.replace(/_/g, ' '),
                          <span key="s" className={`${styles.pill} ${styles.pill_muted}`} style={{ fontSize: 10 }}>{g.status}</span>
                        ])}
                        extra={farmerComplaints.length > 8 ? `+${farmerComplaints.length - 8} more` : undefined}
                      />
                )}

                {permissions.canManageUsers && (
                  <div className={styles.detailActions}>
                    <button type="button"
                      className={selected.farmer_profile?.verified ? styles.unverifyBtn : styles.verifyBtn}
                      disabled={verifying}
                      onClick={() => handleVerify(selected.id, !selected.farmer_profile?.verified)}>
                      {verifying ? 'Updating…' : selected.farmer_profile?.verified ? 'Remove verification' : 'Verify farmer'}
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

function KycChip({ status }: { status: string | null }) {
  const s = status ?? 'not_started'
  const map: Record<string, string> = { complete: styles.pill_green, pending: styles.pill_amber, not_started: styles.pill_muted }
  return <span className={`${styles.pill} ${map[s] ?? styles.pill_muted}`}>{s.replace(/_/g, ' ')}</span>
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
