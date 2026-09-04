import { useState, useMemo } from 'react'
import { Search, Package } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import styles from './AdminLots.module.css'

type StatusFilter = 'all' | 'listed' | 'offers_received' | 'deal_in_progress' | 'sold' | 'draft' | 'cancelled'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  listed: 'Listed',
  offers_received: 'Offers received',
  deal_in_progress: 'Deal in progress',
  sold: 'Sold',
  cancelled: 'Cancelled',
}

export default function AdminLots() {
  const { lots, loading } = useAdmin()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => lots.filter(l => {
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    const matchSearch = !search || [l.id, l.crop, l.variety, l.mandi, l.farmer?.full_name].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
    return matchStatus && matchSearch
  }), [lots, statusFilter, search])

  const selectedLot = lots.find(l => l.id === selected)

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>03 · LOTS</p>
            <h1 className={styles.title}>Lot listings</h1>
            <p className={styles.subtitle}>{lots.filter(l => l.status === 'listed' || l.status === 'offers_received').length} active</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} aria-hidden />
            <input type="search" placeholder="Search by lot ID, crop, farmer, mandi…"
              className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.statusChips}>
            {(['all', 'listed', 'offers_received', 'deal_in_progress', 'sold', 'draft', 'cancelled'] as StatusFilter[]).map(s => (
              <button key={s} type="button"
                className={`${styles.chip} ${statusFilter === s ? styles.chipActive : ''}`}
                onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Lot ID</th>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Grade</th>
                  <th>Qty</th>
                  <th>Price/qtl</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className={styles.loadingRow}>Loading lots…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className={styles.emptyRow}><Package size={20} /> No lots found</td></tr>
                ) : filtered.map(l => (
                  <tr key={l.id}
                    className={`${styles.tableRow} ${selected === l.id ? styles.tableRowActive : ''}`}
                    onClick={() => setSelected(l.id)}>
                    <td className={styles.idCell}>{l.id}</td>
                    <td className={styles.nameCell}>{l.farmer?.full_name ?? '—'}</td>
                    <td className={styles.cropCell}>{l.crop} <span className={styles.variety}>{l.variety}</span></td>
                    <td><span className={`${styles.gradeBadge} ${styles[`grade_${l.grade}`]}`}>{l.grade}</span></td>
                    <td className={styles.numCell}>{l.quantity} {l.unit}</td>
                    <td className={styles.numCell}>₹{l.expected_price.toLocaleString('en-IN')}</td>
                    <td><span className={`${styles.statusBadge} ${styles[`ls_${l.status}`]}`}>{STATUS_LABELS[l.status] ?? l.status}</span></td>
                    <td className={styles.dateCell}>{new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedLot && (
            <div className={styles.detailPanel}>
              <div className={styles.detailTop}>
                <p className={styles.detailId}>{selectedLot.id}</p>
                <span className={`${styles.statusBadge} ${styles[`ls_${selectedLot.status}`]}`}>
                  {STATUS_LABELS[selectedLot.status] ?? selectedLot.status}
                </span>
              </div>
              <h2 className={styles.detailCrop}>{selectedLot.crop} — {selectedLot.variety}</h2>
              <div className={styles.detailRows}>
                <DetailRow label="Farmer" value={selectedLot.farmer?.full_name ?? '—'} />
                <DetailRow label="Grade" value={selectedLot.grade} />
                <DetailRow label="Quantity" value={`${selectedLot.quantity} ${selectedLot.unit}`} />
                <DetailRow label="Expected price" value={`₹${selectedLot.expected_price.toLocaleString('en-IN')}/qtl`} />
                <DetailRow label="Mandi" value={selectedLot.mandi ?? '—'} />
                <DetailRow label="Payment mode" value={selectedLot.payment_mode ?? '—'} />
                <DetailRow label="Assaying" value={selectedLot.assaying ? 'Yes' : 'No'} />
                <DetailRow label="Created" value={new Date(selectedLot.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>
              {selectedLot.description && (
                <div className={styles.descBox}>
                  <p className={styles.descLabel}>Description</p>
                  <p className={styles.descText}>{selectedLot.description}</p>
                </div>
              )}
              {selectedLot.image_urls?.length > 0 && (
                <div className={styles.imagesGrid}>
                  {selectedLot.image_urls.slice(0, 4).map((url: string, i: number) => (
                    <img key={i} src={url} alt="" className={styles.lotImage} />
                  ))}
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
