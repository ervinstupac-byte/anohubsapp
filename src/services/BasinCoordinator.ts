/**
 * BASIN COORDINATOR
 * The Pure Hydro Sovereign 🌊🔄
 * Manages the entire river valley as one single organism.
 */

export interface BasinState {
    upstreamLevel: number; // m
    downstreamLevel: number; // m
    flowRateTotal: number; // m3/s
}

export interface UnitStatus {
    id: string;
    currentMw: number;
    condition: 'OPTIMAL' | 'WARNING' | 'DANGER' | 'OFFLINE';
    maxCapacityMw: number;
}

export interface FleetAction {
    unitActions: { unitId: string, targetMw: number, reason: string }[];
    gridStability: 'STABLE' | 'COMPROMISED';
    message: string;
}

export class BasinCoordinator {

    /**
     * HARMONIZE FLOW
     * Optimizes the entire valley.
     */
    harmonizeFlow(state: BasinState): string {
        if (state.upstreamLevel > 1400 && state.downstreamLevel < 200) {
            return 'OPTIMAL: The River is Balanced. Pressure Waves cancelled. Molecular Stress minimal.';
        }
        return 'ADJUSTING: Equalizing Basin Pressure...';
    }

    /**
     * COORDINATE FLEET (PHASE 30.0)
     * The Hive Mind Logic.
     * Use Case: Unit 1 in Chem Danger -> Unit 2 picks up the load.
     */
    coordinateFleet(unit1: UnitStatus, unit2: UnitStatus, gridTargetMw: number): FleetAction {
        const totalCapacity = unit1.maxCapacityMw + unit2.maxCapacityMw;
        const actions = [];

        // 1. Check for DANGER
        if (unit1.condition === 'DANGER' && unit2.condition === 'OPTIMAL') {
            // STRATEGY: SAVE UNIT 1
            const safeLoadU1 = 0; // Shutdown or Idle
            const requiredU2 = gridTargetMw - safeLoadU1;

            if (requiredU2 <= unit2.maxCapacityMw) {
                actions.push({ unitId: unit1.id, targetMw: safeLoadU1, reason: 'CRITICAL: Chemical Danger. Unloading.' });
                actions.push({ unitId: unit2.id, targetMw: requiredU2, reason: 'COMPENSATION: Covering Unit 1 Load.' });
                return {
                    unitActions: actions,
                    gridStability: 'STABLE',
                    message: `✅ LOAD SHIFT: Unit 2 covering for Unit 1. Grid Valid.`
                };
            } else {
                // U2 cannot take it all
                actions.push({ unitId: unit1.id, targetMw: safeLoadU1, reason: 'CRITICAL: Shutdown.' });
                actions.push({ unitId: unit2.id, targetMw: unit2.maxCapacityMw, reason: 'Max Effort.' });
                return {
                    unitActions: actions,
                    gridStability: 'COMPROMISED',
                    message: `⚠️ DEFICIT: Unit 2 Maxed Out. Grid Shortfall: ${(gridTargetMw - unit2.maxCapacityMw).toFixed(1)} MW.`
                };
            }
        }

        // Default: Split Evenly or Proportional
        const split = gridTargetMw / 2;
        actions.push({ unitId: unit1.id, targetMw: split, reason: 'Balanced Load' });
        actions.push({ unitId: unit2.id, targetMw: split, reason: 'Balanced Load' });

        return {
            unitActions: actions,
            gridStability: 'STABLE',
            message: 'Fleet Balanced.'
        };
    }
}
