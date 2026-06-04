-- ============================================================================
-- MISSING CORE TABLES MIGRATION (NC-76.6)
-- Generated: 2026-06-04
-- Purpose: Create all tables referenced in application code that were missing
--          from the Supabase migration history.
-- ============================================================================

-- ============================================================================
-- 1. ASSETS (CRITICAL - referenced everywhere, used as health-check table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    type                TEXT DEFAULT 'HPP',
    location            TEXT,
    lat                 DOUBLE PRECISION,
    lng                 DOUBLE PRECISION,
    power_output        DOUBLE PRECISION,
    status              TEXT DEFAULT 'Operational',
    turbine_type        TEXT,                           -- FRANCIS | PELTON | KAPLAN
    specs               JSONB,                          -- full turbine profile JSON
    owner_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read assets"   ON public.assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert assets" ON public.assets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update assets" ON public.assets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete assets" ON public.assets FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 2. ASSET_CONFIGS (per-asset configuration overrides)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.asset_configs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    key         TEXT NOT NULL,
    value       JSONB,
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (asset_id, key)
);

ALTER TABLE public.asset_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage asset_configs" ON public.asset_configs USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. AUDIT_LOGS (system-wide audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id TEXT,
    action      TEXT NOT NULL,
    target      TEXT,
    status      TEXT DEFAULT 'SUCCESS',
    details     JSONB,
    timestamp   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read audit_logs"   ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 4. HPP_STATUS (real-time operational status per asset)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hpp_status (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    status      TEXT DEFAULT 'OPTIMAL',
    payload     JSONB,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hpp_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage hpp_status" ON public.hpp_status USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5. EVENT_JOURNAL (immutable event log for all system events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_journal (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    event_type  TEXT NOT NULL,
    severity    TEXT DEFAULT 'INFO',         -- INFO | WARNING | CRITICAL
    source      TEXT,
    payload     JSONB,
    session_id  TEXT,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.event_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read event_journal"   ON public.event_journal FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert event_journal" ON public.event_journal FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS event_journal_asset_idx ON public.event_journal(asset_id);
CREATE INDEX IF NOT EXISTS event_journal_type_idx  ON public.event_journal(event_type);

-- ============================================================================
-- 6. TELEMETRY_HISTORY_CACHE (AIPredictionService read cache)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.telemetry_history_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    sensor_id       TEXT,
    value           DOUBLE PRECISION,
    unit            TEXT,
    quality         TEXT DEFAULT 'GOOD',
    snapshot_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.telemetry_history_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage telemetry_history_cache" ON public.telemetry_history_cache USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS telemetry_history_asset_idx ON public.telemetry_history_cache(asset_id);
CREATE INDEX IF NOT EXISTS telemetry_history_snap_idx  ON public.telemetry_history_cache(snapshot_at DESC);

-- ============================================================================
-- 7. ENRICHED_TELEMETRY (PersistenceLayer computed telemetry)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.enriched_telemetry (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    sensor_vector   JSONB,                  -- normalized sensor state map
    anomaly_score   DOUBLE PRECISION,
    fault_codes     TEXT[],
    efficiency      DOUBLE PRECISION,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.enriched_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage enriched_telemetry" ON public.enriched_telemetry USING (auth.role() = 'authenticated');

-- ============================================================================
-- 8. SOVEREIGN_LEDGER (immutable financial/sovereignty record)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sovereign_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    entry_type      TEXT NOT NULL,          -- INCOME | EXPENSE | TRANSFER | VALUATION
    amount          DOUBLE PRECISION,
    currency        TEXT DEFAULT 'EUR',
    description     TEXT,
    metadata        JSONB,
    signed_hash     TEXT,
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sovereign_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read sovereign_ledger"   ON public.sovereign_ledger FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert sovereign_ledger" ON public.sovereign_ledger FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 9. SOVEREIGNTY_CHAIN (cryptographic chain of custody)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sovereignty_chain (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    block_hash      TEXT NOT NULL,
    prev_hash       TEXT,
    payload         JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sovereignty_chain ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage sovereignty_chain" ON public.sovereignty_chain USING (auth.role() = 'authenticated');

-- ============================================================================
-- 10. SENSOR_REGISTRY (registered sensor metadata per asset)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sensor_registry (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    sensor_id       TEXT NOT NULL,
    sensor_type     TEXT,                   -- VIBRATION | TEMPERATURE | PRESSURE | FLOW
    unit            TEXT,
    description     TEXT,
    nominal_min     DOUBLE PRECISION,
    nominal_max     DOUBLE PRECISION,
    is_active       BOOLEAN DEFAULT TRUE,
    registered_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (asset_id, sensor_id)
);

ALTER TABLE public.sensor_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage sensor_registry" ON public.sensor_registry USING (auth.role() = 'authenticated');

-- ============================================================================
-- 11. INVENTORY (general inventory — distinct from inventory_assets)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    category        TEXT,
    quantity        INTEGER DEFAULT 0,
    unit            TEXT DEFAULT 'pcs',
    part_number     TEXT,
    location        TEXT,
    supplier        TEXT,
    unit_cost       DOUBLE PRECISION,
    reorder_level   INTEGER DEFAULT 5,
    asset_id        UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage inventory" ON public.inventory USING (auth.role() = 'authenticated');

-- ============================================================================
-- 12. SPARE_PARTS_INVENTORY (MaintenanceEngine spare parts lookup)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.spare_parts_inventory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number     TEXT NOT NULL,
    description     TEXT,
    quantity_on_hand INTEGER DEFAULT 0,
    reorder_point   INTEGER DEFAULT 2,
    unit_cost       DOUBLE PRECISION,
    supplier        TEXT,
    lead_time_days  INTEGER,
    asset_id        UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.spare_parts_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage spare_parts_inventory" ON public.spare_parts_inventory USING (auth.role() = 'authenticated');

-- ============================================================================
-- 13. PURCHASE_ORDERS (MasterIntelligenceEngine procurement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    item_name       TEXT NOT NULL,
    quantity        INTEGER DEFAULT 1,
    unit_cost       DOUBLE PRECISION,
    supplier        TEXT,
    status          TEXT DEFAULT 'PENDING',  -- PENDING | APPROVED | RECEIVED | CANCELLED
    ordered_by      UUID REFERENCES auth.users(id),
    ordered_at      TIMESTAMPTZ DEFAULT NOW(),
    expected_at     TIMESTAMPTZ
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage purchase_orders" ON public.purchase_orders USING (auth.role() = 'authenticated');

-- ============================================================================
-- 14. RISK_ASSESSMENTS (risk module persistence)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    risk_level      TEXT DEFAULT 'LOW',      -- LOW | MEDIUM | HIGH | CRITICAL
    critical_flags  INTEGER DEFAULT 0,
    score           DOUBLE PRECISION,
    answers         JSONB,
    assessed_by     UUID REFERENCES auth.users(id),
    assessed_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage risk_assessments" ON public.risk_assessments USING (auth.role() = 'authenticated');

-- ============================================================================
-- 15. DIAGNOSTIC_DRAFTS (in-progress diagnostic sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.diagnostic_drafts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    operator_id     UUID REFERENCES auth.users(id),
    draft_data      JSONB,
    status          TEXT DEFAULT 'IN_PROGRESS',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.diagnostic_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own diagnostic_drafts" ON public.diagnostic_drafts USING (auth.uid() = operator_id);

-- ============================================================================
-- 16. DIGITAL_INTEGRITY (integrity ledger — simple checks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.digital_integrity (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    check_type      TEXT NOT NULL,
    result          TEXT DEFAULT 'PASS',     -- PASS | FAIL | WARNING
    details         JSONB,
    checked_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.digital_integrity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage digital_integrity" ON public.digital_integrity USING (auth.role() = 'authenticated');

-- ============================================================================
-- 17. DIGITAL_INTEGRITY_LEDGER (immutable integrity audit chain)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.digital_integrity_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,
    hash            TEXT,
    payload         JSONB,
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.digital_integrity_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read digital_integrity_ledger"   ON public.digital_integrity_ledger FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert digital_integrity_ledger" ON public.digital_integrity_ledger FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 18. HPP_IMPROVEMENTS (improvement tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hpp_improvements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT,                   -- MECHANICAL | ELECTRICAL | CIVIL | PROCESS
    priority        TEXT DEFAULT 'MEDIUM',  -- LOW | MEDIUM | HIGH | CRITICAL
    status          TEXT DEFAULT 'OPEN',    -- OPEN | IN_PROGRESS | COMPLETE
    estimated_gain  DOUBLE PRECISION,       -- expected efficiency gain %
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hpp_improvements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage hpp_improvements" ON public.hpp_improvements USING (auth.role() = 'authenticated');

-- ============================================================================
-- 19. INSTALLATION_AUDITS (installation quality audit records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.installation_audits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    audit_type      TEXT,
    pass            BOOLEAN DEFAULT TRUE,
    findings        JSONB,
    auditor_id      UUID REFERENCES auth.users(id),
    audited_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.installation_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage installation_audits" ON public.installation_audits USING (auth.role() = 'authenticated');

-- ============================================================================
-- 20. MEASUREMENT_SUBMISSIONS (collaboration workflow — currently commented out)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.measurement_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    submitted_by    UUID REFERENCES auth.users(id),
    measurement_type TEXT,
    data            JSONB,
    status          TEXT DEFAULT 'PENDING',  -- PENDING | REVIEWED | APPROVED | REJECTED
    reviewer_id     UUID REFERENCES auth.users(id),
    submitted_at    TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ
);

ALTER TABLE public.measurement_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage measurement_submissions" ON public.measurement_submissions USING (auth.role() = 'authenticated');

-- ============================================================================
-- 21. PROCESS_INSTABILITY_EVENTS (cavitation/surge/hunting events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.process_instability_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,          -- CAVITATION | SURGE | HUNTING | RUNAWAY
    severity        TEXT DEFAULT 'WARNING',
    sensor_snapshot JSONB,
    auto_resolved   BOOLEAN DEFAULT FALSE,
    occurred_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.process_instability_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage process_instability_events" ON public.process_instability_events USING (auth.role() = 'authenticated');

-- ============================================================================
-- 22. SOVEREIGN_DOSSIERS (deep dossier snapshots — currently commented in code)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sovereign_dossiers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    dossier_type    TEXT NOT NULL,
    snapshot        JSONB,
    version         INTEGER DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sovereign_dossiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage sovereign_dossiers" ON public.sovereign_dossiers USING (auth.role() = 'authenticated');

-- ============================================================================
-- 23. PULSE_ARCHIVE (ThePulseEngine archived samples — currently commented)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pulse_archive (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    pulse_data      JSONB,
    archived_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pulse_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage pulse_archive" ON public.pulse_archive USING (auth.role() = 'authenticated');

-- ============================================================================
-- 24. ETA_AGGREGATES (SystemIntegrityService / AdminHealth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.eta_aggregates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    metric          TEXT NOT NULL,
    value           DOUBLE PRECISION,
    period_start    TIMESTAMPTZ,
    period_end      TIMESTAMPTZ,
    computed_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.eta_aggregates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage eta_aggregates" ON public.eta_aggregates USING (auth.role() = 'authenticated');

-- ============================================================================
-- 25. PRICING_HISTORY (SystemIntegrityService / AdminHealth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pricing_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    energy_price    DOUBLE PRECISION,       -- EUR/MWh
    currency        TEXT DEFAULT 'EUR',
    market          TEXT,
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage pricing_history" ON public.pricing_history USING (auth.role() = 'authenticated');

-- ============================================================================
-- 26. REPORTS storage bucket (used via storage.from('reports'))
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports' AND auth.role() = 'authenticated');

-- ============================================================================
-- UPDATED_AT TRIGGER (reusable helper)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables that have the column
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'assets', 'asset_configs', 'inventory', 'spare_parts_inventory',
        'hpp_improvements', 'diagnostic_drafts'
    ] LOOP
        EXECUTE format(
            'CREATE OR REPLACE TRIGGER set_%s_updated_at
             BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
            t, t
        );
    END LOOP;
END;
$$;

-- ============================================================================
-- DONE
-- ============================================================================
