import { useState, useEffect, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import AppShell from '../../components/AppShell/AppShell'
import TopNav from '../../components/TopNav/TopNav'
import Sidebar from '../../components/Sidebar/Sidebar'
import AdminGlobalSearch from './AdminGlobalSearch'
import styles from './AdminLayout.module.css'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <AppShell topNav={<TopNav />} sidebar={<Sidebar />}>
      <>
        <div className={styles.searchBar}>
          <button type="button" className={styles.searchTrigger} onClick={() => setSearchOpen(true)}>
            <Search size={13} aria-hidden />
            <span>Search anything…</span>
            <kbd className={styles.kbdHint}>⌘K</kbd>
          </button>
        </div>
        {children}
        <AdminGlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </>
    </AppShell>
  )
}
