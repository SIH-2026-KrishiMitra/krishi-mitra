import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, TrendingDown, CheckCircle, ArrowUpRight, ShieldCheck, Plus } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import { useApp } from '../../context/AppContext'
import { useMarketPrices } from '../../hooks/useMarketPrices'
import PriceChart from '../../components/PriceChart/PriceChart'
import styles from './FarmerMarkets.module.css'

type SortKey = 'highest_price' | 'nearest' | 'demand' | 'fresh'

type DisplayOffer = {
  id: string
  buyer: {
    id: string; name: string; type: string; distance: number
    verificationStatus: string; trustScore: number
    paymentHistory: number; completedDeals: number
  }
  price: number
  demand: 'high' | 'medium' | 'low'
  fresh: boolean
}

const SORT_LABELS: Record<SortKey, string> = {
  highest_price: 'Highest price',
  nearest: 'Nearest',
  demand: 'Demand',
  fresh: 'Fresh data only',
}

export default function FarmerMarkets() {
  const navigate = useNavigate()
  const { state, selectCrop } = useApp()
  const { prices, loading: pricesLoading } = useMarketPrices()
  const [selectedCropId, setSelectedCropId] = useState(state.selectedCropId)
  const [sort, setSort] = useState<SortKey>('highest_price')
  const [search, setSearch] = useState('')
  const [selectedBuyerIdx, setSelectedBuyerIdx] = useState(0)

  const cropData = prices.find(m => m.id === selectedCropId) ?? prices[0]

  const sortedBuyerOffers = useMemo<DisplayOffer[]>(() => {
    const cropName = cropData?.crop ?? ''
    let filtered: DisplayOffer[] = state.offers
      .filter(o =>
        o.status === 'active' &&
        state.lots.find(l => l.id === o.lotId)?.crop.toLowerCase() === cropName.toLowerCase()
      )
      .map(o => ({
        id: o.id,
        buyer: o.buyer,
        price: o.offerPrice,
        demand: 'medium' as const,
        fresh: false,
      }))

    if (sort === 'highest_price') filtered.sort((a, b) => b.price - a.price)
    if (sort === 'nearest') filtered.sort((a, b) => a.buyer.distance - b.buyer.distance)
    if (sort === 'demand') {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
      filtered.sort((a, b) => order[a.demand] - order[b.demand])
    }
    if (sort === 'fresh') filtered = filtered.filter(o => o.fresh)
    return filtered
  }, [state.offers, state.lots, cropData, sort])

  const selectedBuyer = sortedBuyerOffers[selectedBuyerIdx]

  function handleCropSelect(cropId: string) {
    setSelectedCropId(cropId)
    selectCrop(cropId)
    setSelectedBuyerIdx(0)
  }

  const demandColor: Record<string, string> = {
    high: styles.demandHigh,
    medium: styles.demandMedium,
    low: styles.demandLow,
  }

  if (pricesLoading || prices.length === 0) {
    return (
      <FarmerLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>02 · MARKETS</p>
              <h1 className={styles.title}>Prices near you</h1>
            </div>
          </div>
          <div className={styles.emptyState}><p>Loading market prices…</p></div>
        </div>
      </FarmerLayout>
    )
  }

  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>02 · MARKETS</p>
            <h1 className={styles.title}>Prices near you</h1>
          </div>
          <button type="button" className={styles.createLotBtn} onClick={() => navigate('/farmer/lots/create')}>
            <Plus size={16} aria-hidden />
            Create lot
          </button>
        </div>

        <div className={styles.cropChips}>
          {prices.map(m => (
            <button key={m.id} type="button"
              className={`${styles.cropChip} ${selectedCropId === m.id ? styles.cropChipActive : ''}`}
              onClick={() => handleCropSelect(m.id)}>
              {m.crop}
            </button>
          ))}
        </div>

        <div className={styles.filterRow}>
          <div className={styles.sortChips}>
            {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
              <button key={k} type="button"
                className={`${styles.sortChip} ${sort === k ? styles.sortChipActive : ''}`}
                onClick={() => setSort(k)}>
                {SORT_LABELS[k]}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} aria-hidden />
            <input type="search" placeholder="Search buyers..." value={search}
              onChange={e => setSearch(e.target.value)} className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Buyer list */}
          <div className={styles.buyerList}>
            {sortedBuyerOffers
              .filter(o => o.buyer.name.toLowerCase().includes(search.toLowerCase()))
              .map((offer, i) => (
                <div key={offer.buyer.id}
                  className={`${styles.buyerCard} ${selectedBuyerIdx === i ? styles.buyerCardActive : ''}`}
                  onClick={() => setSelectedBuyerIdx(i)}>
                  <div className={styles.buyerCardLeft}>
                    <div className={styles.buyerAvatar}>{offer.buyer.name.charAt(0)}</div>
                    <div className={styles.buyerInfo}>
                      <div className={styles.buyerNameRow}>
                        <span className={styles.buyerName}>{offer.buyer.name}</span>
                        {offer.buyer.verificationStatus === 'verified' && (
                          <CheckCircle size={13} className={styles.verifiedIcon} aria-label="Verified" />
                        )}
                      </div>
                      <div className={styles.buyerMeta}>
                        <span className={`${styles.demandDot} ${demandColor[offer.demand]}`} />
                        <span>{offer.buyer.type.charAt(0).toUpperCase() + offer.buyer.type.slice(1)}</span>
                        <span className={styles.metaDot}>·</span>
                        <span>{offer.buyer.distance} km</span>
                        {offer.fresh && (
                          <><span className={styles.metaDot}>·</span><span className={styles.freshTag}>Fresh data</span></>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.buyerCardRight}>
                    <span className={styles.buyerPrice} data-numeric="">₹{offer.price.toLocaleString('en-IN')}</span>
                    {cropData && <span className={styles.priceUnit}>/{cropData.unit}</span>}
                  </div>
                </div>
              ))}
            {sortedBuyerOffers.length === 0 && (
              <div className={styles.emptyState}>
                <p>No buyers available for {cropData?.crop ?? 'this crop'} with current filters.</p>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className={styles.rightPanel}>
            {selectedBuyer && cropData && (
              <div className={styles.buyerDetail}>
                <div className={styles.bestOfferBanner}>
                  <ShieldCheck size={14} aria-hidden />
                  <span>Best offer today for your lot</span>
                </div>
                <div className={styles.detailHeader}>
                  <div className={styles.detailAvatar}>{selectedBuyer.buyer.name.charAt(0)}</div>
                  <div>
                    <div className={styles.detailNameRow}>
                      <h2 className={styles.detailName}>{selectedBuyer.buyer.name}</h2>
                      {selectedBuyer.buyer.verificationStatus === 'verified' && (
                        <span className={styles.verifiedBadge}><CheckCircle size={11} aria-hidden /> Verified</span>
                      )}
                    </div>
                    <p className={styles.detailType}>
                      {selectedBuyer.buyer.type.charAt(0).toUpperCase() + selectedBuyer.buyer.type.slice(1)} · {selectedBuyer.buyer.distance} km · Trust {selectedBuyer.buyer.trustScore}%
                    </p>
                  </div>
                </div>
                <div className={styles.priceHighlight}>
                  <div className={styles.priceHighlightMain}>
                    <span className={styles.priceHighlightLabel}>Offer price</span>
                    <span className={styles.priceHighlightValue} data-numeric="">₹{selectedBuyer.price.toLocaleString('en-IN')}</span>
                    <span className={styles.priceHighlightUnit}>per {cropData.unit}</span>
                  </div>
                  {selectedBuyerIdx === 0 && <span className={styles.bestBadge}>Best price</span>}
                </div>
                <div className={styles.detailRows}>
                  <DataRow label="Payment" value="Escrow protected" icon={<ShieldCheck size={13} />} />
                  <DataRow label="Demand" value={selectedBuyer.demand.charAt(0).toUpperCase() + selectedBuyer.demand.slice(1)} />
                  <DataRow label="Completed deals" value={`${selectedBuyer.buyer.completedDeals} deals`} />
                  <DataRow label="Payment track record" value={`${selectedBuyer.buyer.paymentHistory}%`} />
                </div>
                <button type="button" className={styles.sellToBuyerBtn}
                  onClick={() => navigate(`/farmer/lots/create?buyer=${selectedBuyer.buyer.id}`)}>
                  <ArrowUpRight size={16} aria-hidden /> Sell to this buyer
                </button>
              </div>
            )}

            {cropData && (
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>{cropData.crop} price at {cropData.mandi}</h3>
                  <div className={styles.priceMetaRow}>
                    <span className={styles.currentPriceSmall} data-numeric="">₹{cropData.currentPrice.toLocaleString('en-IN')}</span>
                    <span className={`${styles.priceDelta} ${cropData.trend === 'up' ? styles.priceUp : styles.priceDown}`}>
                      {cropData.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(cropData.deltaPercent)}%
                    </span>
                  </div>
                </div>
                <div className={styles.chartWrap}>
                  <PriceChart data={cropData.priceHistory} />
                </div>
                <div className={styles.chartFooter}>
                  <p className={styles.chartSource}>Source: {cropData.source} · Updated {cropData.updatedAt}</p>
                  <div className={styles.mspRow}>
                    <span className={styles.mspLabel}>MSP</span>
                    <span className={styles.mspValue} data-numeric="">₹{cropData.msp.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FarmerLayout>
  )
}

function DataRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className={styles.dataRow}>
      <span className={styles.dataLabel}>{label}</span>
      <span className={styles.dataValue}>
        {icon && <span className={styles.dataIcon}>{icon}</span>}
        {value}
      </span>
    </div>
  )
}
