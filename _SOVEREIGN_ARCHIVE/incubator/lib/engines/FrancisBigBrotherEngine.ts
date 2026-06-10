/**
 * FRANCIS BIG BROTHER ENGINE
 * Enhanced engine for large turbines (>5MW) with auxiliary system monitoring
 */

import { BaseTurbineEngine, TelemetryStream } from './BaseTurbineEngine';
import { AuxiliarySystemTelemetry } from '../../models/LargeTurbineAuxiliarySystems';

/**
 * Extended telemetry stream including auxiliary systems
 */
export interface ExtendedTelemetryStream extends TelemetryStream {
    auxiliary: AuxiliarySystemTelemetry;
}

/**
 * Francis Big Brother - Large horizontal Francis turbine (5-50 MW)
 * 
 * Key differences from small version:
 * - Forced lubrication system (not grease)
 * - Cooling water system
 * - Oil pressure monitoring (CRITICAL)
 * - Higher rated parameters
 */
export class FrancisBigBrotherEngine extends BaseTurbineEngine {
    readonly turbineType = 'francis';
    readonly variant = 'horizontal_large';

    // Design parameters for large horizontal Francis
    private readonly RATED_HEAD_M = 120;          // Higher head capability
    private readonly RATED_FLOW_M3S = 45;         // Much higher flow
    private readonly RATED_RPM = 500;             // Slightly slower (12-pole, 50Hz)
    private readonly RATED_POWER_MW = 12;         // 12 MW machine
    private readonly BEST_EFFICIENCY_POINT = 0.93; // Slightly better than small

    // ========================================
    // THE 5 UNIVERSAL WHISPERS
    // ========================================

    getRPM(telemetry: TelemetryStream | ExtendedTelemetryStream): number {
        return telemetry.mechanical.rpm;
    }

    getPowerOutput(telemetry: TelemetryStream | ExtendedTelemetryStream): number {
        const rho = 1000;
        const g = 9.81;
        const Q = telemetry.hydraulic.flow;
        const H = telemetry.hydraulic.head;
        const eta = this.getEfficiency(telemetry) / 100;

        const powerW = rho * g * Q * H * eta;
        return powerW / 1000; // kW
    }

    getEfficiency(telemetry: TelemetryStream | ExtendedTelemetryStream): number {
        const currentFlow = telemetry.hydraulic.flow;
        const currentHead = telemetry.hydraulic.head;

        const flowRatio = currentFlow / this.RATED_FLOW_M3S;
        const headRatio = currentHead / this.RATED_HEAD_M;

        const flowDeviation = Math.abs(flowRatio - 0.92); // Large machines peak slightly higher
        const headDeviation = Math.abs(headRatio - 1.0);

        const flowPenalty = Math.pow(flowDeviation, 2) * 0.12;
        const headPenalty = Math.pow(headDeviation, 2) * 0.06;

        let efficiency = this.BEST_EFFICIENCY_POINT - flowPenalty - headPenalty;

        if (flowRatio < 0.4) {
            efficiency *= 0.88; // Less steep drop than small machine
        }

        // Check auxiliary systems - they affect efficiency!
        if (this.isExtendedTelemetry(telemetry)) {
            // Low oil pressure = increased friction
            if (telemetry.auxiliary.oilPressure < 1.8) {
                efficiency -= 0.02; // 2% penalty
            }

            // Hot bearings = loss of efficiency
            if (telemetry.auxiliary.coolingWaterOutletTemp > 50) {
                efficiency -= 0.01; // 1% penalty
            }
        }

        return Math.max(0, Math.min(100, efficiency * 100));
    }

    getVibration(telemetry: TelemetryStream | ExtendedTelemetryStream): number {
        const vx = telemetry.mechanical.vibrationX || 0;
        const vy = telemetry.mechanical.vibrationY || 0;
        return Math.sqrt(vx * vx + vy * vy);
    }

    getTemperature(telemetry: TelemetryStream | ExtendedTelemetryStream): number {
        return telemetry.mechanical.bearingTemp || 45;
    }

    protected getExpectedRPM(): number {
        return this.RATED_RPM;
    }

    // ========================================
    // NEW WHISPERS FOR BIG BROTHER
    // ========================================

    /**
     * 6th WHISPER: Oil Pressure (CRITICAL!)
     */
    getOilPressure(telemetry: ExtendedTelemetryStream): number {
        return telemetry.auxiliary.oilPressure;
    }

    /**
     * 7th WHISPER: Cooling Flow
     */
    getCoolingFlow(telemetry: ExtendedTelemetryStream): number {
        return telemetry.auxiliary.coolingWaterFlow;
    }

    /**
     * Get all whispers including auxiliary
     */
    getAllWhispers(telemetry: ExtendedTelemetryStream): {
        universal: any;
        auxiliary: {
            oilPressure: number;
            oilTemperature: number;
            oilFlow: number;
            coolingFlow: number;
            coolingDeltaT: number;
        };
    } {
        return {
            universal: this.getUniversalMetrics(telemetry),
            auxiliary: {
                oilPressure: telemetry.auxiliary.oilPressure,
                oilTemperature: telemetry.auxiliary.oilTemperature,
                oilFlow: telemetry.auxiliary.oilFlowRate,
                coolingFlow: telemetry.auxiliary.coolingWaterFlow,
                coolingDeltaT: telemetry.auxiliary.coolingWaterOutletTemp -
                    telemetry.auxiliary.coolingWaterInletTemp
            }
        };
    }

    // ========================================
    // SPECIALIZED METRICS
    // ========================================

    getSpecializedMetrics(telemetry: TelemetryStream | ExtendedTelemetryStream): Record<string, number> {
        const base: Record<string, number> = {
            specificSpeed: this.calculateSpecificSpeed(telemetry),
            runnerWearEstimate: this.estimateRunnerWear(telemetry)
        };

        if (this.isExtendedTelemetry(telemetry)) {
            base.oilPressure = telemetry.auxiliary.oilPressure;
            base.oilTemperature = telemetry.auxiliary.oilTemperature;
            base.coolingEfficiency = this.calculateCoolingEfficiency(telemetry);
            base.lubricationHealth = this.assessLubricationHealth(telemetry);
        }

        return base;
    }

    /**
     * Calculate cooling system efficiency
     */
    private calculateCoolingEfficiency(telemetry: ExtendedTelemetryStream): number {
        const deltaT = telemetry.auxiliary.coolingWaterOutletTemp -
            telemetry.auxiliary.coolingWaterInletTemp;
        const flow = telemetry.auxiliary.coolingWaterFlow;

        // Heat removed = flow * density * specific_heat * deltaT
        const heatRemoved = (flow / 60) * 1000 * 4.186 * deltaT; // kW

        // Expected heat generation from bearings and friction
        const powerKW = this.getPowerOutput(telemetry);
        const expectedHeat = powerKW * 0.02; // ~2% of power goes to heat

        // Efficiency = actual / expected
        return Math.min(100, (heatRemoved / expectedHeat) * 100);
    }

    /**
     * Assess lubrication system health
     */
    private assessLubricationHealth(telemetry: ExtendedTelemetryStream): number {
        let score = 100;

        const aux = telemetry.auxiliary;

        // Oil pressure check
        if (aux.oilPressure < 1.5) score -= 40;
        else if (aux.oilPressure < 2.0) score -= 20;

        // Oil temperature check
        if (aux.oilTemperature > 65) score -= 20;
        else if (aux.oilTemperature > 55) score -= 10;

        // Oil flow check
        if (aux.oilFlowRate < 100) score -= 15;

        // Oil level check
        if (aux.oilTankLevel < 40) score -= 25;
        else if (aux.oilTankLevel < 50) score -= 10;

        return Math.max(0, score);
    }

    private calculateSpecificSpeed(telemetry: TelemetryStream): number {
        const n = telemetry.mechanical.rpm;
        const Q = telemetry.hydraulic.flow;
        const H = telemetry.hydraulic.head;

        if (H === 0) return 0;
        return (n * Math.sqrt(Q)) / Math.pow(H, 0.75);
    }

    private estimateRunnerWear(telemetry: TelemetryStream): number {
        const efficiency = this.getEfficiency(telemetry);
        const vibration = this.getVibration(telemetry);

        const efficiencyFactor = Math.max(0, (93 - efficiency) / 93);
        const vibrationFactor = Math.min(1, vibration / 7.1);

        return Math.min(100, (efficiencyFactor * 0.6 + vibrationFactor * 0.4) * 100);
    }

    /**
     * Type guard to check if telemetry includes auxiliary data
     */
    private isExtendedTelemetry(telemetry: TelemetryStream | ExtendedTelemetryStream): telemetry is ExtendedTelemetryStream {
        return 'auxiliary' in telemetry;
    }

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
