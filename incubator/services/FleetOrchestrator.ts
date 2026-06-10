/**
 * FleetOrchestrator.ts
 * 
 * The "Swarm Conductor"
 * Manages load distribution across the fleet, ensuring that when one asset
 * enters healing mode, others compensate without compromising their own health.
 */

import { GlobalState } from './SovereignGlobalState';

export interface FleetAsset {
    assetId: string;
    turbineModel: string;
    currentLoad: number; // MW
    maxCapacity: number; // MW
    healthEffectiveness: number; // H_eff
    state: 'OPERATIONAL' | 'HEALING' | 'OFFLINE';
    globalState?: GlobalState;
}

export interface LoadShiftPlan {
    sourceAsset: string; // Asset entering healing
    lostMW: number;
    compensations: Array<{
        assetId: string;
        additionalMW: number;
        projectedHeff: number;
    }>;
    totalCompensated: number;
    feasible: boolean;
}

export class FleetOrchestrator {

    /**
     * Calculate optimal load distribution when an asset needs healing
     */
    public static calculateLoadShift(
        healingAsset: FleetAsset,
        fleetAssets: FleetAsset[]
    ): LoadShiftPlan {

        const lostMW = healingAsset.currentLoad;
        const availableAssets = fleetAssets.filter(
            a => a.assetId !== healingAsset.assetId && a.state === 'OPERATIONAL'
        );

        // Sort by current H_eff (highest first - they can handle load increase best)
        availableAssets.sort((a, b) => b.healthEffectiveness - a.healthEffectiveness);

        const compensations: Array<{ assetId: string; additionalMW: number; projectedHeff: number }> = [];
        let remainingMW = lostMW;

        for (const asset of availableAssets) {
            if (remainingMW <= 0) break;

            // Calculate how much this asset can take
            const capacity = asset.maxCapacity - asset.currentLoad;
            const canTake = Math.min(capacity, remainingMW);

            // Simulate H_eff after load increase
            // Simplified: H_eff drops slightly with increased load
            const loadIncreaseFactor = canTake / asset.maxCapacity;
            const projectedHeff = asset.healthEffectiveness - (loadIncreaseFactor * 0.1);

            // Only assign if H_eff stays above threshold
            if (projectedHeff >= 0.85 && canTake > 0) {
                compensations.push({
                    assetId: asset.assetId,
                    additionalMW: canTake,
                    projectedHeff
                });
                remainingMW -= canTake;
            }
        }

        const totalCompensated = lostMW - remainingMW;

        return {
            sourceAsset: healingAsset.assetId,
            lostMW,
            compensations,
            totalCompensated,
            feasible: remainingMW < 0.01 // Fully compensated
        };
    }

    /**
     * Execute load shift across the fleet
     */
    public static executeLoadShift(plan: LoadShiftPlan): void {
        if (!plan.feasible) {
            console.warn('[Fleet] Load shift not feasible - grid support may be needed');
            return;
        }

        console.log(`[Fleet] 🔄 Executing Load Shift: ${plan.lostMW} MW compensation`);

        for (const comp of plan.compensations) {
            console.log(`[Fleet]   → ${comp.assetId}: +${comp.additionalMW.toFixed(1)} MW (H_eff: ${comp.projectedHeff.toFixed(2)})`);
            // In real system: Send load adjustment command to asset
            // await AssetControlAdapter.adjustLoad(comp.assetId, comp.additionalMW);
        }
    }

    /**
     * Calculate fleet-wide health score
     */
    public static calculateFleetHealth(assets: FleetAsset[]): number {
        if (assets.length === 0) return 0;

        const avgHeff = assets.reduce((sum, a) => sum + a.healthEffectiveness, 0) / assets.length;
        const operationalRatio = assets.filter(a => a.state === 'OPERATIONAL').length / assets.length;

        return avgHeff * operationalRatio; // Composite score
    }

    /**
     * Calculate total fleet capacity
     */
    public static getFleetCapacity(assets: FleetAsset[]): {
        total: number;
        available: number;
        utilized: number;
    } {
        const total = assets.reduce((sum, a) => sum + a.maxCapacity, 0);
        const utilized = assets.reduce((sum, a) => a.state === 'OPERATIONAL' ? sum + a.currentLoad : sum, 0);
        const available = total - utilized;

        return { total, available, utilized };
    }
}
