-- Create Telemetry Logs table for historical analysis and stress-test tracking
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.hpp_assets(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'STRESS_TEST', 'CRITICAL_FAILURE', 'SYSTEM_RESET', 'PERIODIC_HEALTH'
    severity TEXT NOT NULL,   -- 'INFO', 'WARNING', 'CRITICAL'
    details JSONB,            -- { vibration: 0.08, temp: 95, type: 'vibration_excess' }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookup by asset
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_asset ON public.telemetry_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_type ON public.telemetry_logs(event_type);

-- RLS Policies
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" 
ON public.telemetry_logs FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON public.telemetry_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);
