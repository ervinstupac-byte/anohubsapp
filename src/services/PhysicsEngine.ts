// Physics Engine
// The "Impact Engine" core logic for calculating real-time physical constraints

import { TechnicalProjectState, BoltGrade, PipeMaterial } from '../models/TechnicalSchema';

export const PhysicsEngine = {

    /**
     * Re-calculates the entire physics state based on inputs.
     * Pure function: Input State -> Output Physics Parameters
     */
    recalculateProjectPhysics: (state: TechnicalProjectState): TechnicalProjectState => {
        const { site, penstock, mechanical, tolerances, constants } = state;
        const newState = { ...state };
        const alerts: string[] = [];

        // 1. Hydraulic Pressure Physics - Using reactive constants from schema
        // Static P = rho * g * H
        const rho = constants.physics.waterDensity; // From schema constants
        const g = constants.physics.gravity; // From schema constants
        const staticHead = site.grossHead;
        const staticPressurePa = rho * g * staticHead;
        const staticPressureBar = staticPressurePa / 100000;

        // 2. Water Hammer (Joukowsky Equation Approximation)
        // c = Wave Speed = sqrt(K / rho) ... simplified approx based on material
        const waveSpeed = getWaveSpeed(penstock.material, penstock.diameter, penstock.wallThickness);
        const velocity = site.designFlow / (Math.PI * Math.pow(penstock.diameter / 2000, 2)); // D in mm

        // dP = rho * c * dV (assume full stop in instant for Worst Case)
        const waterHammerPa = rho * waveSpeed * velocity;
        const waterHammerBar = waterHammerPa / 100000;

        const totalMaxPressureBar = staticPressureBar + waterHammerBar;

        // 3. Hoop Stress (Barlow)
        // sigma = (P * D) / (2 * t)
        // Using Total Max Pressure for Safety
        const hoopStressMPa = (totalMaxPressureBar * 0.1 * penstock.diameter) / (2 * penstock.wallThickness);

        // Validate Wall Thickness
        const materialYield = getMaterialYield(penstock.material);
        const pipeSafetyFactor = materialYield / hoopStressMPa;
        if (pipeSafetyFactor < tolerances.minSafetyFactor) {
            alerts.push(`CRITICAL: Pipe Burst Risk! Safety Fact: ${pipeSafetyFactor.toFixed(2)} (Req: ${tolerances.minSafetyFactor}). Increase Thickness.`);
        }

        // 4. Bolt Safety Factor
        const boltAnalysis = calculateBoltSafetyFactor(totalMaxPressureBar, mechanical.boltSpecs, penstock.diameter);

        if (boltAnalysis.safetyFactor < 1.5) {
            alerts.push(`BOLT FAILURE: M${mechanical.boltSpecs.diameter} Grade ${mechanical.boltSpecs.grade} bolts insufficient for ${totalMaxPressureBar.toFixed(1)} bar.`);
        }

        // Update Physics State
        newState.physics = {
            staticPressureBar,
            surgePressureBar: waterHammerBar, // displaying hammer as surge for UI simplicity
            waterHammerPressureBar: waterHammerBar,
            hoopStressMPa,
            boltLoadKN: boltAnalysis.loadPerBoltKN,
            boltCapacityKN: boltAnalysis.capacityKN,
            boltSafetyFactor: boltAnalysis.safetyFactor,
            criticalAlerts: alerts
        };

        return newState;
    }
};

/**
 * Helper: Calculate Bolt Physics
 */
const calculateBoltSafetyFactor = (pressureBar: number, specs: { count: number, diameter: number, grade: BoltGrade }, pipeDiameterMM: number) => {
    // Force on Flange = Pressure * Area
    const pressureMPa = pressureBar / 10;
    const pipeAreaMM2 = Math.PI * Math.pow(pipeDiameterMM / 2, 2);
    const totalForceN = pressureMPa * pipeAreaMM2; // N = MPa * mm2

    const loadPerBoltN = totalForceN / specs.count;
    const loadPerBoltKN = loadPerBoltN / 1000;

    // Bolt Capacity
    // Tensile Stress Area (approx)
    const As = 0.7854 * Math.pow(specs.diameter - 0.9382 * 1.5, 2); // Simplified metric thread area

    // Yield Strength of Grade
    // 8.8 -> 800 MPa tensile, 80% yield -> 640 MPa
    const [ult, ratio] = specs.grade.split('.').map(Number);
    const yieldStrengthMPa = (ult * 100) * (ratio / 10);

    const capacityN = yieldStrengthMPa * As;
    const capacityKN = capacityN / 1000;

    return {
        loadPerBoltKN,
        capacityKN,
        safetyFactor: capacityKN / loadPerBoltKN
    };
};

/**
 * Helper: Material Properties
 */
const getWaveSpeed = (mat: PipeMaterial, D: number, t: number): number => {
    // c = 1 / sqrt( rho * (1/K + D/(E*t)) )
    // Approximation table (m/s)
    const E_steel = 210e9;
    const E = { 'STEEL': 210e9, 'GRP': 20e9, 'PEHD': 1e9, 'CONCRETE': 30e9 }[mat] || E_steel;

    const K_water = 2.2e9; // Bulk modulus
    const rho = 1000;

    const term = (1 / K_water) + ((D / 1000) / (E * (t / 1000)));
    return Math.sqrt(1 / (rho * term));
};

const getMaterialYield = (mat: PipeMaterial): number => {
    // Yield Strength MPa
    return { 'STEEL': 235, 'GRP': 60, 'PEHD': 20, 'CONCRETE': 30 }[mat] || 235;
};
