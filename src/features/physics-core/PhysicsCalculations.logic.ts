import Decimal from 'decimal.js';
import { SYSTEM_CONSTANTS } from '../../config/SystemConstants';

/**
 * Pure Physics Calculations
 * Decoupled from React State and UI dependencies.
 */

export const calculateFlowVelocity = (flow: Decimal, diameter: Decimal): Decimal => {
    const radius = diameter.div(2); // Assume diameter is in METERS
    const area = radius.pow(2).mul(Decimal.acos(-1)); // pi * r^2
    return flow.div(area.gt(0) ? area : 1);
};

/**
 * REYNOLDS NUMBER (Re = v * D / nu)
 * Kinematic viscosity for water @ 15°C ~ 1.14e-6 m²/s
 */
export const calculateReynoldsNumber = (velocity: Decimal, diameter: Decimal): Decimal => {
    const nu = new Decimal('0.00000114'); // m2/s
    return velocity.mul(diameter).div(nu); // D must be in METERS
};

/**
 * SWAMEE-JAIN FRICTION FACTOR
 * Explicit approximation of Colebrook-White.
 */
export const calculateFrictionFactor = (Re: Decimal, roughnessMM: Decimal, diameter: Decimal): Decimal => {
    if (Re.lt(2300)) return new Decimal(64).div(Re.gt(0) ? Re : 1); // Laminar

    const epsilon = roughnessMM.div(1000);

    // f = 0.25 / [log10( epsilon/(3.7*D) + 5.74/(Re^0.9) )]^2
    const term1 = epsilon.div(diameter.mul(3.7));
    const term2 = new Decimal(5.74).div(Re.pow(0.9));
    const logVal = Decimal.log10(term1.plus(term2));

    return new Decimal(0.25).div(logVal.pow(2));
};

/**
 * DARCY-WEISBACH HEAD LOSS
 * hf = f * (L/D) * (v^2 / 2g)
 */
export const calculateHeadLoss = (
    f: Decimal,
    length: Decimal,
    diameter: Decimal,
    velocity: Decimal
): Decimal => {
    const g = new Decimal(SYSTEM_CONSTANTS.PHYSICS.GRAVITY);

    return f.mul(length.div(diameter)).mul(velocity.pow(2).div(g.mul(2)));
};

export const calculateWaveVelocity = (diameter: Decimal, thickness: Decimal, modulusPa: Decimal): Decimal => {
    const K = new Decimal(SYSTEM_CONSTANTS.PHYSICS.WATER.BULK_MODULUS_PA);
    const rho = new Decimal(SYSTEM_CONSTANTS.PHYSICS.WATER.DENSITY);
    const elasticFactor = K.div(modulusPa).mul(diameter.div(thickness));
    return K.div(rho).div(new Decimal(1).plus(elasticFactor)).squareRoot();
};

export const calculateSurgePressure = (waveVelocity: Decimal, flowVelocity: Decimal): Decimal => {
    const rho = new Decimal(SYSTEM_CONSTANTS.PHYSICS.WATER.DENSITY);
    return rho.mul(waveVelocity).mul(flowVelocity);
};

export const calculateHoopStress = (
    head: Decimal,
    surgePressurePa: Decimal,
    diameter: Decimal,
    thickness: Decimal
): Decimal => {
    const rho = new Decimal(SYSTEM_CONSTANTS.PHYSICS.WATER.DENSITY);
    const gravity = new Decimal(SYSTEM_CONSTANTS.PHYSICS.GRAVITY);

    // Barlow's Formula
    const staticPressurePa = rho.mul(gravity).mul(head);
    const totalPressurePa = staticPressurePa.plus(surgePressurePa);

    // stress = (P * d) / (2 * t)
    return totalPressurePa.mul(diameter).div(thickness.mul(2)).div(1e6); // Result in MPa
};

export const calculatePowerMW = (
    head: Decimal,
    flow: Decimal,
    efficiencyPercent: Decimal
): Decimal => {
    const rho = new Decimal(SYSTEM_CONSTANTS.PHYSICS.WATER.DENSITY);
    const gravity = new Decimal(SYSTEM_CONSTANTS.PHYSICS.GRAVITY);

    const normalizedEfficiency = efficiencyPercent.gt(1)
        ? efficiencyPercent.div(100)
        : efficiencyPercent;

    const powerWatts = rho.mul(gravity).mul(head).mul(flow).mul(normalizedEfficiency);
    return powerWatts.div(1e6);
};

export const calculateEccentricity = (
    vibX: Decimal,
    vibY: Decimal,
    turbineType: string
): Decimal => {
    const xAbs = vibX.abs();
    const yAbs = vibY.abs();

    let adjustedX = xAbs;
    let adjustedY = yAbs;

    if (turbineType === 'PELTON') {
        adjustedX = xAbs.mul(SYSTEM_CONSTANTS.PHYSICS.PELTON_VIBRATION_FACTOR);
    } else if (turbineType === 'KAPLAN') {
        adjustedY = yAbs.mul(SYSTEM_CONSTANTS.PHYSICS.KAPLAN_VIBRATION_FACTOR);
    }

    const a = Decimal.max(adjustedX, adjustedY);
    const b = Decimal.min(adjustedX, adjustedY);

    return a.isZero() ? new Decimal(0) : Decimal.sqrt(new Decimal(1).sub(b.pow(2).div(a.pow(2))));
};

export const calculateGridStressFactor = (frequency: number): number => {
    const deltaF = Math.abs(SYSTEM_CONSTANTS.PHYSICS.GRID.NOMINAL_FREQUENCY - frequency);

    if (deltaF > SYSTEM_CONSTANTS.PHYSICS.GRID.FREQUENCY_DELTA_TOLERANCE) {
        // Linear scaling: 1.0 -> 1.5 max
        const stress = (deltaF - SYSTEM_CONSTANTS.PHYSICS.GRID.FREQUENCY_DELTA_TOLERANCE) * 2;
        return 1.0 + Math.min(SYSTEM_CONSTANTS.DEFAULTS.GRID_STRESS_SCALING_MAX, stress);
    }

    return 1.0;
};

/**
 * BOLT INTEGRITY MATH
 */
export const calculateBoltLoadKN = (
    totalPressurePa: Decimal,
    runnerDiameterMM: Decimal,
    boltCount: number
): Decimal => {
    const radiusM = runnerDiameterMM.div(1000).div(2);
    const areaM2 = radiusM.pow(2).mul(Decimal.acos(-1));
    const totalForceN = totalPressurePa.mul(areaM2);
    return totalForceN.div(boltCount).div(1000); // kN per bolt
};

export const calculateBoltCapacityKN = (
    boltDiameterMM: Decimal,
    boltGradeYieldMPa: Decimal
): Decimal => {
    const radiusM = boltDiameterMM.div(2).div(1000);
    const areaM2 = radiusM.pow(2).mul(Decimal.acos(-1));
    // F_cap = Stress * Area (convert Pa: MPa * 1e6)
    const forceN = boltGradeYieldMPa.mul(1e6).mul(areaM2);
    return forceN.div(1000); // kN
};

/**
 * TURBINE EFFICIENCY CURVES
 * Simplified curves from ISO 60041 / Legacy engines
 */
export const calculateTypicalEfficiency = (type: string, head: number): number => {
    switch (type.toUpperCase()) {
        case 'FRANCIS':
            return (head >= 40 && head <= 400) ? 92 : 88;
        case 'KAPLAN':
            return head < 40 ? 94 : 90;
        case 'PELTON':
            return head > 200 ? 91 : 85;
        case 'CROSSFLOW':
            return 82;
        default:
            return 90;
    }
};

/**
 * TURBINE TOLERANCE THRESHOLDS
 * Standard machine-specific limits (mm or mm/s)
 */
export const getTurbineThresholds = (type: string) => {
    switch (type.toUpperCase()) {
        case 'FRANCIS':
            return { foundationMax: 0.04, shaftMax: 0.015, vibrationMax: 1.8 };
        case 'KAPLAN':
            return { foundationMax: 0.05, shaftMax: 0.02, vibrationMax: 2.5 };
        case 'PELTON':
            return { foundationMax: 0.08, shaftMax: 0.05, vibrationMax: 3.5 };
        case 'CROSSFLOW':
            return { foundationMax: 0.1, shaftMax: 0.08, vibrationMax: 4.0 };
        default:
            return { foundationMax: 0.05, shaftMax: 0.02, vibrationMax: 2.0 };
    }
};

/**
 * TECHNICAL SPEC GENERATOR
 * Logic ported from legacy engines for HPP Builder
 */
export const generateTurbineSpecs = (type: string, head: number, flow: number) => {
    const headD = new Decimal(head);
    const flowD = new Decimal(flow);

    // Calculate Nsq (Specific Speed)
    // Nsq = N * sqrt(Q) / H^(3/4)
    const n = new Decimal(1000);
    const nsq = n.mul(flowD.sqrt()).div(headD.pow(0.75)).toNumber();

    switch (type.toUpperCase()) {
        case 'FRANCIS':
            return {
                runnerType: 'Mixed-flow',
                wickerGates: 'Adjustable',
                mounting: head > 100 ? 'Vertical' : 'Horizontal',
                specificSpeed: nsq
            };
        case 'KAPLAN':
            return {
                runnerType: 'Adjustable Blade',
                spiralCase: head > 30 ? 'Steel' : 'Concrete',
                draftTube: 'Elbow type',
                specificSpeed: nsq
            };
        case 'PELTON':
            return {
                runnerType: 'Impulse Wheel',
                jets: nsq > 30 ? 4 : 2,
                housing: 'Atmospheric pressure',
                specificSpeed: nsq
            };
        case 'CROSSFLOW':
            return {
                runnerType: 'Drum',
                material: 'Stainless Steel',
                regulation: head < 50 ? 'Single' : 'Double',
                specificSpeed: nsq
            };
        default:
            return { specificSpeed: nsq };
    }
};
