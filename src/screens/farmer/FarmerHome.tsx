import { useNavigate } from 'react-router-dom'
import { cx } from '../../lib/cx'
import FarmerLayout from './FarmerLayout'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import ListingCard from '../../components/ListingCard/ListingCard'
import { useLots } from '../../context/LotsContext'
import styles from './FarmerHome.module.css'

const STATS = [
  { value: '3', label: 'Active listings' },
  { value: '₹1,24,500', label: 'In escrow' },
  { value: '12', label: 'Lots sold this year' },
  { value: '₹2,180/qtl', label: 'Avg. price realized' },
]

const CROP_PRICES = [
  { crop: 'Wheat',  price: '2,150', unit: 'qtl', trend: 'up' as const },
  { crop: 'Paddy',  price: '1,890', unit: 'qtl', trend: 'down' as const },
  { crop: 'Cotton', price: '6,740', unit: 'qtl', trend: 'up' as const },
]

export default function FarmerHome() {
  const navigate = useNavigate()
  const { lots } = useLots()
  const recentLots = lots.slice(0, 3)

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

        {/* Overview stats */}
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

        {/* Prices + Quick Actions */}
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
              <Button variant="accent" size="lg" onClick={() => navigate('/farmer/lots/create')}>
                List a lot
              </Button>
              <Button variant="secondary" size="md" className={styles.quickActionBtn} onClick={() => navigate('/farmer/market')}>
                View market prices
              </Button>
              <Button variant="secondary" size="md" className={styles.quickActionBtn} onClick={() => navigate('/farmer/activity')}>
                My activity
              </Button>
            </div>
          </section>
        </div>

        {/* Recent lots from context */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionHeading}>Recent lots</h2>
            <button
              type="button"
              className={styles.allLink}
              onClick={() => navigate('/farmer/activity')}
            >
              All activity →
            </button>
          </div>
          {recentLots.length === 0 ? (
            <Card>
              <p className={styles.emptyMessage}>
                No lots yet.{' '}
                <button
                  type="button"
                  className={styles.inlineLink}
                  onClick={() => navigate('/farmer/lots/create')}
                >
                  List your first crop
                </button>
              </p>
            </Card>
          ) : (
            <div className={styles.recentLotsGrid}>
              {recentLots.map(lot => (
                <ListingCard key={lot.id} lot={lot} />
              ))}
            </div>
          )}
        </section>

      </div>
    </FarmerLayout>
  )
}
