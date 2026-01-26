/**
 * TrashRackRobot.ts
 * 
 * Automated Trash Rack Cleaning System
 * Links intake monitoring to hydraulic/mechanical cleaning arm
 * Executes cleaning only during optimal windows (low market price periods)
 */

import { MarketBridge } from './MarketBridge';

export interface CleaningCycle {
    cycleId: string;
    startTime: number;
    endTime: number | null;
    trigger: 'DIFFERENTIAL_PRESSURE' | 'SCHEDULED' | 'MANUAL';
    dpBefore: number; // bar
    dpAfter: number | null; // bar
    marketPrice: number; // EUR/MWh at start
    energyCost: number; // EUR
    status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED';
}

export class TrashRackRobot {
    private static readonly DP_THRESHOLD = 0.5; // bar - trigger cleaning
    private static readonly MAX_MARKET_PRICE = 70; // EUR/MWh - only clean if below this
    private static readonly CLEANING_DURATION_MIN = 15; // minutes
    private static readonly ENERGY_CONSUMPTION_KW = 12; // kW for cleaning arm

    private static cleaningHistory: CleaningCycle[] = [];
    private static currentCycle: CleaningCycle | null = null;
    private static isEnabled: boolean = true;

    /**
     * Check if cleaning should be triggered
     */
    public static async checkCleaningTrigger(
        trashRackDP: number,
        currentLoad: number // MW - plant load
    ): Promise<{ shouldClean: boolean; reason: string }> {
        if (!this.isEnabled) {
            return { shouldClean: false, reason: 'Cleaning system disabled' };
        }

        if (this.currentCycle && this.currentCycle.status === 'IN_PROGRESS') {
            return { shouldClean: false, reason: 'Cleaning already in progress' };
        }

        // Check ΔP threshold
        if (trashRackDP < this.DP_THRESHOLD) {
            return { shouldClean: false, reason: `ΔP below threshold (${trashRackDP.toFixed(3)} < ${this.DP_THRESHOLD})` };
        }

        // Get current market price
        const marketPrice = await MarketBridge.getCurrentPrice();

        // Only clean during low-price periods (high-efficiency window)
        if (marketPrice.price > this.MAX_MARKET_PRICE) {
            return {
                shouldClean: false,
                reason: `Market price too high (${marketPrice.price.toFixed(2)} > ${this.MAX_MARKET_PRICE} EUR/MWh) - waiting for lower prices`
            };
        }

        // Check if plant load allows cleaning (need some generation for cleaning power)
        if (currentLoad < 10) {
            return { shouldClean: false, reason: 'Insufficient plant load for cleaning operation' };
        }

        return {
            shouldClean: true,
            reason: `ΔP threshold exceeded (${trashRackDP.toFixed(3)} bar) and market price favorable (${marketPrice.price.toFixed(2)} EUR/MWh)`
        };
    }

    /**
     * Execute cleaning cycle
     */
    public static async executeCleaningCycle(
        dpBefore: number,
        trigger: CleaningCycle['trigger'] = 'DIFFERENTIAL_PRESSURE'
    ): Promise<CleaningCycle> {
        const marketPrice = await MarketBridge.getCurrentPrice();
        const cycleId = `CLEAN-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const cycle: CleaningCycle = {
            cycleId,
            startTime: Date.now(),
            endTime: null,
            trigger,
            dpBefore,
            dpAfter: null,
            marketPrice: marketPrice.price,
            energyCost: 0,
            status: 'IN_PROGRESS'
        };

        this.currentCycle = cycle;
        this.cleaningHistory.push(cycle);

        console.log('\n' + '═'.repeat(80));
        console.log('🤖 AUTOMATED CLEANING CYCLE INITIATED');
        console.log('═'.repeat(80));
        console.log(`Cycle ID: ${cycleId}`);
        console.log(`Trigger: ${trigger}`);
        console.log(`ΔP Before: ${dpBefore.toFixed(3)} bar`);
        console.log(`Market Price: ${marketPrice.price.toFixed(2)} EUR/MWh`);
        console.log(`Expected Duration: ${this.CLEANING_DURATION_MIN} minutes`);
        console.log('═'.repeat(80) + '\n');

        // Start cleaning sequence
        this.runCleaningSequence(cycle);

        return cycle;
    }

    /**
     * Run cleaning sequence
     */
    private static runCleaningSequence(cycle: CleaningCycle): void {
        console.log('[TrashRack] Starting cleaning sequence:');
        console.log('  1. Lower cleaning arm into water');
        console.log('  2. Activate high-pressure jets');
        console.log('  3. Sweep trash rack (left to right)');
        console.log('  4. Collect debris in basket');
        console.log('  5. Raise arm and discharge debris');

        // Simulate cleaning cycle
        setTimeout(() => {
            this.completeCycle(cycle);
        }, this.CLEANING_DURATION_MIN * 60 * 1000); // Convert to ms
    }

    /**
     * Complete cleaning cycle
     */
    private static completeCycle(cycle: CleaningCycle): void {
        cycle.endTime = Date.now();
        cycle.status = 'COMPLETED';

        // Simulate ΔP improvement
        const improvement = 0.2 + Math.random() * 0.15; // 0.2-0.35 bar reduction
        cycle.dpAfter = Math.max(0, cycle.dpBefore - improvement);

        // Calculate energy cost
        const durationHours = this.CLEANING_DURATION_MIN / 60;
        const energyConsumption = this.ENERGY_CONSUMPTION_KW * durationHours; // kWh
        cycle.energyCost = (energyConsumption / 1000) * cycle.marketPrice; // Convert to MWh, multiply by price

        this.currentCycle = null;

        console.log('\n' + '═'.repeat(80));
        console.log('✅ CLEANING CYCLE COMPLETED');
        console.log('═'.repeat(80));
        console.log(`Cycle ID: ${cycle.cycleId}`);
        console.log(`Duration: ${this.CLEANING_DURATION_MIN} minutes`);
        console.log(`ΔP Before: ${cycle.dpBefore.toFixed(3)} bar`);
        console.log(`ΔP After: ${cycle.dpAfter.toFixed(3)} bar`);
        console.log(`Improvement: ${(cycle.dpBefore - cycle.dpAfter).toFixed(3)} bar (${((improvement / cycle.dpBefore) * 100).toFixed(1)}%)`);
        console.log(`Energy Cost: €${cycle.energyCost.toFixed(2)}`);
        console.log('═'.repeat(80) + '\n');
    }

    /**
     * Get optimal cleaning schedule for next 24 hours
     */
    public static getOptimalCleaningSchedule(currentDP: number): {
        recommendedTime: number; // timestamp
        marketPrice: number; // EUR/MWh
        savings: number; // EUR vs cleaning now
    }[] {
        if (currentDP < this.DP_THRESHOLD) {
            return []; // No cleaning needed
        }

        // Get price forecast
        const priceForecast = MarketBridge.getPriceForecast(24);

        // Find low-price periods
        const opportunities = priceForecast
            .filter(forecast => forecast.price <= this.MAX_MARKET_PRICE)
            .map(forecast => {
                const energyConsumption = (this.ENERGY_CONSUMPTION_KW * (this.CLEANING_DURATION_MIN / 60)) / 1000; // MWh

                const cost = energyConsumption * forecast.price;
                const currentPrice = MarketBridge.getPriceStatistics().current;

                const currentCost = energyConsumption * currentPrice;

                return {
                    recommendedTime: forecast.timestamp,
                    marketPrice: forecast.price,
                    savings: currentCost - cost
                };
            })
            .sort((a, b) => a.marketPrice - b.marketPrice) // Cheapest first
            .slice(0, 5); // Top 5 opportunities

        return opportunities;
    }

    /**
     * Get cleaning statistics
     */
    public static getStatistics(): {
        totalCycles: number;
        avgDPReduction: number;
        totalEnergyCost: number;
        avgCycleDuration: number;
        lastCleaning: number;
    } {
        const completed = this.cleaningHistory.filter(c => c.status === 'COMPLETED');

        const avgDPReduction = completed.length > 0
            ? completed.reduce((sum, c) => sum + (c.dpBefore - (c.dpAfter || 0)), 0) / completed.length
            : 0;

        const totalEnergyCost = completed.reduce((sum, c) => sum + c.energyCost, 0);

        const avgCycleDuration = completed.length > 0
            ? completed.reduce((sum, c) => sum + ((c.endTime || 0) - c.startTime), 0) / completed.length / (60 * 1000) // minutes
            : 0;

        const lastCleaning = completed.length > 0
            ? Math.max(...completed.map(c => c.startTime))
            : 0;

        return {
            totalCycles: this.cleaningHistory.length,
            avgDPReduction,
            totalEnergyCost,
            avgCycleDuration,
            lastCleaning
        };
    }

    /**
     * Enable/disable automatic cleaning
     */
    public static setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        console.log(`[TrashRack] Automatic cleaning ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get current cycle
     */
    public static getCurrentCycle(): CleaningCycle | null {
        return this.currentCycle;
    }
}
