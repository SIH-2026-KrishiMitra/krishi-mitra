// ─── Core domain types for KrishiMitra ───────────────────────────────────────

export type Grade = 'A' | 'B' | 'C'
export type PaymentMode = 'escrow' | 'direct'

export type LotStatus =
  | 'draft'
  | 'listed'
  | 'offers_received'
  | 'deal_accepted'
  | 'in_transit'
  | 'delivered'
  | 'completed'

export type DealStatus =
  | 'offer_accepted'
  | 'money_deposited'
  | 'transport_assigned'
  | 'pickup_scheduled'
  | 'delivered'
  | 'payment_released'

export type EscrowStatus = 'pending' | 'protected' | 'release_pending' | 'released' | 'disputed'

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'evidence_requested'
  | 'resolution'
  | 'closed'

export type ComplaintType =
  | 'weight_dispute'
  | 'quality_dispute'
  | 'payment_issue'
  | 'transport_issue'
  | 'other'

export interface Farmer {
  id: string
  name: string
  mobile: string
  village: string
  district: string
  state: string
  language: 'en' | 'mr' | 'hi'
  verified: boolean
  kycStatus: 'complete' | 'pending' | 'not_started'
  bankAccount: string
  ifsc: string
  bankName: string
  profilePhoto?: string
  memberSince: string
  notifications: boolean
  listenEnabled: boolean
}

export interface Lot {
  id: string
  cropId: string
  crop: string
  variety: string
  grade: Grade
  quantity: number
  unit: 'kg' | 'quintal' | 'tonne'
  expectedPrice: number
  paymentMode: PaymentMode
  assaying: boolean
  mandi: string
  status: LotStatus
  createdAt: string
  updatedAt: string
  imagePreviews: string[]
  offersCount: number
  description?: string
  sellingMethod: 'direct' | 'fpo_pool'
}

export interface Buyer {
  id: string
  name: string
  type: 'processor' | 'trader' | 'fpo' | 'mandi' | 'retailer'
  location: string
  distance: number
  verificationStatus: 'verified' | 'pending'
  trustScore: number
  paymentHistory: number
  completedDeals: number
  logo?: string
}

export interface Offer {
  id: string
  lotId: string
  buyerId: string
  buyer: Buyer
  offerPrice: number
  quantity: number
  pickupTimeline: string
  paymentTerms: string
  paymentMode: PaymentMode
  escrowProtected: boolean
  validUntil: string
  status: 'active' | 'accepted' | 'rejected' | 'expired'
  notes?: string
  createdAt: string
}

export interface DealTimelineStep {
  step: DealStatus
  label: string
  timestamp?: string
  detail?: string
  completed: boolean
  active: boolean
}

export interface Transport {
  vehicleNumber: string
  driverName: string
  driverPhone: string
  pickupDate: string
  pickupTime: string
  estimatedDelivery: string
}

export interface Deal {
  id: string
  lotId: string
  offerId: string
  buyerId: string
  buyer: Buyer
  crop: string
  variety: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalValue: number
  escrowAmount: number
  status: DealStatus
  transport?: Transport
  timeline: DealTimelineStep[]
  createdAt: string
  updatedAt: string
  escrowId?: string
}

export interface EscrowTransaction {
  id: string
  dealId: string
  lotId: string
  buyerName: string
  crop: string
  quantity: number
  amount: number
  status: EscrowStatus
  depositedAt?: string
  releasedAt?: string
  expectedReleaseDate?: string
  transactionRef?: string
  bankAccount?: string
}

export interface ComplaintTimelineStep {
  status: ComplaintStatus
  label: string
  timestamp: string
  detail?: string
  completed: boolean
  active: boolean
}

export interface Complaint {
  id: string
  dealId?: string
  lotId?: string
  type: ComplaintType
  title: string
  description: string
  status: ComplaintStatus
  escrowAmount?: number
  evidenceUploaded: boolean
  evidenceFiles: string[]
  createdAt: string
  updatedAt: string
  timeline: ComplaintTimelineStep[]
  resolutionNote?: string
  affectedParty?: string
}

export interface MarketPrice {
  id: string
  crop: string
  variety: string
  mandi: string
  currentPrice: number
  unit: string
  trend: 'up' | 'down' | 'flat'
  delta: number
  deltaPercent: number
  msp: number
  priceHistory: { date: string; price: number }[]
  source: string
  updatedAt: string
  demandLevel: 'high' | 'medium' | 'low'
}

export interface BuyerOffer {
  buyer: Buyer
  price: number
  distance: number
  demand: 'high' | 'medium' | 'low'
  freshData: boolean
  offerExpiry?: string
}

export interface Notification {
  id: string
  type: 'offer' | 'deal' | 'payment' | 'complaint' | 'system'
  title: string
  body: string
  read: boolean
  createdAt: string
  linkTo?: string
}

export interface AppUser {
  farmer: Farmer
  isAuthenticated: boolean
}

// ─── Supabase DB row types (snake_case) ───────────────────────────────────────

export type UserRole = 'farmer' | 'buyer' | 'admin'

export interface DbProfile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  email: string | null
  avatar_url: string | null
  language: string
  suspended: boolean
  created_at: string
  updated_at: string
}

export interface DbFarmerProfile {
  id: string
  village: string | null
  district: string | null
  state: string | null
  kyc_status: 'complete' | 'pending' | 'not_started'
  verified: boolean
  bank_account: string | null
  ifsc: string | null
  bank_name: string | null
  member_since: string | null
  listen_enabled: boolean
}

export interface DbBuyerProfile {
  id: string
  org_name: string | null
  contact_person: string | null
  buyer_type: 'processor' | 'trader' | 'retailer' | 'mandi' | 'fpo' | null
  location: string | null
  district: string | null
  state: string | null
  verified: boolean
  trust_score: number
  completed_deals: number
}

export interface DbAdminProfile {
  id: string
  department: string | null
  created_by: string | null
}

export interface DbLot {
  id: string
  farmer_id: string
  crop_id: string
  crop: string
  variety: string
  grade: Grade
  quantity: number
  unit: string
  expected_price: number
  payment_mode: PaymentMode
  assaying: boolean
  mandi: string
  description: string | null
  status: LotStatus
  selling_method: string
  image_urls: string[]
  created_at: string
  updated_at: string
}

export interface DbOffer {
  id: string
  lot_id: string
  buyer_id: string
  offer_price: number
  quantity: number
  pickup_timeline: string
  payment_terms: string
  payment_mode: PaymentMode
  escrow_protected: boolean
  valid_until: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
  notes: string | null
  created_at: string
}

export interface DbDealTransport {
  vehicle_number: string
  driver_name: string
  driver_phone: string
  pickup_date: string
  pickup_time: string
  estimated_delivery: string
}

export interface DbDealEvent {
  status: DealStatus
  label: string
  timestamp: string
  detail?: string
}

export interface DbDeal {
  id: string
  lot_id: string
  offer_id: string
  farmer_id: string
  buyer_id: string
  crop: string
  variety: string
  quantity: number
  unit: string
  price_per_unit: number
  total_value: number
  escrow_amount: number
  status: DealStatus
  transport: DbDealTransport | null
  timeline: DbDealEvent[]
  created_at: string
  updated_at: string
}

export interface DbEscrowTransaction {
  id: string
  deal_id: string
  lot_id: string
  buyer_id: string
  farmer_id: string
  amount: number
  status: EscrowStatus
  deposited_at: string | null
  released_at: string | null
  expected_release_date: string | null
  transaction_ref: string | null
  bank_account: string | null
  dispute_note: string | null
  created_at: string
}

export interface DbGrievanceEvent {
  status: ComplaintStatus
  label: string
  timestamp: string
  detail?: string
}

export interface DbGrievance {
  id: string
  reporter_id: string
  deal_id: string | null
  lot_id: string | null
  type: ComplaintType
  title: string
  description: string
  status: ComplaintStatus
  escrow_amount: number | null
  evidence_urls: string[]
  resolution_note: string | null
  assigned_to: string | null
  timeline: DbGrievanceEvent[]
  created_at: string
  updated_at: string
}

export interface DbNotification {
  id: string
  user_id: string
  type: 'offer' | 'deal' | 'payment' | 'complaint' | 'system'
  title: string
  body: string
  read: boolean
  link_to: string | null
  created_at: string
}

export interface DbMarketPrice {
  id: string
  crop: string
  variety: string
  mandi: string
  current_price: number
  unit: string
  trend: 'up' | 'down' | 'flat'
  delta: number
  delta_percent: number
  msp: number
  demand_level: 'high' | 'medium' | 'low'
  price_history: { date: string; price: number }[]
  source: string
  updated_at: string
}
