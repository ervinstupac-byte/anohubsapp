-- SUPABASE SCHEMA MIGRATION: NC-4.2 NEURAL CORE
-- AUTHOR: Antigravity
-- PURPOSE: Restore missing tables for Inventory, Work Orders, and Diagnostics.

-- 1. ASSETS TABLE (Base Layer)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT,
    lat NUMERIC,
    lng NUMERIC,
    power_output NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Operational',
    turbine_type TEXT DEFAULT 'francis',
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INVENTORY_ASSETS (Neural Supply Layer)
CREATE TABLE IF NOT EXISTS public.inventory_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    part_number TEXT UNIQUE NOT NULL,
    category TEXT,
    quantity INTEGER DEFAULT 0,
    min_stock_threshold INTEGER DEFAULT 0,
    unit_price NUMERIC DEFAULT 0,
    turbine_types TEXT[] DEFAULT '{}',
    maintenance_specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. WORK_ORDERS (Execution Layer)
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issue_type TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SEALED')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. WORK_ORDER_STEPS (Instruction Layer)
CREATE TABLE IF NOT EXISTS public.work_order_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    target_value NUMERIC,
    unit TEXT,
    required_tools TEXT[] DEFAULT '{}',
    required_consumables JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    actual_value NUMERIC,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. EXPERT_KNOWLEDGE_BASE (Intelligence Layer)
CREATE TABLE IF NOT EXISTS public.expert_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_key TEXT UNIQUE NOT NULL,
    diagnosis TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. EXPERIENCE_LEDGER (History Layer)
CREATE TABLE IF NOT EXISTS public.experience_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_observed TEXT NOT NULL,
    actual_cause TEXT NOT NULL,
    resolution_steps TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. AUDIT_LOGS (Integrity Layer)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    operator_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    status TEXT CHECK (status IN ('SUCCESS', 'FAILURE')),
    details JSONB DEFAULT '{}'::jsonb
);

-- 8. DIAGNOSTIC_DRAFTS (Session Layer)
CREATE TABLE IF NOT EXISTS public.diagnostic_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, asset_id)
);

-- SEED DATA (CORE KNOWLEDGE)
INSERT INTO public.expert_knowledge_base (symptom_key, diagnosis, recommended_action, severity) VALUES
('TELEMETRY_ALARM', 'Telemetry indicates critical threshold breach.', 'Perform immediate manual inspection of sensors and telemetry bridge.', 'HIGH'),
('METAL_SCRAPING', 'Internal friction or seal failure detected.', 'Emergency shutdown recommended. Check runner and guide vane clearances.', 'CRITICAL'),
('STRUCTURAL_DEV', 'Alignment or foundation deviation detected.', 'Verify shaft alignment and anchor bolt tension.', 'MEDIUM')
ON CONFLICT (symptom_key) DO NOTHING;
