-- =============================================================================
-- MIGRATION #7: Composite Indexes on (asset_id, created_at DESC)
-- Optimizes the most common query pattern: order by time, filter by asset.
-- =============================================================================

-- maintenance_logs — very frequently queried per asset
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset_created
  ON public.maintenance_logs (asset_id, created_at DESC);

-- risk_assessments — per-asset risk history
CREATE INDEX IF NOT EXISTS idx_risk_assessments_asset_created
  ON public.risk_assessments (asset_id, created_at DESC);

-- work_orders — per-asset job history
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_created
  ON public.work_orders (asset_id, created_at DESC);

-- event_journal — live event stream per asset
CREATE INDEX IF NOT EXISTS idx_event_journal_asset_created
  ON public.event_journal (asset_id, created_at DESC);

-- audit_logs — compliance queries by time
CREATE INDEX IF NOT EXISTS idx_audit_logs_created
  ON public.audit_logs (created_at DESC);

-- purchase_orders — financial queries by time
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created
  ON public.purchase_orders (created_at DESC);

-- diagnostic_snapshots — latest snapshot per asset
CREATE INDEX IF NOT EXISTS idx_diagnostic_snapshots_asset_created
  ON public.diagnostic_snapshots (asset_id, created_at DESC);

-- installation_audits — per asset
CREATE INDEX IF NOT EXISTS idx_installation_audits_asset_created
  ON public.installation_audits (asset_id, created_at DESC);

-- process_instability_events — per asset alerts
CREATE INDEX IF NOT EXISTS idx_process_instability_asset_created
  ON public.process_instability_events (asset_id, created_at DESC);

-- hpp_improvements — per asset
CREATE INDEX IF NOT EXISTS idx_hpp_improvements_asset_created
  ON public.hpp_improvements (asset_id, created_at DESC);

-- reports — per asset report history
CREATE INDEX IF NOT EXISTS idx_reports_asset_created
  ON public.reports (asset_id, created_at DESC);

-- century_plans — per asset plan history
CREATE INDEX IF NOT EXISTS idx_century_plans_asset_created
  ON public.century_plans (asset_id, created_at DESC);

-- turbine_designs — per asset + user design history
CREATE INDEX IF NOT EXISTS idx_turbine_designs_asset_created
  ON public.turbine_designs (asset_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_turbine_designs_user_created
  ON public.turbine_designs (user_id, created_at DESC);

-- experience_ledger — per asset lesson history
CREATE INDEX IF NOT EXISTS idx_experience_ledger_asset_created
  ON public.experience_ledger (asset_id, created_at DESC);

-- logbook_entries — per turbine (asset) log
CREATE INDEX IF NOT EXISTS idx_logbook_entries_turbine_created
  ON public.logbook_entries (turbine_id, created_at DESC);

-- asset_financials_with_eta — financial period queries
CREATE INDEX IF NOT EXISTS idx_asset_financials_asset_period
  ON public.asset_financials_with_eta (asset_id, period_start DESC, period_end DESC);

-- eta_aggregates — per asset
CREATE INDEX IF NOT EXISTS idx_eta_aggregates_asset_created
  ON public.eta_aggregates (asset_id, created_at DESC);
