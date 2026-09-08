import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, ArrowRight, Phone, MapPin } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import { useApp } from '../../context/AppContext'
import { useMarketPrices } from '../../hooks/useMarketPrices'
import { usePricePrediction } from '../../hooks/usePricePrediction'
import styles from './FarmerHome.module.css'

const FALLBACK_RECOMMENDATION = {
  sellToday: 2450,
  holdRange: '₹2,500–2,600',
  holdDays: '7 days',
  confidence: 'Good',
  confidencePct: 72,
  reason: 'Prices nearby are strong and 8% above the 10-day average. Waiting adds storage cost with a small expected gain.',
}

const CONFIDENCE_PCT: Record<string, number> = {
  exact: 85, no_variety: 65, no_market: 45, no_district: 30,
}
const CONFIDENCE_LABEL: Record<string, string> = {
  exact: 'High', no_variety: 'Medium', no_market: 'Low', no_district: 'Low',
}

const NEARBY_TAGS = ['Best today', '— Stable', '↑ Rising'] as const
const NEARBY_TAG_TYPES = ['success', 'neutral', 'info'] as const

export default function FarmerHome() {
  const navigate = useNavigate()
  const { state } = useApp()
  const { prices } = useMarketPrices()
  const todayCrop = prices[0]
  const predParams = todayCrop
    ? { crop: todayCrop.crop, mandi: todayCrop.mandi, variety: todayCrop.variety }
    : null
  const { prediction: homePrediction, available: predAvailable } = usePricePrediction(predParams)

  // "Sell now" card — use ML data when available and reliable
  const useML = predAvailable
    && !!homePrediction
    && !!todayCrop
    && !['national', 'national_all_time'].includes(homePrediction.matchLevel)

  const sellToday = todayCrop?.currentPrice ?? FALLBACK_RECOMMENDATION.sellToday
  const pctChange = useML && homePrediction && todayCrop
    ? ((homePrediction.predictedPrice - todayCrop.currentPrice) / todayCrop.currentPrice) * 100
    : null
  const holdRange = useML && homePrediction
    ? `₹${homePrediction.predictedPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : FALLBACK_RECOMMENDATION.holdRange
  const confidencePct = useML && homePrediction
    ? (CONFIDENCE_PCT[homePrediction.matchLevel] ?? 55)
    : FALLBACK_RECOMMENDATION.confidencePct
  const confidenceText = useML && homePrediction
    ? (CONFIDENCE_LABEL[homePrediction.matchLevel] ?? 'Medium')
    : FALLBACK_RECOMMENDATION.confidence
  const sellReason = useML && pctChange !== null
    ? pctChange > 3
      ? `ML model predicts a ${pctChange.toFixed(1)}% price rise over the next 7 days. Consider holding if storage cost allows.`
      : pctChange < -3
      ? `ML model predicts a ${Math.abs(pctChange).toFixed(1)}% price drop in the next 7 days. Selling now may be the better option.`
      : 'ML model predicts stable prices for the next 7 days. Selling now or holding are both reasonable.'
    : FALLBACK_RECOMMENDATION.reason

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const activeDeal = state.deals.find(d => d.status !== 'payment_released')

  const completedDeals = state.deals.filter(d => d.status === 'payment_released')
  const totalQtyKg = completedDeals.reduce((s, d) => s + d.quantity, 0)
  const totalEarned = completedDeals.reduce((s, d) => s + d.totalValue, 0)
  const avgPrice = completedDeals.length > 0
    ? Math.round(completedDeals.reduce((s, d) => s + d.pricePerUnit, 0) / completedDeals.length)
    : 0

  const nearbyOffers = state.offers
    .filter(o => o.status === 'active')
    .sort((a, b) => b.offerPrice - a.offerPrice)
    .slice(0, 3)

  const priceHistory = todayCrop?.priceHistory.slice(-7) ?? []

  const maxP = priceHistory.length ? Math.max(...priceHistory.map(p => p.price)) : 0
  const minP = priceHistory.length ? Math.min(...priceHistory.map(p => p.price)) : 0

  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>01 · DASHBOARD</p>
            <h1 className={styles.greeting}>Namaste, {state.farmer.name.split(' ')[0]}</h1>
            <p className={styles.date}>{today} · your market today</p>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Left column */}
          <div className={styles.leftCol}>
            {/* Today's price hero card */}
            <div className={styles.priceHero}>
              <div className={styles.priceHeroHeader}>
                <span className={styles.priceHeroLabel}>TODAY'S PRICE · {todayCrop?.crop.toUpperCase() ?? '—'}</span>
              </div>
              <div className={styles.priceHeroMain}>
                <div className={styles.priceHeroValue}>
                  <span className={styles.rupee}>₹</span>
                  <span className={styles.priceNumber}>{todayCrop?.currentPrice.toLocaleString('en-IN') ?? '—'}</span>
                </div>
                {todayCrop && (
                  <div className={styles.priceTrend}>
                    <TrendingUp size={16} aria-hidden />
                    <span>↑{todayCrop.deltaPercent}% today</span>
                  </div>
                )}
              </div>
              <p className={styles.priceSource}>
                {todayCrop?.mandi ?? '—'} · updated {todayCrop?.updatedAt ?? '—'} · Agmarknet
              </p>

              {/* Mini sparkline */}
              <div className={styles.sparklineWrap} aria-label="Last 7 days price trend">
                <div className={styles.sparkline}>
                  {priceHistory.map((p, i) => {
                    const h = maxP === minP ? 50 : ((p.price - minP) / (maxP - minP)) * 100
                    return (
                      <div key={i} className={styles.sparkBar} style={{ height: `${Math.max(10, h)}%` }} />
                    )
                  })}
                </div>
                <p className={styles.sparkLabel}>Last 7 days</p>
              </div>

              {predAvailable && homePrediction && todayCrop && (
                <div className={styles.predictionStrip}>
                  <span className={styles.predictionStripLabel}>7-day prediction</span>
                  <span className={styles.predictionStripValue} data-numeric="">
                    ₹{homePrediction.predictedPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  {homePrediction.predictedPrice > todayCrop.currentPrice
                    ? <TrendingUp size={12} className={styles.predStripUp} aria-hidden />
                    : <TrendingDown size={12} className={styles.predStripDown} aria-hidden />
                  }
                  <span className={styles.predictionStripChange}>
                    {homePrediction.predictedPrice > todayCrop.currentPrice ? '+' : ''}
                    {(((homePrediction.predictedPrice - todayCrop.currentPrice) / todayCrop.currentPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              <div className={styles.priceHeroActions}>
                <button type="button" className={styles.checkPricesBtn} onClick={() => navigate('/farmer/markets')}>
                  Check all prices
                </button>
                <button type="button" className={styles.changeCropBtn} onClick={() => navigate('/farmer/markets')}>
                  Change crop
                </button>
              </div>
            </div>

            {/* Active deal */}
            {activeDeal && (
              <div className={styles.activeDeal}>
                <div className={styles.activeDealHeader}>
                  <div>
                    <p className={styles.activeDealLabel}>My active sale</p>
                    <p className={styles.activeDealId}>Deal #{activeDeal.id}</p>
                    <p className={styles.activeDealMeta}>
                      {activeDeal.crop} {activeDeal.quantity} kg · {activeDeal.buyer.name}
                    </p>
                  </div>
                  <div className={styles.escrowBadge}>
                    <span className={styles.escrowDot} />
                    ₹{activeDeal.escrowAmount.toLocaleString('en-IN')} in escrow
                  </div>
                </div>

                {/* Timeline */}
                <div className={styles.dealTimeline}>
                  {activeDeal.timeline.slice(0, 5).map((step, i) => (
                    <div key={i} className={`${styles.dealStep} ${step.completed ? styles.dealStepDone : ''} ${step.active ? styles.dealStepActive : ''}`}>
                      <div className={styles.dealStepDot} />
                      <div className={styles.dealStepContent}>
                        <p className={styles.dealStepLabel}>{step.label}</p>
                        {step.timestamp && <p className={styles.dealStepTime}>{step.timestamp}</p>}
                        {step.detail && <p className={styles.dealStepDetail}>{step.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Driver */}
                {activeDeal.transport && (
                  <div className={styles.driverRow}>
                    <div className={styles.driverAvatar}>
                      <MapPin size={14} aria-hidden />
                    </div>
                    <div className={styles.driverInfo}>
                      <span className={styles.driverVehicle}>{activeDeal.transport.vehicleNumber}</span>
                      <span className={styles.driverName}>{activeDeal.transport.driverName}</span>
                      <span className={styles.driverPickup}>Pickup {activeDeal.transport.pickupDate === '2026-09-04' ? 'tomorrow' : activeDeal.transport.pickupDate} at {activeDeal.transport.pickupTime} at your farm gate</span>
                    </div>
                    <div className={styles.driverActions}>
                      <button type="button" className={styles.callBtn}>
                        <Phone size={14} aria-hidden />
                        Call driver
                      </button>
                      <button type="button" className={styles.trackBtn} onClick={() => navigate('/farmer/deals')}>
                        Track sale
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className={styles.rightCol}>
            {/* Sell now recommendation */}
            <div className={styles.sellNow}>
              <div className={styles.sellNowHeader}>
                <h2 className={styles.sellNowTitle}>Sell now</h2>
                <span className={styles.sellNowHindi}>अभी बेचें</span>
              </div>
              <p className={styles.sellNowReason}>{sellReason}</p>

              <div className={styles.sellOptions}>
                <div className={styles.sellOption}>
                  <span className={styles.sellOptionLabel}>SELL TODAY</span>
                  <span className={styles.sellOptionPrice} data-numeric="">₹{sellToday.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.sellDivider} />
                <div className={styles.sellOption}>
                  <span className={styles.sellOptionLabel}>HOLD 7 DAYS</span>
                  <span className={styles.sellOptionPrice} data-numeric="">{holdRange}</span>
                </div>
              </div>

              <div className={styles.confidenceRow}>
                <span className={styles.confidenceLabel}>Confidence</span>
                <div className={styles.confidenceBar}>
                  <div className={styles.confidenceFill} style={{ width: `${confidencePct}%` }} />
                </div>
                <span className={styles.confidenceValue}>{confidenceText}</span>
              </div>
              <p className={styles.confidenceNote}>
                {useML ? 'ML-powered guidance · demo data · not a guaranteed prediction.' : 'Guidance to help you decide — not a guaranteed prediction.'}
              </p>

              <button type="button" className={styles.sellNowBtn} onClick={() => navigate('/farmer/lots/create')}>
                Sell now
              </button>
              <button type="button" className={styles.seeWhyBtn} onClick={() => navigate('/farmer/markets')}>
                See why
              </button>
            </div>

            {/* Nearby options */}
            <div className={styles.nearbySection}>
              <h2 className={styles.nearbySectionTitle}>Nearby options today</h2>
              <div className={styles.nearbyList}>
                {nearbyOffers.length > 0 ? nearbyOffers.map(({ buyer, offerPrice }, i) => (
                  <div key={buyer.id} className={styles.nearbyItem} onClick={() => navigate('/farmer/markets')}>
                    <div className={styles.nearbyInfo}>
                      <span className={styles.nearbyBuyerName}>{buyer.name}</span>
                      <span className={styles.nearbyBuyerMeta}>{buyer.type} · Grade A</span>
                    </div>
                    <div className={styles.nearbyRight}>
                      <span className={styles.nearbyPrice} data-numeric="">₹{offerPrice.toLocaleString('en-IN')}</span>
                      <span className={`${styles.nearbyTag} ${styles[`nearbyTag_${NEARBY_TAG_TYPES[i]}`]}`}>{NEARBY_TAGS[i]}</span>
                    </div>
                    <ArrowRight size={14} className={styles.nearbyArrow} aria-hidden />
                  </div>
                )) : (
                  <div className={styles.nearbyItem} onClick={() => navigate('/farmer/markets')}>
                    <div className={styles.nearbyInfo}>
                      <span className={styles.nearbyBuyerName}>No active offers</span>
                      <span className={styles.nearbyBuyerMeta}>Check market prices for buyers near you</span>
                    </div>
                    <ArrowRight size={14} className={styles.nearbyArrow} aria-hidden />
                  </div>
                )}
              </div>
            </div>

            {/* Season stats */}
            <div className={styles.seasonCard}>
              <h2 className={styles.seasonTitle}>This season so far</h2>
              <div className={styles.seasonStats}>
                <div className={styles.seasonStat}>
                  <span className={styles.seasonStatValue} data-numeric="">{totalQtyKg > 0 ? `${(totalQtyKg / 1000).toFixed(1)} t` : '—'}</span>
                  <span className={styles.seasonStatLabel}>SOLD</span>
                </div>
                <div className={styles.seasonStat}>
                  <span className={styles.seasonStatValue} data-numeric="">{totalEarned > 0 ? `₹${(totalEarned / 100000).toFixed(2)} L` : '—'}</span>
                  <span className={styles.seasonStatLabel}>EARNED</span>
                </div>
                <div className={styles.seasonStat}>
                  <span className={styles.seasonStatValue} data-numeric="">{avgPrice > 0 ? `₹${avgPrice.toLocaleString('en-IN')}` : '—'}</span>
                  <span className={styles.seasonStatLabel}>AVG PRICE</span>
                </div>
              </div>
              <p className={styles.seasonNote}>
                <TrendingUp size={12} aria-hidden /> {completedDeals.length} deal{completedDeals.length !== 1 ? 's' : ''} completed this season
              </p>
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  )
}
