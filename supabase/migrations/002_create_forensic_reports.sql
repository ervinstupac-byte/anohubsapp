-- Supabase migration: Create forensic_reports table
-- Stores metadata for generated forensic dossiers and report artifacts

CREATE TABLE IF NOT EXISTS forensic_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL,
  created_by uuid,
  report_type text,
  storage_path text,
  status text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forensic_reports_asset_id ON forensic_reports(asset_id);
CREATE INDEX IF NOT EXISTS idx_forensic_reports_created_at ON forensic_reports(created_at DESC);
