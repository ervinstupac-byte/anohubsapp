-- =============================================================================
-- MIGRATION #9: Orphaned Tables — Safe Cleanup
-- Tables that exist in Supabase but have zero app code references.
-- Each section is commented out — review before uncommenting.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- KEEP (repurpose or document) — DO NOT DROP
-- ---------------------------------------------------------------------------

-- asset_configs: Keep. Could store per-asset config overrides.
-- Suggest: merge with assets.specs or use as the typed configuration store.
COMMENT ON TABLE public.asset_configs IS
  'Per-asset configuration overrides. Consider merging into assets.specs JSONB or migrating to threshold_configs for typed sensor thresholds.';

-- enriched_telemetry: Keep. Populated by ETL/triggers from dynamic_sensor_data.
COMMENT ON TABLE public.enriched_telemetry IS
  'Pre-computed enriched telemetry combining raw sensor data with asset context. Currently empty — populate via trigger on dynamic_sensor_data or scheduled job.';

-- measurement_submissions: Keep. Intended for field measurement form submissions.
COMMENT ON TABLE public.measurement_submissions IS
  'Field measurement submissions before QA processing. Currently not wired to any app component — connect to the measurement form or logbook_entries.';

-- pulse_archive: Keep as cold storage.
COMMENT ON TABLE public.pulse_archive IS
  'Cold storage archive of telemetry pulses. Acts as a data warehouse layer. Populate from dynamic_sensor_data via a daily archival job.';

-- ---------------------------------------------------------------------------
-- SAFE TO DROP (truly orphaned, superseded by newer tables)
-- ---------------------------------------------------------------------------
-- Review each carefully before running!

-- sovereign_dossiers / sovereign_ledger / sovereignty_chain
-- These appear to be legacy "sovereignty" feature tables.
-- If your codebase no longer uses them:
/*
DROP TABLE IF EXISTS public.sovereignty_chain CASCADE;
DROP TABLE IF EXISTS public.sovereign_dossiers CASCADE;
DROP TABLE IF EXISTS public.sovereign_ledger CASCADE;
*/

-- turbine_families / turbine_variants
-- These are reference tables — seeded in rec01. Keep them!
-- They should be referenced as FKs from turbine_designs and assets.
-- Add FK if missing:
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'turbine_designs' AND constraint_name = 'turbine_designs_variant_fk'
  ) THEN
    -- Only add if turbine_variants has a unique name column
    -- ALTER TABLE public.turbine_designs ADD CONSTRAINT turbine_designs_variant_fk
    --   FOREIGN KEY (design_name) REFERENCES public.turbine_variants(name) ON DELETE SET NULL;
    NULL;
  END IF;
END $$;

-- forensic_reports vs reports
-- Both exist. forensic_reports is for detailed failure analysis (admin/consultant only).
-- reports is for management/summary PDFs. They serve different purposes — keep both.
COMMENT ON TABLE public.forensic_reports IS
  'Detailed forensic/failure analysis reports. Access restricted by role. Separate from reports table (which stores management summary PDFs).';

-- hpp_status: Used by iot-ingest edge function — KEEP!
-- It stores real-time HPP operating status (upserted by IoT edge function).

-- ---------------------------------------------------------------------------
-- CONSOLIDATION SUGGESTIONS (no SQL needed, architectural decisions)
-- ---------------------------------------------------------------------------
-- 1. asset_configs + threshold_configs → consider merging into a single
--    per-asset typed config table with a 'config_type' discriminator column.
--
-- 2. enriched_telemetry + dynamic_sensor_data → add a trigger on
--    dynamic_sensor_data inserts that also populates enriched_telemetry
--    with asset context JOIN.
--
-- 3. pulse_archive → schedule a nightly pg_cron job to copy rows older
--    than 90 days from dynamic_sensor_data into pulse_archive, then delete.
-- ---------------------------------------------------------------------------
