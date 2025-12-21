-- Create work_orders table
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES public.assets(id),
    title TEXT NOT NULL,
    issue_type TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SEALED')),
    assigned_to UUID REFERENCES auth.users(id),
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create work_order_steps table
CREATE TABLE IF NOT EXISTS public.work_order_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    target_value NUMERIC,
    unit TEXT,
    required_tools JSONB DEFAULT '[]'::jsonb,
    required_consumables JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    actual_value NUMERIC,
    worker_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Seed a sample work order for a Bearing Overheat issue
WITH new_order AS (
    INSERT INTO public.work_orders (asset_id, title, issue_type, status)
    SELECT id, 'Bearing Overheat Investigation', 'MECHANICAL', 'PENDING'
    FROM public.assets
    LIMIT 1
    RETURNING id
)
INSERT INTO public.work_order_steps (order_id, step_number, description, target_value, unit, required_tools, required_consumables)
SELECT id, 1, 'Verify Tool Availability', NULL, NULL, '["Infrared Thermometer", "Wrench Set"]'::jsonb, '[]'::jsonb FROM new_order
UNION ALL
SELECT id, 2, 'Measure Bearing Shell Temperature', 45, '°C', '["Infrared Thermometer"]'::jsonb, '[]'::jsonb FROM new_order
UNION ALL
SELECT id, 3, 'Replace Lube Oil Filter', NULL, NULL, '["Filter Wrench"]'::jsonb, '[{"name": "Oil Filter VG46", "quantity": 1}]'::jsonb FROM new_order;
