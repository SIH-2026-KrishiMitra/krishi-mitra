import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, X, CheckCircle, Clock, XCircle } from 'lucide-react'
import BuyerLayout from './BuyerLayout'
import { useBuyer } from '../../context/BuyerContext'
import type { DbOffer } from '../../types'
import styles from './BuyerOffers.module.css'

const STATUS_LABEL: Record<DbOffer['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock size={13} />,
  accepted: <CheckCircle size={13} />,
  rejected: <XCircle size={13} />,
  expired: <XCircle size={13} />,
  cancelled: <XCircle size={13} />,
}

export default function BuyerOffers() {
  const navigate = useNavigate()
  const { offers, offersLoading, cancelOffer } = useBuyer()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(offers[0]?.id ?? null)

  const selected = offers.find(o => o.id === selectedId)

  async function handleCancel(offerId: string) {
    setCancellingId(offerId)
    await cancelOffer(offerId)
    setCancellingId(null)
  }

  if (!offersLoading && offers.length === 0) {
    return (
      <BuyerLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <p className={styles.breadcrumb}>03 · MY OFFERS</p>
            <h1 className={styles.title}>My offers</h1>
          </div>
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No offers yet</p>
            <p className={styles.emptySub}>Browse the marketplace to find lots and submit your first offer.</p>
            <button type="button" className={styles.emptyAction} onClick={() => navigate('/buyer/marketplace')}>
              Browse marketplace
            </button>
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
            <p className={styles.breadcrumb}>03 · MY OFFERS</p>
            <h1 className={styles.title}>My offers</h1>
            <p className={styles.subtitle}>{offers.filter(o => o.status === 'pending').length} pending</p>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Offer list */}
          <div className={styles.offerList}>
            {offersLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skeleton} />)
            ) : offers.map(offer => (
              <div key={offer.id}
                className={`${styles.offerCard} ${selectedId === offer.id ? styles.offerCardActive : ''}`}
                onClick={() => setSelectedId(offer.id)}>
                <div className={styles.offerCardTop}>
                  <div className={styles.offerCropInfo}>
                    <p className={styles.offerCrop}>{offer.lot?.crop ?? '—'} · {offer.lot?.variety ?? ''}</p>
                    <p className={styles.offerMandi}>{offer.lot?.mandi ?? ''} · Grade {offer.lot?.grade ?? '—'}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status_${offer.status}`]}`}>
                    {STATUS_ICON[offer.status]} {STATUS_LABEL[offer.status]}
                  </span>
                </div>
                <div className={styles.offerCardBot}>
                  <span className={styles.offerPrice} data-numeric="">₹{offer.offer_price.toLocaleString('en-IN')}/qtl</span>
                  <span className={styles.offerQty}>{offer.quantity} qtl</span>
                  <span className={styles.offerDate}>{new Date(offer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Offer detail */}
          {selected && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailCrop}>{selected.lot?.crop ?? 'Offer'} · {selected.lot?.variety ?? ''}</h2>
                  <p className={styles.detailId}>Offer #{selected.id.slice(0, 8)}</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status_${selected.status}`]}`}>
                  {STATUS_ICON[selected.status]} {STATUS_LABEL[selected.status]}
                </span>
              </div>

              {selected.status === 'accepted' && (
                <div className={styles.acceptedBanner}>
                  <CheckCircle size={14} />
                  <div>
                    <p className={styles.bannerTitle}>Offer accepted! A deal has been created.</p>
                    <button type="button" className={styles.bannerLink} onClick={() => navigate('/buyer/deals')}>
                      View deal →
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.detailRows}>
                <DetailRow label="Lot" value={`${selected.lot?.crop ?? ''} · ${selected.lot?.variety ?? ''} · Grade ${selected.lot?.grade ?? '—'}`} />
                <DetailRow label="Mandi" value={selected.lot?.mandi ?? '—'} />
                <DetailRow label="Your price" value={`₹${selected.offer_price.toLocaleString('en-IN')}/qtl`} />
                <DetailRow label="Quantity" value={`${selected.quantity} qtl`} />
                <DetailRow label="Total value" value={`₹${(selected.offer_price * selected.quantity).toLocaleString('en-IN')}`} />
                <DetailRow label="Pickup timeline" value={selected.pickup_timeline} />
                <DetailRow label="Payment" value={selected.escrow_protected ? 'Escrow protected' : 'Direct payment'} />
                <DetailRow label="Submitted" value={new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                {selected.valid_until && (
                  <DetailRow label="Valid until" value={new Date(selected.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                )}
              </div>

              {selected.notes && (
                <div className={styles.notesBox}>
                  <p className={styles.notesLabel}>Your note</p>
                  <p className={styles.notesText}>{selected.notes}</p>
                </div>
              )}

              {selected.escrow_protected && (
                <div className={styles.escrowNote}>
                  <ShieldCheck size={14} />
                  <p>₹{(selected.offer_price * selected.quantity).toLocaleString('en-IN')} will be held in escrow until delivery is confirmed.</p>
                </div>
              )}

              {selected.status === 'pending' && (
                <button type="button" className={styles.cancelBtn}
                  onClick={() => handleCancel(selected.id)}
                  disabled={cancellingId === selected.id}>
                  <X size={14} aria-hidden />
                  {cancellingId === selected.id ? 'Cancelling…' : 'Cancel this offer'}
                </button>
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
