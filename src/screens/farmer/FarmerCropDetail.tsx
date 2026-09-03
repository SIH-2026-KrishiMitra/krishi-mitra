import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import Card from '../../components/Card/Card'
import Button from '../../components/Button/Button'
import PriceChart from '../../components/PriceChart/PriceChart'
import TrustBadge from '../../components/TrustBadge/TrustBadge'
import StateView from '../../components/StateView/StateView'
import { cx } from '../../lib/cx'
import { CROP_MARKET_DATA } from '../../data/mockPrices'
import type { PriceTrend } from '../../types/price'
import styles from './FarmerCropDetail.module.css'

type Range = '1W' | '1M' | '3M'
const RANGES: Range[] = ['1W', '1M', '3M']
const RANGE_DAYS: Record<Range, number> = { '1W': 7, '1M': 30, '3M': 90 }

const NEARBY_MANDIS = [
  { name: 'Nashik APMC', dist: '12 km', delta: +60 },
  { name: 'Pune APMC', dist: '38 km', delta: -25 },
]

function trendSymbol(trend: PriceTrend) {
  return trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'
}

export default function FarmerCropDetail() {
  const { cropId } = useParams<{ cropId: string }>()
  const navigate = useNavigate()
  const [range, setRange] = useState<Range>('1M')

  const crop = CROP_MARKET_DATA.find(c => c.id === cropId)

  if (!crop) {
    return (
      <FarmerLayout title="Market" onBack={() => navigate('/farmer/market')}>
        <StateView
          kind="error"
          title="Crop not found"
          description="We could not find price data for this crop."
          action={{ label: 'Back to market', onClick: () => navigate('/farmer/market') }}
        />
      </FarmerLayout>
    )
  }

  const days = RANGE_DAYS[range]
  const chartData = crop.priceHistory.slice(-days)

  const trendClass =
    crop.trend === 'up' ? styles.up : crop.trend === 'down' ? styles.down : styles.flat

  const isGoodToSell = crop.trend === 'up' || crop.currentPrice >= crop.msp
  const belowMsp = crop.currentPrice < crop.msp

  return (
    <FarmerLayout
      title={`${crop.crop} · ${crop.mandi}`}
      onBack={() => navigate('/farmer/market')}
    >
      <div className={styles.page}>
        <div className={styles.layout}>
          {/* Left column: chart + mandis */}
          <div className={styles.leftCol}>
            <Card>
              <h2 className={styles.sectionLabel}>Price trend</h2>
              <PriceChart data={chartData} msp={crop.msp} height={180} />
              <div className={styles.rangeRow}>
                {RANGES.map(r => (
                  <button
                    key={r}
                    type="button"
                    className={cx(styles.rangeBtn, range === r ? styles.rangeBtnActive : undefined)}
                    onClick={() => setRange(r)}
                    aria-pressed={range === r}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className={styles.provenance}>
                Source: {crop.source} · Updated {crop.updatedAt}
              </p>
            </Card>

            <Card>
              <h2 className={styles.sectionLabel}>Nearby mandis</h2>
              <div className={styles.mandiList}>
                {NEARBY_MANDIS.map(m => (
                  <div key={m.name} className={styles.mandiRow}>
                    <div className={styles.mandiInfo}>
                      <MapPin size={14} className={styles.mandiIcon} />
                      <div>
                        <p className={styles.mandiName}>{m.name}</p>
                        <p className={styles.mandiDist}>{m.dist}</p>
                      </div>
                    </div>
                    <span
                      className={cx(
                        styles.mandiDelta,
                        m.delta > 0 ? styles.up : styles.down,
                      )}
                    >
                      {m.delta > 0 ? '▲' : '▼'} ₹{Math.abs(m.delta)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column: price + action */}
          <div className={styles.rightCol}>
            <Card>
              <p className={styles.cropLabel}>{crop.crop.toUpperCase()}</p>
              <p className={cx(styles.bigPrice, trendClass)} data-numeric="">
                ₹{crop.currentPrice.toLocaleString('en-IN')}
              </p>
              <p className={styles.priceUnit}>per quintal</p>
              <p className={cx(styles.delta, trendClass)}>
                {trendSymbol(crop.trend)} ₹{Math.abs(crop.delta).toLocaleString('en-IN')}{' '}
                ({Math.abs(crop.deltaPercent)}%) vs yesterday
              </p>
              <p className={styles.mspLine}>
                MSP: ₹{crop.msp.toLocaleString('en-IN')}/qtl
                {belowMsp && (
                  <span className={styles.belowMsp}> · Below MSP</span>
                )}
              </p>
            </Card>

            <Card className={isGoodToSell ? styles.cardSuccess : styles.cardWarn}>
              <p className={styles.recommendHeading}>
                {isGoodToSell ? 'Good time to sell' : 'Consider holding'}
              </p>
              <p className={styles.recommendText}>
                {isGoodToSell
                  ? `Price is ${crop.delta > 0 ? 'rising' : 'above MSP'}. Market conditions look favourable for listing your lot now.`
                  : `Current price is below MSP by ₹${(crop.msp - crop.currentPrice).toLocaleString('en-IN')}. Consider waiting or exploring other mandis.`}
              </p>
            </Card>

            <Button
              variant="accent"
              size="lg"
              onClick={() =>
                navigate(`/farmer/lots/create?crop=${crop.id}`)
              }
            >
              Sell this crop
            </Button>

            <div className={styles.trustRow}>
              <TrustBadge type="escrow" />
              <TrustBadge type="price-source" />
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  )
}
