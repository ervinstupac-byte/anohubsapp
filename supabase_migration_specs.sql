-- NC-76.6 Schema Recovery: Add specs column to assets table
-- This is critical for the Multi-Type architecture

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'assets'
        AND column_name = 'specs'
    ) THEN
        ALTER TABLE public.assets ADD COLUMN specs JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
