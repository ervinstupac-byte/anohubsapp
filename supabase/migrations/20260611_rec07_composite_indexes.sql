-- =============================================================================
-- MIGRATION #7: Composite Indexes on correct timestamp columns
-- Verified column names from live DB schema.
-- =============================================================================

-- maintenance_logs (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset_created
  ON public.maintenance_logs (asset_id, created_at DESC);

-- risk_assessments (uses assessed_at, NOT created_at)
CREATE INDEX IF NOT EXISTS idx_risk_assessments_asset_assessed
  ON public.risk_assessments (asset_id, assessed_at DESC);

-- work_orders (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_created
  ON public.work_orders (asset_id, created_at DESC);

-- event_journal (uses occurred_at, NOT created_at)
CREATE INDEX IF NOT EXISTS idx_event_journal_asset_occurred
  ON public.event_journal (asset_id, occurred_at DESC);

-- audit_logs (uses timestamp, NOT created_at)
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp
  ON public.audit_logs (timestamp DESC);

-- purchase_orders (uses ordered_at, NOT created_at)
CREATE INDEX IF NOT EXISTS idx_purchase_orders_ordered
  ON public.purchase_orders (ordered_at DESC);

-- diagnostic_snapshots (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_asset_created
  ON public.diagnostic_snapshots (asset_id, created_at DESC);

-- installation_audits (uses audited_at, NOT created_at)
CREATE INDEX IF NOT EXISTS idx_installation_audits_asset_audited
  ON public.installation_audits (asset_id, audited_at DESC);

-- process_instability_events (uses occurred_at, NOT created_at)
CREATE INDEX IF NOT EXISTS idx_process_instability_asset_occurred
  ON public.process_instability_events (asset_id, occurred_at DESC);

-- hpp_improvements (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_hpp_improvements_asset_created
  ON public.hpp_improvements (asset_id, created_at DESC);

-- reports (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_reports_asset_created
  ON public.reports (asset_id, created_at DESC);

-- century_plans (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_century_plans_asset_created
  ON public.century_plans (asset_id, created_at DESC);

-- turbine_designs (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_turbine_designs_asset_created
  ON public.turbine_designs (asset_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_turbine_designs_user_created
  ON public.turbine_designs (user_id, created_at DESC);

-- experience_ledger (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_experience_ledger_asset_created
  ON public.experience_ledger (asset_id, created_at DESC);

-- logbook_entries (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_logbook_entries_turbine_created
  ON public.logbook_entries (turbine_id, created_at DESC);

-- asset_financials_with_eta (created_at ✓)
CREATE INDEX IF NOT EXISTS idx_asset_financials_asset_period
  ON public.asset_financials_with_eta (asset_id, period_start DESC, period_end DESC);

-- eta_aggregates (uses computed_at, NOT created_at)
CREATE INDEX IF NOT EXISTS idx_eta_aggregates_asset_computed
  ON public.eta_aggregates (asset_id, computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_eta_aggregates_asset_period
  ON public.eta_aggregates (asset_id, period_start DESC, period_end DESC);
