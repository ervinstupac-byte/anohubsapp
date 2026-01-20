-- Add utility_grid_contracts and legal_compliance_register for 50-year lifecycle
CREATE TABLE IF NOT EXISTS utility_grid_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  contract_name text NOT NULL,
  counterparty text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  contracted_price_per_kwh numeric(18,6) NOT NULL DEFAULT 0,
  escalation_pct_per_year numeric(8,6) DEFAULT 0,
  currency text DEFAULT 'EUR',
  notes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_ugc_asset ON utility_grid_contracts(asset_id);

CREATE TABLE IF NOT EXISTS legal_compliance_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  permit_type text NOT NULL,
  permit_identifier text,
  issuing_authority text,
  valid_from date,
  valid_to date,
  last_audit_date date,
  audit_summary jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'ACTIVE',
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_lcr_asset ON legal_compliance_register(asset_id);
