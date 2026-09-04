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
  signInWithGoogle: () => Promise<void>
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        fetchProfile(s.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          await fetchProfile(s.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
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
