import { ROUTES } from '../../routes/paths';

export interface ContextDefinition {
    id: string; // Internal Component ID
    title: string; // Display Title
    physicsId?: string; // Links to Physics Engine / Knowledge Base
    logCategory: 'CIVIL' | 'MECH' | 'ELEC' | 'FLUID' | 'SAFETY';
    slogan?: string; // Short physics explanation
}

export const CONTEXT_MAP: Record<string, ContextDefinition> = {
    // ========================================
    // CIVIL & INFRASTRUCTURE
    // ========================================
    [ROUTES.FRANCIS.SOP.PENSTOCK]: {
        id: 'francis.civil.penstock',
        title: 'Penstock System',
        physicsId: 'joukowsky_shock',
        logCategory: 'CIVIL',
        slogan: 'Water Hammer: Rapid valve closure creates pressure waves (ΔP = ρ·a·Δv). Steel integrity protects against catastrophic rupture.'
    },
    [ROUTES.FRANCIS.SOP.INTAKE]: {
        id: 'francis.civil.intake',
        title: 'Intake & Trash Rack',
        physicsId: 'head_loss_bernoulli',
        logCategory: 'CIVIL',
        slogan: 'Head Loss: Flow obstructions dissipate energy as turbulence. Clean racks maximize hydraulic efficiency and prevent cavitation.'
    },
    [ROUTES.FRANCIS.SOP.WATER_HAMMER]: {
        id: 'francis.civil.water_hammer',
        title: 'Water Hammer Protection',
        physicsId: 'joukowsky_analysis',
        logCategory: 'SAFETY',
        slogan: 'Pressure Surge: Joukowsky equation (ΔP = ρ·c·Δv) predicts shock magnitude. Surge tanks and controlled closure prevent pipe failure.'
    },
    [ROUTES.FRANCIS.SOP.CATHODIC]: {
        id: 'francis.civil.cathodic',
        title: 'Cathodic Protection',
        physicsId: 'electrochemical_corrosion',
        logCategory: 'CIVIL',
        slogan: 'Corrosion Prevention: Sacrificial anodes protect steel via electron donation. Monitor potential to ensure -850mV threshold.'
    },
    [ROUTES.FRANCIS.SOP.AUXILIARY]: {
        id: 'francis.civil.auxiliary',
        title: 'Auxiliary Systems',
        physicsId: 'system_integration',
        logCategory: 'CIVIL',
        slogan: 'Support Infrastructure: HVAC, lighting, and drainage ensure operational environment. Redundancy prevents single-point failures.'
    },

    // ========================================
    // MECHANICAL SYSTEMS
    // ========================================
    [ROUTES.FRANCIS.SOP.BEARINGS]: {
        id: 'francis.mechanical.bearings',
        title: 'Guide Bearings',
        physicsId: 'tribology_viscosity',
        logCategory: 'MECH',
        slogan: 'Hydrodynamic Lubrication: Oil viscosity creates pressure wedge separating surfaces. Temperature >65°C degrades film strength.'
    },
    [ROUTES.FRANCIS.SOP.ALIGNMENT]: {
        id: 'francis.mechanical.alignment',
        title: 'Shaft Alignment',
        physicsId: 'angular_misalignment',
        logCategory: 'MECH',
        slogan: 'Precision Coupling: Misalignment induces harmonic vibration and bearing overload. Target: <0.05mm offset, <0.1° angular error.'
    },
    [ROUTES.FRANCIS.SOP.THRUST_BALANCE]: {
        id: 'francis.mechanical.thrust',
        title: 'Thrust Balance',
        physicsId: 'axial_hydraulic_force',
        logCategory: 'MECH',
        slogan: 'Axial Force Balance: Runner generates upward thrust (F = ρ·Q·Δv). Thrust bearing absorbs imbalance preventing shaft migration.'
    },
    [ROUTES.FRANCIS.SOP.VORTEX_CONTROL]: {
        id: 'francis.mechanical.vortex',
        title: 'Vortex Control',
        physicsId: 'swirl_mitigation',
        logCategory: 'FLUID',
        slogan: 'Draft Tube Vortex: Residual swirl creates low-pressure cores inducing vibration. Fins and air injection disrupt coherent structures.'
    },
    [ROUTES.FRANCIS.SOP.MIV_DISTRIBUTOR]: {
        id: 'francis.mechanical.miv',
        title: 'Main Inlet Valve & Distributor',
        physicsId: 'flow_distribution',
        logCategory: 'MECH',
        slogan: 'Flow Control: Distributor ensures symmetric runner loading. MIV provides emergency isolation in <10 seconds.'
    },
    [ROUTES.FRANCIS.SOP.REGULATING_RING]: {
        id: 'francis.mechanical.reg_ring',
        title: 'Regulating Ring',
        physicsId: 'wicket_gate_control',
        logCategory: 'MECH',
        slogan: 'Guide Vane Actuation: Ring synchronizes wicket gate position controlling flow rate. Hydraulic servo maintains <0.5° deviation.'
    },
    [ROUTES.FRANCIS.SOP.LINKAGE]: {
        id: 'francis.mechanical.linkage',
        title: 'Wicket Gate Linkage',
        physicsId: 'mechanical_transmission',
        logCategory: 'MECH',
        slogan: 'Precision Transmission: Linkage converts servo stroke to gate rotation. Wear tolerance <1mm prevents flow asymmetry and vibration.'
    },
    [ROUTES.FRANCIS.SOP.COUPLING]: {
        id: 'francis.mechanical.coupling',
        title: 'Turbine-Generator Coupling',
        physicsId: 'torque_transmission',
        logCategory: 'MECH',
        slogan: 'Power Transfer: Elastic coupling transmits torque while dampening torsional oscillations. Misalignment accelerates fatigue failure.'
    },
    [ROUTES.FRANCIS.SOP.BRAKING_SYSTEM]: {
        id: 'francis.mechanical.brakes',
        title: 'Emergency Braking System',
        physicsId: 'kinetic_dissipation',
        logCategory: 'SAFETY',
        slogan: 'Rotational Energy Arrest: Disc brakes convert kinetic energy to heat (E = ½Iω²). Emergency stop: <120 seconds from rated speed.'
    },
    [ROUTES.FRANCIS.SOP.SEAL_RECOVERY]: {
        id: 'francis.mechanical.seals',
        title: 'Seal Air Recovery',
        physicsId: 'pressure_differential',
        logCategory: 'MECH',
        slogan: 'Leakage Prevention: Compressed air seals prevent water ingress at shaft penetration. Differential >0.2 bar maintains dry rotor.'
    },

    // ========================================
    // HYDRAULIC & FLUID SYSTEMS
    // ========================================
    [ROUTES.FRANCIS.SOP.OIL_HEALTH]: {
        id: 'francis.fluid.oil',
        title: 'Oil Health Monitoring',
        physicsId: 'fluid_degradation',
        logCategory: 'FLUID',
        slogan: 'Lubricant Integrity: Oxidation and contamination degrade viscosity index. Ferrography detects wear particles indicating component failure.'
    },
    [ROUTES.FRANCIS.SOP.COOLING_WATER]: {
        id: 'francis.fluid.cooling',
        title: 'Cooling Water System',
        physicsId: 'heat_transfer',
        logCategory: 'FLUID',
        slogan: 'Thermal Management: Heat exchangers dissipate bearing and winding losses (Q = mcΔT). Flow <80% triggers thermal runaway risk.'
    },
    [ROUTES.FRANCIS.SOP.DRAINAGE_PUMPS]: {
        id: 'francis.fluid.drainage',
        title: 'Drainage Pumps',
        physicsId: 'water_evacuation',
        logCategory: 'FLUID',
        slogan: 'Water Removal: Sump pumps prevent transformer pit flooding and bearing contamination. Redundancy ensures continuous operation.'
    },
    [ROUTES.FRANCIS.SOP.LUBRICATION]: {
        id: 'francis.fluid.lubrication',
        title: 'Lubrication System',
        physicsId: 'centralized_oil_delivery',
        logCategory: 'FLUID',
        slogan: 'Oil Distribution: Centralized system delivers filtered oil to bearings and governor. Pressure <1.5 bar triggers alarm sequence.'
    },
    [ROUTES.FRANCIS.SOP.HPU]: {
        id: 'francis.fluid.hpu',
        title: 'Hydraulic Power Unit',
        physicsId: 'hydraulic_accumulator',
        logCategory: 'FLUID',
        slogan: 'Actuator Power: HPU provides 160 bar pressure for wicket gate and MIV control. Accumulators buffer demand spikes.'
    },

    // ========================================
    // ELECTRICAL SYSTEMS
    // ========================================
    [ROUTES.FRANCIS.SOP.GENERATOR]: {
        id: 'francis.electrical.generator',
        title: 'Synchronous Generator',
        physicsId: 'electromagnetic_induction',
        logCategory: 'ELEC',
        slogan: 'Power Generation: Rotating magnetic field induces voltage (E = 4.44·f·N·Φ). Insulation resistance >1GΩ prevents winding failure.'
    },
    [ROUTES.FRANCIS.SOP.ELECTRICAL_HEALTH]: {
        id: 'francis.electrical.health',
        title: 'Electrical System Health',
        physicsId: 'dielectric_integrity',
        logCategory: 'ELEC',
        slogan: 'Insulation Monitoring: Partial discharge and tan-delta tests detect degradation. Temperature rise >80K indicates cooling failure.'
    },
    [ROUTES.FRANCIS.SOP.GOVERNOR_PID]: {
        id: 'francis.electrical.pid',
        title: 'Governor & PID Control',
        physicsId: 'frequency_regulation',
        logCategory: 'ELEC',
        slogan: 'Speed Control: PID loop adjusts wicket gates maintaining 50Hz ±0.1%. Dead band <0.02% prevents hunting oscillations.'
    },
    [ROUTES.FRANCIS.SOP.GRID_SYNC]: {
        id: 'francis.electrical.grid_sync',
        title: 'Grid Synchronization',
        physicsId: 'phase_matching',
        logCategory: 'ELEC',
        slogan: 'Breaker Closure: Voltage, frequency, and phase must align (<5° error). Out-of-sync closure induces destructive torque pulse.'
    },
    [ROUTES.FRANCIS.SOP.DISTRIBUTOR_SYNC]: {
        id: 'francis.electrical.distributor',
        title: 'Load Distribution Sync',
        physicsId: 'parallel_operation',
        logCategory: 'ELEC',
        slogan: 'Load Sharing: Droop control divides grid demand between units. Reactive power balance prevents circulating currents.'
    },
    [ROUTES.FRANCIS.SOP.DC_SYSTEMS]: {
        id: 'francis.electrical.dc',
        title: 'DC Battery Systems',
        physicsId: 'emergency_power',
        logCategory: 'ELEC',
        slogan: 'Backup Power: 110V DC batteries supply control circuits and emergency lighting. Capacity: 8-hour autonomy at full load.'
    },
    [ROUTES.FRANCIS.SOP.EXCITATION]: {
        id: 'francis.electrical.excitation',
        title: 'Excitation (AVR/FCR)',
        physicsId: 'magnetic_flux',
        logCategory: 'ELEC',
        slogan: 'Field Control: AVR regulates rotor current maintaining terminal voltage. Fast response (<100ms) suppresses voltage dips.'
    },
    [ROUTES.FRANCIS.SOP.TRANSFORMER]: {
        id: 'francis.electrical.transformer',
        title: 'Step-Up Transformer',
        physicsId: 'induction_hysteresis',
        logCategory: 'ELEC',
        slogan: 'Voltage Transformation: Electromagnetic induction steps 11kV to 110kV. Oil temperature >85°C indicates overload or cooling fault.'
    }
};

export const getContextFromRoute = (pathname: string): ContextDefinition | null => {
    // Exact match or includes?
    // Routes can be complex. Let's try exact matching the key segments.
    // NOTE: ROUTES constants might be full paths or partials.
    // Assuming ROUTES are full paths or unique partials.

    for (const [routeKey, def] of Object.entries(CONTEXT_MAP)) {
        if (pathname.includes(routeKey)) {
            return def;
        }
    }
    return null;
};
