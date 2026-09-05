import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'farmer' | 'buyer' | 'admin'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  email: string | null
  avatar_url: string | null
  language: string
  suspended: boolean
  created_at: string
  updated_at: string
}

export interface FarmerSignUpData {
  full_name: string
  phone: string
  email: string
  password: string
  village: string
  district: string
  state: string
  language: string
}

export interface BuyerSignUpData {
  org_name: string
  contact_person: string
  phone: string
  email: string
  password: string
  buyer_type: 'processor' | 'trader' | 'retailer' | 'mandi' | 'fpo'
  location: string
  district: string
  state: string
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: (role?: UserRole) => Promise<void>
  signInWithPhone: (phone: string) => Promise<void>
  verifyOtp: (phone: string, token: string) => Promise<void>
  signUpFarmer: (data: FarmerSignUpData) => Promise<void>
  signUpBuyer: (data: BuyerSignUpData) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      setProfile(null)
    } else {
      setProfile(data as Profile)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return
        setSession(s)
        setUser(s?.user ?? null)

        if (s?.user) {
          // For new Google OAuth users: update profile to the role the user selected
          // before the OAuth redirect (saved in localStorage as oauth_intended_role).
          const intendedRole = localStorage.getItem('oauth_intended_role') as UserRole | null
          if (intendedRole) {
            localStorage.removeItem('oauth_intended_role')
            const { data: existing } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', s.user.id)
              .single()

            // Update role if this is a brand-new user (trigger defaults OAuth users to 'farmer')
            // or if somehow no profile exists yet.
            if (!existing || existing.role === 'farmer' || existing.role === 'needs_setup') {
              const meta = s.user.user_metadata ?? {}
              await supabase.from('profiles').upsert({
                id: s.user.id,
                role: intendedRole,
                full_name: (meta.full_name as string) || (meta.name as string) || '',
                email: s.user.email ?? null,
                avatar_url: (meta.avatar_url as string) || (meta.picture as string) || null,
                phone: null,
                language: 'en',
                suspended: false,
              })

              // Create role-specific sub-profile if buyer was selected
              if (intendedRole === 'buyer') {
                await supabase.from('buyer_profiles').upsert({
                  id: s.user.id,
                  org_name: '',
                  contact_person: (meta.full_name as string) || (meta.name as string) || '',
                  buyer_type: 'trader',
                  location: '',
                  district: '',
                  state: '',
                })
              } else if (intendedRole === 'farmer') {
                await supabase.from('farmer_profiles').upsert({
                  id: s.user.id,
                  village: '',
                  district: '',
                  state: '',
                  member_since: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
                })
              }
            }
          }
          if (mounted) await fetchProfile(s.user.id)
        } else {
          if (mounted) {
            setProfile(null)
            setLoading(false)
          }
        }
      }
    )

    // getSession triggers INITIAL_SESSION in onAuthStateChange above.
    // We only use it here as a safety net to turn off loading if there's no session.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s?.user && mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signInWithGoogle = useCallback(async (role?: UserRole) => {
    if (role) localStorage.setItem('oauth_intended_role', role)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      if (role) localStorage.removeItem('oauth_intended_role')
      throw error
    }
  }, [])

  const signInWithPhone = useCallback(async (phone: string) => {
    // Normalize to E.164 format
    const e164 = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
    if (error) throw error
  }, [])

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const e164 = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.verifyOtp({ phone: e164, token, type: 'sms' })
    if (error) throw error
  }, [])

  const signUpFarmer = useCallback(async (data: FarmerSignUpData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'farmer',
          full_name: data.full_name,
          phone: data.phone,
          village: data.village,
          district: data.district,
          state: data.state,
          language: data.language,
        },
      },
    })
    if (error) throw error
  }, [])

  const signUpBuyer = useCallback(async (data: BuyerSignUpData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'buyer',
          full_name: data.contact_person,
          phone: data.phone,
          org_name: data.org_name,
          contact_person: data.contact_person,
          buyer_type: data.buyer_type,
          location: data.location,
          district: data.district,
          state: data.state,
        },
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  const role = profile?.role ?? null

  return (
    <AuthContext.Provider value={{
      user, session, profile, role, loading,
      signInWithEmail, signInWithGoogle, signInWithPhone, verifyOtp,
      signUpFarmer, signUpBuyer, signOut, resetPassword, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
