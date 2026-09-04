import { useState } from 'react'
import { CheckCircle2, ShieldCheck, Phone } from 'lucide-react'
import BuyerLayout from './BuyerLayout'
import { useBuyer } from '../../context/BuyerContext'
import type { ExpandedDeal } from '../../services/supabase/deals'
import type { DealStatus } from '../../types'
import styles from './BuyerDeals.module.css'

const STATUS_ORDER: DealStatus[] = [
  'offer_accepted', 'money_deposited', 'transport_assigned',
  'pickup_scheduled', 'delivered', 'payment_released',
]

const STEP_LABELS: Record<DealStatus, string> = {
  offer_accepted: 'Offer accepted',
  money_deposited: 'Money deposited',
  transport_assigned: 'Transport assigned',
  pickup_scheduled: 'Pickup scheduled',
  delivered: 'Delivered',
  payment_released: 'Payment released',
}

const STATUS_LABEL: Record<DealStatus, string> = {
  offer_accepted: 'In progress',
  money_deposited: 'Escrow active',
  transport_assigned: 'Transport ready',
  pickup_scheduled: 'Pickup scheduled',
  delivered: 'Delivered',
  payment_released: 'Completed',
}

function buildTimeline(deal: ExpandedDeal) {
  const currentIdx = STATUS_ORDER.indexOf(deal.status)
  return STATUS_ORDER.map((s, i) => ({
    label: STEP_LABELS[s],
    completed: i < currentIdx,
    active: i === currentIdx,
    timestamp: deal.timeline?.find((e: { status: string; timestamp: string }) => e.status === s)?.timestamp
      ? new Date(deal.timeline.find((e: { status: string; timestamp: string }) => e.status === s)!.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : undefined,
  }))
}

export default function BuyerDeals() {
  const { deals, dealsLoading } = useBuyer()
  const [selectedId, setSelectedId] = useState<string | null>(deals[0]?.id ?? null)

  const selected = deals.find(d => d.id === selectedId)
  const timeline = selected ? buildTimeline(selected) : []

  if (!dealsLoading && deals.length === 0) {
    return (
      <BuyerLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <p className={styles.breadcrumb}>04 · MY DEALS</p>
            <h1 className={styles.title}>My deals</h1>
          </div>
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No active deals</p>
            <p className={styles.emptySub}>Deals appear here once a farmer accepts your offer.</p>
          </div>
        </div>
      </BuyerLayout>
    )
  }

  return (
    <BuyerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>04 · MY DEALS</p>
            <h1 className={styles.title}>My deals</h1>
            <p className={styles.subtitle}>{deals.filter(d => d.status !== 'payment_released').length} active</p>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Deal list */}
          <div className={styles.dealList}>
            {dealsLoading ? (
              Array.from({ length: 2 }).map((_, i) => <div key={i} className={styles.skeleton} />)
            ) : deals.map(deal => (
              <div key={deal.id}
                className={`${styles.dealCard} ${selectedId === deal.id ? styles.dealCardActive : ''}`}
                onClick={() => setSelectedId(deal.id)}>
                <div className={styles.dealCardTop}>
                  <div>
                    <p className={styles.dealCrop}>{deal.crop} · {deal.variety}</p>
                    <p className={styles.dealId}>Deal #{deal.id.slice(0, 8)}</p>
                  </div>
                  <span className={`${styles.statusPill} ${deal.status === 'payment_released' ? styles.statusDone : styles.statusActive}`}>
                    {STATUS_LABEL[deal.status]}
                  </span>
                </div>
                <div className={styles.dealCardBot}>
                  <span className={styles.dealQty}>{deal.quantity} {deal.unit === 'qtl' ? 'qtl' : deal.unit}</span>
                  <span className={styles.dealValue} data-numeric="">₹{deal.total_value.toLocaleString('en-IN')}</span>
                  {deal.escrow_amount > 0 && (
                    <span className={styles.escrowPill}><ShieldCheck size={11} /> ₹{deal.escrow_amount.toLocaleString('en-IN')} escrow</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Deal detail */}
          {selected && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailCrop}>{selected.crop} · {selected.variety}</h2>
                  <p className={styles.detailId}>Deal #{selected.id.slice(0, 8)}</p>
                </div>
                <span className={`${styles.statusPill} ${selected.status === 'payment_released' ? styles.statusDone : styles.statusActive}`}>
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>

              {selected.escrow_amount > 0 && (
                <div className={styles.escrowBanner}>
                  <ShieldCheck size={14} />
                  <div>
                    <p className={styles.escrowTitle}>₹{selected.escrow_amount.toLocaleString('en-IN')} in escrow</p>
                    <p className={styles.escrowSub}>Released to farmer after delivery confirmation</p>
                  </div>
                </div>
              )}

              <div className={styles.dealRows}>
                <DetailRow label="Quantity" value={`${selected.quantity} ${selected.unit === 'qtl' ? 'qtl' : selected.unit}`} />
                <DetailRow label="Price per unit" value={`₹${selected.price_per_unit.toLocaleString('en-IN')}/${selected.unit === 'qtl' ? 'qtl' : selected.unit}`} />
                <DetailRow label="Total value" value={`₹${selected.total_value.toLocaleString('en-IN')}`} />
                <DetailRow label="Started" value={new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>

              {/* Timeline */}
              <div className={styles.timelineCard}>
                <h3 className={styles.timelineTitle}>Deal progress</h3>
                <div className={styles.timeline}>
                  {timeline.map((step, i) => (
                    <div key={i} className={`${styles.step} ${step.completed ? styles.stepDone : ''} ${step.active ? styles.stepActive : ''}`}>
                      <div className={styles.stepLeft}>
                        <div className={styles.stepDot}>
                          {step.completed && <CheckCircle2 size={14} />}
                        </div>
                        {i < timeline.length - 1 && (
                          <div className={`${styles.stepLine} ${step.completed ? styles.stepLineDone : ''}`} />
                        )}
                      </div>
                      <div className={styles.stepContent}>
                        <p className={styles.stepLabel}>{step.label}</p>
                        {step.timestamp && <p className={styles.stepTime}>{step.timestamp}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transport info */}
              {selected.transport && (
                <div className={styles.transportCard}>
                  <p className={styles.transportTitle}>Transport</p>
                  <div className={styles.transportRow}>
                    <div className={styles.transportInfo}>
                      <span className={styles.transportVehicle}>{(selected.transport as { vehicleNumber?: string }).vehicleNumber ?? '—'}</span>
                      <span className={styles.transportDriver}>{(selected.transport as { driverName?: string }).driverName ?? ''}</span>
                    </div>
                    {(selected.transport as { driverPhone?: string }).driverPhone && (
                      <button type="button" className={styles.callBtn}>
                        <Phone size={13} /> Call driver
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  )
}
