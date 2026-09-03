import { useNavigate } from 'react-router-dom'
import { cx } from '../../lib/cx'
import FarmerLayout from './FarmerLayout'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import StatusBadge, { type StatusVariant } from '../../components/StatusBadge/StatusBadge'
import styles from './FarmerHome.module.css'

const STATS: Array<{ value: string; label: string }> = [
  { value: '3',           label: 'Active listings' },
  { value: '₹1,24,500',  label: 'In escrow' },
  { value: '12',          label: 'Lots sold this year' },
  { value: '₹2,180/qtl', label: 'Avg. price realized' },
]

const CROP_PRICES: Array<{
  crop: string
  price: string
  unit: string
  trend: 'up' | 'down'
}> = [
  { crop: 'Wheat',  price: '2,150', unit: 'qtl', trend: 'up' },
  { crop: 'Paddy',  price: '1,890', unit: 'qtl', trend: 'down' },
  { crop: 'Cotton', price: '6,740', unit: 'qtl', trend: 'up' },
]

const RECENT_ACTIVITY: Array<{
  id: string
  description: string
  status: StatusVariant
  statusLabel: string
}> = [
  { id: 'LOT-2024-0418', description: 'Wheat · 40 qtl',  status: 'success', statusLabel: 'Bid accepted' },
  { id: 'LOT-2024-0391', description: 'Paddy · 25 qtl',  status: 'warning', statusLabel: 'Awaiting payment' },
  { id: 'LOT-2024-0377', description: 'Cotton · 18 qtl', status: 'info',    statusLabel: 'Under review' },
]

export default function FarmerHome() {
  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <FarmerLayout>
      <div className={styles.page}>

        {/* Greeting */}
        <section className={styles.section}>
          <h1 className={styles.greetingName}>Good morning, Rajan</h1>
          <p className={styles.greetingDate}>{today}</p>
          <div className={styles.trustLine}>
            <StatusBadge variant="success" label="Verified Farmer" />
            <span className={styles.memberSince}>· Member since 2022</span>
          </div>
        </section>

        {/* Overview stats — 2-col mobile, 4-col desktop */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Overview</h2>
          <div className={styles.statsGrid}>
            {STATS.map(({ value, label }) => (
              <Card key={label}>
                <p className={styles.statValue} data-numeric="">{value}</p>
                <p className={styles.statLabel}>{label}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Prices + Quick Actions: stacked on mobile, side-by-side on tablet+ */}
        <div className={styles.pricesAndActions}>
          <section className={styles.pricesSection}>
            <h2 className={styles.sectionHeading}>Today's prices</h2>
            <Card>
              <div className={styles.priceList}>
                {CROP_PRICES.map(({ crop, price, unit, trend }) => (
                  <div key={crop} className={styles.priceRow}>
                    <span className={styles.cropName}>{crop}</span>
                    <span className={styles.priceAmount}>
                      <span className={cx(styles.priceValue, trend === 'up' ? styles.priceUp : styles.priceDown)}>
                        ₹{price}
                      </span>
                      <span className={cx(styles.priceTrend, trend === 'up' ? styles.priceUp : styles.priceDown)}>
                        {trend === 'up' ? '▲' : '▼'}
                      </span>
                      <span className={styles.priceUnit}>/{unit}</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className={styles.provenance}>Source: Agmarknet · Updated today, 6:40 AM</p>
            </Card>
          </section>

          <section className={styles.actionsSection}>
            <h2 className={styles.sectionHeading}>Quick actions</h2>
            <div className={styles.quickActions}>
              <Button variant="primary" size="lg">List a lot</Button>
              <Button variant="secondary" size="md" className={styles.quickActionBtn} onClick={() => navigate('/farmer/prices')}>View prices</Button>
              <Button variant="secondary" size="md" className={styles.quickActionBtn} onClick={() => navigate('/farmer/lots')}>My transactions</Button>
            </div>
          </section>
        </div>

        {/* Recent activity */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Recent activity</h2>
          <Card>
            {RECENT_ACTIVITY.map(({ id, description, status, statusLabel }) => (
              <div key={id} className={styles.activityRow}>
                <div className={styles.activityMeta}>
                  <p className={styles.activityId}>{id}</p>
                  <p className={styles.activityDesc}>{description}</p>
                </div>
                <div className={styles.activityBadge}>
                  <StatusBadge variant={status} label={statusLabel} />
                </div>
              </div>
            ))}
          </Card>
        </section>

      </div>
    </FarmerLayout>
  )
}
