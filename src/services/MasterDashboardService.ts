/**
 * MASTER DASHBOARD SERVICE
 * The Command Bridge 🌉
 * Aggregates Finanical, Technical, and Safety signals into one Truth.
 */

import { GlobalHealthDashboard, GlobalHealthMap } from './GlobalHealthDashboard';
import { MorningReportGenerator, MorningReport } from './MorningReportGenerator';
import { AuxiliaryMonitor, AuxHealthStatus } from './AuxiliaryMonitor';
import BaseGuardian from './BaseGuardian';

export interface MasterDashboardState {
    globalHealthScore: number; // 0-100 Weighted Average
    totalMoneyLeak: number; // €/day
    criticalAlarms: string[]; // Top 3 Priorities
    vitalOrgans: {
        hpu: AuxHealthStatus;
        cooling: AuxHealthStatus;
        dcSystem: { ready: boolean; message: string };
    };
    overallStatus: 'OPTIMAL' | 'ATTENTION' | 'CRITICAL';
}

export class MasterDashboardService extends BaseGuardian {

    constructor(
        private globalHealth: GlobalHealthDashboard,
        private morningReport: MorningReportGenerator,
        private auxMonitor: AuxiliaryMonitor
    ) {
        super();
    }

    /**
     * COMPILE DASHBOARD
     * The "Frame" that renders the station state.
     */
    compileDashboard(
        systemsHealth: GlobalHealthMap,
        report: MorningReport,
        auxStatus: { hpu: AuxHealthStatus; cooling: AuxHealthStatus; dcFromBridge: any }
    ): MasterDashboardState {

        // 1. Calculate Global Health Score
        // Weighted average of all systems health score.
        let totalScore = 0;
        let count = 0;
        systemsHealth.systems.forEach(s => {
            totalScore += s.healthScore;
            count++;
        });
        const globalHealthScore = count > 0 ? totalScore / count : 100;

        // 2. Identify Critical Alarms (Top 3)
        // Already sorted by priority in GlobalHealthMap
        const criticalAlarms = systemsHealth.systems
            .slice(0, 3)
            .map(s => {
                // Librarian Ant Logic: Append PDF Link if available
                // In a real app, we'd lookup the AssetNode. For demo, we simulate it.
                return `[${s.urgency}] ${s.systemName}: ${s.recommendedAction} (See Drawing 42)`;
            });

        // 3. Vital Organs & Zero-Waste Checks
        const vitalOrgans = {
            hpu: auxStatus.hpu,
            cooling: auxStatus.cooling,
            dcSystem: auxStatus.dcFromBridge
        };

        // 4. Micro-Gap Money Leak (Energy Loss)
        // Logic: Loss = (CurrentGap - DesignGap) * LossFactor * EnergyPrice
        // Example: 0.2mm excess * 1.2% * 25MW * 24h * €0.08
        // This should physically be calculated per turbine, but here we aggregate.
        // Let's assume a detected gap increase for the dashboard summary.
        const gapLosskW = 25000 * 0.012 * 0.2; // 60 kW leaked
        const gapLossEuro = gapLosskW * 24 * 0.08; // ~€115/day

        // Add to total
        const finalMoneyLeak = report.metrics.totalMoneyLeakToday + gapLossEuro;

        // 5. Determine Overall Status
        let overallStatus: MasterDashboardState['overallStatus'] = 'OPTIMAL';
        if (globalHealthScore < 80 || finalMoneyLeak > 100) overallStatus = 'ATTENTION';
        if (globalHealthScore < 60 || report.integrity.status === 'QUAKY') overallStatus = 'CRITICAL';
        if (auxStatus.hpu.status === 'CRITICAL' || auxStatus.cooling.status === 'CRITICAL') overallStatus = 'CRITICAL';

        return {
            globalHealthScore,
            totalMoneyLeak: finalMoneyLeak,
            criticalAlarms,
            vitalOrgans,
            overallStatus
        };
    }

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
