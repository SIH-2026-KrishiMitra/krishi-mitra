import type {
  Farmer, Lot, Buyer, Offer, Deal, EscrowTransaction, Complaint,
  MarketPrice, Notification, DealTimelineStep, ComplaintTimelineStep,
} from '../types'

// ─── Deterministic price history ─────────────────────────────────────────────

function makePriceHistory(base: number, seed: number, days = 30): { date: string; price: number }[] {
  const out: { date: string; price: number }[] = []
  let price = Math.round(base * 0.92)
  let s = seed >>> 0
  for (let i = days - 1; i >= 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const u = s / 4294967295
    price = Math.round(price * (1 + (u - 0.48) * 0.04))
    price = Math.max(Math.round(base * 0.8), Math.min(Math.round(base * 1.2), price))
    const d = new Date('2026-09-03')
    d.setDate(d.getDate() - i)
    out.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price,
    })
  }
  return out
}

// ─── Farmer (logged-in user) ──────────────────────────────────────────────────

export const DEFAULT_FARMER: Farmer = {
  id: 'farmer-001',
  name: 'Ramesh Patil',
  mobile: '9876543210',
  village: 'Pimpalgaon',
  district: 'Nashik',
  state: 'Maharashtra',
  language: 'en',
  verified: true,
  kycStatus: 'complete',
  bankAccount: '****4417',
  ifsc: 'MAHB0001234',
  bankName: 'Bank of Maharashtra',
  memberSince: '2022',
  notifications: true,
  listenEnabled: false,
}

// ─── Market prices ────────────────────────────────────────────────────────────

export const MARKET_PRICES: MarketPrice[] = [
  {
    id: 'tomato',
    crop: 'Tomato',
    variety: 'Namdhari',
    mandi: 'Nashik APMC',
    currentPrice: 2450,
    unit: 'quintal',
    trend: 'up',
    delta: 190,
    deltaPercent: 8.4,
    msp: 2200,
    priceHistory: makePriceHistory(2450, 12345),
    source: 'Agmarknet',
    updatedAt: '20 minutes ago',
    demandLevel: 'high',
  },
  {
    id: 'onion',
    crop: 'Onion',
    variety: 'Pusa Red',
    mandi: 'Lasalgaon APMC',
    currentPrice: 1535,
    unit: 'quintal',
    trend: 'down',
    delta: -65,
    deltaPercent: -4.1,
    msp: 1500,
    priceHistory: makePriceHistory(1535, 54321),
    source: 'Agmarknet',
    updatedAt: '35 minutes ago',
    demandLevel: 'medium',
  },
  {
    id: 'wheat',
    crop: 'Wheat',
    variety: 'HD-2967',
    mandi: 'Nashik APMC',
    currentPrice: 2150,
    unit: 'quintal',
    trend: 'up',
    delta: 45,
    deltaPercent: 2.1,
    msp: 2015,
    priceHistory: makePriceHistory(2150, 99887),
    source: 'Agmarknet',
    updatedAt: '1 hour ago',
    demandLevel: 'medium',
  },
  {
    id: 'soybean',
    crop: 'Soybean',
    variety: 'JS-335',
    mandi: 'Latur APMC',
    currentPrice: 4320,
    unit: 'quintal',
    trend: 'down',
    delta: -80,
    deltaPercent: -1.8,
    msp: 4300,
    priceHistory: makePriceHistory(4320, 11223),
    source: 'Agmarknet',
    updatedAt: '2 hours ago',
    demandLevel: 'low',
  },
  {
    id: 'potato',
    crop: 'Potato',
    variety: 'Kufri Jyoti',
    mandi: 'Pune APMC',
    currentPrice: 1280,
    unit: 'quintal',
    trend: 'flat',
    delta: 0,
    deltaPercent: 0,
    msp: 1200,
    priceHistory: makePriceHistory(1280, 77654),
    source: 'Agmarknet',
    updatedAt: '3 hours ago',
    demandLevel: 'medium',
  },
]

// ─── Buyers ───────────────────────────────────────────────────────────────────

export const BUYERS: Buyer[] = [
  {
    id: 'buyer-001',
    name: 'ABC Foods Pvt Ltd',
    type: 'processor',
    location: 'Nashik',
    distance: 22,
    verificationStatus: 'verified',
    trustScore: 98,
    paymentHistory: 100,
    completedDeals: 847,
  },
  {
    id: 'buyer-002',
    name: 'Sahyadri Agro Processing',
    type: 'processor',
    location: 'Nashik',
    distance: 26,
    verificationStatus: 'verified',
    trustScore: 94,
    paymentHistory: 98,
    completedDeals: 312,
  },
  {
    id: 'buyer-003',
    name: 'Nashik APMC',
    type: 'mandi',
    location: 'Nashik',
    distance: 3,
    verificationStatus: 'verified',
    trustScore: 91,
    paymentHistory: 95,
    completedDeals: 2100,
  },
  {
    id: 'buyer-004',
    name: 'Reliance Fresh — Nashik DC',
    type: 'retailer',
    location: 'Nashik',
    distance: 18,
    verificationStatus: 'verified',
    trustScore: 96,
    paymentHistory: 99,
    completedDeals: 540,
  },
  {
    id: 'buyer-005',
    name: 'Lasalgaon Traders',
    type: 'trader',
    location: 'Lasalgaon',
    distance: 45,
    verificationStatus: 'verified',
    trustScore: 87,
    paymentHistory: 92,
    completedDeals: 178,
  },
]

// ─── Crop varieties & mandis ──────────────────────────────────────────────────

export const CROP_VARIETIES: Record<string, string[]> = {
  tomato: ['Namdhari', 'Hybrid F1', 'Deepali', 'Solan Vajra'],
  onion: ['Pusa Red', 'Agrifound Light Red', 'NHRDF Red', 'Bhima Raj'],
  wheat: ['HD-2967', 'WH-542', 'Lok-1', 'PBW-621'],
  soybean: ['JS-335', 'NRC-7', 'JS-9305', 'RVS-2001'],
  potato: ['Kufri Jyoti', 'Kufri Chandramukhi', 'Kufri Pukhraj'],
}

export const MANDIS = [
  'Nashik APMC',
  'Lasalgaon APMC',
  'Pune APMC',
  'Nagpur APMC',
  'Amravati APMC',
  'Akola APMC',
  'Latur APMC',
  'Solapur APMC',
]

// ─── Seed lots ────────────────────────────────────────────────────────────────

export const SEED_LOTS: Lot[] = [
  {
    id: 'KM-2026-001',
    cropId: 'tomato',
    crop: 'Tomato',
    variety: 'Namdhari',
    grade: 'A',
    quantity: 500,
    unit: 'kg',
    expectedPrice: 2450,
    paymentMode: 'escrow',
    assaying: true,
    mandi: 'Nashik APMC',
    status: 'offers_received',
    createdAt: '2026-08-28T10:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    imagePreviews: [],
    offersCount: 3,
    sellingMethod: 'direct',
  },
  {
    id: 'KM-2026-002',
    cropId: 'onion',
    crop: 'Onion',
    variety: 'Pusa Red',
    grade: 'B',
    quantity: 1200,
    unit: 'kg',
    expectedPrice: 1500,
    paymentMode: 'escrow',
    assaying: false,
    mandi: 'Lasalgaon APMC',
    status: 'delivered',
    createdAt: '2026-08-11T09:00:00.000Z',
    updatedAt: '2026-08-24T14:00:00.000Z',
    imagePreviews: [],
    offersCount: 0,
    sellingMethod: 'direct',
  },
  {
    id: 'KM-2026-003',
    cropId: 'tomato',
    crop: 'Tomato',
    variety: 'Namdhari',
    grade: 'A',
    quantity: 800,
    unit: 'kg',
    expectedPrice: 2470,
    paymentMode: 'escrow',
    assaying: true,
    mandi: 'Nashik APMC',
    status: 'deal_accepted',
    createdAt: '2026-09-01T06:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
    imagePreviews: [],
    offersCount: 0,
    sellingMethod: 'fpo_pool',
  },
  {
    id: 'KM-2026-004',
    cropId: 'wheat',
    crop: 'Wheat',
    variety: 'HD-2967',
    grade: 'A',
    quantity: 2400,
    unit: 'kg',
    expectedPrice: 2150,
    paymentMode: 'escrow',
    assaying: false,
    mandi: 'Nashik APMC',
    status: 'completed',
    createdAt: '2026-04-02T08:00:00.000Z',
    updatedAt: '2026-04-15T12:00:00.000Z',
    imagePreviews: [],
    offersCount: 0,
    sellingMethod: 'direct',
  },
  {
    id: 'KM-2026-005',
    cropId: 'tomato',
    crop: 'Tomato',
    variety: 'Hybrid F1',
    grade: 'B',
    quantity: 650,
    unit: 'kg',
    expectedPrice: 2380,
    paymentMode: 'escrow',
    assaying: false,
    mandi: 'Nashik APMC',
    status: 'draft',
    createdAt: '2026-09-03T07:00:00.000Z',
    updatedAt: '2026-09-03T07:00:00.000Z',
    imagePreviews: [],
    offersCount: 0,
    sellingMethod: 'direct',
  },
]

// ─── Offers ───────────────────────────────────────────────────────────────────

export const SEED_OFFERS: Offer[] = [
  {
    id: 'OFR-001',
    lotId: 'KM-2026-001',
    buyerId: 'buyer-001',
    buyer: BUYERS[0],
    offerPrice: 2500,
    quantity: 500,
    pickupTimeline: 'Within 2 days',
    paymentTerms: 'Via escrow, released on delivery',
    paymentMode: 'escrow',
    escrowProtected: true,
    validUntil: '2026-09-06',
    status: 'active',
    notes: 'Grade A preferred. Will send vehicle to farm gate.',
    createdAt: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'OFR-002',
    lotId: 'KM-2026-001',
    buyerId: 'buyer-002',
    buyer: BUYERS[1],
    offerPrice: 2480,
    quantity: 500,
    pickupTimeline: 'Tomorrow',
    paymentTerms: 'Via escrow, released on delivery',
    paymentMode: 'escrow',
    escrowProtected: true,
    validUntil: '2026-09-05',
    status: 'active',
    notes: 'Stable demand for next 2 weeks.',
    createdAt: '2026-09-02T11:30:00.000Z',
  },
  {
    id: 'OFR-003',
    lotId: 'KM-2026-001',
    buyerId: 'buyer-003',
    buyer: BUYERS[2],
    offerPrice: 2420,
    quantity: 400,
    pickupTimeline: 'Within 3 days',
    paymentTerms: 'Direct transfer',
    paymentMode: 'direct',
    escrowProtected: false,
    validUntil: '2026-09-07',
    status: 'active',
    createdAt: '2026-09-02T14:00:00.000Z',
  },
]

// ─── Active deal timeline ─────────────────────────────────────────────────────

const ACTIVE_DEAL_TIMELINE: DealTimelineStep[] = [
  {
    step: 'offer_accepted',
    label: 'Offer accepted',
    timestamp: '1 Sep, 4:12 PM',
    detail: '₹2,500/qtl · 500 kg',
    completed: true,
    active: false,
  },
  {
    step: 'money_deposited',
    label: 'Money deposited',
    timestamp: '2 Sep',
    detail: '₹50,000 held in escrow',
    completed: true,
    active: false,
  },
  {
    step: 'transport_assigned',
    label: 'Transport assigned',
    timestamp: '2 Sep',
    detail: 'MH 15 CJ 4409 · Anil Shinde',
    completed: true,
    active: false,
  },
  {
    step: 'pickup_scheduled',
    label: 'Pickup scheduled',
    timestamp: 'Tomorrow, 8:00 AM at farm gate',
    detail: '',
    completed: false,
    active: true,
  },
  {
    step: 'delivered',
    label: 'Delivery & payment',
    detail: 'Money reaches your bank within 24 hrs',
    completed: false,
    active: false,
  },
  {
    step: 'payment_released',
    label: 'Payment released',
    completed: false,
    active: false,
  },
]

export const SEED_DEALS: Deal[] = [
  {
    id: 'KM-2026-00124',
    lotId: 'KM-2026-003',
    offerId: 'OFR-001',
    buyerId: 'buyer-001',
    buyer: BUYERS[0],
    crop: 'Tomato',
    variety: 'Namdhari',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 2500,
    totalValue: 50000,
    escrowAmount: 50000,
    status: 'pickup_scheduled',
    transport: {
      vehicleNumber: 'MH 15 CJ 4409',
      driverName: 'Anil Shinde',
      driverPhone: '9823456789',
      pickupDate: '2026-09-04',
      pickupTime: '08:00 AM',
      estimatedDelivery: '2026-09-04',
    },
    timeline: ACTIVE_DEAL_TIMELINE,
    createdAt: '2026-09-01T16:12:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
    escrowId: 'ESC-00124',
  },
]

// ─── Escrow transactions ──────────────────────────────────────────────────────

export const SEED_ESCROW: EscrowTransaction[] = [
  {
    id: 'ESC-00124',
    dealId: 'KM-2026-00124',
    lotId: 'KM-2026-003',
    buyerName: 'ABC Foods Pvt Ltd',
    crop: 'Tomato · Grade A',
    quantity: 500,
    amount: 50000,
    status: 'protected',
    depositedAt: '2026-09-02T10:00:00.000Z',
    expectedReleaseDate: '2026-09-04',
    transactionRef: 'UTR2026090200124',
    bankAccount: '****4417',
  },
  {
    id: 'ESC-00087',
    dealId: 'KM-2026-00087',
    lotId: 'KM-2026-004',
    buyerName: 'Lasalgaon Traders',
    crop: 'Onion · Grade B',
    quantity: 1200,
    amount: 18420,
    status: 'released',
    depositedAt: '2026-08-11T09:00:00.000Z',
    releasedAt: '2026-08-24T14:00:00.000Z',
    transactionRef: 'UTR2026081100087',
    bankAccount: '****4417',
  },
  {
    id: 'ESC-00063',
    dealId: 'KM-2026-00063',
    lotId: 'KM-2026-004',
    buyerName: 'ABC Foods Pvt Ltd',
    crop: 'Tomato · Grade A',
    quantity: 800,
    amount: 19760,
    status: 'released',
    depositedAt: '2026-08-11T09:00:00.000Z',
    releasedAt: '2026-08-11T09:00:00.000Z',
    transactionRef: 'UTR2026081100063',
    bankAccount: '****4417',
  },
  {
    id: 'ESC-00041',
    dealId: 'KM-2026-00041',
    lotId: 'KM-2026-004',
    buyerName: 'ABC Foods Pvt Ltd',
    crop: 'Tomato · Grade A',
    quantity: 650,
    amount: 16094,
    status: 'released',
    depositedAt: '2026-07-28T08:00:00.000Z',
    releasedAt: '2026-07-30T12:00:00.000Z',
    transactionRef: 'UTR2026072800041',
    bankAccount: '****4417',
  },
  {
    id: 'ESC-00021',
    dealId: 'KM-2026-00021',
    lotId: 'KM-2026-004',
    buyerName: 'Nashik APMC',
    crop: 'Wheat · Grade A',
    quantity: 2400,
    amount: 51600,
    status: 'released',
    depositedAt: '2026-04-02T08:00:00.000Z',
    releasedAt: '2026-04-15T12:00:00.000Z',
    transactionRef: 'UTR2026040200021',
    bankAccount: '****4417',
  },
]

// ─── Complaints ───────────────────────────────────────────────────────────────

const COMPLAINT_TIMELINE_GR2291: ComplaintTimelineStep[] = [
  {
    status: 'submitted',
    label: 'Complaint submitted',
    timestamp: '30 Aug, 6:21 PM',
    detail: 'With photos',
    completed: true,
    active: false,
  },
  {
    status: 'under_review',
    label: 'Under review',
    timestamp: '31 Aug',
    detail: 'Assigned to Nashik district officer',
    completed: true,
    active: false,
  },
  {
    status: 'evidence_requested',
    label: 'Evidence requested',
    timestamp: '2 Sep',
    detail: 'Weighbridge slip needed by 2 Sep',
    completed: false,
    active: true,
  },
  {
    status: 'resolution',
    label: 'Resolution',
    timestamp: '',
    detail: 'Both sides informed of the decision',
    completed: false,
    active: false,
  },
  {
    status: 'closed',
    label: 'Closed',
    timestamp: '',
    detail: 'Money released as decided',
    completed: false,
    active: false,
  },
]

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'GR-2291',
    dealId: 'KM-2026-00087',
    lotId: 'KM-2026-002',
    type: 'weight_dispute',
    title: 'Weight dispute — Onion 1,200 kg',
    description:
      'Lasalgaon Traders weighed my 1,200 kg onion lot as 1,100 kg at their facility. The mandi weighbridge showed 1,200 kg.',
    status: 'evidence_requested',
    escrowAmount: 18400,
    evidenceUploaded: false,
    evidenceFiles: [],
    createdAt: '2026-08-30T18:21:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
    timeline: COMPLAINT_TIMELINE_GR2291,
    affectedParty: 'Lasalgaon Traders',
  },
]

// ─── Notifications ────────────────────────────────────────────────────────────

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'offer',
    title: 'New offer from ABC Foods',
    body: '₹2,500/qtl for your Tomato lot',
    read: false,
    createdAt: '2026-09-02T10:00:00.000Z',
    linkTo: '/farmer/offers',
  },
  {
    id: 'notif-002',
    type: 'deal',
    title: 'Pickup scheduled tomorrow',
    body: 'MH 15 CJ 4409 arrives at 8:00 AM',
    read: false,
    createdAt: '2026-09-02T12:00:00.000Z',
    linkTo: '/farmer/deals',
  },
  {
    id: 'notif-003',
    type: 'complaint',
    title: 'Evidence requested',
    body: 'Upload weighbridge slip for GR-2291',
    read: false,
    createdAt: '2026-09-02T14:00:00.000Z',
    linkTo: '/farmer/help',
  },
]

// ─── Transaction records for money page ──────────────────────────────────────

export interface TransactionRecord {
  id: string
  crop: string
  grade: string
  buyer: string
  buyerType: string
  date: string
  quantity: number
  rate: number
  total: number
  status: 'completed' | 'pending' | 'disputed'
}

export const SEED_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TXN-001',
    crop: 'Tomato',
    grade: 'Grade A',
    buyer: 'ABC Foods (FPO pool)',
    buyerType: 'Processor',
    date: '2 Sep 2026',
    quantity: 500,
    rate: 2500,
    total: 12500,
    status: 'pending',
  },
  {
    id: 'TXN-002',
    crop: 'Onion',
    grade: 'Grade A',
    buyer: 'Lasalgaon Traders',
    buyerType: 'Trader',
    date: '24 Aug 2026',
    quantity: 1200,
    rate: 1535,
    total: 18420,
    status: 'disputed',
  },
  {
    id: 'TXN-003',
    crop: 'Tomato',
    grade: 'Grade A',
    buyer: 'ABC Foods Pvt Ltd',
    buyerType: 'Processor',
    date: '11 Aug 2026',
    quantity: 800,
    rate: 2470,
    total: 19760,
    status: 'completed',
  },
  {
    id: 'TXN-004',
    crop: 'Tomato',
    grade: 'Grade B',
    buyer: 'Nashik Kirana Chain',
    buyerType: 'Retailer',
    date: '28 Jul 2026',
    quantity: 650,
    rate: 2280,
    total: 14820,
    status: 'completed',
  },
  {
    id: 'TXN-005',
    crop: 'Wheat',
    grade: 'Grade A',
    buyer: 'Mandi Kirana Chain',
    buyerType: 'Trader',
    date: '2 Apr 2026',
    quantity: 2400,
    rate: 2150,
    total: 51600,
    status: 'completed',
  },
]

// ─── Buyer offers on market page (per crop) ───────────────────────────────────

export const BUYER_MARKET_OFFERS: Record<string, Array<{
  buyer: Buyer; price: number; demand: 'high' | 'medium' | 'low'; fresh: boolean
}>> = {
  tomato: [
    { buyer: BUYERS[0], price: 2500, demand: 'high', fresh: true },
    { buyer: BUYERS[1], price: 2480, demand: 'medium', fresh: true },
    { buyer: BUYERS[2], price: 2450, demand: 'low', fresh: false },
    { buyer: BUYERS[3], price: 2420, demand: 'medium', fresh: true },
  ],
  onion: [
    { buyer: BUYERS[4], price: 1535, demand: 'medium', fresh: true },
    { buyer: BUYERS[2], price: 1510, demand: 'low', fresh: false },
  ],
  wheat: [
    { buyer: BUYERS[2], price: 2150, demand: 'medium', fresh: false },
    { buyer: BUYERS[0], price: 2130, demand: 'low', fresh: false },
  ],
  soybean: [
    { buyer: BUYERS[1], price: 4320, demand: 'low', fresh: false },
  ],
  potato: [
    { buyer: BUYERS[0], price: 1280, demand: 'medium', fresh: true },
    { buyer: BUYERS[2], price: 1260, demand: 'low', fresh: false },
  ],
}
