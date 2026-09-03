import { useNavigate, useLocation } from 'react-router-dom'
import { Home, TrendingUp, PlusCircle, Package, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '../../lib/cx'
import styles from './BottomNav.module.css'

type Tab = 'home' | 'market' | 'sell' | 'activity' | 'profile'

const TAB_ROUTES: Record<Tab, string> = {
  home:     '/farmer/home',
  market:   '/farmer/market',
  sell:     '/farmer/lots/create',
  activity: '/farmer/activity',
  profile:  '/farmer/profile',
}

const TABS: Array<{ id: Tab; label: string; Icon: LucideIcon; exact?: boolean }> = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'market',   label: 'Market',   Icon: TrendingUp },
  { id: 'sell',     label: 'Sell',     Icon: PlusCircle, exact: true },
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

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = getActiveTab(location.pathname)

  return (
    <nav className={styles.bottomnav} aria-label="Main navigation">
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
          type="button"
        >
          <Icon size={id === 'sell' ? 24 : 22} aria-hidden={true} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
