import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, CheckCircle, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { FarmerSignUpData, BuyerSignUpData } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './RegisterPage.module.css'

type Role = 'farmer' | 'buyer'
type Step = 'role' | 'details' | 'success'

const BUYER_TYPES = [
  { value: 'processor', label: 'Processor / Mill' },
  { value: 'trader', label: 'Trader' },
  { value: 'retailer', label: 'Retailer / Supermarket' },
  { value: 'mandi', label: 'APMC / Mandi' },
  { value: 'fpo', label: 'FPO / Cooperative' },
] as const

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUpFarmer, signUpBuyer } = useAuth()

  const [role, setRole] = useState<Role>('farmer')
  const [step, setStep] = useState<Step>('role')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // Farmer form
  const [farmerForm, setFarmerForm] = useState<FarmerSignUpData>({
    full_name: '', phone: '', email: '', password: '',
    village: '', district: '', state: '', language: 'en',
  })
  const [farmerErrors, setFarmerErrors] = useState<Partial<Record<keyof FarmerSignUpData, string>>>({})

  // Buyer form
  const [buyerForm, setBuyerForm] = useState<BuyerSignUpData>({
    org_name: '', contact_person: '', phone: '', email: '', password: '',
    buyer_type: 'processor', location: '', district: '', state: '',
  })
  const [buyerErrors, setBuyerErrors] = useState<Partial<Record<keyof BuyerSignUpData, string>>>({})

  function validateFarmer(): boolean {
    const errs: typeof farmerErrors = {}
    if (!farmerForm.full_name.trim()) errs.full_name = 'Name is required'
    if (!farmerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(farmerForm.email)) errs.email = 'Valid email required'
    if (!farmerForm.phone || !/^\d{10}$/.test(farmerForm.phone)) errs.phone = 'Valid 10-digit number required'
    if (!farmerForm.password || farmerForm.password.length < 8) errs.password = 'Minimum 8 characters'
    if (!farmerForm.village.trim()) errs.village = 'Village is required'
    if (!farmerForm.district.trim()) errs.district = 'District is required'
    if (!farmerForm.state.trim()) errs.state = 'State is required'
    setFarmerErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateBuyer(): boolean {
    const errs: typeof buyerErrors = {}
    if (!buyerForm.org_name.trim()) errs.org_name = 'Organisation name is required'
    if (!buyerForm.contact_person.trim()) errs.contact_person = 'Contact person is required'
    if (!buyerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerForm.email)) errs.email = 'Valid email required'
    if (!buyerForm.phone || !/^\d{10}$/.test(buyerForm.phone)) errs.phone = 'Valid 10-digit number required'
    if (!buyerForm.password || buyerForm.password.length < 8) errs.password = 'Minimum 8 characters'
    if (!buyerForm.location.trim()) errs.location = 'Location is required'
    if (!buyerForm.state.trim()) errs.state = 'State is required'
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
        const msg = err instanceof Error ? err.message : 'Registration failed'
        if (msg.includes('already registered')) {
          setFarmerErrors({ email: 'This email is already registered' })
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
        const msg = err instanceof Error ? err.message : 'Registration failed'
        if (msg.includes('already registered')) {
          setBuyerErrors({ email: 'This email is already registered' })
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
              <p className={styles.logoName}>Krishi Mitra</p>
              <p className={styles.logoTagline}>Agri-Fintech Platform</p>
            </div>
          </div>
          <div className={styles.headline}>
            <h1 className={styles.headlineTitle}>
              Join India's<br />largest farmer<br />marketplace
            </h1>
            <p className={styles.headlineSub}>
              Over 3,400 verified farmers and buyers transacting ₹200Cr+ annually on Krishi Mitra.
            </p>
          </div>
          <div className={styles.steps}>
            <StepItem num={1} label="Create your account" active={step === 'role' || step === 'details'} done={step === 'success'} />
            <StepItem num={2} label="Complete your profile" active={false} done={false} />
            <StepItem num={3} label="Start trading" active={false} done={false} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formBox}>
          {step === 'success' ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}><CheckCircle size={48} /></div>
              <h2 className={styles.successTitle}>Account created!</h2>
              <p className={styles.successSub}>
                {role === 'farmer'
                  ? 'Check your email to verify your account, then log in.'
                  : 'Check your email to verify your account, then log in.'}
              </p>
              <button type="button" className={styles.primaryBtn} onClick={() => navigate('/login')}>
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <div className={styles.kycBadge}>
                  <Shield size={12} aria-hidden />
                  <span>Secure Registration</span>
                </div>
                <h2 className={styles.formTitle}>
                  {step === 'role' ? 'Create your account' : role === 'farmer' ? 'Farmer details' : 'Buyer details'}
                </h2>
                <p className={styles.formSub}>
                  {step === 'role'
                    ? 'Select your role to get started.'
                    : `Setting up your ${role === 'farmer' ? 'farmer' : 'buyer'} account.`}
                </p>
              </div>

              {/* Step: Role selection */}
              {step === 'role' && (
                <div className={styles.roleGroup}>
                  <p className={styles.fieldLabel}>I am a…</p>
                  <div className={styles.roleCards}>
                    {([
                      { id: 'farmer' as Role, title: 'Farmer / Producer', subtitle: 'Sell your produce directly to verified buyers' },
                      { id: 'buyer' as Role, title: 'Institutional Buyer', subtitle: 'Processor, Trader, FPO or Retailer' },
                    ]).map(r => (
                      <button
                        key={r.id}
                        type="button"
                        className={`${styles.roleCard} ${role === r.id ? styles.roleCardActive : ''}`}
                        onClick={() => setRole(r.id)}
                      >
                        <span className={styles.roleTitle}>{r.title}</span>
                        <span className={styles.roleSub}>{r.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Farmer details */}
              {step === 'details' && role === 'farmer' && (
                <div className={styles.formGrid}>
                  <Field label="Full name" error={farmerErrors.full_name}>
                    <input
                      className={`${styles.input} ${farmerErrors.full_name ? styles.inputError : ''}`}
                      value={farmerForm.full_name}
                      onChange={e => setFarmerForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Ramesh Patil"
                      autoFocus
                    />
                  </Field>
                  <Field label="Mobile number" error={farmerErrors.phone}>
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
                  <Field label="Email address" error={farmerErrors.email}>
                    <input
                      className={`${styles.input} ${farmerErrors.email ? styles.inputError : ''}`}
                      type="email"
                      value={farmerForm.email}
                      onChange={e => setFarmerForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Password" error={farmerErrors.password}>
                    <div className={styles.passwordInput}>
                      <input
                        className={`${styles.input} ${styles.passwordField} ${farmerErrors.password ? styles.inputError : ''}`}
                        type={showPw ? 'text' : 'password'}
                        value={farmerForm.password}
                        onChange={e => setFarmerForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Village" error={farmerErrors.village}>
                    <input
                      className={`${styles.input} ${farmerErrors.village ? styles.inputError : ''}`}
                      value={farmerForm.village}
                      onChange={e => setFarmerForm(f => ({ ...f, village: e.target.value }))}
                      placeholder="Lasalgaon"
                    />
                  </Field>
                  <Field label="District" error={farmerErrors.district}>
                    <input
                      className={`${styles.input} ${farmerErrors.district ? styles.inputError : ''}`}
                      value={farmerForm.district}
                      onChange={e => setFarmerForm(f => ({ ...f, district: e.target.value }))}
                      placeholder="Nashik"
                    />
                  </Field>
                  <Field label="State" error={farmerErrors.state}>
                    <input
                      className={`${styles.input} ${farmerErrors.state ? styles.inputError : ''}`}
                      value={farmerForm.state}
                      onChange={e => setFarmerForm(f => ({ ...f, state: e.target.value }))}
                      placeholder="Maharashtra"
                    />
                  </Field>
                  <Field label="Preferred language">
                    <select
                      className={styles.input}
                      value={farmerForm.language}
                      onChange={e => setFarmerForm(f => ({ ...f, language: e.target.value }))}
                    >
                      <option value="en">English</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* Buyer details */}
              {step === 'details' && role === 'buyer' && (
                <div className={styles.formGrid}>
                  <Field label="Organisation / Company name" error={buyerErrors.org_name}>
                    <input
                      className={`${styles.input} ${buyerErrors.org_name ? styles.inputError : ''}`}
                      value={buyerForm.org_name}
                      onChange={e => setBuyerForm(f => ({ ...f, org_name: e.target.value }))}
                      placeholder="ABC Foods Pvt Ltd"
                      autoFocus
                    />
                  </Field>
                  <Field label="Contact person" error={buyerErrors.contact_person}>
                    <input
                      className={`${styles.input} ${buyerErrors.contact_person ? styles.inputError : ''}`}
                      value={buyerForm.contact_person}
                      onChange={e => setBuyerForm(f => ({ ...f, contact_person: e.target.value }))}
                      placeholder="Suresh Kumar"
                    />
                  </Field>
                  <Field label="Buyer type">
                    <select
                      className={styles.input}
                      value={buyerForm.buyer_type}
                      onChange={e => setBuyerForm(f => ({ ...f, buyer_type: e.target.value as BuyerSignUpData['buyer_type'] }))}
                    >
                      {BUYER_TYPES.map(bt => (
                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Mobile number" error={buyerErrors.phone}>
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
                  <Field label="Email address" error={buyerErrors.email}>
                    <input
                      className={`${styles.input} ${buyerErrors.email ? styles.inputError : ''}`}
                      type="email"
                      value={buyerForm.email}
                      onChange={e => setBuyerForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="procurement@company.com"
                    />
                  </Field>
                  <Field label="Password" error={buyerErrors.password}>
                    <div className={styles.passwordInput}>
                      <input
                        className={`${styles.input} ${styles.passwordField} ${buyerErrors.password ? styles.inputError : ''}`}
                        type={showPw ? 'text' : 'password'}
                        value={buyerForm.password}
                        onChange={e => setBuyerForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="City / Location" error={buyerErrors.location}>
                    <input
                      className={`${styles.input} ${buyerErrors.location ? styles.inputError : ''}`}
                      value={buyerForm.location}
                      onChange={e => setBuyerForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="Pune"
                    />
                  </Field>
                  <Field label="District" error={buyerErrors.district}>
                    <input
                      className={`${styles.input} ${buyerErrors.district ? styles.inputError : ''}`}
                      value={buyerForm.district}
                      onChange={e => setBuyerForm(f => ({ ...f, district: e.target.value }))}
                      placeholder="Pune"
                    />
                  </Field>
                  <Field label="State" error={buyerErrors.state}>
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
                    <span>Continue</span>
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
                      {loading ? 'Creating account…' : <><span>Create account</span><ChevronRight size={16} /></>}
                    </button>
                    <button type="button" className={styles.backLink} onClick={() => setStep('role')}>
                      <ChevronLeft size={14} /> Back
                    </button>
                  </>
                )}
              </div>

              <p className={styles.loginLink}>
                Already have an account?{' '}
                <Link to="/login" className={styles.inlineLink}>Sign in</Link>
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
