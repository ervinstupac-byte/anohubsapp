
import Decimal from 'decimal.js';

export interface FleetAsset {
    id: string;
    efficiency: number; // 0-1 or 0-100 (normalized to 0-1 internally if > 1)
    currentPowerMW: number;
    maxCapacityMW: number; // usually 15 or less due to sovereign limit
}

export interface OptimizationResult {
    distribution: Record<string, number>; // assetId -> targetMW
    totalAllocatedMW: number;
    residualMW: number; // Unallocated power if demand exceeds capacity
}

const CONSTANTS = {
    SOVEREIGN_LIMIT_MW: 15.0,
    MIN_OPERATING_LOAD_MW: 2.0, // Avoid rough zone < 2MW
    SWEET_SPOT_MIN: 0.70, // 70% of capacity
    SWEET_SPOT_MAX: 0.90  // 90% of capacity
};

/**
 * DNA-specific efficiency curve lookup.
 * Returns the peak efficiency load % for a given turbine type.
 * Default: 80% (center of sweet spot).
 */
function getDnaOptimalLoad(assetId: string): number {
    // In production, this would query BaselineState or TurbineRegistry
    // For now, return center of sweet spot with slight variance
    const hash = assetId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 0.75 + (hash % 10) * 0.015; // 75-90% range based on ID hash
}

export class FleetOptimizer {

    /**
     * Calculates the optimal load distribution across a fleet of assets.
     * Prioritizes assets with higher efficiency ($\eta$).
     * Respects the Sovereign Limit (15 MW) per unit.
     * Keeps turbines in their "Sweet Spot" (70-90% load).
     * 
     * @param targetTotalMW The desired total power output for the fleet.
     * @param assets List of available assets.
     */
    static calculateOptimalDistribution(targetTotalMW: number, assets: FleetAsset[]): OptimizationResult {
        // 1. Sort assets by efficiency descending
        const sortedAssets = [...assets].sort((a, b) => {
            const effA = a.efficiency > 1 ? a.efficiency / 100 : a.efficiency;
            const effB = b.efficiency > 1 ? b.efficiency / 100 : b.efficiency;
            return effB - effA;
        });

        const result: Record<string, number> = {};
        let remainingTarget = new Decimal(targetTotalMW);
        let totalAllocated = new Decimal(0);

        // 2. Sweet Spot Allocation Loop
        for (const asset of sortedAssets) {
            // Determine effective capacity (min of design capacity or Sovereign Limit)
            const capacity = Decimal.min(asset.maxCapacityMW, CONSTANTS.SOVEREIGN_LIMIT_MW);

            // Calculate Sweet Spot bounds (DNA-aware)
            const dnaOptimal = getDnaOptimalLoad(asset.id);
            const sweetMin = capacity.mul(Math.max(CONSTANTS.SWEET_SPOT_MIN, dnaOptimal - 0.10));
            const sweetMax = capacity.mul(Math.min(CONSTANTS.SWEET_SPOT_MAX, dnaOptimal + 0.10));

            if (remainingTarget.lte(0)) {
                result[asset.id] = 0;
                continue;
            }

            // Allocate within Sweet Spot if possible
            let allocation: Decimal;

            if (remainingTarget.gte(sweetMax)) {
                // Plenty of demand: run at sweet spot max
                allocation = sweetMax;
            } else if (remainingTarget.gte(sweetMin)) {
                // Moderate demand: take exactly what's needed (within sweet spot)
                allocation = remainingTarget;
            } else if (remainingTarget.gte(CONSTANTS.MIN_OPERATING_LOAD_MW)) {
                // Low demand but above rough zone: accept it
                allocation = remainingTarget;
            } else {
                // Too little to operate safely - skip this unit
                result[asset.id] = 0;
                continue;
            }

            // Clamp to sovereign limit
            allocation = Decimal.min(allocation, capacity);

            result[asset.id] = allocation.toNumber();
            remainingTarget = remainingTarget.minus(allocation);
            totalAllocated = totalAllocated.plus(allocation);
        }

        return {
            distribution: result,
            totalAllocatedMW: totalAllocated.toNumber(),
            residualMW: remainingTarget.gt(0) ? remainingTarget.toNumber() : 0
        };
    }

    /**
     * Calculates the theoretical maximum efficiency of the fleet if running at optimal distribution.
     */
    static calculateFleetEfficiency(assets: FleetAsset[]): number {
        if (assets.length === 0) return 0;
        // Simple average for now, or weighted by capacity? 
        // Weighted by capacity is more accurate for "Fleet Potential".
        let totalCap = new Decimal(0);
        let weightedEff = new Decimal(0);

        assets.forEach(a => {
            // Decimal.min returns a Decimal (or MockDecimal), no need to wrap it again which fails in Mock due to missing valueOf
            const cap = Decimal.min(a.maxCapacityMW, CONSTANTS.SOVEREIGN_LIMIT_MW);
            const eff = new Decimal(a.efficiency > 1 ? a.efficiency / 100 : a.efficiency);
            weightedEff = weightedEff.plus(eff.mul(cap));
            totalCap = totalCap.plus(cap);
        });

        if (totalCap.isZero()) return 0;
        return weightedEff.div(totalCap).toNumber();
    }
}
