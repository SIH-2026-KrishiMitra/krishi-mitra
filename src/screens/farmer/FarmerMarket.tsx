import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import Card from '../../components/Card/Card'
import Sparkline from '../../components/Sparkline/Sparkline'
import { cx } from '../../lib/cx'
import { CROP_MARKET_DATA } from '../../data/mockPrices'
import type { PriceTrend } from '../../types/price'
import styles from './FarmerMarket.module.css'

type FilterId = 'all' | 'up' | 'down' | 'near-msp'

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All crops' },
  { id: 'up', label: 'Price up' },
  { id: 'down', label: 'Price down' },
  { id: 'near-msp', label: 'Near MSP' },
]

function trendSymbol(trend: PriceTrend) {
  return trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'
}

export default function FarmerMarket() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CROP_MARKET_DATA.filter(c => {
      const matchSearch =
        !q || c.crop.toLowerCase().includes(q) || c.mandi.toLowerCase().includes(q)
      const matchFilter =
        activeFilter === 'all' ||
        (activeFilter === 'up' && c.trend === 'up') ||
        (activeFilter === 'down' && c.trend === 'down') ||
        (activeFilter === 'near-msp' &&
          Math.abs(c.currentPrice - c.msp) / c.msp < 0.15)
      return matchSearch && matchFilter
    })
  }, [query, activeFilter])

  return (
    <FarmerLayout title="Market prices">
      <div className={styles.page}>
        <section className={styles.searchSection}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search crop or mandi"
              className={styles.searchInput}
              aria-label="Search crops and mandis"
            />
          </div>
        </section>

        <section className={styles.filterSection}>
          <div className={styles.filters} role="group" aria-label="Filter prices">
            {FILTERS.map(f => (
              <button
                key={f.id}
                type="button"
                className={cx(styles.chip, activeFilter === f.id ? styles.chipActive : undefined)}
                onClick={() => setActiveFilter(f.id)}
                aria-pressed={activeFilter === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.listSection}>
          {visible.length === 0 ? (
            <div className={styles.noResults}>
              <p className={styles.noResultsTitle}>No crops match your search</p>
              <p className={styles.noResultsDesc}>
                Try a different crop name or clear the filter.
              </p>
            </div>
          ) : (
            <div className={styles.cropList}>
              {visible.map(crop => {
                const trendClass =
                  crop.trend === 'up'
                    ? styles.priceUp
                    : crop.trend === 'down'
                      ? styles.priceDown
                      : styles.priceFlat
                const last30 = crop.priceHistory.slice(-30).map(p => p.price)

                return (
                  <Card
                    key={crop.id}
                    interactive
                    onClick={() => navigate(`/farmer/market/${crop.id}`)}
                  >
                    <div className={styles.cropRow}>
                      <div className={styles.cropInfo}>
                        <div className={styles.cropMeta}>
                          <p className={styles.cropName}>{crop.crop}</p>
                          {Math.abs(crop.currentPrice - crop.msp) / crop.msp < 0.05 && (
                            <span className={styles.mspTag}>Near MSP</span>
                          )}
                        </div>
                        <p className={styles.cropVariety}>
                          {crop.variety} · {crop.mandi}
                        </p>
                        <div className={styles.priceRow}>
                          <span className={cx(styles.priceValue, trendClass)} data-numeric="">
                            ₹{crop.currentPrice.toLocaleString('en-IN')}
                          </span>
                          <span className={cx(styles.priceTrend, trendClass)}>
                            {trendSymbol(crop.trend)}
                          </span>
                          <span className={styles.priceUnit}>/qtl</span>
                        </div>
                        <p className={cx(styles.priceDelta, trendClass)}>
                          {trendSymbol(crop.trend)}{' '}
                          ₹{Math.abs(crop.delta).toLocaleString('en-IN')} ({Math.abs(crop.deltaPercent)}%)
                          {' '}vs yesterday
                        </p>
                      </div>
                      <Sparkline data={last30} trend={crop.trend} width={72} height={36} />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        <p className={styles.provenance}>
          Source: Agmarknet · Updated today, 6:40 AM
        </p>
      </div>
    </FarmerLayout>
  )
}
