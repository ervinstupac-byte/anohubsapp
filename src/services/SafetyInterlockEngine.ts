/**
 * SafetyInterlockEngine.ts
 *
 * ⚠️ DISCLAIMER: VISUALIZATION / SIMULATION ONLY ⚠️
 *
 * This module provides SIMULATED safety interlock logic for UI display
 * and training/demonstration purposes. It does NOT control real equipment.
 *
 * REAL safety interlocks MUST be implemented in:
 *   - PLC / DCS firmware (IEC 61131-3)
 *   - Safety Instrumented Systems (SIS per IEC 61511)
 *   - Hardwired relay logic (fail-safe design)
 *
 * This client-side code has NO authority to trip, block, or prevent
 * any physical operation. Relying on browser JavaScript for safety-critical
 * decisions would violate IEC 62443 and industry best practices.
 *
 * Checks modeled:
 * - Overspeed (>115%)
 * - Reverse Power (Motoring)
 * - Emergency Stop (E-Stop)
 * - Dead Man Switch (System heartbeat)
 */
import { useProjectConfigStore } from '../features/config/ProjectConfigStore';

export interface InterlockStatus {
    tripActive: boolean;
    tripReason: string | null;
    actionRequired: 'NONE' | 'TRIP' | 'BLOCK_START';
}

export interface DeadManStatus {
    safe: boolean;
    action?: string;
    latency?: number;
}

export class SafetyInterlockEngine {

    // Hard limits
    private static readonly OVERSPEED_TRIP_PCT = 115.0;
    private static readonly REVERSE_POWER_TRIP_MW = -2.0; // Motoring limit
    private static readonly MAX_LATENCY_MS = 2000; // 2 seconds heartbeat limit

    /**
     * EVALUATE INTERLOCKS
     * Returns immediate safety action if boundaries are crossed.
     */
    public static checkProtections(
        speedPct: number,
        activePowerMW: number,
        eStopPressed: boolean,
        vibrationTotal: number, // mm/s
        context?: {
            family?: 'PELTON' | 'KAPLAN' | 'FRANCIS' | string;
            variant?: string;
            telemetry?: {
                flowM3s?: number;
                jetRateChange?: number;
                wicketGatePct?: number;
                bladeAngleDeg?: number;
                offCamDeviationDeg?: number;
                draftTubeVortexAmplitude?: number;
                vortexFrequencyHz?: number;
            };
        }
    ): InterlockStatus {

        // 1. E-STOP (Highest Priority)
        if (eStopPressed) {
            return {
                tripActive: true,
                tripReason: 'E-STOP ACTIVATED',
                actionRequired: 'TRIP'
            };
        }

        // 2. OVERSPEED (Mechanical destruction risk)
        if (speedPct >= this.OVERSPEED_TRIP_PCT) {
            return {
                tripActive: true,
                tripReason: `OVERSPEED DETECTED (${speedPct.toFixed(1)}%)`,
                actionRequired: 'TRIP'
            };
        }

        // 3. REVERSE POWER (Generator motoring, heats up blades/cavitation)
        // Usually allowed for pump-storage, but this is standard generation logic
        if (activePowerMW < this.REVERSE_POWER_TRIP_MW) {
            return {
                tripActive: true,
                tripReason: `REVERSE POWER (${activePowerMW.toFixed(1)} MW)`,
                actionRequired: 'TRIP'
            };
        }

        // 4. HIGH VIBRATION (Bearing seizure risk)
        if (vibrationTotal > 8.0) { // ISO standard trip usually ~7-10 mm/s
            return {
                tripActive: true,
                tripReason: `HIGH VIBRATION TRIP (${vibrationTotal.toFixed(1)} mm/s)`,
                actionRequired: 'TRIP'
            };
        }

        if (context?.family === 'PELTON') {
            // Water hammer risk estimation using closing time (Joukowsky qualitative)
            // S = deltaQ / closingTime; thresholds tuned conservatively
            const rate = Math.abs(context?.telemetry?.jetRateChange ?? 0);
            const peltonCfg = useProjectConfigStore.getState().getConfig('PELTON');
            const closing = peltonCfg?.pelton?.nozzleClosingTimeSec ?? 0.6;
            const surgeIndicator = closing > 0 ? rate / closing : rate;
            if (surgeIndicator > 20.0) {
                return {
                    tripActive: true,
                    tripReason: `PELTON WATER HAMMER RISK (ΔQ/Δt=${surgeIndicator.toFixed(2)} m³/s²)`,
                    actionRequired: 'TRIP'
                };
            }
            if (surgeIndicator > 8.0) {
                return {
                    tripActive: false,
                    tripReason: `PELTON NOZZLE SEQUENCING BLOCK (ΔQ/Δt=${surgeIndicator.toFixed(2)} m³/s²)`,
                    actionRequired: 'BLOCK_START'
                };
            }
        }

        if (context?.family === 'KAPLAN') {
            const gate = context?.telemetry?.wicketGatePct ?? 0;
            const blade = context?.telemetry?.bladeAngleDeg ?? 0;
            const deviation = Math.abs(context?.telemetry?.offCamDeviationDeg ?? (blade - (gate * 0.5)));
            // Design constraint violation (head too high for Kaplan)
            const kcfg = useProjectConfigStore.getState().getConfig('KAPLAN');
            if ((kcfg?.ratedHeadHn ?? 0) > 1000) {
                return {
                    tripActive: true,
                    tripReason: 'DESIGN CONSTRAINT VIOLATION: Kaplan head out of bounds',
                    actionRequired: 'TRIP'
                };
            }
            if (deviation > 5.0) {
                return {
                    tripActive: true,
                    tripReason: `KAPLAN OFF-CAM (${deviation.toFixed(1)}°)`,
                    actionRequired: 'TRIP'
                };
            }
            if (deviation > 2.0) {
                return {
                    tripActive: false,
                    tripReason: `KAPLAN OFF-CAM WARNING (${deviation.toFixed(1)}°)`,
                    actionRequired: 'BLOCK_START'
                };
            }
        }

        if (context?.family === 'FRANCIS') {
            const amp = context?.telemetry?.draftTubeVortexAmplitude ?? 0;
            const freq = context?.telemetry?.vortexFrequencyHz ?? 0;
            if (amp > 0.35 && freq >= 2 && freq <= 4) {
                return {
                    tripActive: true,
                    tripReason: `FRANCIS VORTEX ROPE (${amp.toFixed(2)} amplitude @ ${freq.toFixed(1)} Hz)`,
                    actionRequired: 'TRIP'
                };
            }
            if (amp > 0.2 && freq >= 2 && freq <= 4) {
                return {
                    tripActive: false,
                    tripReason: `FRANCIS VORTEX WARNING (${amp.toFixed(2)} amplitude)`,
                    actionRequired: 'BLOCK_START'
                };
            }
        }

        return {
            tripActive: false,
            tripReason: null,
            actionRequired: 'NONE'
        };
    }

    /**
     * CHECK DEAD MAN SWITCH (Watchdog Timer)
     * Ensures SCADA data is fresh. If latency exceeds threshold, assume communication loss.
     */
    public static checkDeadManSwitch(
        commStatus: 'GOOD' | 'BAD' | 'UNKNOWN',
        lastHeartbeat: number
    ): DeadManStatus {
        const now = Date.now();
        const latency = now - lastHeartbeat;

        if (commStatus !== 'GOOD') {
            return {
                safe: false,
                action: 'SCADA_LINK_FAILURE',
                latency
            };
        }

        if (latency > this.MAX_LATENCY_MS) {
            return {
                safe: false,
                action: `HEARTBEAT_TIMEOUT (+${latency}ms)`,
                latency
            };
        }

        return {
            safe: true,
            latency
        };
    }

    /**
     * Get overall safety status
     */
    public static getStatus(): {
        protectionsActive: number;
        lastCheck: number;
        status: 'LOCKED' | 'UNLOCKED' | 'TRIPPED';
    } {
        return {
            protectionsActive: 4, // Number of active protection checks
            lastCheck: Date.now(),
            status: 'LOCKED' // Default safe state
        };
    }
}
