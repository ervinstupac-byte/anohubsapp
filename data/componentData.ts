type RiskLevel = 'High' | 'Medium' | 'Low';

export interface Risk {
  text: string;
  level: RiskLevel;
}

export interface ComponentData {
  id: string;
  title: string;
  description: string;
  kpis: string[];
  risks: Risk[];
  imageUrl?: string; // Optional image
}

export const componentData: ComponentData[] = [
  {
    id: 'design',
    title: 'Overall Plant Design & Engineering',
    description: 'A holistic engineering approach covering civil structures, equipment selection, layout, and system integration, which dictates the long-term performance and reliability of the plant.',
    kpis: [
      'Overall plant efficiency (water-to-wire)',
      'Availability and reliability factors (>99%)',
      'Construction costs versus budget',
      'Adherence to safety and environmental standards',
    ],
    risks: [
      { text: 'Incorrect civil engineering design (e.g., intake structure, tailrace)', level: 'High' },
      { text: 'Poor equipment specification', level: 'High' },
      { text: 'Inefficient layout increasing losses', level: 'Medium' },
      { text: 'Insufficient safety or environmental considerations', level: 'High' },
    ],
  },
  {
    id: 'miv',
    title: 'Main Inlet Valve (MIV)',
    description: 'The primary shut-off valve upstream of the turbine, crucial for safety and maintenance. Ball or butterfly valves are most commonly used.',
    kpis: [
      'Closing time in emergencies (<60 seconds)',
      'Sealing efficiency (leakage rate)',
      'Reliability (number of successful operations without failure)',
      'Condition of the hydraulic actuator',
    ],
    risks: [
      { text: 'Failure to close (catastrophic risk)', level: 'High' },
      { text: 'Failure to open (loss of production)', level: 'High' },
      { text: 'Seal leakage causes water loss and wear', level: 'Medium' },
      { text: 'Hydraulic actuator failure', level: 'High' },
    ],
  },
  {
    id: 'rotor',
    title: 'Turbine Runner and Blades',
    description: 'The heart of the turbine, the runner converts the energy of water into mechanical rotation. Blades are designed for maximum efficiency and resistance to cavitation and erosion.',
    kpis: [
      'Energy conversion efficiency (>90%)',
      'Vibration levels (according to ISO 20816)',
      'Erosion/cavitation rate (mm/year)',
      'Mean Time Between Overhauls (MTBO)',
    ],
    risks: [
      { text: 'Fatigue cracks on the runner blades', level: 'High' },
      { text: 'Runner imbalance causes vibrations', level: 'Medium' },
      { text: 'Cavitation damage reduces efficiency', level: 'High' },
      { text: 'Sediment erosion on leading edges', level: 'Medium' },
    ],
  },
  {
    id: 'guide_vanes',
    title: 'Guide Vane Apparatus (Wicket Gate)',
    description: 'Adjustable vanes that control the flow and angle of water entering the turbine runner, thereby regulating the unit\'s power output.',
    kpis: [
      'Positioning accuracy and response time',
      'Leakage in the closed position',
      'Wear rate on edges and pivots',
      'Integrity of the operating mechanism',
    ],
    risks: [
      { text: 'Jamming due to debris or wear', level: 'High' },
      { text: 'Excessive leakage causes rotation at standstill', level: 'Medium' },
      { text: 'Failure of safety links (shear pins)', level: 'Medium' },
      { text: 'Linkage mechanism failure', level: 'High' },
    ],
  },
   {
    id: 'shaft_sealing',
    title: 'Shaft Sealing System',
    description: 'Prevents water from leaking out of the turbine along the shaft. Modern systems include labyrinth, carbon, and mechanical seals, depending on the application.',
    kpis: [
      'Water leakage rate',
      'Consumption of cooling/flushing water',
      'Lifespan of sealing elements',
      'Operating temperature',
    ],
    risks: [
      { text: 'Excessive leakage leading to flooding', level: 'High' },
      { text: 'Loss of vacuum in the draft tube (reaction turbines)', level: 'Medium' },
      { text: 'Shaft wear at the sealing location', level: 'Medium' },
      { text: 'Sudden seal failure', level: 'High' },
    ],
  },
  {
    id: 'bearings',
    title: 'Bearings (Guide and Thrust)',
    description: 'Support the rotating shaft, transferring immense radial (guide) and axial (thrust) loads. Hydrodynamic slide bearings are most common.',
    kpis: [
      'Bearing operating temperature',
      'Thickness and pressure of the oil film',
      'Vibration levels on the bearing housing',
      'Oil cleanliness (particle count per ISO 4406)',
    ],
    risks: [
      { text: 'Overheating and wiping of white metal', level: 'High' },
      { text: 'Wear due to contaminated oil', level: 'Medium' },
      { text: 'Lubrication system failure', level: 'High' },
      { text: 'Vibrations caused by oil film instability', level: 'Medium' },
    ],
  },
  {
    id: 'generator',
    title: 'Generator',
    description: 'Connected to the turbine, the generator converts mechanical energy into electrical energy. Its reliability and efficiency are key to the plant\'s profitability.',
    kpis: [
      'Generator efficiency (>98%)',
      'Winding and bearing temperatures',
      'Power factor (close to 1.0)',
      'Plant availability (>99%)',
    ],
    risks: [
      { text: 'Overheating of stator windings', level: 'High' },
      { text: 'Insulation failure', level: 'High' },
      { text: 'Generator bearing problems', level: 'Medium' },
      { text: 'Excitation system faults', level: 'Medium' },
    ],
  },
  {
    id: 'control_system',
    title: 'Control System (SCADA & PLC)',
    description: 'Modern digital systems for supervision, control, and data acquisition. They enable operational optimization, predictive maintenance, and remote control.',
    kpis: [
      'System response time (<500ms)',
      'Reliability of the communication network',
      'Accuracy of sensor data',
      'Number of unplanned outages caused by the system',
    ],
    risks: [
      { text: 'Cybersecurity attacks', level: 'High' },
      { text: 'Hardware/software obsolescence', level: 'Medium' },
      { text: 'Data loss', level: 'Medium' },
      { text: 'Incorrect sensor calibration', level: 'Low' },
    ],
  },
   {
    id: 'hydraulic_system',
    title: 'Hydraulic Power Unit (HPU) & Governor',
    description: 'The system that controls the water flow through the turbine by adjusting guide vanes and/or control valves, ensuring stable operation and quick response to load changes.',
    kpis: [
      'Closing/opening time of control elements',
      'Hydraulic oil pressure and cleanliness (per ISO 4406)',
      'Deviation from power/flow setpoints',
      'Reliability of pumps and accumulators',
    ],
    risks: [
      { text: 'Oil leakage (environmental and operational risk)', level: 'Medium' },
      { text: 'Servo valve malfunction', level: 'High' },
      { text: 'Loss of pressure in the system', level: 'High' },
      { text: 'Oil contamination causes component failures', level: 'Medium' },
    ],
  },
   {
    id: 'lubrication_system',
    title: 'Centralized Lubrication System',
    description: 'An automated system that supplies the correct amount of oil or grease to various lubrication points, primarily bearings and moving parts of mechanisms.',
    kpis: [
      'System pressure and flow rate',
      'Lubricant cleanliness',
      'Reliability of pumps and distributors',
      'Lubricant consumption',
    ],
    risks: [
      { text: 'Clogged lines cause lubrication starvation', level: 'High' },
      { text: 'Pump failure', level: 'High' },
      { text: 'Application of the wrong lubricant', level: 'Medium' },
      { text: 'Lubricant contamination', level: 'Medium' },
    ],
  },
  {
    id: 'cooling_system',
    title: 'Cooling System',
    description: 'Manages the heat generated by the generator and bearings, most often using water (directly from the penstock or in a closed loop) via heat exchangers.',
    kpis: [
      'Temperature stability of cooled components',
      'Coolant flow rate',
      'Heat exchanger efficiency (fouling)',
      'Reliability of cooling pumps',
    ],
    risks: [
      { text: 'Clogging of pipes/heat exchangers', level: 'High' },
      { text: 'Pump failure', level: 'High' },
      { text: 'System leakage', level: 'Medium' },
      { text: 'Insufficient cooling leads to component overheating', level: 'High' },
    ],
  },
];