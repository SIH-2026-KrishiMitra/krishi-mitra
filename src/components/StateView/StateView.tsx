import { AlertCircle, Package, WifiOff, Wheat } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Button from '../Button/Button'
import styles from './StateView.module.css'

type StateKind = 'empty' | 'error' | 'offline' | 'empty-lots' | 'empty-deals' | 'empty-payments'

interface StateViewProps {
  kind: StateKind
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

const ICON_MAP: Record<StateKind, LucideIcon> = {
  empty: Package,
  'empty-lots': Wheat,
  'empty-deals': Package,
  'empty-payments': Package,
  error: AlertCircle,
  offline: WifiOff,
}

const COLOR_MAP: Record<StateKind, string> = {
  empty: 'var(--text-muted)',
  'empty-lots': 'var(--text-brand)',
  'empty-deals': 'var(--text-muted)',
  'empty-payments': 'var(--text-muted)',
  error: 'var(--text-danger)',
  offline: 'var(--text-muted)',
}

export default function StateView({ kind, title, description, action }: StateViewProps) {
  const Icon = ICON_MAP[kind]
  const iconColor = COLOR_MAP[kind]

  return (
    <div className={styles.container}>
      <div className={styles.iconWrap} style={{ color: iconColor }}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
