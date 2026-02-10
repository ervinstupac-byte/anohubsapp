
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

export const ANCESTRAL_PATTERNS = {
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
    }
} as const;

export class AncestralOracleService {
    
    /**
     * Consults the Oracle for wisdom based on active alarms.
     * @param alarms List of active alarm codes (e.g., 'SOVEREIGN_MECHANICAL_ALARM')
     * @param telemetry Current telemetry snapshot for context
     * @returns WisdomTooltip | null
     */
    static consult(alarms: string[], telemetry: any): WisdomTooltip | null {
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
                id: ANCESTRAL_PATTERNS.LOOSENESS_PHASE.id,
                title: 'Sovereign Tip: Structure',
                message: ANCESTRAL_PATTERNS.LOOSENESS_PHASE.message,
                standard: ANCESTRAL_PATTERNS.LOOSENESS_PHASE.standard,
                action: ANCESTRAL_PATTERNS.LOOSENESS_PHASE.action,
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

    static getWisdom(key: keyof typeof ANCESTRAL_PATTERNS): WisdomTooltip {
        return {
            id: ANCESTRAL_PATTERNS[key].id,
            title: `Sovereign Tip: ${key.split('_')[0]}`,
            message: ANCESTRAL_PATTERNS[key].message,
            standard: ANCESTRAL_PATTERNS[key].standard,
            action: ANCESTRAL_PATTERNS[key].action,
            severity: ANCESTRAL_PATTERNS[key].severity
        };
    }
}
