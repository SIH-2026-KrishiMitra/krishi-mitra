import type { ReactNode, CSSProperties } from 'react'
import { ChevronLeft } from 'lucide-react'
import styles from './TopNav.module.css'

interface TopNavProps {
  title: string
  onBack?: () => void
  action?: ReactNode
  role?: 'farmer' | 'buyer' | 'fpo' | 'admin'
}

export default function TopNav({ title, onBack, action, role = 'farmer' }: TopNavProps) {
  return (
    <header
      className={styles.topnav}
      style={{ '--role-color': `var(--role-${role})` } as CSSProperties}
    >
      {onBack && (
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <ChevronLeft size={24} />
        </button>
      )}
      <p className={styles.title}>{title}</p>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  )
}
