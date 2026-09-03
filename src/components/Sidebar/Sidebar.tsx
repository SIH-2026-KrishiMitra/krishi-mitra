import { useNavigate, useLocation } from 'react-router-dom'
import { Home, TrendingUp, PlusCircle, Package, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '../../lib/cx'
import styles from './Sidebar.module.css'

type Tab = 'home' | 'market' | 'sell' | 'activity' | 'profile'

const TAB_ROUTES: Record<Tab, string> = {
  home:     '/farmer/home',
  market:   '/farmer/market',
  sell:     '/farmer/lots/create',
  activity: '/farmer/activity',
  profile:  '/farmer/profile',
}

const TABS: Array<{ id: Tab; label: string; Icon: LucideIcon }> = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'market',   label: 'Market',   Icon: TrendingUp },
  { id: 'sell',     label: 'Sell',     Icon: PlusCircle },
  { id: 'activity', label: 'Activity', Icon: Package },
  { id: 'profile',  label: 'Profile',  Icon: User },
]

function getActiveTab(pathname: string): Tab {
  if (pathname.startsWith('/farmer/lots/create')) return 'sell'
  if (pathname.startsWith('/farmer/lots')) return 'activity'
  if (pathname.startsWith('/farmer/prices')) return 'market'
  for (const [id, path] of Object.entries(TAB_ROUTES) as [Tab, string][]) {
    if (id === 'sell') continue
    if (pathname.startsWith(path)) return id
  }
  return 'home'
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = getActiveTab(location.pathname)

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Sidebar navigation">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={cx(
              styles.tab,
              activeTab === id ? styles.active : undefined,
              id === 'sell' ? styles.sellTab : undefined,
            )}
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
