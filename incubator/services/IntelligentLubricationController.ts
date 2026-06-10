/**
 * INTELLIGENT LUBRICATION CONTROLLER
 * Auto-switching, filter monitoring, and cooling analysis
 */

import { AuxiliarySystemTelemetry } from '../models/LargeTurbineAuxiliarySystems';

// ========================================
// EXTENDED TELEMETRY WITH DIFFERENTIAL PRESSURE
// ========================================

export interface ExtendedAuxiliaryTelemetry extends AuxiliarySystemTelemetry {
    // Filter monitoring
    filterInletPressure: number;    // bar (before filter)
    filterOutletPressure: number;   // bar (after filter)

    // Heat exchanger monitoring
    oilInletTemp: number;           // °C (oil going INTO heat exchanger)
    oilOutletTemp: number;          // °C (oil coming OUT of heat exchanger)

    // Additional properties used in demos and controllers
    oilPressure: number;           // bar - oil system pressure
    oilTemperature: number;        // °C - oil temperature
    coolingWaterInletTemp: number; // °C - cooling water inlet temperature
    coolingWaterOutletTemp: number; // °C - cooling water outlet temperature
    mainPumpRunning: boolean;      // Main pump operational status
    oilFlowRate: number;           // L/min - Added for compatibility
    standbyPumpRunning: boolean;   // Standby pump status - Added for compatibility
    oilTankLevel: number;          // %
    coolingWaterFlow: number;      // L/min
}

// ========================================
// PUMP HANDSHAKE - AUTO SWITCHOVER
// ========================================

export class PumpController {
    private standbyPumpActive: boolean = false;
    private lastSwitchTime: Date | null = null;
    private switchCooldownMinutes: number = 5;  // Prevent rapid cycling

    /**
     * THE PUMP HANDSHAKE
     * Monitors oil pressure and automatically activates standby pump
     */
    checkAndSwitchPumps(telemetry: ExtendedAuxiliaryTelemetry): {
        action: 'NONE' | 'START_STANDBY' | 'EMERGENCY_SHUTDOWN';
        message: string;
        standbyPumpShouldRun: boolean;
        alerts: string[];
    } {
        const oilPressure = telemetry.oilPressure;
        const alerts: string[] = [];

        // Check if we're in cooldown period
        if (this.lastSwitchTime) {
            const minutesSinceSwitch = (Date.now() - this.lastSwitchTime.getTime()) / (1000 * 60);
            if (minutesSinceSwitch < this.switchCooldownMinutes) {
                return {
                    action: 'NONE',
                    message: `In cooldown period (${(this.switchCooldownMinutes - minutesSinceSwitch).toFixed(1)} min remaining)`,
                    standbyPumpShouldRun: this.standbyPumpActive,
                    alerts
                };
            }
        }

        // === PRIORITY 1: CRITICAL PRESSURE (Emergency Shutdown) ===
        if (oilPressure < 1.0) {
            return {
                action: 'EMERGENCY_SHUTDOWN',
                message: '🚨 CRITICAL: Oil pressure below 1.0 bar - Both pumps failed! EMERGENCY SHUTDOWN!',
                standbyPumpShouldRun: true,
                alerts: [
                    '🚨 EMERGENCY: Both main and standby pumps appear to have failed',
                    '⚠️ Immediate bearing damage risk',
                    '🔴 Turbine must be stopped NOW'
                ]
            };
        }

        // === PRIORITY 2: AUTO-SWITCH THRESHOLD (Standby Rescue) ===
        if (oilPressure < 1.5 && !this.standbyPumpActive) {
            // Main pump struggling - start standby NOW!
            this.standbyPumpActive = true;
            this.lastSwitchTime = new Date();

            alerts.push('⚠️ Oil pressure dropped to 1.5 bar threshold');
            alerts.push('🔄 Activating standby pump immediately');
            alerts.push('📋 Main pump may be failing - schedule inspection');

            return {
                action: 'START_STANDBY',
                message: '🤝 PUMP HANDSHAKE: Standby pump activated to rescue oil pressure!',
                standbyPumpShouldRun: true,
                alerts
            };
        }

        // === PRIORITY 3: RECOVERY CHECK ===
        if (oilPressure >= 2.2 && this.standbyPumpActive && telemetry.mainPumpRunning) {
            // Pressure restored, both pumps running - can stop standby
            alerts.push('✅ Oil pressure restored to safe level (2.2+ bar)');
            alerts.push('🔄 Standby pump can be stopped (optional)');
            alerts.push('💡 Recommend keeping standby running until main pump is verified');

            return {
                action: 'NONE',
                message: 'Oil pressure restored. Both pumps running - system stable.',
                standbyPumpShouldRun: true,  // Keep running for safety
                alerts
            };
        }

        // === NORMAL OPERATION ===
        return {
            action: 'NONE',
            message: `Oil pressure normal: ${oilPressure.toFixed(2)} bar`,
            standbyPumpShouldRun: this.standbyPumpActive,
            alerts
        };
    }

    /**
     * Manual reset after maintenance
     */
    resetController(): void {
        this.standbyPumpActive = false;
        this.lastSwitchTime = null;
    }
}

// ========================================
// FILTER SNEEZE - DIFFERENTIAL PRESSURE MONITOR
// ========================================

export class FilterMonitor {
    /**
     * THE FILTER SNEEZE
     * Monitors Δp (differential pressure) across filters
     */
    checkFilterCondition(telemetry: ExtendedAuxiliaryTelemetry): {
        status: 'CLEAN' | 'DIRTY' | 'CLOGGED' | 'CRITICAL';
        deltaP: number;
        message: string;
        recommendation: string;
        daysUntilCritical?: number;
    } {
        const deltaP = telemetry.filterInletPressure - telemetry.filterOutletPressure;

        // Thresholds for duplex filter system
        const DIRTY_THRESHOLD = 0.8;      // bar - schedule cleaning
        const CLOGGED_THRESHOLD = 1.5;    // bar - clean immediately
        const CRITICAL_THRESHOLD = 2.0;   // bar - switch to bypass!

        if (deltaP >= CRITICAL_THRESHOLD) {
            return {
                status: 'CRITICAL',
                deltaP,
                message: `🚨 FILTER CRITICAL! Δp = ${deltaP.toFixed(2)} bar - Filter severely clogged!`,
                recommendation: '🔴 IMMEDIATE ACTION: Switch to bypass filter NOW! Replace cartridges TODAY!',
                daysUntilCritical: 0
            };
        }

        if (deltaP >= CLOGGED_THRESHOLD) {
            return {
                status: 'CLOGGED',
                deltaP,
                message: `⚠️ FILTER CLOGGED: Δp = ${deltaP.toFixed(2)} bar - Heavy contamination`,
                recommendation: '🟠 Clean or replace filter cartridges within 48 hours. Oil flow restricted.',
                daysUntilCritical: 2
            };
        }

        if (deltaP >= DIRTY_THRESHOLD) {
            // Estimate days until critical based on rate of increase
            const ratePerDay = 0.15;  // Empirical: ~0.15 bar/day increase when dirty
            const daysUntilCritical = Math.ceil((CRITICAL_THRESHOLD - deltaP) / ratePerDay);

            return {
                status: 'DIRTY',
                deltaP,
                message: `💨 TIME TO SNEEZE! Δp = ${deltaP.toFixed(2)} bar - Filter getting dirty`,
                recommendation: `🟡 Schedule filter cleaning within ${daysUntilCritical} days. Have spare cartridges ready.`,
                daysUntilCritical
            };
        }

        return {
            status: 'CLEAN',
            deltaP,
            message: `✅ Filter clean: Δp = ${deltaP.toFixed(2)} bar`,
            recommendation: 'No action needed. Continue normal operation.'
        };
    }

    /**
     * Predict when filter will need cleaning based on trend
     */
    predictFilterLife(deltaPHistory: number[]): {
        daysRemaining: number;
        trend: 'STABLE' | 'INCREASING' | 'RAPID';
    } {
        if (deltaPHistory.length < 3) {
            return { daysRemaining: 999, trend: 'STABLE' };
        }

        // Calculate rate of increase
        const recent = deltaPHistory.slice(-3);
        const rate = (recent[recent.length - 1] - recent[0]) / recent.length;  // bar/day

        const currentDeltaP = deltaPHistory[deltaPHistory.length - 1];
        const daysToClean = (1.5 - currentDeltaP) / Math.max(rate, 0.01);

        const trend = rate > 0.2 ? 'RAPID' : rate > 0.05 ? 'INCREASING' : 'STABLE';

        return {
            daysRemaining: Math.max(0, Math.ceil(daysToClean)),
            trend
        };
    }
}

// ========================================
// COOLING CHECKUP - HEAT EXCHANGER MONITOR
// ========================================

export class HeatExchangerMonitor {
    /**
     * THE COOLING CHECKUP
     * Monitors heat exchanger effectiveness
     */
    checkCoolingEffectiveness(telemetry: ExtendedAuxiliaryTelemetry): {
        effectiveness: number;      // % (0-100)
        status: 'EXCELLENT' | 'GOOD' | 'POOR' | 'FAILED';
        oilTempDrop: number;       // °C
        message: string;
        possibleCauses?: string[];
    } {
        // Oil side temperature drop
        const oilInlet = telemetry.oilInletTemp;
        const oilOutlet = telemetry.oilOutletTemp;
        const oilTempDrop = oilInlet - oilOutlet;

        // Cooling water side temperature rise
        const waterInlet = telemetry.coolingWaterInletTemp;
        const waterOutlet = telemetry.coolingWaterOutletTemp;
        const waterTempRise = waterOutlet - waterInlet;
        void waterTempRise;

        // Expected temperature drop for healthy heat exchanger
        const expectedOilDrop = 15;  // °C - should cool oil by ~15°C

        // Effectiveness = actual / expected * 100
        const effectiveness = Math.min(100, (oilTempDrop / expectedOilDrop) * 100);

        if (effectiveness < 40) {
            // Heat exchanger severely compromised
            return {
                effectiveness,
                status: 'FAILED',
                oilTempDrop,
                message: `🚨 HEAT EXCHANGER FAILED! Only ${oilTempDrop.toFixed(1)}°C cooling (expected ${expectedOilDrop}°C)`,
                possibleCauses: [
                    '🐟 Cooling water side clogged (fish, leaves, debris)',
                    '🦠 Bio-fouling or algae growth in tubes',
                    '💧 Cooling water pump failure',
                    '❄️ Frozen/blocked cooling water lines',
                    '🔧 Heat exchanger plates corroded/damaged'
                ]
            };
        }

        if (effectiveness < 60) {
            return {
                effectiveness,
                status: 'POOR',
                oilTempDrop,
                message: `⚠️ POOR COOLING: Only ${oilTempDrop.toFixed(1)}°C drop (expected ${expectedOilDrop}°C)`,
                possibleCauses: [
                    '🌊 Low cooling water flow',
                    '🧊 Partial blockage in heat exchanger',
                    '🔧 Scaling on heat transfer surfaces'
                ]
            };
        }

        if (effectiveness < 80) {
            return {
                effectiveness,
                status: 'GOOD',
                oilTempDrop,
                message: `✓ Cooling acceptable: ${oilTempDrop.toFixed(1)}°C drop (${effectiveness.toFixed(0)}% effective)`,
                possibleCauses: []
            };
        }

        return {
            effectiveness,
            status: 'EXCELLENT',
            oilTempDrop,
            message: `✅ Excellent cooling: ${oilTempDrop.toFixed(1)}°C drop (${effectiveness.toFixed(0)}% effective)`,
            possibleCauses: []
        };
    }

    /**
     * Check if cooling water temperature is appropriate
     */
    checkCoolingWaterTemperature(telemetry: ExtendedAuxiliaryTelemetry): {
        status: 'OK' | 'TOO_HOT' | 'TOO_COLD';
        message: string;
    } {
        const inletTemp = telemetry.coolingWaterInletTemp;

        if (inletTemp > 30) {
            return {
                status: 'TOO_HOT',
                message: `⚠️ Cooling water too warm (${inletTemp}°C). Limited cooling capacity.`
            };
        }

        if (inletTemp < 5) {
            return {
                status: 'TOO_COLD',
                message: `❄️ Cooling water very cold (${inletTemp}°C). Risk of condensation.`
            };
        }

        return {
            status: 'OK',
            message: `✅ Cooling water temperature optimal: ${inletTemp}°C`
        };
    }
}

// ========================================
// ENHANCED BEARING PASSPORT
// ========================================

export interface EnhancedBearingPassport {
    // All previous passport fields...

    // NEW: Thirst Level (Oil Requirements)
    thirstLevel: {
        minimumFlowRate: number;    // L/min - minimum to prevent damage
        optimalFlowRate: number;    // L/min - best performance
        maximumFlowRate: number;    // L/min - don't exceed (cavitation risk)
        description: string;
    };

    // NEW: Fever Limit (Temperature Thresholds)
    feverLimit: {
        normalOperating: number;    // °C - typical running temp
        warningThreshold: number;   // °C - start monitoring closely
        alarmThreshold: number;     // °C - reduce load
        tripThreshold: number;      // °C - emergency shutdown
        description: string;
    };
}

export const BIG_THRUST_BEARING_ENHANCED_PASSPORT: EnhancedBearingPassport = {
    // NEW FIELDS
    thirstLevel: {
        minimumFlowRate: 15,        // L/min - below this = friction damage
        optimalFlowRate: 20,         // L/min - sweet spot
        maximumFlowRate: 30,         // L/min - above this = turbulence
        description: 'This bearing drinks oil like a thirsty elephant! Needs at least 15 L/min to stay happy. Give it 20 L/min for best performance.'
    },

    feverLimit: {
        normalOperating: 55,         // °C - healthy running temp
        warningThreshold: 70,        // °C - getting warm
        alarmThreshold: 80,          // °C - too hot!
        tripThreshold: 85,           // °C - STOP NOW!
        description: 'This bearing has a fever at 70°C! If it reaches 85°C, it will have a meltdown. Keep it below 55°C for long life.'
    }
};
