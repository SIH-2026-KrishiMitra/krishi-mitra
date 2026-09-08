import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Package, FileText, Shield, AlertTriangle, BarChart3, ArrowRight,
  ClipboardCheck, Banknote, RefreshCw, CheckCircle2, UserPlus, TrendingUp,
} from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import AdminLayout from './AdminLayout'
import { useAuth } from '../../context/AuthContext'
import {
  fetchEnhancedStats, fetchOrdersTimeSeries, fetchRegistrationsTimeSeries,
  fetchLotsTimeSeries, fetchRecentRegistrations, fetchRecentOrders,
  fetchRecentComplaints, fetchRecentTransactions,
  type EnhancedStats, type RecentUser, type RecentOrder,
  type RecentComplaint, type RecentTransaction,
} from '../../services/supabase/admin'
import styles from './AdminHome.module.css'

type DateRange = 'today' | '7d' | '30d'

function getDateBounds(range: DateRange): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()
  const from = new Date(now)
  if (range === 'today') {
    from.setHours(0, 0, 0, 0)
  } else if (range === '7d') {
    from.setDate(from.getDate() - 7)
  } else {
    from.setDate(from.getDate() - 30)
  }
  return { from: from.toISOString(), to }
}

function groupByDay<T extends { created_at: string }>(items: T[]): Record<string, T[]> {
  const map: Record<string, T[]> = {}
  for (const item of items) {
    const day = item.created_at.slice(0, 10)
    if (!map[day]) map[day] = []
    map[day].push(item)
  }
  return map
}

function buildDayRange(from: string, to: string): string[] {
  const days: string[] = []
  const start = new Date(from)
  start.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  while (start <= end) {
    days.push(start.toISOString().slice(0, 10))
    start.setDate(start.getDate() + 1)
  }
  return days
}

function fmtDay(day: string): string {
  return new Date(day + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function AdminHome() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const name = profile?.full_name ?? 'Admin'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const [range, setRange] = useState<DateRange>('30d')
  const [stats, setStats] = useState<EnhancedStats | null>(null)
  const [ordersSeries, setOrdersSeries] = useState<{ created_at: string; total_value: number }[]>([])
  const [regsSeries, setRegsSeries] = useState<{ created_at: string; role: string }[]>([])
  const [lotsSeries, setLotsSeries] = useState<{ created_at: string }[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([])
  const [recentTx, setRecentTx] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { from, to } = getDateBounds(range)
    setLoading(true)
    Promise.all([
      fetchEnhancedStats(from, to),
      fetchOrdersTimeSeries(from, to),
      fetchRegistrationsTimeSeries(from, to),
      fetchLotsTimeSeries(from, to),
      fetchRecentRegistrations(5),
      fetchRecentOrders(5),
      fetchRecentComplaints(5),
      fetchRecentTransactions(5),
    ]).then(([s, orders, regs, lots, ru, ro, rc, rt]) => {
      setStats(s); setOrdersSeries(orders); setRegsSeries(regs); setLotsSeries(lots)
      setRecentUsers(ru); setRecentOrders(ro); setRecentComplaints(rc); setRecentTx(rt)
    }).catch(console.error).finally(() => setLoading(false))
  }, [range])

  const { from: boundsFrom, to: boundsTo } = getDateBounds(range)
  const days = buildDayRange(boundsFrom, boundsTo)

  const ordersChartData = useMemo(() => {
    const grouped = groupByDay(ordersSeries)
    return days.map(day => ({
      day: fmtDay(day),
      orders: grouped[day]?.length ?? 0,
      value: grouped[day]?.reduce((s, d) => s + d.total_value, 0) ?? 0,
    }))
  }, [ordersSeries, days])

  const regsChartData = useMemo(() => {
    const grouped = groupByDay(regsSeries)
    return days.map(day => ({
      day: fmtDay(day),
      farmers: grouped[day]?.filter(r => r.role === 'farmer').length ?? 0,
      buyers: grouped[day]?.filter(r => r.role === 'buyer').length ?? 0,
    }))
  }, [regsSeries, days])

  const lotsChartData = useMemo(() => {
    const grouped = groupByDay(lotsSeries)
    return days.map(day => ({
      day: fmtDay(day),
      lots: grouped[day]?.length ?? 0,
    }))
  }, [lotsSeries, days])

  const val = (n: number | undefined) => loading ? '—' : String(n ?? 0)
  const money = (n: number | undefined) => loading ? '—' : `₹${(n ?? 0).toLocaleString('en-IN')}`

  return (
    <AdminLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>01 · DASHBOARD</p>
            <h1 className={styles.title}>Platform overview</h1>
            <p className={styles.subtitle}>{today} · {name}</p>
          </div>
          <div className={styles.adminBadge}>
            <Shield size={14} aria-hidden />
            Admin access
          </div>
        </div>

        {/* Date filter */}
        <div className={styles.dateFilter}>
          {(['today', '7d', '30d'] as DateRange[]).map(r => (
            <button
              key={r}
              type="button"
              className={`${styles.dateBtn} ${range === r ? styles.dateBtnActive : ''}`}
              onClick={() => setRange(r)}
            >
              {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className={styles.statsGrid}>
          <StatCard icon={<Users size={20} />}         label="Total farmers"            value={val(stats?.totalFarmers)}          color="green"  action={() => navigate('/admin/farmers')} />
          <StatCard icon={<Users size={20} />}         label="Total buyers"             value={val(stats?.totalBuyers)}           color="indigo" action={() => navigate('/admin/buyers')} />
          <StatCard icon={<Package size={20} />}       label="Active listings"          value={val(stats?.activeLots)}            color="amber"  action={() => navigate('/admin/products')} />
          <StatCard icon={<FileText size={20} />}      label="Orders (period)"          value={val(stats?.ordersInRange)}         color="blue"   action={() => navigate('/admin/orders')} />
          <StatCard icon={<BarChart3 size={20} />}     label="Transaction value"        value={money(stats?.totalTransactionValue)} color="purple" action={() => navigate('/admin/transactions')} />
          <StatCard icon={<ClipboardCheck size={20} />} label="Pending KYC"            value={val(stats?.pendingKyc)}            color="amber"  action={() => navigate('/admin/kyc')} />
          <StatCard icon={<AlertTriangle size={20} />} label="Open complaints"          value={val(stats?.pendingComplaints)}     color="danger" action={() => navigate('/admin/complaints')} />
          <StatCard icon={<Banknote size={20} />}      label="Pending payouts"          value={val(stats?.pendingPayouts)}        color="green"  action={() => navigate('/admin/payouts')} />
          <StatCard icon={<RefreshCw size={20} />}     label="Pending refunds"          value={val(stats?.pendingRefunds)}        color="danger" action={() => navigate('/admin/refunds')} />
          <StatCard icon={<CheckCircle2 size={20} />}  label="Successful transactions"  value={val(stats?.successfulTransactions)} color="green" action={() => navigate('/admin/transactions')} />
          <StatCard icon={<UserPlus size={20} />}      label="New registrations"        value={val(stats?.newRegistrations)}      color="indigo" action={() => navigate('/admin/farmers')} />
          <StatCard icon={<TrendingUp size={20} />}    label="Lots created (period)"    value={val(lotsSeries.length)}            color="amber"  action={() => navigate('/admin/products')} />
        </div>

        {/* Charts */}
        <div className={styles.chartsGrid}>
          <ChartCard title="Orders over time">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                <Bar dataKey="orders" fill="var(--green-600, #146B4A)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Transaction value (₹)">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ordersChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Value']} />
                <Area type="monotone" dataKey="value" fill="var(--amber-100, #fef3c7)" stroke="var(--amber-600, #d97706)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="User registrations">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={regsChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                <Line type="monotone" dataKey="farmers" stroke="var(--green-600, #146B4A)" strokeWidth={2} dot={false} name="Farmers" />
                <Line type="monotone" dataKey="buyers" stroke="var(--indigo-600, #23508C)" strokeWidth={2} dot={false} name="Buyers" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Marketplace activity (lots listed)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={lotsChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
                <Bar dataKey="lots" fill="var(--amber-500, #f59e0b)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent tables */}
        <div className={styles.recentGrid}>
          <RecentCard title="Recent registrations" link="/admin/farmers" onLink={() => navigate('/admin/farmers')}>
            {recentUsers.length === 0 ? (
              <p className={styles.emptyNote}>No registrations yet</p>
            ) : recentUsers.map(u => (
              <div key={u.id} className={styles.recentRow}>
                <div className={styles.recentMain}>
                  <p className={styles.recentTitle}>{u.full_name}</p>
                  <p className={styles.recentMeta}>{u.email ?? '—'}</p>
                </div>
                <span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>{u.role}</span>
              </div>
            ))}
          </RecentCard>

          <RecentCard title="Recent orders" link="/admin/orders" onLink={() => navigate('/admin/orders')}>
            {recentOrders.length === 0 ? (
              <p className={styles.emptyNote}>No orders yet</p>
            ) : recentOrders.map(o => (
              <div key={o.id} className={styles.recentRow}>
                <div className={styles.recentMain}>
                  <p className={styles.recentTitle}>{o.crop} · {o.variety}</p>
                  <p className={styles.recentMeta}>{o.farmer?.full_name ?? '—'} → {o.buyer?.full_name ?? '—'}</p>
                </div>
                <span className={styles.recentValue} data-numeric="">₹{o.total_value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </RecentCard>

          <RecentCard title="Recent complaints" link="/admin/complaints" onLink={() => navigate('/admin/complaints')}>
            {recentComplaints.length === 0 ? (
              <p className={styles.emptyNote}>No complaints</p>
            ) : recentComplaints.map(c => (
              <div key={c.id} className={styles.recentRow}>
                <div className={styles.recentMain}>
                  <p className={styles.recentTitle}>{c.title}</p>
                  <p className={styles.recentMeta}>{c.reporter?.full_name ?? '—'}</p>
                </div>
                <span className={`${styles.statusPill} ${styles[`gs_${c.status}`]}`}>{c.status.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </RecentCard>

          <RecentCard title="Recent transactions" link="/admin/transactions" onLink={() => navigate('/admin/transactions')}>
            {recentTx.length === 0 ? (
              <p className={styles.emptyNote}>No transactions yet</p>
            ) : recentTx.map(tx => (
              <div key={tx.id} className={styles.recentRow}>
                <div className={styles.recentMain}>
                  <p className={styles.recentTitle}>{tx.farmer?.full_name ?? '—'} → {tx.buyer?.full_name ?? '—'}</p>
                  <p className={styles.recentMeta}>{tx.transaction_ref ?? tx.id.slice(0, 8)}</p>
                </div>
                <span className={styles.recentValue} data-numeric="">₹{(tx.amount ?? 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </RecentCard>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ icon, label, value, color, action }: {
  icon: React.ReactNode; label: string; value: string; color: string; action?: () => void
}) {
  return (
    <div
      className={`${styles.statCard} ${styles[`statCard_${color}`]}`}
      onClick={action}
      style={{ cursor: action ? 'pointer' : undefined }}
    >
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.chartCard}>
      <p className={styles.chartTitle}>{title}</p>
      {children}
    </div>
  )
}

function RecentCard({ title, link: _link, onLink, children }: {
  title: string; link: string; onLink: () => void; children: React.ReactNode
}) {
  return (
    <div className={styles.recentCard}>
      <div className={styles.recentCardHeader}>
        <h2 className={styles.recentCardTitle}>{title}</h2>
        <button type="button" className={styles.recentCardLink} onClick={onLink}>
          See all <ArrowRight size={13} />
        </button>
      </div>
      {children}
    </div>
  )
}
