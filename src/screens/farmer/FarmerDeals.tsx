import { useState } from 'react'
import { CheckCircle2, Download, AlertTriangle, Phone } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import { useApp } from '../../context/AppContext'
import type { DealStatus } from '../../types'
import styles from './FarmerDeals.module.css'

const ADVANCE_MAP: Partial<Record<DealStatus, DealStatus>> = {
  offer_accepted: 'money_deposited',
  money_deposited: 'transport_assigned',
  transport_assigned: 'pickup_scheduled',
  pickup_scheduled: 'delivered',
  delivered: 'payment_released',
}

const STATUS_LABEL: Record<DealStatus, string> = {
  offer_accepted: 'Offer accepted',
  money_deposited: 'Money deposited',
  transport_assigned: 'Transport assigned',
  pickup_scheduled: 'Pickup scheduled',
  delivered: 'Delivered',
  payment_released: 'Payment released',
}

const ADVANCE_BUTTON_LABEL: Partial<Record<DealStatus, string>> = {
  pickup_scheduled: 'Confirm pickup date',
  delivered: 'Confirm delivery',
  money_deposited: 'Confirm money received',
}

export default function FarmerDeals() {
  const { state, advanceDeal } = useApp()
  const [selectedDealId, setSelectedDealId] = useState(state.deals[0]?.id ?? null)
  const [advancing, setAdvancing] = useState(false)

  const selectedDeal = state.deals.find(d => d.id === selectedDealId)
  const nextStatus = selectedDeal ? ADVANCE_MAP[selectedDeal.status] : undefined

  async function handleAdvance() {
    if (!selectedDealId || !nextStatus) return
    setAdvancing(true)
    await new Promise(r => setTimeout(r, 500))
    advanceDeal(selectedDealId, nextStatus)
    setAdvancing(false)
  }

  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>05 · MY DEALS</p>
            <h1 className={styles.title}>My deals</h1>
          </div>
          {selectedDeal && (
            <div className={styles.dealHeaderRight}>
              <span className={styles.dealIdLabel}>Deal #{selectedDeal.id}</span>
              <button type="button" className={styles.downloadBtn}>
                <Download size={14} aria-hidden />
                Download record
              </button>
            </div>
          )}
        </div>

        {state.deals.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No deals yet</p>
            <p className={styles.emptyBody}>Accept an offer to start a deal.</p>
          </div>
        ) : (
          <div className={styles.contentGrid}>
            {/* Deal selector (left) */}
            <div className={styles.dealSelector}>
              {state.deals.map(deal => (
                <div
                  key={deal.id}
                  className={`${styles.dealTab} ${selectedDealId === deal.id ? styles.dealTabActive : ''}`}
                  onClick={() => setSelectedDealId(deal.id)}
                >
                  <div className={styles.dealTabMain}>
                    <span className={styles.dealTabCrop}>{deal.crop} · {deal.quantity} {deal.unit}</span>
                    <span className={styles.dealTabBuyer}>{deal.buyer.name}</span>
                  </div>
                  <span className={`${styles.dealTabStatus} ${deal.status === 'payment_released' ? styles.statusDone : styles.statusActive}`}>
                    {STATUS_LABEL[deal.status]}
                  </span>
                </div>
              ))}
            </div>

            {/* Deal detail (right) */}
            {selectedDeal && (
              <div className={styles.dealDetail}>
                {/* Progress timeline */}
                <div className={styles.timelineCard}>
                  <div className={styles.timelineHeader}>
                    <h2 className={styles.timelineTitle}>Progress</h2>
                    <span className={styles.escrowAmount} data-numeric="">
                      ₹{selectedDeal.escrowAmount.toLocaleString('en-IN')} protected
                    </span>
                  </div>

                  <div className={styles.timeline}>
                    {selectedDeal.timeline.map((step, i) => (
                      <div
                        key={i}
                        className={`${styles.timelineStep} ${step.completed ? styles.timelineStepDone : ''} ${step.active ? styles.timelineStepActive : ''}`}
                      >
                        <div className={styles.timelineDotWrap}>
                          <div className={styles.timelineDot}>
                            {step.completed && <CheckCircle2 size={18} aria-hidden />}
                          </div>
                          {i < selectedDeal.timeline.length - 1 && <div className={`${styles.timelineLine} ${step.completed ? styles.timelineLineDone : ''}`} />}
                        </div>
                        <div className={styles.timelineContent}>
                          <p className={styles.timelineLabel}>{step.label}</p>
                          {step.timestamp && <p className={styles.timelineTime}>{step.timestamp}</p>}
                          {step.detail && <p className={styles.timelineDetail}>{step.detail}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial summary */}
                <div className={styles.financeCard}>
                  <div className={styles.escrowHighlight}>
                    <p className={styles.escrowHighlightLabel}>Amount in escrow</p>
                    <p className={styles.escrowHighlightValue} data-numeric="">₹{selectedDeal.escrowAmount.toLocaleString('en-IN')}</p>
                    <p className={styles.escrowHighlightSub}>Buyer deposited ₹{selectedDeal.escrowAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className={styles.financeRows}>
                    <FinRow label="Price per unit" value={`₹${selectedDeal.pricePerUnit.toLocaleString('en-IN')}/qtl`} />
                    <FinRow label="Quantity" value={`${selectedDeal.quantity} ${selectedDeal.unit}`} />
                    <FinRow label="Buyer" value={selectedDeal.buyer.name} />
                    {selectedDeal.transport && (
                      <FinRow label="Vehicle" value={selectedDeal.transport.vehicleNumber} />
                    )}
                    <FinRow label="Bank account" value={`Bank of Maharashtra · ****4417`} />
                    <FinRow label="Transaction ref" value={`UTR${selectedDeal.id.slice(-5)}0001`} />
                    <FinRow label="Expected payment" value={selectedDeal.status === 'payment_released' ? 'Released' : selectedDeal.transport ? `By ${selectedDeal.transport.estimatedDelivery}` : 'After delivery'} />
                  </div>
                </div>

                {/* Transport info */}
                {selectedDeal.transport && (
                  <div className={styles.transportCard}>
                    <h3 className={styles.transportTitle}>Assigned driver</h3>
                    <div className={styles.transportInfo}>
                      <div className={styles.transportRow}>
                        <span className={styles.transportLabel}>Vehicle</span>
                        <span className={styles.transportValue}>{selectedDeal.transport.vehicleNumber}</span>
                      </div>
                      <div className={styles.transportRow}>
                        <span className={styles.transportLabel}>Driver</span>
                        <span className={styles.transportValue}>{selectedDeal.transport.driverName}</span>
                      </div>
                      <div className={styles.transportRow}>
                        <span className={styles.transportLabel}>Pickup</span>
                        <span className={styles.transportValue}>{selectedDeal.transport.pickupDate} at {selectedDeal.transport.pickupTime}</span>
                      </div>
                    </div>
                    <button type="button" className={styles.callDriverBtn}>
                      <Phone size={14} aria-hidden />
                      Call driver · {selectedDeal.transport.driverPhone}
                    </button>
                  </div>
                )}

                {/* Problem reporting */}
                <div className={styles.problemCard}>
                  <p className={styles.problemTitle}>Something wrong with this deal?</p>
                  <div className={styles.problemLinks}>
                    <button type="button" className={styles.problemLink}>
                      <AlertTriangle size={13} aria-hidden />
                      Report a weight problem
                    </button>
                    <button type="button" className={styles.problemLink}>
                      <AlertTriangle size={13} aria-hidden />
                      Report a quality problem
                    </button>
                    <button type="button" className={styles.problemLink}>
                      <AlertTriangle size={13} aria-hidden />
                      Report a payment problem
                    </button>
                  </div>
                </div>

                {/* Advance deal button */}
                {nextStatus && selectedDeal.status !== 'payment_released' && (
                  <button
                    type="button"
                    className={styles.advanceBtn}
                    onClick={handleAdvance}
                    disabled={advancing}
                  >
                    {advancing ? 'Updating…' : (ADVANCE_BUTTON_LABEL[selectedDeal.status] ?? `Advance to: ${STATUS_LABEL[nextStatus]}`)}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </FarmerLayout>
  )
}

function FinRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.finRow}>
      <span className={styles.finLabel}>{label}</span>
      <span className={styles.finValue}>{value}</span>
    </div>
  )
}
