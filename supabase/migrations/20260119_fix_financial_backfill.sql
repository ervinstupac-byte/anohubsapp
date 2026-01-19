-- Migration: Recalculate computed_loss_cost in eta_aggregates
-- Uses reference efficiency eta_ref = 92.0 (%), rated power 4500 kW, hours per day 24
-- Default price used here is 0.08 EUR/kWh; this migration writes a base value.
BEGIN;

-- safety: create a backup of existing computed_loss_cost
ALTER TABLE IF EXISTS public.eta_aggregates
    ADD COLUMN IF NOT EXISTS computed_loss_cost_backup numeric;

UPDATE public.eta_aggregates
SET computed_loss_cost_backup = computed_loss_cost;

-- Recalculate computed_loss_cost per requested formula:
-- Loss = (92.0 - avg_eta) * 4500 * 24 * price_per_kwh
-- Here price_per_kwh = 0.08 EUR by default for migration. Multiply by 1/100 if avg_eta stored as percent.
DO $$
DECLARE
    eta_ref numeric := 92.0;
    price_per_kwh numeric := 0.08;
BEGIN
    UPDATE public.eta_aggregates
    SET computed_loss_cost = (eta_ref - avg_eta) * 4500.0 * 24.0 * price_per_kwh / 100.0
    WHERE avg_eta IS NOT NULL;
END$$;

COMMIT;

-- Note: If your `avg_eta` is already a fractional value (e.g., 0.92), remove the /100.0 above.
