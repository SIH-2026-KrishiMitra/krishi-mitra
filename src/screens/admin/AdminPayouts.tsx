import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import type { DbEscrowTransaction } from '../../types'
import styles from './AdminTable.module.css'

const PAGE_SIZE = 20

type StatusFilter = 'all' | 'release_pending' | 'released'

type AdminEscrow = DbEscrowTransaction & {
  farmer: { full_name: string } | null
  buyer: { full_name: string } | null
  lot_info: { crop: string; grade: string; variety: string } | null
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminPayouts() {
  const { escrow, profiles, loading, permissions } = useAdmin()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [farmerFilter, setFarmerFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminEscrow | null>(null)

  const typedEscrow = escrow as AdminEscrow[]

  const payouts = useMemo(
    () => typedEscrow.filter(e => ['release_pending', 'released'].includes(e.status)),
    [typedEscrow]
  )

  const uniqueFarmers = useMemo(() => {
    const names = new Set(payouts.map(e => e.farmer?.full_name).filter(Boolean) as string[])
    return Array.from(names).sort()
  }, [payouts])

  const filtered = useMemo(() => {
    return payouts.filter(e => {
      if (filter !== 'all' && e.status !== filter) return false
      if (farmerFilter && e.farmer?.full_name !== farmerFilter) return false
      if (dateFrom && e.expected_release_date && e.expected_release_date < dateFrom) return false
      if (dateTo && e.expected_release_date && e.expected_release_date > dateTo + 'T23:59:59') return false
      if (search) {
        const q = search.toLowerCase()
        if (![e.transaction_ref, e.farmer?.full_name, e.id].some(v => v?.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [payouts, filter, search, farmerFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const pending = payouts.filter(e => e.status === 'release_pending')
  const released = payouts.filter(e => e.status === 'released')
  const pendingTotal = pending.reduce((s, e) => s + (e.amount ?? 0), 0)
  const releasedTotal = released.reduce((s, e) => s + (e.amount ?? 0), 0)

  function getFarmerBankDetails(farmerId: string) {
    const p = profiles.find(p => p.id === farmerId)
    return p?.farmer_profile ?? null
  }

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewFinancials">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>04 · ORDERS & TRANSACTIONS</p>
              <h1 className={styles.title}>Farmer Payouts</h1>
              <p className={styles.subtitle}>Pending and completed farmer payments</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <Info size={14} />
            Payouts release automatically when deal status reaches payment_released. No manual trigger required.
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{pending.length}</span>
              <span className={styles.summaryLabel}>Pending payouts</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>₹{pendingTotal.toLocaleString('en-IN')}</span>
              <span className={styles.summaryLabel}>Pending amount</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{released.length}</span>
              <span className={styles.summaryLabel}>Released</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>₹{releasedTotal.toLocaleString('en-IN')}</span>
              <span className={styles.summaryLabel}>Released amount</span>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search ref, farmer…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.chips}>
              {([
                ['all', 'All'],
                ['release_pending', 'Pending release'],
                ['released', 'Released'],
              ] as [StatusFilter, string][]).map(([f, label]) => (
                <button key={f} type="button"
                  className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}
                  onClick={() => { setFilter(f); setPage(0) }}>
                  {label}
                </button>
              ))}
            </div>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 180 }}
              value={farmerFilter} onChange={e => { setFarmerFilter(e.target.value); setPage(0) }}>
              <option value="">All farmers</option>
              {uniqueFarmers.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <span className={styles.filterLabel}>Expected from</span>
            <input type="date" className={styles.searchInput} style={{ flex: 'none', width: 'auto' }}
              value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }} />
            <span className={styles.filterLabel}>To</span>
            <input type="date" className={styles.searchInput} style={{ flex: 'none', width: 'auto' }}
              value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }} />
          </div>

          <div className={styles.contentGrid}>
            <div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Farmer</th>
                      <th>Buyer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Deposited</th>
                      <th>Expected release</th>
                      <th>Released</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className={styles.loadingCell}>Loading payouts…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={8} className={styles.emptyCell}>No payouts found</td></tr>
                    ) : paginated.map(e => (
                      <tr key={e.id}
                        className={`${styles.tableRow} ${selected?.id === e.id ? styles.tableRowActive : ''}`}
                        onClick={() => setSelected(prev => prev?.id === e.id ? null : e)}>
                        <td className={styles.monoCell}>{e.transaction_ref ?? e.id.slice(0, 12)}</td>
                        <td className={styles.userName}>{e.farmer?.full_name ?? '—'}</td>
                        <td className={styles.muted}>{e.buyer?.full_name ?? '—'}</td>
                        <td className={styles.numericCell}>₹{(e.amount ?? 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`${styles.pill} ${e.status === 'released' ? styles.pill_green : styles.pill_amber}`}>
                            {e.status === 'released' ? 'Released' : 'Pending release'}
                          </span>
                        </td>
                        <td className={styles.dateCell}>
                          {e.deposited_at ? new Date(e.deposited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                        <td className={styles.dateCell}>
                          {e.expected_release_date ? new Date(e.expected_release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                        <td className={styles.dateCell}>
                          {e.released_at ? new Date(e.released_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                      </tr>
                    ))}
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
                <div>
                  <p className={styles.monoCell}>{selected.transaction_ref ?? selected.id.slice(0, 16)}</p>
                  <span className={`${styles.pill} ${selected.status === 'released' ? styles.pill_green : styles.pill_amber}`}>
                    {selected.status === 'released' ? 'Released' : 'Pending release'}
                  </span>
                </div>

                <div className={styles.detailRows}>
                  <DetailRow label="Farmer" value={selected.farmer?.full_name ?? '—'} />
                  <DetailRow label="Buyer (depositor)" value={selected.buyer?.full_name ?? '—'} />
                  <DetailRow label="Amount" value={`₹${selected.amount.toLocaleString('en-IN')}`} />
                  {selected.lot_info && <DetailRow label="Crop" value={`${selected.lot_info.crop} · ${selected.lot_info.variety}`} />}
                  <DetailRow label="Deposited" value={formatDate(selected.deposited_at)} />
                  <DetailRow label="Expected release" value={formatDate(selected.expected_release_date)} />
                  <DetailRow label="Released" value={formatDate(selected.released_at)} />
                </div>

                {(() => {
                  const bank = getFarmerBankDetails(selected.farmer_id)
                  if (!bank?.bank_account) return (
                    <p className={styles.muted} style={{ fontSize: 'var(--text-xs)' }}>Farmer bank details not on file</p>
                  )
                  return (
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>Farmer bank details</p>
                      <div className={styles.detailRows}>
                        <DetailRow label="Account" value={bank.bank_account} />
                        {bank.ifsc && <DetailRow label="IFSC" value={bank.ifsc} />}
                        {bank.bank_name && <DetailRow label="Bank" value={bank.bank_name} />}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
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
