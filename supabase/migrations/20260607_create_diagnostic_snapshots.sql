-- Diagnostic Snapshots Schema - Phase 2 State Persistence
-- Purpose: Store historical lab runs for asset degradation tracking

-- =====================================================
-- 1. ENUM FOR LAB TYPES
-- =====================================================
CREATE TYPE diagnostic_lab_enum AS ENUM (
    'SYSTEM_PREDICTION',
    'VIBRATION_ANALYSIS',
    'GOVERNOR_DEADBAND',
    'GENERATOR_AIR_GAP'
);

-- =====================================================
-- 2. DIAGNOSTIC SNAPSHOTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.diagnostic_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    lab_type diagnostic_lab_enum NOT NULL,
    input_parameters JSONB NOT NULL DEFAULT '{}',
    diagnostic_results JSONB NOT NULL DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_diagnostic_asset FOREIGN KEY (asset_id)
        REFERENCES public.assets(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. INDEXES FOR EFFICIENT QUERYING
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_asset ON public.diagnostic_snapshots(asset_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_lab_type ON public.diagnostic_snapshots(lab_type);
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_created_at ON public.diagnostic_snapshots(created_at DESC);

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================
ALTER TABLE public.diagnostic_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.diagnostic_snapshots FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.diagnostic_snapshots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated" ON public.diagnostic_snapshots FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 5. TRIGGER FOR AUTO-UPDATING updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.diagnostic_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

COMMENT ON TABLE public.diagnostic_snapshots IS 'Stores historical lab runs for asset degradation tracking';
