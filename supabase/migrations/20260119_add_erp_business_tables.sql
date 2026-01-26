-- ERP & Business Intelligence: AnoHUB NC-10.8
-- Create pricing, expenditure, CAPEX, depreciation, aggregates, projections, and century plans

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- pricing_history: tariff rates over time
CREATE TABLE IF NOT EXISTS pricing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  effective_from timestamptz NOT NULL DEFAULT now(),
  price_per_kwh numeric(18,6) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_pricing_history_asset_time ON pricing_history(asset_id, effective_from DESC);

-- maintenance expenditure and invoice linkage
CREATE TABLE IF NOT EXISTS maintenance_expenditure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_log_id uuid REFERENCES public.maintenance_logs(id) ON DELETE SET NULL,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  category text,
  amount numeric(20,6) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  incurred_at timestamptz DEFAULT now(),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_maint_exp_asset_date ON maintenance_expenditure(asset_id, incurred_at DESC);

-- capex plan
CREATE TABLE IF NOT EXISTS capex_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  planned_date date NOT NULL,
  capex_amount numeric(20,6) NOT NULL DEFAULT 0,
  description text,
  approval_status text DEFAULT 'DRAFT',
  spent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_capex_asset_date ON capex_plan(asset_id, planned_date);

-- depreciation schedule
CREATE TABLE IF NOT EXISTS depreciation_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  capex_amount numeric(20,6) NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  life_years integer NOT NULL DEFAULT 50,
  method text NOT NULL DEFAULT 'straight_line',
  annual_depreciation numeric(20,6) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_depr_asset ON depreciation_schedule(asset_id);

-- eta_aggregates: canonical period aggregations used by financial calculations
CREATE TABLE IF NOT EXISTS eta_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  avg_power_kw numeric(18,6) DEFAULT 0,
  avg_flow_cms numeric(18,6) DEFAULT 0,
  avg_head_m numeric(18,6) DEFAULT 0,
  avg_eta numeric(12,8) DEFAULT 0,
  optimal_eta numeric(12,8) DEFAULT NULL,
  hours integer DEFAULT 24,
  computed_loss_cost numeric(20,6) DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_eta_agg_asset_period ON eta_aggregates(asset_id, period_start, period_end);

-- financial projections
CREATE TABLE IF NOT EXISTS financial_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  projected_revenue numeric(20,6) DEFAULT 0,
  projected_opex numeric(20,6) DEFAULT 0,
  projected_loss_due_to_eta numeric(20,6) DEFAULT 0,
  assumptions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_finproj_asset_period ON financial_projections(asset_id, period_start);

-- century plans: store inputs and computed projections
CREATE TABLE IF NOT EXISTS century_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  name text,
  created_by uuid,
  input_json jsonb NOT NULL,
  projections jsonb NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_century_plans_asset ON century_plans(asset_id);

-- invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  invoice_date date NOT NULL,
  due_date date,
  amount numeric(20,6) NOT NULL DEFAULT 0,
  lines jsonb DEFAULT '[]'::jsonb,
  paid boolean DEFAULT false,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_invoice_asset_date ON invoices(asset_id, invoice_date DESC);

-- SERVER SIDE: helper functions and view
-- Compute canonical eta from P(kW), Q(m3/s), H(m) using rho=1000, g=9.81
CREATE OR REPLACE FUNCTION compute_eta_from_pqh(p_kw numeric, q_cms numeric, h_m numeric)
RETURNS numeric LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  rho numeric := 1000; -- kg/m^3
  g numeric := 9.81;   -- m/s^2
  p_w numeric;
  eta numeric;
BEGIN
  IF p_kw IS NULL OR q_cms IS NULL OR h_m IS NULL OR q_cms <= 0 OR h_m <= 0 THEN
    RETURN 0;
  END IF;
  p_w := p_kw * 1000; -- convert kW to W
  eta := p_w / (rho * g * q_cms * h_m);
  IF eta < 0 THEN RETURN 0; END IF;
  IF eta > 1 THEN RETURN 1; END IF;
  RETURN eta;
END;
$$;

-- Compute loss (currency) for an eta_aggregates row using latest pricing before period_start
CREATE OR REPLACE FUNCTION compute_loss_from_aggregates(agg_id uuid)
RETURNS numeric LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  rec RECORD;
  price_rec RECORD;
  price numeric := 0;
  delta_eta numeric := 0;
  loss_per_hour numeric := 0;
  total_loss numeric := 0;
  hours integer := 24;
BEGIN
  SELECT * INTO rec FROM eta_aggregates WHERE id = agg_id;
  IF NOT FOUND THEN RETURN 0; END IF;
  hours := COALESCE(rec.hours, 24);
  -- find latest price effective on or before period_start for this asset
  SELECT price_per_kwh INTO price_rec FROM pricing_history
    WHERE asset_id = rec.asset_id AND effective_from <= rec.period_start::timestamptz
    ORDER BY effective_from DESC LIMIT 1;
  IF FOUND THEN price := price_rec.price_per_kwh; END IF;
  delta_eta := COALESCE(rec.optimal_eta, 1) - COALESCE(rec.avg_eta, 0);
  IF delta_eta < 0 THEN delta_eta := 0; END IF;
  loss_per_hour := delta_eta * COALESCE(rec.avg_power_kw, 0) * price;
  total_loss := loss_per_hour * hours;
  -- update table for convenience
  UPDATE eta_aggregates SET computed_loss_cost = total_loss WHERE id = agg_id;
  RETURN total_loss;
END;
$$;

-- View joining assets, latest aggregate, and pricing for dashboard convenience
CREATE OR REPLACE VIEW asset_financials_with_eta AS
SELECT a.id as asset_id, a.name as asset_name, ea.period_start, ea.period_end,
  ea.avg_power_kw, ea.avg_flow_cms, ea.avg_head_m, ea.avg_eta, ea.optimal_eta, ea.computed_loss_cost,
  ph.price_per_kwh
FROM public.assets a
LEFT JOIN LATERAL (
  SELECT * FROM eta_aggregates ea2 WHERE ea2.asset_id = a.id ORDER BY ea2.period_start DESC LIMIT 1
) ea ON true
LEFT JOIN LATERAL (
  SELECT price_per_kwh FROM pricing_history ph2 WHERE ph2.asset_id = a.id ORDER BY ph2.effective_from DESC LIMIT 1
) ph ON true;

-- Ensure numeric precision for computed_loss_cost via check constraint (non-negative)
ALTER TABLE IF EXISTS eta_aggregates ADD CONSTRAINT chk_eta_agg_loss_nonneg CHECK (computed_loss_cost >= 0);

-- End migration
