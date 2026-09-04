-- ─────────────────────────────────────────────────────────────────────────────
-- KrishiMitra: Seed data — market prices
-- Run AFTER 002_main_schema.sql
-- Note: lots/offers/deals/users are created via the app, not seeded here.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.market_prices
  (crop, variety, mandi, current_price, unit, trend, delta, delta_percent, msp, demand_level, source)
VALUES
  ('Tomato',    'Namdhari',   'Nashik APMC',     2450, 'qtl', 'up',   190,  8.4,  2200, 'high',   'Agmarknet'),
  ('Onion',     'Pusa Red',   'Lasalgaon APMC',  1535, 'qtl', 'down', -65, -4.1,  1500, 'medium', 'Agmarknet'),
  ('Grapes',    'Thompson',   'Nashik APMC',     5200, 'qtl', 'up',   240,  4.8,  5000, 'high',   'Agmarknet'),
  ('Pomegranate','Bhagwa',    'Pune APMC',       8900, 'qtl', 'flat',   0,  0.0,  8500, 'high',   'Agmarknet'),
  ('Wheat',     'Lokwan',     'Pune APMC',       2150, 'qtl', 'flat',  15,  0.7,  2125, 'medium', 'Agmarknet'),
  ('Maize',     'Hybrid',     'Kolhapur APMC',   1420, 'qtl', 'down', -80, -5.3,  1350, 'low',    'Agmarknet'),
  ('Soybean',   'JS-335',     'Latur APMC',      4680, 'qtl', 'up',   120,  2.6,  4600, 'medium', 'Agmarknet'),
  ('Sugarcane', 'Co-86032',   'Kolhapur APMC',    350, 'qtl', 'flat',   0,  0.0,   315, 'high',   'Agmarknet'),
  ('Cotton',    'Bt Hybrid',  'Akola APMC',      7200, 'qtl', 'up',   200,  2.9,  7000, 'medium', 'Agmarknet'),
  ('Tur Dal',   'BSMR-736',   'Latur APMC',      7100, 'qtl', 'down',-150, -2.1,  7000, 'high',   'Agmarknet')
ON CONFLICT DO NOTHING;
