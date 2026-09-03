import type { ReactNode } from 'react'
import { Bell } from 'lucide-react'
import AppShell from '../../components/AppShell/AppShell'
import TopNav from '../../components/TopNav/TopNav'
import BottomNav from '../../components/BottomNav/BottomNav'
import Sidebar from '../../components/Sidebar/Sidebar'
import styles from './FarmerLayout.module.css'

interface FarmerLayoutProps {
  children: ReactNode
  title?: string
  onBack?: () => void
}

export default function FarmerLayout({ children, title, onBack }: FarmerLayoutProps) {
  const isDetail = Boolean(onBack)
  return (
    <AppShell
      topNav={
        <TopNav
          title={title ?? 'Krishi Mitra'}
          role="farmer"
          onBack={onBack}
          action={
            !isDetail ? (
              <button className={styles.notifBtn} aria-label="Notifications" type="button">
                <Bell size={22} />
              </button>
            ) : undefined
          }
        />
      }
      sidebar={<Sidebar />}
      bottomNav={<BottomNav />}
    >
      {children}
    </AppShell>
  )
}
