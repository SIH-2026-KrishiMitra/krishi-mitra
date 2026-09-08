import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import FarmerLayout from './FarmerLayout'
import { useApp } from '../../context/AppContext'
import type { LotStatus } from '../../types'
import styles from './FarmerLots.module.css'

const STATUS_LABEL: Record<LotStatus, string> = {
  draft: 'Draft',
  listed: 'Listed',
  offers_received: 'Offers received',
  deal_accepted: 'Deal accepted',
  in_transit: 'In transit',
  delivered: 'Delivered',
  completed: 'Completed',
}

type TabKey = 'all' | 'active' | 'completed' | 'draft'

const TABS: Array<{ id: TabKey; label: string }> = [
  { id: 'all', label: 'All lots' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'draft', label: 'Drafts' },
]

export default function FarmerLots() {
  const navigate = useNavigate()
  const { state, deleteLot } = useApp()
  const [tab, setTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = state.lots.filter(l => {
    const matchesTab =
      tab === 'all' ||
      (tab === 'active' && ['listed', 'offers_received', 'deal_accepted', 'in_transit', 'delivered'].includes(l.status)) ||
      (tab === 'completed' && l.status === 'completed') ||
      (tab === 'draft' && l.status === 'draft')
    const matchesSearch = l.crop.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  function handleLotClick(status: LotStatus, offersCount: number) {
    if (offersCount > 0 || status === 'offers_received') navigate('/farmer/offers')
    else if (status === 'deal_accepted' || status === 'in_transit') navigate('/farmer/deals')
    else if (status === 'draft') navigate('/farmer/lots/create')
  }

  async function handleDeleteConfirm() {
    if (!confirmId) return
    setDeleting(true)
    await deleteLot(confirmId)
    setDeleting(false)
    setConfirmId(null)
  }

  function statusClass(s: LotStatus): string {
    const map: Record<LotStatus, string> = {
      draft: styles.statusDraft,
      listed: styles.statusListed,
      offers_received: styles.statusOffers,
      deal_accepted: styles.statusDeal,
      in_transit: styles.statusTransit,
      delivered: styles.statusDelivered,
      completed: styles.statusCompleted,
    }
    return map[s] ?? ''
  }

  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>03 · MY LOTS</p>
            <h1 className={styles.title}>My lots</h1>
          </div>
          <button type="button" className={styles.createBtn} onClick={() => navigate('/farmer/lots/create')}>
            <Plus size={16} aria-hidden />
            Create lot
          </button>
        </div>

        <div className={styles.tabRow}>
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} aria-hidden />
            <input
              type="search"
              placeholder="Search by crop or lot ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No lots found</p>
            <p className={styles.emptyBody}>
              {tab === 'draft' ? 'No draft lots.' : 'Create your first lot to start selling.'}
            </p>
            <button type="button" className={styles.emptyAction} onClick={() => navigate('/farmer/lots/create')}>
              <Plus size={14} aria-hidden />
              Create lot
            </button>
          </div>
        ) : (
          <div className={styles.lotList}>
            {filtered.map(lot => (
              <div
                key={lot.id}
                className={styles.lotCard}
                onClick={() => handleLotClick(lot.status, lot.offersCount)}
              >
                <div className={styles.lotCardLeft}>
                  <div className={styles.lotCropIcon}>{lot.crop.charAt(0)}</div>
                  <div className={styles.lotInfo}>
                    <div className={styles.lotTitleRow}>
                      <span className={styles.lotCrop}>{lot.crop}</span>
                      <span className={styles.lotVariety}>· {lot.variety}</span>
                      <span className={`${styles.statusBadge} ${statusClass(lot.status)}`}>
                        {STATUS_LABEL[lot.status]}
                      </span>
                    </div>
                    <div className={styles.lotMeta}>
                      <span data-numeric="">{lot.quantity} {lot.unit}</span>
                      <span className={styles.metaDot}>·</span>
                      <span>Grade {lot.grade}</span>
                      <span className={styles.metaDot}>·</span>
                      <span>{lot.mandi}</span>
                      <span className={styles.metaDot}>·</span>
                      <span>{lot.id}</span>
                    </div>
                    <div className={styles.lotDate}>
                      {new Date(lot.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className={styles.lotCardRight}>
                  <div className={styles.priceRow}>
                    <span className={styles.lotPrice} data-numeric="">₹{lot.expectedPrice.toLocaleString('en-IN')}</span>
                    <span className={styles.lotPriceUnit}>/qtl</span>
                  </div>
                  {lot.offersCount > 0 && (
                    <span className={styles.offersBadge}>{lot.offersCount} offer{lot.offersCount > 1 ? 's' : ''}</span>
                  )}
                  <div className={styles.lotAction}>
                    {lot.status === 'draft' && <span className={styles.actionLink}>Continue →</span>}
                    {(lot.status === 'listed' || lot.status === 'offers_received') && <span className={styles.actionLink}>View offers →</span>}
                    {(lot.status === 'deal_accepted' || lot.status === 'in_transit') && <span className={styles.actionLink}>Track deal →</span>}
                  </div>
                  {(lot.status === 'draft' || lot.status === 'listed') && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={e => { e.stopPropagation(); setConfirmId(lot.id) }}
                      title="Delete lot"
                      aria-label="Delete lot"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmId && (
        <div className={styles.overlay} onClick={() => { if (!deleting) setConfirmId(null) }}>
          <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <p className={styles.confirmTitle}>Delete this lot?</p>
            <p className={styles.confirmBody}>This action cannot be undone. The lot will be permanently removed.</p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={() => setConfirmId(null)}
                disabled={deleting}
              >
                Keep lot
              </button>
              <button
                type="button"
                className={styles.confirmDelete}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete lot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FarmerLayout>
  )
}
