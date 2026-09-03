import { createContext, useContext, useReducer, useRef, type ReactNode } from 'react'
import type { Lot, Grade, PaymentMode } from '../types/lot'

export interface CreateLotInput {
  cropId: string
  crop: string
  variety: string
  grade: Grade
  quantity: number
  expectedPrice: number
  paymentMode: PaymentMode
  assaying: boolean
  mandi: string
  imagePreviews: string[]
}

interface LotsContextValue {
  lots: Lot[]
  createLot: (input: CreateLotInput) => Lot
  getLot: (id: string) => Lot | undefined
}

const LotsContext = createContext<LotsContextValue | null>(null)

const SEED_LOTS: Lot[] = [
  {
    id: 'KM-2026-001',
    cropId: 'wheat',
    crop: 'Wheat',
    variety: 'HD-2967',
    grade: 'A',
    quantity: 40,
    expectedPrice: 2150,
    paymentMode: 'escrow',
    assaying: true,
    mandi: 'Nashik APMC',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    imagePreviews: [],
  },
  {
    id: 'KM-2026-002',
    cropId: 'paddy',
    crop: 'Paddy',
    variety: 'Basmati-370',
    grade: 'B',
    quantity: 25,
    expectedPrice: 1890,
    paymentMode: 'direct',
    assaying: false,
    mandi: 'Pune APMC',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    imagePreviews: [],
  },
]

type Action = { type: 'CREATE'; lot: Lot }

function reducer(state: Lot[], action: Action): Lot[] {
  if (action.type === 'CREATE') return [action.lot, ...state]
  return state
}

export function LotsProvider({ children }: { children: ReactNode }) {
  const [lots, dispatch] = useReducer(reducer, SEED_LOTS)
  const counterRef = useRef(SEED_LOTS.length)

  function createLot(input: CreateLotInput): Lot {
    counterRef.current++
    const lot: Lot = {
      ...input,
      id: `KM-2026-${String(counterRef.current).padStart(3, '0')}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'CREATE', lot })
    return lot
  }

  function getLot(id: string): Lot | undefined {
    return lots.find(l => l.id === id)
  }

  return (
    <LotsContext.Provider value={{ lots, createLot, getLot }}>
      {children}
    </LotsContext.Provider>
  )
}

export function useLots(): LotsContextValue {
  const ctx = useContext(LotsContext)
  if (!ctx) throw new Error('useLots must be used within LotsProvider')
  return ctx
}
