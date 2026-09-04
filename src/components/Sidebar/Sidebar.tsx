import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, TrendingUp, Package, Users, FileText,
  Wallet, HelpCircle, Volume2, CheckCircle,
  ShoppingBag, BarChart3, Settings, Shield,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppSafe } from '../../context/AppContext'
import styles from './Sidebar.module.css'

interface NavItem {
  id: string
  label: string
  path: string
  Icon: LucideIcon
  badgeKey?: string
}

// ─── Farmer nav ───────────────────────────────────────────────────────────────

const FARMER_NAV: NavItem[] = [
  { id: 'home',    label: 'Home',             path: '/farmer/home',    Icon: Home },
  { id: 'markets', label: 'Markets',           path: '/farmer/markets', Icon: TrendingUp },
  { id: 'lots',    label: 'My lots',           path: '/farmer/lots',    Icon: Package,   badgeKey: 'lots' },
  { id: 'offers',  label: 'Buyers & offers',   path: '/farmer/offers',  Icon: Users,     badgeKey: 'offers' },
  { id: 'deals',   label: 'My deals',          path: '/farmer/deals',   Icon: FileText,  badgeKey: 'deals' },
  { id: 'money',   label: 'Money',             path: '/farmer/money',   Icon: Wallet },
  { id: 'help',    label: 'Help & complaints', path: '/farmer/help',    Icon: HelpCircle },
]

function getFarmerActiveId(pathname: string): string {
  if (pathname.startsWith('/farmer/markets')) return 'markets'
  if (pathname.startsWith('/farmer/lots/create')) return 'lots'
  if (pathname.startsWith('/farmer/lots')) return 'lots'
  if (pathname.startsWith('/farmer/offers')) return 'offers'
  if (pathname.startsWith('/farmer/deals')) return 'deals'
  if (pathname.startsWith('/farmer/money')) return 'money'
  if (pathname.startsWith('/farmer/help')) return 'help'
  if (pathname.startsWith('/farmer/profile')) return 'profile'
  return 'home'
}

// ─── Buyer nav ────────────────────────────────────────────────────────────────

const BUYER_NAV: NavItem[] = [
  { id: 'home',        label: 'Dashboard',     path: '/buyer/home',        Icon: Home },
  { id: 'marketplace', label: 'Marketplace',   path: '/buyer/marketplace', Icon: ShoppingBag },
  { id: 'offers',      label: 'My offers',     path: '/buyer/offers',      Icon: Users },
  { id: 'deals',       label: 'My deals',      path: '/buyer/deals',       Icon: FileText },
  { id: 'payments',    label: 'Payments',      path: '/buyer/payments',    Icon: Wallet },
]

function getBuyerActiveId(pathname: string): string {
  if (pathname.startsWith('/buyer/marketplace')) return 'marketplace'
  if (pathname.startsWith('/buyer/offers')) return 'offers'
  if (pathname.startsWith('/buyer/deals')) return 'deals'
  if (pathname.startsWith('/buyer/payments')) return 'payments'
  if (pathname.startsWith('/buyer/profile')) return 'profile'
  return 'home'
}

// ─── Admin nav ────────────────────────────────────────────────────────────────

const ADMIN_NAV: NavItem[] = [
  { id: 'home',       label: 'Dashboard',   path: '/admin/home',       Icon: BarChart3 },
  { id: 'users',      label: 'Users',       path: '/admin/users',      Icon: Users },
  { id: 'lots',       label: 'Listings',    path: '/admin/lots',       Icon: Package },
  { id: 'deals',      label: 'Deals',       path: '/admin/deals',      Icon: FileText },
  { id: 'payments',   label: 'Payments',    path: '/admin/payments',   Icon: Wallet },
  { id: 'grievances', label: 'Grievances',  path: '/admin/grievances', Icon: HelpCircle },
  { id: 'settings',   label: 'Settings',    path: '/admin/settings',   Icon: Settings },
]

function getAdminActiveId(pathname: string): string {
  if (pathname.startsWith('/admin/users')) return 'users'
  if (pathname.startsWith('/admin/lots')) return 'lots'
  if (pathname.startsWith('/admin/deals')) return 'deals'
  if (pathname.startsWith('/admin/payments')) return 'payments'
  if (pathname.startsWith('/admin/grievances')) return 'grievances'
  if (pathname.startsWith('/admin/settings')) return 'settings'
  return 'home'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, role } = useAuth()

  // Safe — returns null when outside AppProvider (buyer/admin routes)
  const farmerCtx = useAppSafe()

  const isFarmer = role === 'farmer'
  const isBuyer = role === 'buyer'
  const isAdmin = role === 'admin'

  const navItems = isFarmer ? FARMER_NAV : isBuyer ? BUYER_NAV : ADMIN_NAV
  const activeId = isFarmer
    ? getFarmerActiveId(location.pathname)
    : isBuyer
      ? getBuyerActiveId(location.pathname)
      : getAdminActiveId(location.pathname)

  const badges: Record<string, number> = isFarmer && farmerCtx
    ? { lots: farmerCtx.activeLotsCount, offers: farmerCtx.offersCount, deals: farmerCtx.dealsCount }
    : {}

  const homeRoute = isFarmer ? '/farmer/home' : isBuyer ? '/buyer/home' : '/admin/home'
  const profileRoute = isFarmer ? '/farmer/profile' : isBuyer ? '/buyer/profile' : '/admin/settings'
  const roleLabel = isFarmer ? 'FARMER WORKSPACE' : isBuyer ? 'BUYER PORTAL' : 'ADMIN DASHBOARD'

  const sidebarClass = `${styles.sidebar} ${isBuyer ? styles.sidebarBuyer : isAdmin ? styles.sidebarAdmin : ''}`

  const displayName = profile?.full_name || (isBuyer ? 'Buyer' : isAdmin ? 'Admin' : 'Farmer')
  const displayMeta = isBuyer ? (profile?.email ?? '') : isAdmin ? 'Administrator' : ''

  return (
    <aside className={sidebarClass}>
      {/* Brand */}
      <div
        className={styles.brand}
        onClick={() => navigate(homeRoute)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(homeRoute)}
      >
        <div className={styles.brandMark}>
          <span className={styles.brandMonogram}>KM</span>
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Krishi Mitra</span>
          <span className={styles.brandRole}>{roleLabel}</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className={styles.nav} aria-label="Main navigation">
        {navItems.map(({ id, label, path, Icon, badgeKey }) => {
          const count = badgeKey ? (badges[badgeKey] ?? 0) : 0
          const isActive = activeId === id
          return (
            <button
              key={id}
              type="button"
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => navigate(path)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} className={styles.navIcon} aria-hidden />
              <span className={styles.navLabel}>{label}</span>
              {count > 0 && <span className={styles.badge}>{count}</span>}
            </button>
          )
        })}
      </nav>

      <div className={styles.spacer} />

      {/* Listen row — only for farmer */}
      {isFarmer && (
        <div className={styles.listenRow}>
          <Volume2 size={16} className={styles.listenIcon} aria-hidden />
          <div>
            <p className={styles.listenTitle}>Listen to this page</p>
            <p className={styles.listenSub}>Voice guidance in Marathi, Hindi and English</p>
          </div>
        </div>
      )}

      {/* Security badge for admin */}
      {isAdmin && (
        <div className={styles.adminBadge}>
          <Shield size={14} aria-hidden />
          <span>Admin access</span>
        </div>
      )}

      {/* User profile row */}
      <div
        className={styles.userRow}
        onClick={() => navigate(profileRoute)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(profileRoute)}
      >
        <div className={styles.userAvatar}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.userMeta}>
            {isFarmer ? (
              <>
                {(farmerCtx?.state.farmer.village ?? '')}
                {farmerCtx?.state.farmer.verified && (
                  <CheckCircle size={10} className={styles.verifiedIcon} aria-label="Verified" />
                )}
                {farmerCtx?.state.farmer.verified ? ' Verified' : ''}
              </>
            ) : (
              displayMeta
            )}
          </span>
        </div>
      </div>
    </aside>
  )
}
