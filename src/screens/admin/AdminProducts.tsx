import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import { setLotStatus } from '../../services/supabase/admin'
import type { DbLot } from '../../types'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'

const PAGE_SIZE = 20

type StatusFilter = 'all' | 'listed' | 'active' | 'completed' | 'draft'
type SortBy = 'newest' | 'oldest' | 'price_desc' | 'price_asc' | 'qty_desc' | 'name_asc'

type AdminLot = DbLot & { farmer: { full_name: string } | null }

const STATUS_CLASSES: Record<string, string> = {
  draft: styles.pill_muted,
  listed: styles.pill_green,
  offers_received: styles.pill_blue,
  deal_accepted: styles.pill_amber,
  in_transit: styles.pill_amber,
  delivered: styles.pill_indigo,
  completed: styles.pill_green,
}

export default function AdminProducts() {
  const { lots, loading, permissions, logAction, adminSubRole } = useAdmin()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminLot | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<AdminLot | null>(null)
  const [deactivating, setDeactivating] = useState(false)
  const [localStatus, setLocalStatus] = useState<Map<string, string>>(new Map())

  const canManage = adminSubRole === 'super_admin' || adminSubRole === null

  const getLotStatus = (l: AdminLot) => localStatus.get(l.id) ?? l.status

  const filtered = useMemo(() => {
    let list = (lots as AdminLot[]).filter(l => {
      const status = getLotStatus(l)
      if (filter === 'listed' && !['listed', 'offers_received'].includes(status)) return false
      if (filter === 'active' && !['deal_accepted', 'in_transit', 'delivered'].includes(status)) return false
      if (filter === 'completed' && status !== 'completed') return false
      if (filter === 'draft' && status !== 'draft') return false
      if (search) {
        const q = search.toLowerCase()
        if (![l.crop, l.variety, l.farmer?.full_name, l.mandi].some(v => v?.toLowerCase().includes(q))) return false
      }
      return true
    })

    if (sortBy === 'newest') list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))
    else if (sortBy === 'oldest') list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.expected_price - a.expected_price)
    else if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.expected_price - b.expected_price)
    else if (sortBy === 'qty_desc') list = [...list].sort((a, b) => b.quantity - a.quantity)
    else if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.crop.localeCompare(b.crop))

    return list
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lots, filter, search, sortBy, localStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  async function handleDeactivate(lot: AdminLot) {
    setDeactivating(true)
    const previousStatus = getLotStatus(lot)
    try {
      await setLotStatus(lot.id, 'draft')
      await logAction('deactivate_lot', 'lot', lot.id, { previousStatus, crop: lot.crop, farmer: lot.farmer?.full_name })
      setLocalStatus(prev => new Map(prev).set(lot.id, 'draft'))
      if (selected?.id === lot.id) setSelected(prev => prev ? { ...prev, status: 'draft' } : null)
      setDeactivateTarget(null)
      toast.success('Listing removed from marketplace')
    } catch {
      toast.error('Failed to deactivate listing')
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewMarketplace">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>03 · MARKETPLACE</p>
              <h1 className={styles.title}>Lots / Products</h1>
              <p className={styles.subtitle}>{filtered.length} of {lots.length} total lots</p>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search crop, farmer, mandi…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            </div>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 140 }}
              value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_desc">Price ↓</option>
              <option value="price_asc">Price ↑</option>
              <option value="qty_desc">Quantity ↓</option>
              <option value="name_asc">Crop A–Z</option>
            </select>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.chips}>
              {([
                ['all', 'All'],
                ['listed', 'Listed'],
                ['active', 'In progress'],
                ['completed', 'Completed'],
                ['draft', 'Draft'],
              ] as [StatusFilter, string][]).map(([f, label]) => (
                <button key={f} type="button"
                  className={`${styles.chip} ${filter === f ? styles.chipActive : ''}`}
                  onClick={() => { setFilter(f); setPage(0) }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.contentGrid}>
            <div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Lot ID</th>
                      <th>Crop</th>
                      <th>Farmer</th>
                      <th>Quantity</th>
                      <th>Expected price</th>
                      <th>Status</th>
                      <th>Listed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className={styles.loadingCell}>Loading products…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={7} className={styles.emptyCell}>No products found</td></tr>
                    ) : paginated.map(l => {
                      const status = getLotStatus(l)
                      return (
                        <tr key={l.id}
                          className={`${styles.tableRow} ${selected?.id === l.id ? styles.tableRowActive : ''}`}
                          onClick={() => setSelected(l)}>
                          <td className={styles.monoCell}>{l.id}</td>
                          <td>
                            <p className={styles.userName}>{l.crop}</p>
                            <p className={styles.muted}>{l.variety} · Grade {l.grade}</p>
                          </td>
                          <td className={styles.muted}>{l.farmer?.full_name ?? '—'}</td>
                          <td className={styles.numericCell}>{l.quantity} {l.unit}</td>
                          <td className={styles.numericCell}>₹{l.expected_price.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`${styles.pill} ${STATUS_CLASSES[status] ?? styles.pill_muted}`}>
                              {status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className={styles.dateCell}>
                            {new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                  <div>
                    <p className={styles.monoCell}>{selected.id}</p>
                    <h2 className={styles.detailName} style={{ marginTop: 4 }}>{selected.crop}</h2>
                    <span className={`${styles.pill} ${STATUS_CLASSES[getLotStatus(selected)] ?? styles.pill_muted}`}>
                      {getLotStatus(selected).replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Images */}
                {selected.image_urls.length > 0 ? (
                  <div className={styles.imageGrid}>
                    {selected.image_urls.slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt={`${selected.crop} ${i + 1}`} className={styles.imageThumb}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-4)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <ImageOff size={16} style={{ color: 'var(--text-muted)' }} />
                    <span className={styles.muted}>No images uploaded</span>
                  </div>
                )}

                <div className={styles.detailRows}>
                  <DetailRow label="Variety" value={selected.variety || '—'} />
                  <DetailRow label="Grade" value={`Grade ${selected.grade}`} />
                  <DetailRow label="Quantity" value={`${selected.quantity} ${selected.unit}`} />
                  <DetailRow label="Expected price" value={`₹${selected.expected_price.toLocaleString('en-IN')} / ${selected.unit}`} />
                  <DetailRow label="Mandi" value={selected.mandi || '—'} />
                  <DetailRow label="Payment" value={selected.payment_mode === 'escrow' ? 'Escrow protected' : 'Direct'} />
                  <DetailRow label="Assaying" value={selected.assaying ? 'Yes' : 'No'} />
                  <DetailRow label="Selling method" value={selected.selling_method === 'fpo_pool' ? 'FPO pool' : 'Direct sale'} />
                  <DetailRow label="Farmer" value={selected.farmer?.full_name ?? '—'} />
                  <DetailRow label="Listed" value={new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                </div>

                {selected.description && (
                  <div style={{ padding: 'var(--space-3)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Description</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selected.description}</p>
                  </div>
                )}

                {canManage && getLotStatus(selected) !== 'draft' && (
                  <div className={styles.detailActions}>
                    <button type="button" className={styles.dangerBtn}
                      onClick={() => setDeactivateTarget(selected)}>
                      Remove from marketplace
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {deactivateTarget && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmCard}>
              <h3 className={styles.confirmTitle}>Remove listing</h3>
              <p className={styles.confirmMsg}>
                Remove <strong>{deactivateTarget.crop}</strong> (Lot {deactivateTarget.id}) from the marketplace?
                The lot will be set back to draft and hidden from buyers. The farmer can re-list it themselves.
              </p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.unverifyBtn} onClick={() => setDeactivateTarget(null)}>Cancel</button>
                <button type="button" className={styles.dangerBtn}
                  disabled={deactivating}
                  onClick={() => handleDeactivate(deactivateTarget)}>
                  {deactivating ? 'Removing…' : 'Remove listing'}
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
