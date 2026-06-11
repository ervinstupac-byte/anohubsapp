-- =============================================================================
-- MIGRATION #14: Partitioning guidance for dynamic_sensor_data
-- Implements monthly declarative partitioning for high-volume IoT ingest.
--
-- ⚠️  WARNING: This is a DESTRUCTIVE migration.
-- It renames the existing table, creates a new partitioned table,
-- copies data, then drops the old table.
-- Run on a fresh project or during a maintenance window.
-- On production with live data: take a backup first!
-- =============================================================================

-- Step 1: Rename existing table as backup
ALTER TABLE IF EXISTS public.dynamic_sensor_data RENAME TO dynamic_sensor_data_old;

-- Step 2: Drop indexes on old table (they'll be recreated on partitions)
DROP INDEX IF EXISTS dynamic_sensor_data_asset_ts_idx;

-- Step 3: Create new partitioned table (identical schema)
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data (
    id            uuid NOT NULL DEFAULT gen_random_uuid(),
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
    created_at    timestamptz NOT NULL DEFAULT now(),
    -- Vibration field added for iot-ingest edge function compatibility
    vibration     numeric(8, 4),
    temperature   numeric(6, 2),
    status        text,
    PRIMARY KEY (id, created_at)   -- partition key must be in PK
) PARTITION BY RANGE (created_at);

-- Step 4: Create monthly partitions for current year + next
-- (Add more partitions before they expire in production)
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_01
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_02
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_03
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_04
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_05
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_06
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_07
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_08
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_09
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_10
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_11
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2026_12
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2027_01
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2027_02
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2027-02-01') TO ('2027-03-01');
CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data_2027_03
  PARTITION OF public.dynamic_sensor_data FOR VALUES FROM ('2027-03-01') TO ('2027-04-01');

-- Step 5: Create indexes on the parent table (propagate to all partitions)
CREATE INDEX IF NOT EXISTS dynamic_sensor_data_asset_ts_idx
  ON public.dynamic_sensor_data (asset_id, timestamp DESC);

-- Step 6: Enable RLS on parent (propagates to partitions)
ALTER TABLE public.dynamic_sensor_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_dynamic_sensor_data"
  ON public.dynamic_sensor_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_dynamic_sensor_data"
  ON public.dynamic_sensor_data FOR INSERT TO authenticated WITH CHECK (true);

-- Step 7: Migrate data from old table (if it had data)
INSERT INTO public.dynamic_sensor_data
  SELECT * FROM public.dynamic_sensor_data_old
  ON CONFLICT DO NOTHING;

-- Step 8: Drop old table once data is confirmed migrated
-- ⚠️  Uncomment only after verifying data migration:
-- DROP TABLE public.dynamic_sensor_data_old;

-- Step 9: Automate future partition creation with pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.schedule(
  'create-sensor-partition-monthly',
  '0 0 25 * *',  -- 25th of each month, create next month's partition
  $$
  DO $$
  DECLARE
    next_month date := date_trunc('month', now()) + INTERVAL '1 month';
    part_name  text := 'dynamic_sensor_data_' || to_char(next_month, 'YYYY_MM');
    part_start text := to_char(next_month, 'YYYY-MM-DD');
    part_end   text := to_char(next_month + INTERVAL '1 month', 'YYYY-MM-DD');
  BEGIN
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.dynamic_sensor_data FOR VALUES FROM (%L) TO (%L)',
      part_name, part_start, part_end
    );
  END $$;
  $$
);
