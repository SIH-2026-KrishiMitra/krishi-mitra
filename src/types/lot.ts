export type LotStatus = 'draft' | 'pending' | 'active' | 'sold' | 'completed'
export type PaymentMode = 'escrow' | 'direct'
export type Grade = 'A' | 'B' | 'C'

export interface Lot {
  id: string
  cropId: string
  crop: string
  variety: string
  grade: Grade
  quantity: number
  expectedPrice: number
  paymentMode: PaymentMode
  assaying: boolean
  mandi: string
  status: LotStatus
  createdAt: string
  imagePreviews: string[]
}
