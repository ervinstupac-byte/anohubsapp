-- Migration: Harden experience_ledger and audit_logs, add FK constraints and trigger
-- Author: Lead System Architect
BEGIN;

-- 1) Add columns to experience_ledger
ALTER TABLE IF EXISTS public.experience_ledger
  ADD COLUMN IF NOT EXISTS asset_id UUID,
  ADD COLUMN IF NOT EXISTS work_order_id UUID;

-- Add FK constraints if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='experience_ledger' AND column_name='asset_id') THEN
    ALTER TABLE public.experience_ledger
      ADD CONSTRAINT IF NOT EXISTS fk_experience_ledger_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='experience_ledger' AND column_name='work_order_id') THEN
    ALTER TABLE public.experience_ledger
      ADD CONSTRAINT IF NOT EXISTS fk_experience_ledger_workorders FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 2) Safely migrate audit_logs.operator_id from TEXT -> UUID referencing auth.users(id)
-- Add a new column, populate where operator_id looks like a UUID, then swap names
ALTER TABLE IF EXISTS public.audit_logs
  ADD COLUMN IF NOT EXISTS operator_uuid UUID;

-- Populate operator_uuid when operator_id contains a valid UUID
UPDATE public.audit_logs
SET operator_uuid = operator_id::uuid
WHERE operator_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';

-- Add FK constraint to auth.users when operator_uuid present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='operator_uuid') THEN
    BEGIN
      ALTER TABLE public.audit_logs
        ADD CONSTRAINT IF NOT EXISTS fk_audit_logs_operator_uuid FOREIGN KEY (operator_uuid) REFERENCES auth.users(id) ON DELETE SET NULL;
    EXCEPTION WHEN undefined_table THEN
      -- auth.users may not exist in some environments; skip FK if missing
      RAISE NOTICE 'auth.users table not found; skipping FK creation for audit_logs.operator_uuid';
    END;
  END IF;
END$$;

-- Atomically rename columns: keep legacy text in operator_id_text
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='operator_uuid') THEN
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='operator_id') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN operator_id TO operator_id_text;
      END IF;
      ALTER TABLE public.audit_logs RENAME COLUMN operator_uuid TO operator_id;
    END;
  END IF;
END$$;

-- 3) Create trigger to log experience_ledger entries when work_orders.status -> SEALED
CREATE OR REPLACE FUNCTION public.fn_log_work_order_sealed()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'SEALED' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.experience_ledger (symptom_observed, actual_cause, resolution_steps, created_at, asset_id, work_order_id)
    VALUES (
      'WORK_ORDER_SEALED',
      concat('Work order ', NEW.id::text, ' sealed.'),
      concat('Transition: ', COALESCE(OLD.status,'<null>'), ' -> ', NEW.status),
      now(),
      NEW.asset_id,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_work_order_sealed ON public.work_orders;
CREATE TRIGGER trg_work_order_sealed
AFTER UPDATE ON public.work_orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.fn_log_work_order_sealed();

COMMIT;
