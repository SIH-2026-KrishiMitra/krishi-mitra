-- ─────────────────────────────────────────────────────────────────────────────
-- KrishiMitra: Admin sub-roles + audit_logs
-- Run AFTER 004_storage_buckets.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Add sub_role to admin_profiles ───────────────────────────────────────

ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS sub_role TEXT NOT NULL DEFAULT 'super_admin'
  CHECK (sub_role IN ('super_admin','finance_admin','support_admin','verification_admin'));

-- ─── 2. is_super_admin() helper ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.admin_profiles ap ON ap.id = p.id
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND ap.sub_role = 'super_admin'
  );
$$;

-- ─── 3. audit_logs ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID        NOT NULL REFERENCES public.profiles(id),
  action      TEXT        NOT NULL,
  target_type TEXT        NOT NULL,
  target_id   TEXT        NOT NULL,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Any admin can write their own log entries
CREATE POLICY "audit_logs_admin_insert"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() AND admin_id = auth.uid());

-- Any admin can read all audit logs
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ─── 4. Refine admin_profiles policies ───────────────────────────────────────

-- Drop the old blanket ALL policy so we can replace it with finer-grained ones
DROP POLICY IF EXISTS "admin_profiles_admin_only" ON public.admin_profiles;

-- All admins can read
CREATE POLICY "admin_profiles_select_admin"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Any admin can insert (needed for registration trigger)
CREATE POLICY "admin_profiles_insert_admin"
  ON public.admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only super_admins can update other admins; anyone can update their own row
CREATE POLICY "admin_profiles_update"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING  (auth.uid() = id OR public.is_super_admin())
  WITH CHECK (auth.uid() = id OR public.is_super_admin());
