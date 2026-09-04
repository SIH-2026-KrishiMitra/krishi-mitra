import { useState } from 'react'
import { AlertTriangle, UserCheck } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { useAuth } from '../../context/AuthContext'
import type { ComplaintStatus } from '../../types'
import styles from './AdminGrievances.module.css'

const STATUS_OPTIONS: ComplaintStatus[] = ['submitted', 'under_review', 'evidence_requested', 'resolution', 'closed']

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  evidence_requested: 'Evidence requested',
  resolution: 'Resolution',
  closed: 'Closed',
}

export default function AdminGrievances() {
  const { grievances, loading, resolveGrievance, assignToSelf } = useAdmin()
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('under_review')
  const [updating, setUpdating] = useState(false)

  const filtered = grievances.filter(g => statusFilter === 'all' || g.status === statusFilter)
  const selectedGrievance = grievances.find(g => g.id === selected)

  async function handleUpdate() {
    if (!selected) return
    setUpdating(true)
    await resolveGrievance(selected, newStatus, resolutionNote || undefined)
    setUpdating(false)
    setResolutionNote('')
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>06 · GRIEVANCES</p>
            <h1 className={styles.title}>Grievances &amp; disputes</h1>
            <p className={styles.subtitle}>{grievances.filter(g => ['submitted', 'under_review', 'evidence_requested'].includes(g.status)).length} open</p>
          </div>
        </div>

        <div className={styles.statusChips}>
          {(['all', ...STATUS_OPTIONS] as const).map(s => (
            <button key={s} type="button"
              className={`${styles.chip} ${statusFilter === s ? styles.chipActive : ''}`}
              onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : STATUS_LABELS[s as ComplaintStatus]}
            </button>
          ))}
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.grievanceList}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skeleton} />)
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <AlertTriangle size={24} />
                <p>No grievances with this status</p>
              </div>
            ) : filtered.map(g => (
              <div key={g.id}
                className={`${styles.grievanceCard} ${selected === g.id ? styles.grievanceCardActive : ''}`}
                onClick={() => { setSelected(g.id); setNewStatus(g.status) }}>
                <div className={styles.grievanceCardTop}>
                  <div>
                    <p className={styles.grievanceTitle}>{g.title}</p>
                    <p className={styles.grievanceMeta}>
                      #{g.id} · {g.reporter?.full_name ?? '—'} ·{' '}
                      {new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`gs_${g.status}`]}`}>
                    {STATUS_LABELS[g.status]}
                  </span>
                </div>
                {g.assigned_to === user?.id && (
                  <p className={styles.assignedToMe}><UserCheck size={12} /> Assigned to you</p>
                )}
              </div>
            ))}
          </div>

          {selectedGrievance && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailTitle}>{selectedGrievance.title}</h2>
                  <p className={styles.detailId}>#{selectedGrievance.id} · {selectedGrievance.type.replace(/_/g, ' ')}</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[`gs_${selectedGrievance.status}`]}`}>
                  {STATUS_LABELS[selectedGrievance.status]}
                </span>
              </div>

              <div className={styles.detailRows}>
                <DetailRow label="Reporter" value={selectedGrievance.reporter?.full_name ?? '—'} />
                <DetailRow label="Submitted" value={new Date(selectedGrievance.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                {selectedGrievance.deal_id && <DetailRow label="Deal" value={selectedGrievance.deal_id.slice(0, 8)} />}
                {selectedGrievance.escrow_amount && <DetailRow label="Escrow at risk" value={`₹${selectedGrievance.escrow_amount.toLocaleString('en-IN')}`} />}
              </div>

              <div className={styles.descBox}>
                <p className={styles.descLabel}>Description</p>
                <p className={styles.descText}>{selectedGrievance.description}</p>
              </div>

              {selectedGrievance.resolution_note && (
                <div className={styles.resolutionBox}>
                  <p className={styles.resolutionLabel}>Previous resolution note</p>
                  <p className={styles.resolutionText}>{selectedGrievance.resolution_note}</p>
                </div>
              )}

              {/* Update form */}
              <div className={styles.updateForm}>
                <p className={styles.updateTitle}>Update status</p>
                <div className={styles.statusSelect}>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value as ComplaintStatus)} className={styles.selectInput}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <textarea rows={3} className={styles.noteInput} placeholder="Resolution note (optional)"
                  value={resolutionNote} onChange={e => setResolutionNote(e.target.value)} />
                <div className={styles.updateActions}>
                  {selectedGrievance.assigned_to !== user?.id && (
                    <button type="button" className={styles.assignBtn} onClick={() => assignToSelf(selectedGrievance.id)}>
                      <UserCheck size={14} /> Assign to me
                    </button>
                  )}
                  <button type="button" className={styles.updateBtn} onClick={handleUpdate} disabled={updating}>
                    {updating ? 'Updating…' : 'Update grievance'}
                  </button>
                </div>
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
