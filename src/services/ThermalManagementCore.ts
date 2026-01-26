/**
 * ThermalManagementCore
 * Consolidates BearingOilCoolingSystem and CoolingSystemGuardian into unified thermal management.
 */
import CoolingSystemGuardian from './CoolingSystemGuardian';
import BaseGuardian from './BaseGuardian';
import { computeBearingOilCooling, BearingOilCoolingInput, BearingOilCoolingResult } from './BearingOilCoolingSystem';

export type { BearingOilCoolingInput, BearingOilCoolingResult };

export class ThermalManagementCore extends BaseGuardian {
    private coolingGuardian: CoolingSystemGuardian;

    constructor() {
        super();
        this.coolingGuardian = new CoolingSystemGuardian();
    }

    analyzeCooling(samples: any[], options?: any) {
        return this.coolingGuardian.analyze(samples as any, options);
    }

    computeBearingCooling(input: BearingOilCoolingInput) {
        return computeBearingOilCooling(input);
    }

    markRotation(now?: number) {
        this.coolingGuardian.markRotation(now);
    }

    // Implement BaseGuardian contract: provide a confidence score
    public getConfidenceScore(samples: any[] = [], vibrationSeries: number[] = []): number {
        // Delegate to internal cooling guardian if possible
        if ((this.coolingGuardian as any).getConfidenceScore) {
            try {
                return (this.coolingGuardian as any).getConfidenceScore(samples, vibrationSeries);
            } catch (e) {
                // fallback to safeCorrelation-based conservative estimate
            }
        }
        // fallback: estimate U series and correlate with vibration
        const Useries = samples.map(s => { try { return (this.coolingGuardian as any).estimateU ? (this.coolingGuardian as any).estimateU(s) : 0; } catch { return 0; } }).filter(v => typeof v === 'number') as number[];
        const vib = vibrationSeries && vibrationSeries.length >= Useries.length ? vibrationSeries.slice(-Useries.length) : (samples.map(s => s.pumpVibration || 0));
        const corr = this.safeCorrelation(Useries, vib as number[]);
        return this.corrToScore(corr);
    }
}

export default new ThermalManagementCore();
