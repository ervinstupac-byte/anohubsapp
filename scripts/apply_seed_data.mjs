import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cplfoowmdakqzoljuwcf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbGZvb3dtZGFrcXpvbGp1d2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUxMjE3NSwiZXhwIjoyMDk2MDg4MTc1fQ.tFTDn1l78BEYlloK_jsQ1U5NXzWbvJDUP4BSOml61o8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  try {
    console.log('Seeding Plants...');
    const { error: plantsErr } = await supabase.from('plants').upsert([
      { id: '11111111-0000-0000-0000-000000000001', name: 'Jablanica HPP', location_name: 'Jablanica, Bosnia', gps_lat: 43.6600, gps_lng: 17.7500, elevation_masl: 254.0, ambient_temp_avg: 14.5, humidity_avg: 68.0 },
      { id: '11111111-0000-0000-0000-000000000002', name: 'Rama HPP', location_name: 'Prozor-Rama, Bosnia', gps_lat: 43.7100, gps_lng: 17.7000, elevation_masl: 730.0, ambient_temp_avg: 13.0, humidity_avg: 72.0 },
      { id: '11111111-0000-0000-0000-000000000003', name: 'Grabovica HPP', location_name: 'Grabovica, Bosnia', gps_lat: 43.5500, gps_lng: 17.8200, elevation_masl: 188.0, ambient_temp_avg: 15.0, humidity_avg: 65.0 }
    ], { onConflict: 'id' });
    if (plantsErr) throw plantsErr;

    console.log('Updating Francis Unit A1...');
    const { error: assetUpdateErr } = await supabase.from('assets').update({
      name: 'Francis Unit A1',
      type: 'hydro_turbine',
      location: 'Jablanica HPP — Unit 1',
      turbine_type: 'FRANCIS',
      turbine_family: 'francis',
      turbine_variant: 'francis_horizontal',
      power_output: 5000,
      status: 'OPERATIONAL',
      operating_hours: 18450,
      maintenance_threshold: 20000,
      specs: {
        design_head_m: 95,
        design_flow_cms: 6.5,
        rated_power_kw: 5000,
        rated_speed_rpm: 375,
        runner_diameter_m: 1.42,
        plant_id: "11111111-0000-0000-0000-000000000001",
        gross_head_m: 97,
        design_eta: 0.924
      }
    }).eq('id', '00000000-0000-0000-0000-000000000001');
    if (assetUpdateErr) throw assetUpdateErr;

    console.log('Inserting additional Assets...');
    const { error: assetsErr } = await supabase.from('assets').upsert([
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Francis Unit A2', type: 'hydro_turbine', location: 'Jablanica HPP — Unit 2',
        turbine_type: 'FRANCIS', turbine_family: 'francis', turbine_variant: 'francis_horizontal', power_output: 5000, status: 'OPERATIONAL', operating_hours: 22300, maintenance_threshold: 20000,
        specs: { design_head_m: 95, design_flow_cms: 6.5, rated_power_kw: 5000, rated_speed_rpm: 375, runner_diameter_m: 1.42, plant_id: "11111111-0000-0000-0000-000000000001", gross_head_m: 97, design_eta: 0.921 }
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Pelton Unit B1', type: 'hydro_turbine', location: 'Rama HPP — Unit 1',
        turbine_type: 'PELTON', turbine_family: 'pelton', turbine_variant: 'pelton_vertical', power_output: 8000, status: 'OPERATIONAL', operating_hours: 9800, maintenance_threshold: 15000,
        specs: { design_head_m: 310, design_flow_cms: 3.2, rated_power_kw: 8000, rated_speed_rpm: 600, runner_diameter_m: 1.85, plant_id: "11111111-0000-0000-0000-000000000002", gross_head_m: 315, design_eta: 0.934 }
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Kaplan Unit C1', type: 'hydro_turbine', location: 'Grabovica HPP — Unit 1',
        turbine_type: 'KAPLAN', turbine_family: 'kaplan', turbine_variant: 'kaplan_bulb', power_output: 3000, status: 'MAINTENANCE', operating_hours: 31200, maintenance_threshold: 20000,
        specs: { design_head_m: 12, design_flow_cms: 35.0, rated_power_kw: 3000, rated_speed_rpm: 125, runner_diameter_m: 3.2, plant_id: "11111111-0000-0000-0000-000000000003", gross_head_m: 13, design_eta: 0.889 }
      }
    ], { onConflict: 'id' });
    if (assetsErr) throw assetsErr;

    console.log('Seeding Sensor Registry...');
    const { error: sensorsErr } = await supabase.from('sensor_registry').upsert([
      { asset_id: '00000000-0000-0000-0000-000000000001', sensor_id: 'SEN-A1-VIB-01', sensor_type: 'vibration', unit: 'mm/s', description: 'Bearing vibration — Turbine side', nominal_min: 0.0, nominal_max: 4.5, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000001', sensor_id: 'SEN-A1-VIB-02', sensor_type: 'vibration', unit: 'mm/s', description: 'Bearing vibration — Generator side', nominal_min: 0.0, nominal_max: 4.5, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000001', sensor_id: 'SEN-A1-TMP-01', sensor_type: 'temperature', unit: '°C', description: 'Bearing temperature — upper', nominal_min: 0.0, nominal_max: 70.0, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000001', sensor_id: 'SEN-A1-TMP-02', sensor_type: 'temperature', unit: '°C', description: 'Oil temperature', nominal_min: 0.0, nominal_max: 65.0, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000001', sensor_id: 'SEN-A1-PWR-01', sensor_type: 'power', unit: 'kW', description: 'Active power output', nominal_min: 0.0, nominal_max: 5200.0, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000001', sensor_id: 'SEN-A1-FLW-01', sensor_type: 'flow', unit: 'm³/s', description: 'Penstock flow rate', nominal_min: 0.0, nominal_max: 7.5, is_active: true },
      
      { asset_id: '00000000-0000-0000-0000-000000000002', sensor_id: 'SEN-A2-VIB-01', sensor_type: 'vibration', unit: 'mm/s', description: 'Bearing vibration — Turbine side', nominal_min: 0.0, nominal_max: 4.5, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000002', sensor_id: 'SEN-A2-TMP-01', sensor_type: 'temperature', unit: '°C', description: 'Bearing temperature — upper', nominal_min: 0.0, nominal_max: 70.0, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000002', sensor_id: 'SEN-A2-PWR-01', sensor_type: 'power', unit: 'kW', description: 'Active power output', nominal_min: 0.0, nominal_max: 5200.0, is_active: true },

      { asset_id: '00000000-0000-0000-0000-000000000003', sensor_id: 'SEN-B1-VIB-01', sensor_type: 'vibration', unit: 'mm/s', description: 'Main shaft vibration', nominal_min: 0.0, nominal_max: 3.5, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000003', sensor_id: 'SEN-B1-TMP-01', sensor_type: 'temperature', unit: '°C', description: 'Bearing temperature', nominal_min: 0.0, nominal_max: 65.0, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000003', sensor_id: 'SEN-B1-PWR-01', sensor_type: 'power', unit: 'kW', description: 'Active power output', nominal_min: 0.0, nominal_max: 8200.0, is_active: true },

      { asset_id: '00000000-0000-0000-0000-000000000004', sensor_id: 'SEN-C1-VIB-01', sensor_type: 'vibration', unit: 'mm/s', description: 'Runner vibration', nominal_min: 0.0, nominal_max: 5.0, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000004', sensor_id: 'SEN-C1-TMP-01', sensor_type: 'temperature', unit: '°C', description: 'Guide bearing temperature', nominal_min: 0.0, nominal_max: 75.0, is_active: true },
      { asset_id: '00000000-0000-0000-0000-000000000004', sensor_id: 'SEN-C1-PWR-01', sensor_type: 'power', unit: 'kW', description: 'Active power output', nominal_min: 0.0, nominal_max: 3100.0, is_active: true }
    ], { onConflict: 'sensor_id' });
    if (sensorsErr) throw sensorsErr;

    console.log('Seeding Threshold Configs...');
    const { error: thresholdErr } = await supabase.from('threshold_configs').upsert([
      { asset_id: '00000000-0000-0000-0000-000000000002', vibration_mm_s: 4.5 },
      { asset_id: '00000000-0000-0000-0000-000000000003', vibration_mm_s: 3.5 },
      { asset_id: '00000000-0000-0000-0000-000000000004', vibration_mm_s: 5.0 }
    ], { onConflict: 'asset_id' });
    if (thresholdErr) throw thresholdErr;

    console.log('Seeding Hydrology Context...');
    const { error: hydrologyErr } = await supabase.from('hydrology_context').upsert([
      { plant_id: '11111111-0000-0000-0000-000000000001', design_head: 95.0, design_flow: 13.0, ecological_flow: 1.5, catchment_area_km2: 2850.0, mean_annual_runoff_mm: 980.0 },
      { plant_id: '11111111-0000-0000-0000-000000000002', design_head: 310.0, design_flow: 3.2, ecological_flow: 0.8, catchment_area_km2: 1240.0, mean_annual_runoff_mm: 1150.0 },
      { plant_id: '11111111-0000-0000-0000-000000000003', design_head: 12.0, design_flow: 35.0, ecological_flow: 4.2, catchment_area_km2: 4200.0, mean_annual_runoff_mm: 870.0 }
    ], { onConflict: 'plant_id' });
    if (hydrologyErr) throw hydrologyErr;

    console.log('Seeding Expert Knowledge Base...');
    const { error: kbErr } = await supabase.from('expert_knowledge_base').upsert([
      { symptom_key: 'high_vibration_bearing', turbine_family: 'FRANCIS', probable_cause: 'Bearing wear or misalignment', severity: 'high', recommended_action: 'Schedule bearing inspection within 72h. Check alignment with laser tool.', confidence: 0.88 },
      { symptom_key: 'high_bearing_temperature', turbine_family: 'FRANCIS', probable_cause: 'Insufficient lubrication or overload', severity: 'high', recommended_action: 'Check oil level and quality. Reduce load by 10% and monitor 1h.', confidence: 0.82 },
      { symptom_key: 'efficiency_drop_5pct', turbine_family: 'FRANCIS', probable_cause: 'Runner erosion or cavitation damage', severity: 'medium', recommended_action: 'Schedule underwater inspection. Compare with Hill chart baseline.', confidence: 0.75 },
      { symptom_key: 'cavitation_noise', turbine_family: 'FRANCIS', probable_cause: 'Operating below Sigma critical', severity: 'critical', recommended_action: 'Immediately adjust gate opening. Check tailwater level.', confidence: 0.91 },
      { symptom_key: 'power_fluctuation', turbine_family: 'FRANCIS', probable_cause: 'Governor instability or penstock surge', severity: 'medium', recommended_action: 'Check governor deadband setting. Inspect surge tank level.', confidence: 0.70 },
      { symptom_key: 'oil_pressure_drop', turbine_family: 'PELTON', probable_cause: 'Governor oil leak or pump failure', severity: 'critical', recommended_action: 'Emergency stop if pressure below 40 bar. Inspect governor oil circuit.', confidence: 0.93 },
      { symptom_key: 'jet_deflector_fault', turbine_family: 'PELTON', probable_cause: 'Deflector actuator failure', severity: 'critical', recommended_action: 'Switch to manual control. Inspect deflector hydraulic circuit.', confidence: 0.89 },
      { symptom_key: 'draft_tube_surge', turbine_family: 'KAPLAN', probable_cause: 'Partial load vortex rope', severity: 'medium', recommended_action: 'Increase load to above 65% rated. Install air injection if persistent.', confidence: 0.77 },
      { symptom_key: 'runner_blade_erosion', turbine_family: 'KAPLAN', probable_cause: 'Sediment abrasion from high silt content', severity: 'medium', recommended_action: 'Schedule inspection. Consider wear-resistant coating on runner blades.', confidence: 0.72 },
      { symptom_key: 'seal_water_high_flow', turbine_family: 'FRANCIS', probable_cause: 'Worn shaft seal or labyrinth seal', severity: 'low', recommended_action: 'Monitor seal water consumption. Plan seal replacement at next outage.', confidence: 0.80 }
    ], { onConflict: 'symptom_key' });
    if (kbErr) throw kbErr;

    console.log('Seeding Work Orders...');
    const { error: woErr } = await supabase.from('work_orders').upsert([
      {
        id: '22222222-0000-0000-0000-000000000001',
        asset_id: '00000000-0000-0000-0000-000000000004',
        title: 'Kaplan C1 — Annual Overhaul',
        issue_type: 'PLANNED_MAINTENANCE',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        description: 'Annual scheduled overhaul. Runner blade inspection, guide vane servicing, bearing replacement.',
        trigger_source: 'SCHEDULED',
        estimated_hours: 120
      }
    ], { onConflict: 'id' });
    if (woErr) throw woErr;

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error applying seed data:', err.message || err);
  }
}

main();
