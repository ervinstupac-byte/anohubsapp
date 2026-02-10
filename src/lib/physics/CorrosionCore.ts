/**
 * CORROSION CORE (NC-12500)
 * Re-grafted from GalvanicCorrosionMonitor.tsx (Vault Artifact)
 * Handles Cathodic Protection Physics & Anode Life
 */

export interface AnodeStatus {
    id: string;
    voltage: number; // mV (CSE Reference)
    consumptionRate: number; // kg/year
    massStart: number; // kg
    massCurrent: number; // kg
}

export interface ProtectionAnalysis {
    level: 'CRITICAL' | 'WARNING' | 'GOOD' | 'EXCELLENT';
    risk: string;
    color: string;
}

export const CorrosionCore = {
    // Standard: -850mV to -1050mV (CSE Reference)
    // Source: NACE SP0169-2013
    evaluateProtectionLevel: (voltageMv: number): ProtectionAnalysis => {
        if (voltageMv > -800) {
            return { 
                level: 'CRITICAL', 
                risk: 'Active Corrosion (Oxidation)', 
                color: '#ef4444' // Red
            };
        }
        if (voltageMv < -1100) {
            return { 
                level: 'WARNING', 
                risk: 'Hydrogen Embrittlement', 
                color: '#f59e0b' // Amber
            };
        }
        if (voltageMv > -850) {
            return { 
                level: 'GOOD', 
                risk: 'Marginal Protection', 
                color: '#84cc16' // Green-500
            };
        }
        return { 
            level: 'EXCELLENT', 
            risk: 'Immune State', 
            color: '#10b981' // Emerald-500
        };
    },

    estimateAnodeLifeYears: (anode: AnodeStatus): number => {
        if (anode.consumptionRate <= 0) return 999;
        return anode.massCurrent / anode.consumptionRate;
    },

    // Faraday's Law Estimation
    calculateMassLoss: (currentAmps: number, hours: number, metal: 'ZINC' | 'ALUMINUM' | 'MAGNESIUM' = 'ZINC'): number => {
        // Electrochemical Equivalents (kg/A-h)
        const K_FACTOR = {
            ZINC: 1.22e-3,
            ALUMINUM: 0.335e-3,
            MAGNESIUM: 0.453e-3
        };
        return (K_FACTOR[metal] || K_FACTOR.ZINC) * currentAmps * hours;
    }
};
