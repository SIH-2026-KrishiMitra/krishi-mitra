import { useNavigate } from 'react-router-dom'
import { Users, Package, FileText, Shield, AlertTriangle, BarChart3, ArrowRight } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminHome.module.css'

export default function AdminHome() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { stats, loading, grievances, deals } = useAdmin()
  const name = profile?.full_name ?? 'Admin'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const recentGrievances = grievances.filter(g => ['submitted', 'under_review'].includes(g.status)).slice(0, 3)
  const activeDeals = deals.filter(d => d.status !== 'payment_released').slice(0, 3)

  return (
    <AdminLayout>
      <div className={styles.page}>
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

        {/* Stats grid */}
        <div className={styles.statsGrid}>
          <StatCard icon={<Users size={20} />} label="Farmers" value={loading ? '—' : String(stats?.farmers ?? 0)} color="green" action={() => navigate('/admin/users')} />
          <StatCard icon={<Users size={20} />} label="Buyers" value={loading ? '—' : String(stats?.buyers ?? 0)} color="indigo" action={() => navigate('/admin/users')} />
          <StatCard icon={<Package size={20} />} label="Active lots" value={loading ? '—' : String(stats?.activeLots ?? 0)} color="amber" action={() => navigate('/admin/lots')} />
          <StatCard icon={<FileText size={20} />} label="Active deals" value={loading ? '—' : String(stats?.activeDeals ?? 0)} color="blue" action={() => navigate('/admin/deals')} />
          <StatCard icon={<AlertTriangle size={20} />} label="Pending grievances" value={loading ? '—' : String(stats?.pendingGrievances ?? 0)} color="danger" action={() => navigate('/admin/grievances')} />
          <StatCard icon={<BarChart3 size={20} />} label="Escrow protected (₹)" value={loading ? '—' : `₹${(stats?.totalEscrow ?? 0).toLocaleString('en-IN')}`} color="purple" action={() => navigate('/admin/payments')} />
        </div>

        <div className={styles.mainGrid}>
          {/* Recent grievances */}
          <div className={styles.tableCard}>
            <div className={styles.tableCardHeader}>
              <h2 className={styles.tableCardTitle}>Pending grievances</h2>
              <button type="button" className={styles.tableCardLink} onClick={() => navigate('/admin/grievances')}>
                See all <ArrowRight size={13} />
              </button>
            </div>
            {recentGrievances.length === 0 ? (
              <p className={styles.tableEmpty}>No pending grievances</p>
            ) : recentGrievances.map(g => (
              <div key={g.id} className={styles.tableRow}>
                <div className={styles.tableRowMain}>
                  <p className={styles.tableRowTitle}>{g.title}</p>
                  <p className={styles.tableRowMeta}>#{g.id} · {g.reporter?.full_name ?? '—'}</p>
                </div>
                <span className={`${styles.statusPill} ${styles[`gs_${g.status}`]}`}>{g.status.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>

          {/* Recent active deals */}
          <div className={styles.tableCard}>
            <div className={styles.tableCardHeader}>
              <h2 className={styles.tableCardTitle}>Active deals</h2>
              <button type="button" className={styles.tableCardLink} onClick={() => navigate('/admin/deals')}>
                See all <ArrowRight size={13} />
              </button>
            </div>
            {activeDeals.length === 0 ? (
              <p className={styles.tableEmpty}>No active deals</p>
            ) : activeDeals.map(d => (
              <div key={d.id} className={styles.tableRow}>
                <div className={styles.tableRowMain}>
                  <p className={styles.tableRowTitle}>{d.crop} · {d.variety}</p>
                  <p className={styles.tableRowMeta}>{d.farmer?.full_name ?? '—'} → {d.buyer?.full_name ?? '—'}</p>
                </div>
                <span className={styles.dealValue} data-numeric="">₹{d.total_value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ icon, label, value, color, action }: {
  icon: React.ReactNode; label: string; value: string; color: string; action?: () => void
}) {
  return (
    <div className={`${styles.statCard} ${styles[`statCard_${color}`]}`}
      onClick={action} style={{ cursor: action ? 'pointer' : undefined }}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  )
}
