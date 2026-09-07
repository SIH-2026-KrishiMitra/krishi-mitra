import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, CheckCircle, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import type { FarmerSignUpData, BuyerSignUpData } from '../../context/AuthContext'
import { SUPPORTED_LANGUAGES } from '../../i18n'
import toast from 'react-hot-toast'
import styles from './RegisterPage.module.css'

type Role = 'farmer' | 'buyer'
type Step = 'role' | 'details' | 'success'

const BUYER_TYPE_KEYS = ['processor', 'trader', 'retailer', 'mandi', 'fpo'] as const

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUpFarmer, signUpBuyer } = useAuth()
  const { t } = useTranslation('auth')

  const [role, setRole] = useState<Role>('farmer')
  const [step, setStep] = useState<Step>('role')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const [farmerForm, setFarmerForm] = useState<FarmerSignUpData>({
    full_name: '', phone: '', email: '', password: '',
    village: '', district: '', state: '', language: 'en',
  })
  const [farmerErrors, setFarmerErrors] = useState<Partial<Record<keyof FarmerSignUpData, string>>>({})

  const [buyerForm, setBuyerForm] = useState<BuyerSignUpData>({
    org_name: '', contact_person: '', phone: '', email: '', password: '',
    buyer_type: 'processor', location: '', district: '', state: '',
  })
  const [buyerErrors, setBuyerErrors] = useState<Partial<Record<keyof BuyerSignUpData, string>>>({})

  function validateFarmer(): boolean {
    const errs: typeof farmerErrors = {}
    if (!farmerForm.full_name.trim()) errs.full_name = t('errors.name_required')
    if (!farmerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(farmerForm.email)) errs.email = t('errors.email_valid_required')
    if (!farmerForm.phone || !/^\d{10}$/.test(farmerForm.phone)) errs.phone = t('errors.mobile_valid_required')
    if (!farmerForm.password || farmerForm.password.length < 8) errs.password = t('errors.password_min')
    if (!farmerForm.village.trim()) errs.village = t('errors.village_required')
    if (!farmerForm.district.trim()) errs.district = t('errors.district_required')
    if (!farmerForm.state.trim()) errs.state = t('errors.state_required')
    setFarmerErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateBuyer(): boolean {
    const errs: typeof buyerErrors = {}
    if (!buyerForm.org_name.trim()) errs.org_name = t('errors.org_required')
    if (!buyerForm.contact_person.trim()) errs.contact_person = t('errors.contact_required')
    if (!buyerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerForm.email)) errs.email = t('errors.email_valid_required')
    if (!buyerForm.phone || !/^\d{10}$/.test(buyerForm.phone)) errs.phone = t('errors.mobile_valid_required')
    if (!buyerForm.password || buyerForm.password.length < 8) errs.password = t('errors.password_min')
    if (!buyerForm.location.trim()) errs.location = t('errors.location_required')
    if (!buyerForm.state.trim()) errs.state = t('errors.state_required')
    setBuyerErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (role === 'farmer') {
      if (!validateFarmer()) return
      setLoading(true)
      try {
        await signUpFarmer(farmerForm)
        setStep('success')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('errors.registration_failed')
        if (msg.includes('already registered')) {
          setFarmerErrors({ email: t('errors.already_registered') })
        } else {
          toast.error(msg)
        }
      } finally {
        setLoading(false)
      }
    } else {
      if (!validateBuyer()) return
      setLoading(true)
      try {
        await signUpBuyer(buyerForm)
        setStep('success')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('errors.registration_failed')
        if (msg.includes('already registered')) {
          setBuyerErrors({ email: t('errors.already_registered') })
        } else {
          toast.error(msg)
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>KM</div>
            <div>
              <p className={styles.logoName}>{t('common:app.name')}</p>
              <p className={styles.logoTagline}>{t('common:app.tagline')}</p>
            </div>
          </div>
          <div className={styles.headline}>
            <h1 className={styles.headlineTitle}>{t('register.headline')}</h1>
            <p className={styles.headlineSub}>{t('register.headline_sub')}</p>
          </div>
          <div className={styles.steps}>
            <StepItem num={1} label={t('register.step1')} active={step === 'role' || step === 'details'} done={step === 'success'} />
            <StepItem num={2} label={t('register.step2')} active={false} done={false} />
            <StepItem num={3} label={t('register.step3')} active={false} done={false} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formBox}>
          {step === 'success' ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}><CheckCircle size={48} /></div>
              <h2 className={styles.successTitle}>{t('register.success_title')}</h2>
              <p className={styles.successSub}>{t('register.success_sub')}</p>
              <button type="button" className={styles.primaryBtn} onClick={() => navigate('/login')}>
                {t('register.go_login')}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <div className={styles.kycBadge}>
                  <Shield size={12} aria-hidden />
                  <span>{t('common:trust.secure_registration')}</span>
                </div>
                <h2 className={styles.formTitle}>
                  {step === 'role'
                    ? t('register.title_role')
                    : role === 'farmer'
                      ? t('register.title_farmer')
                      : t('register.title_buyer')}
                </h2>
                <p className={styles.formSub}>
                  {step === 'role'
                    ? t('register.sub_role')
                    : role === 'farmer'
                      ? t('register.sub_farmer')
                      : t('register.sub_buyer')}
                </p>
              </div>

              {/* Step: Role selection */}
              {step === 'role' && (
                <div className={styles.roleGroup}>
                  <p className={styles.fieldLabel}>{t('register.role_label')}</p>
                  <div className={styles.roleCards}>
                    {(['farmer', 'buyer'] as Role[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`${styles.roleCard} ${role === r ? styles.roleCardActive : ''}`}
                        onClick={() => setRole(r)}
                      >
                        <span className={styles.roleTitle}>{t(`roles.${r}_title`)}</span>
                        <span className={styles.roleSub}>{t(`roles.${r}_sub_long`)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Farmer details */}
              {step === 'details' && role === 'farmer' && (
                <div className={styles.formGrid}>
                  <Field label={t('fields.full_name')} error={farmerErrors.full_name}>
                    <input
                      className={`${styles.input} ${farmerErrors.full_name ? styles.inputError : ''}`}
                      value={farmerForm.full_name}
                      onChange={e => setFarmerForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Ramesh Patil"
                      autoFocus
                    />
                  </Field>
                  <Field label={t('fields.mobile')} error={farmerErrors.phone}>
                    <div className={styles.phoneInput}>
                      <span className={styles.phonePrefix}>+91</span>
                      <input
                        className={`${styles.input} ${farmerErrors.phone ? styles.inputError : ''}`}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={farmerForm.phone}
                        onChange={e => setFarmerForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                        placeholder="98765 43210"
                      />
                    </div>
                  </Field>
                  <Field label={t('fields.email')} error={farmerErrors.email}>
                    <input
                      className={`${styles.input} ${farmerErrors.email ? styles.inputError : ''}`}
                      type="email"
                      value={farmerForm.email}
                      onChange={e => setFarmerForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label={t('fields.password')} error={farmerErrors.password}>
                    <div className={styles.passwordInput}>
                      <input
                        className={`${styles.input} ${styles.passwordField} ${farmerErrors.password ? styles.inputError : ''}`}
                        type={showPw ? 'text' : 'password'}
                        value={farmerForm.password}
                        onChange={e => setFarmerForm(f => ({ ...f, password: e.target.value }))}
                        placeholder={t('fields.password_placeholder')}
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                  <Field label={t('fields.village')} error={farmerErrors.village}>
                    <input
                      className={`${styles.input} ${farmerErrors.village ? styles.inputError : ''}`}
                      value={farmerForm.village}
                      onChange={e => setFarmerForm(f => ({ ...f, village: e.target.value }))}
                      placeholder="Lasalgaon"
                    />
                  </Field>
                  <Field label={t('fields.district')} error={farmerErrors.district}>
                    <input
                      className={`${styles.input} ${farmerErrors.district ? styles.inputError : ''}`}
                      value={farmerForm.district}
                      onChange={e => setFarmerForm(f => ({ ...f, district: e.target.value }))}
                      placeholder="Nashik"
                    />
                  </Field>
                  <Field label={t('fields.state')} error={farmerErrors.state}>
                    <input
                      className={`${styles.input} ${farmerErrors.state ? styles.inputError : ''}`}
                      value={farmerForm.state}
                      onChange={e => setFarmerForm(f => ({ ...f, state: e.target.value }))}
                      placeholder="Maharashtra"
                    />
                  </Field>
                  <Field label={t('register.preferred_language')}>
                    <select
                      className={styles.input}
                      value={farmerForm.language}
                      onChange={e => setFarmerForm(f => ({ ...f, language: e.target.value }))}
                    >
                      {SUPPORTED_LANGUAGES.map(l => (
                        <option key={l.code} value={l.code} lang={l.code}>{l.nativeLabel}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}

              {/* Buyer details */}
              {step === 'details' && role === 'buyer' && (
                <div className={styles.formGrid}>
                  <Field label={t('fields.org_name')} error={buyerErrors.org_name}>
                    <input
                      className={`${styles.input} ${buyerErrors.org_name ? styles.inputError : ''}`}
                      value={buyerForm.org_name}
                      onChange={e => setBuyerForm(f => ({ ...f, org_name: e.target.value }))}
                      placeholder="ABC Foods Pvt Ltd"
                      autoFocus
                    />
                  </Field>
                  <Field label={t('fields.contact_person')} error={buyerErrors.contact_person}>
                    <input
                      className={`${styles.input} ${buyerErrors.contact_person ? styles.inputError : ''}`}
                      value={buyerForm.contact_person}
                      onChange={e => setBuyerForm(f => ({ ...f, contact_person: e.target.value }))}
                      placeholder="Suresh Kumar"
                    />
                  </Field>
                  <Field label={t('register.buyer_type')}>
                    <select
                      className={styles.input}
                      value={buyerForm.buyer_type}
                      onChange={e => setBuyerForm(f => ({ ...f, buyer_type: e.target.value as BuyerSignUpData['buyer_type'] }))}
                    >
                      {BUYER_TYPE_KEYS.map(key => (
                        <option key={key} value={key}>{t(`register.buyer_types.${key}`)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t('fields.mobile')} error={buyerErrors.phone}>
                    <div className={styles.phoneInput}>
                      <span className={styles.phonePrefix}>+91</span>
                      <input
                        className={`${styles.input} ${buyerErrors.phone ? styles.inputError : ''}`}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={buyerForm.phone}
                        onChange={e => setBuyerForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                        placeholder="98765 43210"
                      />
                    </div>
                  </Field>
                  <Field label={t('fields.email')} error={buyerErrors.email}>
                    <input
                      className={`${styles.input} ${buyerErrors.email ? styles.inputError : ''}`}
                      type="email"
                      value={buyerForm.email}
                      onChange={e => setBuyerForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="procurement@company.com"
                    />
                  </Field>
                  <Field label={t('fields.password')} error={buyerErrors.password}>
                    <div className={styles.passwordInput}>
                      <input
                        className={`${styles.input} ${styles.passwordField} ${buyerErrors.password ? styles.inputError : ''}`}
                        type={showPw ? 'text' : 'password'}
                        value={buyerForm.password}
                        onChange={e => setBuyerForm(f => ({ ...f, password: e.target.value }))}
                        placeholder={t('fields.password_placeholder')}
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                  <Field label={t('fields.city_location')} error={buyerErrors.location}>
                    <input
                      className={`${styles.input} ${buyerErrors.location ? styles.inputError : ''}`}
                      value={buyerForm.location}
                      onChange={e => setBuyerForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="Pune"
                    />
                  </Field>
                  <Field label={t('fields.district')} error={buyerErrors.district}>
                    <input
                      className={`${styles.input} ${buyerErrors.district ? styles.inputError : ''}`}
                      value={buyerForm.district}
                      onChange={e => setBuyerForm(f => ({ ...f, district: e.target.value }))}
                      placeholder="Pune"
                    />
                  </Field>
                  <Field label={t('fields.state')} error={buyerErrors.state}>
                    <input
                      className={`${styles.input} ${buyerErrors.state ? styles.inputError : ''}`}
                      value={buyerForm.state}
                      onChange={e => setBuyerForm(f => ({ ...f, state: e.target.value }))}
                      placeholder="Maharashtra"
                    />
                  </Field>
                </div>
              )}

              {/* Actions */}
              <div className={styles.ctaGroup}>
                {step === 'role' ? (
                  <button type="button" className={styles.primaryBtn} onClick={() => setStep('details')}>
                    <span>{t('common:actions.continue')}</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      disabled={loading}
                      onClick={handleSubmit}
                    >
                      {loading
                        ? t('common:actions.creating')
                        : <><span>{t('login.create_account')}</span><ChevronRight size={16} /></>}
                    </button>
                    <button type="button" className={styles.backLink} onClick={() => setStep('role')}>
                      <ChevronLeft size={14} /> {t('common:actions.back')}
                    </button>
                  </>
                )}
              </div>

              <p className={styles.loginLink}>
                {t('register.have_account')}{' '}
                <Link to="/login" className={styles.inlineLink}>{t('register.sign_in')}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
    </div>
  )
}

function StepItem({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`${styles.stepItem} ${active ? styles.stepItemActive : ''} ${done ? styles.stepItemDone : ''}`}>
      <div className={styles.stepNum}>{done ? <CheckCircle size={14} /> : num}</div>
      <span className={styles.stepLabel}>{label}</span>
    </div>
  )
}
