import { Lock, UserCheck, Database, FlaskConical } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './TrustBadge.module.css'

export type TrustBadgeType = 'escrow' | 'verified-farmer' | 'price-source' | 'assayed'

interface TrustConfig {
  Icon: LucideIcon
  label: string
}

const TRUST_CONFIG: Record<TrustBadgeType, TrustConfig> = {
  escrow: { Icon: Lock, label: 'Escrow Protected' },
  'verified-farmer': { Icon: UserCheck, label: 'Verified Farmer' },
  'price-source': { Icon: Database, label: 'Govt. Price Source' },
  assayed: { Icon: FlaskConical, label: 'Lab Assayed' },
}

interface TrustBadgeProps {
  type: TrustBadgeType
}

export default function TrustBadge({ type }: TrustBadgeProps) {
  const { Icon, label } = TRUST_CONFIG[type]
  return (
    <span className={styles.badge}>
      <Icon size={12} className={styles.icon} aria-hidden="true" />
      {label}
    </span>
  )
}
