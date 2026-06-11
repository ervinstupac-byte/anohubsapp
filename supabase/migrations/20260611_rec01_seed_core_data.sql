-- =============================================================================
-- MIGRATION #1: Seed Core Data
-- Creates minimum viable data so the app renders real content.
-- Run AFTER all schema migrations.
-- Adjust values to match your real plant/turbine specs!
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1a. Plants (hydropower sites)
-- ---------------------------------------------------------------------------
INSERT INTO public.plants (id, name, location_name, gps_lat, gps_lng, elevation_masl, ambient_temp_avg, humidity_avg)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Jablanica HPP',   'Jablanica, Bosnia',  43.6600,  17.7500, 254.0, 14.5, 68.0),
  ('11111111-0000-0000-0000-000000000002', 'Rama HPP',        'Prozor-Rama, Bosnia',43.7100,  17.7000, 730.0, 13.0, 72.0),
  ('11111111-0000-0000-0000-000000000003', 'Grabovica HPP',   'Grabovica, Bosnia',  43.5500,  17.8200, 188.0, 15.0, 65.0)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1b. Assets (turbine units)
-- The single asset already in the DB has id 00000000-0000-0000-0000-000000000001
-- We'll update that + add more.
-- ---------------------------------------------------------------------------
UPDATE public.assets SET
  name              = 'Francis Unit A1',
  type              = 'hydro_turbine',
  location          = 'Jablanica HPP — Unit 1',
  turbine_type      = 'FRANCIS',
  turbine_family    = 'FRANCIS',
  turbine_variant   = 'FRANCIS_HORIZONTAL_5MW',
  power_output      = 5000,
  status            = 'OPERATIONAL',
  operating_hours   = 18450,
  maintenance_threshold = 20000,
  specs = '{
    "design_head_m": 95,
    "design_flow_cms": 6.5,
    "rated_power_kw": 5000,
    "rated_speed_rpm": 375,
    "runner_diameter_m": 1.42,
    "plant_id": "11111111-0000-0000-0000-000000000001",
    "gross_head_m": 97,
    "design_eta": 0.924,
    "design_flow_cms": 6.5
  }'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Add additional assets
INSERT INTO public.assets (id, name, type, location, turbine_type, turbine_family, turbine_variant,
  power_output, status, operating_hours, maintenance_threshold, specs)
VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'Francis Unit A2', 'hydro_turbine', 'Jablanica HPP — Unit 2',
    'FRANCIS', 'FRANCIS', 'FRANCIS_HORIZONTAL_5MW', 5000, 'OPERATIONAL', 22300, 20000,
    '{"design_head_m":95,"design_flow_cms":6.5,"rated_power_kw":5000,"rated_speed_rpm":375,"runner_diameter_m":1.42,"plant_id":"11111111-0000-0000-0000-000000000001","gross_head_m":97,"design_eta":0.921}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Pelton Unit B1', 'hydro_turbine', 'Rama HPP — Unit 1',
    'PELTON', 'PELTON', 'PELTON_VERTICAL_8MW', 8000, 'OPERATIONAL', 9800, 15000,
    '{"design_head_m":310,"design_flow_cms":3.2,"rated_power_kw":8000,"rated_speed_rpm":600,"runner_diameter_m":1.85,"plant_id":"11111111-0000-0000-0000-000000000002","gross_head_m":315,"design_eta":0.934}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Kaplan Unit C1', 'hydro_turbine', 'Grabovica HPP — Unit 1',
    'KAPLAN', 'KAPLAN', 'KAPLAN_BULB_3MW', 3000, 'MAINTENANCE', 31200, 20000,
    '{"design_head_m":12,"design_flow_cms":35.0,"rated_power_kw":3000,"rated_speed_rpm":125,"runner_diameter_m":3.2,"plant_id":"11111111-0000-0000-0000-000000000003","gross_head_m":13,"design_eta":0.889}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1c. Sensor Registry — register sensors for each asset
-- ---------------------------------------------------------------------------
INSERT INTO public.sensor_registry (asset_id, sensor_id, sensor_type, unit, description, nominal_min, nominal_max, is_active)
VALUES
  -- Francis A1
  ('00000000-0000-0000-0000-000000000001', 'SEN-A1-VIB-01', 'vibration',    'mm/s', 'Bearing vibration — Turbine side',   0.0, 4.5,  true),
  ('00000000-0000-0000-0000-000000000001', 'SEN-A1-VIB-02', 'vibration',    'mm/s', 'Bearing vibration — Generator side', 0.0, 4.5,  true),
  ('00000000-0000-0000-0000-000000000001', 'SEN-A1-TMP-01', 'temperature',  '°C',   'Bearing temperature — upper',        0.0, 70.0, true),
  ('00000000-0000-0000-0000-000000000001', 'SEN-A1-TMP-02', 'temperature',  '°C',   'Oil temperature',                    0.0, 65.0, true),
  ('00000000-0000-0000-0000-000000000001', 'SEN-A1-PWR-01', 'power',        'kW',   'Active power output',                0.0, 5200, true),
  ('00000000-0000-0000-0000-000000000001', 'SEN-A1-FLW-01', 'flow',         'm³/s', 'Penstock flow rate',                 0.0, 7.5,  true),
  -- Francis A2
  ('00000000-0000-0000-0000-000000000002', 'SEN-A2-VIB-01', 'vibration',    'mm/s', 'Bearing vibration — Turbine side',   0.0, 4.5,  true),
  ('00000000-0000-0000-0000-000000000002', 'SEN-A2-TMP-01', 'temperature',  '°C',   'Bearing temperature — upper',        0.0, 70.0, true),
  ('00000000-0000-0000-0000-000000000002', 'SEN-A2-PWR-01', 'power',        'kW',   'Active power output',                0.0, 5200, true),
  -- Pelton B1
  ('00000000-0000-0000-0000-000000000003', 'SEN-B1-VIB-01', 'vibration',    'mm/s', 'Main shaft vibration',              0.0, 3.5,  true),
  ('00000000-0000-0000-0000-000000000003', 'SEN-B1-TMP-01', 'temperature',  '°C',   'Bearing temperature',               0.0, 65.0, true),
  ('00000000-0000-0000-0000-000000000003', 'SEN-B1-PWR-01', 'power',        'kW',   'Active power output',               0.0, 8200, true),
  -- Kaplan C1
  ('00000000-0000-0000-0000-000000000004', 'SEN-C1-VIB-01', 'vibration',    'mm/s', 'Runner vibration',                  0.0, 5.0,  true),
  ('00000000-0000-0000-0000-000000000004', 'SEN-C1-TMP-01', 'temperature',  '°C',   'Guide bearing temperature',         0.0, 75.0, true),
  ('00000000-0000-0000-0000-000000000004', 'SEN-C1-PWR-01', 'power',        'kW',   'Active power output',               0.0, 3100, true)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1d. Threshold Configs — already has 3 rows, add per new asset
-- ---------------------------------------------------------------------------
INSERT INTO public.threshold_configs (asset_id, vibration_mm_s)
VALUES
  ('00000000-0000-0000-0000-000000000002', 4.5),
  ('00000000-0000-0000-0000-000000000003', 3.5),
  ('00000000-0000-0000-0000-000000000004', 5.0)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1e. Hydrology Context
-- ---------------------------------------------------------------------------
INSERT INTO public.hydrology_context (plant_id, design_head, design_flow, ecological_flow, catchment_area_km2, mean_annual_runoff_mm)
VALUES
  ('11111111-0000-0000-0000-000000000001', 95.0,  13.0, 1.5,  2850.0, 980.0),
  ('11111111-0000-0000-0000-000000000002', 310.0,  3.2, 0.8,  1240.0, 1150.0),
  ('11111111-0000-0000-0000-000000000003', 12.0,  35.0, 4.2,  4200.0, 870.0)
ON CONFLICT (plant_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1f. Turbine Families & Variants (reference data)
-- ---------------------------------------------------------------------------
INSERT INTO public.turbine_families (id, name)
VALUES
  (gen_random_uuid(), 'FRANCIS'),
  (gen_random_uuid(), 'PELTON'),
  (gen_random_uuid(), 'KAPLAN')
ON CONFLICT DO NOTHING;

INSERT INTO public.turbine_variants (id, name)
VALUES
  (gen_random_uuid(), 'FRANCIS_HORIZONTAL_5MW'),
  (gen_random_uuid(), 'FRANCIS_VERTICAL_10MW'),
  (gen_random_uuid(), 'PELTON_VERTICAL_8MW'),
  (gen_random_uuid(), 'PELTON_HORIZONTAL_2MW'),
  (gen_random_uuid(), 'KAPLAN_BULB_3MW'),
  (gen_random_uuid(), 'KAPLAN_VERTICAL_6MW')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1g. Expert Knowledge Base — seed with common Francis turbine diagnostics
-- ---------------------------------------------------------------------------
INSERT INTO public.expert_knowledge_base (symptom_key, turbine_family, probable_cause, severity, recommended_action, confidence)
VALUES
  ('high_vibration_bearing',   'FRANCIS', 'Bearing wear or misalignment',          'high',     'Schedule bearing inspection within 72h. Check alignment with laser tool.', 0.88),
  ('high_bearing_temperature', 'FRANCIS', 'Insufficient lubrication or overload',   'high',     'Check oil level and quality. Reduce load by 10% and monitor 1h.', 0.82),
  ('efficiency_drop_5pct',     'FRANCIS', 'Runner erosion or cavitation damage',    'medium',   'Schedule underwater inspection. Compare with Hill chart baseline.', 0.75),
  ('cavitation_noise',         'FRANCIS', 'Operating below Sigma critical',          'critical', 'Immediately adjust gate opening. Check tailwater level.', 0.91),
  ('power_fluctuation',        'FRANCIS', 'Governor instability or penstock surge', 'medium',   'Check governor deadband setting. Inspect surge tank level.', 0.70),
  ('oil_pressure_drop',        'PELTON',  'Governor oil leak or pump failure',      'critical', 'Emergency stop if pressure below 40 bar. Inspect governor oil circuit.', 0.93),
  ('jet_deflector_fault',      'PELTON',  'Deflector actuator failure',             'critical', 'Switch to manual control. Inspect deflector hydraulic circuit.', 0.89),
  ('draft_tube_surge',         'KAPLAN',  'Partial load vortex rope',               'medium',   'Increase load to above 65% rated. Install air injection if persistent.', 0.77),
  ('runner_blade_erosion',     'KAPLAN',  'Sediment abrasion from high silt content', 'medium', 'Schedule inspection. Consider wear-resistant coating on runner blades.', 0.72),
  ('seal_water_high_flow',     'FRANCIS', 'Worn shaft seal or labyrinth seal',      'low',      'Monitor seal water consumption. Plan seal replacement at next outage.', 0.80)
ON CONFLICT (symptom_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1h. Initial Work Order (to populate the work orders table)
-- ---------------------------------------------------------------------------
INSERT INTO public.work_orders (id, asset_id, title, issue_type, status, priority, description, trigger_source, estimated_hours)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000004',
  'Kaplan C1 — Annual Overhaul',
  'PLANNED_MAINTENANCE',
  'IN_PROGRESS',
  'HIGH',
  'Annual scheduled overhaul. Runner blade inspection, guide vane servicing, bearing replacement.',
  'SCHEDULED',
  120
) ON CONFLICT DO NOTHING;
