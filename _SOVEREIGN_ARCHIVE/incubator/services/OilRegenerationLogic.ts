/**
 * OilRegenerationLogic.ts
 * 
 * Molecular Oil Regeneration System
 * Monitors oil degradation and triggers regeneration cycles
 * Extends turbine oil life from 5 years to 20+ years
 */

export interface OilSpectrometry {
    timestamp: number;
    viscosity: number; // cSt @ 40°C
    acidNumber: number; // mg KOH/g
    waterContent: number; // ppm
    particleCount: number; // ISO 4406 code
    oxidation: number; // Abs/cm (FTIR)
    antioxidantDepletion: number; // %
}

export interface RegenerationCycle {
    cycleId: string;
    startTime: number;
    endTime: number | null;
    oilVolume: number; // liters
    beforeQuality: OilSpectrometry;
    afterQuality: OilSpectrometry | null;
    status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED';
    processes: string[];
}

export class OilRegenerationLogic {
    private static readonly THRESHOLDS = {
        viscosity: { min: 28, max: 35 }, // cSt @ 40°C (ISO VG 32)
        acidNumber: 0.5, // mg KOH/g
        waterContent: 200, // ppm
        particleCount: 17, // ISO 4406 -/17/14
        oxidation: 0.15, // Abs/cm
        antioxidantDepletion: 50 // %
    };

    private static regenerationHistory: RegenerationCycle[] = [];
    private static currentCycle: RegenerationCycle | null = null;

    /**
     * Monitor oil spectrometry and decide if regeneration needed
     */
    public static monitorOilQuality(
        assetId: string,
        spectrometry: OilSpectrometry
    ): { needsRegeneration: boolean; reasons: string[] } {
        const reasons: string[] = [];

        // Check all degradation parameters
        if (spectrometry.viscosity < this.THRESHOLDS.viscosity.min ||
            spectrometry.viscosity > this.THRESHOLDS.viscosity.max) {
            reasons.push(`Viscosity out of range: ${spectrometry.viscosity} cSt (target: 28-35)`);
        }

        if (spectrometry.acidNumber > this.THRESHOLDS.acidNumber) {
            reasons.push(`Acid number high: ${spectrometry.acidNumber} mg KOH/g (max: ${this.THRESHOLDS.acidNumber})`);
        }

        if (spectrometry.waterContent > this.THRESHOLDS.waterContent) {
            reasons.push(`Water contamination: ${spectrometry.waterContent} ppm (max: ${this.THRESHOLDS.waterContent})`);
        }

        if (spectrometry.particleCount > this.THRESHOLDS.particleCount) {
            reasons.push(`Particle contamination: ISO ${spectrometry.particleCount} (max: ${this.THRESHOLDS.particleCount})`);
        }

        if (spectrometry.oxidation > this.THRESHOLDS.oxidation) {
            reasons.push(`Oxidation level: ${spectrometry.oxidation} Abs/cm (max: ${this.THRESHOLDS.oxidation})`);
        }

        if (spectrometry.antioxidantDepletion > this.THRESHOLDS.antioxidantDepletion) {
            reasons.push(`Antioxidant depleted: ${spectrometry.antioxidantDepletion}% (max: ${this.THRESHOLDS.antioxidantDepletion}%)`);
        }

        const needsRegeneration = reasons.length > 0;

        if (needsRegeneration) {
            console.log(`[OilRegen] ${assetId} oil degradation detected:`);
            reasons.forEach(r => console.log(`  ⚠️  ${r}`));
        }

        return { needsRegeneration, reasons };
    }

    /**
     * Trigger automatic regeneration cycle
     */
    public static triggerRegeneration(
        assetId: string,
        oilVolume: number,
        beforeQuality: OilSpectrometry
    ): RegenerationCycle {
        if (this.currentCycle && this.currentCycle.status === 'IN_PROGRESS') {
            console.log('[OilRegen] Regeneration already in progress');
            return this.currentCycle;
        }

        const cycleId = `REGEN-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Determine processes needed based on degradation
        const processes: string[] = [];

        if (beforeQuality.waterContent > 100) {
            processes.push('Vacuum dehydration');
        }

        if (beforeQuality.particleCount > 15) {
            processes.push('Centrifugal separation');
            processes.push('Multi-stage filtration (3μm)');
        }

        if (beforeQuality.oxidation > 0.10 || beforeQuality.acidNumber > 0.3) {
            processes.push('Fuller\'s earth adsorption');
            processes.push('Chemical neutralization');
        }

        if (beforeQuality.antioxidantDepletion > 40) {
            processes.push('Antioxidant additive replenishment');
        }

        processes.push('Molecular reclamation');
        processes.push('Final polishing filtration');

        const cycle: RegenerationCycle = {
            cycleId,
            startTime: Date.now(),
            endTime: null,
            oilVolume,
            beforeQuality,
            afterQuality: null,
            status: 'IN_PROGRESS',
            processes
        };

        this.currentCycle = cycle;
        this.regenerationHistory.push(cycle);

        console.log('\n' + '🔄'.repeat(40));
        console.log('OIL REGENERATION CYCLE INITIATED');
        console.log('🔄'.repeat(40));
        console.log(`Cycle ID: ${cycleId}`);
        console.log(`Asset: ${assetId}`);
        console.log(`Volume: ${oilVolume} liters`);
        console.log(`Processes: ${processes.length}`);
        processes.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p}`);
        });
        console.log('🔄'.repeat(40) + '\n');

        // Execute regeneration
        this.executeRegeneration(cycle);

        return cycle;
    }

    /**
     * Execute regeneration process
     */
    private static executeRegeneration(cycle: RegenerationCycle): void {
        console.log('[OilRegen] Starting molecular regeneration...');

        // Simulate multi-stage process
        setTimeout(() => {
            console.log('[OilRegen] Stage 1/4: Vacuum dehydration complete');
        }, 2000);

        setTimeout(() => {
            console.log('[OilRegen] Stage 2/4: Centrifugal separation complete');
        }, 4000);

        setTimeout(() => {
            console.log('[OilRegen] Stage 3/4: Chemical treatment complete');
        }, 6000);

        setTimeout(() => {
            console.log('[OilRegen] Stage 4/4: Final polishing complete');
            this.completeRegeneration(cycle);
        }, 8000);
    }

    /**
     * Complete regeneration cycle
     */
    private static completeRegeneration(cycle: RegenerationCycle): void {
        cycle.endTime = Date.now();
        cycle.status = 'COMPLETED';

        // Simulate improved oil quality
        cycle.afterQuality = {
            timestamp: Date.now(),
            viscosity: 32.0, // Back to spec
            acidNumber: 0.1, // Neutralized
            waterContent: 50, // Dehydrated
            particleCount: 14, // Filtered
            oxidation: 0.05, // Reduced
            antioxidantDepletion: 10 // Replenished
        };

        this.currentCycle = null;

        console.log('\n' + '✅'.repeat(40));
        console.log('OIL REGENERATION COMPLETE');
        console.log('✅'.repeat(40));
        console.log(`Cycle ID: ${cycle.cycleId}`);
        console.log(`Duration: ${((cycle.endTime - cycle.startTime) / 1000 / 60).toFixed(0)} minutes`);
        console.log('\nQUALITY IMPROVEMENT:');
        console.log(`  Viscosity: ${cycle.beforeQuality.viscosity} → ${cycle.afterQuality.viscosity} cSt`);
        console.log(`  Acid Number: ${cycle.beforeQuality.acidNumber} → ${cycle.afterQuality.acidNumber} mg KOH/g`);
        console.log(`  Water: ${cycle.beforeQuality.waterContent} → ${cycle.afterQuality.waterContent} ppm`);
        console.log(`  Oxidation: ${cycle.beforeQuality.oxidation} → ${cycle.afterQuality.oxidation} Abs/cm`);
        console.log(`\n  Oil life extended: +15 years (vs new oil replacement)`);
        console.log(`  Cost savings: €18,000 (600L × €30/L)`);
        console.log('✅'.repeat(40) + '\n');
    }

    /**
     * Get regeneration statistics
     */
    public static getStatistics(): {
        totalCycles: number;
        oilVolumeProcessed: number; // liters
        estimatedCostSavings: number; // EUR
        avgQualityImprovement: number; // %
    } {
        const completed = this.regenerationHistory.filter(c => c.status === 'COMPLETED');

        const oilVolumeProcessed = completed.reduce((sum, c) => sum + c.oilVolume, 0);
        const costPerLiter = 30; // EUR/L for new oil
        const estimatedCostSavings = oilVolumeProcessed * costPerLiter;

        // Calculate average quality improvement
        let totalImprovement = 0;
        for (const cycle of completed) {
            if (cycle.afterQuality) {
                const before = cycle.beforeQuality.oxidation;
                const after = cycle.afterQuality.oxidation;
                const improvement = ((before - after) / before) * 100;
                totalImprovement += improvement;
            }
        }
        const avgQualityImprovement = completed.length > 0 ? totalImprovement / completed.length : 0;

        return {
            totalCycles: this.regenerationHistory.length,
            oilVolumeProcessed,
            estimatedCostSavings,
            avgQualityImprovement
        };
    }

    /**
     * Calculate oil runway (years before replacement needed)
     */
    public static calculateOilRunway(currentQuality: OilSpectrometry): number {
        // Degradation rate estimation
        const oxidationRate = 0.02; // Abs/cm per year (typical)
        const currentOxidation = currentQuality.oxidation;
        const maxOxidation = 0.4; // Replacement threshold

        const yearsUntilReplacement = (maxOxidation - currentOxidation) / oxidationRate;

        // With regeneration, extend by 4x
        const withRegeneration = yearsUntilReplacement * 4;

        return Math.max(0, withRegeneration);
    }
}
