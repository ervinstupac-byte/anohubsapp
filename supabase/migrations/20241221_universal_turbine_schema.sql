-- Universal Turbine Management System - Database Schema
-- Phase 1: Core Tables for Multi-Family Support

-- =====================================================
-- 1. ENUMS FOR TYPE SAFETY
-- =====================================================

-- Turbine Family Types
CREATE TYPE turbine_family_enum AS ENUM ('kaplan', 'francis', 'pelton', 'crossflow');

-- Turbine Variant Types (Specific Configurations)
CREATE TYPE turbine_variant_enum AS ENUM (
    -- Kaplan Family (6 variants)
    'kaplan_vertical',
    'kaplan_horizontal',
    'kaplan_pit',
    'kaplan_bulb',
    'kaplan_s',
    'kaplan_spiral',
    
    -- Francis Family
    'francis_vertical',
    'francis_horizontal',
    'francis_slow_runner',
    'francis_fast_runner',
    
    -- Pelton Family
    'pelton_vertical',
    'pelton_horizontal',
    'pelton_multi_jet',
    
    -- Crossflow
    'crossflow_standard'
);

-- =====================================================
-- 2. TURBINE FAMILIES (Master Reference)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.turbine_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family turbine_family_enum NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- Default tolerances for this family
    default_tolerances JSONB NOT NULL DEFAULT '{}',
    /* Example structure:
    {
        "shaft_alignment": {
            "value": 0.05,
            "unit": "mm/m",
            "critical": true,
            "warningThreshold": 0.03
        },
        "vibration_limit": {
            "value": 4.5,
            "unit": "mm/s",
            "critical": true
        }
    }
    */
    
    -- Defines which sensors/parameters are tracked
    sensor_schema JSONB NOT NULL DEFAULT '{}',
    /* Example:
    {
        "required": ["blade_angle", "hub_position", "wicket_gate_position"],
        "optional": ["servo_oil_pressure", "draft_tube_vibration"],
        "units": {
            "blade_angle": "degrees",
            "hub_position": "mm"
        }
    }
    */
    
    -- Family-specific failure patterns for forensics
    forensics_patterns JSONB DEFAULT '{}',
    /* Example:
    {
        "hydraulic_runaway": {
            "triggers": ["pipe_diameter_change", "sudden_pressure_rise"],
            "thresholds": {"pressure_rate": 5.0}
        }
    }
    */
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TURBINE VARIANTS (Specific Configurations)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.turbine_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant turbine_variant_enum NOT NULL UNIQUE,
    family turbine_family_enum NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- Variant-specific tolerances (overrides or extends family defaults)
    specific_tolerances JSONB DEFAULT '{}',
    
    -- Variant-specific sensors (e.g., Bulb has generator_submersion_depth)
    specific_sensors JSONB DEFAULT '{}',
    
    -- Maintenance protocols unique to this variant
    maintenance_protocols JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_turbine_family FOREIGN KEY (family) 
        REFERENCES turbine_families(family) ON DELETE CASCADE
);

-- =====================================================
-- 4. ENHANCE EXISTING ASSETS TABLE
-- =====================================================

-- Add new columns for universal turbine support
ALTER TABLE public.assets 
    ADD COLUMN IF NOT EXISTS turbine_family turbine_family_enum,
    ADD COLUMN IF NOT EXISTS turbine_variant turbine_variant_enum,
    ADD COLUMN IF NOT EXISTS turbine_config JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS operational_thresholds JSONB DEFAULT '{}';

-- Create index for efficient querying by family
CREATE INDEX IF NOT EXISTS idx_assets_turbine_family ON public.assets(turbine_family);
CREATE INDEX IF NOT EXISTS idx_assets_turbine_variant ON public.assets(turbine_variant);

-- =====================================================
-- 5. DYNAMIC SENSOR DATA TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.dynamic_sensor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    turbine_family turbine_family_enum NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Common parameters (all turbines)
    vibration REAL,
    temperature REAL,
    output_power REAL,
    efficiency REAL,
    status TEXT DEFAULT 'OPTIMAL', -- 'OPTIMAL', 'WARNING', 'CRITICAL'
    
    -- Family-specific data (JSONB for flexibility)
    kaplan_data JSONB DEFAULT '{}',
    /* Example Kaplan:
    {
        "blade_angle": 24.5,
        "blade_angle_setpoint": 25.0,
        "hub_position": 0.05,
        "wicket_gate_position": 78.2,
        "servo_oil_pressure": 45.3,
        "hub_vibration": 0.02
    }
    */
    
    francis_data JSONB DEFAULT '{}',
    /* Example Francis:
    {
        "guide_vane_opening": 82.5,
        "runner_clearance": 0.12,
        "draft_tube_pressure": -0.85,
        "stay_ring_vibration": 0.03,
        "spiral_case_pressure": 15.2
    }
    */
    
    pelton_data JSONB DEFAULT '{}',
    /* Example Pelton:
    {
        "nozzle_openings": [85.2, 84.8, 85.5, 85.0],
        "jet_velocities": [120.5, 119.8, 121.2, 120.1],
        "bucket_wear_index": 0.15,
        "deflector_position": "OPEN",
        "nozzle_alignment": [0.08, 0.09, 0.07, 0.08]
    }
    */
    
    generator_data JSONB DEFAULT '{}',
    /* Example Generator:
    {
        "excitation_current": 450.2,
        "stator_temps": [55.2, 56.1, 54.8, 55.9, 56.3, 55.1],
        "rotor_temp": 62.5,
        "cooling_water_flow": 125.5,
        "reactive_power": 15.2
    }
    */
    
    CONSTRAINT fk_sensor_asset FOREIGN KEY (asset_id) 
        REFERENCES assets(id) ON DELETE CASCADE
);

-- Indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_sensor_asset_time 
    ON public.dynamic_sensor_data(asset_id, timestamp DESC);
    
CREATE INDEX IF NOT EXISTS idx_sensor_family_time 
    ON public.dynamic_sensor_data(turbine_family, timestamp DESC);

-- =====================================================
-- 6. SEED TURBINE FAMILIES DATA
-- =====================================================

INSERT INTO public.turbine_families (family, display_name, description, default_tolerances, sensor_schema, forensics_patterns)
VALUES 
(
    'kaplan',
    'Kaplan Turbine',
    'Adjustable blade turbine for low head (10-70m) with variable flow operation',
    '{
        "shaft_alignment": {"value": 0.05, "unit": "mm/m", "critical": true, "warningThreshold": 0.03},
        "blade_angle_deviation": {"value": 0.1, "unit": "degrees", "critical": false, "warningThreshold": 0.05},
        "hub_play": {"value": 0.02, "unit": "mm", "critical": true},
        "wicket_gate_clearance": {"value": 0.5, "unit": "mm", "critical": false},
        "vibration_limit": {"value": 4.5, "unit": "mm/s", "critical": true}
    }',
    '{
        "required": ["blade_angle", "hub_position", "wicket_gate_position"],
        "optional": ["servo_oil_pressure", "hub_vibration", "blade_angle_setpoint"],
        "units": {
            "blade_angle": "degrees",
            "hub_position": "mm",
            "wicket_gate_position": "%",
            "servo_oil_pressure": "bar"
        }
    }',
    '{
        "horizontal_hydraulic_runaway": {
            "triggers": ["pipe_diameter_change", "sudden_pressure_rise"],
            "thresholds": {"servo_pressure_rate": 5.0}
        },
        "blade_seizure": {
            "triggers": ["blade_angle_stuck", "servo_pressure_spike"],
            "thresholds": {"servo_pressure": 60.0}
        }
    }'
),
(
    'francis',
    'Francis Turbine',
    'Medium head turbine (40-600m) with fixed runner blades and adjustable guide vanes',
    '{
        "shaft_alignment": {"value": 0.05, "unit": "mm/m", "critical": true},
        "runner_clearance": {"value": 0.3, "unit": "mm", "critical": false, "warningThreshold": 0.2},
        "labyrinth_clearance": {"value": 0.3, "unit": "mm", "critical": false},
        "guide_vane_clearance": {"value": 0.5, "unit": "mm", "critical": false},
        "vibration_limit": {"value": 4.5, "unit": "mm/s", "critical": true}
    }',
    '{
        "required": ["guide_vane_opening", "runner_clearance", "draft_tube_pressure"],
        "optional": ["stay_ring_vibration", "spiral_case_pressure"],
        "units": {
            "guide_vane_opening": "%",
            "runner_clearance": "mm",
            "draft_tube_pressure": "bar"
        }
    }',
    '{
        "vortex_core": {
            "triggers": ["draft_tube_oscillation", "part_load_operation"],
            "thresholds": {"pressure_oscillation": 0.5, "frequency": 5.0}
        },
        "cavitation_collapse": {
            "triggers": ["runner_damage", "efficiency_drop"],
            "thresholds": {"cavitation_noise": 85.0}
        }
    }'
),
(
    'pelton',
    'Pelton Turbine',
    'Impulse turbine for high head (>200m) with bucket and jet configuration',
    '{
        "nozzle_alignment": {"value": 0.1, "unit": "mm", "critical": true},
        "bucket_spacing": {"value": 0.5, "unit": "mm", "critical": false},
        "jet_axis_deviation": {"value": 2.0, "unit": "mm", "critical": true},
        "vibration_limit": {"value": 3.5, "unit": "mm/s", "critical": true}
    }',
    '{
        "required": ["nozzle_openings", "bucket_wear_index", "deflector_position"],
        "optional": ["jet_velocities", "nozzle_alignment"],
        "units": {
            "nozzle_openings": "%",
            "bucket_wear_index": "mm/1000h",
            "jet_velocities": "m/s"
        }
    }',
    '{
        "water_hammer": {
            "triggers": ["rapid_deflector_closure", "emergency_stop"],
            "thresholds": {"pressure_spike": 150.0, "closure_time": 2.0}
        },
        "bucket_erosion": {
            "triggers": ["jet_misalignment", "sediment_content"],
            "thresholds": {"wear_rate": 0.3}
        }
    }'
);

-- =====================================================
-- 7. SEED TURBINE VARIANTS DATA
-- =====================================================

-- Kaplan Variants
INSERT INTO public.turbine_variants (variant, family, display_name, description, specific_tolerances, specific_sensors)
VALUES
('kaplan_vertical', 'kaplan', 'Vertical Kaplan', 'Standard vertical axis configuration for large run-of-river plants', '{}', '{}'),
('kaplan_horizontal', 'kaplan', 'Horizontal (Pit) Kaplan', 'Horizontal axis with lower profile for easier maintenance', 
    '{"hydraulic_shock_tolerance": {"value": 5.0, "unit": "bar/s", "critical": true}}',
    '{"additional": ["pipe_diameter", "hose_tension"]}'
),
('kaplan_pit', 'kaplan', 'PIT Kaplan', 'Compact design with generator above turbine', '{}', '{}'),
('kaplan_bulb', 'kaplan', 'Bulb Turbine', 'Submerged generator configuration for very low heads', 
    '{}',
    '{"additional": ["generator_submersion_depth", "seal_water_pressure"]}'
),
('kaplan_s', 'kaplan', 'S-Type Kaplan', 'Simplified design for cost-effective small hydro', 
    '{}',
    '{"additional": ["simplified_servo_pressure"]}'
),
('kaplan_spiral', 'kaplan', 'Spiral Kaplan', 'Spiral casing configuration', '{}', '{}'),

-- Francis Variants
('francis_vertical', 'francis', 'Vertical Francis', 'Standard vertical shaft configuration for high capacity', '{}', '{}'),
('francis_horizontal', 'francis', 'Horizontal Francis', 'Horizontal shaft for smaller units', '{}', '{}'),
('francis_slow_runner', 'francis', 'Slow Runner Francis', 'Low specific speed for high heads', 
    '{"runner_tip_clearance": {"value": 0.2, "unit": "mm", "critical": true}}',
    '{}'
),
('francis_fast_runner', 'francis', 'Fast Runner Francis', 'High specific speed for lower heads', '{}', '{}'),

-- Pelton Variants
('pelton_vertical', 'pelton', 'Vertical Pelton', 'Vertical shaft with 4-6 jets for higher power', 
    '{}',
    '{"jet_configuration": {"min": 4, "max": 6}}'
),
('pelton_horizontal', 'pelton', 'Horizontal Pelton', 'Horizontal shaft with 1-2 jets', 
    '{}',
    '{"jet_configuration": {"min": 1, "max": 2}}'
),
('pelton_multi_jet', 'pelton', 'Multi-Jet Pelton', 'Multiple nozzle configuration', '{}', '{}');

-- =====================================================
-- 8. MIGRATE EXISTING ASSETS
-- =====================================================

-- Update existing assets with turbine_family based on turbine_type
UPDATE public.assets 
SET turbine_family = 
    CASE 
        WHEN turbine_type ILIKE '%kaplan%' THEN 'kaplan'::turbine_family_enum
        WHEN turbine_type ILIKE '%francis%' THEN 'francis'::turbine_family_enum
        WHEN turbine_type ILIKE '%pelton%' THEN 'pelton'::turbine_family_enum
        WHEN type = 'HPP' THEN 'francis'::turbine_family_enum -- Default for generic HPP
        ELSE 'kaplan'::turbine_family_enum
    END
WHERE turbine_family IS NULL;

-- Set default variant (vertical for all families)
UPDATE public.assets 
SET turbine_variant = 
    CASE 
        WHEN turbine_family = 'kaplan' THEN 'kaplan_vertical'::turbine_variant_enum
        WHEN turbine_family = 'francis' THEN 'francis_vertical'::turbine_variant_enum
        WHEN turbine_family = 'pelton' THEN 'pelton_vertical'::turbine_variant_enum
        ELSE 'kaplan_vertical'::turbine_variant_enum
    END
WHERE turbine_variant IS NULL;

-- =====================================================
-- 9. RLS POLICIES
-- =====================================================

ALTER TABLE public.turbine_families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.turbine_families FOR SELECT USING (true);

ALTER TABLE public.turbine_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.turbine_variants FOR SELECT USING (true);

ALTER TABLE public.dynamic_sensor_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON public.dynamic_sensor_data FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.dynamic_sensor_data FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to get active thresholds for an asset (Instance > Variant > Family)
CREATE OR REPLACE FUNCTION get_active_thresholds(p_asset_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_asset_thresholds JSONB;
    v_variant_thresholds JSONB;
    v_family_thresholds JSONB;
    v_result JSONB;
BEGIN
    -- Get asset-specific thresholds
    SELECT operational_thresholds INTO v_asset_thresholds
    FROM assets WHERE id = p_asset_id;
    
    -- Get variant thresholds
    SELECT tv.specific_tolerances INTO v_variant_thresholds
    FROM assets a
    JOIN turbine_variants tv ON a.turbine_variant = tv.variant
    WHERE a.id = p_asset_id;
    
    -- Get family thresholds
    SELECT tf.default_tolerances INTO v_family_thresholds
    FROM assets a
    JOIN turbine_families tf ON a.turbine_family = tf.family
    WHERE a.id = p_asset_id;
    
    -- Merge with priority: asset > variant > family
    v_result := COALESCE(v_family_thresholds, '{}'::jsonb);
    v_result := v_result || COALESCE(v_variant_thresholds, '{}'::jsonb);
    v_result := v_result || COALESCE(v_asset_thresholds, '{}'::jsonb);
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE turbine_families IS 'Master reference for turbine families (Kaplan, Francis, Pelton) with default configurations';
COMMENT ON TABLE turbine_variants IS 'Specific turbine variants within each family';
COMMENT ON TABLE dynamic_sensor_data IS 'Time-series sensor data with family-specific JSONB fields for flexibility';
