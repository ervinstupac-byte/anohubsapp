-- Create inventory_assets table
CREATE TABLE IF NOT EXISTS public.inventory_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    part_number TEXT UNIQUE NOT NULL,
    category TEXT, -- 'Bearings', 'Seals', 'Sensors'
    quantity INTEGER DEFAULT 0,
    min_stock_threshold INTEGER DEFAULT 5,
    unit_price DECIMAL DEFAULT 0,
    turbine_types TEXT[], -- ['kaplan', 'francis', 'pelton']
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.inventory_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.inventory_assets FOR SELECT USING (true);
CREATE POLICY "Enable update for authenticated" ON public.inventory_assets FOR UPDATE TO authenticated USING (true);

-- Seed some initial data
INSERT INTO public.inventory_assets (name, part_number, category, quantity, min_stock_threshold, unit_price, turbine_types)
VALUES 
('Main Bearing Set XL', 'BRG-X-100', 'Bearings', 2, 3, 4500.00, '{kaplan, francis}'),
('High-Pressure Seal kit', 'SLK-H-200', 'Seals', 12, 10, 850.00, '{kaplan, francis, pelton}'),
('Vibration Sensor v4', 'SNS-V-400', 'Sensors', 8, 5, 320.00, '{pelton, francis}'),
('Generator Cooling Fan', 'FAN-G-500', 'HVAC', 1, 2, 1200.00, '{francis}');
