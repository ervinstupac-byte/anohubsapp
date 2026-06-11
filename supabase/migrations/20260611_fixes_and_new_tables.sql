-- =============================================================================
-- MIGRATION: New Critical Tables + Schema Fixes for Live Console Errors
-- Run this ENTIRE file in one go in the SQL Editor.
-- =============================================================================

-- ============================================================
-- PART 1: FIX LIVE ERRORS
-- ============================================================

-- FIX 1: eta_aggregates missing columns (ProfessionalReportEngine expects these)
-- ERROR: column eta_aggregates.avg_eta does not exist
ALTER TABLE public.eta_aggregates
  ADD COLUMN IF NOT EXISTS avg_eta           numeric(6,5),
  ADD COLUMN IF NOT EXISTS optimal_eta       numeric(6,5),
  ADD COLUMN IF NOT EXISTS computed_loss_cost numeric(14,2),
  ADD COLUMN IF NOT EXISTS metadata          jsonb;

-- FIX 2: logbook_entries — app sends 'photos' but column is 'attachments'
-- Add photos as alias column so both work
ALTER TABLE public.logbook_entries
  ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb;

-- Sync existing attachments data into photos (one-time backfill)
UPDATE public.logbook_entries
  SET photos = to_jsonb(attachments)
  WHERE photos IS NULL AND attachments IS NOT NULL;

-- FIX 3: RLS — audit_logs INSERT for authenticated users (401 error)
-- The app LoggingService inserts rows here on every action
CREATE POLICY "audit_logs_insert_authenticated"
  ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "audit_logs_select_authenticated"
  ON public.audit_logs
  FOR SELECT TO authenticated
  USING (true);

-- FIX 4: RLS — experience_ledger SELECT for authenticated users (401 error)
CREATE POLICY "experience_ledger_select_authenticated"
  ON public.experience_ledger
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "experience_ledger_insert_authenticated"
  ON public.experience_ledger
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- FIX 5: RLS — logbook_entries (the 400 is schema, but also ensure RLS is open)
CREATE POLICY "logbook_entries_select_authenticated"
  ON public.logbook_entries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "logbook_entries_insert_authenticated"
  ON public.logbook_entries
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- FIX 6: turbine_designs — guest-123 is not a valid UUID, protect query
-- Add RLS that lets authenticated users see only their own designs
-- (the guest query fails because 'guest-123' is not a UUID — handled in code, but ensure RLS doesn't block real users)
CREATE POLICY "turbine_designs_select_own"
  ON public.turbine_designs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text OR user_id = auth.uid()::uuid::text);

CREATE POLICY "turbine_designs_insert_own"
  ON public.turbine_designs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::text OR user_id = auth.uid()::uuid::text);

CREATE POLICY "turbine_designs_update_own"
  ON public.turbine_designs
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::text);

-- ============================================================
-- PART 2: NEW CRITICAL TABLES
-- ============================================================

-- TABLE 1: incident_library
-- Replaces hardcoded HISTORICAL_INCIDENTS array in AIPredictionService.ts
CREATE TABLE IF NOT EXISTS public.incident_library (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code   text UNIQUE NOT NULL,
  incident_type   text NOT NULL CHECK (incident_type IN (
    'HYDRAULIC_RUNAWAY','BEARING_SEIZURE','CAVITATION_COLLAPSE','ALIGNMENT_DRIFT',
    'GOVERNOR_FAILURE','STATOR_FAULT','SEAL_FAILURE','OVERSPEED','RUNAWAY','OTHER'
  )),
  turbine_family  text CHECK (turbine_family IN ('FRANCIS','PELTON','KAPLAN','ALL')),
  description     text NOT NULL,
  pressure_sig    jsonb,
  tension_sig     jsonb,
  temp_sig        jsonb,
  vibration_sig   jsonb,
  trigger_cond    jsonb NOT NULL DEFAULT '{}'::jsonb,
  severity        text NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  source_plant    text,
  resolution      text,
  lessons_learned text,
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.incident_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incident_library_select_authenticated"
  ON public.incident_library FOR SELECT TO authenticated USING (true);
CREATE POLICY "incident_library_insert_admin"
  ON public.incident_library FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') IN ('admin','consultant'));

-- Seed with the 2 hardcoded incidents from AIPredictionService.ts
INSERT INTO public.incident_library
  (incident_code, incident_type, turbine_family, description, pressure_sig, tension_sig, trigger_cond, severity, source_plant)
VALUES
  (
    '2024-KM-HC-001', 'HYDRAULIC_RUNAWAY', 'ALL',
    'Hydraulic Runaway After 12mm→16mm Hose Replacement',
    '[45,46,48,52,58,75,95,120,145,180]',
    '[25,26,28,35,50,80,120,200,350,450]',
    '{"pipeDiameter":16,"suddenPressureRise":true}',
    'CRITICAL', 'Jablanica HPP'
  ),
  (
    '2023-VJ-BRG-003', 'BEARING_SEIZURE', 'FRANCIS',
    'Main Bearing Seizure Due to Lubrication Failure',
    NULL,
    NULL,
    '{"rapidTempRise":true,"oilViscosityDrop":true}',
    'HIGH', 'Rama HPP'
  )
ON CONFLICT (incident_code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_incident_library_type ON public.incident_library (incident_type);
CREATE INDEX IF NOT EXISTS idx_incident_library_family ON public.incident_library (turbine_family);

-- TABLE 2: rul_estimates (Remaining Useful Life persistence)
-- Replaces in-memory Map<string, RULEstimate[]> in AIPredictionService.ts
CREATE TABLE IF NOT EXISTS public.rul_estimates (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id           uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  component_type     text NOT NULL CHECK (component_type IN ('bearing','seal','hose','wicket_gate','runner','guide_vane','labyrinth_seal','thrust_bearing')),
  component_id       text,
  hours_remaining    numeric(10,2) NOT NULL,
  stress_factors     jsonb,
  confidence         numeric(4,3) CHECK (confidence BETWEEN 0 AND 1),
  critical_threshold numeric(10,2),
  computed_at        timestamptz NOT NULL DEFAULT now(),
  expires_at         timestamptz GENERATED ALWAYS AS (computed_at + INTERVAL '24 hours') STORED
);

ALTER TABLE public.rul_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rul_estimates_select_authenticated"
  ON public.rul_estimates FOR SELECT TO authenticated USING (true);
CREATE POLICY "rul_estimates_insert_authenticated"
  ON public.rul_estimates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rul_estimates_update_authenticated"
  ON public.rul_estimates FOR UPDATE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_rul_asset_component
  ON public.rul_estimates (asset_id, component_type, computed_at DESC);

-- TABLE 3: ai_diagnosis_snapshots (UnifiedDiagnosis persistence)
-- MasterIntelligenceEngine.analyzeAsset() result — currently lost on page refresh
CREATE TABLE IF NOT EXISTS public.ai_diagnosis_snapshots (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id         uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  health_score     numeric(5,2) CHECK (health_score BETWEEN 0 AND 100),
  criticality      text CHECK (criticality IN ('HEALTHY','INVESTIGATE','CRITICAL')),
  p_fail           numeric(6,5) CHECK (p_fail BETWEEN 0 AND 1),
  vibration_zone   text CHECK (vibration_zone IN ('ZONE_A','ZONE_B','ZONE_C','ZONE_D')),
  rul_hours        numeric(10,2),
  turbine_class    text,
  operating_zone   jsonb,
  service_notes    jsonb,
  automated_acts   jsonb,
  cavitation_data  jsonb,
  guardian_conf    jsonb,
  baseline_devs    jsonb,
  trend_projections jsonb,
  wisdom_report_id text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_diagnosis_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_diagnosis_select_authenticated"
  ON public.ai_diagnosis_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_diagnosis_insert_authenticated"
  ON public.ai_diagnosis_snapshots FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ai_diag_asset_created
  ON public.ai_diagnosis_snapshots (asset_id, created_at DESC);

-- TABLE 4: sensor_alerts (threshold breach persistence)
CREATE TABLE IF NOT EXISTS public.sensor_alerts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id      uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  sensor_id     text,
  alert_type    text NOT NULL,
  severity      text NOT NULL CHECK (severity IN ('INFO','WARNING','CRITICAL')),
  value         numeric,
  threshold     numeric,
  message       text,
  acknowledged  boolean NOT NULL DEFAULT false,
  ack_by        uuid REFERENCES auth.users(id),
  ack_at        timestamptz,
  auto_resolved boolean NOT NULL DEFAULT false,
  occurred_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sensor_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sensor_alerts_select_authenticated"
  ON public.sensor_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "sensor_alerts_insert_authenticated"
  ON public.sensor_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sensor_alerts_update_authenticated"
  ON public.sensor_alerts FOR UPDATE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_alerts;

CREATE INDEX IF NOT EXISTS idx_sensor_alerts_asset_occurred
  ON public.sensor_alerts (asset_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_unacked
  ON public.sensor_alerts (acknowledged, severity, occurred_at DESC)
  WHERE acknowledged = false;

-- TABLE 5: alignment_records (180-day alignment rule persistence)
CREATE TABLE IF NOT EXISTS public.alignment_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  alignment_type  text NOT NULL DEFAULT 'LASER' CHECK (alignment_type IN ('LASER','OPTICAL','DIAL','MANUAL')),
  performed_by    uuid REFERENCES auth.users(id),
  runout_mm       numeric(6,4),
  tolerance_mm    numeric(6,4) DEFAULT 0.05,
  passed          boolean NOT NULL,
  notes           text,
  performed_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alignment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alignment_records_select_authenticated"
  ON public.alignment_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "alignment_records_insert_authenticated"
  ON public.alignment_records FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_alignment_asset_performed
  ON public.alignment_records (asset_id, performed_at DESC);

-- ============================================================
-- PART 3: Update RLS on other missing tables
-- ============================================================

-- assets — ensure read access for authenticated
CREATE POLICY "assets_select_authenticated"
  ON public.assets FOR SELECT TO authenticated USING (true);

-- profiles — users can read all, update own
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- sensor_registry — read for authenticated
CREATE POLICY "sensor_registry_select_authenticated"
  ON public.sensor_registry FOR SELECT TO authenticated USING (true);

-- plants — read for authenticated
CREATE POLICY "plants_select_authenticated"
  ON public.plants FOR SELECT TO authenticated USING (true);

-- maintenance_logs — read/insert for authenticated
CREATE POLICY "maintenance_logs_select_authenticated"
  ON public.maintenance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "maintenance_logs_insert_authenticated"
  ON public.maintenance_logs FOR INSERT TO authenticated WITH CHECK (true);

-- work_orders — full CRUD for authenticated
CREATE POLICY "work_orders_select_authenticated"
  ON public.work_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "work_orders_insert_authenticated"
  ON public.work_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "work_orders_update_authenticated"
  ON public.work_orders FOR UPDATE TO authenticated USING (true);

-- risk_assessments — read/insert for authenticated
CREATE POLICY "risk_assessments_select_authenticated"
  ON public.risk_assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "risk_assessments_insert_authenticated"
  ON public.risk_assessments FOR INSERT TO authenticated WITH CHECK (true);

-- eta_aggregates — read for authenticated, insert for service role
CREATE POLICY "eta_aggregates_select_authenticated"
  ON public.eta_aggregates FOR SELECT TO authenticated USING (true);
CREATE POLICY "eta_aggregates_insert_authenticated"
  ON public.eta_aggregates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "eta_aggregates_update_authenticated"
  ON public.eta_aggregates FOR UPDATE TO authenticated USING (true);

-- telemetry_logs — insert for authenticated (LoggingService writes here)
CREATE POLICY "telemetry_logs_select_authenticated"
  ON public.telemetry_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "telemetry_logs_insert_authenticated"
  ON public.telemetry_logs FOR INSERT TO authenticated WITH CHECK (true);

-- dynamic_sensor_data
CREATE POLICY "dynamic_sensor_data_select_authenticated"
  ON public.dynamic_sensor_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "dynamic_sensor_data_insert_authenticated"
  ON public.dynamic_sensor_data FOR INSERT TO authenticated WITH CHECK (true);

-- expert_knowledge_base
CREATE POLICY "expert_kb_select_authenticated"
  ON public.expert_knowledge_base FOR SELECT TO authenticated USING (true);

-- hpp_status
CREATE POLICY "hpp_status_select_authenticated"
  ON public.hpp_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "hpp_status_insert_authenticated"
  ON public.hpp_status FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "hpp_status_update_authenticated"
  ON public.hpp_status FOR UPDATE TO authenticated USING (true);

-- diagnostic_snapshots
CREATE POLICY "diagnostic_snapshots_select_authenticated"
  ON public.diagnostic_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "diagnostic_snapshots_insert_authenticated"
  ON public.diagnostic_snapshots FOR INSERT TO authenticated WITH CHECK (true);

-- reports
CREATE POLICY "reports_select_authenticated"
  ON public.reports FOR SELECT TO authenticated USING (true);
