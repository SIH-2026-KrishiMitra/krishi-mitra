import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
  topNav: ReactNode
  sidebar: ReactNode
  bottomNav?: ReactNode
}

export default function AppShell({ children, topNav, sidebar, bottomNav }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.body}>
        {sidebar}
        <div className={styles.mainColumn}>
          {topNav}
          <main className={styles.content}>
            {children}
          </main>
        </div>
      </div>
      <div className={styles.bottomNavSlot}>
        {bottomNav}
      </div>
    </div>
  )
}
