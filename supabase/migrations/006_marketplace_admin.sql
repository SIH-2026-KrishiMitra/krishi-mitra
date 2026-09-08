-- Migration 006: Marketplace admin controls + category activation

-- 1. Enable admin UPDATE on lots (for deactivating listings)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lots' AND policyname = 'lots_admin_update'
  ) THEN
    CREATE POLICY "lots_admin_update" ON public.lots
      FOR UPDATE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 2. Enable admin INSERT on market_prices (for adding new categories)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'market_prices' AND policyname = 'market_prices_admin_insert'
  ) THEN
    CREATE POLICY "market_prices_admin_insert" ON public.market_prices
      FOR INSERT TO authenticated WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 3. Add is_active flag to market_prices for activate/deactivate
ALTER TABLE public.market_prices
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 4. Ensure admin can UPDATE market_prices (if policy doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'market_prices' AND policyname = 'market_prices_admin_update'
  ) THEN
    CREATE POLICY "market_prices_admin_update" ON public.market_prices
      FOR UPDATE TO authenticated USING (public.is_admin());
  END IF;
END $$;

-- 5. Ensure admin can UPDATE profiles (for suspend/reactivate)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_admin_update'
  ) THEN
    CREATE POLICY "profiles_admin_update" ON public.profiles
      FOR UPDATE TO authenticated USING (public.is_admin());
  END IF;
END $$;
