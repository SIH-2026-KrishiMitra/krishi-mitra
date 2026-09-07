import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, TrendingUp, Package, Users, Wallet,
  ShoppingBag, FileText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import styles from './BottomNav.module.css'

interface Tab { id: string; label: string; path: string; Icon: LucideIcon }

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
  const { t } = useTranslation('nav')

  const farmerTabs = useMemo<Tab[]>(() => [
    { id: 'home',    label: t('farmer.home'),    path: '/farmer/home',    Icon: Home },
    { id: 'markets', label: t('farmer.markets'), path: '/farmer/markets', Icon: TrendingUp },
    { id: 'lots',    label: t('farmer.lots'),    path: '/farmer/lots',    Icon: Package },
    { id: 'offers',  label: t('farmer.offers'),  path: '/farmer/offers',  Icon: Users },
    { id: 'money',   label: t('farmer.money'),   path: '/farmer/money',   Icon: Wallet },
  ], [t])

  const buyerTabs = useMemo<Tab[]>(() => [
    { id: 'home',        label: t('buyer.home'),        path: '/buyer/home',        Icon: Home },
    { id: 'marketplace', label: t('buyer.discover'),    path: '/buyer/marketplace', Icon: ShoppingBag },
    { id: 'offers',      label: t('buyer.offers'),      path: '/buyer/offers',      Icon: Users },
    { id: 'deals',       label: t('buyer.deals'),       path: '/buyer/deals',       Icon: FileText },
    { id: 'payments',    label: t('buyer.payments'),    path: '/buyer/payments',    Icon: Wallet },
  ], [t])

  // Admin has no bottom nav (desktop-first)
  if (role === 'admin') return null

  const isBuyer = role === 'buyer'
  const tabs = isBuyer ? buyerTabs : farmerTabs
  const activeId = isBuyer
    ? getBuyerActiveId(location.pathname)
    : getFarmerActiveId(location.pathname)

  return (
    <nav
      className={`${styles.bottomNav} ${isBuyer ? styles.bottomNavBuyer : ''}`}
      aria-label={t('common.main_navigation')}
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
