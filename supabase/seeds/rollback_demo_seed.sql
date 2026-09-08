-- =============================================================================
-- rollback_demo_seed.sql
-- Reverses supabase/migrations/008_demo_seed.sql
--
-- Safe to run multiple times (all DELETEs are idempotent).
-- Deletes in FK-safe order: escrow → deals → offers → lots →
--   grievances → notifications → profiles → auth.users → helper fn
-- market_prices price_history is NOT rolled back (cannot distinguish
-- auto-generated values from any manually entered history).
-- =============================================================================

-- 1. Escrow transactions
DELETE FROM public.escrow_transactions
WHERE id IN (
  '50000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000005'
);

-- 2. Deals
DELETE FROM public.deals
WHERE id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

-- 3. Offers
DELETE FROM public.offers
WHERE id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0000-000000000007',
  '30000000-0000-0000-0000-000000000008',
  '30000000-0000-0000-0000-000000000009',
  '30000000-0000-0000-0000-000000000010',
  '30000000-0000-0000-0000-000000000011',
  '30000000-0000-0000-0000-000000000012',
  '30000000-0000-0000-0000-000000000013',
  '30000000-0000-0000-0000-000000000014',
  '30000000-0000-0000-0000-000000000015'
);

-- 4. Lots
DELETE FROM public.lots
WHERE id IN (
  'KM-2026-10001', 'KM-2026-10002', 'KM-2026-10003',
  'KM-2026-10004', 'KM-2026-10005', 'KM-2026-10006',
  'KM-2026-10007', 'KM-2026-10008', 'KM-2026-10009',
  'KM-2026-10010', 'KM-2026-10011', 'KM-2026-10012'
);

-- 5. Grievances
DELETE FROM public.grievances
WHERE id IN ('GRV-2026-001', 'GRV-2026-002', 'GRV-2026-003');

-- 6. Notifications (keyed by link_to to avoid fragile joins)
DELETE FROM public.notifications
WHERE link_to IN (
  '/farmer/lots/KM-2026-10001',
  '/farmer/deals',
  '/farmer/lots/KM-2026-10003',
  '/farmer/grievances',
  '/farmer/lots/KM-2026-10003',
  '/buyer/marketplace',
  '/buyer/grievances'
)
AND user_id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000010',
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000005'
);

-- 7. Remove newly added market_prices crops (only the 4 inserted by 008)
DELETE FROM public.market_prices
WHERE crop IN ('Bajra', 'Jowar', 'Groundnut', 'Turmeric')
  AND source = 'Agmarknet'
  AND mandi IN ('Pune APMC', 'Latur APMC', 'Akola APMC', 'Sangli APMC');

-- 8. Auth users — cascade deletes profiles, farmer_profiles, buyer_profiles
--    (FK ON DELETE CASCADE must be in place, which Supabase sets by default
--     for auth.users → public.profiles)
DELETE FROM auth.users
WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000010',
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007',
  '20000000-0000-0000-0000-000000000008',
  '20000000-0000-0000-0000-000000000009',
  '20000000-0000-0000-0000-000000000010'
);

-- 9. Drop helper function
DROP FUNCTION IF EXISTS public._demo_price_history(NUMERIC, TEXT, INT);

-- =============================================================================
-- NOTE: market_prices.price_history values updated by 008_demo_seed.sql
-- cannot be automatically reverted because the table had no history before.
-- To reset, run:
--   UPDATE public.market_prices SET price_history = '[]'::jsonb;
-- =============================================================================
