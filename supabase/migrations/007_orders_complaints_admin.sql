-- Migration 007: Admin complaint priority + internal notes

-- Add priority for admin triage
ALTER TABLE public.grievances
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'grievances_priority_check'
  ) THEN
    ALTER TABLE public.grievances
      ADD CONSTRAINT grievances_priority_check
        CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
END $$;

-- Admin internal notes (append-only JSONB array, not exposed to farmers/buyers)
ALTER TABLE public.grievances
  ADD COLUMN IF NOT EXISTS admin_notes JSONB NOT NULL DEFAULT '[]'::jsonb;
