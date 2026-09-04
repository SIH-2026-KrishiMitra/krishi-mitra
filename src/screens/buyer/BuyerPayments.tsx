import { ShieldCheck, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import BuyerLayout from './BuyerLayout'
import { useBuyer } from '../../context/BuyerContext'
import type { EscrowStatus } from '../../types'
import styles from './BuyerPayments.module.css'

const STATUS_LABEL: Record<EscrowStatus, string> = {
  pending: 'Pending deposit',
  protected: 'Protected',
  released: 'Released',
  disputed: 'Disputed',
  release_pending: 'Refunded',
}

const STATUS_ICON: Record<EscrowStatus, React.ReactNode> = {
  pending: <Clock size={14} />,
  protected: <ShieldCheck size={14} />,
  released: <CheckCircle size={14} />,
  disputed: <AlertCircle size={14} />,
  release_pending: <AlertCircle size={14} />,
}

export default function BuyerPayments() {
  const { escrow, escrowLoading, deals } = useBuyer()

  const totalProtected = escrow.filter(e => e.status === 'protected').reduce((s, e) => s + e.amount, 0)
  const totalReleased = escrow.filter(e => e.status === 'released').reduce((s, e) => s + e.amount, 0)
  const pendingCount = escrow.filter(e => e.status === 'pending').length

  return (
    <BuyerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>05 · PAYMENTS</p>
            <h1 className={styles.title}>Payments &amp; escrow</h1>
          </div>
        </div>

        {/* Summary cards */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statProtected}`}>
            <ShieldCheck size={20} className={styles.statIcon} aria-hidden />
            <div>
              <p className={styles.statValue} data-numeric="">₹{totalProtected.toLocaleString('en-IN')}</p>
              <p className={styles.statLabel}>In escrow</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statReleased}`}>
            <CheckCircle size={20} className={styles.statIcon} aria-hidden />
            <div>
              <p className={styles.statValue} data-numeric="">₹{totalReleased.toLocaleString('en-IN')}</p>
              <p className={styles.statLabel}>Released to farmers</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statDeals}`}>
            <Clock size={20} className={styles.statIcon} aria-hidden />
            <div>
              <p className={styles.statValue}>{deals.length}</p>
              <p className={styles.statLabel}>Total deals</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className={`${styles.statCard} ${styles.statPending}`}>
              <AlertCircle size={20} className={styles.statIcon} aria-hidden />
              <div>
                <p className={styles.statValue}>{pendingCount}</p>
                <p className={styles.statLabel}>Awaiting deposit</p>
              </div>
            </div>
          )}
        </div>

        {/* How escrow works */}
        <div className={styles.howCard}>
          <h2 className={styles.howTitle}>How escrow works</h2>
          <div className={styles.howSteps}>
            <HowStep n="1" label="You accept a deal" desc="Your escrow amount is calculated from the offer." />
            <HowStep n="2" label="Deposit escrow" desc="Funds are held securely — the farmer is notified." />
            <HowStep n="3" label="Pickup & delivery" desc="Transport picks up produce from the farm gate." />
            <HowStep n="4" label="Confirm delivery" desc="Once delivered, escrow is released to the farmer." />
          </div>
        </div>

        {/* Escrow transactions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Escrow transactions</h2>
          {escrowLoading ? (
            <div className={styles.loading}>Loading transactions…</div>
          ) : escrow.length === 0 ? (
            <div className={styles.empty}>
              <p>No escrow transactions yet. Accepted deals will appear here.</p>
            </div>
          ) : (
            <div className={styles.txnList}>
              {escrow.map(e => (
                <div key={e.id} className={styles.txnCard}>
                  <div className={styles.txnLeft}>
                    <span className={`${styles.txnStatusIcon} ${styles[`txnStatus_${e.status}`]}`}>
                      {STATUS_ICON[e.status]}
                    </span>
                    <div className={styles.txnInfo}>
                      <p className={styles.txnCrop}>
                        {e.lot_info ? `${e.lot_info.crop} · ${e.lot_info.variety} · Grade ${e.lot_info.grade}` : e.lot_id}
                      </p>
                      <p className={styles.txnDeal}>Deal #{e.deal_id.slice(0, 8)}</p>
                      {e.deposited_at && (
                        <p className={styles.txnDate}>Deposited {new Date(e.deposited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      )}
                      {e.released_at && (
                        <p className={styles.txnDate}>Released {new Date(e.released_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      )}
                      {e.dispute_note && <p className={styles.txnDispute}>{e.dispute_note}</p>}
                    </div>
                  </div>
                  <div className={styles.txnRight}>
                    <span className={styles.txnAmount} data-numeric="">₹{e.amount.toLocaleString('en-IN')}</span>
                    <span className={`${styles.txnBadge} ${styles[`txnBadge_${e.status}`]}`}>
                      {STATUS_LABEL[e.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  )
}

function HowStep({ n, label, desc }: { n: string; label: string; desc: string }) {
  return (
    <div className={styles.howStep}>
      <div className={styles.howStepNum}>{n}</div>
      <div>
        <p className={styles.howStepLabel}>{label}</p>
        <p className={styles.howStepDesc}>{desc}</p>
      </div>
    </div>
  )
}
