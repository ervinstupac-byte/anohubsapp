-- Create reports table to store generated management reports and computed_loss_cost
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.hpp_assets(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL, -- e.g. 'CENTURY_ROI', 'MANAGEMENT_PDF'
    report_period_start DATE,
    report_period_end DATE,
    computed_loss_cost NUMERIC(18,4), -- euro value with fractional cents precision
    computed_loss_cost_currency TEXT DEFAULT 'EUR',
    pdf_path TEXT, -- storage path or public url
    metadata JSONB DEFAULT '{}'::jsonb,
    generated_by UUID, -- user id that generated the report
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_asset ON public.reports(asset_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(report_type);

-- Enable row level security and provide basic policies for authenticated users
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users"
ON public.reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON public.reports FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
