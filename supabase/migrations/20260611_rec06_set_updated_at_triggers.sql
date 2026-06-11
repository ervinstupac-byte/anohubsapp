-- =============================================================================
-- MIGRATION #6: set_updated_at trigger
-- Automatically updates the updated_at column on any UPDATE operation.
-- Applied to all tables that have an updated_at column.
-- =============================================================================

-- Reusable trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Helper macro: only create trigger if table has updated_at column
-- (safe to run multiple times — uses IF NOT EXISTS pattern via DO blocks)

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='assets' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_assets_updated_at ON public.assets;
    CREATE TRIGGER set_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
    CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='plants' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_plants_updated_at ON public.plants;
    CREATE TRIGGER set_plants_updated_at BEFORE UPDATE ON public.plants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='hydrology_context' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_hydrology_context_updated_at ON public.hydrology_context;
    CREATE TRIGGER set_hydrology_context_updated_at BEFORE UPDATE ON public.hydrology_context FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='maintenance_logs' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_maintenance_logs_updated_at ON public.maintenance_logs;
    CREATE TRIGGER set_maintenance_logs_updated_at BEFORE UPDATE ON public.maintenance_logs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='work_orders' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_work_orders_updated_at ON public.work_orders;
    CREATE TRIGGER set_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='threshold_configs' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_threshold_configs_updated_at ON public.threshold_configs;
    CREATE TRIGGER set_threshold_configs_updated_at BEFORE UPDATE ON public.threshold_configs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='risk_assessments' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_risk_assessments_updated_at ON public.risk_assessments;
    CREATE TRIGGER set_risk_assessments_updated_at BEFORE UPDATE ON public.risk_assessments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='expert_knowledge_base' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS set_expert_knowledge_base_updated_at ON public.expert_knowledge_base;
    CREATE TRIGGER set_expert_knowledge_base_updated_at BEFORE UPDATE ON public.expert_knowledge_base FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
