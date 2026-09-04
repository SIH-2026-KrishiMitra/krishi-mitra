import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, LogOut, Globe, Bell } from 'lucide-react'
import BuyerLayout from './BuyerLayout'
import { useBuyer } from '../../context/BuyerContext'
import { useAuth } from '../../context/AuthContext'
import styles from './BuyerProfile.module.css'

const BUYER_TYPE_LABELS: Record<string, string> = {
  processor: 'Processor',
  trader: 'Trader / Commission agent',
  retailer: 'Retailer',
  mandi: 'Mandi / APMC',
  fpo: 'FPO / Cooperative',
}

export default function BuyerProfile() {
  const navigate = useNavigate()
  const { buyerProfile, updateProfile, logout } = useBuyer()
  const { profile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    fullName: profile?.full_name ?? '',
    orgName: buyerProfile?.org_name ?? '',
    contactPerson: buyerProfile?.contact_person ?? '',
    location: buyerProfile?.location ?? '',
    district: buyerProfile?.district ?? '',
    state: buyerProfile?.state ?? '',
  })

  async function handleSave() {
    setSaving(true)
    await updateProfile(
      { full_name: form.fullName },
      { org_name: form.orgName, contact_person: form.contactPerson, location: form.location, district: form.district, state: form.state }
    )
    setSaving(false)
    setEditing(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const displayName = profile?.full_name ?? buyerProfile?.org_name ?? 'Buyer'

  return (
    <BuyerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <p className={styles.breadcrumb}>06 · PROFILE</p>
          <h1 className={styles.title}>Profile &amp; settings</h1>
        </div>

        {/* Profile card */}
        <div className={styles.profileCard}>
          <div className={styles.profileLeft}>
            <div className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className={styles.profileName}>{displayName}</h2>
              {buyerProfile?.org_name && profile?.full_name !== buyerProfile.org_name && (
                <p className={styles.profileOrg}>{buyerProfile.org_name}</p>
              )}
              <div className={styles.profileMeta}>
                {buyerProfile?.buyer_type && (
                  <span className={styles.typeBadge}>{BUYER_TYPE_LABELS[buyerProfile.buyer_type] ?? buyerProfile.buyer_type}</span>
                )}
                {buyerProfile?.verified && (
                  <span className={styles.verifiedBadge}>
                    <CheckCircle size={11} aria-hidden /> Verified buyer
                  </span>
                )}
              </div>
            </div>
          </div>
          <button type="button" className={styles.editBtn} onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit profile'}
          </button>
        </div>

        {/* Trust & verification */}
        {buyerProfile && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Buyer score</h2>
            <div className={styles.scoreCard}>
              <div className={styles.scoreItem}>
                <p className={styles.scoreValue}>{buyerProfile.trust_score}%</p>
                <p className={styles.scoreLabel}>Trust score</p>
              </div>
              <div className={styles.scoreDivider} />
              <div className={styles.scoreItem}>
                <p className={styles.scoreValue}>{buyerProfile.completed_deals}</p>
                <p className={styles.scoreLabel}>Deals completed</p>
              </div>
              <div className={styles.scoreDivider} />
              <div className={styles.scoreItem}>
                <p className={styles.scoreValue}>{buyerProfile.verified ? 'Yes' : 'Pending'}</p>
                <p className={styles.scoreLabel}>KYC verified</p>
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Business details</h2>
          <div className={styles.detailCard}>
            {editing ? (
              <div className={styles.editForm}>
                <Field label="Contact person" value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} />
                <Field label="Organisation name" value={form.orgName} onChange={v => setForm(f => ({ ...f, orgName: v }))} />
                <Field label="Contact person" value={form.contactPerson} onChange={v => setForm(f => ({ ...f, contactPerson: v }))} />
                <Field label="Location" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} />
                <Field label="District" value={form.district} onChange={v => setForm(f => ({ ...f, district: v }))} />
                <Field label="State" value={form.state} onChange={v => setForm(f => ({ ...f, state: v }))} />
                <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            ) : (
              <>
                <DetailRow label="Contact person" value={buyerProfile?.contact_person ?? profile?.full_name ?? '—'} />
                <DetailRow label="Organisation" value={buyerProfile?.org_name ?? '—'} />
                <DetailRow label="Buyer type" value={buyerProfile?.buyer_type ? (BUYER_TYPE_LABELS[buyerProfile.buyer_type] ?? buyerProfile.buyer_type) : '—'} />
                <DetailRow label="Location" value={buyerProfile?.location ?? '—'} />
                <DetailRow label="District" value={buyerProfile?.district ?? '—'} />
                <DetailRow label="State" value={buyerProfile?.state ?? '—'} />
                <DetailRow label="Email" value={profile?.email ?? '—'} />
                <DetailRow label="Phone" value={profile?.phone ? `+91 ${profile.phone}` : '—'} />
              </>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Settings</h2>
          <div className={styles.detailCard}>
            <div className={styles.settingRow}>
              <Bell size={16} className={styles.settingIcon} aria-hidden />
              <div>
                <p className={styles.settingLabel}>Notifications</p>
                <p className={styles.settingSub}>Offer updates, deal alerts, price changes</p>
              </div>
            </div>
            <div className={styles.settingRow}>
              <Globe size={16} className={styles.settingIcon} aria-hidden />
              <div>
                <p className={styles.settingLabel}>Language</p>
                <p className={styles.settingSub}>English</p>
              </div>
            </div>
          </div>
        </div>

        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} aria-hidden /> Sign out
        </button>
      </div>
    </BuyerLayout>
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      <input className={styles.fieldInput} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}
