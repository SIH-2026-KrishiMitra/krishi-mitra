import { cx } from '../../lib/cx'
import styles from './StatusBadge.module.css'

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'offline'

interface StatusBadgeProps {
  variant: StatusVariant
  label: string
}

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant])}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  )
}
