import AdminLayout from './AdminLayout'
import { useAdmin } from '../../context/AdminContext'
import { PermissionGate } from '../../lib/adminPermissions'
import { Star } from 'lucide-react'
import styles from './AdminTable.module.css'

const SCHEMA_SQL = `-- Run this migration to enable the reviews module:

CREATE TABLE public.reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id      UUID NOT NULL REFERENCES public.deals(id),
  lot_id       TEXT NOT NULL REFERENCES public.lots(id),
  reviewer_id  UUID NOT NULL REFERENCES public.profiles(id),
  reviewee_id  UUID NOT NULL REFERENCES public.profiles(id),
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('farmer', 'buyer')),
  rating       INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         TEXT,
  is_hidden    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Farmers and buyers can read public (non-hidden) reviews:
CREATE POLICY "public reviews readable"
  ON public.reviews FOR SELECT
  USING (is_hidden = FALSE);

-- Users can write one review per deal (as their role):
CREATE POLICY "own reviews insert"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Admins can read all and hide/flag any:
CREATE POLICY "admin full access"
  ON public.reviews FOR ALL
  USING (is_admin());`

export default function AdminReviews() {
  const { permissions } = useAdmin()

  return (
    <AdminLayout>
      <PermissionGate permissions={permissions} requires="canViewReviews">
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.breadcrumb}>05 · SUPPORT</p>
              <h1 className={styles.title}>Reviews & Ratings</h1>
              <p className={styles.subtitle}>Farmer and buyer post-deal reviews</p>
            </div>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: 24,
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
            padding: '32px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
              <Star size={36} style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>Reviews module not yet active</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 480 }}>
                The reviews feature requires a <code style={{ fontFamily: 'var(--font-mono, monospace)', background: 'var(--surface-subtle)', padding: '1px 5px', borderRadius: 4 }}>reviews</code> table.
                No such table exists in the database yet. Once the migration below is applied and RLS policies are active,
                this screen will show: review list, star rating filter, user filter, product filter, and hide/flag moderation actions.
              </p>
            </div>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 12 }}>
                Required migration
              </p>
              <pre style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12,
                color: 'var(--text-secondary)',
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                overflowX: 'auto',
                whiteSpace: 'pre',
                margin: 0,
              }}>
                {SCHEMA_SQL}
              </pre>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Apply this migration in the Supabase SQL editor, verify RLS policies are active, then implement this screen.
            </p>
          </div>
        </div>
      </PermissionGate>
    </AdminLayout>
  )
}
