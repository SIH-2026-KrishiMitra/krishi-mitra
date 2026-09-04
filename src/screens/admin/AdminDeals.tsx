import { useState, useMemo } from 'react'
import { Search, Handshake } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import styles from './AdminDeals.module.css'

type StatusFilter = 'all' | 'offer_accepted' | 'money_deposited' | 'transport_assigned' | 'pickup_scheduled' | 'delivered' | 'payment_released'

const STATUS_LABELS: Record<string, string> = {
  offer_accepted: 'Offer accepted',
  money_deposited: 'Money deposited',
  transport_assigned: 'Transport assigned',
  pickup_scheduled: 'Pickup scheduled',
  delivered: 'Delivered',
  payment_released: 'Payment released',
}

export default function AdminDeals() {
  const { deals, loading } = useAdmin()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => deals.filter(d => {
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    const matchSearch = !search || [d.id, d.crop, d.variety, d.farmer?.full_name, d.buyer?.full_name].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
    return matchStatus && matchSearch
  }), [deals, statusFilter, search])

  const selectedDeal = deals.find(d => d.id === selected)

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>04 · DEALS</p>
            <h1 className={styles.title}>Deal monitoring</h1>
            <p className={styles.subtitle}>{deals.filter(d => d.status !== 'payment_released').length} active</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} aria-hidden />
            <input type="search" placeholder="Search by deal ID, crop, farmer, buyer…"
              className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.statusChips}>
            {(['all', 'offer_accepted', 'money_deposited', 'transport_assigned', 'pickup_scheduled', 'delivered', 'payment_released'] as StatusFilter[]).map(s => (
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
                  <th>Deal ID</th>
                  <th>Farmer → Buyer</th>
                  <th>Crop</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className={styles.loadingRow}>Loading deals…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className={styles.emptyRow}><Handshake size={20} /> No deals found</td></tr>
                ) : filtered.map(d => (
                  <tr key={d.id}
                    className={`${styles.tableRow} ${selected === d.id ? styles.tableRowActive : ''}`}
                    onClick={() => setSelected(d.id)}>
                    <td className={styles.idCell}>{d.id.slice(0, 8)}</td>
                    <td className={styles.partyCell}>
                      <span className={styles.partyName}>{d.farmer?.full_name ?? '—'}</span>
                      <span className={styles.partySep}>→</span>
                      <span className={styles.partyName}>{d.buyer?.full_name ?? '—'}</span>
                    </td>
                    <td className={styles.cropCell}>{d.crop} <span className={styles.variety}>{d.variety}</span></td>
                    <td className={styles.valueCell}>₹{d.total_value.toLocaleString('en-IN')}</td>
                    <td><span className={`${styles.statusBadge} ${styles[`ds_${d.status}`]}`}>{STATUS_LABELS[d.status] ?? d.status}</span></td>
                    <td className={styles.dateCell}>{new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedDeal && (
            <div className={styles.detailPanel}>
              <div className={styles.detailTop}>
                <p className={styles.detailId}>{selectedDeal.id.slice(0, 8)}…</p>
                <span className={`${styles.statusBadge} ${styles[`ds_${selectedDeal.status}`]}`}>
                  {STATUS_LABELS[selectedDeal.status] ?? selectedDeal.status}
                </span>
              </div>
              <h2 className={styles.detailCrop}>{selectedDeal.crop} — {selectedDeal.variety}</h2>
              <div className={styles.detailRows}>
                <DetailRow label="Farmer" value={selectedDeal.farmer?.full_name ?? '—'} />
                <DetailRow label="Buyer" value={selectedDeal.buyer?.full_name ?? '—'} />
                <DetailRow label="Quantity" value={`${selectedDeal.quantity} ${selectedDeal.unit}`} />
                <DetailRow label="Price/unit" value={`₹${selectedDeal.price_per_unit.toLocaleString('en-IN')}`} />
                <DetailRow label="Total value" value={`₹${selectedDeal.total_value.toLocaleString('en-IN')}`} />
                <DetailRow label="Escrow amount" value={`₹${selectedDeal.escrow_amount?.toLocaleString('en-IN') ?? '—'}`} />
                <DetailRow label="Lot ID" value={selectedDeal.lot_id} />
                <DetailRow label="Created" value={new Date(selectedDeal.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>
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
