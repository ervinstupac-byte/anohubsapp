/**
 * ABSOLUTE ZERO
 * The Century Protocol ⏳
 * Simulates the machine's survival and wealth generation over 100 years.
 */

export interface CenturyStats {
    currentYear: number;
    totalRevenueEur: number;
    autonomousRebuilds: number;
    survivingAssets: number; // Percentage
    status: 'OPERATIONAL' | 'DEGRADED' | 'FAILED';
}

export class AbsoluteZero {

    /**
     * SIMULATE CENTURY
     * Runs the timeline from StartYear to StartYear + 100.
     */
    simulateCentury(startYear: number): CenturyStats {
        let revenue = 0;
        let rebuilds = 0;
        const endYear = startYear + 100;

        // Simulation Loop
        for (let year = startYear; year <= endYear; year++) {
            // 1. Accumulate Wealth (Avg €84M/year)
            revenue += 84000000;

            // 2. Trigger Major Rebuilds every 30 years
            if ((year - startYear) % 30 === 0 && year !== startYear) {
                rebuilds++;
                // Cost of rebuild deducted
                revenue -= 50000000;
            }
        }

        return {
            currentYear: endYear,
            totalRevenueEur: revenue,
            autonomousRebuilds: rebuilds,
            survivingAssets: 100, // It fixes itself, so 100% survive
            status: 'OPERATIONAL'
        };
    }
}
