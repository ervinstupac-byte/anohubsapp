/**
 * WISDOM PROFIT CALCULATOR
 * The Candy Money Counter 💰🍭
 * Tracks how much money the 'Smart' decisions saved vs. 'Dumb' decisions.
 */

export interface SavingsReport {
    dailySavingsEuro: number;
    source: string;
    totalYearlyProjection: number;
}

export class WisdomProfitCalculator {
    private totalDailySavings = 0;

    /**
     * REGISTER SAVE
     * Adds a "Virtual Save" to the bank.
     */
    registerSave(type: 'FALSE_TRIP_PREVENTED' | 'EFFICIENCY_GAIN' | 'LEAK_FIXED', details: string): number {
        let value = 0;

        switch (type) {
            case 'FALSE_TRIP_PREVENTED':
                // Cost of 1 hour downtime (25MW * €80/MWh)
                value = 25 * 80;
                break;
            case 'EFFICIENCY_GAIN':
                // 1% gain for 24h (25MW * 0.01 * 24 * €80)
                value = 25 * 0.01 * 24 * 80;
                break;
            case 'LEAK_FIXED':
                // Micro-gap leak (115 euro/day)
                value = 115;
                break;
        }

        this.totalDailySavings += value;
        // console.log(`💰 KA-CHING: +€${value} (${type} - ${details})`);
        return value;
    }

    getReport(): SavingsReport {
        return {
            dailySavingsEuro: this.totalDailySavings,
            source: 'Wisdom Actions (Prevented Trips + Efficiency)',
            totalYearlyProjection: this.totalDailySavings * 365
        };
    }
}
