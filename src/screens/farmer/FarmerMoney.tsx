import { useState } from 'react'
import { ShieldCheck, Clock, CheckCircle } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import { useApp } from '../../context/AppContext'
import { SEED_TRANSACTIONS } from '../../data/mockData'
import styles from './FarmerMoney.module.css'

const ESCROW_STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  protected: 'Protected',
  release_pending: 'Release pending',
  released: 'Released',
  disputed: 'Disputed',
}

export default function FarmerMoney() {
  const { state } = useApp()
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)

  const totalSold = '8.4 tonnes'
  const totalEarned = 2_06_150
  const avgPrice = 2455
  const inEscrow = state.escrow.filter(e => e.status === 'protected' || e.status === 'pending').reduce((s, e) => s + e.amount, 0)
  const pendingEarnings = state.escrow.filter(e => e.status === 'release_pending').reduce((s, e) => s + e.amount, 0)


  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>06 · MONEY</p>
            <h1 className={styles.title}>My sales &amp; money</h1>
            <p className={styles.subtitle}>Kharif 2026 · 16 completed deals</p>
          </div>
        </div>

        {/* Offline notice */}
        <div className={styles.offlineBanner}>
          <span className={styles.offlineDot} />
          You are offline. Showing records saved on this computer — 2 actions will be sent when the network returns.
        </div>

        {/* Stats row */}
        <div className={styles.statsGrid}>
          <StatCard
            label="TOTAL SOLD"
            value={totalSold}
            variant="default"
          />
          <StatCard
            label="EARNED"
            value={`₹${(totalEarned / 100000).toFixed(2)} L`}
            sub={`₹9,400 above mando rate`}
            variant="success"
          />
          <StatCard
            label="AVG PRICE REALISED"
            value={`₹${avgPrice.toLocaleString('en-IN')}`}
            sub="Per quintal, all crops"
            variant="default"
          />
        </div>

        {/* Escrow status */}
        {(inEscrow > 0 || pendingEarnings > 0) && (
          <div className={styles.escrowSection}>
            <h2 className={styles.sectionTitle}>Escrow status</h2>
            <div className={styles.escrowCards}>
              {state.escrow.filter(e => e.status !== 'released').map(e => (
                <div key={e.id} className={styles.escrowCard}>
                  <div className={styles.escrowCardLeft}>
                    <ShieldCheck size={18} className={styles.escrowCardIcon} aria-hidden />
                    <div>
                      <p className={styles.escrowCardCrop}>{e.crop}</p>
                      <p className={styles.escrowCardBuyer}>{e.buyerName}</p>
                      {e.expectedReleaseDate && (
                        <p className={styles.escrowCardDate}>Expected {e.expectedReleaseDate}</p>
                      )}
                    </div>
                  </div>
                  <div className={styles.escrowCardRight}>
                    <span className={styles.escrowCardAmount} data-numeric="">₹{e.amount.toLocaleString('en-IN')}</span>
                    <span className={`${styles.escrowStatus} ${styles[`escrowStatus_${e.status}`]}`}>
                      {ESCROW_STATUS_LABEL[e.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction records */}
        <div className={styles.txSection}>
          <h2 className={styles.sectionTitle}>Transaction records</h2>
          <div className={styles.txTable}>
            <div className={styles.txHeader}>
              <span>CROP &amp; BUYER</span>
              <span>DATE</span>
              <span>QUANTITY</span>
              <span>RATE</span>
              <span>STATUS</span>
            </div>
            {SEED_TRANSACTIONS.map(tx => (
              <div
                key={tx.id}
                className={`${styles.txRow} ${selectedTxId === tx.id ? styles.txRowActive : ''}`}
                onClick={() => setSelectedTxId(selectedTxId === tx.id ? null : tx.id)}
              >
                <div className={styles.txCropCell}>
                  <div className={styles.txCropIcon}>{tx.crop.charAt(0)}</div>
                  <div>
                    <p className={styles.txCropName}>{tx.crop} · {tx.grade}</p>
                    <p className={styles.txBuyerName}>{tx.buyer}</p>
                  </div>
                </div>
                <span className={styles.txDate}>{tx.date}</span>
                <span className={styles.txQty} data-numeric="">{tx.quantity} kg</span>
                <span className={styles.txRate} data-numeric="">₹{tx.rate.toLocaleString('en-IN')}/qt</span>
                <span className={`${styles.txStatus} ${styles[`txStatus_${tx.status}`]}`}>
                  {tx.status === 'completed' && <CheckCircle size={12} aria-hidden />}
                  {tx.status === 'pending' && <Clock size={12} aria-hidden />}
                  {tx.status === 'disputed' && <ShieldCheck size={12} aria-hidden />}
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FarmerLayout>
  )
}

function StatCard({ label, value, sub, variant }: {
  label: string; value: string; sub?: string; variant: 'default' | 'success'
}) {
  return (
    <div className={`${styles.statCard} ${variant === 'success' ? styles.statCardSuccess : ''}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue} data-numeric="">{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  )
}
