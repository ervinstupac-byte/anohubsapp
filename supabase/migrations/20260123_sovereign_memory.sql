-- 1. Tablica za sirovu telemetriju (Batch writing iz Workera)
CREATE TABLE IF NOT EXISTS public.telemetry_samples (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    sensor_data JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Tablica za rezultate fizikalnih proračuna (Iz PhysicsEngine-a)
CREATE TABLE IF NOT EXISTS public.physics_results (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    physics_state JSONB NOT NULL,
    efficiency_score DECIMAL(5,2),
    molecular_debt_delta DECIMAL(10,6),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tablica za operativni status (HPP Status)
CREATE TABLE IF NOT EXISTS public.hpp_status (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    current_mode TEXT NOT NULL, -- npr. 'OPTIMAL', 'CAVITATION_RISK', 'MAINTENANCE'
    health_index DECIMAL(5,2) DEFAULT 100.00,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indeksi za visoke performanse (NC-9.0 standard)
CREATE INDEX IF NOT EXISTS idx_telemetry_asset_time ON public.telemetry_samples(asset_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_physics_asset_time ON public.physics_results(asset_id, timestamp DESC);

-- 5. Omogućavanje RLS-a (Security Lockdown)
ALTER TABLE public.telemetry_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physics_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hpp_status ENABLE ROW LEVEL SECURITY;

-- Primjer restriktivne polise (Samo autentificirani korisnici mogu čitati)
CREATE POLICY "Allow authenticated read access" ON public.telemetry_samples
    FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.physics_results IS 'Sovereign Core: Mathematical outputs for D_mol and NP calculations.';