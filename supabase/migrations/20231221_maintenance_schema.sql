-- Update assets table to track operating hours
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS operating_hours DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_threshold DECIMAL DEFAULT 8000,
ADD COLUMN IF NOT EXISTS last_maintenance_at TIMESTAMPTZ;

-- Create maintenance_logs table for service history
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL, -- 'Bearing Inspection', 'Oil Filtration', 'Alignment Check'
    hours_at_service DECIMAL NOT NULL,
    digital_seal_hash TEXT,
    engineer_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for maintenance lookup
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON public.maintenance_logs(asset_id);

-- RLS
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for all" ON public.maintenance_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.maintenance_logs FOR INSERT TO authenticated WITH CHECK (true);
