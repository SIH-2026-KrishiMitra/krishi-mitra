-- ─────────────────────────────────────────────────────────────────────────────
-- KrishiMitra: Main schema — lots, offers, deals, escrow, grievances,
--              notifications, market_prices
-- Run AFTER 001_auth_profiles.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helper: generate lot ID ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_lot_id()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT 'KM-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
         LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
$$;

-- ─── lots ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lots (
  id              TEXT        PRIMARY KEY DEFAULT public.generate_lot_id(),
  farmer_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_id         TEXT        NOT NULL DEFAULT '',
  crop            TEXT        NOT NULL,
  variety         TEXT        NOT NULL DEFAULT '',
  grade           TEXT        NOT NULL DEFAULT 'B' CHECK (grade IN ('A','B','C')),
  quantity        NUMERIC     NOT NULL CHECK (quantity > 0),
  unit            TEXT        NOT NULL DEFAULT 'qtl' CHECK (unit IN ('kg','qtl','tonne')),
  expected_price  NUMERIC     NOT NULL CHECK (expected_price > 0),
  payment_mode    TEXT        NOT NULL DEFAULT 'escrow' CHECK (payment_mode IN ('escrow','direct')),
  assaying        BOOLEAN     NOT NULL DEFAULT FALSE,
  mandi           TEXT        NOT NULL DEFAULT '',
  description     TEXT,
  status          TEXT        NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','listed','offers_received','deal_accepted','in_transit','delivered','completed')),
  selling_method  TEXT        NOT NULL DEFAULT 'direct' CHECK (selling_method IN ('direct','fpo_pool')),
  image_urls      TEXT[]      NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

-- Farmer: full access to own lots
CREATE POLICY "lots_farmer_all"
  ON public.lots FOR ALL
  USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

-- Buyer: read active lots
CREATE POLICY "lots_buyer_select"
  ON public.lots FOR SELECT
  USING (
    status IN ('listed','offers_received')
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'buyer'
    )
  );

-- Admin: read all
CREATE POLICY "lots_admin_select"
  ON public.lots FOR SELECT
  USING (public.is_admin());

-- Admin: update any lot
CREATE POLICY "lots_admin_update"
  ON public.lots FOR UPDATE
  USING (public.is_admin());

DROP TRIGGER IF EXISTS lots_updated_at ON public.lots;
CREATE TRIGGER lots_updated_at
  BEFORE UPDATE ON public.lots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── offers ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.offers (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id            TEXT        NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  buyer_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_price       NUMERIC     NOT NULL CHECK (offer_price > 0),
  quantity          NUMERIC     NOT NULL CHECK (quantity > 0),
  pickup_timeline   TEXT        NOT NULL DEFAULT '',
  payment_terms     TEXT        NOT NULL DEFAULT '',
  payment_mode      TEXT        NOT NULL DEFAULT 'escrow' CHECK (payment_mode IN ('escrow','direct')),
  escrow_protected  BOOLEAN     NOT NULL DEFAULT TRUE,
  valid_until       TIMESTAMPTZ,
  status            TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','expired','cancelled')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Farmer: read offers on own lots
CREATE POLICY "offers_farmer_select"
  ON public.offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lots
      WHERE lots.id = lot_id AND lots.farmer_id = auth.uid()
    )
  );

-- Farmer: update status (accept/reject) on own lot's offers
CREATE POLICY "offers_farmer_update"
  ON public.offers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lots
      WHERE lots.id = lot_id AND lots.farmer_id = auth.uid()
    )
  );

-- Buyer: manage own offers
CREATE POLICY "offers_buyer_all"
  ON public.offers FOR ALL
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- Admin: read all
CREATE POLICY "offers_admin_select"
  ON public.offers FOR SELECT
  USING (public.is_admin());

-- ─── deals ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.deals (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id          TEXT        NOT NULL REFERENCES public.lots(id),
  offer_id        UUID        NOT NULL REFERENCES public.offers(id),
  farmer_id       UUID        NOT NULL REFERENCES public.profiles(id),
  buyer_id        UUID        NOT NULL REFERENCES public.profiles(id),
  crop            TEXT        NOT NULL,
  variety         TEXT        NOT NULL DEFAULT '',
  quantity        NUMERIC     NOT NULL,
  unit            TEXT        NOT NULL DEFAULT 'qtl',
  price_per_unit  NUMERIC     NOT NULL,
  total_value     NUMERIC     NOT NULL,
  escrow_amount   NUMERIC     NOT NULL DEFAULT 0,
  status          TEXT        NOT NULL DEFAULT 'offer_accepted'
    CHECK (status IN (
      'offer_accepted','money_deposited','transport_assigned',
      'pickup_scheduled','delivered','payment_released'
    )),
  transport       JSONB,
  timeline        JSONB       NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_farmer_select"
  ON public.deals FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "deals_farmer_update"
  ON public.deals FOR UPDATE
  USING (auth.uid() = farmer_id);

CREATE POLICY "deals_buyer_select"
  ON public.deals FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "deals_buyer_update"
  ON public.deals FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "deals_admin_all"
  ON public.deals FOR ALL
  USING (public.is_admin());

DROP TRIGGER IF EXISTS deals_updated_at ON public.deals;
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── escrow_transactions ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id               UUID        NOT NULL REFERENCES public.deals(id),
  lot_id                TEXT        NOT NULL REFERENCES public.lots(id),
  buyer_id              UUID        NOT NULL REFERENCES public.profiles(id),
  farmer_id             UUID        NOT NULL REFERENCES public.profiles(id),
  amount                NUMERIC     NOT NULL CHECK (amount > 0),
  status                TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','protected','release_pending','released','disputed')),
  deposited_at          TIMESTAMPTZ,
  released_at           TIMESTAMPTZ,
  expected_release_date TIMESTAMPTZ,
  transaction_ref       TEXT,
  bank_account          TEXT,
  dispute_note          TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escrow_farmer_select"
  ON public.escrow_transactions FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "escrow_buyer_select"
  ON public.escrow_transactions FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "escrow_admin_all"
  ON public.escrow_transactions FOR ALL
  USING (public.is_admin());

-- ─── grievances ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.grievances (
  id              TEXT        PRIMARY KEY,
  reporter_id     UUID        NOT NULL REFERENCES public.profiles(id),
  deal_id         UUID        REFERENCES public.deals(id),
  lot_id          TEXT        REFERENCES public.lots(id),
  type            TEXT        NOT NULL
    CHECK (type IN ('weight_dispute','quality_dispute','payment_issue','transport_issue','other')),
  title           TEXT        NOT NULL,
  description     TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','under_review','evidence_requested','resolution','closed')),
  escrow_amount   NUMERIC,
  evidence_urls   TEXT[]      NOT NULL DEFAULT '{}',
  resolution_note TEXT,
  assigned_to     UUID        REFERENCES public.profiles(id),
  timeline        JSONB       NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grievances_reporter_all"
  ON public.grievances FOR ALL
  USING (auth.uid() = reporter_id)
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "grievances_admin_all"
  ON public.grievances FOR ALL
  USING (public.is_admin());

DROP TRIGGER IF EXISTS grievances_updated_at ON public.grievances;
CREATE TRIGGER grievances_updated_at
  BEFORE UPDATE ON public.grievances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── notifications ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL
    CHECK (type IN ('offer','deal','payment','complaint','system')),
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  read        BOOLEAN     NOT NULL DEFAULT FALSE,
  link_to     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_admin_insert"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- ─── market_prices ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.market_prices (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  crop          TEXT        NOT NULL,
  variety       TEXT        NOT NULL DEFAULT '',
  mandi         TEXT        NOT NULL,
  current_price NUMERIC     NOT NULL,
  unit          TEXT        NOT NULL DEFAULT 'qtl',
  trend         TEXT        NOT NULL DEFAULT 'flat' CHECK (trend IN ('up','down','flat')),
  delta         NUMERIC     NOT NULL DEFAULT 0,
  delta_percent NUMERIC     NOT NULL DEFAULT 0,
  msp           NUMERIC     NOT NULL DEFAULT 0,
  demand_level  TEXT        NOT NULL DEFAULT 'medium' CHECK (demand_level IN ('high','medium','low')),
  price_history JSONB       NOT NULL DEFAULT '[]',
  source        TEXT        NOT NULL DEFAULT 'Agmarknet',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read market prices
CREATE POLICY "market_prices_authenticated_read"
  ON public.market_prices FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admin can insert/update market prices
CREATE POLICY "market_prices_admin_write"
  ON public.market_prices FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
