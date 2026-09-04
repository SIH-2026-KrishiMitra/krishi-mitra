import type { ReactNode } from 'react'
import AppShell from '../../components/AppShell/AppShell'
import TopNav from '../../components/TopNav/TopNav'
import Sidebar from '../../components/Sidebar/Sidebar'
import BottomNav from '../../components/BottomNav/BottomNav'

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      topNav={<TopNav />}
      sidebar={<Sidebar />}
      bottomNav={<BottomNav />}
    >
      {children}
    </AppShell>
  )
}
