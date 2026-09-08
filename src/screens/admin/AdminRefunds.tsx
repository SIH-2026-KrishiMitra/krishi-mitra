import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import { updateEscrowStatus } from '../../services/supabase/admin'
import type { DbEscrowTransaction, EscrowStatus } from '../../types'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'

const PAGE_SIZE = 20

type AdminEscrow = DbEscrowTransaction & {
  farmer: { full_name: string } | null
  buyer: { full_name: string } | null
  lot_info: { crop: string; grade: string; variety: string } | null
}

type ConfirmAction = {
  type: 'approve' | 'reject'
  escrow: AdminEscrow
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => { /* non-fatal */ })
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminRefunds() {
  const { escrow, grievances, profiles, loading, permissions, logAction } = useAdmin()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminEscrow | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const [localStatus, setLocalStatus] = useState<Map<string, EscrowStatus>>(new Map())

  const typedEscrow = escrow as AdminEscrow[]

  const getStatus = (e: AdminEscrow): EscrowStatus =>
    localStatus.get(e.id) ?? e.status

  const refunds = useMemo(() => {
    let list = typedEscrow.filter(e => getStatus(e) === 'disputed')
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e => [e.transaction_ref, e.farmer?.full_name, e.buyer?.full_name, e.id].some(v => v?.toLowerCase().includes(q)))
    }
    if (dateFrom) list = list.filter(e => !e.deposited_at || e.deposited_at >= dateFrom)
    if (dateTo) list = list.filter(e => !e.deposited_at || e.deposited_at <= dateTo + 'T23:59:59')
    return list
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedEscrow, search, dateFrom, dateTo, localStatus])

  const totalPages = Math.max(1, Math.ceil(refunds.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = refunds.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const totalDisputed = refunds.reduce((s, e) => s + (e.amount ?? 0), 0)

  const relatedGrievance = useMemo(
    () => selected ? grievances.find(g => g.deal_id === selected.deal_id) ?? null : null,
    [selected, grievances]
  )

  function getFarmerBankDetails(farmerId: string) {
    const p = profiles.find(p => p.id === farmerId)
    return p?.farmer_profile ?? null
  }

  async function handleConfirm() {
    if (!confirmAction) return
    const reason = actionNote.trim()
    if (!reason) { toast.error('Please enter a reason'); return }

    setProcessing(true)
    const { escrow: e, type } = confirmAction
    const newStatus: EscrowStatus = type === 'approve' ? 'released' : 'protected'
    try {
      await updateEscrowStatus(e.id, newStatus, reason)
      await logAction(
        type === 'approve' ? 'approve_refund' : 'reject_refund',
        'escrow_transaction',
        e.id,
        { amount: e.amount, farmer: e.farmer?.full_name, buyer: e.buyer?.full_name, reason }
      )
      setLocalStatus(prev => new Map(prev).set(e.id, newStatus))
      if (selected?.id === e.id) setSelected(null)
      setConfirmAction(null)
      setActionNote('')
      toast.success(type === 'approve' ? 'Refund approved — escrow marked released' : 'Refund rejected — escrow restored')
    } catch {
      toast.error('Failed to process refund decision')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewFinancials">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>04 · ORDERS & TRANSACTIONS</p>
              <h1 className={styles.title}>Refunds</h1>
              <p className={styles.subtitle}>Disputed escrow transactions requiring admin review</p>
            </div>
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{refunds.length}</span>
              <span className={styles.summaryLabel}>Disputed</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>₹{totalDisputed.toLocaleString('en-IN')}</span>
              <span className={styles.summaryLabel}>Amount at risk</span>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search ref, farmer, buyer…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
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
                      <th>Reference</th>
                      <th>Farmer → Buyer</th>
                      <th>Amount</th>
                      <th>Dispute note</th>
                      <th>Deposited</th>
                      {permissions.canManageFinancials && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className={styles.loadingCell}>Loading…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={6} className={styles.emptyCell}>No disputed transactions</td></tr>
                    ) : paginated.map(e => (
                      <tr key={e.id}
                        className={`${styles.tableRow} ${selected?.id === e.id ? styles.tableRowActive : ''}`}
                        onClick={() => setSelected(prev => prev?.id === e.id ? null : e)}>
                        <td className={styles.monoCell}>{e.transaction_ref ?? e.id.slice(0, 12)}</td>
                        <td className={styles.muted}>{e.farmer?.full_name ?? '—'} → {e.buyer?.full_name ?? '—'}</td>
                        <td className={styles.numericCell}>₹{(e.amount ?? 0).toLocaleString('en-IN')}</td>
                        <td className={styles.muted} style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.dispute_note ?? '—'}
                        </td>
                        <td className={styles.dateCell}>{formatDate(e.deposited_at)}</td>
                        {permissions.canManageFinancials && (
                          <td onClick={ev => ev.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button type="button" className={styles.activateBtn}
                                onClick={() => { setConfirmAction({ type: 'approve', escrow: e }); setActionNote('') }}>
                                Approve
                              </button>
                              <button type="button" className={styles.dangerBtn}
                                onClick={() => { setConfirmAction({ type: 'reject', escrow: e }); setActionNote('') }}>
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                        {!permissions.canManageFinancials && <td />}
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
                  <span className={`${styles.pill} ${styles.pill_danger}`}>Disputed</span>
                </div>

                <div className={styles.detailRows}>
                  <DetailRow label="Farmer" value={selected.farmer?.full_name ?? '—'} />
                  <DetailRow label="Buyer" value={selected.buyer?.full_name ?? '—'} />
                  <DetailRow label="Amount at risk" value={`₹${selected.amount.toLocaleString('en-IN')}`} />
                  {selected.lot_info && <DetailRow label="Crop" value={`${selected.lot_info.crop} · ${selected.lot_info.variety}`} />}
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Deal ID</span>
                    <span className={styles.crossRefId} onClick={() => copyText(selected.deal_id)} title="Click to copy">
                      {selected.deal_id.slice(0, 12)}… <Copy size={10} style={{ display: 'inline', marginLeft: 4 }} />
                    </span>
                  </div>
                  <DetailRow label="Deposited" value={formatDate(selected.deposited_at)} />
                </div>

                {selected.dispute_note && (
                  <div style={{ padding: 'var(--space-3)', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: '#dc2626', fontWeight: 'var(--fw-semibold)', marginBottom: 4 }}>Dispute note</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{selected.dispute_note}</p>
                  </div>
                )}

                {relatedGrievance && (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>Related complaint</p>
                    <div className={styles.detailRows}>
                      <DetailRow label="Complaint ID" value={relatedGrievance.id} />
                      <DetailRow label="Type" value={relatedGrievance.type.replace(/_/g, ' ')} />
                      <DetailRow label="Status" value={relatedGrievance.status.replace(/_/g, ' ')} />
                    </div>
                  </div>
                )}

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

                {permissions.canManageFinancials && (
                  <div className={styles.detailActions}>
                    <button type="button" className={styles.activateBtn}
                      onClick={() => { setConfirmAction({ type: 'approve', escrow: selected }); setActionNote('') }}>
                      Approve refund
                    </button>
                    <button type="button" className={styles.dangerBtn}
                      onClick={() => { setConfirmAction({ type: 'reject', escrow: selected }); setActionNote('') }}>
                      Reject refund
                    </button>
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
                {confirmAction.type === 'approve' ? 'Approve refund' : 'Reject refund'} — {confirmAction.escrow.farmer?.full_name}
              </h3>
              <p className={styles.confirmMsg}>
                {confirmAction.type === 'approve'
                  ? `Mark ₹${confirmAction.escrow.amount.toLocaleString('en-IN')} as released to the farmer. This records the refund decision — actual bank transfer must be completed separately.`
                  : `Reject this dispute and restore the escrow to held status. The deal may continue. Provide a clear reason for both parties.`
                }
              </p>
              <textarea
                placeholder="Reason (required)…"
                value={actionNote}
                onChange={e => setActionNote(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-core)', fontSize: 'var(--text-sm)',
                  resize: 'vertical', outline: 'none', background: 'var(--surface-card)',
                }}
              />
              <div className={styles.confirmActions}>
                <button type="button" className={styles.unverifyBtn}
                  onClick={() => { setConfirmAction(null); setActionNote('') }}>Cancel</button>
                <button
                  type="button"
                  className={confirmAction.type === 'approve' ? styles.activateBtn : styles.dangerBtn}
                  disabled={processing || !actionNote.trim()}
                  onClick={handleConfirm}>
                  {processing ? 'Processing…' : confirmAction.type === 'approve' ? 'Approve refund' : 'Reject refund'}
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
