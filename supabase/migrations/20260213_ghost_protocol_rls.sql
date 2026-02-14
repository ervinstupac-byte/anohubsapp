-- NC-20800: GHOST PROTOCOL RLS BYPASS & SCHEMA REPAIR
-- AUTHOR: Antigravity
-- TIMESTAMP: 2026-02-13T11:15:00
-- DESCRIPTION: Smash the RLS wall and ensure Audit Log exists.

-- 1. Create SOVEREIGN_AUDIT_LOG if missing (NC-20800 Task 2)
CREATE TABLE IF NOT EXISTS public.sovereign_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    event_type TEXT,
    reason TEXT,
    metric_value TEXT,
    metric_unit TEXT,
    active_protection TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. DISABLE RLS (SMASH THE WALL - NC-20800 Task 1)
-- "The user wants to bypass RLS to fix 401 errors"
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sovereign_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_knowledge_base DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_ledger DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders DISABLE ROW LEVEL SECURITY;

-- 3. PERMISSIONS GRANT (Double Tap)
GRANT ALL ON public.assets TO anon;
GRANT ALL ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;

GRANT ALL ON public.sovereign_audit_log TO anon;
GRANT ALL ON public.sovereign_audit_log TO authenticated;
GRANT ALL ON public.sovereign_audit_log TO service_role;

GRANT ALL ON public.expert_knowledge_base TO anon;
GRANT ALL ON public.expert_knowledge_base TO authenticated;
GRANT ALL ON public.expert_knowledge_base TO service_role;

-- 4. CONFIRMATION
COMMENT ON TABLE public.sovereign_audit_log IS 'NC-20800: Sovereign Audit Log for Black Box Ledger';
