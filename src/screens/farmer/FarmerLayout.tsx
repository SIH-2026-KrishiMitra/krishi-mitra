import type { ReactNode } from 'react'
import { Bell } from 'lucide-react'
import AppShell from '../../components/AppShell/AppShell'
import TopNav from '../../components/TopNav/TopNav'
import BottomNav from '../../components/BottomNav/BottomNav'
import Sidebar from '../../components/Sidebar/Sidebar'
import styles from './FarmerLayout.module.css'

export default function FarmerLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      topNav={
        <TopNav
          title="Krishi Mitra"
          role="farmer"
          action={
            <button className={styles.notifBtn} aria-label="Notifications" type="button">
              <Bell size={22} />
            </button>
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
