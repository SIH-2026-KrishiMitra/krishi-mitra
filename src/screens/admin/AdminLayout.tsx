import type { ReactNode } from 'react'
import AppShell from '../../components/AppShell/AppShell'
import TopNav from '../../components/TopNav/TopNav'
import Sidebar from '../../components/Sidebar/Sidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      topNav={<TopNav />}
      sidebar={<Sidebar />}
    >
      {children}
    </AppShell>
  )
}
