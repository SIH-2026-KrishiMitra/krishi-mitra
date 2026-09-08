import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, TrendingUp, Package, Users, FileText,
  Wallet, HelpCircle, Volume2, CheckCircle,
  ShoppingBag, BarChart3, Settings, Shield,
  UserCheck, UserSquare2, ClipboardCheck,
  Tag, ShoppingCart, ArrowLeftRight, CreditCard,
  Banknote, RefreshCw, MessageSquare, Star,
  Bell, PieChart, UserCog, ScrollText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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

interface NavSection {
  label?: string
  items: NavItem[]
}

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

function getBuyerActiveId(pathname: string): string {
  if (pathname.startsWith('/buyer/marketplace')) return 'marketplace'
  if (pathname.startsWith('/buyer/offers')) return 'offers'
  if (pathname.startsWith('/buyer/deals')) return 'deals'
  if (pathname.startsWith('/buyer/payments')) return 'payments'
  if (pathname.startsWith('/buyer/profile')) return 'profile'
  return 'home'
}

function getAdminActiveId(pathname: string): string {
  if (pathname.startsWith('/admin/farmers')) return 'farmers'
  if (pathname.startsWith('/admin/buyers')) return 'buyers'
  if (pathname.startsWith('/admin/kyc')) return 'kyc'
  if (pathname.startsWith('/admin/users')) return 'users'
  if (pathname.startsWith('/admin/products')) return 'products'
  if (pathname.startsWith('/admin/categories')) return 'categories'
  if (pathname.startsWith('/admin/orders')) return 'orders'
  if (pathname.startsWith('/admin/transactions')) return 'transactions'
  if (pathname.startsWith('/admin/payments')) return 'payments'
  if (pathname.startsWith('/admin/payouts')) return 'payouts'
  if (pathname.startsWith('/admin/refunds')) return 'refunds'
  if (pathname.startsWith('/admin/complaints')) return 'complaints'
  if (pathname.startsWith('/admin/reviews')) return 'reviews'
  if (pathname.startsWith('/admin/notifications')) return 'notifications'
  if (pathname.startsWith('/admin/analytics')) return 'analytics'
  if (pathname.startsWith('/admin/admins')) return 'admins'
  if (pathname.startsWith('/admin/audit-logs')) return 'audit-logs'
  if (pathname.startsWith('/admin/settings')) return 'settings'
  return 'home'
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, role } = useAuth()
  const { t } = useTranslation('nav')

  const farmerCtx = useAppSafe()

  const isFarmer = role === 'farmer'
  const isBuyer = role === 'buyer'
  const isAdmin = role === 'admin'

  const farmerNav = useMemo<NavItem[]>(() => [
    { id: 'home',    label: t('farmer.home'),    path: '/farmer/home',    Icon: Home },
    { id: 'markets', label: t('farmer.markets'), path: '/farmer/markets', Icon: TrendingUp },
    { id: 'lots',    label: t('farmer.lots'),    path: '/farmer/lots',    Icon: Package,   badgeKey: 'lots' },
    { id: 'offers',  label: t('farmer.offers'),  path: '/farmer/offers',  Icon: Users,     badgeKey: 'offers' },
    { id: 'deals',   label: t('farmer.deals'),   path: '/farmer/deals',   Icon: FileText,  badgeKey: 'deals' },
    { id: 'money',   label: t('farmer.money'),   path: '/farmer/money',   Icon: Wallet },
    { id: 'help',    label: t('farmer.help'),    path: '/farmer/help',    Icon: HelpCircle },
  ], [t])

  const buyerNav = useMemo<NavItem[]>(() => [
    { id: 'home',        label: t('buyer.home'),        path: '/buyer/home',        Icon: Home },
    { id: 'marketplace', label: t('buyer.marketplace'), path: '/buyer/marketplace', Icon: ShoppingBag },
    { id: 'offers',      label: t('buyer.offers'),      path: '/buyer/offers',      Icon: Users },
    { id: 'deals',       label: t('buyer.deals'),       path: '/buyer/deals',       Icon: FileText },
    { id: 'payments',    label: t('buyer.payments'),    path: '/buyer/payments',    Icon: Wallet },
  ], [t])

  const adminSections = useMemo<NavSection[]>(() => [
    {
      items: [
        { id: 'home', label: 'Dashboard', path: '/admin/home', Icon: BarChart3 },
      ],
    },
    {
      label: 'Users',
      items: [
        { id: 'farmers', label: 'Farmers', path: '/admin/farmers', Icon: UserCheck },
        { id: 'buyers',  label: 'Buyers',  path: '/admin/buyers',  Icon: UserSquare2 },
        { id: 'kyc',     label: 'KYC Verification', path: '/admin/kyc', Icon: ClipboardCheck },
      ],
    },
    {
      label: 'Marketplace',
      items: [
        { id: 'products',   label: 'Products',   path: '/admin/products',   Icon: Package },
        { id: 'categories', label: 'Categories', path: '/admin/categories', Icon: Tag },
      ],
    },
    {
      label: 'Orders & Transactions',
      items: [
        { id: 'orders',       label: 'Orders',          path: '/admin/orders',       Icon: ShoppingCart },
        { id: 'transactions', label: 'Transactions',    path: '/admin/transactions', Icon: ArrowLeftRight },
        { id: 'payments',     label: 'Payments',        path: '/admin/payments',     Icon: CreditCard },
        { id: 'payouts',      label: 'Farmer Payouts',  path: '/admin/payouts',      Icon: Banknote },
        { id: 'refunds',      label: 'Refunds',         path: '/admin/refunds',      Icon: RefreshCw },
      ],
    },
    {
      label: 'Support',
      items: [
        { id: 'complaints',    label: 'Complaints',      path: '/admin/complaints',    Icon: MessageSquare },
        { id: 'reviews',       label: 'Reviews & Ratings', path: '/admin/reviews',    Icon: Star },
        { id: 'notifications', label: 'Notifications',   path: '/admin/notifications', Icon: Bell },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { id: 'analytics', label: 'Analytics & Reports', path: '/admin/analytics', Icon: PieChart },
      ],
    },
    {
      label: 'Admin Management',
      items: [
        { id: 'admins',     label: 'Roles & Permissions', path: '/admin/admins',     Icon: UserCog },
        { id: 'audit-logs', label: 'Audit Logs',          path: '/admin/audit-logs', Icon: ScrollText },
      ],
    },
    {
      items: [
        { id: 'settings', label: 'Settings', path: '/admin/settings', Icon: Settings },
      ],
    },
  ], [])

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
  const roleLabel = isFarmer
    ? t('farmer.workspace').toUpperCase()
    : isBuyer
      ? t('buyer.portal').toUpperCase()
      : t('admin.dashboard').toUpperCase()

  const sidebarClass = `${styles.sidebar} ${isBuyer ? styles.sidebarBuyer : isAdmin ? styles.sidebarAdmin : ''}`
  const displayName = profile?.full_name || (isBuyer ? 'Buyer' : isAdmin ? 'Admin' : 'Farmer')
  const displayMeta = isBuyer ? (profile?.email ?? '') : isAdmin ? t('user.administrator') : ''

  function renderNavItem(item: NavItem) {
    const { id, label, path, Icon, badgeKey } = item
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
  }

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

      {/* Nav — admin uses sections, farmer/buyer uses flat list */}
      {isAdmin ? (
        <nav className={styles.nav} aria-label={t('common.main_navigation')}>
          {adminSections.map((section, si) => (
            <div key={si} className={styles.navSection}>
              {section.label && (
                <p className={styles.navSectionLabel}>{section.label}</p>
              )}
              {section.items.map(renderNavItem)}
            </div>
          ))}
        </nav>
      ) : (
        <nav className={styles.nav} aria-label={t('common.main_navigation')}>
          {(isFarmer ? farmerNav : buyerNav).map(renderNavItem)}
        </nav>
      )}

      <div className={styles.spacer} />

      {/* Listen row — only for farmer */}
      {isFarmer && (
        <div className={styles.listenRow}>
          <Volume2 size={16} className={styles.listenIcon} aria-hidden />
          <div>
            <p className={styles.listenTitle}>{t('common.listen_title')}</p>
            <p className={styles.listenSub}>{t('common.listen_sub')}</p>
          </div>
        </div>
      )}

      {/* Security badge for admin */}
      {isAdmin && (
        <div className={styles.adminBadge}>
          <Shield size={14} aria-hidden />
          <span>{t('user.admin_access')}</span>
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
                  <CheckCircle size={10} className={styles.verifiedIcon} aria-label={t('user.verified')} />
                )}
                {farmerCtx?.state.farmer.verified ? ` ${t('user.verified')}` : ''}
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
