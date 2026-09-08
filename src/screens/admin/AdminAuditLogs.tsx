import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import { fetchAuditLogs, type AuditLog } from '../../services/supabase/admin'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'

const PAGE_SIZE = 20

type AdminLog = AuditLog & { admin?: { full_name: string } | null }

export default function AdminAuditLogs() {
  const { permissions } = useAdmin()
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')
  const [adminFilter, setAdminFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditLogs(200)
      .then(data => setLogs(data as AdminLog[]))
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }, [])

  const uniqueActions = useMemo(() => ['all', ...Array.from(new Set(logs.map(l => l.action))).sort()], [logs])
  const uniqueEntityTypes = useMemo(() => ['all', ...Array.from(new Set(logs.map(l => l.target_type))).sort()], [logs])
  const uniqueAdmins = useMemo(() => {
    const names = new Set(logs.map(l => l.admin?.full_name).filter(Boolean) as string[])
    return ['all', ...Array.from(names).sort()]
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const la = l as AdminLog
      if (actionFilter !== 'all' && l.action !== actionFilter) return false
      if (entityFilter !== 'all' && l.target_type !== entityFilter) return false
      if (adminFilter !== 'all' && la.admin?.full_name !== adminFilter) return false
      if (dateFrom && l.created_at < dateFrom) return false
      if (dateTo && l.created_at > dateTo + 'T23:59:59') return false
      if (search) {
        const q = search.toLowerCase()
        const adminName = la.admin?.full_name ?? l.admin_id
        if (![l.action, l.target_type, l.target_id, adminName].some(v => v?.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [logs, search, actionFilter, entityFilter, adminFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewAuditLogs">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>07 · ADMIN MANAGEMENT</p>
              <h1 className={styles.title}>Audit Logs</h1>
              <p className={styles.subtitle}>Last {logs.length} admin actions — read-only record</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <Lock size={12} />
              <span>Immutable — cannot be edited or deleted</span>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search action, admin, target ID…" className={styles.searchInput}
                value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            </div>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 160 }}
              value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(0) }}>
              {uniqueEntityTypes.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'All entity types' : t.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select className={styles.searchInput} style={{ flex: 'none', width: 'auto', minWidth: 160 }}
              value={adminFilter} onChange={e => { setAdminFilter(e.target.value); setPage(0) }}>
              {uniqueAdmins.map(a => (
                <option key={a} value={a}>{a === 'all' ? 'All admins' : a}</option>
              ))}
            </select>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.chips} style={{ flexWrap: 'wrap' }}>
              {uniqueActions.slice(0, 12).map(a => (
                <button key={a} type="button"
                  className={`${styles.chip} ${actionFilter === a ? styles.chipActive : ''}`}
                  onClick={() => { setActionFilter(a); setPage(0) }}>
                  {a === 'all' ? 'All actions' : a.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <span className={styles.filterLabel}>From</span>
            <input type="date" className={styles.searchInput} style={{ flex: 'none', width: 'auto' }}
              value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }} />
            <span className={styles.filterLabel}>To</span>
            <input type="date" className={styles.searchInput} style={{ flex: 'none', width: 'auto' }}
              value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }} />
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Entity type</th>
                  <th>Target ID</th>
                  <th>Details</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className={styles.loadingCell}>Loading audit logs…</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className={styles.emptyCell}>No audit logs match the filters</td></tr>
                ) : paginated.map(log => {
                  const la = log as AdminLog
                  return (
                    <>
                      <tr key={log.id} className={styles.tableRow}
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                        <td className={styles.userName}>{la.admin?.full_name ?? log.admin_id.slice(0, 8)}</td>
                        <td>
                          <span className={`${styles.pill} ${styles.pill_blue}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className={styles.muted}>{log.target_type}</td>
                        <td className={styles.monoCell}>{log.target_id.slice(0, 16)}</td>
                        <td className={styles.muted}>{log.details ? '▶ expand' : '—'}</td>
                        <td className={styles.dateCell}>
                          {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                      {expandedId === log.id && log.details && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={6} style={{ padding: '8px 20px', background: 'var(--surface-subtle)' }}>
                            <pre style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button type="button" className={styles.pageBtn} disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}><ChevronLeft size={14} /></button>
              <span className={styles.pageInfo}>
                Page {safePage + 1} of {totalPages} · {filtered.length} entries
              </span>
              <button type="button" className={styles.pageBtn} disabled={safePage >= totalPages - 1}
                onClick={() => setPage(safePage + 1)}><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      </PermissionGate>
    </AdminLayout>
  )
}
