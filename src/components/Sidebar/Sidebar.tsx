import { useNavigate, useLocation } from 'react-router-dom'
import { Home, TrendingUp, Package, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '../../lib/cx'
import styles from './Sidebar.module.css'

type Tab = 'home' | 'prices' | 'lots' | 'profile'

const TAB_ROUTES: Record<Tab, string> = {
  home:    '/farmer/home',
  prices:  '/farmer/prices',
  lots:    '/farmer/lots',
  profile: '/farmer/profile',
}

const TABS: Array<{ id: Tab; label: string; Icon: LucideIcon }> = [
  { id: 'home',    label: 'Home',    Icon: Home },
  { id: 'prices',  label: 'Prices',  Icon: TrendingUp },
  { id: 'lots',    label: 'My lots', Icon: Package },
  { id: 'profile', label: 'Profile', Icon: User },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeTab = (Object.entries(TAB_ROUTES).find(
    ([, path]) => location.pathname.startsWith(path)
  )?.[0] ?? 'home') as Tab

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Sidebar navigation">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={cx(styles.tab, activeTab === id ? styles.active : undefined)}
            onClick={() => navigate(TAB_ROUTES[id])}
            aria-current={activeTab === id ? 'page' : undefined}
            aria-label={label}
            type="button"
          >
            <Icon size={20} aria-hidden={true} />
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
