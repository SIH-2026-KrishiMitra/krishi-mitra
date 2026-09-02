import { useNavigate, useLocation } from 'react-router-dom'
import { Home, TrendingUp, Package, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '../../lib/cx'
import styles from './BottomNav.module.css'

export type BottomNavTab = 'home' | 'prices' | 'lots' | 'profile'

const TAB_ROUTES: Record<BottomNavTab, string> = {
  home:    '/farmer/home',
  prices:  '/farmer/prices',
  lots:    '/farmer/lots',
  profile: '/farmer/profile',
}

const TABS: Array<{ id: BottomNavTab; label: string; Icon: LucideIcon }> = [
  { id: 'home',    label: 'Home',    Icon: Home },
  { id: 'prices',  label: 'Prices',  Icon: TrendingUp },
  { id: 'lots',    label: 'My lots', Icon: Package },
  { id: 'profile', label: 'Profile', Icon: User },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeTab = (Object.entries(TAB_ROUTES).find(
    ([, path]) => location.pathname.startsWith(path)
  )?.[0] ?? 'home') as BottomNavTab

  return (
    <nav className={styles.bottomnav} aria-label="Main navigation">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={cx(styles.tab, activeTab === id ? styles.active : undefined)}
          onClick={() => navigate(TAB_ROUTES[id])}
          aria-current={activeTab === id ? 'page' : undefined}
          type="button"
        >
          <Icon size={22} aria-hidden={true} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
