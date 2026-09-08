-- =============================================================================
-- 008_demo_seed.sql
-- KrishiMitra: Demo & development seed data
--
-- Creates: 10 farmers, 10 buyers, 12 lots, 15 offers, 6 deals,
--          5 escrow transactions, 3 grievances, 12 notifications,
--          updated market_prices with 30-day price_history
--
-- All demo accounts use password: Demo@1234
-- All demo UUIDs follow a fixed pattern so they are easy to identify:
--   Farmers  10000000-0000-0000-0000-00000000000{1-10}
--   Buyers   20000000-0000-0000-0000-00000000000{1-10}
--   Offers   30000000-0000-0000-0000-00000000000{1-15}
--   Deals    40000000-0000-0000-0000-00000000000{1-6}
--   Escrow   50000000-0000-0000-0000-00000000000{1-5}
--   Lots     KM-2026-10001 … KM-2026-10012
--
-- TO REVERSE: run supabase/seeds/rollback_demo_seed.sql
-- =============================================================================

-- ─── Price-history helper (used for market_prices) ────────────────────────────
CREATE OR REPLACE FUNCTION public._demo_price_history(
  base  NUMERIC,
  trend TEXT    DEFAULT 'flat',   -- 'up' | 'down' | 'flat'
  days  INT     DEFAULT 30
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  result JSONB   := '[]'::jsonb;
  i      INT;
  drift  NUMERIC;
  price  NUMERIC;
BEGIN
  drift := CASE trend WHEN 'up' THEN 0.003 WHEN 'down' THEN -0.003 ELSE 0.000 END;
  FOR i IN REVERSE days..1 LOOP
    price  := base * (1 + drift * (days - i) + 0.02 * SIN(i * 0.8) - 0.01 * COS(i * 1.3));
    result := result || jsonb_build_array(jsonb_build_object(
      'date',  TO_CHAR(CURRENT_DATE - i, 'YYYY-MM-DD'),
      'price', ROUND(price, 0)
    ));
  END LOOP;
  RETURN result;
END;
$$;

-- =============================================================================
-- SECTION 1: AUTH USERS  (trigger auto-creates profiles + role sub-profiles)
-- =============================================================================

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES

-- ── Farmers ──────────────────────────────────────────────────────────────────
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','ramesh.patil@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Ramesh Patil","phone":"+919876543201","village":"Dindori","district":"Nashik","state":"Maharashtra","language":"mr"}'::jsonb,
 NOW()-INTERVAL'180 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','sunita.devi@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Sunita Devi","phone":"+919876543202","village":"Nissing","district":"Karnal","state":"Haryana","language":"hi"}'::jsonb,
 NOW()-INTERVAL'150 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','mohan.verma@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Mohan Verma","phone":"+919876543203","village":"Bakshi Ka Talab","district":"Lucknow","state":"Uttar Pradesh","language":"hi"}'::jsonb,
 NOW()-INTERVAL'120 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','kavitha.raju@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Kavitha Raju","phone":"+919876543204","village":"Hoskote","district":"Bengaluru Rural","state":"Karnataka","language":"en"}'::jsonb,
 NOW()-INTERVAL'200 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','harpreet.singh@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Harpreet Singh","phone":"+919876543205","village":"Khanna","district":"Ludhiana","state":"Punjab","language":"en"}'::jsonb,
 NOW()-INTERVAL'90 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','anjali.bhosle@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Anjali Bhosle","phone":"+919876543206","village":"Manchar","district":"Pune","state":"Maharashtra","language":"mr"}'::jsonb,
 NOW()-INTERVAL'240 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','vijay.deshmukh@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Vijay Deshmukh","phone":"+919876543207","village":"Wardha","district":"Nagpur","state":"Maharashtra","language":"mr"}'::jsonb,
 NOW()-INTERVAL'300 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','meena.kumari@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Meena Kumari","phone":"+919876543208","village":"Dewas","district":"Indore","state":"Madhya Pradesh","language":"hi"}'::jsonb,
 NOW()-INTERVAL'60 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','rajesh.yadav@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Rajesh Yadav","phone":"+919876543209","village":"Firozabad","district":"Agra","state":"Uttar Pradesh","language":"hi"}'::jsonb,
 NOW()-INTERVAL'110 days', NOW(),'','','',''),

('10000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','priya.nair@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"farmer","full_name":"Priya Nair","phone":"+919876543210","village":"Sinnar","district":"Nashik","state":"Maharashtra","language":"mr"}'::jsonb,
 NOW()-INTERVAL'75 days', NOW(),'','','',''),

-- ── Buyers ───────────────────────────────────────────────────────────────────
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','agro.processors@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"Agro Processors Ltd","org_name":"Agro Processors Ltd","contact_person":"Arvind Mehta","buyer_type":"processor","location":"Nashik, Maharashtra","district":"Nashik","state":"Maharashtra","language":"en"}'::jsonb,
 NOW()-INTERVAL'365 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','freshmart.retail@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"FreshMart Retail","org_name":"FreshMart Retail Pvt Ltd","contact_person":"Sneha Joshi","buyer_type":"retailer","location":"Pune, Maharashtra","district":"Pune","state":"Maharashtra","language":"en"}'::jsonb,
 NOW()-INTERVAL'280 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','krishak.traders@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"Krishak Traders","org_name":"Krishak Traders","contact_person":"Ramakant Shinde","buyer_type":"trader","location":"Nashik, Maharashtra","district":"Nashik","state":"Maharashtra","language":"mr"}'::jsonb,
 NOW()-INTERVAL'420 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','mh.fpo.hub@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"Maharashtra FPO Hub","org_name":"Maharashtra Farmer Producer Hub","contact_person":"Dipak Chavan","buyer_type":"fpo","location":"Pune, Maharashtra","district":"Pune","state":"Maharashtra","language":"mr"}'::jsonb,
 NOW()-INTERVAL'500 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','national.agri@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"National Agri Exports","org_name":"National Agri Exports Pvt Ltd","contact_person":"Vikram Nair","buyer_type":"processor","location":"Mumbai, Maharashtra","district":"Mumbai","state":"Maharashtra","language":"en"}'::jsonb,
 NOW()-INTERVAL'600 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','spice.garden@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"Spice Garden Foods","org_name":"Spice Garden Foods Pvt Ltd","contact_person":"Ananya Iyer","buyer_type":"processor","location":"Pune, Maharashtra","district":"Pune","state":"Maharashtra","language":"en"}'::jsonb,
 NOW()-INTERVAL'180 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','delhi.grain@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"Delhi Grain Merchants","org_name":"Delhi Grain Merchants","contact_person":"Sanjay Gupta","buyer_type":"trader","location":"New Delhi, Delhi","district":"New Delhi","state":"Delhi","language":"hi"}'::jsonb,
 NOW()-INTERVAL'730 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','veggie.connect@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"Veggie Connect","org_name":"Veggie Connect LLP","contact_person":"Lakshmi Prasad","buyer_type":"retailer","location":"Bengaluru, Karnataka","district":"Bengaluru Urban","state":"Karnataka","language":"en"}'::jsonb,
 NOW()-INTERVAL'200 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','lasalgaon.apmc@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"Lasalgaon APMC Hub","org_name":"Lasalgaon APMC","contact_person":"Suresh Wagh","buyer_type":"mandi","location":"Lasalgaon, Nashik","district":"Nashik","state":"Maharashtra","language":"mr"}'::jsonb,
 NOW()-INTERVAL'900 days', NOW(),'','','',''),

('20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000000',
 'authenticated','authenticated','punjab.collective@demo.km',
 crypt('Demo@1234', gen_salt('bf')), NOW(),
 '{"provider":"email","providers":["email"]}'::jsonb,
 '{"role":"buyer","full_name":"Punjab Agri Collective","org_name":"Punjab Agri Collective Society","contact_person":"Gurpreet Kaur","buyer_type":"fpo","location":"Ludhiana, Punjab","district":"Ludhiana","state":"Punjab","language":"en"}'::jsonb,
 NOW()-INTERVAL'450 days', NOW(),'','','','')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 2: ENRICH PROFILES  (trigger already created base rows)
-- =============================================================================

-- ── Farmer profiles ───────────────────────────────────────────────────────────
UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000001', ifsc='SBIN0001234', bank_name='State Bank of India'
WHERE id='10000000-0000-0000-0000-000000000001';

UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000002', ifsc='PUNB0012300', bank_name='Punjab National Bank'
WHERE id='10000000-0000-0000-0000-000000000002';

UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000003', ifsc='UBIN0123456', bank_name='Union Bank of India'
WHERE id='10000000-0000-0000-0000-000000000003';

UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000004', ifsc='KARB0000123', bank_name='Karnataka Bank'
WHERE id='10000000-0000-0000-0000-000000000004';

UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000005', ifsc='HDFC0001111', bank_name='HDFC Bank'
WHERE id='10000000-0000-0000-0000-000000000005';

UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000006', ifsc='MAHB0001200', bank_name='Bank of Maharashtra'
WHERE id='10000000-0000-0000-0000-000000000006';

UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000007', ifsc='MAHB0001300', bank_name='Bank of Maharashtra'
WHERE id='10000000-0000-0000-0000-000000000007';

UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000008', ifsc='CBIN0281234', bank_name='Central Bank of India'
WHERE id='10000000-0000-0000-0000-000000000008';

UPDATE public.farmer_profiles SET kyc_status='pending', verified=FALSE,
  bank_account='39012300000009', ifsc='UBIN0234567', bank_name='Union Bank of India'
WHERE id='10000000-0000-0000-0000-000000000009';

UPDATE public.farmer_profiles SET kyc_status='complete', verified=TRUE,
  bank_account='39012300000010', ifsc='MAHB0001400', bank_name='Bank of Maharashtra'
WHERE id='10000000-0000-0000-0000-000000000010';

-- ── Buyer profiles ────────────────────────────────────────────────────────────
UPDATE public.buyer_profiles SET verified=TRUE, trust_score=92, completed_deals=47
WHERE id='20000000-0000-0000-0000-000000000001';

UPDATE public.buyer_profiles SET verified=TRUE, trust_score=88, completed_deals=31
WHERE id='20000000-0000-0000-0000-000000000002';

UPDATE public.buyer_profiles SET verified=TRUE, trust_score=79, completed_deals=22
WHERE id='20000000-0000-0000-0000-000000000003';

UPDATE public.buyer_profiles SET verified=TRUE, trust_score=95, completed_deals=63
WHERE id='20000000-0000-0000-0000-000000000004';

UPDATE public.buyer_profiles SET verified=TRUE, trust_score=97, completed_deals=112
WHERE id='20000000-0000-0000-0000-000000000005';

UPDATE public.buyer_profiles SET verified=TRUE, trust_score=85, completed_deals=18
WHERE id='20000000-0000-0000-0000-000000000006';

UPDATE public.buyer_profiles SET verified=TRUE, trust_score=82, completed_deals=55
WHERE id='20000000-0000-0000-0000-000000000007';

UPDATE public.buyer_profiles SET verified=FALSE, trust_score=61, completed_deals=7
WHERE id='20000000-0000-0000-0000-000000000008';

UPDATE public.buyer_profiles SET verified=TRUE, trust_score=90, completed_deals=84
WHERE id='20000000-0000-0000-0000-000000000009';

UPDATE public.buyer_profiles SET verified=TRUE, trust_score=93, completed_deals=39
WHERE id='20000000-0000-0000-0000-000000000010';

-- =============================================================================
-- SECTION 3: LOTS  (12 lots across 10 crop categories)
-- =============================================================================

INSERT INTO public.lots
  (id, farmer_id, crop_id, crop, variety, grade, quantity, unit,
   expected_price, payment_mode, assaying, mandi, description,
   status, selling_method, image_urls, created_at, updated_at)
VALUES

-- 1. Onion – Ramesh Patil – deal in progress
('KM-2026-10001','10000000-0000-0000-0000-000000000001',
 'onion','Onion','Nashik Red','A',200,'qtl',1600,'escrow',TRUE,
 'Lasalgaon APMC',
 'Premium quality red onions from Dindori farm. Sun-dried for 7 days. Very low moisture.',
 'deal_accepted','direct','{}',
 NOW()-INTERVAL'15 days', NOW()-INTERVAL'13 days'),

-- 2. Wheat – Sunita Devi – completed
('KM-2026-10002','10000000-0000-0000-0000-000000000002',
 'wheat','Wheat','Lokwan','A',150,'qtl',2200,'escrow',FALSE,
 'Karnal APMC',
 'Rabi season wheat. Well-cleaned, machine-graded. Moisture 12%.',
 'completed','direct','{}',
 NOW()-INTERVAL'45 days', NOW()-INTERVAL'5 days'),

-- 3. Potato – Mohan Verma – offers received
('KM-2026-10003','10000000-0000-0000-0000-000000000003',
 'potato','Potato','Jyoti','B',500,'qtl',850,'escrow',FALSE,
 'Lucknow APMC',
 'Fresh Kharif potato crop. Size: 45-75mm. Stored in cold storage since harvest.',
 'offers_received','direct','{}',
 NOW()-INTERVAL'5 days', NOW()-INTERVAL'2 days'),

-- 4. Tomato – Kavitha Raju – in transit
('KM-2026-10004','10000000-0000-0000-0000-000000000004',
 'tomato','Tomato','Hybrid F1','A',80,'qtl',2500,'escrow',TRUE,
 'Nashik APMC',
 'Fresh vine-ripened hybrid tomatoes. Brix: 4.5+. Harvested 2 days ago.',
 'in_transit','direct','{}',
 NOW()-INTERVAL'8 days', NOW()-INTERVAL'3 days'),

-- 5. Rice – Harpreet Singh – listed
('KM-2026-10005','10000000-0000-0000-0000-000000000005',
 'rice','Rice','Basmati 1121','A',300,'qtl',4200,'escrow',TRUE,
 'Ludhiana APMC',
 'Premium Basmati 1121. Grain length: 8.3mm. Aged 6 months in controlled storage.',
 'listed','direct','{}',
 NOW()-INTERVAL'3 days', NOW()-INTERVAL'3 days'),

-- 6. Grapes – Anjali Bhosle – offers received
('KM-2026-10006','10000000-0000-0000-0000-000000000006',
 'grapes','Grapes','Thompson Seedless','A',60,'qtl',5500,'escrow',TRUE,
 'Nashik APMC',
 'Export-quality Thompson Seedless grapes. Brix: 18+. Ready for cold-chain export.',
 'offers_received','direct','{}',
 NOW()-INTERVAL'4 days', NOW()-INTERVAL'1 day'),

-- 7. Cotton – Vijay Deshmukh – listed
('KM-2026-10007','10000000-0000-0000-0000-000000000007',
 'cotton','Cotton','Bt Hybrid','A',120,'qtl',7400,'escrow',FALSE,
 'Akola APMC',
 'Kharif cotton, 2 pickings done. Staple length: 28mm. Trash content < 3%.',
 'listed','direct','{}',
 NOW()-INTERVAL'7 days', NOW()-INTERVAL'7 days'),

-- 8. Soybean – Meena Kumari – delivered
('KM-2026-10008','10000000-0000-0000-0000-000000000008',
 'soybean','Soybean','JS-335','B',250,'qtl',4700,'escrow',FALSE,
 'Indore APMC',
 'Kharif soybean. Moisture: 12%. Clean and machine-sorted.',
 'delivered','direct','{}',
 NOW()-INTERVAL'20 days', NOW()-INTERVAL'2 days'),

-- 9. Mustard – Rajesh Yadav – listed
('KM-2026-10009','10000000-0000-0000-0000-000000000009',
 'mustard','Mustard','Pusa Bold','A',100,'qtl',5300,'escrow',TRUE,
 'Agra APMC',
 'Rabi mustard, bold seeds. Oil content: 42%. Fully sun-dried.',
 'listed','direct','{}',
 NOW()-INTERVAL'2 days', NOW()-INTERVAL'2 days'),

-- 10. Pomegranate – Priya Nair – deal accepted (pickup scheduled)
('KM-2026-10010','10000000-0000-0000-0000-000000000010',
 'pomegranate','Pomegranate','Bhagwa','A',40,'qtl',9200,'escrow',TRUE,
 'Nashik APMC',
 'Premium Bhagwa pomegranates. Aril color: deep red. Brix: 16+. Fully mature.',
 'deal_accepted','direct','{}',
 NOW()-INTERVAL'12 days', NOW()-INTERVAL'8 days'),

-- 11. Onion (draft) – Ramesh Patil
('KM-2026-10011','10000000-0000-0000-0000-000000000001',
 'onion','Onion','Pusa Red','B',100,'qtl',1500,'direct',FALSE,
 'Nashik APMC',
 'Second crop onions. Smaller size, good quality.',
 'draft','direct','{}',
 NOW()-INTERVAL'1 day', NOW()-INTERVAL'1 day'),

-- 12. Wheat FPO pool – Harpreet Singh
('KM-2026-10012','10000000-0000-0000-0000-000000000005',
 'wheat','Wheat','HD-2967','B',200,'qtl',2100,'escrow',FALSE,
 'Ludhiana APMC',
 'Rabi wheat pooled with FPO members for collective price discovery.',
 'offers_received','fpo_pool','{}',
 NOW()-INTERVAL'6 days', NOW()-INTERVAL'4 days')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 4: OFFERS  (15 offers across lots, mixed statuses)
-- =============================================================================

INSERT INTO public.offers
  (id, lot_id, buyer_id, offer_price, quantity, pickup_timeline,
   payment_terms, payment_mode, escrow_protected, valid_until, status, notes, created_at)
VALUES

-- Onion KM-2026-10001 (deal_accepted): 1 accepted + 1 rejected
('30000000-0000-0000-0000-000000000001','KM-2026-10001',
 '20000000-0000-0000-0000-000000000001', -- Agro Processors
 1620,200,'Within 2 days','Full payment via escrow within 24h of delivery',
 'escrow',TRUE, NOW()+INTERVAL'5 days','accepted',
 'We can offer grading at our facility at no extra charge.',
 NOW()-INTERVAL'13 days'),

('30000000-0000-0000-0000-000000000002','KM-2026-10001',
 '20000000-0000-0000-0000-000000000003', -- Krishak Traders
 1570,200,'Within 3 days','50% advance, 50% on delivery',
 'direct',FALSE, NOW()-INTERVAL'1 day','rejected',
 NULL, NOW()-INTERVAL'13 days'),

-- Potato KM-2026-10003 (offers_received): 3 active offers
('30000000-0000-0000-0000-000000000003','KM-2026-10003',
 '20000000-0000-0000-0000-000000000007', -- Delhi Grain
 870,500,'Within 3 days','Full escrow payment',
 'escrow',TRUE, NOW()+INTERVAL'4 days','pending',
 'Can arrange cold-chain transport from your cold storage.',
 NOW()-INTERVAL'2 days'),

('30000000-0000-0000-0000-000000000004','KM-2026-10003',
 '20000000-0000-0000-0000-000000000002', -- FreshMart
 855,300,'Within 5 days','Escrow via KrishiMitra',
 'escrow',TRUE, NOW()+INTERVAL'6 days','pending',
 'Need Grade A only. Can you separate?',
 NOW()-INTERVAL'1 day'),

('30000000-0000-0000-0000-000000000005','KM-2026-10003',
 '20000000-0000-0000-0000-000000000004', -- MH FPO Hub
 845,500,'Within 7 days','Direct payment within 48h',
 'direct',FALSE, NOW()+INTERVAL'7 days','pending',
 NULL, NOW()-INTERVAL'2 days'),

-- Tomato KM-2026-10004 (in_transit): 1 accepted + 1 rejected
('30000000-0000-0000-0000-000000000006','KM-2026-10004',
 '20000000-0000-0000-0000-000000000002', -- FreshMart
 2520,80,'Next day pickup','Full escrow, released on delivery confirmation',
 'escrow',TRUE, NOW()+INTERVAL'3 days','accepted',
 'Our cold-chain truck will be at your farm gate at 6 AM.',
 NOW()-INTERVAL'7 days'),

('30000000-0000-0000-0000-000000000007','KM-2026-10004',
 '20000000-0000-0000-0000-000000000008', -- Veggie Connect
 2480,80,'Within 2 days','Direct bank transfer',
 'direct',FALSE, NOW()-INTERVAL'2 days','rejected',
 NULL, NOW()-INTERVAL'7 days'),

-- Rice KM-2026-10005 (listed): 2 active offers
('30000000-0000-0000-0000-000000000008','KM-2026-10005',
 '20000000-0000-0000-0000-000000000010', -- Punjab Collective
 4250,300,'Within 3 days','Escrow, released after assaying',
 'escrow',TRUE, NOW()+INTERVAL'7 days','pending',
 'Collective will arrange assaying at PARI lab, Ludhiana.',
 NOW()-INTERVAL'1 day'),

('30000000-0000-0000-0000-000000000009','KM-2026-10005',
 '20000000-0000-0000-0000-000000000005', -- National Agri Exports
 4320,300,'Within 5 days','Full payment escrow, export documentation provided',
 'escrow',TRUE, NOW()+INTERVAL'8 days','pending',
 'We export to UAE & Saudi Arabia. Export premium possible.',
 NOW()-INTERVAL'1 day'),

-- Grapes KM-2026-10006 (offers_received): 2 active + 1 expired
('30000000-0000-0000-0000-000000000010','KM-2026-10006',
 '20000000-0000-0000-0000-000000000005', -- National Agri Exports
 5600,60,'Pickup within 48h','Full escrow, cold-chain transport included',
 'escrow',TRUE, NOW()+INTERVAL'2 days','pending',
 'Export documentation ready. Air-cargo slot booked for next week.',
 NOW()-INTERVAL'2 days'),

('30000000-0000-0000-0000-000000000011','KM-2026-10006',
 '20000000-0000-0000-0000-000000000002', -- FreshMart
 5450,40,'Within 3 days','Escrow payment',
 'escrow',TRUE, NOW()+INTERVAL'5 days','pending',
 'Need 40 qtl for retail packs. Can we negotiate on the remaining 20?',
 NOW()-INTERVAL'1 day'),

-- Soybean KM-2026-10008 (delivered): 1 accepted offer
('30000000-0000-0000-0000-000000000012','KM-2026-10008',
 '20000000-0000-0000-0000-000000000006', -- Spice Garden
 4720,250,'Within 3 days','Escrow, released after moisture test at mill',
 'escrow',TRUE, NOW()-INTERVAL'5 days','accepted',
 'Our mill truck will collect from Dewas mandi.',
 NOW()-INTERVAL'18 days'),

-- Pomegranate KM-2026-10010 (deal_accepted): 1 accepted + 1 rejected
('30000000-0000-0000-0000-000000000013','KM-2026-10010',
 '20000000-0000-0000-0000-000000000005', -- National Agri Exports
 9300,40,'Pickup in 2 days','Full escrow, reefer truck arranged',
 'escrow',TRUE, NOW()+INTERVAL'4 days','accepted',
 'Export consignment to Qatar. Need phytosanitary cert.',
 NOW()-INTERVAL'10 days'),

('30000000-0000-0000-0000-000000000014','KM-2026-10010',
 '20000000-0000-0000-0000-000000000001', -- Agro Processors
 9100,40,'Within 5 days','Direct payment',
 'direct',FALSE, NOW()-INTERVAL'3 days','rejected',
 NULL, NOW()-INTERVAL'10 days'),

-- Wheat FPO KM-2026-10012 (offers_received): 2 active
('30000000-0000-0000-0000-000000000015','KM-2026-10012',
 '20000000-0000-0000-0000-000000000010', -- Punjab Collective
 2130,200,'Within 5 days','Escrow, collective buying terms',
 'escrow',TRUE, NOW()+INTERVAL'10 days','pending',
 'Collective can aggregate with other FPO lots for better logistics.',
 NOW()-INTERVAL'4 days')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 5: DEALS  (6 deals covering all 6 DealStatus stages)
-- =============================================================================

INSERT INTO public.deals
  (id, lot_id, offer_id, farmer_id, buyer_id,
   crop, variety, quantity, unit, price_per_unit, total_value, escrow_amount,
   status, transport, timeline, created_at, updated_at)
VALUES

-- Deal 1: Onion – offer_accepted → money_deposited (escrow locked)
('40000000-0000-0000-0000-000000000001',
 'KM-2026-10001','30000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',
 'Onion','Nashik Red',200,'qtl',1620,324000,324000,
 'money_deposited', NULL,
 '[
   {"status":"offer_accepted","label":"Offer Accepted","timestamp":"2026-08-25T10:00:00Z","detail":"Ramesh Patil accepted Agro Processors Ltd offer of ₹1,620/qtl.","completed":true,"active":false},
   {"status":"money_deposited","label":"Payment Secured","timestamp":"2026-08-26T09:30:00Z","detail":"₹3,24,000 secured in KrishiMitra escrow.","completed":true,"active":true},
   {"status":"transport_assigned","label":"Transport Assigned","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"pickup_scheduled","label":"Pickup Scheduled","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"delivered","label":"Delivered","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"payment_released","label":"Payment Released","timestamp":null,"detail":null,"completed":false,"active":false}
 ]'::jsonb,
 NOW()-INTERVAL'13 days', NOW()-INTERVAL'12 days'),

-- Deal 2: Wheat – payment_released (fully completed)
('40000000-0000-0000-0000-000000000002',
 'KM-2026-10002','30000000-0000-0000-0000-000000000008',
 '10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000010',
 'Wheat','Lokwan',150,'qtl',2200,330000,330000,
 'payment_released',
 '{"vehicle_number":"HR-05-AB-2345","driver_name":"Rakesh Kumar","driver_phone":"+919988776655","pickup_date":"2026-07-28","pickup_time":"08:00","estimated_delivery":"2026-07-29"}'::jsonb,
 '[
   {"status":"offer_accepted","label":"Offer Accepted","timestamp":"2026-07-24T11:00:00Z","detail":"Sunita Devi accepted Punjab Agri Collective offer.","completed":true,"active":false},
   {"status":"money_deposited","label":"Payment Secured","timestamp":"2026-07-25T08:45:00Z","detail":"₹3,30,000 secured in KrishiMitra escrow.","completed":true,"active":false},
   {"status":"transport_assigned","label":"Transport Assigned","timestamp":"2026-07-26T14:00:00Z","detail":"Vehicle HR-05-AB-2345 assigned. Driver: Rakesh Kumar.","completed":true,"active":false},
   {"status":"pickup_scheduled","label":"Pickup Scheduled","timestamp":"2026-07-27T10:00:00Z","detail":"Pickup confirmed for 28 Jul at 8:00 AM at Nissing farm gate.","completed":true,"active":false},
   {"status":"delivered","label":"Delivered","timestamp":"2026-07-29T15:00:00Z","detail":"150 qtl delivered and quality verified at Ludhiana warehouse.","completed":true,"active":false},
   {"status":"payment_released","label":"Payment Released","timestamp":"2026-07-30T11:00:00Z","detail":"₹3,30,000 transferred to bank account ending 0002.","completed":true,"active":true}
 ]'::jsonb,
 NOW()-INTERVAL'44 days', NOW()-INTERVAL'5 days'),

-- Deal 3: Tomato – pickup_scheduled (in transit)
('40000000-0000-0000-0000-000000000003',
 'KM-2026-10004','30000000-0000-0000-0000-000000000006',
 '10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002',
 'Tomato','Hybrid F1',80,'qtl',2520,201600,201600,
 'pickup_scheduled',
 '{"vehicle_number":"MH-04-CD-5678","driver_name":"Santosh Pawar","driver_phone":"+919977665544","pickup_date":"2026-09-09","pickup_time":"06:00","estimated_delivery":"2026-09-09"}'::jsonb,
 '[
   {"status":"offer_accepted","label":"Offer Accepted","timestamp":"2026-09-02T09:00:00Z","detail":"Kavitha Raju accepted FreshMart Retail offer of ₹2,520/qtl.","completed":true,"active":false},
   {"status":"money_deposited","label":"Payment Secured","timestamp":"2026-09-03T10:00:00Z","detail":"₹2,01,600 secured in KrishiMitra escrow.","completed":true,"active":false},
   {"status":"transport_assigned","label":"Transport Assigned","timestamp":"2026-09-04T12:00:00Z","detail":"Reefer vehicle MH-04-CD-5678 assigned. Driver: Santosh Pawar.","completed":true,"active":false},
   {"status":"pickup_scheduled","label":"Pickup Scheduled","timestamp":"2026-09-06T14:00:00Z","detail":"Pickup confirmed for 9 Sep at 6:00 AM at Hoskote farm.","completed":true,"active":true},
   {"status":"delivered","label":"Delivered","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"payment_released","label":"Payment Released","timestamp":null,"detail":null,"completed":false,"active":false}
 ]'::jsonb,
 NOW()-INTERVAL'7 days', NOW()-INTERVAL'2 days'),

-- Deal 4: Soybean – delivered (awaiting payment release)
('40000000-0000-0000-0000-000000000004',
 'KM-2026-10008','30000000-0000-0000-0000-000000000012',
 '10000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000006',
 'Soybean','JS-335',250,'qtl',4720,1180000,1180000,
 'delivered',
 '{"vehicle_number":"MP-09-EF-1234","driver_name":"Mohan Das","driver_phone":"+919966554433","pickup_date":"2026-08-22","pickup_time":"09:00","estimated_delivery":"2026-08-23"}'::jsonb,
 '[
   {"status":"offer_accepted","label":"Offer Accepted","timestamp":"2026-08-18T10:00:00Z","detail":"Meena Kumari accepted Spice Garden Foods offer of ₹4,720/qtl.","completed":true,"active":false},
   {"status":"money_deposited","label":"Payment Secured","timestamp":"2026-08-19T09:00:00Z","detail":"₹11,80,000 secured in KrishiMitra escrow.","completed":true,"active":false},
   {"status":"transport_assigned","label":"Transport Assigned","timestamp":"2026-08-20T11:00:00Z","detail":"Vehicle MP-09-EF-1234 assigned. Driver: Mohan Das.","completed":true,"active":false},
   {"status":"pickup_scheduled","label":"Pickup Scheduled","timestamp":"2026-08-21T14:00:00Z","detail":"Pickup confirmed for 22 Aug at 9:00 AM at Dewas mandi.","completed":true,"active":false},
   {"status":"delivered","label":"Delivered","timestamp":"2026-08-23T16:00:00Z","detail":"250 qtl delivered. Moisture test passed at Spice Garden mill.","completed":true,"active":true},
   {"status":"payment_released","label":"Payment Released","timestamp":null,"detail":null,"completed":false,"active":false}
 ]'::jsonb,
 NOW()-INTERVAL'19 days', NOW()-INTERVAL'2 days'),

-- Deal 5: Pomegranate – transport_assigned
('40000000-0000-0000-0000-000000000005',
 'KM-2026-10010','30000000-0000-0000-0000-000000000013',
 '10000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000005',
 'Pomegranate','Bhagwa',40,'qtl',9300,372000,372000,
 'transport_assigned',
 '{"vehicle_number":"MH-15-GH-9012","driver_name":"Vijay Kale","driver_phone":"+919955443322","pickup_date":"2026-09-10","pickup_time":"07:00","estimated_delivery":"2026-09-10"}'::jsonb,
 '[
   {"status":"offer_accepted","label":"Offer Accepted","timestamp":"2026-09-01T11:00:00Z","detail":"Priya Nair accepted National Agri Exports offer of ₹9,300/qtl.","completed":true,"active":false},
   {"status":"money_deposited","label":"Payment Secured","timestamp":"2026-09-02T10:00:00Z","detail":"₹3,72,000 secured in KrishiMitra escrow.","completed":true,"active":false},
   {"status":"transport_assigned","label":"Transport Assigned","timestamp":"2026-09-05T13:00:00Z","detail":"Reefer vehicle MH-15-GH-9012 assigned. Pickup on 10 Sep.","completed":true,"active":true},
   {"status":"pickup_scheduled","label":"Pickup Scheduled","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"delivered","label":"Delivered","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"payment_released","label":"Payment Released","timestamp":null,"detail":null,"completed":false,"active":false}
 ]'::jsonb,
 NOW()-INTERVAL'11 days', NOW()-INTERVAL'3 days'),

-- Deal 6: Potato – offer_accepted (money not yet deposited)
('40000000-0000-0000-0000-000000000006',
 'KM-2026-10003','30000000-0000-0000-0000-000000000003',
 '10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000007',
 'Potato','Jyoti',500,'qtl',870,435000,435000,
 'offer_accepted', NULL,
 '[
   {"status":"offer_accepted","label":"Offer Accepted","timestamp":"2026-09-07T14:00:00Z","detail":"Mohan Verma accepted Delhi Grain Merchants offer of ₹870/qtl.","completed":true,"active":true},
   {"status":"money_deposited","label":"Payment Secured","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"transport_assigned","label":"Transport Assigned","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"pickup_scheduled","label":"Pickup Scheduled","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"delivered","label":"Delivered","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"payment_released","label":"Payment Released","timestamp":null,"detail":null,"completed":false,"active":false}
 ]'::jsonb,
 NOW()-INTERVAL'1 day', NOW()-INTERVAL'1 day')

ON CONFLICT (id) DO NOTHING;

-- Sync offer status for deal-6 potato (accepted above but offer row still pending)
UPDATE public.offers SET status='accepted'
WHERE id='30000000-0000-0000-0000-000000000003';

-- =============================================================================
-- SECTION 6: ESCROW TRANSACTIONS
-- =============================================================================

INSERT INTO public.escrow_transactions
  (id, deal_id, lot_id, buyer_id, farmer_id, amount, status,
   deposited_at, released_at, expected_release_date,
   transaction_ref, bank_account, created_at)
VALUES

-- Escrow 1: Onion deal – protected (money deposited, waiting for pickup)
('50000000-0000-0000-0000-000000000001',
 '40000000-0000-0000-0000-000000000001','KM-2026-10001',
 '20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',
 324000,'protected',
 NOW()-INTERVAL'12 days', NULL, NOW()+INTERVAL'5 days',
 'TXN-KM-2026-001001','39012300000001',
 NOW()-INTERVAL'12 days'),

-- Escrow 2: Wheat deal – released (completed)
('50000000-0000-0000-0000-000000000002',
 '40000000-0000-0000-0000-000000000002','KM-2026-10002',
 '20000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000002',
 330000,'released',
 NOW()-INTERVAL'43 days', NOW()-INTERVAL'5 days', NOW()-INTERVAL'5 days',
 'TXN-KM-2026-001002','39012300000002',
 NOW()-INTERVAL'43 days'),

-- Escrow 3: Tomato deal – protected (pickup scheduled)
('50000000-0000-0000-0000-000000000003',
 '40000000-0000-0000-0000-000000000003','KM-2026-10004',
 '20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004',
 201600,'protected',
 NOW()-INTERVAL'5 days', NULL, NOW()+INTERVAL'3 days',
 'TXN-KM-2026-001003','39012300000004',
 NOW()-INTERVAL'5 days'),

-- Escrow 4: Soybean deal – release_pending (delivered, pending farmer confirmation)
('50000000-0000-0000-0000-000000000004',
 '40000000-0000-0000-0000-000000000004','KM-2026-10008',
 '20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000008',
 1180000,'release_pending',
 NOW()-INTERVAL'19 days', NULL, NOW()+INTERVAL'1 day',
 'TXN-KM-2026-001004','39012300000008',
 NOW()-INTERVAL'19 days'),

-- Escrow 5: Pomegranate deal – protected (transport assigned)
('50000000-0000-0000-0000-000000000005',
 '40000000-0000-0000-0000-000000000005','KM-2026-10010',
 '20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000010',
 372000,'protected',
 NOW()-INTERVAL'6 days', NULL, NOW()+INTERVAL'7 days',
 'TXN-KM-2026-001005','39012300000010',
 NOW()-INTERVAL'6 days')

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 7: GRIEVANCES  (3 complaints at different stages)
-- =============================================================================

INSERT INTO public.grievances
  (id, reporter_id, deal_id, lot_id, type, title, description,
   status, escrow_amount, evidence_urls, resolution_note,
   timeline, priority, created_at, updated_at)
VALUES

-- GRV-1: Weight dispute on completed wheat deal (Sunita vs Punjab Collective)
('GRV-2026-001',
 '10000000-0000-0000-0000-000000000002',
 '40000000-0000-0000-0000-000000000002','KM-2026-10002',
 'weight_dispute',
 'Wheat weight short at destination warehouse',
 'I sent 150 qtl as confirmed by mandi weighbridge at Karnal, but Punjab Agri Collective received only 147 qtl at their Ludhiana warehouse — a 3 qtl shortage worth ₹6,600. I request reimbursement from escrow before final release.',
 'under_review', 6600,
 '{"weighbridge_slip.jpg","invoice_copy.pdf"}',
 NULL,
 '[
   {"status":"submitted","label":"Grievance Filed","timestamp":"2026-07-31T09:00:00Z","detail":"Sunita Devi filed weight dispute after delivery.","completed":true,"active":false},
   {"status":"under_review","label":"Under Review","timestamp":"2026-08-01T10:00:00Z","detail":"Admin assigned to review weighbridge slips from both ends.","completed":true,"active":true},
   {"status":"evidence_requested","label":"Evidence Requested","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"resolution","label":"Resolution","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"closed","label":"Closed","timestamp":null,"detail":null,"completed":false,"active":false}
 ]'::jsonb,
 'high', NOW()-INTERVAL'8 days', NOW()-INTERVAL'7 days'),

-- GRV-2: Payment issue on soybean deal (Meena vs Spice Garden – escrow delay)
('GRV-2026-002',
 '10000000-0000-0000-0000-000000000008',
 '40000000-0000-0000-0000-000000000004','KM-2026-10008',
 'payment_issue',
 'Escrow payment not released after delivery confirmation',
 'Delivery was completed on 23 Aug and quality verified by buyer. It has been 16 days and ₹11,80,000 is still in escrow. Buyer has not clicked "Confirm Release". I need the platform to intervene and release my payment.',
 'resolution', 1180000,
 '{"delivery_receipt.jpg"}',
 'Platform admin reviewed delivery confirmation logs. Buyer notified to release payment within 24 hours or auto-release will be triggered.',
 '[
   {"status":"submitted","label":"Grievance Filed","timestamp":"2026-09-05T08:00:00Z","detail":"Meena Kumari filed payment delay complaint.","completed":true,"active":false},
   {"status":"under_review","label":"Under Review","timestamp":"2026-09-05T14:00:00Z","detail":"Admin reviewing escrow and delivery logs.","completed":true,"active":false},
   {"status":"evidence_requested","label":"Evidence Checked","timestamp":"2026-09-06T10:00:00Z","detail":"Delivery receipt verified. Buyer contacted.","completed":true,"active":false},
   {"status":"resolution","label":"Resolution Issued","timestamp":"2026-09-07T11:00:00Z","detail":"Auto-release scheduled for 9 Sep if buyer does not act.","completed":true,"active":true},
   {"status":"closed","label":"Closed","timestamp":null,"detail":null,"completed":false,"active":false}
 ]'::jsonb,
 'urgent', NOW()-INTERVAL'3 days', NOW()-INTERVAL'1 day'),

-- GRV-3: Quality dispute from buyer on tomato (FreshMart disputes tomato quality)
('GRV-2026-003',
 '20000000-0000-0000-0000-000000000002',
 '40000000-0000-0000-0000-000000000003','KM-2026-10004',
 'quality_dispute',
 'Tomatoes arrived with 15% overripe, not matching Grade A claim',
 'The lot KM-2026-10004 was listed as Grade A Hybrid F1 tomatoes. On delivery, our QC team found approximately 15% of the lot (12 qtl) to be overripe or cracked, not meeting Grade A standards. We request partial escrow refund of ₹30,240 (12 qtl × ₹2,520).',
 'submitted', 30240,
 '{}',
 NULL,
 '[
   {"status":"submitted","label":"Grievance Filed","timestamp":"2026-09-08T07:00:00Z","detail":"FreshMart Retail filed quality dispute on tomato delivery.","completed":true,"active":true},
   {"status":"under_review","label":"Under Review","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"evidence_requested","label":"Evidence Requested","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"resolution","label":"Resolution","timestamp":null,"detail":null,"completed":false,"active":false},
   {"status":"closed","label":"Closed","timestamp":null,"detail":null,"completed":false,"active":false}
 ]'::jsonb,
 'medium', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 8: NOTIFICATIONS
-- =============================================================================

INSERT INTO public.notifications
  (user_id, type, title, body, read, link_to, created_at)
VALUES

-- Ramesh Patil (farmer 1) – offer notifications
('10000000-0000-0000-0000-000000000001','offer',
 'New offer received on your Onion lot',
 'Agro Processors Ltd has offered ₹1,620/qtl for 200 qtl of your Onion (KM-2026-10001). Review and respond.',
 TRUE,'/farmer/lots/KM-2026-10001', NOW()-INTERVAL'13 days'),

('10000000-0000-0000-0000-000000000001','deal',
 'Payment of ₹3,24,000 secured in escrow',
 'Agro Processors Ltd deposited ₹3,24,000 into escrow for your Onion deal. Your crop is now protected.',
 TRUE,'/farmer/deals', NOW()-INTERVAL'12 days'),

-- Sunita Devi (farmer 2) – completed deal + grievance
('10000000-0000-0000-0000-000000000002','payment',
 '₹3,30,000 transferred to your account',
 'Payment for Wheat lot KM-2026-10002 has been released. Check your bank account ending 0002.',
 TRUE,'/farmer/deals', NOW()-INTERVAL'5 days'),

('10000000-0000-0000-0000-000000000002','complaint',
 'Your weight dispute is under review',
 'Admin is reviewing the weight discrepancy for GRV-2026-001. Expected resolution in 2-3 working days.',
 FALSE,'/farmer/grievances', NOW()-INTERVAL'7 days'),

-- Mohan Verma (farmer 3) – offer accepted
('10000000-0000-0000-0000-000000000003','offer',
 'Your Potato lot has 3 offers',
 'Your Potato lot KM-2026-10003 has received 3 buyer offers. Best offer: ₹870/qtl. Review now.',
 FALSE,'/farmer/lots/KM-2026-10003', NOW()-INTERVAL'2 days'),

('10000000-0000-0000-0000-000000000003','deal',
 'Deal confirmed with Delhi Grain Merchants',
 'You accepted Delhi Grain Merchants offer of ₹870/qtl for 500 qtl of Potato. Awaiting escrow deposit.',
 FALSE,'/farmer/deals', NOW()-INTERVAL'1 day'),

-- Meena Kumari (farmer 8) – payment grievance
('10000000-0000-0000-0000-000000000008','complaint',
 'Platform intervening on payment delay',
 'Admin has issued a resolution on GRV-2026-002. Auto-release of ₹11,80,000 scheduled for 9 Sep 2026.',
 FALSE,'/farmer/grievances', NOW()-INTERVAL'1 day'),

-- Priya Nair (farmer 10) – transport
('10000000-0000-0000-0000-000000000010','deal',
 'Transport assigned for your Pomegranate lot',
 'Vehicle MH-15-GH-9012 (Driver: Vijay Kale) will pick up 40 qtl of Bhagwa Pomegranate on 10 Sep at 7 AM.',
 FALSE,'/farmer/deals', NOW()-INTERVAL'3 days'),

-- Agro Processors (buyer 1) – offer rejected
('20000000-0000-0000-0000-000000000001','offer',
 'Your offer on Pomegranate was not accepted',
 'Priya Nair did not accept your offer of ₹9,100/qtl for lot KM-2026-10010. The lot was awarded to another buyer.',
 TRUE,'/buyer/marketplace', NOW()-INTERVAL'9 days'),

-- FreshMart (buyer 2) – deal + grievance filed
('20000000-0000-0000-0000-000000000002','deal',
 'Tomato pickup confirmed for 9 Sep',
 'Pickup for KM-2026-10004 is confirmed. Your vehicle MH-04-CD-5678 departs at 6 AM from Hoskote.',
 FALSE,'/buyer/marketplace', NOW()-INTERVAL'2 days'),

('20000000-0000-0000-0000-000000000002','complaint',
 'Quality dispute submitted — GRV-2026-003',
 'Your quality dispute for Tomato lot KM-2026-10004 has been filed. Admin will review within 24 hours.',
 FALSE,'/buyer/grievances', NOW()),

-- National Agri Exports (buyer 5) – active offer
('20000000-0000-0000-0000-000000000005','offer',
 'Your Grapes offer is still pending',
 'Your offer of ₹5,600/qtl on Anjali Bhosle Grapes lot (KM-2026-10006) expires in 2 days. Contact the farmer.',
 FALSE,'/buyer/marketplace', NOW()-INTERVAL'1 day')

;

-- =============================================================================
-- SECTION 9: MARKET PRICES — add 30-day price_history + 4 new crops
-- =============================================================================

-- Update existing records with generated price history
UPDATE public.market_prices SET
  price_history = public._demo_price_history(current_price, trend)
WHERE price_history = '[]'::jsonb OR price_history IS NULL;

-- Add 4 new crops not in original seed
INSERT INTO public.market_prices
  (crop, variety, mandi, current_price, unit, trend, delta, delta_percent,
   msp, demand_level, source)
VALUES
  ('Bajra',       'HHB-67',     'Pune APMC',       2350, 'qtl', 'up',    80,  3.5, 2350, 'medium', 'Agmarknet'),
  ('Jowar',       'SPV-2215',   'Latur APMC',      3100, 'qtl', 'flat',  20,  0.6, 3180, 'low',    'Agmarknet'),
  ('Groundnut',   'TAG-24',     'Akola APMC',      6400, 'qtl', 'up',   200,  3.2, 6377, 'high',   'Agmarknet'),
  ('Turmeric',    'Salem',      'Sangli APMC',    14800, 'qtl', 'up',   600,  4.2, 7000, 'high',   'Agmarknet')
ON CONFLICT DO NOTHING;

-- Generate price history for the newly inserted rows too
UPDATE public.market_prices SET
  price_history = public._demo_price_history(current_price, trend)
WHERE price_history = '[]'::jsonb;

-- =============================================================================
-- CLEANUP helper (keep function available for future seed refreshes)
-- =============================================================================
-- DROP FUNCTION IF EXISTS public._demo_price_history(NUMERIC, TEXT, INT);
-- (Uncomment above to remove helper after seeding if desired.)

-- =============================================================================
-- ROLLBACK REFERENCE
-- To reverse all demo data run: supabase/seeds/rollback_demo_seed.sql
-- or execute:
--
--   DELETE FROM auth.users WHERE id LIKE '10000000%' OR id LIKE '20000000%';
--   DELETE FROM public.lots WHERE id LIKE 'KM-2026-1000%';
--   DELETE FROM public.offers WHERE id LIKE '30000000%';
--   DELETE FROM public.deals WHERE id LIKE '40000000%';
--   DELETE FROM public.escrow_transactions WHERE id LIKE '50000000%';
--   DELETE FROM public.grievances WHERE id LIKE 'GRV-2026%';
--   DROP FUNCTION IF EXISTS public._demo_price_history(NUMERIC, TEXT, INT);
--   -- market_prices price_history cannot be auto-rolled back; reset manually.
-- =============================================================================
