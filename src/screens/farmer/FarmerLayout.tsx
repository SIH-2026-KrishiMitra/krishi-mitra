import type { ReactNode } from 'react'
import AppShell from '../../components/AppShell/AppShell'
import TopNav from '../../components/TopNav/TopNav'
import BottomNav from '../../components/BottomNav/BottomNav'
import Sidebar from '../../components/Sidebar/Sidebar'

interface FarmerLayoutProps {
  children: ReactNode
}

export default function FarmerLayout({ children }: FarmerLayoutProps) {
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
