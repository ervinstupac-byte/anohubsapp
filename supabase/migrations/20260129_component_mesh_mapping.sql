-- ============================================================
-- COMPONENT MESH ID MAPPING CORRECTION
-- Ensures expert_knowledge_base entries map to TurbineRunner3D mesh IDs
-- ============================================================

-- Add component_ids array column to expert_knowledge_base
ALTER TABLE public.expert_knowledge_base 
ADD COLUMN IF NOT EXISTS component_ids TEXT[] DEFAULT '{}';

-- Add physics_principle and common_failure_modes columns
ALTER TABLE public.expert_knowledge_base 
ADD COLUMN IF NOT EXISTS physics_principle TEXT DEFAULT NULL;

ALTER TABLE public.expert_knowledge_base 
ADD COLUMN IF NOT EXISTS common_failure_modes TEXT[] DEFAULT '{}';

-- Create index for component_ids lookup
CREATE INDEX IF NOT EXISTS ekb_component_ids_idx ON public.expert_knowledge_base USING GIN (component_ids);

-- ============================================================
-- UPDATE EXISTING ENTRIES WITH MESH ID MAPPINGS
-- Mesh IDs: crown, band, runner, noseCone, blade
-- ============================================================

-- HIGH_FREQ_NOISE_DROP_EFF -> Affects runner, band, noseCone
UPDATE public.expert_knowledge_base 
SET 
    component_ids = ARRAY['runner', 'band', 'noseCone'],
    physics_principle = 'Cavitation occurs when local static pressure drops below vapor pressure (Thoma criterion: σ = NPSH_available / H). High-frequency noise (1-10kHz) indicates bubble collapse near blade surfaces. Efficiency drop correlates with cavitation damage index.',
    common_failure_modes = ARRAY['Leading edge cavitation erosion', 'Trailing edge vortex shedding', 'Draft tube vortex rope']
WHERE symptom_key = 'HIGH_FREQ_NOISE_DROP_EFF';

-- BEARING_TEMP_RISE -> Affects crown (via shaft coupling), noseCone (thrust bearing)
UPDATE public.expert_knowledge_base 
SET 
    component_ids = ARRAY['crown', 'noseCone'],
    physics_principle = 'Bearing temperature governed by friction heat (Q = μ * P * V) and cooling capacity. Temperature rise indicates lubricant film breakdown or increased load. Thermal expansion affects clearances.',
    common_failure_modes = ARRAY['Lubricant degradation', 'Coolant system blockage', 'Excessive thrust loading']
WHERE symptom_key = 'BEARING_TEMP_RISE';

-- VIBRATION_CENTRAL_DEV -> Affects crown (shaft alignment), runner (balance)
UPDATE public.expert_knowledge_base 
SET 
    component_ids = ARRAY['crown', 'runner'],
    physics_principle = 'Vibration from shaft centerline deviation follows ISO 10816 standards. Frequency analysis reveals: 1x = unbalance/misalignment, 2x = misalignment, blade pass frequency = hydraulic excitation.',
    common_failure_modes = ARRAY['Shaft misalignment', 'Runner mass unbalance', 'Foundation settlement']
WHERE symptom_key = 'VIBRATION_CENTRAL_DEV';

-- RUNAWAY_SPEED_RISK -> Affects all components (system-wide emergency)
UPDATE public.expert_knowledge_base 
SET 
    component_ids = ARRAY['crown', 'band', 'runner', 'noseCone'],
    physics_principle = 'Runaway speed occurs when torque balance fails (hydraulic torque > load torque). Speed can reach 1.8-2.2x rated. Centrifugal stress follows σ = ρ * ω² * r², causing catastrophic failure.',
    common_failure_modes = ARRAY['Governor failure', 'Guide vane linkage jamming', 'Load rejection without protection']
WHERE symptom_key = 'RUNAWAY_SPEED_RISK';

-- TELEMETRY_ALARM -> Generic, affects all components based on sensor location
UPDATE public.expert_knowledge_base 
SET 
    component_ids = ARRAY['crown', 'band', 'runner', 'noseCone'],
    physics_principle = 'Telemetry threshold breach indicates operating parameter exceedance. Response time critical for damage prevention. Alarm cascade follows severity hierarchy.',
    common_failure_modes = ARRAY['Sensor drift', 'Actual parameter exceedance', 'Communication failure']
WHERE symptom_key = 'TELEMETRY_ALARM';

-- METAL_SCRAPING -> Affects band (seal contact), runner (labyrinth seals)
UPDATE public.expert_knowledge_base 
SET 
    component_ids = ARRAY['band', 'runner'],
    physics_principle = 'Metal contact indicates clearance loss. Seal wear follows Archard equation (V = K * L * P / H). Acoustic signature in 0.5-5kHz range characteristic of metallic rub.',
    common_failure_modes = ARRAY['Thermal expansion exceeding clearance', 'Bearing failure allowing shaft movement', 'Foreign object damage']
WHERE symptom_key = 'METAL_SCRAPING';

-- STRUCTURAL_DEV -> Affects crown (foundation connection), band (casing alignment)
UPDATE public.expert_knowledge_base 
SET 
    component_ids = ARRAY['crown', 'band'],
    physics_principle = 'Structural deviation measured via laser alignment and proximity sensors. Foundation settlement follows logarithmic time relationship. Bolt tension relaxation reduces clamping force.',
    common_failure_modes = ARRAY['Foundation settlement', 'Anchor bolt relaxation', 'Thermal distortion']
WHERE symptom_key = 'STRUCTURAL_DEV';

-- ============================================================
-- INSERT COMPONENT-SPECIFIC ENCYCLOPEDIA ENTRIES
-- These provide detailed physics for each mesh ID
-- ============================================================

INSERT INTO public.expert_knowledge_base (
    symptom_key, 
    diagnosis, 
    recommended_action, 
    severity,
    component_ids,
    physics_principle,
    common_failure_modes
) VALUES
-- Crown-specific entry
(
    'CROWN_STRESS_FATIGUE',
    'Crown plate showing fatigue indicators or stress concentration anomalies.',
    'Perform dye penetrant testing on bolt holes and fillet welds. Check torque on crown bolts per OEM specification.',
    'HIGH',
    ARRAY['crown'],
    'Torque transmission through crown follows shear stress distribution. Bolt preload maintains joint integrity via friction grip. Fatigue life at stress concentrations governed by S-N curve and stress concentration factor (Kt).',
    ARRAY['Bolt loosening from thermal cycling', 'Fatigue cracking at stress concentrations', 'Corrosion-fatigue at water contact zones', 'Fretting corrosion at shaft interface']
),
-- Band-specific entry
(
    'BAND_SEAL_WEAR',
    'Band ring seal wear indicated by increased leakage or efficiency loss.',
    'Measure labyrinth seal clearances. Replace seals if clearance exceeds 2x nominal. Check for sediment accumulation.',
    'MEDIUM',
    ARRAY['band'],
    'Band ring experiences hoop stress from internal pressure differential (σ_hoop = p*r/t). Seal effectiveness follows exponential decay with clearance increase. Leakage flow proportional to clearance cubed.',
    ARRAY['Cavitation erosion at leading edges', 'Sediment abrasion', 'Seal wear from debris', 'Thermal distortion']
),
-- Runner-specific entry  
(
    'RUNNER_BLADE_EROSION',
    'Runner blade surface erosion detected via vibration signature or visual inspection.',
    'Perform borescope inspection. Map erosion pattern. Schedule coating repair or blade replacement based on erosion depth.',
    'HIGH',
    ARRAY['runner'],
    'Energy conversion via Euler turbine equation (E = u1*cu1 - u2*cu2). Blade natural frequency must avoid excitation at blade pass frequency (f = n*Z/60). Erosion rate follows velocity^3 relationship.',
    ARRAY['Leading edge cavitation erosion', 'Trailing edge vortex shedding', 'Fatigue cracking at blade root', 'Hydraulic imbalance from wear']
),
-- NoseCone-specific entry
(
    'NOSECONE_VORTEX_ROPE',
    'Draft tube vortex rope indicated by low-frequency pressure pulsations and noise.',
    'Adjust operating point to avoid part-load vortex regime. Consider air injection if persistent. Monitor draft tube pressure sensors.',
    'MEDIUM',
    ARRAY['noseCone'],
    'Pressure recovery via controlled diffusion (optimal cone angle 7-10°). Vortex rope forms at part-load (40-75% load) following Strouhal number relationship. Frequency typically 0.2-0.4x runner speed.',
    ARRAY['Vortex rope induced vibration', 'Cavitation at low submergence', 'Erosion from recirculation zones', 'Concrete spalling in draft tube']
)
ON CONFLICT (symptom_key) DO UPDATE SET
    component_ids = EXCLUDED.component_ids,
    physics_principle = EXCLUDED.physics_principle,
    common_failure_modes = EXCLUDED.common_failure_modes;

-- ============================================================
-- CREATE COMPONENT MAPPING VIEW FOR EASY LOOKUP
-- ============================================================
CREATE OR REPLACE VIEW public.component_knowledge_mapping AS
SELECT 
    unnest(component_ids) as mesh_id,
    symptom_key,
    diagnosis,
    recommended_action,
    severity,
    physics_principle,
    common_failure_modes
FROM public.expert_knowledge_base
WHERE component_ids IS NOT NULL AND array_length(component_ids, 1) > 0;

-- Create function for mesh ID lookup
CREATE OR REPLACE FUNCTION get_knowledge_for_component(p_mesh_id TEXT)
RETURNS TABLE (
    symptom_key TEXT,
    diagnosis TEXT,
    recommended_action TEXT,
    severity TEXT,
    physics_principle TEXT,
    common_failure_modes TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ekb.symptom_key,
        ekb.diagnosis,
        ekb.recommended_action,
        ekb.severity,
        ekb.physics_principle,
        ekb.common_failure_modes
    FROM public.expert_knowledge_base ekb
    WHERE p_mesh_id = ANY(ekb.component_ids);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- MAPPING VERIFICATION COMMENT
-- ============================================================
-- TurbineRunner3D Mesh IDs:        EKB Mappings:
-- -------------------------------- --------------------------------
-- crown                           -> VIBRATION_CENTRAL_DEV, BEARING_TEMP_RISE, 
--                                    STRUCTURAL_DEV, CROWN_STRESS_FATIGUE
-- band                            -> HIGH_FREQ_NOISE_DROP_EFF, METAL_SCRAPING,
--                                    STRUCTURAL_DEV, BAND_SEAL_WEAR
-- runner                          -> HIGH_FREQ_NOISE_DROP_EFF, VIBRATION_CENTRAL_DEV,
--                                    METAL_SCRAPING, RUNNER_BLADE_EROSION
-- noseCone                        -> HIGH_FREQ_NOISE_DROP_EFF, BEARING_TEMP_RISE,
--                                    NOSECONE_VORTEX_ROPE
-- blade (alias for runner)        -> Same as runner
-- ============================================================
