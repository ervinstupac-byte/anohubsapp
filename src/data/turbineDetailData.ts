export type CriticalityLevel = 'High' | 'Medium' | 'Low';

export interface TurbineComponent {
    name: string;
    description: string;
    criticality: CriticalityLevel;
}

export interface TurbineDetail {
    name: string;
    mechanical: TurbineComponent[];
    electrical: TurbineComponent[];
}

export const turbineDetailData: Record<string, TurbineDetail> = {
    kaplan: {
        name: 'Kaplan Turbine',
        mechanical: [
            { name: 'Runner with Adjustable Blades', description: 'Enables high efficiency across variable flows. Blade seals are a critical maintenance point to prevent oil leakage.', criticality: 'High' },
            { name: 'Blade Adjustment Mechanism', description: 'Hydraulic servo system inside the hub. Failure here locks the blades, forcing off-design operation.', criticality: 'High' },
            { name: 'Wicket Gate (Guide Vanes)', description: 'Regulates flow. Linkage wear creates hysteresis, affecting grid frequency control response.', criticality: 'High' },
            { name: 'Draft Tube', description: 'Recovers kinetic energy. Critical for Kaplan efficiency; susceptible to vortex pulsations at part-load.', criticality: 'Medium' },
            { name: 'Thrust Bearing', description: 'Supports the massive axial load of the unit + hydraulic thrust. Oil film thickness monitoring is mandatory.', criticality: 'High' },
        ],
        electrical: [
            { name: 'Generator (Low-Speed)', description: 'Massive multi-pole generator. Air gap monitoring is crucial due to the large diameter.', criticality: 'High' },
            { name: 'Excitation System', description: 'Controls voltage. Brush maintenance (if static) or diode checks (if brushless) are key.', criticality: 'Medium' },
            { name: 'Speed Governor', description: 'The brain of the unit. Must perfectly coordinate blade and gate angles (Cam Curve) for efficiency.', criticality: 'High' },
            { name: 'Stator Cooling', description: 'Heat exchangers must be kept clean to prevent insulation degradation (thermal aging).', criticality: 'Medium' },
        ],
    },
    francis: {
        name: 'Francis Turbine',
        mechanical: [
            { name: 'Runner (Fixed Blade)', description: 'Robust design but sensitive to off-design operation (Leading edge cavitation).', criticality: 'High' },
            { name: 'Spiral Casing', description: 'Ensures uniform water distribution. Weld seam integrity must be verified periodically.', criticality: 'Medium' },
            { name: 'Wicket Gate', description: 'High-velocity area. Facing plates are prone to erosion from suspended sediment.', criticality: 'High' },
            { name: 'Shaft Seal', description: 'The primary barrier against flooding. Requires continuous cooling water flow.', criticality: 'High' },
            { name: 'Guide Bearings', description: 'Radial support. Vibration analysis here detects imbalance or misalignment.', criticality: 'Medium' },
        ],
        electrical: [
            { name: 'Generator (Medium-Speed)', description: 'Standard synchronous machine. Partial Discharge (PD) monitoring is recommended for stator windings.', criticality: 'High' },
            { name: 'Protection Relays', description: 'Differential and Overcurrent protection must be tested annually to guarantee safety.', criticality: 'High' },
            { name: 'Main Transformer', description: 'Step-up unit. Oil gas analysis (DGA) is the primary health indicator.', criticality: 'Medium' },
            { name: 'SCADA Integration', description: 'Real-time data logging is essential for the "Digital Twin" and predictive analytics.', criticality: 'High' },
        ],
    },
    pelton: {
        name: 'Pelton Turbine',
        mechanical: [
            { name: 'Runner Buckets', description: 'Subject to extreme cyclic loading (fatigue). MPI/Ultrasonic testing is mandatory during overhauls.', criticality: 'High' },
            { name: 'Needle Valves', description: 'Precision flow control. Erosion of the needle tip destroys jet quality and efficiency.', criticality: 'High' },
            { name: 'Jet Deflector', description: 'Critical safety device. Must actuate instantly (<2s) on load rejection to prevent overspeed.', criticality: 'High' },
            { name: 'Housing', description: 'Non-pressurized spray shield. Baffle plates must prevent water re-entry into the runner.', criticality: 'Low' },
            { name: 'Braking Jets', description: 'Required to stop the runner quickly and prevent bearing damage during shutdown.', criticality: 'Medium' },
        ],
        electrical: [
            { name: 'Generator (High-Speed)', description: 'Subject to higher centrifugal forces. Rotor balancing is critical.', criticality: 'High' },
            { name: 'Overspeed Protection', description: 'Redundant electronic and mechanical systems are required due to the rapid acceleration of Pelton units.', criticality: 'High' },
            { name: 'Switchgear', description: 'Circuit breakers must be rated for the fault current. SF6 gas monitoring if applicable.', criticality: 'Medium' },
            { name: 'Vibration Monitoring', description: 'Accelerometers on bearings to detect early signs of misalignment or unbalance.', criticality: 'Medium' },
        ],
    },
    crossflow: {
        name: 'Crossflow Turbine',
        mechanical: [
            { name: 'Cylindrical Runner', description: 'Simple construction but blades are subject to bending forces. Visual inspection for cracks is key.', criticality: 'High' },
            { name: 'Regulating Vane', description: 'Divides inlet flow. Seals must be maintained to ensure efficiency at low flows.', criticality: 'Medium' },
            { name: 'Housing & Air Valve', description: 'Air valve ensures proper vacuum breaking inside the casing for smooth flow.', criticality: 'Medium' },
            { name: 'Standard Bearings', description: 'Commercial roller bearings. Easy to replace but lifespan is finite.', criticality: 'Medium' },
        ],
        electrical: [
            { name: 'Induction Generator', description: 'Robust and simple. Requires grid connection for excitation. Capacitor banks needed for PF correction.', criticality: 'High' },
            { name: 'Soft Starter', description: 'Reduces inrush current during grid connection to protect mechanical components.', criticality: 'Medium' },
            { name: 'Grid Protection', description: 'Anti-islanding protection is mandatory for safety during grid outages.', criticality: 'High' },
        ],
    },
    flow_through: {
        name: 'Run-of-River Turbine',
        mechanical: [
            { name: 'Axial Runner', description: 'Fixed or semi-adjustable blades. Leading edge protection against debris impact is vital.', criticality: 'High' },
            { name: 'Bulb/Pit Casing', description: 'Watertight integrity is paramount. Any leak threatens the generator directly.', criticality: 'High' },
            { name: 'Mechanical Seals', description: 'Complex sealing arrangement. Failure leads to immediate shutdown and dewatering.', criticality: 'High' },
            { name: 'Trash Rack', description: 'Must be kept clean (auto-cleaners) to prevent head loss and fish mortality.', criticality: 'Medium' },
        ],
        electrical: [
            { name: 'Submerged Generator', description: 'Cooling is a challenge. Housing acts as a heat exchanger with the river water.', criticality: 'High' },
            { name: 'Gearbox (Planetary)', description: 'Often used to step up speed. Oil monitoring is critical due to difficult access.', criticality: 'High' },
            { name: 'Condition Monitoring', description: 'Remote sensors are the only eyes on the unit. Redundancy is recommended.', criticality: 'Medium' },
            { name: 'Submarine Cable', description: 'Link to shore. Insulation resistance testing required periodically.', criticality: 'Medium' },
        ],
    },
};