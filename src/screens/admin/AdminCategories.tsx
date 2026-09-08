import { useState, useEffect, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import {
  fetchCategories, updateMarketPrice, insertCategory, setMarketPriceActive,
  type MarketPriceRow, type NewCategory,
} from '../../services/supabase/admin'
import toast from 'react-hot-toast'
import styles from './AdminTable.module.css'

const TREND_CLASSES: Record<string, string> = {
  up: styles.pill_green,
  down: styles.pill_danger,
  flat: styles.pill_muted,
}

const DEMAND_CLASSES: Record<string, string> = {
  high: styles.pill_green,
  medium: styles.pill_amber,
  low: styles.pill_muted,
}

const EMPTY_FORM: NewCategory = {
  crop: '', variety: '', mandi: '', current_price: 0, unit: 'qtl', msp: 0, trend: 'flat', demand_level: 'medium',
}

export default function AdminCategories() {
  const { permissions, logAction } = useAdmin()
  const [categories, setCategories] = useState<MarketPriceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newForm, setNewForm] = useState<NewCategory>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editDemand, setEditDemand] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => toast.error('Failed to load market prices'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search) return categories
    const q = search.toLowerCase()
    return categories.filter(c => [c.crop, c.variety, c.mandi].some(v => v?.toLowerCase().includes(q)))
  }, [categories, search])

  function startEdit(row: MarketPriceRow) {
    setEditingId(row.id)
    setEditPrice(String(row.current_price))
    setEditDemand(row.demand_level)
  }

  async function saveEdit(row: MarketPriceRow) {
    const price = parseFloat(editPrice)
    if (isNaN(price) || price <= 0) { toast.error('Invalid price'); return }
    setSaving(true)
    try {
      await updateMarketPrice(row.id, { current_price: price, demand_level: editDemand })
      await logAction('update_market_price', 'market_price', row.id, { price, demand_level: editDemand })
      setCategories(prev => prev.map(c => c.id === row.id ? { ...c, current_price: price, demand_level: editDemand, updated_at: new Date().toISOString() } : c))
      setEditingId(null)
      toast.success('Market price updated')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(row: MarketPriceRow) {
    setToggling(row.id)
    const next = !row.is_active
    try {
      await setMarketPriceActive(row.id, next)
      await logAction('toggle_category', 'market_price', row.id, { is_active: next, crop: row.crop })
      setCategories(prev => prev.map(c => c.id === row.id ? { ...c, is_active: next } : c))
      toast.success(next ? `${row.crop} activated` : `${row.crop} deactivated`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setToggling(null)
    }
  }

  async function handleAddCategory() {
    if (!newForm.crop.trim() || !newForm.mandi.trim()) { toast.error('Crop and mandi are required'); return }
    if (!newForm.current_price || newForm.current_price <= 0) { toast.error('Price must be greater than 0'); return }
    setSaving(true)
    try {
      const created = await insertCategory(newForm)
      await logAction('add_category', 'market_price', created.id, { crop: newForm.crop, mandi: newForm.mandi })
      setCategories(prev => [...prev, created].sort((a, b) => a.crop.localeCompare(b.crop)))
      setNewForm(EMPTY_FORM)
      setShowAddForm(false)
      toast.success(`${newForm.crop} added`)
    } catch {
      toast.error('Failed to add category')
    } finally {
      setSaving(false)
    }
  }

  function updateForm<K extends keyof NewCategory>(key: K, value: NewCategory[K]) {
    setNewForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewMarketplace">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>03 · MARKETPLACE</p>
              <h1 className={styles.title}>Categories</h1>
              <p className={styles.subtitle}>Market price reference data · {categories.length} entries</p>
            </div>
            {permissions.canViewMarketplace && (
              <button type="button" className={styles.verifyBtn}
                style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
                onClick={() => { setShowAddForm(!showAddForm); setNewForm(EMPTY_FORM) }}>
                <Plus size={14} />
                {showAddForm ? 'Cancel' : 'Add category'}
              </button>
            )}
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search crop, variety, mandi…" className={styles.searchInput}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {showAddForm && (
            <div className={styles.addFormCard}>
              <p className={styles.addFormTitle}>Add new category</p>
              <div className={styles.addFormGrid}>
                <div className={styles.addFormField}>
                  <label className={styles.addFormLabel}>Crop *</label>
                  <input className={styles.addFormInput} value={newForm.crop}
                    onChange={e => updateForm('crop', e.target.value)} placeholder="e.g. Tomato" />
                </div>
                <div className={styles.addFormField}>
                  <label className={styles.addFormLabel}>Variety</label>
                  <input className={styles.addFormInput} value={newForm.variety}
                    onChange={e => updateForm('variety', e.target.value)} placeholder="e.g. Cherry" />
                </div>
                <div className={styles.addFormField}>
                  <label className={styles.addFormLabel}>Mandi *</label>
                  <input className={styles.addFormInput} value={newForm.mandi}
                    onChange={e => updateForm('mandi', e.target.value)} placeholder="e.g. Nashik" />
                </div>
                <div className={styles.addFormField}>
                  <label className={styles.addFormLabel}>Unit</label>
                  <select className={styles.addFormInput} value={newForm.unit}
                    onChange={e => updateForm('unit', e.target.value)}>
                    <option value="qtl">qtl</option>
                    <option value="kg">kg</option>
                    <option value="tonne">tonne</option>
                  </select>
                </div>
                <div className={styles.addFormField}>
                  <label className={styles.addFormLabel}>Price / unit (₹) *</label>
                  <input type="number" className={styles.addFormInput} value={newForm.current_price || ''}
                    onChange={e => updateForm('current_price', parseFloat(e.target.value) || 0)} min={1} />
                </div>
                <div className={styles.addFormField}>
                  <label className={styles.addFormLabel}>MSP (₹)</label>
                  <input type="number" className={styles.addFormInput} value={newForm.msp || ''}
                    onChange={e => updateForm('msp', parseFloat(e.target.value) || 0)} min={0} />
                </div>
                <div className={styles.addFormField}>
                  <label className={styles.addFormLabel}>Trend</label>
                  <select className={styles.addFormInput} value={newForm.trend}
                    onChange={e => updateForm('trend', e.target.value as NewCategory['trend'])}>
                    <option value="flat">Flat</option>
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                  </select>
                </div>
                <div className={styles.addFormField}>
                  <label className={styles.addFormLabel}>Demand</label>
                  <select className={styles.addFormInput} value={newForm.demand_level}
                    onChange={e => updateForm('demand_level', e.target.value as NewCategory['demand_level'])}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className={styles.addFormActions}>
                <button type="button" className={styles.unverifyBtn} onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="button" className={styles.verifyBtn} disabled={saving} onClick={handleAddCategory}>
                  {saving ? 'Adding…' : 'Add category'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Variety</th>
                  <th>Mandi</th>
                  <th>Price / unit</th>
                  <th>MSP</th>
                  <th>Trend</th>
                  <th>Demand</th>
                  <th>Active</th>
                  <th>Updated</th>
                  {permissions.canViewMarketplace && <th></th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className={styles.loadingCell}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} className={styles.emptyCell}>No market data found</td></tr>
                ) : filtered.map(row => (
                  <tr key={row.id} className={styles.tableRow} style={{ opacity: row.is_active ? 1 : 0.55 }}>
                    <td className={styles.userName}>{row.crop}</td>
                    <td className={styles.muted}>{row.variety || '—'}</td>
                    <td className={styles.muted}>{row.mandi}</td>
                    <td>
                      {editingId === row.id ? (
                        <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                          style={{ width: 90, padding: '4px 8px', border: '1px solid var(--border-default)', borderRadius: 6, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-core)' }} />
                      ) : (
                        <span className={styles.numericCell}>₹{row.current_price.toLocaleString('en-IN')} / {row.unit}</span>
                      )}
                    </td>
                    <td className={styles.numericCell}>{row.msp ? `₹${row.msp.toLocaleString('en-IN')}` : '—'}</td>
                    <td><span className={`${styles.pill} ${TREND_CLASSES[row.trend] ?? styles.pill_muted}`}>{row.trend}</span></td>
                    <td>
                      {editingId === row.id ? (
                        <select value={editDemand} onChange={e => setEditDemand(e.target.value)}
                          style={{ padding: '4px 8px', border: '1px solid var(--border-default)', borderRadius: 6, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-core)' }}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      ) : (
                        <span className={`${styles.pill} ${DEMAND_CLASSES[row.demand_level] ?? styles.pill_muted}`}>{row.demand_level}</span>
                      )}
                    </td>
                    <td>
                      <button type="button"
                        className={`${styles.pill} ${row.is_active ? styles.pill_green : styles.pill_muted}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                        disabled={toggling === row.id}
                        onClick={() => handleToggleActive(row)}>
                        {toggling === row.id ? '…' : row.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(row.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      {editingId === row.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button type="button" className={styles.verifyBtn} disabled={saving} onClick={() => saveEdit(row)}>Save</button>
                          <button type="button" className={styles.unverifyBtn} onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button type="button" className={styles.unverifyBtn} onClick={() => startEdit(row)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PermissionGate>
    </AdminLayout>
  )
}
