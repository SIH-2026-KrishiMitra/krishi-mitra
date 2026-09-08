import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, X, Users, Package, ShoppingCart,
  ArrowLeftRight, MessageSquare, ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import type { DbProfile, DbLot, DbDeal, DbEscrowTransaction, DbGrievance, ComplaintType } from '../../types'
import styles from './AdminGlobalSearch.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type AdminProfile = DbProfile & { farmer_profile?: { verified: boolean } | null; buyer_profile?: { verified: boolean } | null }
type AdminLot = DbLot & { farmer?: { full_name: string } | null }
type AdminDeal = DbDeal & { farmer?: { full_name: string } | null; buyer?: { full_name: string } | null }
type AdminEscrow = DbEscrowTransaction & { farmer?: { full_name: string } | null; buyer?: { full_name: string } | null }
type AdminGrievance = DbGrievance & { reporter?: { full_name: string } | null }

type ResultKind = 'user' | 'lot' | 'deal' | 'escrow' | 'grievance'

interface SearchResult {
  kind: ResultKind
  id: string
  title: string
  subtitle: string
  path: string
}

const CATEGORY_META: Record<ResultKind, { label: string; Icon: LucideIcon }> = {
  user:      { label: 'Users',        Icon: Users },
  lot:       { label: 'Lots',         Icon: Package },
  deal:      { label: 'Orders',       Icon: ShoppingCart },
  escrow:    { label: 'Transactions', Icon: ArrowLeftRight },
  grievance: { label: 'Complaints',   Icon: MessageSquare },
}

const COMPLAINT_TYPE_LABELS: Record<ComplaintType, string> = {
  weight_dispute:  'Quantity mismatch',
  quality_dispute: 'Product quality',
  payment_issue:   'Payment issue',
  transport_issue: 'Transport issue',
  other:           'Other',
}

const MAX_PER = 4

function matches(q: string, ...fields: (string | null | undefined)[]): boolean {
  return fields.some(f => f?.toLowerCase().includes(q))
}

export default function AdminGlobalSearch({ isOpen, onClose }: Props) {
  const { profiles, lots, deals, escrow, grievances } = useAdmin()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      const t = setTimeout(() => inputRef.current?.focus(), 40)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const results = useMemo<Record<ResultKind, SearchResult[]>>(() => {
    const q = query.trim().toLowerCase()
    const empty: Record<ResultKind, SearchResult[]> = { user: [], lot: [], deal: [], escrow: [], grievance: [] }
    if (q.length < 2) return empty

    const typedProfiles = profiles as AdminProfile[]
    const typedLots = lots as AdminLot[]
    const typedDeals = deals as AdminDeal[]
    const typedEscrow = escrow as AdminEscrow[]
    const typedGrievances = grievances as AdminGrievance[]

    const user: SearchResult[] = typedProfiles
      .filter(p => p.role !== 'admin' && matches(q, p.full_name, p.email, p.phone))
      .slice(0, MAX_PER)
      .map(p => ({
        kind: 'user',
        id: p.id,
        title: p.full_name || p.email || p.id,
        subtitle: `${p.role} · ${p.email ?? p.phone ?? 'no contact'}`,
        path: p.role === 'farmer' ? '/admin/farmers' : '/admin/buyers',
      }))

    const lot: SearchResult[] = typedLots
      .filter(l => matches(q, l.id, l.crop, l.variety, l.farmer?.full_name))
      .slice(0, MAX_PER)
      .map(l => ({
        kind: 'lot',
        id: l.id,
        title: `${l.crop} · ${l.variety}`,
        subtitle: `Lot ${l.id.slice(0, 8)} · ${l.farmer?.full_name ?? '—'} · ${l.status.replace(/_/g, ' ')}`,
        path: '/admin/products',
      }))

    const deal: SearchResult[] = typedDeals
      .filter(d => matches(q, d.id, d.crop, d.variety, d.farmer?.full_name, d.buyer?.full_name))
      .slice(0, MAX_PER)
      .map(d => ({
        kind: 'deal',
        id: d.id,
        title: `${d.crop} · ${d.variety}`,
        subtitle: `${d.farmer?.full_name ?? '?'} → ${d.buyer?.full_name ?? '?'} · ₹${d.total_value.toLocaleString('en-IN')}`,
        path: '/admin/orders',
      }))

    const escrowRes: SearchResult[] = typedEscrow
      .filter(e => matches(q, e.transaction_ref, e.id, e.farmer?.full_name, e.buyer?.full_name))
      .slice(0, MAX_PER)
      .map(e => ({
        kind: 'escrow',
        id: e.id,
        title: e.transaction_ref ?? e.id.slice(0, 12),
        subtitle: `${e.farmer?.full_name ?? '?'} → ${e.buyer?.full_name ?? '?'} · ₹${e.amount.toLocaleString('en-IN')} · ${e.status.replace(/_/g, ' ')}`,
        path: '/admin/transactions',
      }))

    const grievance: SearchResult[] = typedGrievances
      .filter(g => matches(q, g.id, g.title, g.type, g.reporter?.full_name))
      .slice(0, MAX_PER)
      .map(g => ({
        kind: 'grievance',
        id: g.id,
        title: g.title || COMPLAINT_TYPE_LABELS[g.type] || g.type.replace(/_/g, ' '),
        subtitle: `${COMPLAINT_TYPE_LABELS[g.type] ?? g.type} · ${g.status.replace(/_/g, ' ')} · ${g.reporter?.full_name ?? '—'}`,
        path: '/admin/complaints',
      }))

    return { user, lot, deal, escrow: escrowRes, grievance }
  }, [query, profiles, lots, deals, escrow, grievances])

  const hasResults = (Object.values(results) as SearchResult[][]).some(arr => arr.length > 0)

  if (!isOpen) return null

  function handleResult(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <Search size={16} className={styles.searchIcon} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search farmers, lots, orders, transactions, complaints…"
            className={styles.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Clear">
              <X size={14} />
            </button>
          )}
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <kbd>Esc</kbd>
          </button>
        </div>

        <div className={styles.results}>
          {query.length < 2 ? (
            <p className={styles.hint}>Type at least 2 characters to search across users, lots, orders, transactions and complaints</p>
          ) : !hasResults ? (
            <p className={styles.noResults}>No results for &ldquo;{query}&rdquo;</p>
          ) : (
            (['user', 'lot', 'deal', 'escrow', 'grievance'] as ResultKind[]).map(kind => {
              const items = results[kind]
              if (items.length === 0) return null
              const { label, Icon } = CATEGORY_META[kind]
              return (
                <div key={kind} className={styles.category}>
                  <div className={styles.categoryHeader}>
                    <Icon size={12} />
                    <span>{label}</span>
                  </div>
                  {items.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.resultItem}
                      onClick={() => handleResult(item.path)}
                    >
                      <div className={styles.resultText}>
                        <p className={styles.resultTitle}>{item.title}</p>
                        <p className={styles.resultSubtitle}>{item.subtitle}</p>
                      </div>
                      <div className={styles.resultMeta}>
                        <span className={styles.sectionBadge}>{label}</span>
                        <ChevronRight size={12} className={styles.chevron} />
                      </div>
                    </button>
                  ))}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
