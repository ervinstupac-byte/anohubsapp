-- Migration: 20260124_industrial_integrity_foundation.sql
-- Industrial Integrity Foundation: enforce FK constraints, indexes, and non-permissive RLS.

BEGIN;

-- Helper wrapper to expose a stable function name for current session user
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'requesting_user_id') THEN
    CREATE OR REPLACE FUNCTION requesting_user_id() RETURNS uuid AS $$
      SELECT auth.uid();
    $$ LANGUAGE sql STABLE;
  END IF;
END$$;

-- Helper: ensure constraint exists then add FK
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_telemetry_logs_assets') THEN
    BEGIN
      ALTER TABLE IF EXISTS public.telemetry_logs ADD COLUMN IF NOT EXISTS asset_id UUID;
      ALTER TABLE IF EXISTS public.telemetry_logs ADD CONSTRAINT fk_telemetry_logs_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
    EXCEPTION WHEN others THEN RAISE NOTICE 'fk_telemetry_logs_assets exists or cannot be created'; END;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_telemetry_logs_asset ON public.telemetry_logs(asset_id);
ALTER TABLE IF EXISTS public.telemetry_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_telemetry_logs ON public.telemetry_logs FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- inventory_assets
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_inventory_assets_assets') THEN
  ALTER TABLE IF EXISTS public.inventory_assets ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.inventory_assets ADD CONSTRAINT fk_inventory_assets_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_inventory_assets_asset ON public.inventory_assets(asset_id);
ALTER TABLE IF EXISTS public.inventory_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_inventory_assets ON public.inventory_assets FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- work_orders
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_work_orders_assets') THEN
  ALTER TABLE IF EXISTS public.work_orders ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.work_orders ADD CONSTRAINT fk_work_orders_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_work_orders_asset ON public.work_orders(asset_id);
ALTER TABLE IF EXISTS public.work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_work_orders ON public.work_orders FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- work_order_steps
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_work_order_steps_work_orders') THEN
  ALTER TABLE IF EXISTS public.work_order_steps ADD COLUMN IF NOT EXISTS work_order_id UUID;
  ALTER TABLE IF EXISTS public.work_order_steps ADD CONSTRAINT fk_work_order_steps_work_orders FOREIGN KEY (order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_work_order_steps_order ON public.work_order_steps(order_id);
ALTER TABLE IF EXISTS public.work_order_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_work_order_steps ON public.work_order_steps FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- expert_knowledge_base
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_expert_knowledge_base_assets') THEN
  ALTER TABLE IF EXISTS public.expert_knowledge_base ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.expert_knowledge_base ADD CONSTRAINT fk_expert_knowledge_base_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_expert_knowledge_base_asset ON public.expert_knowledge_base(asset_id);
ALTER TABLE IF EXISTS public.expert_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_expert_knowledge_base ON public.expert_knowledge_base FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- experience_ledger
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_experience_ledger_assets') THEN
  ALTER TABLE IF EXISTS public.experience_ledger ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.experience_ledger ADD CONSTRAINT fk_experience_ledger_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_experience_ledger_asset ON public.experience_ledger(asset_id);
ALTER TABLE IF EXISTS public.experience_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_experience_ledger ON public.experience_ledger FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- hydrology_context
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_hydrology_context_assets') THEN
  ALTER TABLE IF EXISTS public.hydrology_context ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.hydrology_context ADD CONSTRAINT fk_hydrology_context_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_hydrology_context_asset ON public.hydrology_context(asset_id);
ALTER TABLE IF EXISTS public.hydrology_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_hydrology_context ON public.hydrology_context FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- pipe_system
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pipe_system_assets') THEN
  ALTER TABLE IF EXISTS public.pipe_system ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.pipe_system ADD CONSTRAINT fk_pipe_system_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_pipe_system_asset ON public.pipe_system(asset_id);
ALTER TABLE IF EXISTS public.pipe_system ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_pipe_system ON public.pipe_system FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- turbine_bids
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_turbine_bids_assets') THEN
  ALTER TABLE IF EXISTS public.turbine_bids ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.turbine_bids ADD CONSTRAINT fk_turbine_bids_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_turbine_bids_asset ON public.turbine_bids(asset_id);
ALTER TABLE IF EXISTS public.turbine_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_turbine_bids ON public.turbine_bids FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- asset_operational_history
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_operational_history_assets') THEN
  ALTER TABLE IF EXISTS public.asset_operational_history ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.asset_operational_history ADD CONSTRAINT fk_asset_operational_history_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_asset_operational_history_asset ON public.asset_operational_history(asset_id);
ALTER TABLE IF EXISTS public.asset_operational_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_asset_operational_history ON public.asset_operational_history FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- safety_interlock_ledger & forensic_recordings & expert_knowledge & engineer_notes
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_safety_interlock_ledger_assets') THEN
  ALTER TABLE IF EXISTS public.safety_interlock_ledger ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.safety_interlock_ledger ADD CONSTRAINT fk_safety_interlock_ledger_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_safety_interlock_ledger_asset ON public.safety_interlock_ledger(asset_id);
ALTER TABLE IF EXISTS public.safety_interlock_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_safety_interlock_ledger ON public.safety_interlock_ledger FOR ALL TO authenticated USING (false) WITH CHECK (false);

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_forensic_recordings_assets') THEN
  ALTER TABLE IF EXISTS public.forensic_recordings ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.forensic_recordings ADD CONSTRAINT fk_forensic_recordings_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_forensic_recordings_asset ON public.forensic_recordings(asset_id);
ALTER TABLE IF EXISTS public.forensic_recordings ENABLE ROW LEVEL SECURITY;
-- Restrict SELECT/INSERT/UPDATE/DELETE to project members only (requires project_id in table)
DROP POLICY IF EXISTS no_access_forensic_recordings ON public.forensic_recordings;
CREATE POLICY forensic_recordings_select ON public.forensic_recordings FOR SELECT TO authenticated USING (project_id IS NOT NULL AND project_id = requesting_user_id());
CREATE POLICY forensic_recordings_insert ON public.forensic_recordings FOR INSERT TO authenticated WITH CHECK (project_id IS NOT NULL AND project_id = requesting_user_id());
CREATE POLICY forensic_recordings_update ON public.forensic_recordings FOR UPDATE TO authenticated USING (project_id IS NOT NULL AND project_id = requesting_user_id()) WITH CHECK (project_id IS NOT NULL AND project_id = requesting_user_id());
CREATE POLICY forensic_recordings_delete ON public.forensic_recordings FOR DELETE TO authenticated USING (project_id IS NOT NULL AND project_id = requesting_user_id());

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_expert_knowledge_assets') THEN
  ALTER TABLE IF EXISTS public.expert_knowledge ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.expert_knowledge ADD CONSTRAINT fk_expert_knowledge_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_expert_knowledge_asset ON public.expert_knowledge(asset_id);
ALTER TABLE IF EXISTS public.expert_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_expert_knowledge ON public.expert_knowledge FOR ALL TO authenticated USING (false) WITH CHECK (false);

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_engineer_notes_assets') THEN
  ALTER TABLE IF EXISTS public.engineer_notes ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.engineer_notes ADD CONSTRAINT fk_engineer_notes_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_engineer_notes_asset ON public.engineer_notes(asset_id);
ALTER TABLE IF EXISTS public.engineer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_engineer_notes ON public.engineer_notes FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- turbine_families / variants / dynamic_sensor_data
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_turbine_families_assets') THEN
  ALTER TABLE IF EXISTS public.turbine_families ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.turbine_families ADD CONSTRAINT fk_turbine_families_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_turbine_families_asset ON public.turbine_families(asset_id);
ALTER TABLE IF EXISTS public.turbine_families ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_turbine_families ON public.turbine_families FOR ALL TO authenticated USING (false) WITH CHECK (false);

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_turbine_variants_assets') THEN
  ALTER TABLE IF EXISTS public.turbine_variants ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.turbine_variants ADD CONSTRAINT fk_turbine_variants_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_turbine_variants_asset ON public.turbine_variants(asset_id);
ALTER TABLE IF EXISTS public.turbine_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_turbine_variants ON public.turbine_variants FOR ALL TO authenticated USING (false) WITH CHECK (false);

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_dynamic_sensor_data_assets') THEN
  ALTER TABLE IF EXISTS public.dynamic_sensor_data ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.dynamic_sensor_data ADD CONSTRAINT fk_dynamic_sensor_data_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_dynamic_sensor_data_asset ON public.dynamic_sensor_data(asset_id);
ALTER TABLE IF EXISTS public.dynamic_sensor_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_dynamic_sensor_data ON public.dynamic_sensor_data FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- turbine_designs
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_turbine_designs_assets') THEN
  ALTER TABLE IF EXISTS public.turbine_designs ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.turbine_designs ADD CONSTRAINT fk_turbine_designs_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_turbine_designs_asset_time ON public.turbine_designs(asset_id, created_at DESC);
ALTER TABLE IF EXISTS public.turbine_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_turbine_designs ON public.turbine_designs FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- reports
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_reports_assets') THEN
  ALTER TABLE IF EXISTS public.reports ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.reports ADD CONSTRAINT fk_reports_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS idx_reports_asset ON public.reports(asset_id);
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_reports ON public.reports FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- sovereign memory tables
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_telemetry_samples_assets') THEN
  ALTER TABLE IF EXISTS public.telemetry_samples ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.telemetry_samples ADD CONSTRAINT fk_telemetry_samples_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS telemetry_samples_asset_metric_time_idx ON public.telemetry_samples (asset_id, metric_name, captured_at DESC);
ALTER TABLE IF EXISTS public.telemetry_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_telemetry_samples ON public.telemetry_samples FOR ALL TO authenticated USING (false) WITH CHECK (false);

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_physics_results_assets') THEN
  ALTER TABLE IF EXISTS public.physics_results ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.physics_results ADD CONSTRAINT fk_physics_results_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS physics_results_asset_time_idx ON public.physics_results (asset_id, snapshot_at DESC);
ALTER TABLE IF EXISTS public.physics_results ENABLE ROW LEVEL SECURITY;
-- Restrict physics results reads to project-scoped sessions
DROP POLICY IF EXISTS no_access_physics_results ON public.physics_results;
CREATE POLICY physics_results_select ON public.physics_results FOR SELECT TO authenticated USING (project_id IS NOT NULL AND project_id = requesting_user_id());
CREATE POLICY physics_results_insert ON public.physics_results FOR INSERT TO authenticated WITH CHECK (project_id IS NOT NULL AND project_id = requesting_user_id());
CREATE POLICY physics_results_update ON public.physics_results FOR UPDATE TO authenticated USING (project_id IS NOT NULL AND project_id = requesting_user_id()) WITH CHECK (project_id IS NOT NULL AND project_id = requesting_user_id());
CREATE POLICY physics_results_delete ON public.physics_results FOR DELETE TO authenticated USING (project_id IS NOT NULL AND project_id = requesting_user_id());

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_state_snapshots_assets') THEN
  ALTER TABLE IF EXISTS public.project_state_snapshots ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.project_state_snapshots ADD CONSTRAINT fk_project_state_snapshots_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS project_state_snapshots_time_idx ON public.project_state_snapshots (snapshot_at DESC);
ALTER TABLE IF EXISTS public.project_state_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_project_state_snapshots ON public.project_state_snapshots FOR ALL TO authenticated USING (false) WITH CHECK (false);

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_telemetry_history_cache_assets') THEN
  ALTER TABLE IF EXISTS public.telemetry_history_cache ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.telemetry_history_cache ADD CONSTRAINT fk_telemetry_history_cache_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS telemetry_history_cache_asset_idx ON public.telemetry_history_cache (asset_id);
ALTER TABLE IF EXISTS public.telemetry_history_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_telemetry_history_cache ON public.telemetry_history_cache FOR ALL TO authenticated USING (false) WITH CHECK (false);

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_hpp_status_assets') THEN
  ALTER TABLE IF EXISTS public.hpp_status ADD COLUMN IF NOT EXISTS asset_id UUID;
  ALTER TABLE IF EXISTS public.hpp_status ADD CONSTRAINT fk_hpp_status_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END IF; END$$;
CREATE INDEX IF NOT EXISTS hpp_status_asset_idx ON public.hpp_status (asset_id);
ALTER TABLE IF EXISTS public.hpp_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_hpp_status ON public.hpp_status FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- assets table: lock down by default, maintain existing owner patterns
ALTER TABLE IF EXISTS public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY no_access_assets ON public.assets FOR ALL TO authenticated USING (false) WITH CHECK (false);

COMMIT;

-- NOTE: These policies are intentionally non-permissive. Replace each 'no_access_*' policy with tailored policies
-- that map `auth.uid()` or service roles to permitted rows (e.g., owner_id = auth.uid() or asset membership tables).
