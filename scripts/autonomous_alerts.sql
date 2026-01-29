-- Migration: Autonomous Alerts (spinal cord trigger)
-- Purpose: On critical telemetry or excessive vibration, auto-create a work order
-- Location: scripts/autonomous_alerts.sql

-- WARNING: This trigger creates work_orders based on realtime telemetry.
-- Review `VIB_THRESHOLD` before applying in production.

DO $$
BEGIN
    -- Create function only if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname = 'autonomous_alerts_fn' AND n.nspname = 'public'
    ) THEN
        CREATE OR REPLACE FUNCTION public.autonomous_alerts_fn()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $$
        DECLARE
            vib NUMERIC := NULL;
            symptom TEXT := NULL;
            ek RECORD;
            existing_count INT := 0;
            VIB_THRESHOLD NUMERIC := 5; -- adjust threshold to suit your telemetry units
        BEGIN
            -- Only respond to INSERT/UPDATE
            IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
                -- Determine canonical symptom key from payload when present
                symptom := COALESCE(NEW.payload->> 'symptom_key', NEW.payload->> 'alarm', 'TELEMETRY_ALARM');

                -- Try to extract a numeric vibration reading from a couple common paths
                BEGIN
                    IF NEW.payload ? 'vibration' THEN
                        vib := (NEW.payload->> 'vibration')::numeric;
                    ELSIF (NEW.payload->'measurements') IS NOT NULL AND (NEW.payload->'measurements') ? 'vibration' THEN
                        vib := (NEW.payload->'measurements'->> 'vibration')::numeric;
                    END IF;
                EXCEPTION WHEN others THEN
                    vib := NULL;
                END;

                -- Condition: explicit CRITICAL status or vibration over threshold
                IF (NEW.status = 'CRITICAL') OR (vib IS NOT NULL AND vib > VIB_THRESHOLD) THEN
                    SELECT * INTO ek FROM public.expert_knowledge_base WHERE symptom_key = symptom LIMIT 1;
                    IF FOUND THEN
                                                SELECT count(*) INTO existing_count FROM public.work_orders
                                                WHERE asset_id = NEW.asset_id
                                                    AND issue_type = ek.recommended_action
                                                    AND status IN ('PENDING','IN_PROGRESS')
                                                    AND created_at > now() - interval '60 minutes';

                        IF existing_count = 0 THEN
                            INSERT INTO public.work_orders (asset_id, title, issue_type, status)
                            VALUES (NEW.asset_id, 'Auto: ' || ek.symptom_key, ek.recommended_action, 'PENDING');
                        END IF;
                    END IF;
                END IF;
            END IF;
            RETURN NEW;
        END;
        $$;
    END IF;
END $$;

-- Attach trigger if not already attached
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE t.tgname = 'trg_autonomous_alerts' AND n.nspname = 'public'
    ) THEN
        CREATE TRIGGER trg_autonomous_alerts
        AFTER INSERT OR UPDATE ON public.hpp_status
        FOR EACH ROW
        EXECUTE FUNCTION public.autonomous_alerts_fn();
    END IF;
END $$;

-- Optional: grant minimal permissions to service role via migration tooling if desired
-- Note: Supabase service role must have INSERT privileges on public.work_orders to allow trigger-driven inserts.
