/**
 * HydraulicHeadCorrection.ts
 * 
 * Environmental Hydraulic Head Correction
 * Uses piezometric data to correct net head calculation for turbine efficiency
 * Accounts for tailwater suppression and losses
 */

export interface HydraulicData {
    grossHead: number; // m (reservoir level - tailwater level)
    piezometricHeadLoss: number; // m (from piezometer data)
    tailwaterSuppression: number; // m (backwater effect)
    intakeLosses: number; // m (trash rack, gates)
    draftTubeLosses: number; // m (exit losses)
}

export class HydraulicHeadCorrection {

    /**
     * Calculate corrected net head for efficiency calculations
     * 
     * H_net = H_gross - H_losses
     * Where H_losses = intake + piezometric + tailwater + draft_tube
     */
    public static calculateNetHead(data: HydraulicData): {
        netHead: number;
        grossHead: number;
        totalLosses: number;
        efficiencyCorrection: number; // % correction to apply
        breakdown: {
            intake: number;
            piezometric: number;
            tailwater: number;
            draftTube: number;
        };
    } {
        const breakdown = {
            intake: data.intakeLosses,
            piezometric: data.piezometricHeadLoss,
            tailwater: data.tailwaterSuppression,
            draftTube: data.draftTubeLosses
        };

        const totalLosses =
            breakdown.intake +
            breakdown.piezometric +
            breakdown.tailwater +
            breakdown.draftTube;

        const netHead = data.grossHead - totalLosses;

        // Efficiency correction factor
        // Turbines are less efficient when net head differs from gross head
        const headRatio = netHead / data.grossHead;
        const efficiencyCorrection = (1 - headRatio) * 100; // % efficiency reduction

        return {
            netHead,
            grossHead: data.grossHead,
            totalLosses,
            efficiencyCorrection,
            breakdown
        };
    }

    /**
     * Calculate piezometric head loss from pressure measurements
     */
    public static calculatePiezometricLoss(
        upstreamPressure: number, // bar
        downstreamPressure: number, // bar
        upstreamElevation: number, // m
        downstreamElevation: number // m
    ): number {
        // Convert pressure to head: h = P / (ρ × g)
        const rho = 1000; // kg/m³ (water density)
        const g = 9.81; // m/s²

        const upstreamHead = (upstreamPressure * 100000) / (rho * g) + upstreamElevation;
        const downstreamHead = (downstreamPressure * 100000) / (rho * g) + downstreamElevation;

        const headLoss = upstreamHead - downstreamHead;

        return Math.max(0, headLoss); // Losses are always positive
    }

    /**
     * Calculate intake losses (trash rack + screens + gates)
     */
    public static calculateIntakeLosses(
        flowVelocity: number, // m/s
        trashRackDP: number // bar (differential pressure)
    ): number {
        // Head loss from ΔP: h = ΔP / (ρ × g)
        const rho = 1000;
        const g = 9.81;
        const dpLoss = (trashRackDP * 100000) / (rho * g);

        // Additional velocity head loss at screens
        const velocityLoss = (flowVelocity * flowVelocity) / (2 * g);

        return dpLoss + velocityLoss;
    }

    /**
     * Calculate tailwater suppression (backwater effect)
     */
    public static calculateTailwaterSuppression(
        downstreamWaterLevel: number, // m
        normalTailwater: number // m (design condition)
    ): number {
        // Positive value = tailwater higher than normal (reduces net head)
        return Math.max(0, downstreamWaterLevel - normalTailwater);
    }

    /**
     * Calculate draft tube losses
     */
    public static calculateDraftTubeLosses(
        draftTubePressure: number, // bar (should be sub-atmospheric)
        atmosphericPressure: number = 1.013 // bar
    ): number {
        // Draft tube creates suction (negative pressure)
        // Losses occur when pressure is not as negative as expected
        const rho = 1000;
        const g = 9.81;

        // Expected pressure recovery
        const expectedRecovery = (atmosphericPressure - draftTubePressure) * 100000 / (rho * g);

        // Typical draft tube recovery: 3-4 m
        const designRecovery = 3.5; // m

        // Loss = design recovery - actual recovery
        const loss = Math.max(0, designRecovery - expectedRecovery);

        return loss;
    }

    /**
     * Correct turbine efficiency based on hydraulic conditions
     */
    public static correctTurbineEfficiency(
        measuredEfficiency: number, // 0-1
        netHead: number,
        designHead: number
    ): {
        correctedEfficiency: number;
        headRatio: number;
        correction: number; // efficiency points lost
    } {
        const headRatio = netHead / designHead;

        // Turbine efficiency vs head curve (simplified)
        // Most turbines are optimized for design head
        // Efficiency drops off when operating away from design point
        let efficiencyFactor = 1.0;

        if (headRatio < 0.8) {
            // Operating at low head
            efficiencyFactor = 0.85 + (headRatio - 0.6) * 0.75; // Steep drop-off
        } else if (headRatio > 1.2) {
            // Operating at high head
            efficiencyFactor = 1.0 - (headRatio - 1.2) * 0.5; // Gradual drop-off
        } else {
            // Near design point (0.8 - 1.2)
            efficiencyFactor = 0.95 + (1.0 - Math.abs(headRatio - 1.0)) * 0.05;
        }

        const correctedEfficiency = measuredEfficiency * efficiencyFactor;
        const correction = (measuredEfficiency - correctedEfficiency) * 100; // percentage points

        return {
            correctedEfficiency,
            headRatio,
            correction
        };
    }

    /**
     * Generate hydraulic analysis report
     */
    public static generateReport(
        grossHead: number,
        piezometricData: { upstream: number; downstream: number; upElev: number; downElev: number },
        trashRackDP: number,
        flowVelocity: number,
        tailwaterLevel: number,
        normalTailwater: number,
        draftTubePressure: number
    ): string {
        // Calculate all components
        const piezometricLoss = this.calculatePiezometricLoss(
            piezometricData.upstream,
            piezometricData.downstream,
            piezometricData.upElev,
            piezometricData.downElev
        );

        const intakeLosses = this.calculateIntakeLosses(flowVelocity, trashRackDP);
        const tailwaterSuppression = this.calculateTailwaterSuppression(tailwaterLevel, normalTailwater);
        const draftTubeLosses = this.calculateDraftTubeLosses(draftTubePressure);

        const netHeadResult = this.calculateNetHead({
            grossHead,
            piezometricHeadLoss: piezometricLoss,
            tailwaterSuppression,
            intakeLosses,
            draftTubeLosses
        });

        let report = '';
        report += '═'.repeat(80) + '\n';
        report += 'HYDRAULIC HEAD ANALYSIS REPORT\n';
        report += '═'.repeat(80) + '\n\n';
        report += `Gross Head: ${grossHead.toFixed(2)} m\n\n`;
        report += 'HEAD LOSSES:\n';
        report += `  Intake (trash rack + screens): ${intakeLosses.toFixed(2)} m\n`;
        report += `  Piezometric (conduit): ${piezometricLoss.toFixed(2)} m\n`;
        report += `  Tailwater suppression: ${tailwaterSuppression.toFixed(2)} m\n`;
        report += `  Draft tube: ${draftTubeLosses.toFixed(2)} m\n`;
        report += `  ───────────────────────────\n`;
        report += `  TOTAL LOSSES: ${netHeadResult.totalLosses.toFixed(2)} m\n\n`;
        report += `NET HEAD: ${netHeadResult.netHead.toFixed(2)} m\n`;
        report += `Efficiency Correction: -${netHeadResult.efficiencyCorrection.toFixed(2)}%\n\n`;
        report += '═'.repeat(80) + '\n';

        return report;
    }
}
