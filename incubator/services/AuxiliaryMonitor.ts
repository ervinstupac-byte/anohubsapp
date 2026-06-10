/**
 * AUXILIARY MONITOR SERVICE
 * The Vital Organs Guard 🫀
 * Monitoring HPU, Cooling Water, and Main Transformer.
 */

export interface AuxHealthStatus {
    system: 'COOLING' | 'HPU' | 'TRANSFORMER';
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    message: string;
    actionRequired?: string;
}

export class AuxiliaryMonitor {

    /**
     * COOLING BACKWASH LOGIC
     * Monitors differential pressure across filters.
     * Rule: DeltaP > 0.5 bar -> Backwash needed.
     */
    checkCoolingWater(
        deltaPBar: number,
        backwashAutoEnabled: boolean
    ): AuxHealthStatus {
        if (deltaPBar > 0.5) {
            if (backwashAutoEnabled) {
                return {
                    system: 'COOLING',
                    status: 'WARNING',
                    message: `High Filter DeltaP (${deltaPBar} bar). Auto-Backwash sequence triggered.`,
                    actionRequired: 'Verify Backwash Success'
                };
            } else {
                return {
                    system: 'COOLING',
                    status: 'CRITICAL',
                    message: `🚨 COOLING STARVATION! Filter DeltaP ${deltaPBar} bar. Backwash Manual/Disabled!`,
                    actionRequired: 'URGENT: Manually Clean Filters immediately.'
                };
            }
        }
        return { system: 'COOLING', status: 'HEALTHY', message: 'Filters clean. Flow normal.' };
    }

    /**
     * THE SERVO-VALVE PROTECTOR (HPU)
     * Monitors Oil Cleanliness (ISO 4406).
     * Dirty oil kills servo valves.
     */
    checkHPUMuscle(
        oilTempC: number,
        isoCode: string // e.g., "16/14/11"
    ): AuxHealthStatus {
        // Parse ISO Code (Simplified: just check first digit roughly)
        // Format: >4µm / >6µm / >14µm
        const parts = isoCode.split('/').map(Number);
        const p4um = parts[0];
        const p6um = parts[1];

        // Critical Limit for Servos: Usually 18/16/13 is max acceptable. Ideal < 16/14/11.

        let cleanlinessStatus: 'GOOD' | 'BAD' = 'GOOD';
        if (Number.isNaN(p4um) || Number.isNaN(p6um)) {
            // mild fallback
        } else {
            if (p4um > 18 || p6um > 16) {
                cleanlinessStatus = 'BAD';
            }
        }

        if (oilTempC > 60) {
            return {
                system: 'HPU',
                status: 'CRITICAL',
                message: `🔥 HPU OVERHEAT (${oilTempC}°C). Oil degrading rapidly!`,
                actionRequired: 'Check Cooler / Oil Level'
            };
        }

        if (cleanlinessStatus === 'BAD') {
            return {
                system: 'HPU',
                status: 'WARNING',
                message: `⚠️ DIRTY OIL DETECTED (ISO ${isoCode}). Servo-valve life reduced by 50%.`,
                actionRequired: 'Servo-valve damage risk! Filter oil unit immediately.'
            };
        }

        return { system: 'HPU', status: 'HEALTHY', message: `Muscle strong. Oil Clean (ISO ${isoCode}) & Cool (${oilTempC}°C).` };
    }

    /**
     * THE TRANSFORMER'S LAST STAND
     * Monitors Buchholz and Temp.
     */
    checkTransformer(
        buchholzTrip: boolean,
        windingTempC: number
    ): AuxHealthStatus {
        if (buchholzTrip) {
            return {
                system: 'TRANSFORMER',
                status: 'CRITICAL',
                message: '⚡ BUCHHOLZ RELAY TRIP! Internal Arc or Gas Accumulation.',
                actionRequired: 'SITE BLACKOUT RISK. DO NOT RE-ENERGIZE. Evacuate zone.'
            };
        }

        if (windingTempC > 95) {
            return {
                system: 'TRANSFORMER',
                status: 'WARNING',
                message: `Transformer Running Hot (${windingTempC}°C).`,
                actionRequired: 'Check Fans / Reduce Load'
            };
        }

        return { system: 'TRANSFORMER', status: 'HEALTHY', message: 'Humming quietly. Insulation secure.' };
    }

    /**
     * THE AUXILIARY PULSE (Start Readiness)
     * Checks DC Battery and Air Pressure.
     */
    checkStartReadiness(
        dcVoltage: number,
        airPressureBar: number
    ): { ready: boolean; message: string } {
        // DC System Rule: 110V Nominal. < 105V is danger level for trip coils.
        if (dcVoltage < 105) {
            return {
                ready: false,
                message: `⛔ START BLOCKED: DC Voltage Critical (${dcVoltage}V). Trip coils may fail!`
            };
        }

        // Air System Rule: Need enough pressure for brakes and gov oil cushion
        // 25 bar nominal, min 18 bar.
        if (airPressureBar < 18) {
            return {
                ready: false,
                message: `⛔ START BLOCKED: Air Pressure Low (${airPressureBar} bar). Brakes unavailable.`
            };
        }

        return { ready: true, message: '✅ DC & Air Systems Ready for Start.' };
    }
}
