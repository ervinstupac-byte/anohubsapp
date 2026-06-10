/**
 * EconomicLeakTracker.ts
 * 
 * Tracks "leaking value" from known inefficiencies
 * and measures software compensation recovery
 */

export interface ValueLeak {
    assetId: string;
    assetName: string;
    source: string; // e.g., "Servo backlash", "Nozzle wear"
    baselineLoss: number; // €/year at 0% compensation
    currentCompensation: number; // % recovered (0-100)
    recoveredValue: number; // €/year recovered through SW
    remainingLeak: number; // €/year still leaking
    compensationType: 'SOFTWARE' | 'SCHEDULED_MAINTENANCE' | 'NONE';
}

export class EconomicLeakTracker {
    private static leaks: ValueLeak[] = [];

    /**
     * Register a known value leak
     */
    public static registerLeak(leak: Omit<ValueLeak, 'recoveredValue' | 'remainingLeak'>): void {
        const recoveredValue = leak.baselineLoss * (leak.currentCompensation / 100);
        const remainingLeak = leak.baselineLoss - recoveredValue;

        this.leaks.push({
            ...leak,
            recoveredValue,
            remainingLeak
        });

        console.log(`[ValueLeak] Registered: ${leak.assetId} - ${leak.source}`);
        console.log(`  Baseline Loss: €${leak.baselineLoss.toLocaleString()}/year`);
        console.log(`  Compensation: ${leak.currentCompensation.toFixed(1)}%`);
        console.log(`  Recovered: €${recoveredValue.toLocaleString()}/year`);
        console.log(`  Still Leaking: €${remainingLeak.toLocaleString()}/year`);
    }

    /**
     * Update compensation percentage (as software improves)
     */
    public static updateCompensation(assetId: string, newCompensation: number): void {
        const leak = this.leaks.find(l => l.assetId === assetId);
        if (!leak) return;

        const oldRecovered = leak.recoveredValue;
        leak.currentCompensation = newCompensation;
        leak.recoveredValue = leak.baselineLoss * (newCompensation / 100);
        leak.remainingLeak = leak.baselineLoss - leak.recoveredValue;

        const improvement = leak.recoveredValue - oldRecovered;
        console.log(`[ValueLeak] ${assetId} compensation updated: ${newCompensation.toFixed(1)}%`);
        console.log(`  Additional recovery: €${improvement.toLocaleString()}/year`);
    }

    /**
     * Get total fleet value leak summary
     */
    public static getFleetLeakSummary(): {
        totalBaselineLoss: number;
        totalRecovered: number;
        totalLeaking: number;
        compensationRate: number;
        leaks: ValueLeak[];
    } {
        const totalBaselineLoss = this.leaks.reduce((sum, l) => sum + l.baselineLoss, 0);
        const totalRecovered = this.leaks.reduce((sum, l) => sum + l.recoveredValue, 0);
        const totalLeaking = this.leaks.reduce((sum, l) => sum + l.remainingLeak, 0);
        const compensationRate = totalBaselineLoss > 0 ? (totalRecovered / totalBaselineLoss) * 100 : 0;

        return {
            totalBaselineLoss,
            totalRecovered,
            totalLeaking,
            compensationRate,
            leaks: [...this.leaks]
        };
    }

    /**
     * Get leak details for specific asset
     */
    public static getAssetLeaks(assetId: string): ValueLeak[] {
        return this.leaks.filter(l => l.assetId === assetId);
    }

    /**
     * Calculate ROI of software compensation
     */
    public static calculateCompensationROI(): {
        annualRecovery: number;
        softwareCost: number; // Estimated development/maintenance
        roi: number; // Multiple
    } {
        const annualRecovery = this.leaks.reduce((sum, l) => sum + l.recoveredValue, 0);
        const softwareCost = 50000; // Estimated annual cost of AI system
        const roi = softwareCost > 0 ? annualRecovery / softwareCost : 0;

        return {
            annualRecovery,
            softwareCost,
            roi
        };
    }
}

// Initialize with known leaks
EconomicLeakTracker.registerLeak({
    assetId: 'UNIT-3',
    assetName: 'HE Peruća - Kaplan 1',
    source: 'Servo backlash (2.1°)',
    baselineLoss: 280000, // €280k/year
    currentCompensation: 0, // Will be updated as compensation improves
    compensationType: 'SOFTWARE'
});

EconomicLeakTracker.registerLeak({
    assetId: 'UNIT-5',
    assetName: 'HE Senj - Pelton 1',
    source: 'Nozzle #3 water hammer preventive slowdown',
    baselineLoss: 35000, // €35k/year in reduced throughput
    currentCompensation: 80, // 80% mitigated via auto needle speed control
    compensationType: 'SOFTWARE'
});

EconomicLeakTracker.registerLeak({
    assetId: 'UNIT-6',
    assetName: 'HE Lešće - Banki-Michell 1',
    source: 'No specialized model (generic monitoring)',
    baselineLoss: 95000, // €95k/year estimated from 3% efficiency gap
    currentCompensation: 0, // No compensation yet
    compensationType: 'NONE'
});
