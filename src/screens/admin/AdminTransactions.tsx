import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import type { DbEscrowTransaction, EscrowStatus } from '../../types'
import styles from './AdminTable.module.css'

const PAGE_SIZE = 20

type StatusFilter = 'all' | 'pending' | 'protected' | 'release_pending' | 'released' | 'disputed'
type SortBy = 'newest' | 'amount_desc' | 'amount_asc'

type AdminEscrow = DbEscrowTransaction & {
  farmer: { full_name: string } | null
  buyer: { full_name: string } | null
  lot_info: { crop: string; grade: string; variety: string } | null
}

const STATUS_LABELS: Record<EscrowStatus, string> = {
  pending: 'Awaiting deposit',
  protected: 'Funds held',
  release_pending: 'Pending release',
  released: 'Released',
  disputed: 'Disputed',
}

const STATUS_CLASSES: Record<EscrowStatus, string> = {
  pending: styles.pill_muted,
  protected: styles.pill_blue,
  release_pending: styles.pill_amber,
  released: styles.pill_green,
  disputed: styles.pill_danger,
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => { /* non-fatal */ })
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminTransactions() {
  const { escrow, profiles, loading, permissions } = useAdmin()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [farmerFilter, setFarmerFilter] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminEscrow | null>(null)

  const typedEscrow = escrow as AdminEscrow[]

  const uniqueFarmers = useMemo(() => {
    const names = new Set(typedEscrow.map(e => e.farmer?.full_name).filter(Boolean) as string[])
    return Array.from(names).sort()
  }, [typedEscrow])

  const filtered = useMemo(() => {
    let list = typedEscrow.filter(e => {
      if (filter !== 'all' && e.status !== filter) return false
      if (farmerFilter && e.farmer?.full_name !== farmerFilter) return false
      if (dateFrom && e.deposited_at && e.deposited_at < dateFrom) return false
      if (dateTo && e.deposited_at && e.deposited_at > dateTo + 'T23:59:59') return false
      if (search) {
        const q = search.toLowerCase()
        if (![e.transaction_ref, e.farmer?.full_name, e.buyer?.full_name, e.id].some(v => v?.toLowerCase().includes(q))) return false
      }
      return true
    })

    if (sortBy === 'newest') list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))
    else if (sortBy === 'amount_desc') list = [...list].sort((a, b) => b.amount - a.amount)
    else if (sortBy === 'amount_asc') list = [...list].sort((a, b) => a.amount - b.amount)

    return list
  }, [typedEscrow, filter, sortBy, search, dateFrom, dateTo, farmerFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const totalProtected = escrow.filter(e => e.status === 'protected').reduce((s, e) => s + (e.amount ?? 0), 0)
  const totalReleased = escrow.filter(e => e.status === 'released').reduce((s, e) => s + (e.amount ?? 0), 0)

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
              <h1 className={styles.title}>Transactions</h1>
              <p className={styles.subtitle}>{escrow.length} escrow records total</p>
            </div>
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{escrow.length}</span>
              <span className={styles.summaryLabel}>Total</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>₹{totalProtected.toLocaleString('en-IN')}</span>
              <span className={styles.summaryLabel}>Funds held</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>₹{totalReleased.toLocaleString('en-IN')}</span>
              <span className={styles.summaryLabel}>Released</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{escrow.filter(e => e.status === 'disputed').length}</span>
              <span className={styles.summaryLabel}>Disputed</span>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search ref, farmer, buyer…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            </div>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 140 }}
              value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest first</option>
              <option value="amount_desc">Amount ↓</option>
              <option value="amount_asc">Amount ↑</option>
            </select>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.chips}>
              {([
                ['all', 'All'],
                ['pending', 'Awaiting'],
                ['protected', 'Held'],
                ['release_pending', 'Pending release'],
                ['released', 'Released'],
                ['disputed', 'Disputed'],
              ] as [StatusFilter, string][]).map(([f, label]) => (
                <button key={f} type="button"
                  className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}
                  onClick={() => { setFilter(f); setPage(0) }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbar}>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 180 }}
              value={farmerFilter} onChange={e => { setFarmerFilter(e.target.value); setPage(0) }}>
              <option value="">All farmers</option>
              {uniqueFarmers.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <span className={styles.filterLabel}>From</span>
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
                      <th>Farmer → Buyer</th>
                      <th>Crop</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Deposited</th>
                      <th>Released</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className={styles.loadingCell}>Loading transactions…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={7} className={styles.emptyCell}>No transactions found</td></tr>
                    ) : paginated.map(e => (
                      <tr key={e.id}
                        className={`${styles.tableRow} ${selected?.id === e.id ? styles.tableRowActive : ''}`}
                        onClick={() => setSelected(prev => prev?.id === e.id ? null : e)}>
                        <td className={styles.monoCell}>{e.transaction_ref ?? e.id.slice(0, 12)}</td>
                        <td className={styles.muted}>{e.farmer?.full_name ?? '—'} → {e.buyer?.full_name ?? '—'}</td>
                        <td className={styles.muted}>{e.lot_info?.crop ?? '—'}</td>
                        <td className={styles.numericCell}>₹{(e.amount ?? 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`${styles.pill} ${STATUS_CLASSES[e.status]}`}>
                            {STATUS_LABELS[e.status]}
                          </span>
                        </td>
                        <td className={styles.dateCell}>{formatDate(e.deposited_at)}</td>
                        <td className={styles.dateCell}>{formatDate(e.released_at)}</td>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={styles.monoCell}>{selected.transaction_ref ?? selected.id.slice(0, 16)}</span>
                    <button type="button" onClick={() => copyText(selected.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      <Copy size={12} />
                    </button>
                  </div>
                  <span className={`${styles.pill} ${STATUS_CLASSES[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>

                <div className={styles.detailRows}>
                  <DetailRow label="Farmer" value={selected.farmer?.full_name ?? '—'} />
                  <DetailRow label="Buyer" value={selected.buyer?.full_name ?? '—'} />
                  <DetailRow label="Amount" value={`₹${selected.amount.toLocaleString('en-IN')}`} />
                  {selected.lot_info && <DetailRow label="Crop" value={`${selected.lot_info.crop} · ${selected.lot_info.variety}`} />}
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Deal ID</span>
                    <span className={styles.crossRefId} onClick={() => copyText(selected.deal_id)} title="Click to copy">
                      {selected.deal_id.slice(0, 12)}… <Copy size={10} style={{ display: 'inline', marginLeft: 4 }} />
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Lot ID</span>
                    <span className={styles.crossRefId} onClick={() => copyText(selected.lot_id)} title="Click to copy">
                      {selected.lot_id} <Copy size={10} style={{ display: 'inline', marginLeft: 4 }} />
                    </span>
                  </div>
                  <DetailRow label="Deposited" value={formatDate(selected.deposited_at)} />
                  <DetailRow label="Expected release" value={formatDate(selected.expected_release_date)} />
                  <DetailRow label="Released" value={formatDate(selected.released_at)} />
                  {selected.dispute_note && <DetailRow label="Dispute note" value={selected.dispute_note} />}
                </div>

                {(() => {
                  const bank = getFarmerBankDetails(selected.farmer_id)
                  if (!bank?.bank_account) return null
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
