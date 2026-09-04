import { useNavigate } from 'react-router-dom'
import { ShoppingBag, TrendingUp, Package, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react'
import BuyerLayout from './BuyerLayout'
import { useBuyer } from '../../context/BuyerContext'
import { useAuth } from '../../context/AuthContext'
import styles from './BuyerHome.module.css'

export default function BuyerHome() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { offers, deals, lots, escrow, dealsLoading } = useBuyer()

  const name = profile?.full_name ?? 'Buyer'
  const firstName = name.split(' ')[0]
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const pendingOffers = offers.filter(o => o.status === 'pending').length
  const activeDeals = deals.filter(d => d.status !== 'payment_released').length
  const completedDeals = deals.filter(d => d.status === 'payment_released').length
  const totalProtected = escrow.filter(e => e.status === 'protected').reduce((s, e) => s + e.amount, 0)

  const recentDeal = deals.find(d => d.status !== 'payment_released')
  const activeLotCount = lots.length

  return (
    <BuyerLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>01 · DASHBOARD</p>
            <h1 className={styles.title}>Namaste, {firstName}</h1>
            <p className={styles.date}>{today}</p>
          </div>
          <div className={styles.headerBadge}>Buyer Portal</div>
        </div>

        {/* Quick stats */}
        <div className={styles.statsGrid}>
          <StatCard icon={<ShoppingBag size={20} />} label="Pending offers" value={String(pendingOffers)} color="indigo"
            action={() => navigate('/buyer/offers')} />
          <StatCard icon={<Package size={20} />} label="Active deals" value={String(activeDeals)} color="green"
            action={() => navigate('/buyer/deals')} />
          <StatCard icon={<TrendingUp size={20} />} label="Lots available" value={String(activeLotCount)} color="amber"
            action={() => navigate('/buyer/marketplace')} />
          <StatCard icon={<CheckCircle size={20} />} label="Completed deals" value={String(completedDeals)} color="success"
            action={() => navigate('/buyer/deals')} />
        </div>

        {/* Escrow summary */}
        {totalProtected > 0 && (
          <div className={styles.escrowBanner} onClick={() => navigate('/buyer/payments')}>
            <ShieldCheck size={18} className={styles.escrowIcon} />
            <div className={styles.escrowText}>
              <p className={styles.escrowAmount}>₹{totalProtected.toLocaleString('en-IN')} in escrow</p>
              <p className={styles.escrowSub}>Secured until delivery is confirmed</p>
            </div>
            <ArrowRight size={16} className={styles.escrowArrow} />
          </div>
        )}

        <div className={styles.mainGrid}>
          {/* Active deal */}
          <div className={styles.leftCol}>
            {recentDeal ? (
              <div className={styles.dealCard} onClick={() => navigate('/buyer/deals')}>
                <div className={styles.dealCardHeader}>
                  <div>
                    <p className={styles.dealLabel}>Active purchase</p>
                    <p className={styles.dealTitle}>{recentDeal.crop} · {recentDeal.variety}</p>
                    <p className={styles.dealMeta}>{recentDeal.quantity} {recentDeal.unit === 'qtl' ? 'qtl' : recentDeal.unit} · ₹{recentDeal.total_value.toLocaleString('en-IN')}</p>
                  </div>
                  {recentDeal.escrow_amount > 0 && (
                    <div className={styles.escrowPill}>
                      <ShieldCheck size={12} />
                      ₹{recentDeal.escrow_amount.toLocaleString('en-IN')} secured
                    </div>
                  )}
                </div>
                <div className={styles.dealProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{
                      width: `${(['offer_accepted', 'money_deposited', 'transport_assigned', 'pickup_scheduled', 'delivered', 'payment_released'].indexOf(recentDeal.status) + 1) / 6 * 100}%`
                    }} />
                  </div>
                  <p className={styles.progressLabel}>{recentDeal.status.replace(/_/g, ' ')}</p>
                </div>
                <div className={styles.dealAction}>
                  Track deal <ArrowRight size={14} />
                </div>
              </div>
            ) : !dealsLoading && (
              <div className={styles.noDeals}>
                <p className={styles.noDealsTitle}>No active deals</p>
                <p className={styles.noDealsSub}>Browse farmer lots and submit an offer to start a deal.</p>
                <button type="button" className={styles.browseBtn} onClick={() => navigate('/buyer/marketplace')}>
                  Browse marketplace
                </button>
              </div>
            )}
          </div>

          {/* Recent offers */}
          <div className={styles.rightCol}>
            <div className={styles.offersCard}>
              <div className={styles.offersCardHeader}>
                <h2 className={styles.offersCardTitle}>Recent offers</h2>
                <button type="button" className={styles.offersCardLink} onClick={() => navigate('/buyer/offers')}>
                  See all
                </button>
              </div>
              {offers.length === 0 ? (
                <p className={styles.offersEmpty}>No offers yet. Find a lot and make your first offer.</p>
              ) : offers.slice(0, 4).map(offer => (
                <div key={offer.id} className={styles.offerRow}>
                  <div className={styles.offerRowLeft}>
                    <p className={styles.offerCrop}>{offer.lot?.crop ?? '—'} · {offer.lot?.variety ?? ''}</p>
                    <p className={styles.offerPrice}>₹{offer.offer_price.toLocaleString('en-IN')}/qtl · {offer.quantity} qtl</p>
                  </div>
                  <span className={`${styles.offerStatus} ${styles[`offerStatus_${offer.status}`]}`}>
                    {offer.status}
                  </span>
                </div>
              ))}
              <button type="button" className={styles.marketplaceBtn} onClick={() => navigate('/buyer/marketplace')}>
                <ShoppingBag size={14} /> Browse marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    </BuyerLayout>
  )
}

function StatCard({ icon, label, value, color, action }: {
  icon: React.ReactNode; label: string; value: string; color: string; action?: () => void
}) {
  return (
    <div className={`${styles.statCard} ${styles[`statCard_${color}`]}`} onClick={action} style={{ cursor: action ? 'pointer' : undefined }}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  )
}
