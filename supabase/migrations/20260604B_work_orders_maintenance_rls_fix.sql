-- ============================================================================
-- NC-76.7: WORK ORDERS + MAINTENANCE LOGS + GUEST RLS FIX
-- Generated: 2026-06-04 (Part B)
-- Purpose:
--   1. Create work_orders table  (queried by MaintenanceContext / useMaintenanceStore)
--   2. Create maintenance_logs table (queried by MaintenanceContext / useMaintenanceStore)
--   3. Add anon (guest) RLS policies so DatabaseSeeder can INSERT demo assets
--      and read them without authentication errors.
-- ============================================================================

-- ============================================================================
-- 1. WORK ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.work_orders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id                UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    asset_name              TEXT,
    component               TEXT NOT NULL,
    description             TEXT,
    priority                TEXT DEFAULT 'MEDIUM',          -- HIGH | MEDIUM | LOW
    status                  TEXT DEFAULT 'PENDING',         -- PENDING | IN_PROGRESS | COMPLETED | CANCELLED | SEALED
    trigger_source          TEXT DEFAULT 'MANUAL',          -- MANUAL | AI_PREDICTION | SERVICE_ALERT
    assigned_technician     TEXT,
    required_parts          JSONB,                          -- array of part codes
    estimated_hours         DOUBLE PRECISION,
    completion_notes        TEXT,
    completed_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users – full access
CREATE POLICY "work_orders: auth read"
    ON public.work_orders FOR SELECT
    USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "work_orders: auth insert"
    ON public.work_orders FOR INSERT
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "work_orders: auth update"
    ON public.work_orders FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "work_orders: auth delete"
    ON public.work_orders FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- 2. MAINTENANCE LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             TEXT NOT NULL,
    asset_id            UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    technician          TEXT,
    comment_bs          TEXT,                               -- original language (Bosnian)
    summary_de          TEXT,                               -- auto-translated German
    measured_value      DOUBLE PRECISION,
    pass                BOOLEAN DEFAULT TRUE,
    proof_image_url     TEXT,
    timestamp           TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_logs: read"
    ON public.maintenance_logs FOR SELECT
    USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "maintenance_logs: insert"
    ON public.maintenance_logs FOR INSERT
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "maintenance_logs: update"
    ON public.maintenance_logs FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. GUEST (ANON) RLS FIX: assets & audit_logs
--    DatabaseSeeder runs as anon; without SELECT + INSERT anon can never
--    seed the demo fleet and the app always shows empty state for guests.
-- ============================================================================

-- Drop old authenticated-only policies (IF EXISTS so re-runs are safe)
DROP POLICY IF EXISTS "Authenticated users can read assets"   ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can insert assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON public.assets;

-- Replace: allow anon SELECT (guest can read demo fleet)
--          allow anon INSERT  (seeder can create demo turbines on first boot)
CREATE POLICY "assets: anon read"
    ON public.assets FOR SELECT
    USING (true);                                           -- public catalogue

CREATE POLICY "assets: anon insert"
    ON public.assets FOR INSERT
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "assets: auth update"
    ON public.assets FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "assets: auth delete"
    ON public.assets FOR DELETE
    USING (auth.role() = 'authenticated');

-- audit_logs: allow anon INSERT so the seeder can record its own activity
DROP POLICY IF EXISTS "Authenticated users can read audit_logs"   ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit_logs" ON public.audit_logs;

CREATE POLICY "audit_logs: anon read"
    ON public.audit_logs FOR SELECT
    USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "audit_logs: anon insert"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));

-- ============================================================================
-- 4. INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_id    ON public.work_orders (asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status      ON public.work_orders (status);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at  ON public.work_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_task   ON public.maintenance_logs (task_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_ts     ON public.maintenance_logs (timestamp DESC);
