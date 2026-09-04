import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail, Phone, ChevronRight, Shield, RefreshCw, CheckCircle,
  Eye, EyeOff,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './LoginPage.module.css'

type Role = 'farmer' | 'buyer'
type Method = 'email' | 'phone'
type Step = 'role' | 'credentials' | 'otp' | 'success'

const ROLES: Array<{ id: Role; title: string; subtitle: string }> = [
  { id: 'farmer', title: 'Farmer / Producer', subtitle: 'Sell your produce directly' },
  { id: 'buyer', title: 'Institutional Buyer', subtitle: 'Processor, Trader & FPO' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { signInWithEmail, signInWithGoogle, signInWithPhone, verifyOtp } = useAuth()

  const [role, setRole] = useState<Role>('farmer')
  const [method, setMethod] = useState<Method>('email')
  const [step, setStep] = useState<Step>('role')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [otpError, setOtpError] = useState('')

  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  function startResendTimer() {
    setResendTimer(30)
    const iv = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(iv); return 0 }
        return t - 1
      })
    }, 1000)
  }

  function validateEmail() {
    if (!email.trim()) { setEmailError('Email is required'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email'); return false }
    setEmailError('')
    return true
  }

  function validatePassword() {
    if (!password) { setPasswordError('Password is required'); return false }
    setPasswordError('')
    return true
  }

  function validateMobile() {
    if (!/^\d{10}$/.test(mobile)) { setMobileError('Enter a valid 10-digit number'); return false }
    setMobileError('')
    return true
  }

  async function handleEmailLogin() {
    if (!validateEmail() || !validatePassword()) return
    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
      setStep('success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      if (msg.toLowerCase().includes('invalid')) {
        setPasswordError('Incorrect email or password')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOtp() {
    if (!validateMobile()) return
    setLoading(true)
    try {
      await signInWithPhone(mobile)
      setStep('otp')
      startResendTimer()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send OTP'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (!otp || otp.length < 6) { setOtpError('Enter the 6-digit OTP'); return }
    setLoading(true)
    try {
      await verifyOtp(mobile, otp)
      setStep('success')
    } catch {
      setOtpError('Incorrect OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed')
    }
  }

  function handleResend() {
    setOtp('')
    setOtpError('')
    handleSendOtp()
  }

  // Navigate after success state shows
  if (step === 'success') {
    setTimeout(() => {
      if (role === 'buyer') navigate('/buyer/home')
      else navigate('/farmer/home')
    }, 900)
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
              Direct market<br />access for<br />Indian Farmers
            </h1>
            <p className={styles.headlineSub}>
              Connect with verified buyers. Transparent bidding. 100% escrow-protected instant settlements.
            </p>
          </div>
          <div className={styles.testimonial}>
            <p className={styles.testimonialText}>
              "Krishi Mitra helped me store 220 quintals of soybean extra and sell it at the right time."
            </p>
            <p className={styles.testimonialAuthor}>— Ravi Patel, Nashik FPO Producer</p>
          </div>
          <div className={styles.trustRow}>
            <TrustStat value="3,460+" label="NCFM Registered" />
            <TrustStat value="₹0 Fee" label="Direct Mandi Connect" />
            <TrustStat value="100%" label="Escrow Guarantee" />
            <TrustStat value="< 12 mins" label="Pledge Section Time" />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formBox}>
          {step === 'success' ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}><CheckCircle size={48} /></div>
              <h2 className={styles.successTitle}>Welcome back!</h2>
              <p className={styles.successSub}>Redirecting to your dashboard…</p>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <div className={styles.kycBadge}>
                  <Shield size={12} aria-hidden />
                  <span>KYC Enabled</span>
                </div>
                <h2 className={styles.formTitle}>
                  {step === 'role' && 'Welcome back to Krishi Mitra'}
                  {step === 'credentials' && (method === 'email' ? 'Sign in with email' : 'Sign in with mobile')}
                  {step === 'otp' && 'Verify your number'}
                </h2>
                <p className={styles.formSub}>
                  {step === 'role' && 'Log in to view lots, participate in bids, and track your deals.'}
                  {step === 'credentials' && `Signing in as ${ROLES.find(r => r.id === role)?.title}`}
                  {step === 'otp' && `OTP sent to +91 ${mobile.slice(0, 5)}XXXXX`}
                </p>
              </div>

              {/* Step: Role */}
              {step === 'role' && (
                <div className={styles.roleGroup}>
                  <p className={styles.fieldLabel}>Select your role</p>
                  <div className={styles.roleCards}>
                    {ROLES.map(r => (
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

              {/* Step: Credentials — email */}
              {step === 'credentials' && method === 'email' && (
                <div className={styles.fieldGroup}>
                  <div>
                    <label className={styles.fieldLabel} htmlFor="email">Email address</label>
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailError('') }}
                      placeholder="you@example.com"
                      className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                      autoFocus
                      autoComplete="email"
                    />
                    {emailError && <p className={styles.errorMsg} role="alert">{emailError}</p>}
                  </div>
                  <div>
                    <label className={styles.fieldLabel} htmlFor="password">Password</label>
                    <div className={styles.passwordInput}>
                      <input
                        id="password"
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                        placeholder="••••••••"
                        className={`${styles.input} ${styles.passwordField} ${passwordError ? styles.inputError : ''}`}
                        autoComplete="current-password"
                        onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPw(v => !v)}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordError && <p className={styles.errorMsg} role="alert">{passwordError}</p>}
                    <div className={styles.forgotRow}>
                      <Link to="/forgot-password" className={styles.inlineLink}>Forgot password?</Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Credentials — phone */}
              {step === 'credentials' && method === 'phone' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="mobile">
                    Mobile number / मोबाइल नंबर
                  </label>
                  <div className={styles.phoneInput}>
                    <span className={styles.phonePrefix}>+91</span>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setMobileError('') }}
                      placeholder="98765 43210"
                      className={`${styles.input} ${mobileError ? styles.inputError : ''}`}
                      autoFocus
                    />
                  </div>
                  {mobileError && <p className={styles.errorMsg} role="alert">{mobileError}</p>}
                  <p className={styles.helperText}>We will send a 6-digit OTP to this number.</p>
                </div>
              )}

              {/* Step: OTP */}
              {step === 'otp' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="otp">Enter OTP / OTP दर्ज करें</label>
                  <input
                    id="otp"
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError('') }}
                    placeholder="• • • • • •"
                    className={`${styles.input} ${styles.otpInput} ${otpError ? styles.inputError : ''}`}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  />
                  {otpError && <p className={styles.errorMsg} role="alert">{otpError}</p>}
                  <button
                    type="button"
                    className={styles.resendBtn}
                    disabled={resendTimer > 0}
                    onClick={handleResend}
                  >
                    <RefreshCw size={13} aria-hidden />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              )}

              {/* CTA button */}
              <div className={styles.ctaGroup}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={loading}
                  onClick={
                    step === 'role' ? () => { setMethod('email'); setStep('credentials') }
                      : step === 'credentials' && method === 'email' ? handleEmailLogin
                        : step === 'credentials' && method === 'phone' ? handleSendOtp
                          : handleVerifyOtp
                  }
                >
                  {loading ? 'Please wait…' : (
                    <>
                      {step === 'role' && <><Mail size={16} aria-hidden /><span>Continue with email</span><ChevronRight size={16} /></>}
                      {step === 'credentials' && method === 'email' && <><Mail size={16} aria-hidden /><span>Sign in</span><ChevronRight size={16} /></>}
                      {step === 'credentials' && method === 'phone' && <><Phone size={16} aria-hidden /><span>Send OTP / OTP भेजें</span><ChevronRight size={16} /></>}
                      {step === 'otp' && <><CheckCircle size={16} aria-hidden /><span>Verify & Sign in</span><ChevronRight size={16} /></>}
                    </>
                  )}
                </button>

                {/* Method toggle */}
                {step === 'credentials' && (
                  <button
                    type="button"
                    className={styles.altMethodBtn}
                    onClick={() => setMethod(m => m === 'email' ? 'phone' : 'email')}
                  >
                    {method === 'email' ? 'Use mobile OTP instead' : 'Use email & password instead'}
                  </button>
                )}

                {step !== 'role' && (
                  <button
                    type="button"
                    className={styles.backLink}
                    onClick={() => step === 'otp' ? setStep('credentials') : setStep('role')}
                  >
                    ← Back
                  </button>
                )}
              </div>

              {/* Google sign-in */}
              {(step === 'role' || step === 'credentials') && (
                <div className={styles.altLogin}>
                  <span className={styles.altDivider}>or</span>
                  <button type="button" className={styles.altBtn} onClick={handleGoogle}>
                    Sign in with Google
                  </button>
                </div>
              )}

              {step === 'role' && (
                <p className={styles.registerLink}>
                  New to Krishi Mitra?{' '}
                  <Link to="/register" className={styles.inlineLink}>Create account</Link>
                </p>
              )}
            </>
          )}
        </div>

        <div className={styles.footerLinks}>
          <button type="button" className={styles.footerLink}>ISO 27001 Certified</button>
          <button type="button" className={styles.footerLink}>RBI Regulated Entity</button>
          <button type="button" className={styles.footerLink}>Privacy Policy</button>
        </div>
      </div>
    </div>
  )
}

function TrustStat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.trustStat}>
      <span className={styles.trustValue}>{value}</span>
      <span className={styles.trustLabel}>{label}</span>
    </div>
  )
}
