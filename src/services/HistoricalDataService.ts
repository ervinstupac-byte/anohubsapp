
/**
 * NC-13100: Ancestral Oracle Service
 * The digital embodiment of the "Senior Field Engineer" (The Werkmeister).
 * 
 * Provides:
 * 1. ISO 10816-5 Standard Checks
 * 2. "Sovereign Tips" (Wisdom Tooltips) based on alarms
 * 3. Contextual Pattern Recognition (2x vs 1x vibration, etc.)
 */

export interface WisdomTooltip {
    id: string;
    title: string;
    message: string;
    standard?: string; // e.g., "ISO 10816-5"
    action: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export const HISTORICAL_PATTERNS = {
    // VIBRATION PATTERNS
    MISALIGNMENT_2X: {
        id: 'MISALIGNMENT_2X',
        pattern: '2x > 1x',
        message: '2x peak growing faster than 1x indicates angular misalignment.',
        standard: 'ISO 10816-5',
        action: 'Schedule hot alignment check (>4h operation).',
        severity: 'WARNING'
    },
    LOOSENESS_PHASE: {
        id: 'LOOSENESS_PHASE',
        pattern: 'Phase Wander',
        message: 'Phase wandering > 20° cycle-to-cycle indicates structural looseness.',
        standard: 'Werkmeister Protocol',
        action: 'Torque-verify anchor bolts (M36 = 1850Nm).',
        severity: 'CRITICAL'
    },
    
    // CAVITATION PATTERNS
    CAVITATION_SIGMA: {
        id: 'CAVITATION_SIGMA',
        pattern: 'Sigma < 1.3',
        message: 'Sigma margin < 1.3 implies imminent cavitation inception.',
        standard: 'Thoma Criterion',
        action: 'Increase tailwater or reduce load.',
        severity: 'CRITICAL'
    },

    // ELECTRICAL PATTERNS
    SHAFT_CURRENT: {
        id: 'SHAFT_CURRENT',
        pattern: 'Voltage > 1V',
        message: 'Shaft voltage > 1V peak indicates bearing current risk (EDM).',
        standard: 'IEEE 112',
        action: 'Inspect grounding brush contact resistance (<10mΩ).',
        severity: 'WARNING'
    },

    // KINETIC PATTERNS (NC-15200)
    PURE_UNBALANCE: {
        id: 'PURE_UNBALANCE',
        pattern: 'High E + High R²',
        message: 'High Eccentricity with perfect sine fit indicates Mass Unbalance.',
        standard: 'ISO 21940',
        action: 'Calculate trim weight at phase opposition.',
        severity: 'WARNING'
    },
    MECHANICAL_LOOSENESS: {
        id: 'MECHANICAL_LOOSENESS',
        pattern: 'High E + Low R²',
        message: 'High Eccentricity with erratic phase fit indicates Structural Looseness.',
        standard: 'VDI 2056',
        action: 'Check bolt torque and soleplate integrity.',
        severity: 'CRITICAL'
    }
} as const;

export class HistoricalDataService {
    
    /**
     * Consults the Oracle for wisdom based on active alarms.
     * @param alarms List of active alarm codes (e.g., 'SOVEREIGN_MECHANICAL_ALARM')
     * @param telemetry Current telemetry snapshot for context
     * @returns WisdomTooltip | null
     */
    static consult(alarms: string[], telemetry: any): WisdomTooltip | null {
        
        // 0. CHECK KINETIC ALIGNMENT (NC-15200)
        // This takes precedence as it's a calculated pathology
        if (telemetry.alignment) {
            const { eccentricity, rsquared } = telemetry.alignment;
            
            // Rule 1: Mechanical Looseness (High Runout, Poor Fit)
            if (eccentricity > 0.15 && rsquared < 0.90) {
                 return {
                    id: ANCESTRAL_PATTERNS.MECHANICAL_LOOSENESS.id,
                    title: 'Sovereign Warning: Looseness',
                    message: `Detected E=${eccentricity.toFixed(2)}mm with erratic phase (R²=${rsquared.toFixed(2)}).`,
                    standard: ANCESTRAL_PATTERNS.MECHANICAL_LOOSENESS.standard,
                    action: ANCESTRAL_PATTERNS.MECHANICAL_LOOSENESS.action,
                    severity: 'CRITICAL'
                } as WisdomTooltip;
            }

            // Rule 2: Pure Unbalance (High Runout, Perfect Fit)
            if (eccentricity > 0.10 && rsquared >= 0.95) {
                 return {
                    id: HISTORICAL_PATTERNS.PURE_UNBALANCE.id,
                    title: 'System Insight: Unbalance',
                    message: `Clean sine wave (R²=${rsquared.toFixed(2)}) at E=${eccentricity.toFixed(2)}mm suggests mass unbalance.`,
                    standard: ANCESTRAL_PATTERNS.PURE_UNBALANCE.standard,
                    action: ANCESTRAL_PATTERNS.PURE_UNBALANCE.action,
                    severity: 'WARNING'
                } as WisdomTooltip;
            }
        }

        // 1. Check for specific mechanical alarms from NC-13000
        if (alarms.includes('SOVEREIGN_MECHANICAL_ALARM')) {
            // Contextualize based on telemetry
            
            // Vibration Context
            const vibX = telemetry.mechanical?.vibrationX || 0;
            const vibY = telemetry.mechanical?.vibrationY || 0;
            const maxVib = Math.max(vibX, vibY);

            if (maxVib > 0.1) { // Simple threshold for demo logic
                // In a real FFT system, we'd check 2x vs 1x. 
                // Here we assume if vibration is high, suggest alignment first (80% of cases).
                return {
                    id: ANCESTRAL_PATTERNS.MISALIGNMENT_2X.id,
                    title: 'Sovereign Tip: Alignment',
                    message: ANCESTRAL_PATTERNS.MISALIGNMENT_2X.message,
                    standard: ANCESTRAL_PATTERNS.MISALIGNMENT_2X.standard,
                    action: ANCESTRAL_PATTERNS.MISALIGNMENT_2X.action,
                    severity: 'WARNING'
                } as WisdomTooltip;
            }

            // Wearing Gap Context (if we had access to it in the alarm string, or passed telemetry)
             // For now, default to Looseness if generic mechanical alarm
             return {
                id: HISTORICAL_PATTERNS.LOOSENESS_PHASE.id,
                title: 'System Tip: Structure',
                message: HISTORICAL_PATTERNS.LOOSENESS_PHASE.message,
                standard: HISTORICAL_PATTERNS.LOOSENESS_PHASE.standard,
                action: HISTORICAL_PATTERNS.LOOSENESS_PHASE.action,
                severity: 'CRITICAL'
             } as WisdomTooltip;
        }

        // 2. Check for Cavitation (Sigma)
        const sigma = telemetry?.hydraulic?.sigma;
        if (typeof sigma === 'number' && sigma < 1.3) {
            return {
                id: ANCESTRAL_PATTERNS.CAVITATION_SIGMA.id,
                title: 'Sovereign Tip: Cavitation',
                message: ANCESTRAL_PATTERNS.CAVITATION_SIGMA.message,
                standard: ANCESTRAL_PATTERNS.CAVITATION_SIGMA.standard,
                action: ANCESTRAL_PATTERNS.CAVITATION_SIGMA.action,
                severity: 'CRITICAL'
            } as WisdomTooltip;
        }

        return null;
    }

    static getWisdom(key: keyof typeof HISTORICAL_PATTERNS): WisdomTooltip {
        return {
            id: HISTORICAL_PATTERNS[key].id,
            title: `System Tip: ${key.split('_')[0]}`,
            message: HISTORICAL_PATTERNS[key].message,
            standard: HISTORICAL_PATTERNS[key].standard,
            action: HISTORICAL_PATTERNS[key].action,
            severity: HISTORICAL_PATTERNS[key].severity
        };
    }
}
