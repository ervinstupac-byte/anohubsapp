-- Suggested hardening migration (generated)
-- Review before applying. This will ENABLE RLS on tables that currently lack policies.

BEGIN;

-- Harden table: telemetry_logs
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.telemetry_logs FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest adding FK constraints to telemetry_logs where applicable.
-- Example: ALTER TABLE public.telemetry_logs ADD CONSTRAINT fk_telemetry_logs_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for inventory_assets (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_inventory_assets_asset ON public.inventory_assets(asset_id);

-- Suggest adding FK constraints to inventory_assets where applicable.
-- Example: ALTER TABLE public.inventory_assets ADD CONSTRAINT fk_inventory_assets_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: work_orders
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.work_orders FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest index for work_orders (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_work_orders_asset ON public.work_orders(asset_id);

-- Harden table: work_order_steps
ALTER TABLE public.work_order_steps ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.work_order_steps FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest index for work_order_steps (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_work_order_steps_asset ON public.work_order_steps(asset_id);

-- Suggest adding FK constraints to work_order_steps where applicable.
-- Example: ALTER TABLE public.work_order_steps ADD CONSTRAINT fk_work_order_steps_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: expert_knowledge_base
ALTER TABLE public.expert_knowledge_base ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.expert_knowledge_base FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest index for expert_knowledge_base (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_expert_knowledge_base_asset ON public.expert_knowledge_base(asset_id);

-- Suggest adding FK constraints to expert_knowledge_base where applicable.
-- Example: ALTER TABLE public.expert_knowledge_base ADD CONSTRAINT fk_expert_knowledge_base_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: experience_ledger
ALTER TABLE public.experience_ledger ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.experience_ledger FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest index for experience_ledger (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_experience_ledger_asset ON public.experience_ledger(asset_id);

-- Suggest adding FK constraints to experience_ledger where applicable.
-- Example: ALTER TABLE public.experience_ledger ADD CONSTRAINT fk_experience_ledger_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for plants (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_plants_asset ON public.plants(asset_id);

-- Suggest index for hydrology_context (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_hydrology_context_asset ON public.hydrology_context(asset_id);

-- Suggest adding FK constraints to hydrology_context where applicable.
-- Example: ALTER TABLE public.hydrology_context ADD CONSTRAINT fk_hydrology_context_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for pipe_system (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_pipe_system_asset ON public.pipe_system(asset_id);

-- Suggest adding FK constraints to pipe_system where applicable.
-- Example: ALTER TABLE public.pipe_system ADD CONSTRAINT fk_pipe_system_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for turbine_bids (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_turbine_bids_asset ON public.turbine_bids(asset_id);

-- Suggest adding FK constraints to turbine_bids where applicable.
-- Example: ALTER TABLE public.turbine_bids ADD CONSTRAINT fk_turbine_bids_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for asset_operational_history (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_asset_operational_history_asset ON public.asset_operational_history(asset_id);

-- Suggest adding FK constraints to asset_operational_history where applicable.
-- Example: ALTER TABLE public.asset_operational_history ADD CONSTRAINT fk_asset_operational_history_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for safety_interlock_ledger (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_safety_interlock_ledger_asset ON public.safety_interlock_ledger(asset_id);

-- Suggest adding FK constraints to safety_interlock_ledger where applicable.
-- Example: ALTER TABLE public.safety_interlock_ledger ADD CONSTRAINT fk_safety_interlock_ledger_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for forensic_recordings (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_forensic_recordings_asset ON public.forensic_recordings(asset_id);

-- Suggest adding FK constraints to forensic_recordings where applicable.
-- Example: ALTER TABLE public.forensic_recordings ADD CONSTRAINT fk_forensic_recordings_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for expert_knowledge (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_expert_knowledge_asset ON public.expert_knowledge(asset_id);

-- Suggest adding FK constraints to expert_knowledge where applicable.
-- Example: ALTER TABLE public.expert_knowledge ADD CONSTRAINT fk_expert_knowledge_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for engineer_notes (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_engineer_notes_asset ON public.engineer_notes(asset_id);

-- Suggest adding FK constraints to engineer_notes where applicable.
-- Example: ALTER TABLE public.engineer_notes ADD CONSTRAINT fk_engineer_notes_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for turbine_families (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_turbine_families_asset ON public.turbine_families(asset_id);

-- Suggest adding FK constraints to turbine_families where applicable.
-- Example: ALTER TABLE public.turbine_families ADD CONSTRAINT fk_turbine_families_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for turbine_variants (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_turbine_variants_asset ON public.turbine_variants(asset_id);

-- Suggest adding FK constraints to turbine_variants where applicable.
-- Example: ALTER TABLE public.turbine_variants ADD CONSTRAINT fk_turbine_variants_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest index for dynamic_sensor_data (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_dynamic_sensor_data_asset ON public.dynamic_sensor_data(asset_id);

-- Suggest adding FK constraints to dynamic_sensor_data where applicable.
-- Example: ALTER TABLE public.dynamic_sensor_data ADD CONSTRAINT fk_dynamic_sensor_data_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Suggest adding FK constraints to turbine_designs where applicable.
-- Example: ALTER TABLE public.turbine_designs ADD CONSTRAINT fk_turbine_designs_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.reports FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest adding FK constraints to reports where applicable.
-- Example: ALTER TABLE public.reports ADD CONSTRAINT fk_reports_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: telemetry_samples
ALTER TABLE public.telemetry_samples ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.telemetry_samples FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest adding FK constraints to telemetry_samples where applicable.
-- Example: ALTER TABLE public.telemetry_samples ADD CONSTRAINT fk_telemetry_samples_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: physics_results
ALTER TABLE public.physics_results ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.physics_results FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest adding FK constraints to physics_results where applicable.
-- Example: ALTER TABLE public.physics_results ADD CONSTRAINT fk_physics_results_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: project_state_snapshots
ALTER TABLE public.project_state_snapshots ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.project_state_snapshots FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest adding FK constraints to project_state_snapshots where applicable.
-- Example: ALTER TABLE public.project_state_snapshots ADD CONSTRAINT fk_project_state_snapshots_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: telemetry_history_cache
ALTER TABLE public.telemetry_history_cache ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.telemetry_history_cache FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest adding FK constraints to telemetry_history_cache where applicable.
-- Example: ALTER TABLE public.telemetry_history_cache ADD CONSTRAINT fk_telemetry_history_cache_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: hpp_status
ALTER TABLE public.hpp_status ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.hpp_status FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest adding FK constraints to hpp_status where applicable.
-- Example: ALTER TABLE public.hpp_status ADD CONSTRAINT fk_hpp_status_assets FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Harden table: assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.assets FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Harden table: hpp_assets
ALTER TABLE public.hpp_assets ENABLE ROW LEVEL SECURITY;
-- NOTE: Add precise policies for ownership/roles. Example (requires owner_id column):
-- CREATE POLICY "owner_select" ON public.hpp_assets FOR SELECT TO authenticated USING (owner_id = auth.uid());
-- For asset-owned tables, consider policies tying asset_id to claims or service roles.

-- Suggest index for hpp_assets (if common query column exists)
-- CREATE INDEX IF NOT EXISTS idx_hpp_assets_asset ON public.hpp_assets(asset_id);


COMMIT;
