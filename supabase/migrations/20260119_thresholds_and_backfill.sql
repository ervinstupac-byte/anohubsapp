-- Thresholds and Backfill for eta_aggregates
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- threshold_configs: adjustable limits used by Diagnostic Advisories
CREATE TABLE IF NOT EXISTS threshold_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  vibration_mm_s numeric(8,3) DEFAULT 4.5, -- ISO 10816-like default
  temperature_c numeric(8,2) DEFAULT 105.00, -- IEC 60034-1 guidance envelope
  efficiency_deviation_pct numeric(6,4) DEFAULT 0.0150, -- fraction (1.5%)
  notes text,
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_threshold_asset ON threshold_configs(asset_id);

-- Backfill function: aggregate dynamic_sensor_data by asset and day into eta_aggregates
CREATE OR REPLACE FUNCTION backfill_eta_aggregates(start_date date, end_date date)
RETURNS TABLE(asset_id uuid, period_start date, period_end date, avg_power_kw numeric, avg_flow_cms numeric, avg_head_m numeric, avg_eta numeric) LANGUAGE plpgsql AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT asset_id,
           date_trunc('day', timestamp)::date as day,
           AVG(COALESCE(output_power, (francis_data->>'output_power')::numeric)) as avg_power_kw,
           AVG(COALESCE((francis_data->>'flow')::numeric, (francis_data->>'flowRate')::numeric, NULL)) as avg_flow_cms,
           AVG(COALESCE((francis_data->>'head')::numeric, (francis_data->>'GrossHead')::numeric, NULL)) as avg_head_m
    FROM public.dynamic_sensor_data
    WHERE timestamp::date >= start_date AND timestamp::date <= end_date
    GROUP BY asset_id, date_trunc('day', timestamp)
  LOOP
    -- compute eta using canonical function (expects kW, m3/s, m)
    PERFORM compute_eta_from_pqh(rec.avg_power_kw, rec.avg_flow_cms, rec.avg_head_m);
    -- upsert into eta_aggregates if sensible
    IF rec.avg_power_kw IS NOT NULL AND rec.avg_flow_cms IS NOT NULL AND rec.avg_head_m IS NOT NULL THEN
      INSERT INTO eta_aggregates (asset_id, period_start, period_end, avg_power_kw, avg_flow_cms, avg_head_m, avg_eta, optimal_eta, hours, metadata, created_at)
      VALUES (
        rec.asset_id,
        rec.day,
        rec.day,
        round(rec.avg_power_kw::numeric,6),
        round(rec.avg_flow_cms::numeric,6),
        round(rec.avg_head_m::numeric,6),
        compute_eta_from_pqh(rec.avg_power_kw::numeric, rec.avg_flow_cms::numeric, rec.avg_head_m::numeric),
        NULL,
        24,
        '{}'::jsonb,
        now()
      ) ON CONFLICT (asset_id, period_start, period_end) DO UPDATE SET
        avg_power_kw = EXCLUDED.avg_power_kw,
        avg_flow_cms = EXCLUDED.avg_flow_cms,
        avg_head_m = EXCLUDED.avg_head_m,
        avg_eta = EXCLUDED.avg_eta,
        updated_at = now();
      RETURN NEXT rec.asset_id, rec.day, rec.day, rec.avg_power_kw, rec.avg_flow_cms, rec.avg_head_m, compute_eta_from_pqh(rec.avg_power_kw, rec.avg_flow_cms, rec.avg_head_m);
    END IF;
  END LOOP;
END; $$;

-- grant execute to authenticated role (if applicable)
-- GRANT EXECUTE ON FUNCTION backfill_eta_aggregates(date, date) TO authenticated;

-- End migration
