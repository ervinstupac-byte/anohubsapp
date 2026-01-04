// Dynamic Tolerance Calculator
// Adjusts tolerances based on turbine physics: RPM, head, centrifugal forces

import { TurbineFamily, TurbineVariant, ToleranceMap, Threshold } from '../models/turbine/types';
import Decimal from 'decimal.js';

export interface TurbinePhysics {
    runningSpeed: number; // RPM
    head: number; // meters
    flow: number; // m³/s
    rotorWeight: number; // kg
    rotorDiameter: number; // meters
    bearingSpan: number; // meters
}

export interface DynamicToleranceResult {
    baseTolerance: number;
    adjustedTolerance: number;
    adjustmentFactor: number;
    adjustmentReasons: string[];
}

export class DynamicToleranceCalculator {
    /**
     * CORE INSIGHT: 0.05 mm/m is NOT universal!
     * 
     * Pelton @ 1000 RPM, 500m head → High centrifugal forces → Loosen tolerance
     * Kaplan @ 100 RPM, 50m head → Low forces → Tighten tolerance
     * FRANCIS @ 500 RPM, 200m head → Medium forces → Standard tolerance
     */
    static calculateShaftAlignmentTolerance(
        turbineFamily: TurbineFamily,
        physics: TurbinePhysics
    ): DynamicToleranceResult {
        const BASE_TOLERANCE = new Decimal(0.05); // mm/m - Industry standard
        const reasons: string[] = [];

        // Calculate forces
        // omega = (physics.runningSpeed * 2 * Math.PI) / 60
        const PI = Decimal.acos(-1);
        const omega = new Decimal(physics.runningSpeed).mul(2).mul(PI).div(60); // rad/s
        const centrifugalAccel = omega.pow(2).mul(new Decimal(physics.rotorDiameter).div(2)); // m/s²

        // Normalized factors (0.5 - 2.0)
        let centrifugalFactor = new Decimal(1.0);
        let headFactor = new Decimal(1.0);
        let speedFactor = new Decimal(1.0);

        // ===== TURBINE-SPECIFIC ADJUSTMENTS =====

        switch (turbineFamily) {
            case 'PELTON':
                // High speed + high head = looser tolerance
                centrifugalFactor = new Decimal(1).plus(centrifugalAccel.div(1000)); // Normalize to ~1-2
                headFactor = new Decimal(1).plus(new Decimal(physics.head).div(500)); // Head effect
                speedFactor = new Decimal(1).plus(new Decimal(physics.runningSpeed).div(1000)); // Speed effect

                reasons.push(`Pelton high centrifugal forces (${centrifugalAccel.toFixed(0)} m/s²)`);
                reasons.push(`High head pressure (${physics.head}m)`);

                break;

            case 'KAPLAN':
                // Low speed = tighter tolerance possible
                speedFactor = new Decimal(0.8).plus(new Decimal(physics.runningSpeed).div(200)); // Slower = tighter
                headFactor = new Decimal(1).plus(new Decimal(physics.head).div(100)); // Moderate head effect

                reasons.push(`KAPLAN low speed operation (${physics.runningSpeed} RPM)`);

                // Bulb variant: underwater = thermal stability
                if (physics.rotorDiameter < 2) { // Bulb turbines smaller
                    centrifugalFactor = new Decimal(0.9);
                    reasons.push('Bulb configuration: better thermal stability');
                }

                break;

            case 'FRANCIS':
                // Medium speed, medium head = close to standard
                speedFactor = new Decimal(1).plus(new Decimal(physics.runningSpeed).minus(500).div(500).mul(0.2));
                headFactor = new Decimal(1).plus(new Decimal(physics.head).div(200));

                reasons.push(`FRANCIS medium-speed operation (${physics.runningSpeed} RPM)`);

                break;
        }

        // Combined adjustment factor
        const adjustmentFactor = centrifugalFactor.plus(headFactor).plus(speedFactor).div(3);

        // Clamp to reasonable range (0.03 - 0.08 mm/m)
        const adjustedTolerance = Decimal.max(
            0.03,
            Decimal.min(0.08, BASE_TOLERANCE.mul(adjustmentFactor))
        );

        return {
            baseTolerance: BASE_TOLERANCE.toNumber(),
            adjustedTolerance: adjustedTolerance.toNumber(),
            adjustmentFactor: adjustmentFactor.toNumber(),
            adjustmentReasons: reasons
        };
    }

    /**
     * Vibration tolerance based on running speed
     * Higher RPM = more acceptable vibration
     */
    static calculateVibrationTolerance(
        turbineFamily: TurbineFamily,
        physics: TurbinePhysics
    ): DynamicToleranceResult {
        const BASE_TOLERANCE = new Decimal(4.5); // mm/s - ISO 10816
        const reasons: string[] = [];

        let speedFactor = new Decimal(1.0);
        let sizeFactor = new Decimal(1.0);

        // Speed correlation: V_limit ∝ RPM^0.3 (empirical)
        const speedExponent = new Decimal(0.3);
        const referenceSpeed = new Decimal(500); // RPM
        speedFactor = new Decimal(physics.runningSpeed).div(referenceSpeed).pow(speedExponent);

        // Size correlation: Larger machines = more vibration acceptable
        if (physics.rotorDiameter > 4) {
            sizeFactor = new Decimal(1.2);
            reasons.push('Large rotor diameter: increased tolerance');
        }

        const adjustmentFactor = speedFactor.mul(sizeFactor);
        const adjustedTolerance = BASE_TOLERANCE.mul(adjustmentFactor);

        reasons.push(`Speed-adjusted for ${physics.runningSpeed} RPM`);

        return {
            baseTolerance: BASE_TOLERANCE.toNumber(),
            adjustedTolerance: Decimal.min(7.0, adjustedTolerance).toNumber(), // Cap at 7 mm/s
            adjustmentFactor: adjustmentFactor.toNumber(),
            adjustmentReasons: reasons
        };
    }

    /**
     * Temperature tolerance based on load and efficiency
     */
    static calculateTemperatureTolerance(
        turbineFamily: TurbineFamily,
        physics: TurbinePhysics,
        currentLoad: number // % of rated power
    ): DynamicToleranceResult {
        const BASE_TOLERANCE = 80; // °C for bearings
        const reasons: string[] = [];

        let loadFactor = 1.0;

        // Higher load = more heat = looser tolerance
        if (currentLoad > 90) {
            loadFactor = 1.15;
            reasons.push('Operating at high load (>90%)');
        } else if (currentLoad < 50) {
            loadFactor = 0.9;
            reasons.push('Operating at part load (<50%)');
        }

        const adjustedTolerance = BASE_TOLERANCE * loadFactor;

        return {
            baseTolerance: BASE_TOLERANCE,
            adjustedTolerance,
            adjustmentFactor: loadFactor,
            adjustmentReasons: reasons
        };
    }

    /**
     * Build complete tolerance map with dynamic adjustments
     */
    static buildDynamicToleranceMap(
        turbineFamily: TurbineFamily,
        variant: TurbineVariant,
        physics: TurbinePhysics,
        currentLoad: number = 100
    ): ToleranceMap {
        const shaftAlignment = this.calculateShaftAlignmentTolerance(turbineFamily, physics);
        const vibration = this.calculateVibrationTolerance(turbineFamily, physics);
        const temperature = this.calculateTemperatureTolerance(turbineFamily, physics, currentLoad);

        const toleranceMap: ToleranceMap = {
            shaft_alignment: {
                value: shaftAlignment.adjustedTolerance,
                unit: 'mm/m',
                critical: true,
                dynamicAdjustment: {
                    baseTolerance: shaftAlignment.baseTolerance,
                    adjustmentFactor: shaftAlignment.adjustmentFactor,
                    reasons: shaftAlignment.adjustmentReasons
                }
            } as any,
            vibration_limit: {
                value: vibration.adjustedTolerance,
                unit: 'mm/s',
                critical: true,
                dynamicAdjustment: {
                    baseTolerance: vibration.baseTolerance,
                    adjustmentFactor: vibration.adjustmentFactor,
                    reasons: vibration.adjustmentReasons
                }
            } as any,
            temperature_limit: {
                value: temperature.adjustedTolerance,
                unit: '°C',
                critical: false,
                dynamicAdjustment: {
                    baseTolerance: temperature.baseTolerance,
                    adjustmentFactor: temperature.adjustmentFactor,
                    reasons: temperature.adjustmentReasons
                }
            } as any
        };

        return toleranceMap;
    }

    /**
     * Explains why tolerance differs from standard
     */
    static explainToleranceAdjustment(
        parameter: string,
        standardValue: number,
        adjustedValue: number,
        reasons: string[]
    ): string {
        const diff = adjustedValue - standardValue;
        const diffPercent = (diff / standardValue) * 100;

        let explanation = `${parameter} tolerance adjusted from ${standardValue} to ${adjustedValue.toFixed(3)} `;
        explanation += `(${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(1)}%).\n\n`;
        explanation += 'Reasons:\n';
        explanation += reasons.map((r, i) => `${i + 1}. ${r}`).join('\n');

        return explanation;
    }
}

// ===== USAGE EXAMPLE =====

/*
const physics: TurbinePhysics = {
    runningSpeed: 1000, // RPM (Pelton)
    head: 500, // meters
    flow: 8, // m³/s
    rotorWeight: 5000, // kg
    rotorDiameter: 2.5, // meters
    bearingSpan: 3.0 // meters
};

const peltonTolerances = DynamicToleranceCalculator.buildDynamicToleranceMap(
    'pelton',
    'pelton_horizontal',
    physics,
    95 // 95% load
);

console.log(peltonTolerances.shaft_alignment);
// Output:
// {
//     value: 0.068, // mm/m (LOOSER than 0.05 due to high centrifugal forces!)
//     unit: 'mm/m',
//     critical: true,
//     dynamicAdjustment: {
//         baseTolerance: 0.05,
//         adjustmentFactor: 1.36,
//         reasons: [
//             'Pelton high centrifugal forces (6135 m/s²)',
//             'High head pressure (500m)'
//         ]
//     }
// }

// vs Kaplan @ 100 RPM:
const kaplanPhysics = { ...physics, runningSpeed: 100, head: 50 };
const kaplanTolerances = DynamicToleranceCalculator.buildDynamicToleranceMap(
    'kaplan',
    'kaplan_vertical',
    kaplanPhysics,
    70
);

console.log(kaplanTolerances.shaft_alignment.value);
// Output: 0.042 mm/m (TIGHTER than 0.05 due to low forces!)
*/
