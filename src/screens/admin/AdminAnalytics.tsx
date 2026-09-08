import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import {
  fetchOrdersTimeSeries, fetchRegistrationsTimeSeries, fetchLotsTimeSeries,
} from '../../services/supabase/admin'
import type { ComplaintType, EscrowStatus, ComplaintStatus } from '../../types'
import styles from './AdminAnalytics.module.css'

type DateRange = 'today' | '7d' | '30d' | 'custom'

function getDateBounds(range: DateRange, customFrom?: string, customTo?: string) {
  if (range === 'custom' && customFrom && customTo) {
    return { from: new Date(customFrom).toISOString(), to: new Date(customTo + 'T23:59:59').toISOString() }
  }
  const now = new Date()
  const to = now.toISOString()
  const from = new Date(now)
  if (range === 'today') { from.setHours(0, 0, 0, 0) }
  else if (range === '7d') { from.setDate(from.getDate() - 7) }
  else { from.setDate(from.getDate() - 30) }
  return { from: from.toISOString(), to }
}

function buildDayRange(from: string, to: string): string[] {
  const days: string[] = []
  const start = new Date(from); start.setHours(0, 0, 0, 0)
  const end = new Date(to); end.setHours(0, 0, 0, 0)
  while (start <= end) {
    days.push(start.toISOString().slice(0, 10))
    start.setDate(start.getDate() + 1)
  }
  return days
}

function fmtDay(day: string) {
  return new Date(day + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function groupByDay<T extends { created_at: string }>(items: T[]) {
  const map: Record<string, T[]> = {}
  for (const item of items) {
    const day = item.created_at.slice(0, 10)
    if (!map[day]) map[day] = []
    map[day].push(item)
  }
  return map
}

const COMPLAINT_TYPE_LABELS: Record<ComplaintType, string> = {
  weight_dispute:  'Qty mismatch',
  quality_dispute: 'Quality',
  payment_issue:   'Payment',
  transport_issue: 'Transport',
  other:           'Other',
}

const COMPLAINT_STATUS_LABELS: Partial<Record<ComplaintStatus, string>> & Record<string, string> = {
  submitted:          'Submitted',
  under_review:       'Under review',
  evidence_requested: 'Evidence req.',
  resolution:         'Resolved',
  closed:             'Closed',
}

const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  pending:         'Awaiting',
  protected:       'Held',
  release_pending: 'Pend. release',
  released:        'Released',
  disputed:        'Disputed',
}

type AdminProfile = { role: string; farmer_profile?: { verified: boolean } | null; buyer_profile?: { verified: boolean } | null }
type AdminEscrow = { status: EscrowStatus; amount: number }
type AdminLot = { crop: string }
type AdminGrievance = { type: ComplaintType; status: ComplaintStatus }

export default function AdminAnalytics() {
  const { permissions, profiles, lots, escrow, grievances } = useAdmin()
  const [range, setRange] = useState<DateRange>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [ordersSeries, setOrdersSeries] = useState<{ created_at: string; total_value: number }[]>([])
  const [regsSeries, setRegsSeries] = useState<{ created_at: string; role: string }[]>([])
  const [lotsSeries, setLotsSeries] = useState<{ created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (range === 'custom' && (!customFrom || !customTo)) return
    const { from, to } = getDateBounds(range, customFrom, customTo)
    setLoading(true)
    Promise.all([
      fetchOrdersTimeSeries(from, to),
      fetchRegistrationsTimeSeries(from, to),
      fetchLotsTimeSeries(from, to),
    ]).then(([orders, regs, lots]) => {
      setOrdersSeries(orders); setRegsSeries(regs); setLotsSeries(lots)
    }).catch(console.error).finally(() => setLoading(false))
  }, [range, customFrom, customTo])

  const { from, to } = getDateBounds(range, customFrom, customTo)
  const days = buildDayRange(from, to)

  const ordersData = useMemo(() => {
    const g = groupByDay(ordersSeries)
    return days.map(day => ({ day: fmtDay(day), orders: g[day]?.length ?? 0, value: g[day]?.reduce((s, d) => s + d.total_value, 0) ?? 0 }))
  }, [ordersSeries, days])

  const regsData = useMemo(() => {
    const g = groupByDay(regsSeries)
    return days.map(day => ({ day: fmtDay(day), farmers: g[day]?.filter(r => r.role === 'farmer').length ?? 0, buyers: g[day]?.filter(r => r.role === 'buyer').length ?? 0 }))
  }, [regsSeries, days])

  const lotsData = useMemo(() => {
    const g = groupByDay(lotsSeries)
    return days.map(day => ({ day: fmtDay(day), lots: g[day]?.length ?? 0 }))
  }, [lotsSeries, days])

  // ── Context-driven analytics (no extra DB calls) ──
  const typedGrievances = grievances as AdminGrievance[]
  const typedEscrow = escrow as AdminEscrow[]
  const typedLots = lots as AdminLot[]
  const typedProfiles = profiles as AdminProfile[]

  const openComplaints = useMemo(
    () => typedGrievances.filter(g => !['resolution', 'closed'].includes(g.status)).length,
    [typedGrievances]
  )
  const closedComplaints = useMemo(
    () => typedGrievances.filter(g => ['resolution', 'closed'].includes(g.status)).length,
    [typedGrievances]
  )
  const resolutionRate = typedGrievances.length > 0 ? Math.round((closedComplaints / typedGrievances.length) * 100) : 0

  const fundsHeld = useMemo(
    () => typedEscrow.filter(e => e.status === 'protected').reduce((s, e) => s + (e.amount ?? 0), 0),
    [typedEscrow]
  )
  const fundsDisputed = useMemo(
    () => typedEscrow.filter(e => e.status === 'disputed').reduce((s, e) => s + (e.amount ?? 0), 0),
    [typedEscrow]
  )

  const verificationRate = useMemo(() => {
    const nonAdmin = typedProfiles.filter(p => p.role !== 'admin')
    if (nonAdmin.length === 0) return 0
    const verified = nonAdmin.filter(p => p.farmer_profile?.verified || p.buyer_profile?.verified).length
    return Math.round((verified / nonAdmin.length) * 100)
  }, [typedProfiles])

  const complaintsByType = useMemo(() => {
    const counts: Partial<Record<ComplaintType, number>> = {}
    for (const g of typedGrievances) {
      counts[g.type] = (counts[g.type] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([type, count]) => ({ type: COMPLAINT_TYPE_LABELS[type as ComplaintType] ?? type, count: count ?? 0 }))
      .sort((a, b) => b.count - a.count)
  }, [typedGrievances])

  const complaintsByStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const g of typedGrievances) {
      counts[g.status] = (counts[g.status] ?? 0) + 1
    }
    return Object.entries(counts).map(([status, count]) => ({
      status: COMPLAINT_STATUS_LABELS[status] ?? status.replace(/_/g, ' '),
      count,
    }))
  }, [typedGrievances])

  const popularCrops = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const l of typedLots) {
      if (l.crop) counts[l.crop] = (counts[l.crop] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([crop, count]) => ({ crop, count }))
  }, [typedLots])

  const escrowByStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of typedEscrow) {
      counts[e.status] = (counts[e.status] ?? 0) + 1
    }
    return Object.entries(counts).map(([status, count]) => ({
      status: ESCROW_STATUS_LABELS[status as EscrowStatus] ?? status,
      count,
    }))
  }, [typedEscrow])

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewAnalytics">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>06 · ANALYTICS</p>
              <h1 className={styles.title}>Analytics & Reports</h1>
              <p className={styles.subtitle}>Platform performance over time</p>
            </div>
            <div className={styles.dateFilter}>
              {(['today', '7d', '30d', 'custom'] as DateRange[]).map(r => (
                <button key={r} type="button"
                  className={`${styles.dateBtn} ${range === r ? styles.dateBtnActive : ''}`}
                  onClick={() => setRange(r)}>
                  {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Custom'}
                </button>
              ))}
              {range === 'custom' && (
                <div className={styles.customRange}>
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className={styles.dateInput} />
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>to</span>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className={styles.dateInput} />
                </div>
              )}
            </div>
          </div>

          {/* ── Time-series charts ── */}
          {loading ? (
            <div className={styles.loadingMsg}>Loading analytics…</div>
          ) : (
            <div className={styles.grid}>
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Orders over time</p>
                <p className={styles.chartSub}>{ordersSeries.length} orders in period</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={ordersData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                    <Bar dataKey="orders" fill="var(--green-600, #146B4A)" radius={[3, 3, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Transaction value (₹)</p>
                <p className={styles.chartSub}>₹{ordersSeries.reduce((s, d) => s + d.total_value, 0).toLocaleString('en-IN')} total in period</p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={ordersData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Value']} />
                    <Area type="monotone" dataKey="value" fill="var(--amber-100, #fef3c7)" stroke="var(--amber-600, #d97706)" strokeWidth={2} name="Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>User registrations</p>
                <p className={styles.chartSub}>{regsSeries.length} new users in period</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={regsData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                    <Line type="monotone" dataKey="farmers" stroke="var(--green-600, #146B4A)" strokeWidth={2} dot={false} name="Farmers" />
                    <Line type="monotone" dataKey="buyers" stroke="var(--indigo-600, #23508C)" strokeWidth={2} dot={false} name="Buyers" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Marketplace activity</p>
                <p className={styles.chartSub}>{lotsSeries.length} lots created in period</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={lotsData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                    <Bar dataKey="lots" fill="var(--amber-500, #f59e0b)" radius={[3, 3, 0, 0]} name="Lots" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Platform snapshot (from context data — no DB calls) ── */}
          <div className={styles.sectionDivider}>
            <span>Platform Snapshot</span>
          </div>

          <div className={styles.statRow}>
            <StatCard label="Open complaints" value={String(openComplaints)} sub={`${typedGrievances.length} total`} />
            <StatCard label="Resolution rate" value={`${resolutionRate}%`} sub={`${closedComplaints} resolved`} />
            <StatCard label="Funds held" value={`₹${fundsHeld.toLocaleString('en-IN')}`} sub="In escrow" />
            <StatCard label="Disputed funds" value={`₹${fundsDisputed.toLocaleString('en-IN')}`} sub="Under dispute" />
            <StatCard label="Verification rate" value={`${verificationRate}%`} sub="Users verified" />
          </div>

          <div className={styles.grid}>
            {complaintsByType.length > 0 && (
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Complaints by type</p>
                <p className={styles.chartSub}>{typedGrievances.length} total complaints</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={complaintsByType} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                    <Bar dataKey="count" fill="var(--amber-500, #f59e0b)" radius={[0, 3, 3, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {complaintsByStatus.length > 0 && (
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Complaint status breakdown</p>
                <p className={styles.chartSub}>Current status of all complaints</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={complaintsByStatus} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                    <Bar dataKey="count" fill="var(--indigo-500, #6366f1)" radius={[3, 3, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {popularCrops.length > 0 && (
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Popular crops</p>
                <p className={styles.chartSub}>By number of lots listed</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={popularCrops} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="crop" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                    <Bar dataKey="count" fill="var(--green-600, #146B4A)" radius={[3, 3, 0, 0]} name="Lots" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {escrowByStatus.length > 0 && (
              <div className={styles.chartCard}>
                <p className={styles.chartTitle}>Escrow breakdown</p>
                <p className={styles.chartSub}>Transactions by status</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={escrowByStatus} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                    <Bar dataKey="count" fill="var(--amber-600, #d97706)" radius={[3, 3, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </PermissionGate>
    </AdminLayout>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  )
}
