/**
 * ENGINEERING VALIDATION ENGINE (NC-4.2)
 * 
 * "Safety Net" for physically impossible values.
 * Validates user input against engineering reality.
 */

export interface ValidationResult {
    isValid: boolean;
    field: string;
    value: number;
    message: string;
    severity: 'info' | 'warning' | 'error';
    suggestedRange?: { min: number; max: number };
}

export interface CrossSectorEffect {
    sourceSector: string;
    sourceField: string;
    affectedSector: string;
    affectedField: string;
    stressMultiplier: number;
    message: string;
}

/**
 * PHYSICAL LIMITS - Based on real engineering constraints
 */
const PHYSICAL_LIMITS = {
    // Mechanical
    alignment: { min: 0, max: 2.0, unit: 'mm/m', name: 'Shaft Alignment' },
    vibration: { min: 0, max: 50, unit: 'mm/s', name: 'Vibration Velocity' },
    axialPlay: { min: 0, max: 5.0, unit: 'mm', name: 'Axial Play' },

    // Thermal
    bearingTemp: { min: -40, max: 200, unit: '°C', name: 'Bearing Temperature' },
    oilTemp: { min: -20, max: 120, unit: '°C', name: 'Oil Temperature' },
    ambientTemp: { min: -50, max: 60, unit: '°C', name: 'Ambient Temperature' },

    // Electrical
    insulationResistance: { min: 0, max: 10000, unit: 'MΩ', name: 'Insulation Resistance' },
    gridFrequency: { min: 45, max: 55, unit: 'Hz', name: 'Grid Frequency' },
    voltage: { min: 0, max: 50, unit: 'kV', name: 'Voltage' },

    // Hydraulic
    head: { min: 0, max: 2000, unit: 'm', name: 'Net Head' },
    flow: { min: 0, max: 1000, unit: 'm³/s', name: 'Flow Rate' },
    efficiency: { min: 0, max: 100, unit: '%', name: 'Efficiency' },

    // Structural
    hoopStress: { min: 0, max: 500, unit: 'MPa', name: 'Hoop Stress' },
    wallThickness: { min: 1, max: 100, unit: 'mm', name: 'Wall Thickness' },
    pressure: { min: 0, max: 100, unit: 'bar', name: 'Pressure' }
};

export const EngineeringValidation = {
    /**
     * Validate a single field value against physical limits
     */
    validateField(field: keyof typeof PHYSICAL_LIMITS, value: number): ValidationResult {
        const limits = PHYSICAL_LIMITS[field];

        if (value < limits.min) {
            return {
                isValid: false,
                field: limits.name,
                value,
                message: `${limits.name} cannot be negative or below ${limits.min} ${limits.unit}`,
                severity: 'error',
                suggestedRange: { min: limits.min, max: limits.max }
            };
        }

        if (value > limits.max) {
            return {
                isValid: false,
                field: limits.name,
                value,
                message: `${limits.name} of ${value} ${limits.unit} exceeds physical maximum (${limits.max} ${limits.unit})`,
                severity: 'error',
                suggestedRange: { min: limits.min, max: limits.max }
            };
        }

        return {
            isValid: true,
            field: limits.name,
            value,
            message: 'Value within engineering limits',
            severity: 'info'
        };
    },

    /**
     * Validate bearing temperature specifically
     * Includes warning thresholds before critical
     */
    validateBearingTemp(tempC: number): ValidationResult {
        const base = this.validateField('bearingTemp', tempC);
        if (!base.isValid) return base;

        if (tempC > 85) {
            return {
                isValid: true,
                field: 'Bearing Temperature',
                value: tempC,
                message: `Critical: ${tempC}°C exceeds safe operating limit (85°C). Immediate shutdown recommended.`,
                severity: 'error'
            };
        }

        if (tempC > 70) {
            return {
                isValid: true,
                field: 'Bearing Temperature',
                value: tempC,
                message: `Warning: ${tempC}°C approaching critical threshold. Monitor closely.`,
                severity: 'warning'
            };
        }

        return base;
    },

    /**
     * Validate alignment with Heritage Standard check
     */
    validateAlignment(alignmentMmM: number): ValidationResult {
        const base = this.validateField('alignment', alignmentMmM);
        if (!base.isValid) return base;

        const GOLDEN_STANDARD = 0.05;

        if (alignmentMmM > GOLDEN_STANDARD * 4) { // > 0.20 mm/m
            return {
                isValid: true,
                field: 'Shaft Alignment',
                value: alignmentMmM,
                message: `Critical deviation: ${alignmentMmM} mm/m is ${(alignmentMmM / GOLDEN_STANDARD).toFixed(1)}x the Golden Standard.`,
                severity: 'error'
            };
        }

        if (alignmentMmM > GOLDEN_STANDARD) {
            return {
                isValid: true,
                field: 'Shaft Alignment',
                value: alignmentMmM,
                message: `Heritage deviation: ${alignmentMmM} mm/m exceeds 0.05 mm/m Golden Standard.`,
                severity: 'warning'
            };
        }

        return base;
    },

    /**
     * Batch validate multiple fields
     */
    validateBatch(values: Record<string, number>): ValidationResult[] {
        const results: ValidationResult[] = [];

        for (const [field, value] of Object.entries(values)) {
            if (field in PHYSICAL_LIMITS) {
                results.push(this.validateField(field as keyof typeof PHYSICAL_LIMITS, value));
            }
        }

        return results.filter(r => !r.isValid || r.severity !== 'info');
    }
};

/**
 * CROSS-SECTOR DOMINO EFFECT ENGINE
 * 
 * Links between sectors to propagate stress effects:
 * - Misalignment → Bearing stress → Oil degradation
 * - High vibration → Seal wear → Leakage risk
 * - Grid instability → Generator stress → Insulation degradation
 */
export const CrossSectorEngine = {
    /**
     * GOLDEN STANDARD (Heritage)
     */
    GOLDEN_ALIGNMENT: 0.05, // mm/m

    /**
     * Calculate thermal stress multiplier based on alignment deviation
     * 
     * Physics: Misalignment causes uneven load distribution on bearings,
     * increasing friction and heat generation (cubic relationship).
     */
    calculateThermalStressFromAlignment(alignmentMmM: number): number {
        if (alignmentMmM <= this.GOLDEN_ALIGNMENT) {
            return 1.0; // No additional stress
        }

        const deviationRatio = alignmentMmM / this.GOLDEN_ALIGNMENT;
        // Thermal stress increases with square of misalignment
        return 1.0 + (Math.pow(deviationRatio, 2) - 1) * 0.1;
    },

    /**
     * Calculate oil longevity impact from alignment
     * 
     * Physics: Misalignment increases particle generation from wear,
     * accelerating oil contamination.
     */
    calculateOilLongevityImpact(alignmentMmM: number): { multiplier: number; yearsLost: number } {
        const baseOilLife = 5; // years

        if (alignmentMmM <= this.GOLDEN_ALIGNMENT) {
            return { multiplier: 1.0, yearsLost: 0 };
        }

        const deviationRatio = alignmentMmM / this.GOLDEN_ALIGNMENT;
        const wearFactor = Math.pow(deviationRatio, 2);
        const adjustedLife = baseOilLife / wearFactor;

        return {
            multiplier: wearFactor,
            yearsLost: baseOilLife - adjustedLife
        };
    },

    /**
     * Predict bearing temperature increase from alignment stress
     */
    predictBearingTempIncrease(
        currentTempC: number,
        alignmentMmM: number
    ): { predictedTemp: number; warning: boolean; message: string } {
        const stressMultiplier = this.calculateThermalStressFromAlignment(alignmentMmM);
        const tempIncrease = (stressMultiplier - 1.0) * 15; // ~15°C max increase from misalignment
        const predictedTemp = currentTempC + tempIncrease;

        const warning = alignmentMmM > this.GOLDEN_ALIGNMENT;

        return {
            predictedTemp,
            warning,
            message: warning
                ? `Thermal Stress: Alignment deviation may increase bearing temp by +${tempIncrease.toFixed(1)}°C`
                : 'Thermal profile nominal'
        };
    },

    /**
     * Get all cross-sector effects for current state
     */
    analyzeCrossSectorEffects(state: {
        alignment?: number;
        vibration?: number;
        bearingTemp?: number;
        gridFrequency?: number;
    }): CrossSectorEffect[] {
        const effects: CrossSectorEffect[] = [];
        const alignment = state.alignment || 0;
        const vibration = state.vibration || 0;
        const frequency = state.gridFrequency || 50;

        // 1. Alignment → Bearing Temperature
        if (alignment > this.GOLDEN_ALIGNMENT) {
            const stressMultiplier = this.calculateThermalStressFromAlignment(alignment);
            effects.push({
                sourceSector: 'MECHANICAL',
                sourceField: 'Shaft Alignment',
                affectedSector: 'ELECTRICAL/SCADA',
                affectedField: 'Bearing Temperature',
                stressMultiplier,
                message: `Misalignment (${alignment.toFixed(3)} mm/m) applying ${((stressMultiplier - 1) * 100).toFixed(0)}% thermal stress`
            });
        }

        // 2. Alignment → Oil Longevity
        if (alignment > this.GOLDEN_ALIGNMENT) {
            const oilImpact = this.calculateOilLongevityImpact(alignment);
            effects.push({
                sourceSector: 'MECHANICAL',
                sourceField: 'Shaft Alignment',
                affectedSector: 'MECHANICAL',
                affectedField: 'Oil Longevity',
                stressMultiplier: oilImpact.multiplier,
                message: `Oil service interval reduced by ${oilImpact.yearsLost.toFixed(1)} years due to accelerated wear`
            });
        }

        // 3. Vibration → Seal Integrity
        if (vibration > 2.8) { // ISO 10816 "Satisfactory" threshold
            const sealStress = vibration / 2.8;
            effects.push({
                sourceSector: 'MECHANICAL',
                sourceField: 'Vibration',
                affectedSector: 'MECHANICAL',
                affectedField: 'Seal Integrity',
                stressMultiplier: sealStress,
                message: `High vibration (${vibration.toFixed(2)} mm/s) accelerating seal wear`
            });
        }

        // 4. Grid Frequency → Generator Stress
        const freqDeviation = Math.abs(frequency - 50);
        if (freqDeviation > 0.5) {
            const gridStress = 1 + (freqDeviation * 0.2);
            effects.push({
                sourceSector: 'ELECTRICAL/SCADA',
                sourceField: 'Grid Frequency',
                affectedSector: 'ELECTRICAL/SCADA',
                affectedField: 'Generator Insulation',
                stressMultiplier: gridStress,
                message: `Grid deviation (${freqDeviation.toFixed(2)} Hz) inducing insulation stress`
            });
        }

        return effects;
    },

    /**
     * Check if thermal stress warning should be shown
     * even without explicit temperature input
     */
    shouldShowThermalWarning(alignmentMmM: number): boolean {
        return alignmentMmM > this.GOLDEN_ALIGNMENT;
    },

    /**
     * Get Heritage Certification status
     */
    getHeritageCertification(state: {
        alignment?: number;
        vibration?: number;
        bearingTemp?: number;
    }): { certified: boolean; reasons: string[] } {
        const reasons: string[] = [];
        const alignment = state.alignment || 0;
        const vibration = state.vibration || 0;
        const temp = state.bearingTemp || 0;

        if (alignment > this.GOLDEN_ALIGNMENT) {
            reasons.push(`Alignment ${alignment.toFixed(3)} mm/m exceeds 0.05 mm/m standard`);
        }
        if (vibration > 1.1) { // ISO "Good" threshold
            reasons.push(`Vibration ${vibration.toFixed(2)} mm/s exceeds ISO "Good" threshold`);
        }
        if (temp > 65) {
            reasons.push(`Bearing temperature ${temp}°C exceeds optimal range`);
        }

        return {
            certified: reasons.length === 0,
            reasons
        };
    }
};
