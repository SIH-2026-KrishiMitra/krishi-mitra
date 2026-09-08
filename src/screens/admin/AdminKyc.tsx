import React, { useState, useEffect, useMemo } from 'react'
import { Search, ClipboardCheck } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import {
  fetchAllKyc, updateKycStatus, fetchKycAuditLogs,
  type KycEntry, type AuditLog,
} from '../../services/supabase/admin'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'

type StatusTab = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminKyc() {
  const { permissions, logAction } = useAdmin()
  const [all, setAll] = useState<KycEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<StatusTab>('pending')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [kycHistory, setKycHistory] = useState<Record<string, AuditLog[]>>({})
  const [historyLoading, setHistoryLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<KycEntry | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    fetchAllKyc()
      .then(setAll)
      .catch(() => toast.error('Failed to load KYC records'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = all
    if (statusTab === 'pending') list = list.filter(e => e.kyc_status === 'pending')
    else if (statusTab === 'approved') list = list.filter(e => e.kyc_status === 'complete')
    else if (statusTab === 'rejected') list = list.filter(e => e.kyc_status === 'not_started')
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        [e.profile?.full_name, e.profile?.phone, e.profile?.email, e.district].some(v => v?.toLowerCase().includes(q))
      )
    }
    return list
  }, [all, statusTab, search])

  const counts = useMemo(() => ({
    pending: all.filter(e => e.kyc_status === 'pending').length,
    approved: all.filter(e => e.kyc_status === 'complete').length,
    rejected: all.filter(e => e.kyc_status === 'not_started').length,
  }), [all])

  async function expandRow(id: string) {
    const next = expandedId === id ? null : id
    setExpandedId(next)
    if (next && !kycHistory[next]) {
      setHistoryLoading(next)
      try {
        const logs = await fetchKycAuditLogs(next)
        setKycHistory(prev => ({ ...prev, [next]: logs }))
      } catch { /* non-fatal */ }
      finally { setHistoryLoading(null) }
    }
  }

  async function handleApprove(id: string) {
    setUpdating(id)
    try {
      await updateKycStatus(id, 'complete')
      await logAction('approve_kyc', 'farmer_profile', id, {})
      setAll(prev => prev.map(e => e.id === id ? { ...e, kyc_status: 'complete' } : e))
      setKycHistory(prev => { const next = { ...prev }; delete next[id]; return next })
      toast.success('KYC approved')
    } catch {
      toast.error('Failed to approve KYC')
    } finally {
      setUpdating(null)
    }
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) return
    const reason = rejectReason.trim()
    if (!reason) { toast.error('Please enter a rejection reason'); return }
    setRejecting(true)
    try {
      await updateKycStatus(rejectTarget.id, 'not_started')
      await logAction('reject_kyc', 'farmer_profile', rejectTarget.id, { reason })
      setAll(prev => prev.map(e => e.id === rejectTarget.id ? { ...e, kyc_status: 'not_started' } : e))
      setKycHistory(prev => { const next = { ...prev }; delete next[rejectTarget.id]; return next })
      setRejectTarget(null)
      setRejectReason('')
      toast.success('KYC rejected')
    } catch {
      toast.error('Failed to reject KYC')
    } finally {
      setRejecting(false)
    }
  }

  const kycStatusClass = (s: string) => {
    if (s === 'complete') return styles.pill_green
    if (s === 'pending') return styles.pill_amber
    return styles.pill_muted
  }

  const kycStatusLabel = (s: string) => {
    if (s === 'complete') return 'Approved'
    if (s === 'pending') return 'Pending'
    return 'Rejected'
  }

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewKyc">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>02 · USER MANAGEMENT</p>
              <h1 className={styles.title}>KYC Verification</h1>
              <p className={styles.subtitle}>{counts.pending} farmers pending · {counts.approved} approved · {counts.rejected} rejected</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              <ClipboardCheck size={16} /> Farmers only — no buyer KYC in system
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search name, phone, email, district…" className={styles.searchInput}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.chips}>
              {([
                ['all', 'All', all.length],
                ['pending', 'Pending', counts.pending],
                ['approved', 'Approved', counts.approved],
                ['rejected', 'Rejected', counts.rejected],
              ] as [StatusTab, string, number][]).map(([val, label, count]) => (
                <button key={val} type="button"
                  className={`${styles.chip} ${statusTab === val ? styles.chipActive : ''}`}
                  onClick={() => setStatusTab(val)}>
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Location</th>
                  <th>Bank account</th>
                  <th>KYC status</th>
                  <th>Joined</th>
                  {permissions.canManageKyc && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className={styles.loadingCell}>Loading KYC records…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className={styles.emptyCell}>No records in this category</td></tr>
                ) : filtered.map(e => {
                  const isExpanded = expandedId === e.id
                  const history = kycHistory[e.id] ?? []
                  return (
                    <React.Fragment key={e.id}>
                      <tr
                        className={styles.tableRow}
                        onClick={() => expandRow(e.id)}
                        style={{ cursor: 'pointer' }}>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.userAvatar}>{(e.profile?.full_name ?? 'F').charAt(0).toUpperCase()}</div>
                            <div>
                              <p className={styles.userName}>{e.profile?.full_name ?? '—'}</p>
                              <p className={styles.muted}>{e.profile?.phone ?? e.profile?.email ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className={styles.muted}>
                          {[e.village, e.district, e.state].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td>
                          {e.bank_account
                            ? <span className={`${styles.pill} ${styles.pill_green}`}>Provided</span>
                            : <span className={`${styles.pill} ${styles.pill_muted}`}>Missing</span>}
                        </td>
                        <td>
                          <span className={`${styles.pill} ${kycStatusClass(e.kyc_status)}`}>
                            {kycStatusLabel(e.kyc_status)}
                          </span>
                        </td>
                        <td className={styles.dateCell}>
                          {e.profile?.created_at
                            ? new Date(e.profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        {permissions.canManageKyc && (
                          <td onClick={ev => ev.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {e.kyc_status !== 'complete' && (
                                <button type="button" className={styles.verifyBtn}
                                  disabled={updating === e.id}
                                  onClick={() => handleApprove(e.id)}>
                                  {updating === e.id ? '…' : 'Approve'}
                                </button>
                              )}
                              {e.kyc_status !== 'not_started' && (
                                <button type="button" className={styles.dangerBtn}
                                  disabled={updating === e.id}
                                  onClick={() => { setRejectTarget(e); setRejectReason('') }}>
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                        {!permissions.canManageKyc && <td />}
                      </tr>

                      {isExpanded && (
                        <tr key={`${e.id}-detail`} className={styles.kycHistoryRow}>
                          <td colSpan={6} className={styles.kycHistoryCell}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                              <div>
                                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)' }}>Profile</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {[
                                    ['Email', e.profile?.email ?? '—'],
                                    ['Phone', e.profile?.phone ?? '—'],
                                    ['Village', e.village ?? '—'],
                                    ['District', e.district ?? '—'],
                                    ['State', e.state ?? '—'],
                                    ['Bank account', e.bank_account ?? 'Not provided'],
                                    ['Documents', 'No upload configured — verified manually'],
                                  ].map(([label, value]) => (
                                    <div key={label} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                                      <span style={{ color: 'var(--text-muted)', minWidth: 100 }}>{label}</span>
                                      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)' }}>Decision history</p>
                                {historyLoading === e.id ? (
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Loading…</p>
                                ) : history.length === 0 ? (
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>No audit history found</p>
                                ) : history.map(log => {
                                  const la = log as { admin?: { full_name: string } | null }
                                  return (
                                    <div key={log.id} style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                                      <span className={`${styles.pill} ${log.action === 'approve_kyc' ? styles.pill_green : styles.pill_danger}`}>
                                        {log.action === 'approve_kyc' ? 'Approved' : 'Rejected'}
                                      </span>
                                      <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)' }}>
                                        {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        {la.admin?.full_name ? ` · by ${la.admin.full_name}` : ''}
                                      </span>
                                      {Boolean(log.details?.reason) && (
                                        <p style={{ color: 'var(--text-secondary)', marginTop: 2, fontStyle: 'italic' }}>
                                          "{String(log.details?.reason ?? '')}"
                                        </p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rejection modal */}
        {rejectTarget && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmCard}>
              <h3 className={styles.confirmTitle}>Reject KYC — {rejectTarget.profile?.full_name}</h3>
              <p className={styles.confirmMsg}>
                This will reset their KYC status. Provide a reason so the farmer knows what to fix.
              </p>
              <textarea
                placeholder="Rejection reason (required)…"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: 'var(--space-3)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-core)', fontSize: 'var(--text-sm)',
                  resize: 'vertical', outline: 'none', background: 'var(--surface-card)',
                }}
              />
              <div className={styles.confirmActions}>
                <button type="button" className={styles.unverifyBtn}
                  onClick={() => { setRejectTarget(null); setRejectReason('') }}>Cancel</button>
                <button type="button" className={styles.dangerBtn}
                  disabled={rejecting || !rejectReason.trim()}
                  onClick={handleRejectConfirm}>
                  {rejecting ? 'Rejecting…' : 'Reject KYC'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PermissionGate>
    </AdminLayout>
  )
}
