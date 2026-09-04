-- ─────────────────────────────────────────────────────────────────────────────
-- KrishiMitra: Profiles + auth trigger
-- Run this in Supabase SQL Editor before starting the app.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helper: is_admin ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─── profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'buyer', 'admin')),
  full_name   TEXT        NOT NULL DEFAULT '',
  phone       TEXT,
  email       TEXT,
  avatar_url  TEXT,
  language    TEXT        NOT NULL DEFAULT 'en',
  suspended   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Own row
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin reads all
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Own update
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin update all
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ─── farmer_profiles ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id              UUID    PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  village         TEXT,
  district        TEXT,
  state           TEXT,
  kyc_status      TEXT    NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('complete','pending','not_started')),
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  bank_account    TEXT,
  ifsc            TEXT,
  bank_name       TEXT,
  member_since    TEXT,
  listen_enabled  BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "farmer_profiles_select_own"
  ON public.farmer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "farmer_profiles_select_admin"
  ON public.farmer_profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "farmer_profiles_update_own"
  ON public.farmer_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ─── buyer_profiles ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id              UUID    PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_name        TEXT,
  contact_person  TEXT,
  buyer_type      TEXT    CHECK (buyer_type IN ('processor','trader','retailer','mandi','fpo')),
  location        TEXT,
  district        TEXT,
  state           TEXT,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  trust_score     INT     NOT NULL DEFAULT 0,
  completed_deals INT     NOT NULL DEFAULT 0
);

ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buyer_profiles_select_own"
  ON public.buyer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "buyer_profiles_select_admin"
  ON public.buyer_profiles FOR SELECT
  USING (public.is_admin());

-- Farmers can read verified buyers (for market display)
CREATE POLICY "buyer_profiles_select_verified_for_farmers"
  ON public.buyer_profiles FOR SELECT
  USING (verified = TRUE AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer'
  ));

CREATE POLICY "buyer_profiles_update_own"
  ON public.buyer_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ─── admin_profiles ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id          UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  department  TEXT,
  created_by  UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_profiles_admin_only"
  ON public.admin_profiles FOR ALL
  USING (public.is_admin());

-- ─── Trigger: create profile on signup ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'farmer');

  INSERT INTO public.profiles (id, role, full_name, phone, email, language)
  VALUES (
    NEW.id,
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create role-specific profile
  IF user_role = 'farmer' THEN
    INSERT INTO public.farmer_profiles (id, village, district, state, member_since)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'village',
      NEW.raw_user_meta_data->>'district',
      NEW.raw_user_meta_data->>'state',
      TO_CHAR(NOW(), 'Mon YYYY')
    )
    ON CONFLICT (id) DO NOTHING;

  ELSIF user_role = 'buyer' THEN
    INSERT INTO public.buyer_profiles (id, org_name, contact_person, buyer_type, location, district, state)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'org_name',
      NEW.raw_user_meta_data->>'contact_person',
      NEW.raw_user_meta_data->>'buyer_type',
      NEW.raw_user_meta_data->>'location',
      NEW.raw_user_meta_data->>'district',
      NEW.raw_user_meta_data->>'state'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
