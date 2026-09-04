import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import type { ReactNode } from 'react'
import type { UserRole } from './context/AuthContext'

// Auth screens
import LoginPage from './screens/auth/LoginPage'
import RegisterPage from './screens/auth/RegisterPage'
import ForgotPasswordPage from './screens/auth/ForgotPasswordPage'

// Farmer screens
import FarmerHome from './screens/farmer/FarmerHome'
import FarmerMarkets from './screens/farmer/FarmerMarkets'
import FarmerCreateLot from './screens/farmer/FarmerCreateLot'
import FarmerLots from './screens/farmer/FarmerLots'
import FarmerOffers from './screens/farmer/FarmerOffers'
import FarmerDeals from './screens/farmer/FarmerDeals'
import FarmerMoney from './screens/farmer/FarmerMoney'
import FarmerHelp from './screens/farmer/FarmerHelp'
import FarmerProfile from './screens/farmer/FarmerProfile'

// Buyer screens (stub pages until M4)
import BuyerHome from './screens/buyer/BuyerHome'

// Admin screens (stub pages until M5)
import AdminHome from './screens/admin/AdminHome'

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
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
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    </div>
  )
}

// ─── Guards ───────────────────────────────────────────────────────────────────

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestGuard({ children }: { children: ReactNode }) {
  const { role, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (role === 'farmer') return <Navigate to="/farmer/home" replace />
  if (role === 'buyer') return <Navigate to="/buyer/home" replace />
  if (role === 'admin') return <Navigate to="/admin/home" replace />
  return <>{children}</>
}

function RoleGuard({ children, role: required }: { children: ReactNode; role: UserRole }) {
  const { role, user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (role !== required) {
    if (role === 'farmer') return <Navigate to="/farmer/home" replace />
    if (role === 'buyer') return <Navigate to="/buyer/home" replace />
    if (role === 'admin') return <Navigate to="/admin/home" replace />
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// ─── Root redirect based on role ─────────────────────────────────────────────

function RootRedirect() {
  const { role, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (role === 'farmer') return <Navigate to="/farmer/home" replace />
  if (role === 'buyer') return <Navigate to="/buyer/home" replace />
  if (role === 'admin') return <Navigate to="/admin/home" replace />
  return <Navigate to="/login" replace />
}

// ─── Farmer area (wraps AppProvider for farmer-specific state) ────────────────

function FarmerArea({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-core)',
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
            },
          }}
        />
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth (guest-only) */}
          <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
          <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />

          {/* ── Farmer routes ─────────────────────────────────────────── */}
          <Route path="/farmer/home" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerHome /></FarmerArea></RoleGuard>
          } />
          <Route path="/farmer/markets" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerMarkets /></FarmerArea></RoleGuard>
          } />
          <Route path="/farmer/create-lot" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerCreateLot /></FarmerArea></RoleGuard>
          } />
          <Route path="/farmer/lots" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerLots /></FarmerArea></RoleGuard>
          } />
          <Route path="/farmer/offers" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerOffers /></FarmerArea></RoleGuard>
          } />
          <Route path="/farmer/deals" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerDeals /></FarmerArea></RoleGuard>
          } />
          <Route path="/farmer/money" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerMoney /></FarmerArea></RoleGuard>
          } />
          <Route path="/farmer/help" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerHelp /></FarmerArea></RoleGuard>
          } />
          <Route path="/farmer/profile" element={
            <RoleGuard role="farmer"><FarmerArea><FarmerProfile /></FarmerArea></RoleGuard>
          } />

          {/* Farmer legacy redirects */}
          <Route path="/farmer/market" element={<Navigate to="/farmer/markets" replace />} />
          <Route path="/farmer/lots/create" element={<Navigate to="/farmer/create-lot" replace />} />
          <Route path="/farmer/activity" element={<Navigate to="/farmer/home" replace />} />
          <Route path="/farmer/prices" element={<Navigate to="/farmer/markets" replace />} />
          <Route path="/farmer/*" element={<Navigate to="/farmer/home" replace />} />

          {/* ── Buyer routes ──────────────────────────────────────────── */}
          <Route path="/buyer/home" element={
            <RoleGuard role="buyer"><BuyerHome /></RoleGuard>
          } />
          <Route path="/buyer/*" element={<Navigate to="/buyer/home" replace />} />

          {/* ── Admin routes ──────────────────────────────────────────── */}
          <Route path="/admin/home" element={
            <RoleGuard role="admin"><AdminHome /></RoleGuard>
          } />
          <Route path="/admin/*" element={<Navigate to="/admin/home" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<AuthGuard><RootRedirect /></AuthGuard>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
