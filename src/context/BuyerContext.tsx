import { createContext, useContext, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { useMarketplaceLots } from '../hooks/useLots'
import { useBuyerOffers } from '../hooks/useOffers'
import { useBuyerDeals } from '../hooks/useDeals'
import { useBuyerEscrow } from '../hooks/useEscrow'
import { useBuyerProfile } from '../hooks/useProfile'
import { useAuth } from './AuthContext'
import type { DbLot, DbOffer, DealStatus } from '../types'
import type { ExpandedDeal } from '../services/supabase/deals'
import type { ExpandedEscrow } from '../services/supabase/escrow'
import type { CreateOfferInput } from '../services/supabase/offers'
import type { DbBuyerProfile, DbProfile } from '../types'

interface BuyerContextValue {
  lots: DbLot[]
  lotsLoading: boolean
  offers: (DbOffer & { lot: { crop: string; variety: string; mandi: string; grade: string } | null })[]
  offersLoading: boolean
  deals: ExpandedDeal[]
  dealsLoading: boolean
  escrow: ExpandedEscrow[]
  escrowLoading: boolean
  buyerProfile: DbBuyerProfile | null
  loading: boolean

  submitOffer: (input: CreateOfferInput) => Promise<DbOffer | null>
  cancelOffer: (offerId: string) => Promise<void>
  advanceDeal: (dealId: string, status: DealStatus) => Promise<void>
  updateProfile: (base: Partial<Pick<DbProfile, 'full_name' | 'phone'>>, buyer: Partial<Omit<DbBuyerProfile, 'id' | 'verified' | 'trust_score' | 'completed_deals'>>) => Promise<void>
  logout: () => Promise<void>
}

const BuyerContext = createContext<BuyerContextValue | null>(null)

export function useBuyer(): BuyerContextValue {
  const ctx = useContext(BuyerContext)
  if (!ctx) throw new Error('useBuyer must be used within BuyerProvider')
  return ctx
}

export function BuyerProvider({ children }: { children: ReactNode }) {
  const { signOut: authLogout } = useAuth()
  const lotsHook = useMarketplaceLots()
  const offersHook = useBuyerOffers()
  const dealsHook = useBuyerDeals()
  const escrowHook = useBuyerEscrow()
  const profileHook = useBuyerProfile()

  const loading = lotsHook.loading || offersHook.loading || dealsHook.loading

  async function submitOffer(input: CreateOfferInput): Promise<DbOffer | null> {
    try {
      const offer = await offersHook.submit(input)
      toast.success('Offer submitted!')
      return offer
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit offer')
      return null
    }
  }

  async function cancelOffer(offerId: string): Promise<void> {
    try {
      await offersHook.cancel(offerId)
      toast.success('Offer cancelled')
    } catch {
      toast.error('Failed to cancel offer')
    }
  }

  async function advanceDeal(dealId: string, status: DealStatus): Promise<void> {
    try {
      await dealsHook.advance(dealId, status)
    } catch {
      toast.error('Failed to update deal')
    }
  }

  async function updateProfile(
    base: Partial<Pick<DbProfile, 'full_name' | 'phone'>>,
    buyer: Partial<Omit<DbBuyerProfile, 'id' | 'verified' | 'trust_score' | 'completed_deals'>>
  ): Promise<void> {
    try {
      if (Object.keys(base).length) await profileHook.saveBase(base)
      if (Object.keys(buyer).length) await profileHook.saveBuyer(buyer)
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    }
  }

  async function logout(): Promise<void> {
    await authLogout()
  }

  return (
    <BuyerContext.Provider value={{
      lots: lotsHook.lots,
      lotsLoading: lotsHook.loading,
      offers: offersHook.offers,
      offersLoading: offersHook.loading,
      deals: dealsHook.deals,
      dealsLoading: dealsHook.loading,
      escrow: escrowHook.escrow,
      escrowLoading: escrowHook.loading,
      buyerProfile: profileHook.buyerProfile,
      loading,
      submitOffer,
      cancelOffer,
      advanceDeal,
      updateProfile,
      logout,
    }}>
      {children}
    </BuyerContext.Provider>
  )
}
