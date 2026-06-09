-- =====================================================
-- ANOHUB HPP PLATFORM: DIGITAL LOGBOOK TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.logbook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_type TEXT NOT NULL CHECK (entry_type IN ('Inspekcija', 'Mjerenje', 'Incident', 'Redovno održavanje')),
    turbine_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    shift TEXT NOT NULL CHECK (shift IN ('Jutarnja', 'Poslijepodnevna', 'Noćna')),
    operator TEXT NOT NULL,
    measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_logbook_entries_turbine ON public.logbook_entries(turbine_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_timestamp ON public.logbook_entries(timestamp DESC);

-- Enable RLS
ALTER TABLE public.logbook_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable read for all" ON public.logbook_entries FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable insert for all" ON public.logbook_entries FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
