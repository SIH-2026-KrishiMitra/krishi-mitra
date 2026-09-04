-- ─────────────────────────────────────────────────────────────────────────────
-- KrishiMitra: Storage bucket policies
-- Run AFTER 002_main_schema.sql
-- Note: Create the buckets first via Supabase dashboard or CLI:
--   supabase storage create lot-images --public
--   supabase storage create grievance-evidence
--   supabase storage create profile-photos --public
-- Then apply these RLS policies.
-- ─────────────────────────────────────────────────────────────────────────────

-- lot-images: public read, farmer write to own folder
INSERT INTO storage.buckets (id, name, public)
VALUES ('lot-images', 'lot-images', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "lot_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lot-images');

CREATE POLICY "lot_images_farmer_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lot-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer'
    )
  );

CREATE POLICY "lot_images_farmer_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lot-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- grievance-evidence: private, owner + admin
INSERT INTO storage.buckets (id, name, public)
VALUES ('grievance-evidence', 'grievance-evidence', FALSE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "grievance_evidence_reporter_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'grievance-evidence'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "grievance_evidence_owner_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'grievance-evidence'
    AND (
      auth.uid()::TEXT = (storage.foldername(name))[1]
      OR public.is_admin()
    )
  );

-- profile-photos: public read, owner write
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "profile_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_photos_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
