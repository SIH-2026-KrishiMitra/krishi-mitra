import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronDown, Volume2, Bell, Plus, Globe } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import styles from './TopNav.module.css'

function NotifDropdown() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className={styles.notifWrapper} ref={ref}>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <Bell size={18} aria-hidden />
        {unreadCount > 0 && (
          <span className={styles.notifBadge} aria-hidden>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.notifPanel} role="dialog" aria-label="Notifications">
          <div className={styles.notifPanelHeader}>
            <span className={styles.notifPanelTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAllBtn} onClick={() => { void markAllRead() }}>
                Mark all read
              </button>
            )}
          </div>
          <ul className={styles.notifList}>
            {notifications.length === 0 && (
              <li className={styles.notifEmpty}>No notifications yet</li>
            )}
            {notifications.slice(0, 10).map(n => (
              <li
                key={n.id}
                className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ''}`}
                onClick={() => { void markRead(n.id) }}
              >
                <div className={styles.notifItemTitle}>{n.title}</div>
                <div className={styles.notifItemBody}>{n.body}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const LOCATIONS = ['Nashik, Maharashtra', 'Pune, Maharashtra', 'Nagpur, Maharashtra']
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिंदी' },
]

function FarmerTopNav() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('Nashik, Maharashtra')
  const [lang, setLang] = useState('en')
  const [showLocDrop, setShowLocDrop] = useState(false)
  const [showLangDrop, setShowLangDrop] = useState(false)

  return (
    <header className={styles.topNav}>
      <div className={styles.left}>
        <div className={styles.dropWrapper}>
          <button
            type="button"
            className={styles.locationBtn}
            onClick={() => { setShowLocDrop(v => !v); setShowLangDrop(false) }}
            aria-haspopup="listbox"
            aria-expanded={showLocDrop}
          >
            <MapPin size={14} className={styles.locIcon} aria-hidden />
            <span>{location}</span>
            <ChevronDown size={14} className={styles.chevron} aria-hidden />
          </button>
          {showLocDrop && (
            <ul className={styles.dropdown} role="listbox" aria-label="Select location">
              {LOCATIONS.map(loc => (
                <li
                  key={loc}
                  role="option"
                  aria-selected={loc === location}
                  className={`${styles.dropItem} ${loc === location ? styles.dropItemActive : ''}`}
                  onClick={() => { setLocation(loc); setShowLocDrop(false) }}
                  tabIndex={0}
                >
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.dropWrapper}>
          <button
            type="button"
            className={styles.langBtn}
            onClick={() => { setShowLangDrop(v => !v); setShowLocDrop(false) }}
          >
            <Globe size={13} aria-hidden />
            <span>{LANGUAGES.find(l => l.code === lang)?.label ?? 'English'}</span>
            <ChevronDown size={13} className={styles.chevron} aria-hidden />
          </button>
          {showLangDrop && (
            <ul className={styles.dropdown} role="listbox" aria-label="Select language">
              {LANGUAGES.map(l => (
                <li
                  key={l.code}
                  role="option"
                  aria-selected={l.code === lang}
                  className={`${styles.dropItem} ${l.code === lang ? styles.dropItemActive : ''}`}
                  onClick={() => { setLang(l.code); setShowLangDrop(false) }}
                  tabIndex={0}
                >
                  {l.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <button type="button" className={styles.listenBtn} aria-label="Listen to page">
          <Volume2 size={14} aria-hidden />
          <span>Listen</span>
        </button>

        <NotifDropdown />

        <button
          type="button"
          className={styles.sellBtn}
          onClick={() => navigate('/farmer/create-lot')}
        >
          <Plus size={16} aria-hidden />
          <span>Sell produce</span>
        </button>
      </div>
    </header>
  )
}

function BuyerTopNav() {
  const { profile } = useAuth()
  return (
    <header className={`${styles.topNav} ${styles.topNavBuyer}`}>
      <div className={styles.left}>
        <span className={styles.roleLabel}>Buyer Portal</span>
      </div>
      <div className={styles.right}>
        <NotifDropdown />
        <div className={styles.userChip}>
          <div className={styles.userChipAvatar}>
            {(profile?.full_name ?? 'B').charAt(0).toUpperCase()}
          </div>
          <span className={styles.userChipName}>{profile?.full_name ?? 'Buyer'}</span>
        </div>
      </div>
    </header>
  )
}

function AdminTopNav() {
  const { profile } = useAuth()
  return (
    <header className={`${styles.topNav} ${styles.topNavAdmin}`}>
      <div className={styles.left}>
        <span className={styles.roleLabel}>Admin Dashboard</span>
      </div>
      <div className={styles.right}>
        <NotifDropdown />
        <div className={styles.userChip}>
          <div className={styles.userChipAvatar}>
            {(profile?.full_name ?? 'A').charAt(0).toUpperCase()}
          </div>
          <span className={styles.userChipName}>{profile?.full_name ?? 'Admin'}</span>
        </div>
      </div>
    </header>
  )
}

export default function TopNav() {
  const { role } = useAuth()

  if (role === 'buyer') return <BuyerTopNav />
  if (role === 'admin') return <AdminTopNav />

  // Default: farmer (also used while role is loading, safe because AppProvider is above)
  try {
    return <FarmerTopNav />
  } catch {
    return null
  }
}
