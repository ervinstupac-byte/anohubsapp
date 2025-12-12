export type ComponentRiskLevel = 'High' | 'Medium' | 'Low';

export interface ComponentRisk {
  text: string;
  level: ComponentRiskLevel;
}

export interface ComponentData {
  id: string;
  title: string;
  description: string;
  kpis: string[];
  risks: ComponentRisk[];
}

export const componentData: ComponentData[] = [
  {
    id: 'design',
    title: 'Overall Plant Design & Engineering',
    description: 'A holistic engineering approach covering civil structures, equipment selection, layout, and system integration. This phase dictates the long-term performance and represents the first opportunity to close the Execution Gap.',
    kpis: [
      'Overall plant efficiency (water-to-wire)',
      'Availability and reliability factors (>99%)',
      'Construction costs versus budget (CAPEX accuracy)',
      'Adherence to safety and environmental mandates',
    ],
    risks: [
      { text: 'Incorrect civil engineering design (intake/tailrace)', level: 'High' },
      { text: 'Poor equipment specification (undersized components)', level: 'High' },
      { text: 'Inefficient hydraulic layout increasing losses', level: 'Medium' },
      { text: 'Insufficient safety considerations (HSE risks)', level: 'High' },
    ],
  },
  {
    id: 'miv',
    title: 'Main Inlet Valve (MIV)',
    description: 'The primary safety shut-off valve. Its reliability is non-negotiable for plant safety and maintenance isolation. Failure here represents a catastrophic risk.',
    kpis: [
      'Closing time in emergencies (<60 seconds)',
      'Sealing efficiency (Zero leakage mandate)',
      'Reliability (successful operations count)',
      'Hydraulic actuator pressure integrity',
    ],
    risks: [
      { text: 'Failure to close (Catastrophic safety risk)', level: 'High' },
      { text: 'Failure to open (Production loss)', level: 'High' },
      { text: 'Seal leakage causing water loss and erosion', level: 'Medium' },
      { text: 'Hydraulic actuator or counterweight failure', level: 'High' },
    ],
  },
  {
    id: 'rotor',
    title: 'Turbine Runner and Blades',
    description: 'The heart of energy conversion. Blades must be designed for maximum efficiency and treated with 13Cr4Ni to ensure immunity against cavitation and erosion.',
    kpis: [
      'Energy conversion efficiency (>94%)',
      'Vibration levels (ISO 20816 compliance)',
      'Cavitation/Erosion rate (mm/year)',
      'Mean Time Between Overhauls (MTBO)',
    ],
    risks: [
      { text: 'Fatigue cracks on runner blades', level: 'High' },
      { text: 'Runner imbalance causing systemic vibration', level: 'Medium' },
      { text: 'Cavitation damage reducing efficiency', level: 'High' },
      { text: 'Sediment erosion on leading edges', level: 'Medium' },
    ],
  },
  {
    id: 'guide_vanes',
    title: 'Guide Vane Apparatus (Wicket Gate)',
    description: 'The regulation mechanism controlling flow and power. Precision in linkage and clearances is vital to prevent leakage and ensure responsive grid regulation.',
    kpis: [
      'Positioning accuracy and hysteresis',
      'Leakage in the closed position (zero-flow)',
      'Wear rate on facing plates and pivots',
      'Shear pin integrity',
    ],
    risks: [
      { text: 'Jamming due to debris or sediment wedge', level: 'High' },
      { text: 'Excessive leakage causing creep rotation', level: 'Medium' },
      { text: 'Premature shear pin failure', level: 'Medium' },
      { text: 'Linkage mechanism wear and backlash', level: 'High' },
    ],
  },
  {
    id: 'shaft_sealing',
    title: 'Shaft Sealing System',
    description: 'The barrier between the river and the powerhouse. Modern mechanical or carbon seals must be monitored to prevent flooding and ensure environmental compliance.',
    kpis: [
      'Water leakage rate (L/min)',
      'Cooling/flushing water consumption',
      'Seal face temperature',
      'Lifespan of sealing elements',
    ],
    risks: [
      { text: 'Catastrophic leakage leading to flooding', level: 'High' },
      { text: 'Loss of vacuum in draft tube (Reaction turbines)', level: 'Medium' },
      { text: 'Shaft sleeve wear at sealing location', level: 'Medium' },
      { text: 'Cooling water failure causing burnout', level: 'High' },
    ],
  },
  {
    id: 'bearings',
    title: 'Bearings (Guide and Thrust)',
    description: 'These support the rotating mass and hydraulic thrust. Their health is directly linked to the "0.05 mm/m" alignment mandate. Failure here is often a symptom of poor alignment.',
    kpis: [
      'Operating temperature (<65°C)',
      'Oil film thickness and pressure',
      'Vibration levels on bearing housing',
      'Oil cleanliness (ISO 4406)',
    ],
    risks: [
      { text: 'Wiping of white metal (Babbitt) due to overheating', level: 'High' },
      { text: 'Wear due to oil contamination', level: 'Medium' },
      { text: 'Lubrication pump failure', level: 'High' },
      { text: 'Oil film instability (Oil Whirl/Whip)', level: 'Medium' },
    ],
  },
  {
    id: 'generator',
    title: 'Generator',
    description: 'Converts mechanical torque into electrical power. Its insulation and cooling systems are critical for longevity and efficiency.',
    kpis: [
      'Generator efficiency (>98%)',
      'Stator winding temperature',
      'Partial Discharge (PD) trends',
      'Insulation Resistance (IR)',
    ],
    risks: [
      { text: 'Stator winding insulation breakdown', level: 'High' },
      { text: 'Rotor earth faults', level: 'High' },
      { text: 'Bearing currents causing pitting', level: 'Medium' },
      { text: 'Excitation system failure', level: 'Medium' },
    ],
  },
  {
    id: 'control_system',
    title: 'Control System (SCADA & PLC)',
    description: 'The brain of the plant. It enables the "Digital Twin", predictive maintenance (AI), and remote operation. Obsolescence here is a major strategic risk.',
    kpis: [
      'System response time (<500ms)',
      'Network uptime and redundancy',
      'Sensor accuracy and calibration',
      'Cybersecurity audit score',
    ],
    risks: [
      { text: 'Cybersecurity breaches', level: 'High' },
      { text: 'Hardware/Software obsolescence (No support)', level: 'Medium' },
      { text: 'Data loss (Lack of historic logging)', level: 'Medium' },
      { text: 'Sensor drift leading to false operations', level: 'Low' },
    ],
  },
  {
    id: 'hydraulic_system',
    title: 'Hydraulic Power Unit (HPU) & Governor',
    description: 'The muscle of the regulation system. It actuates the MIV, Guide Vanes, and Blades. Oil cleanliness is the single most critical factor for reliability.',
    kpis: [
      'Accumulator pressure holding time',
      'Oil cleanliness (NAS/ISO class)',
      'Pump duty cycle',
      'Servo response time',
    ],
    risks: [
      { text: 'Oil leakage (Environmental risk)', level: 'Medium' },
      { text: 'Servo valve sticking (Loss of control)', level: 'High' },
      { text: 'Loss of accumulator pressure (Safety fail)', level: 'High' },
      { text: 'Varnish build-up in valves', level: 'Medium' },
    ],
  },
  {
    id: 'lubrication_system',
    title: 'Centralized Lubrication System',
    description: 'The lifeblood of mechanical components. Automated delivery of oil/grease to bearings and bushings ensures the friction-free operation required for LCC optimization.',
    kpis: [
      'System pressure consistency',
      'Lubricant consumption rate',
      'Filter differential pressure',
      'Point-of-delivery verification',
    ],
    risks: [
      { text: 'Line blockage causing starvation', level: 'High' },
      { text: 'Pump failure', level: 'High' },
      { text: 'Incompatible lubricant usage', level: 'Medium' },
      { text: 'Water ingress into oil', level: 'Medium' },
    ],
  },
  {
    id: 'cooling_system',
    title: 'Cooling System',
    description: 'Manages thermal loads from the generator and bearings. Typically raw water or closed-loop. Efficiency here directly impacts the lifespan of insulation and oil.',
    kpis: [
      'Temperature delta (Inlet vs Outlet)',
      'Flow rate consistency',
      'Heat exchanger efficiency (Fouling factor)',
      'Pump redundancy status',
    ],
    risks: [
      { text: 'Heat exchanger fouling/clogging', level: 'High' },
      { text: 'Cooling pump failure', level: 'High' },
      { text: 'Internal leakage into generator', level: 'Medium' },
      { text: 'Insufficient capacity at peak summer temps', level: 'High' },
    ],
  },
];