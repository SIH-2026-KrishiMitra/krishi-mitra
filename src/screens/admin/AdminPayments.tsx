import { useState, useMemo } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import type { EscrowStatus } from '../../types'
import styles from './AdminPayments.module.css'

const STATUS_LABELS: Record<EscrowStatus, string> = {
  pending: 'Pending',
  protected: 'Protected',
  release_pending: 'Release pending',
  released: 'Released',
  disputed: 'Disputed',
}

export default function AdminPayments() {
  const { escrow, loading } = useAdmin()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EscrowStatus | 'all'>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => escrow.filter(e => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    const matchSearch = !search || [e.id, e.deal_id, e.farmer?.full_name, e.buyer?.full_name].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
    return matchStatus && matchSearch
  }), [escrow, statusFilter, search])

  const selectedTxn = escrow.find(e => e.id === selected)

  const totalProtected = escrow
    .filter(e => e.status === 'protected' || e.status === 'release_pending')
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>05 · PAYMENTS</p>
            <h1 className={styles.title}>Escrow &amp; payments</h1>
            <p className={styles.subtitle}>₹{totalProtected.toLocaleString('en-IN')} protected in escrow</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} aria-hidden />
            <input type="search" placeholder="Search by transaction ID, deal, farmer, buyer…"
              className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.statusChips}>
            {(['all', 'pending', 'protected', 'release_pending', 'released', 'disputed'] as const).map(s => (
              <button key={s} type="button"
                className={`${styles.chip} ${statusFilter === s ? styles.chipActive : ''}`}
                onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All' : STATUS_LABELS[s as EscrowStatus]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Farmer → Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Deposited</th>
                  <th>Release</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className={styles.loadingRow}>Loading transactions…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className={styles.emptyRow}><ShieldCheck size={20} /> No transactions found</td></tr>
                ) : filtered.map(e => (
                  <tr key={e.id}
                    className={`${styles.tableRow} ${selected === e.id ? styles.tableRowActive : ''}`}
                    onClick={() => setSelected(e.id)}>
                    <td className={styles.idCell}>{e.id.slice(0, 8)}</td>
                    <td className={styles.partyCell}>
                      <span>{e.farmer?.full_name ?? '—'}</span>
                      <span className={styles.partySep}>→</span>
                      <span>{e.buyer?.full_name ?? '—'}</span>
                    </td>
                    <td className={styles.amountCell}>₹{e.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`es_${e.status}`]}`}>
                        {STATUS_LABELS[e.status]}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {e.deposited_at ? new Date(e.deposited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td className={styles.dateCell}>
                      {e.expected_release_date ? new Date(e.expected_release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedTxn && (
            <div className={styles.detailPanel}>
              <div className={styles.detailTop}>
                <p className={styles.detailId}>{selectedTxn.id.slice(0, 8)}…</p>
                <span className={`${styles.statusBadge} ${styles[`es_${selectedTxn.status}`]}`}>
                  {STATUS_LABELS[selectedTxn.status]}
                </span>
              </div>
              <div className={styles.amountDisplay}>
                <p className={styles.amountLabel}>Protected amount</p>
                <p className={styles.amountValue}>₹{selectedTxn.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className={styles.detailRows}>
                <DetailRow label="Farmer" value={selectedTxn.farmer?.full_name ?? '—'} />
                <DetailRow label="Buyer" value={selectedTxn.buyer?.full_name ?? '—'} />
                <DetailRow label="Deal ID" value={selectedTxn.deal_id ? selectedTxn.deal_id.slice(0, 8) + '…' : '—'} />
                <DetailRow label="Transaction ref" value={selectedTxn.transaction_ref ?? '—'} />
                <DetailRow label="Bank account" value={selectedTxn.bank_account ?? '—'} />
                <DetailRow label="Deposited" value={selectedTxn.deposited_at ? new Date(selectedTxn.deposited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                <DetailRow label="Expected release" value={selectedTxn.expected_release_date ? new Date(selectedTxn.expected_release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                <DetailRow label="Released" value={selectedTxn.released_at ? new Date(selectedTxn.released_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
              </div>
              {selectedTxn.dispute_note && (
                <div className={styles.disputeBox}>
                  <p className={styles.disputeLabel}>Dispute note</p>
                  <p className={styles.disputeText}>{selectedTxn.dispute_note}</p>
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
