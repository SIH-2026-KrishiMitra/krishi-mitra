import type { CropMarketData, PricePoint } from '../types/price'

function makeHistory(base: number, seed: number, days = 90): PricePoint[] {
  const out: PricePoint[] = []
  let price = Math.round(base * 0.9)
  let s = seed >>> 0
  for (let i = days - 1; i >= 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const u = s / 4294967295
    price = Math.round(price * (1 + (u - 0.48) * 0.04))
    price = Math.max(Math.round(base * 0.8), Math.min(Math.round(base * 1.2), price))
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price,
    })
  }
  return out
}

export const CROP_MARKET_DATA: CropMarketData[] = [
  {
    id: 'wheat',
    crop: 'Wheat',
    variety: 'HD-2967',
    mandi: 'Nashik APMC',
    currentPrice: 2150,
    unit: 'qtl',
    trend: 'up',
    delta: 45,
    deltaPercent: 2.1,
    msp: 2015,
    priceHistory: makeHistory(2150, 12345),
    source: 'Agmarknet',
    updatedAt: 'Today, 6:40 AM',
  },
  {
    id: 'paddy',
    crop: 'Paddy',
    variety: 'Basmati-370',
    mandi: 'Pune APMC',
    currentPrice: 1890,
    unit: 'qtl',
    trend: 'down',
    delta: -30,
    deltaPercent: -1.6,
    msp: 2183,
    priceHistory: makeHistory(1890, 54321),
    source: 'Agmarknet',
    updatedAt: 'Today, 6:40 AM',
  },
  {
    id: 'cotton',
    crop: 'Cotton',
    variety: 'MCU-5',
    mandi: 'Nagpur APMC',
    currentPrice: 6740,
    unit: 'qtl',
    trend: 'up',
    delta: 120,
    deltaPercent: 1.8,
    msp: 6620,
    priceHistory: makeHistory(6740, 99887),
    source: 'Agmarknet',
    updatedAt: 'Today, 6:40 AM',
  },
  {
    id: 'soybean',
    crop: 'Soybean',
    variety: 'JS-335',
    mandi: 'Latur APMC',
    currentPrice: 4320,
    unit: 'qtl',
    trend: 'down',
    delta: -80,
    deltaPercent: -1.8,
    msp: 4300,
    priceHistory: makeHistory(4320, 11223),
    source: 'Agmarknet',
    updatedAt: 'Today, 6:40 AM',
  },
  {
    id: 'maize',
    crop: 'Maize',
    variety: 'HQPM-1',
    mandi: 'Amravati APMC',
    currentPrice: 1750,
    unit: 'qtl',
    trend: 'up',
    delta: 35,
    deltaPercent: 2.0,
    msp: 1870,
    priceHistory: makeHistory(1750, 77654),
    source: 'Agmarknet',
    updatedAt: 'Today, 6:40 AM',
  },
  {
    id: 'groundnut',
    crop: 'Groundnut',
    variety: 'GG-20',
    mandi: 'Akola APMC',
    currentPrice: 5610,
    unit: 'qtl',
    trend: 'up',
    delta: 90,
    deltaPercent: 1.6,
    msp: 5550,
    priceHistory: makeHistory(5610, 33441),
    source: 'Agmarknet',
    updatedAt: 'Today, 6:40 AM',
  },
]

export const CROPS: Array<{ id: string; label: string }> = CROP_MARKET_DATA.map(c => ({
  id: c.id,
  label: c.crop,
}))

export const CROP_VARIETIES: Record<string, string[]> = {
  wheat: ['HD-2967', 'WH-542', 'Lok-1', 'PBW-621'],
  paddy: ['Basmati-370', 'PR-126', 'Sona Masuri', 'MTU-7029'],
  cotton: ['MCU-5', 'Bunny Bt', 'RCH-134', 'Ankur-3028'],
  soybean: ['JS-335', 'NRC-7', 'JS-9305', 'RVS-2001'],
  maize: ['HQPM-1', 'Pioneer 30V92', 'DKC-9141', 'HM-4'],
  groundnut: ['GG-20', 'TAG-24', 'TG-37A', 'ICGV-91114'],
}

export const MANDIS = [
  'Nashik APMC',
  'Pune APMC',
  'Nagpur APMC',
  'Amravati APMC',
  'Akola APMC',
  'Latur APMC',
  'Solapur APMC',
  'Aurangabad APMC',
]
