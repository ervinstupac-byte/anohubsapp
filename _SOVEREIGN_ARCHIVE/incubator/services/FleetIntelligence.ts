/**
 * FleetIntelligence.ts
 * 
 * Cross-Unit Benchmarking & Intelligence Service
 * Compares identical units (e.g. Unit 1 vs Unit 2) to identify underperformers.
 * Uses IEEE performance standards for "Relative Efficiency" calculation.
 */

import { TurbineMasterCore } from './TurbineMasterCore';

export interface UnitPerformance {
    unitId: string;
    loadMW: number;
    flowM3s: number;
    headM: number;
    efficiency: number; // Calculated %
    vibration: number; // max mm/s
}

export interface ComparisonResult {
    leaderId: string;
    laggardId: string;
    efficiencyGap: number; // %
    revenueLossHourly: number; // EUR
    diagnosis: string;
}

export class FleetIntelligence {
    private static ENERGY_PRICE_EUR_MWH = 85.0; // Market price

    /**
     * BENCHMARK IDENTICAL UNITS
     * Compares two units operating under similar conditions.
     */
    public static benchmarkUnits(
        unitA: UnitPerformance,
        unitB: UnitPerformance
    ): ComparisonResult {
        // 1. Normalize Inputs
        // Can only compare if Heads are similar (< 5% deviation)
        const headDiff = Math.abs(unitA.headM - unitB.headM) / unitA.headM;
        if (headDiff > 0.05) {
            return {
                leaderId: 'N/A',
                laggardId: 'N/A',
                efficiencyGap: 0,
                revenueLossHourly: 0,
                diagnosis: 'Cannot compare: Hydraulic Head deviation > 5%'
            };
        }

        // 2. Identify Leader
        const leader = unitA.efficiency > unitB.efficiency ? unitA : unitB;
        const laggard = unitA.efficiency > unitB.efficiency ? unitB : unitA;
        const gap = leader.efficiency - laggard.efficiency;

        // 3. Calculate Economic Impact
        // Power Loss = Flow * Head * g * (Delta Eff)
        // Simplified: (Gap/100) * LaggardLoad
        const powerLossMW = (gap / 100) * laggard.loadMW;
        const revenueLoss = powerLossMW * this.ENERGY_PRICE_EUR_MWH;

        // 4. Diagnose Root Cause
        let diagnosis = 'Unknown Variance';
        if (gap < 0.5) diagnosis = 'Statistical Noise (Within measurement tolerance)';
        else if (laggard.vibration > leader.vibration * 1.5) diagnosis = 'Mechanical Defect: High vibration correlates with efficiency loss.';
        else diagnosis = 'Hydraulic Profile Degradation (Erosion/Cavitation damage).';

        return {
            leaderId: leader.unitId,
            laggardId: laggard.unitId,
            efficiencyGap: gap,
            revenueLossHourly: revenueLoss,
            diagnosis
        };
    }

    /**
     * GENERATE FLEET REPORT
     * Runs benchmarks on a list of units (assuming pairs 1-2, 3-4, 5-6).
     */
    public static generateFleetReport(units: UnitPerformance[]): string {
        let report = `FLEET INTELLIGENCE REPORT [${new Date().toISOString()}]\n`;
        report += '===================================================\n';

        // Pair 1 vs 2
        const u1 = units.find(u => u.unitId === 'UNIT-1');
        const u2 = units.find(u => u.unitId === 'UNIT-2');
        if (u1 && u2) {
            const res = this.benchmarkUnits(u1, u2);
            report += `\n[FRANCIS TWINS] UNIT-1 vs UNIT-2\n`;
            report += `Leader: ${res.leaderId} (+${res.efficiencyGap.toFixed(2)}% eff)\n`;
            report += `Impact: Losing €${res.revenueLossHourly.toFixed(2)}/hr on ${res.laggardId}\n`;
            report += `Diagnosis: ${res.diagnosis}\n`;
        }

        // Pair 5 vs 6
        const u5 = units.find(u => u.unitId === 'UNIT-5');
        const u6 = units.find(u => u.unitId === 'UNIT-6');
        if (u5 && u6) {
            const res = this.benchmarkUnits(u5, u6);
            report += `\n[PELTON TWINS] UNIT-5 vs UNIT-6\n`;
            report += `Leader: ${res.leaderId} (+${res.efficiencyGap.toFixed(2)}% eff)\n`;
            report += `Impact: Losing €${res.revenueLossHourly.toFixed(2)}/hr on ${res.laggardId}\n`;
            report += `Diagnosis: ${res.diagnosis}\n`;
        }

        return report;
    }
}
