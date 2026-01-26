/**
 * CauseEffectMatrix.ts
 * 
 * ESD (Emergency Shutdown) Matrix
 * Maps faults to specific Shutdown Levels.
 * Level 1: Alarm Only
 * Level 2: Normal Stop (Unload -> Breaker Open -> Stop)
 * Level 3: Emergency Trip (Breaker Open -> Fast Close -> Solenoid Trip)
 */

export type ShutdownLevel = 'LEVEL_0_INFO' | 'LEVEL_1_ALARM' | 'LEVEL_2_NORMAL_STOP' | 'LEVEL_3_EMERGENCY_TRIP';

export interface ESDAction {
    fault: string;
    level: ShutdownLevel;
    description: string;
}

export class CauseEffectMatrix {

    // The Matrix Definition
    private static readonly MATRIX: Record<string, ShutdownLevel> = {
        'TEMP_BEARING_HIGH_WARNING': 'LEVEL_1_ALARM',
        'TEMP_BEARING_HIGH_TRIP': 'LEVEL_2_NORMAL_STOP', // Save the machine but graceful if possible? Usually Hard Trip.
        // Actually, Bearing Temp Trip is usually Level 3 to prevent wipe.
        // Let's correct for industry standard:

        'BEARING_TEMP_HH': 'LEVEL_3_EMERGENCY_TRIP',
        'BEARING_TEMP_H': 'LEVEL_1_ALARM',

        'OIL_PRESSURE_LL': 'LEVEL_3_EMERGENCY_TRIP',
        'OIL_PRESSURE_L': 'LEVEL_1_ALARM',

        'GOV_OIL_LEVEL_L': 'LEVEL_1_ALARM',
        'GOV_OIL_LEVEL_LL': 'LEVEL_2_NORMAL_STOP', // Stop before we lose control, but maybe not violent trip

        'VIBRATION_H': 'LEVEL_1_ALARM',
        'VIBRATION_HH': 'LEVEL_3_EMERGENCY_TRIP',

        'GENERATOR_DIFF_CURRENT': 'LEVEL_3_EMERGENCY_TRIP', // Electrical fault = Instant trip

        'COOLING_FLOW_LOW': 'LEVEL_1_ALARM',
        'COOLING_FLOW_LOST': 'LEVEL_2_NORMAL_STOP' // Unload and stop before overheat
    };

    /**
     * EVALUATE FAULT
     */
    public static evaluateFault(faultCode: string): ESDAction {
        const level = this.MATRIX[faultCode] || 'LEVEL_0_INFO';

        return {
            fault: faultCode,
            level,
            description: this.getLevelDescription(level)
        };
    }

    private static getLevelDescription(level: ShutdownLevel): string {
        switch (level) {
            case 'LEVEL_3_EMERGENCY_TRIP': return 'FAST CLOSE + BREAKER OPEN';
            case 'LEVEL_2_NORMAL_STOP': return 'UNLOAD > BREAKER OPEN > STOP';
            case 'LEVEL_1_ALARM': return 'ANNUNCIATOR ONLY';
            default: return 'LOG ONLY';
        }
    }
}
