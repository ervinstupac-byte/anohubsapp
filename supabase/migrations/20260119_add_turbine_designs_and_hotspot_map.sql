-- Migration: Add `turbine_designs` table and ensure `hotspot_map` JSONB column
-- Created: 2026-01-19

-- Create the table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.turbine_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    engineer_id TEXT,
    design_name TEXT,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    parameters JSONB DEFAULT '{}',
    calculations JSONB DEFAULT '{}',
    recommended_turbine TEXT,
    -- Visual to DB mapping for UI hotspots -> part ids / sensor paths
    hotspot_map JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If the table exists but column missing, add the column safely
ALTER TABLE public.turbine_designs
    ADD COLUMN IF NOT EXISTS hotspot_map JSONB DEFAULT '{}'::jsonb;

-- Indexes for efficient retrieval by asset and time-ordered reads
CREATE INDEX IF NOT EXISTS idx_turbine_designs_asset_time ON public.turbine_designs(asset_id, created_at DESC);

-- Enable RLS and basic policies consistent with existing schema conventions
ALTER TABLE public.turbine_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for all" ON public.turbine_designs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated" ON public.turbine_designs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Comment for maintainers
COMMENT ON TABLE public.turbine_designs IS 'Stored turbine design snapshots and calculation outputs. Includes hotspot_map JSONB for UI <-> DB mapping.';

-- End migration
