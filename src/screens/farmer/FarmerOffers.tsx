import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ShieldCheck, X, MessageCircle } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import { useApp } from '../../context/AppContext'
import styles from './FarmerOffers.module.css'

export default function FarmerOffers() {
  const navigate = useNavigate()
  const { state, acceptOffer, rejectOffer } = useApp()
  const [selectedOfferId, setSelectedOfferId] = useState(
    state.offers.find(o => o.status === 'active')?.id ?? null
  )
  const [confirmAccept, setConfirmAccept] = useState(false)
  const [accepting, setAccepting] = useState(false)

  const activeOffers = state.offers.filter(o => o.status === 'active')
  const selectedOffer = activeOffers.find(o => o.id === selectedOfferId)

  async function handleAccept() {
    if (!selectedOfferId) return
    setAccepting(true)
    const deal = await acceptOffer(selectedOfferId)
    setAccepting(false)
    setConfirmAccept(false)
    if (deal) {
      navigate('/farmer/deals', { state: { newDealId: deal.id } })
    }
  }

  async function handleReject() {
    if (!selectedOfferId) return
    await rejectOffer(selectedOfferId)
    const next = activeOffers.find(o => o.id !== selectedOfferId)
    setSelectedOfferId(next?.id ?? null)
  }

  const lot = selectedOffer ? state.lots.find(l => l.id === selectedOffer.lotId) : null

  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>04 · BUYERS & OFFERS</p>
            <h1 className={styles.title}>
              {activeOffers.length > 0
                ? `${activeOffers.length} buyer${activeOffers.length > 1 ? 's' : ''} want your lot`
                : 'Buyers & Offers'}
            </h1>
            {lot && <p className={styles.subtitle}>Lot {lot.id} · {lot.crop} · {lot.quantity} {lot.unit}</p>}
          </div>
        </div>

        {activeOffers.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No active offers</p>
            <p className={styles.emptyBody}>Offers will appear here when buyers respond to your listed lots.</p>
          </div>
        ) : (
          <div className={styles.contentGrid}>
            {/* Offer list */}
            <div className={styles.offerList}>
              {activeOffers.map((offer, idx) => (
                <div
                  key={offer.id}
                  className={`${styles.offerCard} ${selectedOfferId === offer.id ? styles.offerCardActive : ''}`}
                  onClick={() => setSelectedOfferId(offer.id)}
                >
                  <div className={styles.offerCardHeader}>
                    <div className={styles.buyerAvatar}>{offer.buyer.name.charAt(0)}</div>
                    <div className={styles.offerBuyerInfo}>
                      <div className={styles.offerBuyerName}>
                        {offer.buyer.name}
                        {offer.buyer.verificationStatus === 'verified' && (
                          <CheckCircle size={13} className={styles.verifiedIcon} />
                        )}
                      </div>
                      <span className={styles.offerBuyerType}>
                        {offer.buyer.type.charAt(0).toUpperCase() + offer.buyer.type.slice(1)}
                        {offer.buyer.trustScore > 0 && ` · Trust ${offer.buyer.trustScore}%`}
                      </span>
                    </div>
                    <div className={styles.offerPrice} data-numeric="">₹{offer.offerPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <div className={styles.offerMeta}>
                    <span>{offer.pickupTimeline}</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{offer.escrowProtected ? 'Escrow protected' : 'Direct payment'}</span>
                    {idx === 0 && <span className={styles.bestTag}>Best offer</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Offer detail */}
            {selectedOffer && (
              <div className={styles.offerDetail}>
                {selectedOffer.escrowProtected && (
                  <div className={styles.escrowBanner}>
                    <ShieldCheck size={14} aria-hidden />
                    <div>
                      <p className={styles.escrowBannerTitle}>₹{(selectedOffer.offerPrice * selectedOffer.quantity / 100).toLocaleString('en-IN')} stays protected until this is closed</p>
                      <p className={styles.escrowBannerSub}>Expect resolution by {new Date(Date.now() + 5 * 864e5).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <div className={styles.detailBuyerHeader}>
                    <div className={styles.detailAvatar}>{selectedOffer.buyer.name.charAt(0)}</div>
                    <div>
                      <div className={styles.detailNameRow}>
                        <h2 className={styles.detailName}>{selectedOffer.buyer.name}</h2>
                        {selectedOffer.buyer.verificationStatus === 'verified' && (
                          <span className={styles.verifiedBadge}><CheckCircle size={11} /> Verified</span>
                        )}
                      </div>
                      <p className={styles.detailType}>
                        {selectedOffer.buyer.type.charAt(0).toUpperCase() + selectedOffer.buyer.type.slice(1)}
                      </p>
                    </div>
                  </div>

                  <div className={styles.priceHighlight}>
                    <div>
                      <p className={styles.priceHighlightLabel}>Your share from this offer</p>
                      <p className={styles.priceHighlightValue} data-numeric="">
                        ₹{(selectedOffer.offerPrice * selectedOffer.quantity).toLocaleString('en-IN')}
                      </p>
                      <p className={styles.priceHighlightSub}>
                        ₹{selectedOffer.offerPrice.toLocaleString('en-IN')}/qtl × {selectedOffer.quantity} qtl
                      </p>
                    </div>
                    {selectedOffer.escrowProtected && (
                      <span className={styles.escrowSmall}><ShieldCheck size={12} /> Escrow</span>
                    )}
                  </div>

                  <div className={styles.detailRows}>
                    <DetailRow label="Offer price" value={`₹${selectedOffer.offerPrice.toLocaleString('en-IN')}/qtl`} />
                    <DetailRow label="Quantity requested" value={`${selectedOffer.quantity} qtl`} />
                    <DetailRow label="Pickup" value={selectedOffer.pickupTimeline} />
                    <DetailRow label="Payment terms" value={selectedOffer.paymentTerms} />
                    <DetailRow label="Valid until" value={new Date(selectedOffer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                    {selectedOffer.buyer.completedDeals > 0 && (
                      <DetailRow label="Completed deals" value={`${selectedOffer.buyer.completedDeals}+`} />
                    )}
                    <DetailRow label="Payment track record" value={`${selectedOffer.buyer.paymentHistory}%`} />
                  </div>

                  {selectedOffer.notes && (
                    <div className={styles.notesSection}>
                      <p className={styles.notesLabel}>Note from buyer</p>
                      <p className={styles.notesText}>{selectedOffer.notes}</p>
                    </div>
                  )}
                </div>

                <div className={styles.beforeAccept}>
                  <p className={styles.beforeAcceptTitle}>Before you accept</p>
                  <ul className={styles.beforeAcceptList}>
                    <li>Buyer arranged transport from your farm gate</li>
                    <li>Payment secured in escrow before pickup</li>
                    <li>Money released after delivery confirmation</li>
                  </ul>
                </div>

                <div className={styles.termsSummary}>
                  <p className={styles.termsSummaryLabel}>What terms say</p>
                  <p className={styles.termsSummaryText}>{selectedOffer.paymentTerms || 'Standard terms apply.'}</p>
                </div>

                <div className={styles.actionGroup}>
                  <button type="button" className={styles.rejectBtn} onClick={handleReject}>
                    <X size={15} aria-hidden /> Reject
                  </button>
                  <button type="button" className={styles.askBtn}>
                    <MessageCircle size={15} aria-hidden /> Ask a question
                  </button>
                  <button type="button" className={styles.acceptBtn} onClick={() => setConfirmAccept(true)}>
                    Accept offer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accept confirmation modal */}
        {confirmAccept && selectedOffer && (
          <div className={styles.modalOverlay} onClick={() => setConfirmAccept(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>Confirm acceptance</h3>
              <p className={styles.modalBody}>
                You are accepting{' '}
                <strong>₹{selectedOffer.offerPrice.toLocaleString('en-IN')}/qtl</strong>{' '}
                from <strong>{selectedOffer.buyer.name}</strong> for{' '}
                <strong>{selectedOffer.quantity} qtl</strong> of produce.
              </p>
              <p className={styles.modalNote}>
                ₹{(selectedOffer.offerPrice * selectedOffer.quantity).toLocaleString('en-IN')} will be held in escrow until delivery is confirmed.
              </p>
              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancel} onClick={() => setConfirmAccept(false)}>Cancel</button>
                <button type="button" className={styles.modalConfirm} onClick={handleAccept} disabled={accepting}>
                  {accepting ? 'Processing…' : 'Confirm & accept'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FarmerLayout>
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
