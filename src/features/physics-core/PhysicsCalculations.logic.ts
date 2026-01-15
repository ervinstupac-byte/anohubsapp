import Decimal from 'decimal.js';
import { SYSTEM_CONSTANTS } from '../../config/SystemConstants';

/**
 * Pure Physics Calculations
 * Decoupled from React State and UI dependencies.
 */

export const calculateFlowVelocity = (flow: Decimal, diameter: Decimal): Decimal => {
    const radius = diameter.div(2);
    const area = radius.pow(2).mul(Decimal.acos(-1)); // pi * r^2
    return flow.div(area);
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
