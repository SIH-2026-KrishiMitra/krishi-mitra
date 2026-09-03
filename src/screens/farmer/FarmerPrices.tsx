import { cx } from '../../lib/cx'
import FarmerLayout from './FarmerLayout'
import Card from '../../components/Card/Card'
import styles from './FarmerPrices.module.css'

const MANDI_PRICES: Array<{
  crop: string
  price: string
  unit: string
  trend: 'up' | 'down'
}> = [
  { crop: 'Wheat',     price: '2,150', unit: 'qtl', trend: 'up' },
  { crop: 'Paddy',     price: '1,890', unit: 'qtl', trend: 'down' },
  { crop: 'Cotton',    price: '6,740', unit: 'qtl', trend: 'up' },
  { crop: 'Soybean',   price: '4,320', unit: 'qtl', trend: 'down' },
  { crop: 'Maize',     price: '1,750', unit: 'qtl', trend: 'up' },
  { crop: 'Groundnut', price: '5,610', unit: 'qtl', trend: 'up' },
]

const FILTERS = ['Today', 'This week', 'By crop']

export default function FarmerPrices() {
  return (
    <FarmerLayout>
      <div className={styles.page}>

        <section className={styles.section}>
          <h1 className={styles.pageTitle}>Mandi prices</h1>
          <div className={styles.filters}>
            {FILTERS.map((label, i) => (
              <span key={label} className={cx(styles.chip, i === 0 ? styles.chipActive : undefined)}>
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>All crops</h2>
          <Card>
            <div className={styles.priceList}>
              {MANDI_PRICES.map(({ crop, price, unit, trend }) => (
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

      </div>
    </FarmerLayout>
  )
}
