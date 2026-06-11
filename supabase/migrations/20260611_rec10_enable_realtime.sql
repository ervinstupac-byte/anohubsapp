-- =============================================================================
-- MIGRATION #10: Enable Realtime on key tables
-- Allows app to subscribe to live changes with supabase.channel()
-- =============================================================================

-- dynamic_sensor_data — live IoT sensor feeds
ALTER PUBLICATION supabase_realtime ADD TABLE public.dynamic_sensor_data;

-- work_orders — live job status updates across technician views
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_orders;

-- event_journal — live plant event stream / alerts dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_journal;

-- process_instability_events — live anomaly/alert feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.process_instability_events;

-- hpp_status — live HPP operating status (written by iot-ingest edge function)
ALTER PUBLICATION supabase_realtime ADD TABLE public.hpp_status;

-- digital_integrity — live integrity ledger updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_integrity;

-- ============================================================
-- NOTE: Realtime also requires enabling in the Supabase Dashboard:
--   Database → Replication → Source Tables → Toggle ON per table
-- The SQL above handles the PostgreSQL publication side;
-- the Dashboard toggle manages the Realtime server subscription.
-- ============================================================
