import {
  createContext, useContext, useState, useCallback, type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import type {
  Farmer, Lot, Offer, Deal, EscrowTransaction, Complaint,
  DealStatus, LotStatus, DealTimelineStep, ComplaintTimelineStep,
  Buyer,
} from '../types'
import { useAuth } from './AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import { useFarmerLots } from '../hooks/useLots'
import { useFarmerOffers } from '../hooks/useOffers'
import { useFarmerDeals } from '../hooks/useDeals'
import { useFarmerEscrow } from '../hooks/useEscrow'
import { useGrievances } from '../hooks/useGrievances'
import { useFarmerProfile } from '../hooks/useProfile'
import { updateLot as updateLotDb, updateLotStatus } from '../services/supabase/lots'
import { acceptOfferWithDeal, updateOfferStatus } from '../services/supabase/offers'
import { supabase } from '../lib/supabase'
import { storage } from '../services/storage'
import type { DbLot, DbGrievance } from '../types'
import type { ExpandedOffer } from '../services/supabase/offers'
import type { ExpandedDeal } from '../services/supabase/deals'
import type { ExpandedEscrow } from '../services/supabase/escrow'

// ─── Type mappers: DB snake_case → existing camelCase types ───────────────────

function dbLotToLot(db: DbLot): Lot {
  return {
    id: db.id,
    cropId: db.crop_id,
    crop: db.crop,
    variety: db.variety,
    grade: db.grade,
    quantity: db.quantity,
    unit: db.unit === 'qtl' ? 'quintal' : db.unit as 'kg' | 'quintal' | 'tonne',
    expectedPrice: db.expected_price,
    paymentMode: db.payment_mode,
    assaying: db.assaying,
    mandi: db.mandi,
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    imagePreviews: db.image_urls,
    offersCount: 0,
    description: db.description ?? undefined,
    sellingMethod: db.selling_method as 'direct' | 'fpo_pool',
  }
}

function buildBuyer(buyerJoin: ExpandedOffer['buyer'] | ExpandedDeal['buyer'], buyerId: string): Buyer {
  const bp = buyerJoin?.buyer_profile
  return {
    id: buyerId,
    name: buyerJoin?.full_name ?? bp?.org_name ?? 'Buyer',
    type: (bp?.buyer_type ?? 'trader') as Buyer['type'],
    location: '',
    distance: 0,
    verificationStatus: bp?.verified ? 'verified' : 'pending',
    trustScore: bp?.trust_score ?? 0,
    paymentHistory: 85,
    completedDeals: bp?.completed_deals ?? 0,
  }
}

function dbOfferToOffer(db: ExpandedOffer): Offer {
  return {
    id: db.id,
    lotId: db.lot_id,
    buyerId: db.buyer_id,
    buyer: buildBuyer(db.buyer, db.buyer_id),
    offerPrice: db.offer_price,
    quantity: db.quantity,
    pickupTimeline: db.pickup_timeline,
    paymentTerms: db.payment_terms,
    paymentMode: db.payment_mode,
    escrowProtected: db.escrow_protected,
    validUntil: db.valid_until ?? new Date(Date.now() + 7 * 864e5).toISOString(),
    // DB uses 'pending', frontend uses 'active' for the same concept
    status: db.status === 'pending' ? 'active' : db.status as Offer['status'],
    notes: db.notes ?? undefined,
    createdAt: db.created_at,
  }
}

const STATUS_ORDER: DealStatus[] = [
  'offer_accepted', 'money_deposited', 'transport_assigned',
  'pickup_scheduled', 'delivered', 'payment_released',
]

const DEAL_STEP_LABELS: Record<DealStatus, string> = {
  offer_accepted: 'Offer accepted',
  money_deposited: 'Money deposited',
  transport_assigned: 'Transport assigned',
  pickup_scheduled: 'Pickup scheduled',
  delivered: 'Delivered',
  payment_released: 'Payment released',
}

function dbDealToDeal(db: ExpandedDeal): Deal {
  const currentIdx = STATUS_ORDER.indexOf(db.status)

  const timeline: DealTimelineStep[] = STATUS_ORDER.map((step, idx) => {
    const event = db.timeline?.find(e => e.status === step)
    return {
      step,
      label: DEAL_STEP_LABELS[step],
      timestamp: event?.timestamp
        ? new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : undefined,
      detail: event?.detail,
      completed: idx < currentIdx,
      active: idx === currentIdx,
    }
  })

  const transport = db.transport
    ? {
        vehicleNumber: db.transport.vehicle_number,
        driverName: db.transport.driver_name,
        driverPhone: db.transport.driver_phone,
        pickupDate: db.transport.pickup_date,
        pickupTime: db.transport.pickup_time,
        estimatedDelivery: db.transport.estimated_delivery,
      }
    : undefined

  return {
    id: db.id,
    lotId: db.lot_id,
    offerId: db.offer_id,
    buyerId: db.buyer_id,
    buyer: buildBuyer(db.buyer, db.buyer_id),
    crop: db.crop,
    variety: db.variety,
    quantity: db.quantity,
    unit: db.unit,
    pricePerUnit: db.price_per_unit,
    totalValue: db.total_value,
    escrowAmount: db.escrow_amount,
    status: db.status,
    transport,
    timeline,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

function dbEscrowToEscrow(db: ExpandedEscrow): EscrowTransaction {
  const lotInfo = db.lot_info
  const buyerInfo = db.buyer_info
  return {
    id: db.id,
    dealId: db.deal_id,
    lotId: db.lot_id,
    buyerName: buyerInfo?.full_name ?? 'Buyer',
    crop: lotInfo ? `${lotInfo.crop} · Grade ${lotInfo.grade}` : db.lot_id,
    quantity: 0,
    amount: db.amount,
    status: db.status,
    depositedAt: db.deposited_at ?? undefined,
    releasedAt: db.released_at ?? undefined,
    expectedReleaseDate: db.expected_release_date ?? undefined,
    transactionRef: db.transaction_ref ?? undefined,
    bankAccount: db.bank_account ?? undefined,
  }
}

const COMPLAINT_STATUSES: Array<import('../types').ComplaintStatus> = [
  'submitted', 'under_review', 'evidence_requested', 'resolution', 'closed',
]

const COMPLAINT_STEP_LABELS: Record<import('../types').ComplaintStatus, string> = {
  submitted: 'Complaint submitted',
  under_review: 'Under review',
  evidence_requested: 'Evidence requested',
  resolution: 'Resolution',
  closed: 'Closed',
}

function dbGrievanceToComplaint(db: DbGrievance): Complaint {
  const currentIdx = COMPLAINT_STATUSES.indexOf(db.status)
  const timeline: ComplaintTimelineStep[] = COMPLAINT_STATUSES.map((status, idx) => {
    const event = db.timeline?.find(e => e.status === status)
    return {
      status,
      label: COMPLAINT_STEP_LABELS[status],
      timestamp: event?.timestamp
        ? new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : '',
      detail: event?.detail,
      completed: idx < currentIdx,
      active: idx === currentIdx,
    }
  })

  return {
    id: db.id,
    dealId: db.deal_id ?? undefined,
    lotId: db.lot_id ?? undefined,
    type: db.type,
    title: db.title,
    description: db.description,
    status: db.status,
    escrowAmount: db.escrow_amount ?? undefined,
    evidenceUploaded: db.evidence_urls.length > 0,
    evidenceFiles: db.evidence_urls,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    timeline,
    resolutionNote: db.resolution_note ?? undefined,
  }
}

// ─── Context value ────────────────────────────────────────────────────────────

interface AppState {
  farmer: Farmer
  lots: Lot[]
  offers: Offer[]
  deals: Deal[]
  escrow: EscrowTransaction[]
  complaints: Complaint[]
  selectedCropId: string
}

interface AppContextValue {
  state: AppState
  loading: boolean
  logout: () => Promise<void>
  updateFarmer: (patch: Partial<Farmer>) => Promise<void>
  createLot: (input: Omit<Lot, 'id' | 'createdAt' | 'updatedAt' | 'offersCount'>) => Promise<Lot>
  updateLot: (id: string, patch: Partial<Lot>) => Promise<void>
  selectCrop: (cropId: string) => void
  acceptOffer: (offerId: string) => Promise<Deal | null>
  rejectOffer: (offerId: string) => Promise<void>
  advanceDeal: (dealId: string, nextStatus: DealStatus) => Promise<void>
  createComplaint: (input: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Complaint | null>
  uploadEvidence: (complaintId: string, file: File) => Promise<void>
  markNotifRead: (id: string) => void
  markAllNotifsRead: () => void
  unreadCount: number
  activeLotsCount: number
  offersCount: number
  dealsCount: number
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const { farmerProfile, saveBase, saveFarmer } = useFarmerProfile()
  const lotsHook = useFarmerLots()
  const offersHook = useFarmerOffers()
  const dealsHook = useFarmerDeals()
  const escrowHook = useFarmerEscrow()
  const grievancesHook = useGrievances()

  const [selectedCropId, setSelectedCropId] = useState('tomato')
  const { unreadCount, markRead: notifMarkRead, markAllRead: notifMarkAllRead } = useNotifications()

  // ── Derived farmer object ────────────────────────────────────────────────────
  const farmer: Farmer = {
    id: user?.id ?? 'unknown',
    name: profile?.full_name ?? 'Farmer',
    mobile: (profile?.phone ?? '').replace('+91', ''),
    village: farmerProfile?.village ?? '',
    district: farmerProfile?.district ?? '',
    state: farmerProfile?.state ?? 'Maharashtra',
    language: (profile?.language ?? 'en') as 'en' | 'mr' | 'hi',
    verified: farmerProfile?.verified ?? false,
    kycStatus: farmerProfile?.kyc_status ?? 'pending',
    bankAccount: farmerProfile?.bank_account ?? '',
    ifsc: farmerProfile?.ifsc ?? '',
    bankName: farmerProfile?.bank_name ?? '',
    memberSince: farmerProfile?.member_since ?? new Date().getFullYear().toString(),
    notifications: true,
    listenEnabled: farmerProfile?.listen_enabled ?? true,
  }

  // ── Mapped data ──────────────────────────────────────────────────────────────
  const lots = lotsHook.lots.map(dbLotToLot)
  const offers = offersHook.offers.map(dbOfferToOffer)
  const deals = dealsHook.deals.map(dbDealToDeal)
  const escrow = escrowHook.escrow.map(dbEscrowToEscrow)
  const complaints = grievancesHook.grievances.map(dbGrievanceToComplaint)

  const loading = lotsHook.loading || offersHook.loading || dealsHook.loading

  // ── Actions ─────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    storage.clear()
  }, [])

  const updateFarmer = useCallback(async (patch: Partial<Farmer>) => {
    if (!user) return
    try {
      const basePatch: Record<string, unknown> = {}
      const farmerPatch: Record<string, unknown> = {}

      if (patch.name) basePatch.full_name = patch.name
      if (patch.language) basePatch.language = patch.language
      if (patch.village) farmerPatch.village = patch.village
      if (patch.district) farmerPatch.district = patch.district
      if (patch.state) farmerPatch.state = patch.state
      if (patch.listenEnabled !== undefined) farmerPatch.listen_enabled = patch.listenEnabled

      if (Object.keys(basePatch).length) await saveBase(basePatch as Parameters<typeof saveBase>[0])
      if (Object.keys(farmerPatch).length) await saveFarmer(farmerPatch as Parameters<typeof saveFarmer>[0])
    } catch {
      toast.error('Failed to save profile')
    }
  }, [user, saveBase, saveFarmer])

  const createLot = useCallback(async (input: Omit<Lot, 'id' | 'createdAt' | 'updatedAt' | 'offersCount'>): Promise<Lot> => {
    const db = await lotsHook.create({
      crop_id: input.cropId,
      crop: input.crop,
      variety: input.variety,
      grade: input.grade,
      quantity: input.quantity,
      unit: input.unit === 'quintal' ? 'qtl' : input.unit as 'kg' | 'tonne',
      expected_price: input.expectedPrice,
      payment_mode: input.paymentMode,
      assaying: input.assaying,
      mandi: input.mandi,
      description: input.description,
      selling_method: input.sellingMethod,
      image_urls: input.imagePreviews,
    })
    return dbLotToLot(db)
  }, [lotsHook])

  const updateLot = useCallback(async (id: string, patch: Partial<Lot>) => {
    const dbPatch: Partial<Parameters<typeof updateLotDb>[1]> = {}
    if (patch.status) dbPatch.status = patch.status
    if (patch.expectedPrice !== undefined) dbPatch.expected_price = patch.expectedPrice
    if (patch.quantity !== undefined) dbPatch.quantity = patch.quantity
    await lotsHook.update(id, dbPatch as Parameters<typeof lotsHook.update>[1])
  }, [lotsHook])

  const selectCrop = useCallback((cropId: string) => {
    setSelectedCropId(cropId)
  }, [])

  const acceptOffer = useCallback(async (offerId: string): Promise<Deal | null> => {
    try {
      const { dealId } = await acceptOfferWithDeal(offerId)
      await Promise.all([
        lotsHook.reload(),
        offersHook.reload(),
        dealsHook.reload(),
        escrowHook.reload(),
      ])
      const updatedDeal = dealsHook.deals.find(d => d.id === dealId)
      return updatedDeal ? dbDealToDeal(updatedDeal) : null
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to accept offer')
      return null
    }
  }, [lotsHook, offersHook, dealsHook, escrowHook])

  const rejectOffer = useCallback(async (offerId: string) => {
    try {
      await updateOfferStatus(offerId, 'rejected')
      await offersHook.reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to reject offer')
    }
  }, [offersHook])

  const advanceDeal = useCallback(async (dealId: string, nextStatus: DealStatus) => {
    try {
      await dealsHook.advance(dealId, nextStatus)
      // Also update lot and escrow status in sync
      const deal = dealsHook.deals.find(d => d.id === dealId)
      if (deal) {
        const lotStatus: LotStatus =
          nextStatus === 'payment_released' ? 'completed'
          : nextStatus === 'delivered' ? 'delivered'
          : nextStatus === 'pickup_scheduled' ? 'in_transit'
          : 'deal_accepted'
        await updateLotStatus(deal.lot_id, lotStatus)
        await lotsHook.reload()
        await escrowHook.reload()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update deal')
    }
  }, [dealsHook, lotsHook, escrowHook])

  const createComplaint = useCallback(async (input: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>): Promise<Complaint | null> => {
    try {
      const db = await grievancesHook.submit({
        type: input.type,
        title: input.title,
        description: input.description,
        deal_id: input.dealId,
        lot_id: input.lotId,
        escrow_amount: input.escrowAmount,
      })
      return dbGrievanceToComplaint(db)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit complaint')
      return null
    }
  }, [grievancesHook])

  const uploadEvidence = useCallback(async (complaintId: string, file: File) => {
    try {
      await grievancesHook.uploadEvidence(complaintId, file)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to upload evidence')
    }
  }, [grievancesHook])

  const markNotifRead = useCallback((id: string) => {
    void notifMarkRead(id)
  }, [notifMarkRead])

  const markAllNotifsRead = useCallback(() => {
    void notifMarkAllRead()
  }, [notifMarkAllRead])

  // ── Derived counts (for Sidebar badges) ─────────────────────────────────────
  const activeLotsCount = lots.filter(l => l.status === 'listed' || l.status === 'offers_received').length
  const offersCount = offers.filter(o => o.status === 'active').length
  const dealsCount = deals.filter(d => d.status !== 'payment_released').length

  const state: AppState = {
    farmer,
    lots,
    offers,
    deals,
    escrow,
    complaints,
    selectedCropId,
  }

  return (
    <AppContext.Provider value={{
      state, loading, logout, updateFarmer,
      createLot, updateLot, selectCrop,
      acceptOffer, rejectOffer, advanceDeal,
      createComplaint, uploadEvidence,
      markNotifRead, markAllNotifsRead,
      unreadCount, activeLotsCount, offersCount, dealsCount,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useAppSafe(): AppContextValue | null {
  return useContext(AppContext)
}
