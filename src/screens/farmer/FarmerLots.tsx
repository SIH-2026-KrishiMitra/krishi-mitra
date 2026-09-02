import FarmerLayout from './FarmerLayout'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import StatusBadge, { type StatusVariant } from '../../components/StatusBadge/StatusBadge'
import styles from './FarmerLots.module.css'

const LOTS: Array<{
  id: string
  description: string
  status: StatusVariant
  statusLabel: string
}> = [
  { id: 'LOT-2024-0418', description: 'Wheat · 40 qtl',  status: 'success', statusLabel: 'Bid accepted' },
  { id: 'LOT-2024-0391', description: 'Paddy · 25 qtl',  status: 'warning', statusLabel: 'Awaiting payment' },
  { id: 'LOT-2024-0377', description: 'Cotton · 18 qtl', status: 'info',    statusLabel: 'Under review' },
]

export default function FarmerLots() {
  return (
    <FarmerLayout>
      <div className={styles.page}>

        <section className={styles.header}>
          <h1 className={styles.pageTitle}>My lots</h1>
          <Button variant="primary" size="md">List a new lot</Button>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Active listings</h2>
          <Card>
            {LOTS.map(({ id, description, status, statusLabel }) => (
              <div key={id} className={styles.lotRow}>
                <div className={styles.lotMeta}>
                  <p className={styles.lotId}>{id}</p>
                  <p className={styles.lotDesc}>{description}</p>
                </div>
                <StatusBadge variant={status} label={statusLabel} />
              </div>
            ))}
          </Card>
        </section>

      </div>
    </FarmerLayout>
  )
}
