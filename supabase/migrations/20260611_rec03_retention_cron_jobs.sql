-- =============================================================================
-- MIGRATION #3: Data Retention — pg_cron purge jobs
-- Keeps time-series tables from growing unbounded.
-- Requires pg_cron extension (enabled by default on Supabase Pro).
-- On Free tier: enable via Dashboard → Database → Extensions → pg_cron
-- =============================================================================

-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
GRANT USAGE ON SCHEMA cron TO postgres;

-- ---------------------------------------------------------------------------
-- dynamic_sensor_data — keep 90 days (high-volume IoT ingest)
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'purge-dynamic-sensor-data-90d',
  '0 2 * * *',
  $$DELETE FROM public.dynamic_sensor_data WHERE created_at < now() - INTERVAL '90 days'$$
);

-- ---------------------------------------------------------------------------
-- telemetry_logs — keep 180 days (used for AI prediction history)
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'purge-telemetry-logs-180d',
  '15 2 * * *',
  $$DELETE FROM public.telemetry_logs WHERE created_at < now() - INTERVAL '180 days'$$
);

-- ---------------------------------------------------------------------------
-- telemetry_samples — keep 30 days (error/diagnostic telemetry only)
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'purge-telemetry-samples-30d',
  '30 2 * * *',
  $$DELETE FROM public.telemetry_samples WHERE created_at < now() - INTERVAL '30 days'$$
);

-- ---------------------------------------------------------------------------
-- audit_logs — keep 365 days (compliance requirement)
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'purge-audit-logs-365d',
  '45 2 * * *',
  $$DELETE FROM public.audit_logs WHERE created_at < now() - INTERVAL '365 days'$$
);

-- ---------------------------------------------------------------------------
-- automated_actions_audit — keep 180 days
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'purge-automated-actions-180d',
  '50 2 * * *',
  $$DELETE FROM public.automated_actions_audit WHERE created_at < now() - INTERVAL '180 days'$$
);

-- Verify schedules were created
SELECT jobid, schedule, command FROM cron.job ORDER BY jobid;
