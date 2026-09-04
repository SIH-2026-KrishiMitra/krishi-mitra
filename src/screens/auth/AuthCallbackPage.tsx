import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const fallback = useRef<ReturnType<typeof setTimeout>>()

  // Fallback: if no profile appears within 10 s, something went wrong — go to login
  useEffect(() => {
    fallback.current = setTimeout(() => navigate('/login', { replace: true }), 10_000)
    return () => clearTimeout(fallback.current)
  }, [navigate])

  // As soon as the profile loads (Supabase session established + DB profile fetched),
  // redirect to the role-appropriate dashboard
  useEffect(() => {
    if (!profile) return
    clearTimeout(fallback.current)
    const dest =
      profile.role === 'buyer' ? '/buyer/home' :
      profile.role === 'admin' ? '/admin/home' :
      '/farmer/home'
    navigate(dest, { replace: true })
  }, [profile, navigate])

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-canvas)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: 'var(--green-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-5)',
          fontSize: 'var(--text-sm)', fontWeight: 700, color: '#fff',
        }}>KM</div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Signing you in…</p>
      </div>
    </div>
  )
}
