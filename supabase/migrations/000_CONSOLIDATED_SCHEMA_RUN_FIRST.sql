-- =====================================================
-- ANOHUB HPP RISK EXCELLENCE PLATFORM - FULL SCHEMA
-- =====================================================
-- Run this entire file in your Supabase SQL Editor to create all required tables!
-- =====================================================

-- =====================================================
-- PART 1: CORE ASSET & TURBINE TABLES
-- =====================================================

-- Turbine Family Types
DO $$ BEGIN
    CREATE TYPE turbine_family_enum AS ENUM ('kaplan', 'francis', 'pelton', 'crossflow');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Turbine Variant Types (Specific Configurations)
DO $$ BEGIN
    CREATE TYPE turbine_variant_enum AS ENUM (
        -- Kaplan Family (6 variants)
        'kaplan_vertical', 'kaplan_horizontal', 'kaplan_pit', 'kaplan_bulb', 'kaplan_s', 'kaplan_spiral',
        -- Francis Family
        'francis_vertical', 'francis_horizontal', 'francis_slow_runner', 'francis_fast_runner',
        -- Pelton Family
        'pelton_vertical', 'pelton_horizontal', 'pelton_multi_jet',
        -- Crossflow
        'crossflow_standard'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Turbine Families Master Table
CREATE TABLE IF NOT EXISTS public.turbine_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family turbine_family_enum NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    default_tolerances JSONB NOT NULL DEFAULT '{}',
    sensor_schema JSONB NOT NULL DEFAULT '{}',
    forensics_patterns JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turbine Variants (Specific Configurations)
CREATE TABLE IF NOT EXISTS public.turbine_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant turbine_variant_enum NOT NULL UNIQUE,
    family turbine_family_enum NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    design_parameters JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets (Hydropower Turbines)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    turbine_family turbine_family_enum,
    turbine_variant turbine_variant_enum,
    location TEXT,
    lat NUMERIC,
    lng NUMERIC,
    power_output NUMERIC,
    status TEXT DEFAULT 'OFFLINE',
    specs JSONB,
    operating_hours DECIMAL DEFAULT 0,
    maintenance_threshold DECIMAL DEFAULT 8000,
    last_maintenance_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if assets table already exists
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS turbine_family turbine_family_enum,
ADD COLUMN IF NOT EXISTS turbine_variant turbine_variant_enum,
ADD COLUMN IF NOT EXISTS operating_hours DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_threshold DECIMAL DEFAULT 8000,
ADD COLUMN IF NOT EXISTS last_maintenance_at TIMESTAMPTZ;

-- Index for assets
CREATE INDEX IF NOT EXISTS idx_assets_family ON public.assets(turbine_family);
CREATE INDEX IF NOT EXISTS idx_assets_variant ON public.assets(turbine_variant);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);

-- RLS for assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.assets FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for authenticated" ON public.assets FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable update for authenticated" ON public.assets FOR UPDATE TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PART 2: MAINTENANCE & WORK ORDERS
-- =====================================================

-- Maintenance Logs
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    hours_at_service DECIMAL NOT NULL,
    digital_seal_hash TEXT,
    engineer_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Additional columns for MaintenanceContext
    task_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    technician TEXT,
    comment_bs TEXT,
    summary_de TEXT,
    measured_value NUMERIC,
    pass BOOLEAN,
    proof_image_url TEXT
);

-- Add missing maintenance logs columns (if table already exists)
ALTER TABLE public.maintenance_logs
ADD COLUMN IF NOT EXISTS task_id TEXT,
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS technician TEXT,
ADD COLUMN IF NOT EXISTS comment_bs TEXT,
ADD COLUMN IF NOT EXISTS summary_de TEXT,
ADD COLUMN IF NOT EXISTS measured_value NUMERIC,
ADD COLUMN IF NOT EXISTS pass BOOLEAN,
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- Indexes for maintenance_logs
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON public.maintenance_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_created_at ON public.maintenance_logs(created_at DESC);

-- RLS for maintenance_logs
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.maintenance_logs FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for authenticated" ON public.maintenance_logs FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Work Orders
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id),
    title TEXT NOT NULL,
    issue_type TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SEALED')),
    assigned_to UUID,
    verified_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Additional columns for MaintenanceContext
    asset_name TEXT,
    component TEXT,
    description TEXT,
    priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    trigger_source TEXT,
    assigned_technician TEXT,
    estimated_hours NUMERIC,
    completion_notes TEXT,
    completed_at TIMESTAMPTZ
);

-- Add missing work orders columns (if table already exists)
ALTER TABLE public.work_orders
ADD COLUMN IF NOT EXISTS asset_name TEXT,
ADD COLUMN IF NOT EXISTS component TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
ADD COLUMN IF NOT EXISTS trigger_source TEXT,
ADD COLUMN IF NOT EXISTS assigned_technician TEXT,
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC,
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Work Order Steps
CREATE TABLE IF NOT EXISTS public.work_order_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    target_value NUMERIC,
    unit TEXT,
    required_tools JSONB DEFAULT '[]'::jsonb,
    required_consumables JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    actual_value NUMERIC,
    worker_notes TEXT,
    completed_at TIMESTAMPTZ
);

-- Indexes for work orders
CREATE INDEX IF NOT EXISTS idx_work_orders_asset ON public.work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_order_steps_order ON public.work_order_steps(order_id);

-- RLS for work orders
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.work_orders FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for authenticated" ON public.work_orders FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.work_order_steps ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.work_order_steps FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for authenticated" ON public.work_order_steps FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PART 3: THRESHOLD CONFIGURATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.threshold_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    vibration_mm_s NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threshold_configs_asset ON public.threshold_configs(asset_id);

ALTER TABLE public.threshold_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.threshold_configs FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for authenticated" ON public.threshold_configs FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PART 4: DIAGNOSTIC SNAPSHOTS (FROM PHASE 2)
-- =====================================================
DO $$ BEGIN
    CREATE TYPE diagnostic_lab_enum AS ENUM (
        'SYSTEM_PREDICTION',
        'VIBRATION_ANALYSIS',
        'GOVERNOR_DEADBAND',
        'GENERATOR_AIR_GAP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.diagnostic_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    lab_type diagnostic_lab_enum NOT NULL,
    input_parameters JSONB NOT NULL DEFAULT '{}',
    diagnostic_results JSONB NOT NULL DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for diagnostic snapshots
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_asset ON public.diagnostic_snapshots(asset_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_lab_type ON public.diagnostic_snapshots(lab_type);
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_created_at ON public.diagnostic_snapshots(created_at DESC);

-- RLS for diagnostic snapshots
ALTER TABLE public.diagnostic_snapshots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.diagnostic_snapshots FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for authenticated" ON public.diagnostic_snapshots FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PART 5: AUDIT LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID,
    action TEXT,
    target TEXT,
    status TEXT,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_operator ON public.audit_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.audit_logs FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for authenticated" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PART 6: INVENTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    quantity INTEGER DEFAULT 0,
    unit TEXT,
    location TEXT,
    specs JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_assets_type ON public.inventory_assets(type);

ALTER TABLE public.inventory_assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.inventory_assets FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for authenticated" ON public.inventory_assets FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- SEED DATA: SAMPLE ASSET
-- =====================================================
INSERT INTO public.assets (id, name, type, turbine_family, turbine_variant, location, lat, lng, power_output, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Sample Francis Turbine #1',
    'Hydro Turbine',
    'francis',
    'francis_vertical',
    'Demo Power Plant',
    45.0,
    -75.0,
    10000,
    'ONLINE'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.threshold_configs (asset_id, vibration_mm_s)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    4.5
) ON CONFLICT DO NOTHING;
