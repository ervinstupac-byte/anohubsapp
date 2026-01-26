/**
 * EXPERT ACTION GUIDE
 * The Step-by-Step Mentor 🛠️📖
 * Maps Alarms to specific, actionable steps linked to drawings.
 */

export interface ActionPlan {
    alarmId: string;
    title: string;
    steps: string[];
    drawingRef: string;
}

export class ExpertActionGuide {
    private actions: Map<string, ActionPlan> = new Map();

    constructor() {
        // Hydrate with Knowledge
        this.registerPlan('WATER_HAMMER', {
            alarmId: 'WATER_HAMMER',
            title: '🌊 High Pressure Transient Response',
            steps: [
                'IMMEDIATE: Check Guide Vane closing time setting.',
                'INSPECT: Spiral case manhole for signs of stress.',
                'VERIFY: Surge Tank level capability.'
            ],
            drawingRef: 'Drawing 42, Section C (Surge Tank)'
        });

        this.registerPlan('SHAFT_SEAL_LEAK', {
            alarmId: 'SHAFT_SEAL_LEAK',
            title: '💦 Shaft Seal Failure Response',
            steps: [
                'CHECK: Cooling water flow to the seal.',
                'VERIFY: Inflatable seal air pressure (>7 bar).',
                'PREPARE: Emergency shutdown if leakage > 50 L/min.'
            ],
            drawingRef: 'Drawing 108, Page 2 (Seal Assembly)'
        });

        // KAPLAN SPECIFIC FAULTS
        this.registerPlan('SHEAR_PIN', {
            alarmId: 'SHEAR_PIN',
            title: '🔩 Shear Pin Failure (Wicket Gate)',
            steps: [
                'IDENTIFY: Specific broken gate via SCADA position mismatch.',
                'ISOLATE: Hydraulic pressure to servomotors.',
                'REPLACE: Standard calibrated pin (Ref: Stock #882-A).',
                'INSPECT: Obstruction in water passage (Wood/Rock).'
            ],
            drawingRef: 'Drawing 55, Section H (Distributor)'
        });

        this.registerPlan('HUB_OIL_EMULSIFICATION', {
            alarmId: 'HUB_OIL_EMULSIFICATION',
            title: '🫧 Hub Oil Water Ingress',
            steps: [
                'IMMEDIATE: Increase Hub Oil Head Tank level.',
                'SAMPLE: Take oil sample for crackle test.',
                'PLAN: Short-term outage for seal inspection.',
                'MONITOR: Bearing Vibrations (Water destroys lubricity).'
            ],
            drawingRef: 'Drawing 62, Lower Hub Assembly'
        });
    }

    private registerPlan(id: string, plan: ActionPlan) {
        this.actions.set(id, plan);
    }

    /**
     * GET GUIDE
     * Retrieves the map for a lost monter.
     */
    getGuide(alarmId: string): ActionPlan | null {
        // Intelligent fuzzy match or direct lookup
        // For demo, naive lookup
        let plan = this.actions.get(alarmId);

        // If exact match fails, try simple includes
        if (!plan) {
            for (const key of this.actions.keys()) {
                if (alarmId.includes(key)) {
                    plan = this.actions.get(key);
                    break;
                }
            }
        }

        return plan || null;
    }

    /**
     * ROOT CAUSE GROUPER (AUDIT FINDING #4)
     * Filters a flood of alarms to find the single "Prime Mover" event.
     * Hierarchy: PROTECTION > HYDRAULIC > MECHANICAL > AUXILIARY
     */
    determineRootCause(activeAlarms: string[]): ActionPlan | null {
        if (!activeAlarms || activeAlarms.length === 0) return null;

        // 1. TIER 1: ELECTRICAL PROTECTION (The Instant Killers)
        // If the generator tripped electrically, everything else (overspeed, low oil pressure) is a symptom.
        const protectionTrips = activeAlarms.filter(a =>
            a.includes('DIFFERENTIAL') ||
            a.includes('OVERCURRENT') ||
            a.includes('GROUND_FAULT') ||
            a.includes('ROTOR_CRAMP') // From SCADAHeartbeat
        );

        if (protectionTrips.length > 0) {
            // Return specific guide for the first protection trip found
            return this.getGuide(protectionTrips[0]) || {
                alarmId: 'GEN_PROT_TRIP',
                title: '⚡ ELECTRICAL FAULT TRIP',
                steps: [
                    'EVACUATE: Arc Flash Hazard.',
                    'VERIFY: Breaker Open Status.',
                    'DO NOT RESET: Call Specialists.'
                ],
                drawingRef: 'Single Line Diagram 01'
            };
        }

        // 2. TIER 2: HYDRAULIC TRANSIENTS (The Water Hammer)
        if (activeAlarms.some(a => a.includes('WATER_HAMMER') || a.includes('SURGE'))) {
            return this.getGuide('WATER_HAMMER');
        }

        // 3. TIER 3: MECHANICAL (The Shake)
        if (activeAlarms.some(a => a.includes('VIBRATION') || a.includes('SHAFT'))) {
            // Check for specific known mechanical issues
            if (activeAlarms.some(a => a.includes('SEAL'))) return this.getGuide('SHAFT_SEAL_LEAK');

            return {
                alarmId: 'MECH_VIB',
                title: '⚙️ MECHANICAL INSTABILITY',
                steps: ['CHECK: Load Rejection Status', 'MONITOR: Bearing Temps'],
                drawingRef: 'Turbine Section 05'
            };
        }

        // Default: Just take the first one
        return this.getGuide(activeAlarms[0]);
    }
}
