import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, CheckCircle, Mail } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './ForgotPasswordPage.module.css'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address')
      return
    }
    setEmailError('')
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>KM</div>
          <span className={styles.logoName}>Krishi Mitra</span>
        </div>

        {sent ? (
          <div className={styles.successState}>
            <CheckCircle size={40} className={styles.successIcon} />
            <h2 className={styles.title}>Check your email</h2>
            <p className={styles.sub}>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <Link to="/login" className={styles.backToLogin}>Back to login</Link>
          </div>
        ) : (
          <>
            <div className={styles.badge}>
              <Shield size={12} aria-hidden />
              <span>Secure reset</span>
            </div>
            <h2 className={styles.title}>Reset your password</h2>
            <p className={styles.sub}>
              Enter your registered email address. We'll send you a secure link to reset your password.
            </p>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="email">Email address</label>
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
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <Link to="/login" className={styles.backToLogin}>← Back to login</Link>
          </>
        )}
      </div>
    </div>
  )
}
