import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, TrendingUp, Package, Users, Wallet,
  ShoppingBag, FileText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './BottomNav.module.css'

interface Tab { id: string; label: string; path: string; Icon: LucideIcon }

const FARMER_TABS: Tab[] = [
  { id: 'home',    label: 'Home',    path: '/farmer/home',    Icon: Home },
  { id: 'markets', label: 'Markets', path: '/farmer/markets', Icon: TrendingUp },
  { id: 'lots',    label: 'My lots', path: '/farmer/lots',    Icon: Package },
  { id: 'offers',  label: 'Offers',  path: '/farmer/offers',  Icon: Users },
  { id: 'money',   label: 'Money',   path: '/farmer/money',   Icon: Wallet },
]

const BUYER_TABS: Tab[] = [
  { id: 'home',        label: 'Home',      path: '/buyer/home',        Icon: Home },
  { id: 'marketplace', label: 'Discover',  path: '/buyer/marketplace', Icon: ShoppingBag },
  { id: 'offers',      label: 'Offers',    path: '/buyer/offers',      Icon: Users },
  { id: 'deals',       label: 'Deals',     path: '/buyer/deals',       Icon: FileText },
  { id: 'payments',    label: 'Payments',  path: '/buyer/payments',    Icon: Wallet },
]

function getFarmerActiveId(pathname: string): string {
  if (pathname.startsWith('/farmer/markets')) return 'markets'
  if (pathname.startsWith('/farmer/lots')) return 'lots'
  if (pathname.startsWith('/farmer/offers')) return 'offers'
  if (pathname.startsWith('/farmer/deals')) return 'deals'
  if (pathname.startsWith('/farmer/money')) return 'money'
  return 'home'
}

function getBuyerActiveId(pathname: string): string {
  if (pathname.startsWith('/buyer/marketplace')) return 'marketplace'
  if (pathname.startsWith('/buyer/offers')) return 'offers'
  if (pathname.startsWith('/buyer/deals')) return 'deals'
  if (pathname.startsWith('/buyer/payments')) return 'payments'
  return 'home'
}

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useAuth()

  // Admin has no bottom nav (desktop-first)
  if (role === 'admin') return null

  const isBuyer = role === 'buyer'
  const tabs = isBuyer ? BUYER_TABS : FARMER_TABS
  const activeId = isBuyer
    ? getBuyerActiveId(location.pathname)
    : getFarmerActiveId(location.pathname)

  return (
    <nav
      className={`${styles.bottomNav} ${isBuyer ? styles.bottomNavBuyer : ''}`}
      aria-label="Main navigation"
    >
      {tabs.map(({ id, label, path, Icon }) => (
        <button
          key={id}
          type="button"
          className={`${styles.tab} ${activeId === id ? styles.tabActive : ''}`}
          onClick={() => navigate(path)}
          aria-current={activeId === id ? 'page' : undefined}
        >
          <Icon size={20} aria-hidden />
          <span className={styles.tabLabel}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
