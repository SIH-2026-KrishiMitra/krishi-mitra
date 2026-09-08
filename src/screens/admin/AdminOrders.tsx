import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import type { DbDeal, DbDealTransport, DealStatus } from '../../types'
import styles from './AdminTable.module.css'

const PAGE_SIZE = 20

type StatusFilter = 'all' | 'open' | 'delivered' | 'payment_released'
type SortBy = 'newest' | 'oldest' | 'value_desc' | 'value_asc'

type AdminDeal = DbDeal & {
  farmer: { full_name: string } | null
  buyer: { full_name: string } | null
}

const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  offer_accepted: 'Offer accepted',
  money_deposited: 'Payment received',
  transport_assigned: 'Transport arranged',
  pickup_scheduled: 'Pickup scheduled',
  delivered: 'Delivered',
  payment_released: 'Completed',
}

const STATUS_CLASSES: Record<string, string> = {
  offer_accepted: styles.pill_amber,
  money_deposited: styles.pill_blue,
  transport_assigned: styles.pill_indigo,
  pickup_scheduled: styles.pill_indigo,
  delivered: styles.pill_green,
  payment_released: styles.pill_muted,
}

const OPEN_STATUSES: DealStatus[] = ['offer_accepted', 'money_deposited', 'transport_assigned', 'pickup_scheduled']

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => { /* non-fatal */ })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminOrders() {
  const { deals, grievances, escrow, loading, permissions } = useAdmin()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminDeal | null>(null)

  const typedDeals = deals as AdminDeal[]

  const filtered = useMemo(() => {
    let list = typedDeals.filter(d => {
      if (filter === 'open' && !OPEN_STATUSES.includes(d.status)) return false
      if (filter === 'delivered' && d.status !== 'delivered') return false
      if (filter === 'payment_released' && d.status !== 'payment_released') return false
      if (dateFrom && d.created_at < dateFrom) return false
      if (dateTo && d.created_at > dateTo + 'T23:59:59') return false
      if (search) {
        const q = search.toLowerCase()
        if (![d.id, d.crop, d.variety, d.farmer?.full_name, d.buyer?.full_name].some(v => v?.toLowerCase().includes(q))) return false
      }
      return true
    })

    if (sortBy === 'newest') list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))
    else if (sortBy === 'oldest') list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
    else if (sortBy === 'value_desc') list = [...list].sort((a, b) => b.total_value - a.total_value)
    else if (sortBy === 'value_asc') list = [...list].sort((a, b) => a.total_value - b.total_value)

    return list
  }, [typedDeals, filter, sortBy, search, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const active = deals.filter(d => OPEN_STATUSES.includes(d.status)).length
  const completed = deals.filter(d => d.status === 'payment_released').length
  const totalValue = deals.reduce((s, d) => s + (d.total_value ?? 0), 0)

  const relatedComplaints = useMemo(
    () => selected ? grievances.filter(g => g.deal_id === selected.id) : [],
    [selected, grievances]
  )
  const relatedEscrow = useMemo(
    () => selected ? escrow.filter(e => e.deal_id === selected.id) : [],
    [selected, escrow]
  )

  function handleSelect(d: AdminDeal) {
    setSelected(prev => prev?.id === d.id ? null : d)
  }

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewOrders">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>04 · ORDERS & TRANSACTIONS</p>
              <h1 className={styles.title}>Orders</h1>
              <p className={styles.subtitle}>{deals.length} total · {active} active · {completed} completed</p>
            </div>
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{deals.length}</span>
              <span className={styles.summaryLabel}>Total orders</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{active}</span>
              <span className={styles.summaryLabel}>Active</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{completed}</span>
              <span className={styles.summaryLabel}>Completed</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>₹{totalValue.toLocaleString('en-IN')}</span>
              <span className={styles.summaryLabel}>Total value</span>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search order ID, crop, farmer, buyer…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            </div>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 140 }}
              value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="value_desc">Value ↓</option>
              <option value="value_asc">Value ↑</option>
            </select>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.chips}>
              {([
                ['all', 'All'],
                ['open', 'Active'],
                ['delivered', 'Delivered'],
                ['payment_released', 'Completed'],
              ] as [StatusFilter, string][]).map(([f, label]) => (
                <button key={f} type="button"
                  className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}
                  onClick={() => { setFilter(f); setPage(0) }}>
                  {label}
                </button>
              ))}
            </div>
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
                      <th>Order</th>
                      <th>Farmer → Buyer</th>
                      <th>Quantity</th>
                      <th>Total value</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className={styles.loadingCell}>Loading orders…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={6} className={styles.emptyCell}>No orders found</td></tr>
                    ) : paginated.map(d => (
                      <tr key={d.id}
                        className={`${styles.tableRow} ${selected?.id === d.id ? styles.tableRowActive : ''}`}
                        onClick={() => handleSelect(d)}>
                        <td>
                          <p className={styles.userName}>{d.crop} · {d.variety}</p>
                          <p className={styles.monoCell}>{d.id.slice(0, 8)}</p>
                        </td>
                        <td className={styles.muted}>{d.farmer?.full_name ?? '—'} → {d.buyer?.full_name ?? '—'}</td>
                        <td className={styles.numericCell}>{d.quantity} {d.unit}</td>
                        <td className={styles.numericCell}>₹{(d.total_value ?? 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`${styles.pill} ${STATUS_CLASSES[d.status] ?? styles.pill_muted}`}>
                            {DEAL_STATUS_LABELS[d.status] ?? d.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className={styles.dateCell}>{formatDate(d.created_at)}</td>
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
                    <span className={styles.monoCell}>{selected.id}</span>
                    <button type="button" onClick={() => copyText(selected.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      <Copy size={12} />
                    </button>
                  </div>
                  <h2 className={styles.detailName}>{selected.crop} · {selected.variety}</h2>
                  <span className={`${styles.pill} ${STATUS_CLASSES[selected.status] ?? styles.pill_muted}`}>
                    {DEAL_STATUS_LABELS[selected.status] ?? selected.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className={styles.detailRows}>
                  <DetailRow label="Farmer" value={selected.farmer?.full_name ?? '—'} />
                  <DetailRow label="Buyer" value={selected.buyer?.full_name ?? '—'} />
                  <DetailRow label="Quantity" value={`${selected.quantity} ${selected.unit}`} />
                  <DetailRow label="Price / unit" value={`₹${selected.price_per_unit.toLocaleString('en-IN')}`} />
                  <DetailRow label="Total value" value={`₹${selected.total_value.toLocaleString('en-IN')}`} />
                  <DetailRow label="Escrow amount" value={selected.escrow_amount ? `₹${selected.escrow_amount.toLocaleString('en-IN')}` : '—'} />
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Lot ID</span>
                    <span className={styles.crossRefId} onClick={() => copyText(selected.lot_id)} title="Click to copy">
                      {selected.lot_id} <Copy size={10} style={{ display: 'inline', marginLeft: 4 }} />
                    </span>
                  </div>
                  <DetailRow label="Order date" value={formatDate(selected.created_at)} />
                  <DetailRow label="Last updated" value={formatDate(selected.updated_at)} />
                </div>

                {selected.transport && (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>Transport</p>
                    <div className={styles.detailRows}>
                      <DetailRow label="Vehicle" value={(selected.transport as DbDealTransport).vehicle_number || '—'} />
                      <DetailRow label="Driver" value={(selected.transport as DbDealTransport).driver_name || '—'} />
                      <DetailRow label="Driver phone" value={(selected.transport as DbDealTransport).driver_phone || '—'} />
                      <DetailRow label="Pickup date" value={(selected.transport as DbDealTransport).pickup_date || '—'} />
                      <DetailRow label="Est. delivery" value={(selected.transport as DbDealTransport).estimated_delivery || '—'} />
                    </div>
                  </div>
                )}

                {selected.timeline && selected.timeline.length > 0 && (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>Timeline</p>
                    <div className={styles.timelineList}>
                      {selected.timeline.map((ev, i) => (
                        <div key={i} className={styles.timelineItem}>
                          <div className={`${styles.timelineDot} ${ev.timestamp ? styles.timelineDotActive : ''}`} />
                          <div>
                            <p className={styles.timelineLabel}>{ev.label || ev.status.replace(/_/g, ' ')}</p>
                            {ev.timestamp && <p className={styles.timelineDate}>{formatDateTime(ev.timestamp)}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {relatedEscrow.length > 0 && (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>Escrow</p>
                    {relatedEscrow.map(e => (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                        <span className={styles.crossRefId} onClick={() => copyText(e.id)} title="Click to copy">{e.id.slice(0, 12)}…</span>
                        <span className={`${styles.pill} ${e.status === 'released' ? styles.pill_green : e.status === 'disputed' ? styles.pill_danger : styles.pill_amber}`}>{e.status.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {relatedComplaints.length > 0 && (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>
                      Complaints ({relatedComplaints.length})
                    </p>
                    {relatedComplaints.map(g => (
                      <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                        <span className={styles.crossRefId} onClick={() => copyText(g.id)} title="Click to copy">{g.id}</span>
                        <span className={styles.muted}>{g.type.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
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
