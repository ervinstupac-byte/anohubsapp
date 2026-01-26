/**
 * FleetOrchestratorV2.ts
 * 
 * Fleet Swarm Intelligence - Final Implementation
 * Real-time load redistribution across all 6 units
 * Prioritizes high-efficiency units and protects degraded assets
 */

import { FleetAsset } from './FleetOrchestrator';

export interface LoadDistributionPlan {
    timestamp: number;
    totalDemand: number; // MW
    allocations: Array<{
        assetId: string;
        currentLoad: number;
        targetLoad: number;
        heff: number;
        priority: number;
    }>;
    reasoning: string;
}

export class FleetOrchestratorV2 {

    /**
     * Intelligent load redistribution across fleet
     * Optimizes for maximum fleet efficiency while protecting degraded units
     */
    public static calculateOptimalLoadDistribution(
        fleet: FleetAsset[],
        totalDemand: number
    ): LoadDistributionPlan {

        // Sort units by efficiency (highest first)
        const sortedFleet = [...fleet].sort((a, b) => b.healthEffectiveness - a.healthEffectiveness);

        const allocations: LoadDistributionPlan['allocations'] = [];
        let remainingDemand = totalDemand;

        // Apply special considerations
        const unit3 = fleet.find(f => f.assetId === 'UNIT-3');
        const unit3Degraded = unit3 && unit3.healthEffectiveness < 0.90;

        for (const asset of sortedFleet) {
            // UNIT-3 special handling: Reduce load due to servo backlash
            let maxAllowableLoad = asset.maxCapacity;

            if (asset.assetId === 'UNIT-3' && unit3Degraded) {
                // Limit to 85% capacity to minimize servo stress
                maxAllowableLoad = asset.maxCapacity * 0.85;
            }

            // Calculate target load
            let targetLoad = Math.min(remainingDemand, maxAllowableLoad);

            // Priority scoring (higher = better)
            // Factors: efficiency, capacity headroom, health status
            const priority = asset.healthEffectiveness * 100 +
                (asset.maxCapacity - asset.currentLoad) * 0.5 +
                (asset.assetId === 'UNIT-4' ? 10 : 0); // Bonus for best unit

            allocations.push({
                assetId: asset.assetId,
                currentLoad: asset.currentLoad,
                targetLoad,
                heff: asset.healthEffectiveness,
                priority
            });

            remainingDemand -= targetLoad;
            if (remainingDemand <= 0) break;
        }

        // Generate reasoning
        const reasoning = this.generateLoadReasoning(allocations, unit3Degraded || false);

        return {
            timestamp: Date.now(),
            totalDemand,
            allocations,
            reasoning
        };
    }

    /**
     * Generate human-readable load distribution reasoning
     */
    private static generateLoadReasoning(
        allocations: LoadDistributionPlan['allocations'],
        unit3Protected: boolean
    ): string {
        const lines: string[] = [];

        lines.push('Load Distribution Strategy:');

        // Sort by priority
        const sorted = [...allocations].sort((a, b) => b.priority - a.priority);

        for (let i = 0; i < sorted.length; i++) {
            const alloc = sorted[i];
            const loadPct = (alloc.targetLoad / alloc.currentLoad) * 100;

            lines.push(
                `${i + 1}. ${alloc.assetId}: ${alloc.targetLoad.toFixed(1)} MW ` +
                `(H_eff: ${(alloc.heff * 100).toFixed(1)}%, Priority: ${alloc.priority.toFixed(0)})`
            );
        }

        if (unit3Protected) {
            lines.push('⚠️ UNIT-3 load limited to 85% capacity (servo backlash protection)');
        }

        return lines.join('\n');
    }

    /**
     * Check if fleet can handle target demand
     */
    public static canMeetDemand(fleet: FleetAsset[], demand: number): {
        feasible: boolean;
        availableCapacity: number;
        shortfall: number;
    } {
        const availableCapacity = fleet.reduce((sum, asset) => {
            // Account for UNIT-3 limitation
            if (asset.assetId === 'UNIT-3' && asset.healthEffectiveness < 0.90) {
                return sum + (asset.maxCapacity * 0.85);
            }
            return sum + asset.maxCapacity;
        }, 0);

        const feasible = availableCapacity >= demand;
        const shortfall = feasible ? 0 : demand - availableCapacity;

        return { feasible, availableCapacity, shortfall };
    }
}
