import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronDown, Volume2, Bell, Plus, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import { useLang } from '../../context/LanguageContext'
import { SUPPORTED_LANGUAGES } from '../../i18n'
import styles from './TopNav.module.css'

function NotifDropdown() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const { t } = useTranslation('nav')
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
        aria-label={`${t('common.notifications')}${unreadCount ? ` (${unreadCount})` : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        <Bell size={18} aria-hidden />
        {unreadCount > 0 && (
          <span className={styles.notifBadge} aria-hidden>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.notifPanel} role="dialog" aria-label={t('common.notifications')}>
          <div className={styles.notifPanelHeader}>
            <span className={styles.notifPanelTitle}>{t('common.notifications')}</span>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAllBtn} onClick={() => { void markAllRead() }}>
                {t('common.mark_all_read')}
              </button>
            )}
          </div>
          <ul className={styles.notifList}>
            {notifications.length === 0 && (
              <li className={styles.notifEmpty}>{t('common.no_notifications')}</li>
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

function LangDropdown() {
  const { lang, setLang } = useLang()
  const { t } = useTranslation('nav')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = SUPPORTED_LANGUAGES.find(l => l.code === lang) ?? SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className={styles.dropWrapper} ref={ref}>
      <button
        type="button"
        className={styles.langBtn}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('select_language')}
      >
        <Globe size={13} aria-hidden />
        <span lang={current.code}>{current.nativeLabel}</span>
        <ChevronDown size={13} className={styles.chevron} aria-hidden />
      </button>
      {open && (
        <ul className={`${styles.dropdown} ${styles.dropdownLang}`} role="listbox" aria-label={t('select_language')}>
          {SUPPORTED_LANGUAGES.map(l => (
            <li
              key={l.code}
              role="option"
              lang={l.code}
              aria-selected={l.code === lang}
              className={`${styles.dropItem} ${l.code === lang ? styles.dropItemActive : ''}`}
              onClick={() => { setLang(l.code); setOpen(false) }}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') { setLang(l.code); setOpen(false) } }}
            >
              {l.nativeLabel}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const LOCATIONS = ['Nashik, Maharashtra', 'Pune, Maharashtra', 'Nagpur, Maharashtra']

function FarmerTopNav() {
  const navigate = useNavigate()
  const { t } = useTranslation('nav')
  const [location, setLocation] = useState('Nashik, Maharashtra')
  const [showLocDrop, setShowLocDrop] = useState(false)
  const locRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showLocDrop) return
    function onClickOutside(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setShowLocDrop(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showLocDrop])

  return (
    <header className={styles.topNav}>
      <div className={styles.left}>
        <div className={styles.dropWrapper} ref={locRef}>
          <button
            type="button"
            className={styles.locationBtn}
            onClick={() => setShowLocDrop(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={showLocDrop}
            aria-label={t('select_location')}
          >
            <MapPin size={14} className={styles.locIcon} aria-hidden />
            <span>{location}</span>
            <ChevronDown size={14} className={styles.chevron} aria-hidden />
          </button>
          {showLocDrop && (
            <ul className={styles.dropdown} role="listbox" aria-label={t('select_location')}>
              {LOCATIONS.map(loc => (
                <li
                  key={loc}
                  role="option"
                  aria-selected={loc === location}
                  className={`${styles.dropItem} ${loc === location ? styles.dropItemActive : ''}`}
                  onClick={() => { setLocation(loc); setShowLocDrop(false) }}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') { setLocation(loc); setShowLocDrop(false) } }}
                >
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </div>

        <LangDropdown />
      </div>

      <div className={styles.right}>
        <button type="button" className={styles.listenBtn} aria-label={t('common.listen_title')}>
          <Volume2 size={14} aria-hidden />
          <span>{t('common.listen')}</span>
        </button>

        <NotifDropdown />

        <button
          type="button"
          className={styles.sellBtn}
          onClick={() => navigate('/farmer/create-lot')}
        >
          <Plus size={16} aria-hidden />
          <span>{t('common.sell_produce')}</span>
        </button>
      </div>
    </header>
  )
}

function BuyerTopNav() {
  const { profile } = useAuth()
  const { t } = useTranslation('nav')
  return (
    <header className={`${styles.topNav} ${styles.topNavBuyer}`}>
      <div className={styles.left}>
        <span className={styles.roleLabel}>{t('buyer.portal_label')}</span>
        <LangDropdown />
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
  const { t } = useTranslation('nav')
  return (
    <header className={`${styles.topNav} ${styles.topNavAdmin}`}>
      <div className={styles.left}>
        <span className={styles.roleLabel}>{t('admin.dashboard_label')}</span>
        <LangDropdown />
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

  try {
    return <FarmerTopNav />
  } catch {
    return null
  }
}
