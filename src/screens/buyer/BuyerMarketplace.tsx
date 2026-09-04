import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, ChevronRight, ShieldCheck, X, Minus, Plus } from 'lucide-react'
import BuyerLayout from './BuyerLayout'
import { useBuyer } from '../../context/BuyerContext'
import { useAuth } from '../../context/AuthContext'
import type { DbLot } from '../../types'
import styles from './BuyerMarketplace.module.css'

const GRADE_LABELS: Record<string, string> = { A: 'Grade A (Premium)', B: 'Grade B', C: 'Grade C' }
const STATUS_LABELS: Record<string, string> = { listed: 'Fresh listing', offers_received: 'Has offers' }

export default function BuyerMarketplace() {
  const { lots, lotsLoading, submitOffer } = useBuyer()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLot, setSelectedLot] = useState<DbLot | null>(null)
  const [showOffer, setShowOffer] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [offerForm, setOfferForm] = useState({
    price: '',
    quantity: '',
    pickupTimeline: '7 days',
    paymentMode: 'escrow' as 'escrow' | 'direct',
    notes: '',
  })

  const filtered = useMemo(() => {
    return lots.filter(l => {
      const matchSearch = !search || [l.crop, l.variety, l.mandi].some(v =>
        v.toLowerCase().includes(search.toLowerCase())
      )
      const matchGrade = !gradeFilter || l.grade === gradeFilter
      return matchSearch && matchGrade
    })
  }, [lots, search, gradeFilter])

  async function handleSubmitOffer() {
    if (!selectedLot || !user) return
    const price = parseFloat(offerForm.price)
    const quantity = parseFloat(offerForm.quantity)
    if (!price || !quantity) return
    setSubmitting(true)
    const result = await submitOffer({
      lot_id: selectedLot.id,
      offer_price: price,
      quantity,
      pickup_timeline: offerForm.pickupTimeline,
      payment_terms: offerForm.paymentMode === 'escrow' ? 'Escrow protected payment via KrishiMitra' : 'Direct payment',
      payment_mode: offerForm.paymentMode,
      escrow_protected: offerForm.paymentMode === 'escrow',
      notes: offerForm.notes || undefined,
    })
    setSubmitting(false)
    if (result) {
      setShowOffer(false)
      setSelectedLot(null)
    }
  }

  function openLot(lot: DbLot) {
    setSelectedLot(lot)
    setShowOffer(false)
    setOfferForm({ price: String(lot.expected_price), quantity: String(lot.quantity), pickupTimeline: '7 days', paymentMode: 'escrow', notes: '' })
  }

  return (
    <BuyerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>02 · MARKETPLACE</p>
            <h1 className={styles.title}>Browse lots</h1>
            {!lotsLoading && <p className={styles.subtitle}>{filtered.length} lot{filtered.length !== 1 ? 's' : ''} available</p>}
          </div>
        </div>

        {/* Search + filters */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} aria-hidden />
            <input type="search" placeholder="Search crop, variety, mandi…" value={search}
              onChange={e => setSearch(e.target.value)} className={styles.searchInput} />
          </div>
          <button type="button" className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
            onClick={() => setShowFilters(f => !f)}>
            <SlidersHorizontal size={15} aria-hidden /> Filters
          </button>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>Grade</p>
              <div className={styles.filterChips}>
                {(['', 'A', 'B', 'C'] as const).map(g => (
                  <button key={g} type="button"
                    className={`${styles.chip} ${gradeFilter === g ? styles.chipActive : ''}`}
                    onClick={() => setGradeFilter(g)}>
                    {g === '' ? 'All grades' : `Grade ${g}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.contentGrid}>
          {/* Lot list */}
          <div className={styles.lotList}>
            {lotsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className={styles.skeleton} />)
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No lots available</p>
                <p className={styles.emptySub}>Active farmer listings will appear here.</p>
              </div>
            ) : filtered.map(lot => (
              <div key={lot.id}
                className={`${styles.lotCard} ${selectedLot?.id === lot.id ? styles.lotCardActive : ''}`}
                onClick={() => openLot(lot)}>
                {lot.image_urls[0] && (
                  <div className={styles.lotImage}>
                    <img src={lot.image_urls[0]} alt={lot.crop} loading="lazy" />
                  </div>
                )}
                <div className={styles.lotCardBody}>
                  <div className={styles.lotCardHeader}>
                    <div>
                      <p className={styles.lotCrop}>{lot.crop} · {lot.variety}</p>
                      <p className={styles.lotMeta}>{lot.mandi} · {GRADE_LABELS[lot.grade]}</p>
                    </div>
                    <ChevronRight size={16} className={styles.lotArrow} aria-hidden />
                  </div>
                  <div className={styles.lotCardFooter}>
                    <div className={styles.lotPriceBlock}>
                      <span className={styles.lotPrice} data-numeric="">₹{lot.expected_price.toLocaleString('en-IN')}</span>
                      <span className={styles.lotUnit}>/{lot.unit === 'qtl' ? 'qtl' : lot.unit}</span>
                    </div>
                    <div className={styles.lotTags}>
                      <span className={styles.lotQty}>{lot.quantity} {lot.unit === 'qtl' ? 'qtl' : lot.unit}</span>
                      {lot.payment_mode === 'escrow' && (
                        <span className={styles.escrowTag}><ShieldCheck size={11} /> Escrow</span>
                      )}
                      <span className={`${styles.statusTag} ${lot.status === 'offers_received' ? styles.statusHot : ''}`}>
                        {STATUS_LABELS[lot.status] ?? lot.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lot detail panel */}
          {selectedLot && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailCrop}>{selectedLot.crop} · {selectedLot.variety}</h2>
                  <p className={styles.detailId}>Lot #{selectedLot.id}</p>
                </div>
                <button type="button" className={styles.closeBtn} onClick={() => setSelectedLot(null)}>
                  <X size={18} />
                </button>
              </div>

              {selectedLot.image_urls.length > 0 && (
                <div className={styles.detailImages}>
                  {selectedLot.image_urls.slice(0, 3).map((url, i) => (
                    <img key={i} src={url} alt="" className={styles.detailImage} loading="lazy" />
                  ))}
                </div>
              )}

              <div className={styles.detailRows}>
                <DetailRow label="Mandi" value={selectedLot.mandi} />
                <DetailRow label="Grade" value={GRADE_LABELS[selectedLot.grade]} />
                <DetailRow label="Available quantity" value={`${selectedLot.quantity} ${selectedLot.unit === 'qtl' ? 'qtl' : selectedLot.unit}`} />
                <DetailRow label="Expected price" value={`₹${selectedLot.expected_price.toLocaleString('en-IN')}/${selectedLot.unit === 'qtl' ? 'qtl' : selectedLot.unit}`} />
                <DetailRow label="Payment mode" value={selectedLot.payment_mode === 'escrow' ? 'Escrow protected' : 'Direct payment'} />
                <DetailRow label="Assaying" value={selectedLot.assaying ? 'Available' : 'Not requested'} />
                {selectedLot.description && <DetailRow label="Notes" value={selectedLot.description} />}
              </div>

              {selectedLot.payment_mode === 'escrow' && (
                <div className={styles.escrowNote}>
                  <ShieldCheck size={14} aria-hidden />
                  <p>This lot supports escrow-protected payment. Your money is secured until delivery is confirmed.</p>
                </div>
              )}

              {!showOffer ? (
                <button type="button" className={styles.makeOfferBtn} onClick={() => setShowOffer(true)}>
                  Make an offer
                </button>
              ) : (
                <div className={styles.offerForm}>
                  <h3 className={styles.offerFormTitle}>Your offer</h3>
                  <div className={styles.offerField}>
                    <label className={styles.offerLabel}>Offer price (₹/{selectedLot.unit === 'qtl' ? 'qtl' : selectedLot.unit})</label>
                    <div className={styles.numInput}>
                      <button type="button" onClick={() => setOfferForm(f => ({ ...f, price: String(Math.max(0, Number(f.price) - 50)) }))}>
                        <Minus size={14} />
                      </button>
                      <input type="number" value={offerForm.price} onChange={e => setOfferForm(f => ({ ...f, price: e.target.value }))} className={styles.numValue} />
                      <button type="button" onClick={() => setOfferForm(f => ({ ...f, price: String(Number(f.price) + 50) }))}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.offerField}>
                    <label className={styles.offerLabel}>Quantity ({selectedLot.unit === 'qtl' ? 'qtl' : selectedLot.unit})</label>
                    <input type="number" value={offerForm.quantity} max={selectedLot.quantity}
                      onChange={e => setOfferForm(f => ({ ...f, quantity: e.target.value }))}
                      className={styles.offerInput} />
                    <p className={styles.offerHint}>Max: {selectedLot.quantity} {selectedLot.unit === 'qtl' ? 'qtl' : selectedLot.unit}</p>
                  </div>
                  <div className={styles.offerField}>
                    <label className={styles.offerLabel}>Pickup timeline</label>
                    <select value={offerForm.pickupTimeline} onChange={e => setOfferForm(f => ({ ...f, pickupTimeline: e.target.value }))} className={styles.offerSelect}>
                      <option>3 days</option>
                      <option>7 days</option>
                      <option>10 days</option>
                      <option>14 days</option>
                    </select>
                  </div>
                  <div className={styles.offerField}>
                    <label className={styles.offerLabel}>Payment mode</label>
                    <div className={styles.paymentToggle}>
                      {(['escrow', 'direct'] as const).map(m => (
                        <button key={m} type="button"
                          className={`${styles.paymentOpt} ${offerForm.paymentMode === m ? styles.paymentOptActive : ''}`}
                          onClick={() => setOfferForm(f => ({ ...f, paymentMode: m }))}>
                          {m === 'escrow' ? <><ShieldCheck size={13} /> Escrow</> : 'Direct'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.offerField}>
                    <label className={styles.offerLabel}>Note to farmer (optional)</label>
                    <textarea rows={2} className={styles.offerTextarea} value={offerForm.notes}
                      onChange={e => setOfferForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Tell the farmer about your business, transport plans, etc." />
                  </div>

                  {offerForm.price && offerForm.quantity && (
                    <div className={styles.offerSummary}>
                      <span>Total offer value</span>
                      <span className={styles.offerTotal} data-numeric="">
                        ₹{(Number(offerForm.price) * Number(offerForm.quantity)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className={styles.offerActions}>
                    <button type="button" className={styles.cancelOfferBtn} onClick={() => setShowOffer(false)}>Cancel</button>
                    <button type="button" className={styles.submitOfferBtn}
                      onClick={handleSubmitOffer} disabled={!offerForm.price || !offerForm.quantity || submitting}>
                      {submitting ? 'Submitting…' : 'Submit offer'}
                    </button>
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
