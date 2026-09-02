import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
  topNav: ReactNode
  bottomNav: ReactNode
  sidebar?: ReactNode
}

export default function AppShell({ children, topNav, bottomNav, sidebar }: AppShellProps) {
  return (
    <div className={styles.shell}>
      {topNav}
      <div className={styles.body}>
        {sidebar}
        <main className={styles.content}>
          {children}
        </main>
      </div>
      <div className={styles.bottomNavSlot}>
        {bottomNav}
      </div>
    </div>
  )
}
