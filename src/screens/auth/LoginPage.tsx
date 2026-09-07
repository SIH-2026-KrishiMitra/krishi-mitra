import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail, Phone, ChevronRight, Shield, RefreshCw, CheckCircle,
  Eye, EyeOff,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import { SUPPORTED_LANGUAGES, type LangCode } from '../../i18n'
import toast from 'react-hot-toast'
import styles from './LoginPage.module.css'

type Role = 'farmer' | 'buyer'
type Method = 'email' | 'phone'
type Step = 'role' | 'credentials' | 'otp' | 'success'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signInWithEmail, signInWithGoogle, signInWithPhone, verifyOtp } = useAuth()
  const { t } = useTranslation('auth')
  const { lang, setLang } = useLang()

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
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(iv); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function validateEmail() {
    if (!email.trim()) { setEmailError(t('errors.email_required')); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError(t('errors.email_invalid')); return false }
    setEmailError('')
    return true
  }

  function validatePassword() {
    if (!password) { setPasswordError(t('errors.password_required')); return false }
    setPasswordError('')
    return true
  }

  function validateMobile() {
    if (!/^\d{10}$/.test(mobile)) { setMobileError(t('errors.mobile_invalid')); return false }
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
      const msg = err instanceof Error ? err.message : t('errors.login_failed')
      if (msg.toLowerCase().includes('invalid')) {
        setPasswordError(t('errors.incorrect_credentials'))
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
      const msg = err instanceof Error ? err.message : t('errors.otp_send_failed')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (!otp || otp.length < 6) { setOtpError(t('errors.otp_required')); return }
    setLoading(true)
    try {
      await verifyOtp(mobile, otp)
      setStep('success')
    } catch {
      setOtpError(t('errors.otp_wrong'))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle(role)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('errors.google_failed'))
    }
  }

  function handleResend() {
    setOtp('')
    setOtpError('')
    handleSendOtp()
  }

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
              <p className={styles.logoName}>{t('common:app.name')}</p>
              <p className={styles.logoTagline}>{t('common:app.tagline')}</p>
            </div>
          </div>
          <div className={styles.headline}>
            <h1 className={styles.headlineTitle}>{t('login.headline')}</h1>
            <p className={styles.headlineSub}>{t('login.headline_sub')}</p>
          </div>
          <div className={styles.testimonial}>
            <p className={styles.testimonialText}>{t('login.testimonial')}</p>
            <p className={styles.testimonialAuthor}>{t('login.testimonial_author')}</p>
          </div>
          <div className={styles.trustRow}>
            <TrustStat value="3,460+" label={t('common:trust.ncfm')} />
            <TrustStat value="₹0 Fee" label={t('common:trust.direct_mandi')} />
            <TrustStat value="100%" label={t('common:trust.escrow')} />
            <TrustStat value="< 12 mins" label={t('common:trust.pledge')} />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.rightPanel}>
        {/* Pre-auth language selector */}
        <div className={styles.rightHeader}>
          <select
            className={styles.langSelector}
            value={lang}
            onChange={e => setLang(e.target.value as LangCode)}
            aria-label="Language / भाषा"
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code} lang={l.code}>{l.nativeLabel}</option>
            ))}
          </select>
        </div>

        <div className={styles.formBox}>
          {step === 'success' ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}><CheckCircle size={48} /></div>
              <h2 className={styles.successTitle}>{t('login.success_title')}</h2>
              <p className={styles.successSub}>{t('login.success_sub')}</p>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <div className={styles.kycBadge}>
                  <Shield size={12} aria-hidden />
                  <span>{t('common:trust.kyc_enabled')}</span>
                </div>
                <h2 className={styles.formTitle}>
                  {step === 'role' && t('login.title_role')}
                  {step === 'credentials' && (method === 'email' ? t('login.title_email') : t('login.title_phone'))}
                  {step === 'otp' && t('login.title_otp')}
                </h2>
                <p className={styles.formSub}>
                  {step === 'role' && t('login.sub_role')}
                  {step === 'credentials' && t('login.sub_credentials', { role: t(`roles.${role}_title`) })}
                  {step === 'otp' && t('login.sub_otp', { phone: mobile.slice(0, 5) + 'XXXXX' })}
                </p>
              </div>

              {/* Step: Role */}
              {step === 'role' && (
                <div className={styles.roleGroup}>
                  <p className={styles.fieldLabel}>{t('login.role_label')}</p>
                  <div className={styles.roleCards}>
                    {(['farmer', 'buyer'] as Role[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`${styles.roleCard} ${role === r ? styles.roleCardActive : ''}`}
                        onClick={() => setRole(r)}
                      >
                        <span className={styles.roleTitle}>{t(`roles.${r}_title`)}</span>
                        <span className={styles.roleSub}>{t(`roles.${r}_sub`)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Credentials — email */}
              {step === 'credentials' && method === 'email' && (
                <div className={styles.fieldGroup}>
                  <div>
                    <label className={styles.fieldLabel} htmlFor="email">{t('fields.email')}</label>
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
                    <label className={styles.fieldLabel} htmlFor="password">{t('fields.password')}</label>
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
                        aria-label={showPw ? t('login.hide_password') : t('login.show_password')}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordError && <p className={styles.errorMsg} role="alert">{passwordError}</p>}
                    <div className={styles.forgotRow}>
                      <Link to="/forgot-password" className={styles.inlineLink}>{t('login.forgot_password')}</Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Credentials — phone */}
              {step === 'credentials' && method === 'phone' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="mobile">
                    {t('login.mobile_label_bilingual')}
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
                  <p className={styles.helperText}>{t('login.otp_helper')}</p>
                </div>
              )}

              {/* Step: OTP */}
              {step === 'otp' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="otp">{t('login.otp_label')}</label>
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
                    {resendTimer > 0
                      ? t('login.cta_resend_timer', { seconds: resendTimer })
                      : t('login.cta_resend')}
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
                  {loading ? t('common:actions.loading') : (
                    <>
                      {step === 'role' && <><Mail size={16} aria-hidden /><span>{t('login.cta_email')}</span><ChevronRight size={16} /></>}
                      {step === 'credentials' && method === 'email' && <><Mail size={16} aria-hidden /><span>{t('login.cta_sign_in')}</span><ChevronRight size={16} /></>}
                      {step === 'credentials' && method === 'phone' && <><Phone size={16} aria-hidden /><span>{t('login.cta_send_otp')}</span><ChevronRight size={16} /></>}
                      {step === 'otp' && <><CheckCircle size={16} aria-hidden /><span>{t('login.cta_verify')}</span><ChevronRight size={16} /></>}
                    </>
                  )}
                </button>

                {step === 'credentials' && (
                  <button
                    type="button"
                    className={styles.altMethodBtn}
                    onClick={() => setMethod(m => m === 'email' ? 'phone' : 'email')}
                  >
                    {method === 'email' ? t('login.method_use_phone') : t('login.method_use_email')}
                  </button>
                )}

                {step !== 'role' && (
                  <button
                    type="button"
                    className={styles.backLink}
                    onClick={() => step === 'otp' ? setStep('credentials') : setStep('role')}
                  >
                    {t('login.back')}
                  </button>
                )}
              </div>

              {/* Google sign-in */}
              {(step === 'role' || step === 'credentials') && (
                <div className={styles.altLogin}>
                  <span className={styles.altDivider}>{t('common:or')}</span>
                  <button type="button" className={styles.altBtn} onClick={handleGoogle}>
                    {t('login.cta_google')}
                  </button>
                </div>
              )}

              {step === 'role' && (
                <p className={styles.registerLink}>
                  {t('login.new_user')}{' '}
                  <Link to="/register" className={styles.inlineLink}>{t('login.create_account')}</Link>
                </p>
              )}
            </>
          )}
        </div>

        <div className={styles.footerLinks}>
          <button type="button" className={styles.footerLink}>{t('common:trust.iso')}</button>
          <button type="button" className={styles.footerLink}>{t('common:trust.rbi')}</button>
          <button type="button" className={styles.footerLink}>{t('common:trust.privacy')}</button>
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
