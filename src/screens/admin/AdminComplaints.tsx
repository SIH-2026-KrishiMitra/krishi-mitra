import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import {
  setGrievancePriority, appendGrievanceNote, updateGrievanceStatus, assignGrievance,
  type GrievancePriority, type AdminNote,
} from '../../services/supabase/admin'
import type { DbGrievance, ComplaintStatus, ComplaintType } from '../../types'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'
import { useAuth } from '../../context/AuthContext'

const PAGE_SIZE = 20

type StatusFilter = 'all' | 'submitted' | 'under_review' | 'evidence_requested' | 'resolution' | 'closed'
type TypeFilter = 'all' | ComplaintType
type PriorityFilter = 'all' | GrievancePriority
type SortBy = 'newest' | 'oldest'

type AdminGrievance = DbGrievance & {
  reporter: { full_name: string } | null
  priority?: GrievancePriority
  admin_notes?: AdminNote[]
}

const TYPE_LABELS: Record<ComplaintType, string> = {
  weight_dispute: 'Quantity mismatch',
  quality_dispute: 'Product quality',
  payment_issue: 'Payment',
  transport_issue: 'Delivery',
  other: 'Other',
}

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  evidence_requested: 'Evidence requested',
  resolution: 'Resolved',
  closed: 'Closed',
}

const STATUS_CLASSES: Record<ComplaintStatus, string> = {
  submitted: styles.pill_amber,
  under_review: styles.pill_blue,
  evidence_requested: styles.pill_purple,
  resolution: styles.pill_green,
  closed: styles.pill_muted,
}

const PRIORITY_CLASSES: Record<GrievancePriority, string> = {
  urgent: styles.priority_urgent,
  high: styles.priority_high,
  medium: styles.priority_medium,
  low: styles.priority_low,
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => { /* non-fatal */ })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminComplaints() {
  const { grievances, loading, permissions, logAction } = useAdmin()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AdminGrievance | null>(null)
  const [localGrievances, setLocalGrievances] = useState<Map<string, Partial<AdminGrievance>>>(new Map())

  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [updatingPriority, setUpdatingPriority] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusNote, setStatusNote] = useState('')
  const [assigning, setAssigning] = useState(false)

  const typedGrievances = grievances as AdminGrievance[]

  function getG(g: AdminGrievance): AdminGrievance {
    const local = localGrievances.get(g.id)
    return local ? { ...g, ...local } : g
  }

  const filtered = useMemo(() => {
    let list = typedGrievances.map(getG).filter(g => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false
      if (typeFilter !== 'all' && g.type !== typeFilter) return false
      if (priorityFilter !== 'all' && (g.priority ?? 'medium') !== priorityFilter) return false
      if (dateFrom && g.created_at < dateFrom) return false
      if (dateTo && g.created_at > dateTo + 'T23:59:59') return false
      if (search) {
        const q = search.toLowerCase()
        if (![g.id, g.title, g.reporter?.full_name].some(v => v?.toLowerCase().includes(q))) return false
      }
      return true
    })
    if (sortBy === 'newest') list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))
    else list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
    return list
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedGrievances, statusFilter, typeFilter, priorityFilter, sortBy, search, dateFrom, dateTo, localGrievances])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const openCount = typedGrievances.filter(g => !['resolution', 'closed'].includes(g.status)).length

  function updateLocal(id: string, patch: Partial<AdminGrievance>) {
    setLocalGrievances(prev => new Map(prev).set(id, { ...prev.get(id), ...patch }))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...patch } : null)
  }

  async function handleSetPriority(priority: GrievancePriority) {
    if (!selected) return
    setUpdatingPriority(true)
    try {
      await setGrievancePriority(selected.id, priority)
      await logAction('set_priority', 'grievance', selected.id, { priority })
      updateLocal(selected.id, { priority })
      toast.success(`Priority set to ${priority}`)
    } catch {
      toast.error('Failed to update priority')
    } finally {
      setUpdatingPriority(false)
    }
  }

  async function handleChangeStatus(status: ComplaintStatus) {
    if (!selected) return
    setUpdatingStatus(true)
    const note = statusNote.trim() || undefined
    try {
      await updateGrievanceStatus(selected.id, status, note)
      await logAction('update_complaint_status', 'grievance', selected.id, { status, note })
      updateLocal(selected.id, { status, ...(note ? { resolution_note: note } : {}) })
      setStatusNote('')
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleAssignToSelf() {
    if (!selected || !user) return
    setAssigning(true)
    try {
      await assignGrievance(selected.id, user.id)
      await logAction('assign_complaint', 'grievance', selected.id, { assigned_to: user.id })
      updateLocal(selected.id, { assigned_to: user.id })
      toast.success('Assigned to you')
    } catch {
      toast.error('Failed to assign')
    } finally {
      setAssigning(false)
    }
  }

  async function handleAddNote() {
    if (!selected || !newNote.trim() || !user) return
    setAddingNote(true)
    try {
      const adminName = 'Admin'
      const updated = await appendGrievanceNote(selected.id, newNote.trim(), adminName)
      await logAction('add_internal_note', 'grievance', selected.id, {})
      updateLocal(selected.id, { admin_notes: updated })
      setNewNote('')
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  const selectedFull = selected ? getG(selected) : null

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewComplaints">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>05 · SUPPORT</p>
              <h1 className={styles.title}>Complaints</h1>
              <p className={styles.subtitle}>{openCount} open · {typedGrievances.length} total</p>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search ID, title, reporter…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            </div>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 140 }}
              value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div className={styles.toolbar}>
            <span className={styles.filterLabel}>Status</span>
            <div className={styles.chips}>
              {([
                ['all', 'All'],
                ['submitted', 'Submitted'],
                ['under_review', 'Under review'],
                ['evidence_requested', 'Evidence requested'],
                ['resolution', 'Resolved'],
                ['closed', 'Closed'],
              ] as [StatusFilter, string][]).map(([f, label]) => (
                <button key={f} type="button"
                  className={`${styles.chip} ${statusFilter === f ? styles.chipActive : ''}`}
                  onClick={() => { setStatusFilter(f); setPage(0) }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbar}>
            <span className={styles.filterLabel}>Type</span>
            <div className={styles.chips}>
              {([
                ['all', 'All'],
                ['quality_dispute', 'Product quality'],
                ['weight_dispute', 'Quantity mismatch'],
                ['payment_issue', 'Payment'],
                ['transport_issue', 'Delivery'],
                ['other', 'Other'],
              ] as [TypeFilter, string][]).map(([f, label]) => (
                <button key={f} type="button"
                  className={`${styles.chip} ${typeFilter === f ? styles.chipActive : ''}`}
                  onClick={() => { setTypeFilter(f); setPage(0) }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbar}>
            <span className={styles.filterLabel}>Priority</span>
            <div className={styles.chips}>
              {([
                ['all', 'All'],
                ['urgent', 'Urgent'],
                ['high', 'High'],
                ['medium', 'Medium'],
                ['low', 'Low'],
              ] as [PriorityFilter, string][]).map(([f, label]) => (
                <button key={f} type="button"
                  className={`${styles.chip} ${priorityFilter === f ? styles.chipActive : ''}`}
                  onClick={() => { setPriorityFilter(f); setPage(0) }}>
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
                      <th>ID</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Reporter</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className={styles.loadingCell}>Loading complaints…</td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={7} className={styles.emptyCell}>No complaints found</td></tr>
                    ) : paginated.map(g => {
                      const priority = (g.priority ?? 'medium') as GrievancePriority
                      return (
                        <tr key={g.id}
                          className={`${styles.tableRow} ${selectedFull?.id === g.id ? styles.tableRowActive : ''}`}
                          onClick={() => setSelected(prev => prev?.id === g.id ? null : g)}>
                          <td className={styles.monoCell}>{g.id}</td>
                          <td className={styles.userName}>{g.title}</td>
                          <td className={styles.muted}>{TYPE_LABELS[g.type] ?? g.type.replace(/_/g, ' ')}</td>
                          <td className={styles.muted}>{g.reporter?.full_name ?? '—'}</td>
                          <td>
                            <span className={`${styles.priorityBadge} ${PRIORITY_CLASSES[priority]}`}>
                              {priority}
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.pill} ${STATUS_CLASSES[g.status] ?? styles.pill_muted}`}>
                              {STATUS_LABELS[g.status] ?? g.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className={styles.dateCell}>{formatDate(g.created_at)}</td>
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

            {selectedFull && (
              <div className={styles.detailPanel}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={styles.crossRefId} onClick={() => copyText(selectedFull.id)} title="Click to copy">
                      {selectedFull.id} <Copy size={10} style={{ display: 'inline', marginLeft: 4 }} />
                    </span>
                  </div>
                  <h2 className={styles.detailName} style={{ fontSize: 'var(--text-base)', margin: '4px 0' }}>{selectedFull.title}</h2>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    <span className={`${styles.pill} ${STATUS_CLASSES[selectedFull.status]}`}>
                      {STATUS_LABELS[selectedFull.status]}
                    </span>
                    <span className={`${styles.priorityBadge} ${PRIORITY_CLASSES[(selectedFull.priority ?? 'medium') as GrievancePriority]}`}>
                      {selectedFull.priority ?? 'medium'}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRows}>
                  <DetailRow label="Reporter" value={selectedFull.reporter?.full_name ?? '—'} />
                  <DetailRow label="Type" value={TYPE_LABELS[selectedFull.type] ?? selectedFull.type.replace(/_/g, ' ')} />
                  <DetailRow label="Assigned to" value={selectedFull.assigned_to ? 'Assigned' : 'Unassigned'} />
                  {selectedFull.deal_id && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Deal ID</span>
                      <span className={styles.crossRefId} onClick={() => copyText(selectedFull.deal_id!)} title="Click to copy">
                        {selectedFull.deal_id!.slice(0, 12)}… <Copy size={10} style={{ display: 'inline', marginLeft: 4 }} />
                      </span>
                    </div>
                  )}
                  {selectedFull.lot_id && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Lot ID</span>
                      <span className={styles.crossRefId} onClick={() => copyText(selectedFull.lot_id!)} title="Click to copy">
                        {selectedFull.lot_id} <Copy size={10} style={{ display: 'inline', marginLeft: 4 }} />
                      </span>
                    </div>
                  )}
                  {selectedFull.escrow_amount != null && (
                    <DetailRow label="Escrow affected" value={`₹${selectedFull.escrow_amount.toLocaleString('en-IN')}`} />
                  )}
                  <DetailRow label="Submitted" value={formatDate(selectedFull.created_at)} />
                </div>

                {selectedFull.description && (
                  <div style={{ padding: 'var(--space-3)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Description</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedFull.description}</p>
                  </div>
                )}

                {selectedFull.evidence_urls && selectedFull.evidence_urls.length > 0 && (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>
                      Evidence ({selectedFull.evidence_urls.length})
                    </p>
                    <div className={styles.evidenceGrid}>
                      {selectedFull.evidence_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={styles.evidenceItem}>
                          File {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFull.timeline && selectedFull.timeline.length > 0 && (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>Timeline</p>
                    <div className={styles.timelineList}>
                      {selectedFull.timeline.map((ev, i) => (
                        <div key={i} className={styles.timelineItem}>
                          <div className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                          <div>
                            <p className={styles.timelineLabel}>{ev.label || ev.status.replace(/_/g, ' ')}</p>
                            <p className={styles.timelineDate}>{formatDateTime(ev.timestamp)}</p>
                            {ev.detail && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{ev.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFull.resolution_note && (
                  <div style={{ padding: 'var(--space-3)', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--green-600, #146B4A)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Resolution note</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{selectedFull.resolution_note}</p>
                  </div>
                )}

                {permissions.canManageComplaints && (
                  <>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>Set priority</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['urgent', 'high', 'medium', 'low'] as GrievancePriority[]).map(p => (
                          <button key={p} type="button"
                            className={`${styles.priorityBadge} ${PRIORITY_CLASSES[p]}`}
                            style={{ border: `2px solid ${(selectedFull.priority ?? 'medium') === p ? '#374151' : 'transparent'}`, cursor: 'pointer', fontFamily: 'var(--font-core)' }}
                            disabled={updatingPriority}
                            onClick={() => handleSetPriority(p)}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-2)' }}>Change status</p>
                      <textarea
                        value={statusNote}
                        onChange={e => setStatusNote(e.target.value)}
                        placeholder="Optional resolution note…"
                        rows={2}
                        className={styles.noteInput}
                        style={{ marginBottom: 'var(--space-2)' }}
                      />
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['under_review', 'evidence_requested', 'resolution', 'closed'] as ComplaintStatus[]).map(s => (
                          <button key={s} type="button" className={styles.unverifyBtn}
                            style={{ fontSize: 'var(--text-xs)', padding: '4px 10px' }}
                            disabled={updatingStatus || selectedFull.status === s}
                            onClick={() => handleChangeStatus(s)}>
                            → {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailActions}>
                      <button type="button" className={styles.verifyBtn}
                        disabled={assigning || !!selectedFull.assigned_to}
                        onClick={handleAssignToSelf}>
                        {assigning ? '…' : selectedFull.assigned_to ? 'Already assigned' : 'Assign to me'}
                      </button>
                    </div>

                    <div className={styles.notesSection}>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)' }}>
                        Internal notes ({(selectedFull.admin_notes ?? []).length})
                      </p>
                      {(selectedFull.admin_notes ?? []).length > 0 && (
                        <div className={styles.notesList}>
                          {(selectedFull.admin_notes ?? []).map((n, i) => (
                            <div key={i} className={styles.noteItem}>
                              <p className={styles.noteText}>{n.note}</p>
                              <p className={styles.noteMeta}>{n.admin} · {formatDateTime(n.at)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={styles.noteForm}>
                        <textarea
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder="Add internal note (not visible to farmer/buyer)…"
                          rows={2}
                          className={styles.noteInput}
                        />
                        <button type="button" className={styles.verifyBtn}
                          disabled={addingNote || !newNote.trim()}
                          onClick={handleAddNote}
                          style={{ alignSelf: 'flex-end' }}>
                          {addingNote ? 'Adding…' : 'Add note'}
                        </button>
                      </div>
                    </div>
                  </>
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
