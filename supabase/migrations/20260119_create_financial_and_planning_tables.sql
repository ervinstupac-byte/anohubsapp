-- Create financial and planning tables for NC-10.8

-- Ensure extension for gen_random_uuid exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Financial ledger per asset (daily snapshots or configured values)
CREATE TABLE IF NOT EXISTS financial_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id uuid REFERENCES turbine_designs(id) ON DELETE CASCADE,
    price_per_kwh numeric(18,6) DEFAULT 0, -- currency per kWh
    cost_per_kw numeric(18,6) DEFAULT 0, -- cost per kW (one-time metric)
    daily_revenue numeric(18,6) DEFAULT 0,
    op_expenditure numeric(18,6) DEFAULT 0,
    notes text,
    recorded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_financial_ledger_asset ON financial_ledger(asset_id);

-- Production forecast / samples (planned vs actual energy/power metrics)
CREATE TABLE IF NOT EXISTS production_forecast (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id uuid REFERENCES turbine_designs(id) ON DELETE CASCADE,
    period_date date NOT NULL,
    planned_p_kw numeric(18,6) DEFAULT 0,
    actual_p_kw numeric(18,6) DEFAULT 0,
    efficiency_loss_cost numeric(18,6) DEFAULT 0,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_production_forecast_asset_date ON production_forecast(asset_id, period_date);

-- Production planning table: aggregated planned vs actual energy (kWh)
CREATE TABLE IF NOT EXISTS production_planning (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id uuid REFERENCES turbine_designs(id) ON DELETE CASCADE,
    period_start date NOT NULL,
    period_end date NOT NULL,
    planned_energy_kwh numeric(20,6) DEFAULT 0,
    actual_energy_kwh numeric(20,6) DEFAULT 0,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_production_planning_asset_period ON production_planning(asset_id, period_start, period_end);

-- Backfill note: hydrology_context should already exist; ensure presence of canonical fields for Plant Onboarding
ALTER TABLE IF EXISTS hydrology_context
    ADD COLUMN IF NOT EXISTS plant_name text,
    ADD COLUMN IF NOT EXISTS river_name text,
    ADD COLUMN IF NOT EXISTS design_head_m numeric(12,6),
    ADD COLUMN IF NOT EXISTS rated_flow_cms numeric(12,6);

-- Simple view that joins asset financials with recent forecast for dashboard convenience
CREATE OR REPLACE VIEW asset_financial_summary AS
SELECT td.id as asset_id, td.name as asset_name, fl.price_per_kwh, fl.daily_revenue, pf.period_date, pf.planned_p_kw, pf.actual_p_kw
FROM turbine_designs td
LEFT JOIN financial_ledger fl ON fl.asset_id = td.id
LEFT JOIN LATERAL (
    SELECT * FROM production_forecast pf WHERE pf.asset_id = td.id ORDER BY pf.period_date DESC LIMIT 1
) pf ON true;
