import { useState, useRef } from 'react'
import { Plus, Upload, Mic, CheckCircle2, X } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import { useApp } from '../../context/AppContext'
import type { ComplaintType, ComplaintStatus } from '../../types'
import styles from './FarmerHelp.module.css'

const COMPLAINT_TYPES: Array<{ id: ComplaintType; label: string }> = [
  { id: 'weight_dispute', label: 'Weight problem' },
  { id: 'quality_dispute', label: 'Quality problem' },
  { id: 'payment_issue', label: 'Payment problem' },
  { id: 'transport_issue', label: 'Transport problem' },
  { id: 'other', label: 'Other' },
]

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  evidence_requested: 'Evidence requested',
  resolution: 'Resolution',
  closed: 'Closed',
}

const STATUS_CLASS: Record<ComplaintStatus, string> = {
  submitted: 'statusSubmitted',
  under_review: 'statusReview',
  evidence_requested: 'statusEvidence',
  resolution: 'statusResolution',
  closed: 'statusClosed',
}

export default function FarmerHelp() {
  const { state, createComplaint, uploadEvidence } = useApp()
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(state.complaints[0]?.id ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ type: '' as ComplaintType | '', description: '' })
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  const selectedComplaint = state.complaints.find(c => c.id === selectedId)

  async function handleCreate() {
    if (!form.type || !form.description) return
    setCreating(true)
    const c = await createComplaint({
      type: form.type as ComplaintType,
      title: COMPLAINT_TYPES.find(t => t.id === form.type)?.label ?? 'Complaint',
      description: form.description,
      status: 'submitted',
      evidenceUploaded: false,
      evidenceFiles: [],
      timeline: [],
    })
    setCreating(false)
    setShowCreateDrawer(false)
    if (c) setSelectedId(c.id)
    setForm({ type: '', description: '' })
  }

  async function handleEvidenceUpload(files: FileList | null) {
    if (!files || !selectedId) return
    setUploading(true)
    for (const file of Array.from(files)) {
      await uploadEvidence(selectedId, file)
    }
    setUploading(false)
  }

  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>07 · HELP &amp; COMPLAINTS</p>
            <h1 className={styles.title}>Help &amp; complaints</h1>
          </div>
          <button type="button" className={styles.newBtn} onClick={() => setShowCreateDrawer(true)}>
            <Plus size={16} aria-hidden />
            New complaint
          </button>
        </div>

        {state.complaints.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No complaints filed</p>
            <p className={styles.emptyBody}>If you have a dispute with weight, quality, or payment, file a complaint here.</p>
            <button type="button" className={styles.emptyAction} onClick={() => setShowCreateDrawer(true)}>
              <Plus size={14} /> File a complaint
            </button>
          </div>
        ) : (
          <div className={styles.contentGrid}>
            {/* Complaint list */}
            <div className={styles.complaintList}>
              {state.complaints.map(c => (
                <div
                  key={c.id}
                  className={`${styles.complaintCard} ${selectedId === c.id ? styles.complaintCardActive : ''}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className={styles.complaintCardHeader}>
                    <span className={styles.complaintId}>#{c.id}</span>
                    <span className={`${styles.complaintStatus} ${styles[STATUS_CLASS[c.status]]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </div>
                  <p className={styles.complaintTitle}>{c.title}</p>
                  <p className={styles.complaintDate}>
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  {c.escrowAmount && (
                    <p className={styles.complaintEscrow}>
                      ₹{c.escrowAmount.toLocaleString('en-IN')} stays protected until this is closed
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Complaint detail */}
            {selectedComplaint && (
              <div className={styles.complaintDetail}>
                <div className={styles.detailHeader}>
                  <div>
                    <h2 className={styles.detailTitle}>Complaint #{selectedComplaint.id}</h2>
                    <p className={styles.detailSub}>{selectedComplaint.title}</p>
                  </div>
                  <span className={`${styles.complaintStatus} ${styles[STATUS_CLASS[selectedComplaint.status]]}`}>
                    {STATUS_LABEL[selectedComplaint.status]}
                  </span>
                </div>

                {selectedComplaint.escrowAmount && (
                  <div className={styles.escrowNote}>
                    ₹{selectedComplaint.escrowAmount.toLocaleString('en-IN')} stays protected until this is closed
                  </div>
                )}

                <div className={styles.timelineCard}>
                  <h3 className={styles.timelineTitle}>Where it stands</h3>
                  <div className={styles.timeline}>
                    {selectedComplaint.timeline.map((step, i) => (
                      <div key={i} className={`${styles.timelineStep} ${step.completed ? styles.stepDone : ''} ${step.active ? styles.stepActive : ''}`}>
                        <div className={styles.stepDotWrap}>
                          <div className={styles.stepDot}>
                            {step.completed && <CheckCircle2 size={14} />}
                          </div>
                          {i < selectedComplaint.timeline.length - 1 && (
                            <div className={`${styles.stepLine} ${step.completed ? styles.stepLineDone : ''}`} />
                          )}
                        </div>
                        <div className={styles.stepContent}>
                          <p className={styles.stepLabel}>{step.label}</p>
                          {step.timestamp && <p className={styles.stepTime}>{step.timestamp}</p>}
                          {step.detail && <p className={styles.stepDetail}>{step.detail}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedComplaint.status === 'evidence_requested' && (
                  <div className={styles.evidenceCard}>
                    <h3 className={styles.evidenceTitle}>Evidence requested</h3>
                    <p className={styles.evidenceBody}>
                      Upload the weighbridge slip or any supporting document.
                      You can also record a voice note explaining what happened.
                    </p>
                    <div className={styles.evidenceActions}>
                      <button type="button" className={styles.uploadBtn}
                        onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Upload size={15} aria-hidden />
                        {uploading ? 'Uploading…' : 'Upload slip'}
                      </button>
                      <button type="button" className={styles.voiceBtn}>
                        <Mic size={15} aria-hidden /> Record voice
                      </button>
                    </div>
                    {selectedComplaint.evidenceFiles.length > 0 && (
                      <div className={styles.uploadedFiles}>
                        {selectedComplaint.evidenceFiles.map((f, i) => (
                          <div key={i} className={styles.uploadedFile}>
                            <span className={styles.uploadedFileName}>{f.split('/').pop()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      ref={fileInputRef} type="file" accept="image/*,.pdf" multiple
                      className={styles.hiddenInput}
                      onChange={e => handleEvidenceUpload(e.target.files)}
                    />
                  </div>
                )}

                {selectedComplaint.resolutionNote && (
                  <div className={styles.helplineCard}>
                    Resolution: {selectedComplaint.resolutionNote}
                  </div>
                )}

                <div className={styles.helplineCard}>
                  Your case is being reviewed. You can call the helpline on 1800-233-4004 in Marathi, Hindi or English.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create drawer */}
      {showCreateDrawer && (
        <div className={styles.drawerOverlay} onClick={() => setShowCreateDrawer(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>New complaint</h2>
              <button type="button" className={styles.drawerClose} onClick={() => setShowCreateDrawer(false)}>
                <X size={20} aria-hidden />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Select issue</label>
                <div className={styles.typeOptions}>
                  {COMPLAINT_TYPES.map(t => (
                    <button key={t.id} type="button"
                      className={`${styles.typeOption} ${form.type === t.id ? styles.typeOptionActive : ''}`}
                      onClick={() => setForm(f => ({ ...f, type: t.id }))}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="desc">Describe the issue</label>
                <textarea id="desc" className={styles.textarea} rows={4}
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what happened in detail..."
                />
              </div>
            </div>
            <div className={styles.drawerFooter}>
              <button type="button" className={styles.drawerCancel} onClick={() => setShowCreateDrawer(false)}>Cancel</button>
              <button type="button" className={styles.drawerSubmit}
                onClick={handleCreate} disabled={!form.type || !form.description || creating}>
                {creating ? 'Submitting…' : 'Submit complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FarmerLayout>
  )
}
