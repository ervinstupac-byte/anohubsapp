-- 1. Upgrade inventory_assets with maintenance specs
ALTER TABLE public.inventory_assets ADD COLUMN IF NOT EXISTS maintenance_specs JSONB DEFAULT '{}'::jsonb;

-- 2. Add Status and Granular Tags to installation audits (for Draft-to-Live)
ALTER TABLE public.installation_audits ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
ALTER TABLE public.installation_audits ADD COLUMN IF NOT EXISTS system_origin TEXT;
ALTER TABLE public.installation_audits ADD COLUMN IF NOT EXISTS location_tag TEXT;
ALTER TABLE public.installation_audits ADD COLUMN IF NOT EXISTS fluid_type TEXT;

-- 3. Add Cooling System parameters to telemetry (if not already handled by JSONB details)
-- We will use the 'details' JSONB column in telemetry_logs for cooling metrics, 
-- but we ensure the status and tags are available where needed.

-- Update existing records to 'LIVE' to prevent breaking current dashboards
UPDATE public.installation_audits SET status = 'LIVE' WHERE status IS NULL;

-- 4. Seed maintenance_specs for a filter
UPDATE public.inventory_assets 
SET maintenance_specs = '{
    "tools": ["Wrench 19mm", "Drain Container"],
    "clearance": "0.1mm",
    "instructions": "Ensure unit is depressurized before removing filter housing. Check for sediment."
}'::jsonb
WHERE name ILIKE '%Filter%' OR category = 'Filters';

-- Add a filter if it doesn't exist
INSERT INTO public.inventory_assets (name, part_number, category, quantity, min_stock_threshold, unit_price, turbine_types, maintenance_specs)
VALUES ('Lubrication Oil Filter v2', 'FLT-L-600', 'Filters', 10, 5, 45.00, '{francis, kaplan}', '{
    "tools": ["Wrench 19mm", "Drain Container"],
    "instructions": "Place container under the drain valve. Unscrew filter carefully."
}')
ON CONFLICT (part_number) DO NOTHING;
