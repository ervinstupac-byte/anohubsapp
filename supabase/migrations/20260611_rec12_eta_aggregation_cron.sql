-- =============================================================================
-- MIGRATION #12: pg_cron job for eta_aggregates population
-- Aggregates ETA data from risk_assessments into eta_aggregates daily.
-- =============================================================================

-- Enable pg_cron if not already enabled (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- ---------------------------------------------------------------------------
-- Daily ETA aggregation job
-- Reads latest risk_assessments per asset and upserts into eta_aggregates
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'aggregate-eta-daily',
  '0 3 * * *',   -- 3am daily, after retention purge at 2am
  $$
  INSERT INTO public.eta_aggregates (asset_id, eta_days, confidence, risk_level, computed_at, created_at)
  SELECT
    asset_id,
    AVG(eta_days)        AS eta_days,
    AVG(confidence)      AS confidence,
    MODE() WITHIN GROUP (ORDER BY risk_level) AS risk_level,
    now()                AS computed_at,
    now()                AS created_at
  FROM (
    SELECT DISTINCT ON (asset_id)
      asset_id,
      -- Try common ETA column names (adjust to your actual schema)
      COALESCE((details->>'eta_days')::numeric, 0)       AS eta_days,
      COALESCE((details->>'confidence')::numeric, 0.5)   AS confidence,
      COALESCE(risk_level, 'unknown')                     AS risk_level
    FROM public.risk_assessments
    WHERE created_at >= now() - INTERVAL '24 hours'
    ORDER BY asset_id, created_at DESC
  ) latest
  GROUP BY asset_id
  ON CONFLICT (asset_id) DO UPDATE SET
    eta_days    = EXCLUDED.eta_days,
    confidence  = EXCLUDED.confidence,
    risk_level  = EXCLUDED.risk_level,
    computed_at = EXCLUDED.computed_at;
  $$
);

-- Verify
SELECT jobid, schedule, command FROM cron.job WHERE jobname = 'aggregate-eta-daily';
