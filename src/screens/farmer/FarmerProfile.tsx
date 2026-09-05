import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, LogOut, Bell, Globe, Volume2, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import FarmerLayout from './FarmerLayout'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { uploadToCloudinary, validateImageFile } from '../../services/cloudinary'
import { updateProfile } from '../../services/supabase/profiles'
import styles from './FarmerProfile.module.css'

export default function FarmerProfile() {
  const navigate = useNavigate()
  const { state, updateFarmer, logout } = useApp()
  const { user, profile, refreshProfile } = useAuth()
  const { farmer } = state
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: farmer.name, village: farmer.village, district: farmer.district })
  const photoRef = useRef<HTMLInputElement>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [localAvatar, setLocalAvatar] = useState<string | null>(null)

  const avatarUrl = localAvatar ?? profile?.avatar_url ?? null

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try { validateImageFile(file) } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid file')
      e.target.value = ''
      return
    }
    setPhotoUploading(true)
    setUploadPct(0)
    try {
      const result = await uploadToCloudinary(file, 'krishi-mitra/profiles', setUploadPct)
      await updateProfile(user.id, { avatar_url: result.secure_url })
      setLocalAvatar(result.secure_url)
      await refreshProfile()
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Photo upload failed')
    } finally {
      setPhotoUploading(false)
      e.target.value = ''
    }
  }

  async function handleSave() {
    await updateFarmer(form)
    setEditing(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <p className={styles.breadcrumb}>08 · PROFILE</p>
          <h1 className={styles.title}>Profile &amp; settings</h1>
        </div>

        {/* Profile card */}
        <div className={styles.profileCard}>
          <div className={styles.profileAvatarSection}>
            <div className={styles.avatarWrapper}>
              {avatarUrl
                ? <img src={avatarUrl} alt={farmer.name} className={styles.avatarImg} />
                : <div className={styles.avatar}>{farmer.name.charAt(0)}</div>
              }
              <button
                type="button"
                className={styles.avatarOverlay}
                onClick={() => photoRef.current?.click()}
                disabled={photoUploading}
                aria-label="Change profile photo"
              >
                {photoUploading
                  ? <span className={styles.avatarProgress}>{uploadPct}%</span>
                  : <Camera size={16} />
                }
              </button>
              <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp"
                className={styles.hiddenInput} onChange={handlePhotoChange} aria-hidden="true" />
            </div>
            <div>
              <h2 className={styles.profileName}>{farmer.name}</h2>
              <p className={styles.profileMeta}>{farmer.village}, {farmer.district}, {farmer.state}</p>
              <div className={styles.profileBadges}>
                {farmer.verified && (
                  <span className={styles.verifiedBadge}>
                    <CheckCircle size={12} aria-hidden /> Verified farmer
                  </span>
                )}
                <span className={styles.memberBadge}>Member since {farmer.memberSince}</span>
              </div>
            </div>
          </div>
          <div className={styles.profileActions}>
            <button type="button" className={styles.editBtn} onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit profile'}
            </button>
          </div>
        </div>

        {/* Personal details */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Personal details</h2>
          <div className={styles.detailCard}>
            {editing ? (
              <div className={styles.editForm}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Full name</label>
                  <input className={styles.fieldInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Village</label>
                  <input className={styles.fieldInput} value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>District</label>
                  <input className={styles.fieldInput} value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
                </div>
                <button type="button" className={styles.saveBtn} onClick={handleSave}>Save changes</button>
              </div>
            ) : (
              <>
                <DetailRow label="Mobile number" value={`+91 ${farmer.mobile}`} />
                <DetailRow label="Village" value={farmer.village} />
                <DetailRow label="District" value={farmer.district} />
                <DetailRow label="State" value={farmer.state} />
              </>
            )}
          </div>
        </div>

        {/* KYC & Verification */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>KYC &amp; verification</h2>
          <div className={styles.detailCard}>
            <DetailRow label="KYC status" value={farmer.kycStatus === 'complete' ? '✓ Complete' : 'Pending'} highlight={farmer.kycStatus === 'complete'} />
            <DetailRow label="Verification" value={farmer.verified ? '✓ Verified farmer' : 'Not verified'} highlight={farmer.verified} />
          </div>
        </div>

        {/* Bank account */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Bank account</h2>
          <div className={styles.detailCard}>
            <DetailRow label="Bank" value={farmer.bankName} />
            <DetailRow label="Account number" value={`••••••${farmer.bankAccount}`} />
            <DetailRow label="IFSC" value={farmer.ifsc} />
          </div>
        </div>

        {/* Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Settings</h2>
          <div className={styles.detailCard}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <Bell size={16} className={styles.toggleIcon} />
                <div>
                  <p className={styles.toggleLabel}>Notifications</p>
                  <p className={styles.toggleSub}>Price alerts, offer notifications</p>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.toggle} ${farmer.notifications ? styles.toggleOn : ''}`}
                onClick={() => updateFarmer({ notifications: !farmer.notifications })}
                role="switch"
                aria-checked={farmer.notifications}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <Volume2 size={16} className={styles.toggleIcon} />
                <div>
                  <p className={styles.toggleLabel}>Listen to page</p>
                  <p className={styles.toggleSub}>Voice guidance in Marathi/Hindi/English</p>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.toggle} ${farmer.listenEnabled ? styles.toggleOn : ''}`}
                onClick={() => updateFarmer({ listenEnabled: !farmer.listenEnabled })}
                role="switch"
                aria-checked={farmer.listenEnabled}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
            <div className={styles.languageRow}>
              <Globe size={16} className={styles.toggleIcon} />
              <div className={styles.languageInfo}>
                <p className={styles.toggleLabel}>Language</p>
                <p className={styles.toggleSub}>App display language</p>
              </div>
              <div className={styles.langOptions}>
                {(['en', 'mr', 'hi'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    className={`${styles.langOption} ${farmer.language === lang ? styles.langOptionActive : ''}`}
                    onClick={() => updateFarmer({ language: lang })}
                  >
                    {lang === 'en' ? 'EN' : lang === 'mr' ? 'मर' : 'हि'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} aria-hidden />
          Sign out
        </button>
      </div>
    </FarmerLayout>
  )
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={`${styles.detailValue} ${highlight ? styles.detailValueHighlight : ''}`}>{value}</span>
    </div>
  )
}
