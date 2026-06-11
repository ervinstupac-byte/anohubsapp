-- =============================================================================
-- MIGRATION: Create 17 missing tables
-- Generated:  2026-06-11
-- Source:     Derived from app source code (.from() usage analysis)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. plants
--    Used by: PlantMaster.tsx, HydrologyLab.tsx
--    Columns: id, name, location_name, gps_lat, gps_lng, elevation_masl,
--             ambient_temp_avg, humidity_avg, created_at, updated_at
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plants (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name          text NOT NULL,
    location_name text,
    gps_lat       numeric(10, 7),
    gps_lng       numeric(10, 7),
    elevation_masl numeric(8, 2),
    ambient_temp_avg numeric(5, 2),
    humidity_avg  numeric(5, 2),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_plants" ON public.plants FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_plants" ON public.plants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_plants" ON public.plants FOR UPDATE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 2. hydrology_context
--    Used by: HydroschoolSimulator.tsx, HydrologyLab.tsx, FrancisHorizontal5MW.tsx
--    Unique on: plant_id  (upserted with onConflict: 'plant_id')
--    Columns: id, plant_id, design_head, design_flow, ecological_flow,
--             + arbitrary hydrology params stored as jsonb extras
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hydrology_context (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id           uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
    design_head        numeric(10, 3),
    design_flow        numeric(10, 4),
    ecological_flow    numeric(10, 4),
    catchment_area_km2 numeric(12, 4),
    mean_annual_runoff_mm numeric(10, 3),
    flood_q100_cms     numeric(12, 4),
    sediment_load_ppm  numeric(10, 3),
    water_temp_avg_c   numeric(5, 2),
    extra              jsonb,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT hydrology_context_plant_id_key UNIQUE (plant_id)
);
ALTER TABLE public.hydrology_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_hydrology_context" ON public.hydrology_context FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_hydrology_context" ON public.hydrology_context FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_hydrology_context" ON public.hydrology_context FOR UPDATE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 3. turbine_designs
--    Used by: HPPBuilder.tsx, HydroschoolSimulator.tsx, RiskReport.tsx,
--             FrancisHorizontal5MW.tsx
--    Columns: id, user_id, asset_id, design_name, parameters (jsonb),
--             created_at
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.turbine_designs (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id     uuid REFERENCES public.assets(id) ON DELETE SET NULL,
    design_name  text NOT NULL DEFAULT 'Untitled Design',
    parameters   jsonb NOT NULL DEFAULT '{}',
    created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.turbine_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_turbine_designs"    ON public.turbine_designs FOR SELECT    TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_turbine_designs"    ON public.turbine_designs FOR INSERT    TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_turbine_designs"    ON public.turbine_designs FOR UPDATE    TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "delete_turbine_designs"    ON public.turbine_designs FOR DELETE    TO authenticated USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. turbine_bids
--    Used by: BidEvaluator.tsx
--    Columns: id, proposed_turbine_type, promised_efficiency, evaluation,
--             created_at + any extra fields inserted via selectedBid spread
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.turbine_bids (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    proposed_turbine_type text CHECK (proposed_turbine_type IN ('FRANCIS','PELTON','KAPLAN')),
    promised_efficiency   numeric(6, 4),
    bid_name              text,
    vendor                text,
    capacity_mw           numeric(10, 3),
    head_m                numeric(10, 3),
    flow_cms              numeric(10, 4),
    evaluation            jsonb,
    notes                 text,
    created_at            timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.turbine_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_turbine_bids" ON public.turbine_bids FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_turbine_bids" ON public.turbine_bids FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_turbine_bids" ON public.turbine_bids FOR UPDATE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 5. dynamic_sensor_data
--    Used by: HydroschoolSimulator.tsx, FrancisHorizontal5MW.tsx
--    Columns: id, asset_id, timestamp, efficiency, output_power,
--             francis_data (jsonb), + other sensor readings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id      uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    timestamp     timestamptz NOT NULL DEFAULT now(),
    efficiency    numeric(6, 4),
    output_power  numeric(12, 4),
    flow_cms      numeric(10, 4),
    head_m        numeric(10, 3),
    rpm           numeric(8, 2),
    vibration_mm  numeric(8, 4),
    temperature_c numeric(6, 2),
    pressure_bar  numeric(8, 3),
    francis_data  jsonb,
    raw           jsonb,
    created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dynamic_sensor_data_asset_ts_idx ON public.dynamic_sensor_data (asset_id, timestamp DESC);
ALTER TABLE public.dynamic_sensor_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_dynamic_sensor_data" ON public.dynamic_sensor_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_dynamic_sensor_data" ON public.dynamic_sensor_data FOR INSERT TO authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 6. telemetry_logs
--    Used by: LoggingService.ts, AIPredictionService.ts, FrancisHorizontal5MW.tsx,
--             HydroschoolSimulator.tsx
--    Insert: { asset_id, event_type, severity, details }
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    event_type  text,
    severity    text CHECK (severity IN ('info','warning','critical','error')),
    details     jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS telemetry_logs_asset_idx ON public.telemetry_logs (asset_id, created_at DESC);
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_telemetry_logs" ON public.telemetry_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_telemetry_logs" ON public.telemetry_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 7. telemetry_samples
--    Used by: ForensicReportService.ts — purely for error telemetry writes
--    Insert: { kind, component, message, created_at }
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.telemetry_samples (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kind       text NOT NULL,
    component  text,
    message    text,
    metadata   jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.telemetry_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_telemetry_samples" ON public.telemetry_samples FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "select_telemetry_samples" ON public.telemetry_samples FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'role') IN ('admin', 'consultant')
);

-- ---------------------------------------------------------------------------
-- 8. experience_ledger
--    Used by: ExperienceLedgerService.ts, DiagnosticContext.tsx
--    Columns: id, symptom_observed, actual_cause, resolution_steps,
--             asset_id, work_order_id, created_at
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experience_ledger (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_observed  text NOT NULL DEFAULT 'MANUAL_NOTE',
    actual_cause      text,
    resolution_steps  text,
    asset_id          uuid REFERENCES public.assets(id) ON DELETE SET NULL,
    work_order_id     uuid REFERENCES public.work_orders(id) ON DELETE SET NULL,
    created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS experience_ledger_asset_idx ON public.experience_ledger (asset_id);
ALTER TABLE public.experience_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_experience_ledger" ON public.experience_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_experience_ledger" ON public.experience_ledger FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_experience_ledger" ON public.experience_ledger FOR UPDATE TO authenticated USING (true);
CREATE POLICY "delete_experience_ledger" ON public.experience_ledger FOR DELETE TO authenticated USING (
    (auth.jwt() ->> 'role') IN ('admin', 'consultant')
);

-- ---------------------------------------------------------------------------
-- 9. expert_knowledge_base
--    Used by: DiagnosticContext.tsx, ExperienceLedgerService.ts
--    Key lookup: symptom_key
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expert_knowledge_base (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_key       text NOT NULL,
    asset_id          uuid REFERENCES public.assets(id) ON DELETE SET NULL,
    turbine_family    text,
    probable_cause    text,
    severity          text CHECK (severity IN ('low','medium','high','critical')),
    recommended_action text,
    reference_docs    text[],
    confidence        numeric(4, 3) CHECK (confidence BETWEEN 0 AND 1),
    metadata          jsonb,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT expert_knowledge_base_symptom_key_key UNIQUE (symptom_key)
);
CREATE INDEX IF NOT EXISTS expert_knowledge_base_symptom_idx ON public.expert_knowledge_base USING gin (to_tsvector('english', symptom_key));
ALTER TABLE public.expert_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_expert_knowledge_base" ON public.expert_knowledge_base FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_expert_knowledge_base" ON public.expert_knowledge_base FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'role') IN ('admin', 'consultant')
);
CREATE POLICY "update_expert_knowledge_base" ON public.expert_knowledge_base FOR UPDATE TO authenticated USING (
    (auth.jwt() ->> 'role') IN ('admin', 'consultant')
);

-- ---------------------------------------------------------------------------
-- 10. expert_efficiency_curves
--     Used by: AgingEstimator.ts
--     Lookup by: turbine_variant or asset_family
--     Columns: id, turbine_variant, asset_family, curve_json, created_at
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expert_efficiency_curves (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    turbine_variant text,
    asset_family    text,
    curve_json      jsonb NOT NULL DEFAULT '{}',
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS expert_efficiency_curves_variant_idx ON public.expert_efficiency_curves (turbine_variant);
CREATE INDEX IF NOT EXISTS expert_efficiency_curves_family_idx  ON public.expert_efficiency_curves (asset_family);
ALTER TABLE public.expert_efficiency_curves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_expert_efficiency_curves" ON public.expert_efficiency_curves FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_expert_efficiency_curves" ON public.expert_efficiency_curves FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'role') IN ('admin', 'consultant')
);

-- ---------------------------------------------------------------------------
-- 11. component_encyclopedia
--     Used by: ComponentInfoPanel.tsx
--     Lookup by: component_name (exact) and description (ilike)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.component_encyclopedia (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    component_name text NOT NULL,
    turbine_family text,
    category       text,
    description    text,
    function       text,
    failure_modes  text[],
    wear_indicators text[],
    replacement_interval_hrs integer,
    datasheet_url  text,
    image_url      text,
    metadata       jsonb,
    created_at     timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT component_encyclopedia_name_key UNIQUE (component_name)
);
CREATE INDEX IF NOT EXISTS component_encyclopedia_name_idx ON public.component_encyclopedia (component_name);
CREATE INDEX IF NOT EXISTS component_encyclopedia_desc_idx  ON public.component_encyclopedia USING gin (to_tsvector('english', coalesce(description, '')));
ALTER TABLE public.component_encyclopedia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_component_encyclopedia" ON public.component_encyclopedia FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_component_encyclopedia" ON public.component_encyclopedia FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'role') IN ('admin', 'consultant')
);

-- ---------------------------------------------------------------------------
-- 12. logbook_entries
--     Used by: DigitalLogbook.tsx
--     Insert: { entry_type, turbine_id, timestamp, shift, operator,
--               measurements, notes }
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.logbook_entries (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_type   text NOT NULL DEFAULT 'operational',
    turbine_id   uuid REFERENCES public.assets(id) ON DELETE SET NULL,
    timestamp    timestamptz NOT NULL DEFAULT now(),
    shift        text,
    operator     text,
    measurements jsonb,
    notes        text,
    attachments  text[],
    created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS logbook_entries_turbine_ts_idx ON public.logbook_entries (turbine_id, timestamp DESC);
ALTER TABLE public.logbook_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_logbook_entries" ON public.logbook_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_logbook_entries" ON public.logbook_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_logbook_entries" ON public.logbook_entries FOR UPDATE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 13. operator_feedback
--     Used by: VetoControl.tsx
--     Insert: { action_id, reason, context }
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.operator_feedback (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id  text NOT NULL,
    reason     text NOT NULL,
    context    jsonb,
    operator   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.operator_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_operator_feedback" ON public.operator_feedback FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'role') IN ('admin', 'consultant')
);
CREATE POLICY "insert_operator_feedback" ON public.operator_feedback FOR INSERT TO authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 14. reports
--     Used by: ManagementSummary.tsx, reportService.ts (table insert)
--              RiskReport.tsx + management-summary.tsx use storage bucket 'reports'
--     NOTE: The 'reports' STORAGE BUCKET must also be created separately in Supabase UI.
--     Columns: id, asset_id, report_type, title, content, pdf_url, period_start,
--              period_end, created_by, created_at
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id     uuid REFERENCES public.assets(id) ON DELETE SET NULL,
    report_type  text NOT NULL DEFAULT 'management_summary',
    title        text,
    content      jsonb,
    pdf_url      text,
    period_start date,
    period_end   date,
    created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_asset_idx ON public.reports (asset_id, created_at DESC);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_reports" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 15. century_plans
--     Used by: CenturyPlanner.ts, CenturyROIChart.tsx
--     Insert: { asset_id, name, input_json, projections, created_at }
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.century_plans (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    uuid REFERENCES public.assets(id) ON DELETE SET NULL,
    name        text NOT NULL DEFAULT 'Century Plan',
    input_json  jsonb NOT NULL DEFAULT '{}',
    projections jsonb NOT NULL DEFAULT '[]',
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS century_plans_asset_idx ON public.century_plans (asset_id);
ALTER TABLE public.century_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_century_plans" ON public.century_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_century_plans" ON public.century_plans FOR INSERT TO authenticated WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 16. asset_financials_with_eta
--     Used by: ProfessionalReportEngine.ts, CenturyROIChart.tsx
--     Select: computed_loss_cost, period_start, period_end (+ *)
--     Note: Created as a regular table (not a view) for flexibility.
--           Populate via triggers or scheduled jobs.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.asset_financials_with_eta (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id           uuid REFERENCES public.assets(id) ON DELETE CASCADE,
    period_start       date NOT NULL,
    period_end         date NOT NULL,
    computed_loss_cost numeric(18, 2) NOT NULL DEFAULT 0,
    eta_days           numeric(8, 2),
    revenue_loss       numeric(18, 2),
    maintenance_cost   numeric(18, 2),
    total_cost         numeric(18, 2),
    currency           text NOT NULL DEFAULT 'USD',
    notes              jsonb,
    created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS asset_financials_period_idx ON public.asset_financials_with_eta (asset_id, period_start, period_end);
ALTER TABLE public.asset_financials_with_eta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_asset_financials_with_eta" ON public.asset_financials_with_eta FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_asset_financials_with_eta" ON public.asset_financials_with_eta FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_asset_financials_with_eta" ON public.asset_financials_with_eta FOR UPDATE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 17. avatars (Supabase STORAGE bucket — not a DB table)
--     Used by: UserProfile.tsx via supabase.storage.from('avatars')
--     This is a Supabase Storage bucket, NOT a database table.
--     SQL cannot create storage buckets — create it manually:
--       Supabase Dashboard → Storage → New bucket → "avatars" → Public: true
-- ---------------------------------------------------------------------------
-- No SQL needed. See comment above.
-- If you want to track avatar metadata in the DB, it's already handled via
-- the existing 'profiles' table (avatar_url column).

-- =============================================================================
-- END OF MIGRATION
-- Summary of storage buckets to create manually in Supabase Dashboard:
--   • avatars  (public)
--   • reports  (public or restricted)
-- =============================================================================
