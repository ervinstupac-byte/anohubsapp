-- Migration: create component_encyclopedia table
-- Run this on your Supabase/Postgres instance (requires privileges)

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.component_encyclopedia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name text NOT NULL UNIQUE,
  description text,
  physics_principle text,
  common_failure_modes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_component_encyclopedia_name ON public.component_encyclopedia (component_name);

-- Optional upsert helper
-- Example usage:
-- INSERT INTO public.component_encyclopedia (component_name, description, physics_principle, common_failure_modes)
-- VALUES ('runner', 'Long description...', 'Momentum transfer', '["fatigue","corrosion"]')
-- ON CONFLICT (component_name) DO UPDATE SET
--   description = EXCLUDED.description,
--   physics_principle = EXCLUDED.physics_principle,
--   common_failure_modes = EXCLUDED.common_failure_modes,
--   updated_at = now();
