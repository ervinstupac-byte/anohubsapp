import { ErosionStatus } from './SandErosionTracker';
import { CorrosionAlert } from './GalvanicCorrosionService';

/**
 * EROSION-CORROSION SYNERGY
 * The Chemical-Mechanical Fusion 🧪⚙️
 * 
 * Logic:
 * Mechanical Erosion strips the protective oxide layer (Passivation).
 * Clean metal corrodes 10x-100x faster than passivated metal.
 * 
 * Synergy Index = (ErosionRate * ChemistryFactor)
 */

export interface SynergyStatus {
    timestamp: Date;
    synergyFactor: number; // Multiplier (1.0 = No Synergy)
    oxideLayerState: 'INTACT' | 'DAMAGED' | 'STRIPPED';
    effectiveCorrosionRate: number; // mm/year
    alert?: string;
}

export class ErosionCorrosionSynergy {

    /**
     * CALCULATE SYNERGY
     * Merges the Physical World (Sand) with the Chemical World (pH).
     */
    static calculateSynergy(
        erosion: ErosionStatus,
        phLevel: number,
        baseCorrosionRateMmYr: number // From GalvanicService or Assumed Base
    ): SynergyStatus {
        const timestamp = new Date();
        let synergyFactor = 1.0;
        let oxideLayerState: SynergyStatus['oxideLayerState'] = 'INTACT';

        // 1. DETERMINE OXIDE LAYER HEALTH
        // High erosion rates prevent the oxide layer from reforming.
        // Threshold: > 500 microns/year (0.5mm/year) implies constant scrubbing.
        if (erosion.bucketThinningRate > 2000) {
            oxideLayerState = 'STRIPPED';
        } else if (erosion.bucketThinningRate > 500) {
            oxideLayerState = 'DAMAGED';
        }

        // 2. APPLY CHEMISTRY MULTIPLIERS
        // Acidic water attacks bare metal aggressively.
        if (oxideLayerState === 'STRIPPED') {
            synergyFactor = 5.0; // Base penalty for bare metal

            if (phLevel < 6.5) synergyFactor += 5.0; // Mild Acid + Bare Metal = 10x
            if (phLevel < 5.5) synergyFactor += 15.0; // Strong Acid + Bare Metal = 20x!!
        } else if (oxideLayerState === 'DAMAGED') {
            synergyFactor = 2.0;
            if (phLevel < 6.5) synergyFactor += 2.0;
        }

        // 3. CALCULATE EFFECTIVE RATE
        const effectiveCorrosionRate = baseCorrosionRateMmYr * synergyFactor;

        // 4. GENERATE ALERT
        let alert: string | undefined;
        if (synergyFactor > 5.0) {
            alert = `🚨 SYNERGY CRITICAL: Sand is stripping the skin, Acid is eating the flesh! Factor: ${synergyFactor.toFixed(1)}x. Rate: ${effectiveCorrosionRate.toFixed(2)}mm/yr.`;
        } else if (synergyFactor > 1.5) {
            alert = `⚠️ SYNERGY WARNING: Erosion is accelerating corrosion. Factor: ${synergyFactor.toFixed(1)}x.`;
        }

        return {
            timestamp,
            synergyFactor,
            oxideLayerState,
            effectiveCorrosionRate,
            alert
        };
    }
    /**
     * CALIBRATE WEIGHTS (Learning Phase)
     * Adjusts the synergy multipliers based on observed river conditions.
     */
    static calibrateWeights(history: { ph: number, ppm: number }[]) {
        if (history.length === 0) return { factorAdjustment: 0, message: 'No data to calibrate.' };

        // Calculate average acidity
        const avgPh = history.reduce((sum, h) => sum + h.ph, 0) / history.length;

        // If river is consistently acidic, we must be more pessimistic
        let adjustment = 0;
        if (avgPh < 6.0) {
            adjustment = 2.0; // Increase base synergy by +2.0
            return {
                factorAdjustment: adjustment,
                message: `ACID DETECTED (Avg pH ${avgPh.toFixed(1)}). Synergy weights increased by +${adjustment}.`
            };
        }

        return { factorAdjustment: 0, message: 'River Chemistry Nominal. Weights maintained.' };
    }
}
