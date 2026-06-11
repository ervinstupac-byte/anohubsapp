-- DRAFT: Row-Level Security (RLS) policies for all known tables
-- Generated: 2026-06-11
-- NOTE: This is a draft. Review the role checks, ownership columns, and
-- organization-level joins before applying to production. Adjust `auth.jwt()`
-- role claims to match your Auth setup (e.g., 'admin', 'engineer', 'finance').
-- Helper: safe policy application per-table using existence checks.

-- The blocks below check `to_regclass('schema.table') IS NOT NULL` before
-- enabling RLS or creating policies, so the file is safe to run even when
-- some tables are not present yet (e.g. partial deployments / fresh projects).

-- -------------------------------
-- Reference / Lookup tables (readable by any authenticated user)
-- -------------------------------

DO $$
BEGIN
  IF to_regclass('public.turbine_families') IS NOT NULL THEN
    ALTER TABLE public.turbine_families ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_public_turbine_families" ON public.turbine_families
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;
 

DO $$
BEGIN
  IF to_regclass('public.pipe_system') IS NOT NULL THEN
    ALTER TABLE public.pipe_system ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_public_pipe_system" ON public.pipe_system
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.turbine_designs') IS NOT NULL THEN
    ALTER TABLE public.turbine_designs ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_public_turbine_designs" ON public.turbine_designs
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;


-- -------------------------------
-- Telemetry / Time-series (ingest allowed; client updates restricted)
-- -------------------------------

DO $$
BEGIN
  IF to_regclass('public.dynamic_sensor_data') IS NOT NULL THEN
    ALTER TABLE public.dynamic_sensor_data ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_dynamic_sensor_data" ON public.dynamic_sensor_data
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_dynamic_sensor_data" ON public.dynamic_sensor_data
        FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "block_update_dynamic_sensor_data" ON public.dynamic_sensor_data
        FOR UPDATE TO authenticated USING (false);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.telemetry_samples') IS NOT NULL THEN
    ALTER TABLE public.telemetry_samples ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_telemetry_samples" ON public.telemetry_samples
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_telemetry_samples" ON public.telemetry_samples
        FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "block_update_telemetry_samples" ON public.telemetry_samples
        FOR UPDATE TO authenticated USING (false);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.telemetry_logs') IS NOT NULL THEN
    ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_telemetry_logs" ON public.telemetry_logs
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_telemetry_logs" ON public.telemetry_logs
        FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.telemetry_history_cache') IS NOT NULL THEN
    ALTER TABLE public.telemetry_history_cache ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_telemetry_history_cache" ON public.telemetry_history_cache
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "upsert_telemetry_history_cache" ON public.telemetry_history_cache
        FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "block_update_telemetry_history_cache" ON public.telemetry_history_cache
        FOR UPDATE TO authenticated USING (false);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;


-- -------------------------------
-- Maintenance / Workflows
-- -------------------------------

DO $$
BEGIN
  IF to_regclass('public.maintenance_logs') IS NOT NULL THEN
    ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_maintenance_logs" ON public.maintenance_logs
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_maintenance_logs" ON public.maintenance_logs
        FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    -- Create an owner-based policy only if `created_by` column exists; otherwise
    -- fall back to admin-only update policy to avoid runtime errors.
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'maintenance_logs' AND column_name = 'created_by'
    ) THEN
      BEGIN
        CREATE POLICY "update_maintenance_logs_by_owner_or_admin" ON public.maintenance_logs
          FOR UPDATE TO authenticated USING (
            (created_by::text = auth.uid()::text) OR (auth.jwt() ->> 'role') = 'admin'
          );
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    ELSE
      BEGIN
        CREATE POLICY "update_maintenance_logs_admin_only" ON public.maintenance_logs
          FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.work_orders') IS NOT NULL THEN
    ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_work_orders" ON public.work_orders
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_work_orders" ON public.work_orders
        FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'work_orders'
        AND column_name IN ('assigned_to','created_by')
    ) THEN
      BEGIN
        CREATE POLICY "update_work_orders_by_assignee_or_admin" ON public.work_orders
          FOR UPDATE TO authenticated USING (
            (assigned_to::text = auth.uid()::text) OR (created_by::text = auth.uid()::text) OR (auth.jwt() ->> 'role') = 'admin'
          );
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    ELSE
      BEGIN
        CREATE POLICY "update_work_orders_admin_only" ON public.work_orders
          FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.work_order_steps') IS NOT NULL THEN
    ALTER TABLE public.work_order_steps ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_work_order_steps" ON public.work_order_steps
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_work_order_steps" ON public.work_order_steps
        FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;


-- -------------------------------
-- Forensics & Safety
-- -------------------------------

DO $$
BEGIN
  IF to_regclass('public.forensic_reports') IS NOT NULL THEN
    ALTER TABLE public.forensic_reports ENABLE ROW LEVEL SECURITY;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'forensic_reports' AND column_name = 'created_by'
    ) THEN
      BEGIN
        CREATE POLICY "select_forensic_reports_owner_admin" ON public.forensic_reports
          FOR SELECT TO authenticated USING (
            (created_by::text = auth.uid()::text) OR (auth.jwt() ->> 'role') = 'admin'
          );
      EXCEPTION WHEN duplicate_object THEN NULL; END;
      BEGIN
        CREATE POLICY "insert_forensic_reports" ON public.forensic_reports
          FOR INSERT TO authenticated WITH CHECK (created_by::text = auth.uid()::text OR created_by IS NULL);
      EXCEPTION WHEN duplicate_object THEN NULL; END;
      BEGIN
        CREATE POLICY "update_forensic_reports_owner_admin" ON public.forensic_reports
          FOR UPDATE TO authenticated USING ((created_by::text = auth.uid()::text) OR (auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    ELSE
      BEGIN
        CREATE POLICY "select_forensic_reports_admin_only" ON public.forensic_reports
          FOR SELECT TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
      BEGIN
        CREATE POLICY "insert_forensic_reports_admin_only" ON public.forensic_reports
          FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
      BEGIN
        CREATE POLICY "update_forensic_reports_admin_only" ON public.forensic_reports
          FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    END IF;
    BEGIN
      CREATE POLICY "delete_forensic_reports_admin_only" ON public.forensic_reports
        FOR DELETE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.forensic_recordings') IS NOT NULL THEN
    ALTER TABLE public.forensic_recordings ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_forensic_recordings" ON public.forensic_recordings FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_forensic_recordings" ON public.forensic_recordings FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "block_update_forensic_recordings" ON public.forensic_recordings FOR UPDATE TO authenticated USING (false);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.safety_interlock_ledger') IS NOT NULL THEN
    ALTER TABLE public.safety_interlock_ledger ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_safety_interlock" ON public.safety_interlock_ledger FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_safety_interlock" ON public.safety_interlock_ledger FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "update_safety_interlock_for_consultant_or_admin" ON public.safety_interlock_ledger
        FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'role') = 'CONSULTANT' OR (auth.jwt() ->> 'role') = 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;


-- -------------------------------
-- Knowledge / Community content (owner-based where applicable)
-- -------------------------------

DO $$
BEGIN
  IF to_regclass('public.expert_knowledge') IS NOT NULL THEN
    ALTER TABLE public.expert_knowledge ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_expert_knowledge" ON public.expert_knowledge FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_expert_knowledge" ON public.expert_knowledge FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'expert_knowledge' AND column_name = 'reported_by'
    ) THEN
      BEGIN
        CREATE POLICY "update_expert_knowledge_owner" ON public.expert_knowledge FOR UPDATE TO authenticated USING (reported_by::text = auth.uid()::text OR (auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    ELSE
      BEGIN
        CREATE POLICY "update_expert_knowledge_admin_only" ON public.expert_knowledge FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.expert_knowledge_base') IS NOT NULL THEN
    ALTER TABLE public.expert_knowledge_base ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_expert_knowledge_base" ON public.expert_knowledge_base FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_expert_knowledge_base" ON public.expert_knowledge_base FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.experience_ledger') IS NOT NULL THEN
    ALTER TABLE public.experience_ledger ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_experience_ledger" ON public.experience_ledger FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_experience_ledger" ON public.experience_ledger FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.engineer_notes') IS NOT NULL THEN
    ALTER TABLE public.engineer_notes ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_engineer_notes" ON public.engineer_notes FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_engineer_notes" ON public.engineer_notes FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'engineer_notes' AND column_name = 'engineer_id'
    ) THEN
      BEGIN
        CREATE POLICY "update_engineer_notes_owner" ON public.engineer_notes FOR UPDATE TO authenticated USING (engineer_id::text = auth.uid()::text OR (auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    ELSE
      BEGIN
        CREATE POLICY "update_engineer_notes_admin_only" ON public.engineer_notes FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL; END;
    END IF;
  END IF;
END $$;


-- -------------------------------
-- Audit / Logs / Admin tables (writeable by system/authenticated; deletions restricted)
-- -------------------------------

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_audit_logs" ON public.audit_logs
        FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_audit_logs" ON public.audit_logs
        FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "delete_audit_logs_admin_only" ON public.audit_logs
        FOR DELETE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.automated_actions_audit') IS NOT NULL THEN
    ALTER TABLE public.automated_actions_audit ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_automated_actions_audit" ON public.automated_actions_audit FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_automated_actions_audit" ON public.automated_actions_audit FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;


-- -------------------------------
-- Inventory & ERP / Financial tables
-- -------------------------------

DO $$
BEGIN
  IF to_regclass('public.inventory_assets') IS NOT NULL THEN
    ALTER TABLE public.inventory_assets ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_inventory_assets" ON public.inventory_assets FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_inventory_assets" ON public.inventory_assets FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "update_inventory_assets" ON public.inventory_assets FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.pricing_history') IS NOT NULL THEN
    ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_pricing_history" ON public.pricing_history FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_pricing_history" ON public.pricing_history FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'role') = 'finance' OR (auth.jwt() ->> 'role') = 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.capex_plan') IS NOT NULL THEN
    ALTER TABLE public.capex_plan ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_capex_plan" ON public.capex_plan FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_capex_plan" ON public.capex_plan FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'role') = 'finance' OR (auth.jwt() ->> 'role') = 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.depreciation_schedule') IS NOT NULL THEN
    ALTER TABLE public.depreciation_schedule ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_depreciation_schedule" ON public.depreciation_schedule FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_depreciation_schedule" ON public.depreciation_schedule FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'role') = 'finance' OR (auth.jwt() ->> 'role') = 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.eta_aggregates') IS NOT NULL THEN
    ALTER TABLE public.eta_aggregates ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_eta_aggregates" ON public.eta_aggregates FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_eta_aggregates" ON public.eta_aggregates FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.financial_projections') IS NOT NULL THEN
    ALTER TABLE public.financial_projections ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_financial_projections" ON public.financial_projections FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_financial_projections" ON public.financial_projections FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'role') = 'finance' OR (auth.jwt() ->> 'role') = 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;


-- -------------------------------
-- Misc / catch-all tables seen in migrations
-- -------------------------------

DO $$
BEGIN
  IF to_regclass('public.diagnostic_snapshots') IS NOT NULL THEN
    ALTER TABLE public.diagnostic_snapshots ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_diagnostic_snapshots" ON public.diagnostic_snapshots FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_diagnostic_snapshots" ON public.diagnostic_snapshots FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.logbook_entries') IS NOT NULL THEN
    ALTER TABLE public.logbook_entries ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_logbook_entries" ON public.logbook_entries FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_logbook_entries" ON public.logbook_entries FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.operator_feedback') IS NOT NULL THEN
    ALTER TABLE public.operator_feedback ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_operator_feedback" ON public.operator_feedback FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_operator_feedback" ON public.operator_feedback FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.physics_results') IS NOT NULL THEN
    ALTER TABLE public.physics_results ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_physics_results" ON public.physics_results FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "insert_physics_results" ON public.physics_results FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.hpp_status') IS NOT NULL THEN
    ALTER TABLE public.hpp_status ENABLE ROW LEVEL SECURITY;
    BEGIN
      CREATE POLICY "select_hpp_status" ON public.hpp_status FOR SELECT TO authenticated USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      CREATE POLICY "upsert_hpp_status" ON public.hpp_status FOR INSERT TO authenticated WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;


-- -------------------------------
-- Final notes: review, tighten, and add org-level policies
-- -------------------------------
-- This draft intentionally errs on the side of allowing authenticated reads and
-- controlled writes. For production you should:
--  - Replace broad `USING (true)` read policies with org/asset ownership checks
--    (e.g., join against `profiles` or `organizations` to verify access).
--  - Make sensitive tables (financials, forensic artifacts, safety interlocks)
--    readable only to role-specific users ('admin', 'engineer', 'safety').
--  - Audit `created_by` column usage: ensure it's set by trusted services or
--    by client-side code that enforces assignment of `auth.uid()`.
