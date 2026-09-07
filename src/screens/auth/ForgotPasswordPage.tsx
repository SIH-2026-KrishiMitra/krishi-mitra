import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, CheckCircle, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './ForgotPasswordPage.module.css'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('forgot.email_invalid'))
      return
    }
    setEmailError('')
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('forgot.send_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>KM</div>
          <span className={styles.logoName}>{t('common:app.name')}</span>
        </div>

        {sent ? (
          <div className={styles.successState}>
            <CheckCircle size={40} className={styles.successIcon} />
            <h2 className={styles.title}>{t('forgot.success_title')}</h2>
            <p className={styles.sub}>{t('forgot.success_sub', { email })}</p>
            <Link to="/login" className={styles.backToLogin}>{t('forgot.back_to_login')}</Link>
          </div>
        ) : (
          <>
            <div className={styles.badge}>
              <Shield size={12} aria-hidden />
              <span>{t('common:trust.secure_reset')}</span>
            </div>
            <h2 className={styles.title}>{t('forgot.title')}</h2>
            <p className={styles.sub}>{t('forgot.sub')}</p>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="email">{t('fields.email')}</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} aria-hidden />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  placeholder="you@example.com"
                  className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoComplete="email"
                />
              </div>
              {emailError && <p className={styles.errorMsg} role="alert">{emailError}</p>}
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? t('common:actions.sending') : t('forgot.cta')}
            </button>

            <Link to="/login" className={styles.backToLogin}>{t('forgot.back_to_login')}</Link>
          </>
        )}
      </div>
    </div>
  )
}
