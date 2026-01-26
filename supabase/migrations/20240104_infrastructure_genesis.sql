-- INFRASTRUCTURE GENESIS: Project DNA & Engineering Clusters
-- Author: Antigravity (NC-4.2)

-- =====================================================
-- 1. PLANTS (The Site Identity)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    location_name TEXT,
    gps_lat NUMERIC,
    gps_lng NUMERIC,
    elevation_masl REAL, -- Meters above sea level
    ambient_temp_avg REAL DEFAULT 15.0,
    humidity_avg REAL DEFAULT 60.0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link existing assets to a default plant if not linked
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS plant_id UUID REFERENCES public.plants(id);

-- =====================================================
-- 2. HYDROLOGY_CONTEXT (Domain Knowledge)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.hydrology_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE UNIQUE,
    
    gross_head_m REAL NOT NULL,
    design_flow_cms REAL NOT NULL,
    ecological_flow_cms REAL DEFAULT 0,
    spillage_capacity_cms REAL,
    
    -- Flow Duration Curve data
    fdc_data JSONB DEFAULT '[]', -- [{"probability": 10, "flow": 12.5}, ...]
    
    hydrology_notes TEXT,
    last_survey_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. PIPE_SYSTEM (Darcy-Weisbach Reference)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pipe_system (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
    
    material TEXT NOT NULL DEFAULT 'STEEL', -- STEEL, GRP, PEHD
    diameter_mm REAL NOT NULL,
    length_m REAL NOT NULL,
    wall_thickness_mm REAL,
    roughness_ks REAL DEFAULT 0.045, -- mm
    elastic_modulus_gpa REAL DEFAULT 210.0, -- for Water Hammer
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TURBINE_BIDS (The 'Marketing Lie' Detector)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.turbine_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
    
    manufacturer TEXT NOT NULL,
    proposed_turbine_type TEXT,
    promised_efficiency REAL NOT NULL, -- e.g. 96.5
    price_eur NUMERIC,
    delivery_months INTEGER,
    
    -- Evaluated status
    eval_verdict TEXT DEFAULT 'PENDING', -- 'PLAUSIBLE', 'MARKETING_LIE', 'PHYSICALLY_IMPOSSIBLE'
    eval_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ASSET_OPERATIONAL_METRICS (Wear Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.asset_operational_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE UNIQUE,
    
    total_operating_hours REAL DEFAULT 0,
    hours_since_last_overhaul REAL DEFAULT 0,
    start_stop_count INTEGER DEFAULT 0,
    emergency_stops_count INTEGER DEFAULT 0,
    
    last_overhaul_date DATE,
    next_recommended_overhaul_hours REAL DEFAULT 40000,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.plants FOR SELECT USING (true);
CREATE POLICY "Enable write for admin" ON public.plants FOR ALL TO authenticated USING (true);

ALTER TABLE public.hydrology_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.hydrology_context FOR SELECT USING (true);

ALTER TABLE public.pipe_system ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.pipe_system FOR SELECT USING (true);

ALTER TABLE public.turbine_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.turbine_bids FOR SELECT USING (true);

ALTER TABLE public.asset_operational_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.asset_operational_history FOR SELECT USING (true);
CREATE POLICY "Enable update for system" ON public.asset_operational_history FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- 7. SEED INITIAL PLANT
-- =====================================================

INSERT INTO public.plants (name, location_name, gps_lat, gps_lng, elevation_masl)
VALUES ('HPP Benchmark No.1', 'Neretva River Basin', 43.65, 17.85, 250.0)
ON CONFLICT (name) DO NOTHING;

-- Map existing assets to the benchmark plant
DO $$
DECLARE
    v_plant_id UUID;
BEGIN
    SELECT id INTO v_plant_id FROM public.plants WHERE name = 'HPP Benchmark No.1' LIMIT 1;
    UPDATE public.assets SET plant_id = v_plant_id WHERE plant_id IS NULL;
END $$;
