// Threshold Resolver Service
// Handles cross-machine logic with priority: Instance > Variant > Family > Global Default
// Unit-aware comparison system

import { Threshold, ToleranceMap, TurbineFamily, TurbineVariant, TurbineConfiguration } from '../models/turbine/types';

// Global default thresholds (fallback)
const GLOBAL_DEFAULTS: ToleranceMap = {
    vibration: { value: 4.5, unit: 'mm/s', critical: true },
    temperature: { value: 80, unit: '°C', critical: false },
    shaft_alignment: { value: 0.05, unit: 'mm/m', critical: true }
};

interface ThresholdResolutionResult {
    threshold: Threshold;
    source: 'INSTANCE' | 'VARIANT' | 'FAMILY' | 'GLOBAL_DEFAULT' | 'NOT_DEFINED';
}

export class ThresholdResolver {
    /**
     * Resolves the active threshold for a given parameter
     * Priority: Instance > Variant > Family > Global Default
     * 
     * @param parameter - Parameter name (e.g., 'shaft_alignment', 'nozzle_alignment')
     * @param instanceThresholds - Asset-specific overrides
     * @param variantTolerances - Variant-specific tolerances
     * @param familyTolerances - Family default tolerances
     * @returns Resolved threshold with source information
     */
    static resolve(
        parameter: string,
        instanceThresholds?: ToleranceMap,
        variantTolerances?: ToleranceMap,
        familyTolerances?: ToleranceMap
    ): ThresholdResolutionResult {
        // Priority 1: Instance-specific override
        if (instanceThresholds?.[parameter]) {
            return {
                threshold: instanceThresholds[parameter],
                source: 'INSTANCE'
            };
        }

        // Priority 2: Variant-specific
        if (variantTolerances?.[parameter]) {
            return {
                threshold: variantTolerances[parameter],
                source: 'VARIANT'
            };
        }

        // Priority 3: Family default
        if (familyTolerances?.[parameter]) {
            return {
                threshold: familyTolerances[parameter],
                source: 'FAMILY'
            };
        }

        // Priority 4: Global default
        if (GLOBAL_DEFAULTS[parameter]) {
            return {
                threshold: GLOBAL_DEFAULTS[parameter],
                source: 'GLOBAL_DEFAULT'
            };
        }

        // Not defined anywhere
        return {
            threshold: {
                value: 0,
                unit: 'unknown',
                critical: false
            },
            source: 'NOT_DEFINED'
        };
    }

    /**
     * Compares a value against resolved threshold
     * UNIT-AWARE: Ensures units match before comparison
     * 
     * @param value - Measured value
     * @param unit - Unit of measured value
     * @param threshold - Resolved threshold
     * @returns Comparison result with status
     */
    static compareWithThreshold(
        value: number,
        unit: string,
        threshold: Threshold
    ): {
        exceeded: boolean;
        severity: 'OK' | 'WARNING' | 'CRITICAL';
        message: string;
    } {
        // Unit mismatch check
        if (threshold.unit !== unit) {
            return {
                exceeded: false,
                severity: 'WARNING',
                message: `Unit mismatch: measured in ${unit}, threshold in ${threshold.unit}. Cannot compare.`
            };
        }

        // Check against warning threshold first
        if (threshold.warningThreshold !== undefined && value > threshold.warningThreshold) {
            return {
                exceeded: false,
                severity: 'WARNING',
                message: `Value ${value} ${unit} exceeds warning threshold ${threshold.warningThreshold} ${unit}`
            };
        }

        // Check against critical threshold
        if (value > threshold.value) {
            return {
                exceeded: true,
                severity: threshold.critical ? 'CRITICAL' : 'WARNING',
                message: `Value ${value} ${unit} exceeds ${threshold.critical ? 'CRITICAL' : ''} threshold ${threshold.value} ${unit}`
            };
        }

        return {
            exceeded: false,
            severity: 'OK',
            message: `Value ${value} ${unit} is within acceptable range (< ${threshold.value} ${unit})`
        };
    }

    /**
     * Demonstrates cross-machine tolerance differences
     * Kaplan: 0.05 mm/m (shaft alignment)
     * Pelton: 0.1 mm (nozzle alignment - absolute measurement!)
     * Francis: 0.3 mm (labyrinth clearance)
     */
    static getCrossMachineExample(): Record<string, any> {
        // Example configurations
        const kaplanFamily: ToleranceMap = {
            shaft_alignment: { value: 0.05, unit: 'mm/m', critical: true }
        };

        const peltonFamily: ToleranceMap = {
            nozzle_alignment: { value: 0.1, unit: 'mm', critical: true }
        };

        const francisFamily: ToleranceMap = {
            labyrinth_clearance: { value: 0.3, unit: 'mm', critical: false }
        };

        return {
            kaplan_shaft: this.resolve('shaft_alignment', undefined, undefined, kaplanFamily),
            // => { value: 0.05, unit: 'mm/m', critical: true }

            pelton_nozzle: this.resolve('nozzle_alignment', undefined, undefined, peltonFamily),
            // => { value: 0.1, unit: 'mm', critical: true }
            // DIFFERENT UNIT! 'mm' not 'mm/m'

            francis_labyrinth: this.resolve('labyrinth_clearance', undefined, undefined, francisFamily)
            // => { value: 0.3, unit: 'mm', critical: false }
        };
    }

    /**
     * Builds complete tolerance map for an asset
     * Merges all sources with proper priority
     */
    static buildCompleteToleranceMap(
        instanceThresholds?: ToleranceMap,
        variantTolerances?: ToleranceMap,
        familyTolerances?: ToleranceMap
    ): ToleranceMap {
        const allParameters = new Set<string>([
            ...Object.keys(familyTolerances || {}),
            ...Object.keys(variantTolerances || {}),
            ...Object.keys(instanceThresholds || {})
        ]);

        const result: ToleranceMap = {};

        allParameters.forEach(param => {
            const resolution = this.resolve(param, instanceThresholds, variantTolerances, familyTolerances);
            if (resolution.source !== 'NOT_DEFINED') {
                result[param] = resolution.threshold;
            }
        });

        return result;
    }

    /**
     * Validates that all required parameters have thresholds defined
     */
    static validateRequiredParameters(
        requiredParams: string[],
        tolerances: ToleranceMap
    ): {
        valid: boolean;
        missing: string[];
    } {
        const missing = requiredParams.filter(param => !tolerances[param]);

        return {
            valid: missing.length === 0,
            missing
        };
    }
}

// ===== USAGE EXAMPLES =====

/*
// Example 1: Kaplan horizontal with instance override for hydraulic shock
const kaplanInstanceThresholds = {
    hydraulic_shock_tolerance: { value: 3.0, unit: 'bar/s', critical: true } // Stricter than default 5.0
};

const kaplanVariantThresholds = {
    hydraulic_shock_tolerance: { value: 5.0, unit: 'bar/s', critical: true }
};

const result = ThresholdResolver.resolve(
    'hydraulic_shock_tolerance',
    kaplanInstanceThresholds,
    kaplanVariantThresholds,
    undefined
);
// => { threshold: { value: 3.0, ... }, source: 'INSTANCE' }

// Example 2: Unit-aware comparison
const peltonMeasurement = 0.12; // mm
const peltonThreshold = { value: 0.1, unit: 'mm', critical: true };

const comparison = ThresholdResolver.compareWithThreshold(
    peltonMeasurement,
    'mm',
    peltonThreshold
);
// => { exceeded: true, severity: 'CRITICAL', message: '...' }

// Example 3: Wrong unit (will catch the error)
const wrongComparison = ThresholdResolver.compareWithThreshold(
    0.06, // measured in mm/m
    'mm/m',
    { value: 0.1, unit: 'mm', critical: true } // threshold in mm
);
// => { exceeded: false, severity: 'WARNING', message: 'Unit mismatch...' }
*/
