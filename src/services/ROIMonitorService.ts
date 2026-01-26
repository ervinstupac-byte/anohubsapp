/**
 * ROIMonitorService.ts
 * 
 * Tracks the financial impact of autonomous operations.
 * Aggregates data from Shadow predictions, Healing actions, and Market optimizations
 * to calculate real-time Return on Investment.
 */

export interface ROIMetrics {
    preventedMaintenanceCosts: number; // € saved from avoided failures
    marketOpportunityGains: number;    // € gained from optimal market participation
    productionDips: number;            // € lost during healing operations
    totalSaved: number;                // Net ROI
    autonomousActionsCount: number;
    averageHealingEffectiveness: number;
}

export interface FinancialEvent {
    timestamp: number;
    type: 'PREVENTED_FAILURE' | 'MARKET_GAIN' | 'PRODUCTION_DIP' | 'HEALING_COST';
    amount: number; // € (positive for gains, negative for costs)
    description: string;
}

export class ROIMonitorService {
    private static events: FinancialEvent[] = [];

    /**
     * Record a financial event from autonomous operations
     */
    public static recordEvent(event: FinancialEvent): void {
        this.events.push(event);
        console.log(`[ROI] ${event.type}: €${event.amount.toFixed(2)} - ${event.description}`);
    }

    /**
     * Calculate comprehensive ROI metrics
     */
    public static calculateROI(since?: number): ROIMetrics {
        const cutoff = since || 0;
        const relevantEvents = this.events.filter(e => e.timestamp >= cutoff);

        let preventedMaintenance = 0;
        let marketGains = 0;
        let productionLoss = 0;
        let healingActions = 0;
        let totalHealingEffectiveness = 0;

        for (const event of relevantEvents) {
            switch (event.type) {
                case 'PREVENTED_FAILURE':
                    preventedMaintenance += event.amount;
                    break;
                case 'MARKET_GAIN':
                    marketGains += event.amount;
                    break;
                case 'PRODUCTION_DIP':
                case 'HEALING_COST':
                    productionLoss += Math.abs(event.amount);
                    healingActions++;
                    break;
            }
        }

        const totalSaved = preventedMaintenance + marketGains - productionLoss;
        const avgHealingEff = healingActions > 0 ? totalHealingEffectiveness / healingActions : 0;

        return {
            preventedMaintenanceCosts: preventedMaintenance,
            marketOpportunityGains: marketGains,
            productionDips: productionLoss,
            totalSaved,
            autonomousActionsCount: relevantEvents.length,
            averageHealingEffectiveness: avgHealingEff
        };
    }

    /**
     * Get daily ROI (last 24 hours)
     */
    public static getDailyROI(): ROIMetrics {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return this.calculateROI(oneDayAgo);
    }

    /**
     * Get weekly ROI (last 7 days)
     */
    public static getWeeklyROI(): ROIMetrics {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return this.calculateROI(oneWeekAgo);
    }

    /**
     * Export events for reporting
     */
    public static exportEvents(since?: number): FinancialEvent[] {
        const cutoff = since || 0;
        return this.events.filter(e => e.timestamp >= cutoff);
    }

    /**
     * Integration: Record healing action outcome
     */
    public static recordHealingAction(healingEffectiveness: number, costSaved: number): void {
        this.recordEvent({
            timestamp: Date.now(),
            type: 'PREVENTED_FAILURE',
            amount: costSaved,
            description: `Healing protocol prevented failure (H_eff: ${healingEffectiveness.toFixed(2)})`
        });
    }

    /**
     * Integration: Record market optimization
     */
    public static recordMarketOptimization(gainAmount: number, action: string): void {
        this.recordEvent({
            timestamp: Date.now(),
            type: 'MARKET_GAIN',
            amount: gainAmount,
            description: action
        });
    }

    /**
     * Integration: Record production impact during healing
     */
    public static recordProductionImpact(lossAmount: number, duration: number): void {
        this.recordEvent({
            timestamp: Date.now(),
            type: 'PRODUCTION_DIP',
            amount: -lossAmount,
            description: `Production reduced during healing (${duration}min)`
        });
    }
}
