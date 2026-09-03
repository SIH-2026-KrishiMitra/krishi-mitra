import { useNavigate } from 'react-router-dom'
import type { Lot, LotStatus } from '../../types/lot'
import type { StatusVariant } from '../StatusBadge/StatusBadge'
import StatusBadge from '../StatusBadge/StatusBadge'
import styles from './ListingCard.module.css'

const STATUS_MAP: Record<LotStatus, { variant: StatusVariant; label: string }> = {
  draft: { variant: 'offline', label: 'Draft' },
  pending: { variant: 'warning', label: 'Pending' },
  active: { variant: 'info', label: 'Active' },
  sold: { variant: 'success', label: 'Sold' },
  completed: { variant: 'success', label: 'Completed' },
}

interface ListingCardProps {
  lot: Lot
  onClick?: () => void
}

export default function ListingCard({ lot, onClick }: ListingCardProps) {
  const navigate = useNavigate()
  const { variant, label } = STATUS_MAP[lot.status]
  const handleClick = onClick ?? (() => navigate(`/farmer/lots/${lot.id}`))
  const estimatedValue = lot.quantity * lot.expectedPrice

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className={styles.header}>
        <p className={styles.id}>{lot.id}</p>
        <StatusBadge variant={variant} label={label} />
      </div>

      <p className={styles.crop}>{lot.crop}</p>
      <p className={styles.detail}>
        {lot.variety} · Grade {lot.grade}
      </p>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricValue} data-numeric="">
            {lot.quantity}
          </span>
          <span className={styles.metricUnit}> qtl</span>
        </div>
        <span className={styles.sep}>·</span>
        <div className={styles.metric}>
          <span className={styles.metricValue} data-numeric="">
            ₹{lot.expectedPrice.toLocaleString('en-IN')}
          </span>
          <span className={styles.metricUnit}>/qtl</span>
        </div>
      </div>

      <p className={styles.mandi}>{lot.mandi}</p>

      <div className={styles.footer}>
        <p className={styles.estimate} data-numeric="">
          Est. ₹{estimatedValue.toLocaleString('en-IN')}
        </p>
        <span className={styles.viewLink}>View →</span>
      </div>
    </div>
  )
}
