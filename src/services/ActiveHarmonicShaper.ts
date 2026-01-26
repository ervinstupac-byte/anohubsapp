/**
 * ActiveHarmonicShaper.ts
 * 
 * Active Power Quality Control
 * Injects counter-harmonics to minimize magnetic braking and stator heating
 * Real-time grid quality optimization
 */

export interface GridHarmonics {
    timestamp: number;
    thd: number; // Total Harmonic Distortion %
    harmonics: Map<number, number>; // Order -> Magnitude %
    powerFactor: number;
}

export interface CounterHarmonic {
    order: number; // 3rd, 5th, 7th, etc.
    magnitude: number; // % of fundamental
    phase: number; // degrees
}

export interface HarmonicShapingResult {
    timestamp: number;
    thdBefore: number; // %
    thdAfter: number; // %
    improvement: number; // %
    powerLossSavings: number; // kW
    heatingReduction: number; // °C
}

export class ActiveHarmonicShaper {
    private static readonly HARMONIC_ORDERS = [3, 5, 7, 11, 13];
    private static shapingActive: boolean = false;

    public static measureGridQuality(): GridHarmonics {
        // Simulate harmonic measurement (in production: actual power analyzer)
        const harmonics = new Map<number, number>();

        for (const order of this.HARMONIC_ORDERS) {
            const magnitude = (Math.random() * 3) + (order === 5 ? 2 : 1); // 5th typically higher
            harmonics.set(order, magnitude);
        }

        // THD = sqrt(sum of squares of harmonics)
        const sumSquares = Array.from(harmonics.values())
            .reduce((sum, h) => sum + Math.pow(h, 2), 0);
        const thd = Math.sqrt(sumSquares);

        const powerFactor = 0.95 - (thd / 100);

        return {
            timestamp: Date.now(),
            thd,
            harmonics,
            powerFactor
        };
    }

    public static calculateCounterHarmonics(gridQuality: GridHarmonics): CounterHarmonic[] {
        const counterHarmonics: CounterHarmonic[] = [];

        for (const [order, magnitude] of gridQuality.harmonics.entries()) {
            if (magnitude > 1.0) { // Only compensate if > 1%
                counterHarmonics.push({
                    order,
                    magnitude: magnitude * 0.9, // 90% cancellation
                    phase: 180 // Opposite phase
                });
            }
        }

        return counterHarmonics;
    }

    public static injectCounterHarmonics(
        gridQuality: GridHarmonics
    ): HarmonicShapingResult {
        const thdBefore = gridQuality.thd;
        const counterHarmonics = this.calculateCounterHarmonics(gridQuality);

        console.log('[Harmonics] Injecting counter-harmonics:');
        counterHarmonics.forEach(ch => {
            console.log(`  ${ch.order}th: ${ch.magnitude.toFixed(2)}% @ ${ch.phase}°`);
        });

        // Simulate THD reduction
        const thdAfter = thdBefore * 0.4; // 60% reduction
        const improvement = ((thdBefore - thdAfter) / thdBefore) * 100;

        // Power loss savings: I²R losses proportional to THD²
        const powerLossBefore = Math.pow(thdBefore / 100, 2) * 500; // kW
        const powerLossAfter = Math.pow(thdAfter / 100, 2) * 500;
        const powerLossSavings = powerLossBefore - powerLossAfter;

        // Heating reduction in stator
        const heatingReduction = powerLossSavings * 0.15; // °C

        this.shapingActive = true;

        console.log(`[Harmonics] ✅ THD: ${thdBefore.toFixed(1)}% → ${thdAfter.toFixed(1)}%`);
        console.log(`  Power loss savings: ${powerLossSavings.toFixed(1)} kW`);
        console.log(`  Stator cooling: -${heatingReduction.toFixed(1)}°C`);

        return {
            timestamp: Date.now(),
            thdBefore,
            thdAfter,
            improvement,
            powerLossSavings,
            heatingReduction
        };
    }

    public static isActive(): boolean {
        return this.shapingActive;
    }
}
