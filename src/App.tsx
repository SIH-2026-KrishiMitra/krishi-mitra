import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
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

// Buyer screens
import BuyerHome from './screens/buyer/BuyerHome'
import BuyerMarketplace from './screens/buyer/BuyerMarketplace'
import BuyerOffers from './screens/buyer/BuyerOffers'
import BuyerDeals from './screens/buyer/BuyerDeals'
import BuyerPayments from './screens/buyer/BuyerPayments'
import BuyerProfile from './screens/buyer/BuyerProfile'
import { BuyerProvider } from './context/BuyerContext'

// Admin screens — existing
import AdminHome from './screens/admin/AdminHome'
import AdminUsers from './screens/admin/AdminUsers'
import AdminPayments from './screens/admin/AdminPayments'
import AdminSettings from './screens/admin/AdminSettings'
import { AdminProvider } from './context/AdminContext'

// Admin screens — new
import AdminFarmers from './screens/admin/AdminFarmers'
import AdminBuyers from './screens/admin/AdminBuyers'
import AdminKyc from './screens/admin/AdminKyc'
import AdminProducts from './screens/admin/AdminProducts'
import AdminCategories from './screens/admin/AdminCategories'
import AdminOrders from './screens/admin/AdminOrders'
import AdminTransactions from './screens/admin/AdminTransactions'
import AdminPayouts from './screens/admin/AdminPayouts'
import AdminRefunds from './screens/admin/AdminRefunds'
import AdminComplaints from './screens/admin/AdminComplaints'
import AdminReviews from './screens/admin/AdminReviews'
import AdminNotifications from './screens/admin/AdminNotifications'
import AdminAnalytics from './screens/admin/AdminAnalytics'
import AdminAdmins from './screens/admin/AdminAdmins'
import AdminAuditLogs from './screens/admin/AdminAuditLogs'

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
  const { user, role, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (role === 'farmer') return <Navigate to="/farmer/home" replace />
  if (role === 'buyer') return <Navigate to="/buyer/home" replace />
  if (role === 'admin') return <Navigate to="/admin/home" replace />
  if (user && !role) return <LoadingScreen />
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
  const { user, role, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (role === 'farmer') return <Navigate to="/farmer/home" replace />
  if (role === 'buyer') return <Navigate to="/buyer/home" replace />
  if (role === 'admin') return <Navigate to="/admin/home" replace />
  if (user && !role) return <LoadingScreen />
  return <Navigate to="/login" replace />
}

// ─── Area wrappers ────────────────────────────────────────────────────────────

function FarmerArea({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>
}

function BuyerArea({ children }: { children: ReactNode }) {
  return <BuyerProvider>{children}</BuyerProvider>
}

function AdminArea({ children }: { children: ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>
}

// ─── Admin route helper ───────────────────────────────────────────────────────

function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="admin">
      <AdminArea>{children}</AdminArea>
    </RoleGuard>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
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
          <Route path="/auth/callback" element={<RootRedirect />} />

          {/* Auth (guest-only) */}
          <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
          <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />

          {/* ── Farmer routes ─────────────────────────────────────────── */}
          <Route path="/farmer/home" element={<RoleGuard role="farmer"><FarmerArea><FarmerHome /></FarmerArea></RoleGuard>} />
          <Route path="/farmer/markets" element={<RoleGuard role="farmer"><FarmerArea><FarmerMarkets /></FarmerArea></RoleGuard>} />
          <Route path="/farmer/create-lot" element={<RoleGuard role="farmer"><FarmerArea><FarmerCreateLot /></FarmerArea></RoleGuard>} />
          <Route path="/farmer/lots" element={<RoleGuard role="farmer"><FarmerArea><FarmerLots /></FarmerArea></RoleGuard>} />
          <Route path="/farmer/offers" element={<RoleGuard role="farmer"><FarmerArea><FarmerOffers /></FarmerArea></RoleGuard>} />
          <Route path="/farmer/deals" element={<RoleGuard role="farmer"><FarmerArea><FarmerDeals /></FarmerArea></RoleGuard>} />
          <Route path="/farmer/money" element={<RoleGuard role="farmer"><FarmerArea><FarmerMoney /></FarmerArea></RoleGuard>} />
          <Route path="/farmer/help" element={<RoleGuard role="farmer"><FarmerArea><FarmerHelp /></FarmerArea></RoleGuard>} />
          <Route path="/farmer/profile" element={<RoleGuard role="farmer"><FarmerArea><FarmerProfile /></FarmerArea></RoleGuard>} />

          {/* Farmer legacy redirects */}
          <Route path="/farmer/market" element={<Navigate to="/farmer/markets" replace />} />
          <Route path="/farmer/lots/create" element={<Navigate to="/farmer/create-lot" replace />} />
          <Route path="/farmer/activity" element={<Navigate to="/farmer/home" replace />} />
          <Route path="/farmer/prices" element={<Navigate to="/farmer/markets" replace />} />
          <Route path="/farmer/*" element={<Navigate to="/farmer/home" replace />} />

          {/* ── Buyer routes ──────────────────────────────────────────── */}
          <Route path="/buyer/home" element={<RoleGuard role="buyer"><BuyerArea><BuyerHome /></BuyerArea></RoleGuard>} />
          <Route path="/buyer/marketplace" element={<RoleGuard role="buyer"><BuyerArea><BuyerMarketplace /></BuyerArea></RoleGuard>} />
          <Route path="/buyer/offers" element={<RoleGuard role="buyer"><BuyerArea><BuyerOffers /></BuyerArea></RoleGuard>} />
          <Route path="/buyer/deals" element={<RoleGuard role="buyer"><BuyerArea><BuyerDeals /></BuyerArea></RoleGuard>} />
          <Route path="/buyer/payments" element={<RoleGuard role="buyer"><BuyerArea><BuyerPayments /></BuyerArea></RoleGuard>} />
          <Route path="/buyer/profile" element={<RoleGuard role="buyer"><BuyerArea><BuyerProfile /></BuyerArea></RoleGuard>} />
          <Route path="/buyer/*" element={<Navigate to="/buyer/home" replace />} />

          {/* ── Admin routes ──────────────────────────────────────────── */}
          {/* Root admin redirect */}
          <Route path="/admin" element={<Navigate to="/admin/home" replace />} />

          {/* Dashboard */}
          <Route path="/admin/home" element={<AdminRoute><AdminHome /></AdminRoute>} />

          {/* Users */}
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/farmers" element={<AdminRoute><AdminFarmers /></AdminRoute>} />
          <Route path="/admin/buyers" element={<AdminRoute><AdminBuyers /></AdminRoute>} />
          <Route path="/admin/kyc" element={<AdminRoute><AdminKyc /></AdminRoute>} />

          {/* Marketplace */}
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />

          {/* Orders & Transactions */}
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
          <Route path="/admin/payouts" element={<AdminRoute><AdminPayouts /></AdminRoute>} />
          <Route path="/admin/refunds" element={<AdminRoute><AdminRefunds /></AdminRoute>} />

          {/* Support */}
          <Route path="/admin/complaints" element={<AdminRoute><AdminComplaints /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />

          {/* Analytics */}
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />

          {/* Admin Management */}
          <Route path="/admin/admins" element={<AdminRoute><AdminAdmins /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />

          {/* Settings */}
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

          {/* Old route redirects */}
          <Route path="/admin/lots" element={<Navigate to="/admin/products" replace />} />
          <Route path="/admin/deals" element={<Navigate to="/admin/orders" replace />} />
          <Route path="/admin/grievances" element={<Navigate to="/admin/complaints" replace />} />

          {/* Admin catch-all */}
          <Route path="/admin/*" element={<Navigate to="/admin/home" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<AuthGuard><RootRedirect /></AuthGuard>} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}
