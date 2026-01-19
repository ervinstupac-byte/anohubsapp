-- Create a lightweight reports table to store generated PDF metadata
BEGIN;

CREATE TABLE IF NOT EXISTS public.reports (
  id bigserial PRIMARY KEY,
  file_name text NOT NULL,
  file_path text NOT NULL,
  content_type text DEFAULT 'application/pdf',
  size_bytes bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  created_by text
);

-- Example: grant insert/select to service role if needed
-- GRANT SELECT, INSERT ON public.reports TO service_role;

COMMIT;

-- NOTE: If you use Supabase Storage (buckets), create the bucket via supabase CLI or the Storage API.
-- Example (supabase CLI): `supabase storage create-bucket reports --public`.
