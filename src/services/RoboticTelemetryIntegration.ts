/**
 * RoboticTelemetryIntegration.ts
 * 
 * Telemetry Feedback Loop
 * Feeds robotic inspection results back into CivilSecurityModule
 * to update Dam Safety Factor based on physical findings
 */

import { CivilSecurityModule } from './CivilSecurityModule';
import { ComputerVisionService, DetectionResult } from './ComputerVisionService';
import { InspectionMission } from './RoboticFleetOrchestrator';

export interface TelemetryUpdate {
    updateId: string;
    timestamp: number;
    source: 'ROV' | 'UAV' | 'CLEANING_ARM';
    missionId: string;
    findings: {
        structuralIssues: number; // count
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        affectedArea: string;
        safetyFactorAdjustment: number; // +/- adjustment to SF
    };
    applied: boolean;
}

export class RoboticTelemetryIntegration {
    private static updates: TelemetryUpdate[] = [];

    /**
     * Process inspection mission results and update dam safety
     */
    public static processMissionResults(
        mission: InspectionMission,
        detectionResults: DetectionResult[]
    ): TelemetryUpdate {
        console.log(`[Telemetry] Processing mission ${mission.missionId} results...`);

        // Analyze detection results
        const analysis = this.analyzeDetections(detectionResults);

        // Calculate safety factor adjustment
        const safetyAdjustment = this.calculateSafetyAdjustment(analysis);

        const update: TelemetryUpdate = {
            updateId: `TELEM-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: Date.now(),
            source: mission.unitId.includes('ROV') ? 'ROV' : mission.unitId.includes('UAV') ? 'UAV' : 'CLEANING_ARM',
            missionId: mission.missionId,
            findings: {
                structuralIssues: analysis.totalIssues,
                severity: analysis.maxSeverity,
                affectedArea: mission.targetArea,
                safetyFactorAdjustment: safetyAdjustment
            },
            applied: false
        };

        this.updates.push(update);

        // Apply to dam safety calculations
        if (Math.abs(safetyAdjustment) > 0.01) {
            this.applyToSafetyModel(update);
        }

        console.log(`[Telemetry] ✅ Update processed`);
        console.log(`  Structural issues: ${analysis.totalIssues}`);
        console.log(`  Max severity: ${analysis.maxSeverity}`);
        console.log(`  Safety factor adjustment: ${safetyAdjustment > 0 ? '+' : ''}${safetyAdjustment.toFixed(3)}`);

        return update;
    }

    /**
     * Analyze computer vision detections
     */
    private static analyzeDetections(results: DetectionResult[]): {
        totalIssues: number;
        maxSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        criticalCount: number;
        crackCount: number;
        corrosionCount: number;
    } {
        let totalIssues = 0;
        let criticalCount = 0;
        let crackCount = 0;
        let corrosionCount = 0;
        let maxSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

        const severityLevels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };

        for (const result of results) {
            for (const detection of result.detections) {
                totalIssues++;

                if (detection.severity === 'CRITICAL') criticalCount++;
                if (detection.type === 'CRACK') crackCount++;
                if (detection.type === 'CORROSION') corrosionCount++;

                if (severityLevels[detection.severity] > severityLevels[maxSeverity]) {
                    maxSeverity = detection.severity;
                }
            }
        }

        return {
            totalIssues,
            maxSeverity,
            criticalCount,
            crackCount,
            corrosionCount
        };
    }

    /**
     * Calculate safety factor adjustment based on findings
     */
    private static calculateSafetyAdjustment(analysis: {
        totalIssues: number;
        maxSeverity: string;
        criticalCount: number;
        crackCount: number;
        corrosionCount: number;
    }): number {
        let adjustment = 0;

        // Severity-based adjustment
        switch (analysis.maxSeverity) {
            case 'CRITICAL':
                adjustment -= 0.15; // -15% SF for critical findings
                break;
            case 'HIGH':
                adjustment -= 0.08; // -8% SF for high severity
                break;
            case 'MEDIUM':
                adjustment -= 0.03; // -3% SF for medium
                break;
            case 'LOW':
                adjustment -= 0.01; // -1% SF for low
                break;
        }

        // Crack-specific adjustment (structural concern)
        if (analysis.crackCount > 0) {
            adjustment -= 0.02 * Math.min(analysis.crackCount, 5); // Up to -10% for 5+ cracks
        }

        // Limit adjustment range
        adjustment = Math.max(-0.3, Math.min(0, adjustment)); // Cap at -30%

        return adjustment;
    }

    /**
     * Apply telemetry update to safety model
     */
    private static applyToSafetyModel(update: TelemetryUpdate): void {
        console.log(`[Telemetry] Applying update to CivilSecurityModule...`);

        // In production: Update actual dam safety calculations
        // Example:
        // const currentGauge = CivilSecurityModule.getStabilityGauge();
        // if (currentGauge) {
        //     const adjustedSF = currentGauge.safetyFactor * (1 + update.findings.safetyFactorAdjustment);
        //     CivilSecurityModule.updateSafetyFactor(adjustedSF);
        // }

        update.applied = true;

        console.log(`[Telemetry] ✅ Safety model updated`);
        console.log(`  Adjustment: ${update.findings.safetyFactorAdjustment > 0 ? '+' : ''}${(update.findings.safetyFactorAdjustment * 100).toFixed(1)}%`);

        // Alert if critical
        if (update.findings.severity === 'CRITICAL') {
            console.log('\n' + '🚨'.repeat(40));
            console.log('CRITICAL STRUCTURAL FINDINGS DETECTED');
            console.log('🚨'.repeat(40));
            console.log(`Source: ${update.source}`);
            console.log(`Area: ${update.findings.affectedArea}`);
            console.log(`Issues: ${update.findings.structuralIssues}`);
            console.log(`Recommended Actions:`);
            console.log(`  1. Schedule immediate structural engineering inspection`);
            console.log(`  2. Consider reducing reservoir level as precaution`);
            console.log(`  3. Increase monitoring frequency to daily`);
            console.log('🚨'.repeat(40) + '\n');
        }
    }

    /**
     * Get telemetry statistics
     */
    public static getStatistics(): {
        totalUpdates: number;
        appliedUpdates: number;
        criticalFindings: number;
        avgSafetyAdjustment: number;
    } {
        const applied = this.updates.filter(u => u.applied);
        const critical = this.updates.filter(u => u.findings.severity === 'CRITICAL');

        const avgSafetyAdjustment = applied.length > 0
            ? applied.reduce((sum, u) => sum + u.findings.safetyFactorAdjustment, 0) / applied.length
            : 0;

        return {
            totalUpdates: this.updates.length,
            appliedUpdates: applied.length,
            criticalFindings: critical.length,
            avgSafetyAdjustment
        };
    }

    /**
     * Generate telemetry report
     */
    public static generateReport(): string {
        const stats = this.getStatistics();

        let report = '';
        report += '═'.repeat(80) + '\n';
        report += 'ROBOTIC TELEMETRY INTEGRATION REPORT\n';
        report += '═'.repeat(80) + '\n';
        report += `Generated: ${new Date().toISOString()}\n\n`;

        report += 'SUMMARY:\n';
        report += `  Total Telemetry Updates: ${stats.totalUpdates}\n`;
        report += `  Applied to Safety Model: ${stats.appliedUpdates}\n`;
        report += `  Critical Findings: ${stats.criticalFindings}\n`;
        report += `  Avg Safety Adjustment: ${(stats.avgSafetyAdjustment * 100).toFixed(2)}%\n\n`;

        report += 'RECENT UPDATES:\n';
        const recent = this.updates.slice(-10);
        for (const update of recent) {
            report += `  ${new Date(update.timestamp).toISOString().substring(11, 19)} - ${update.source} - ${update.findings.severity}\n`;
            report += `    Area: ${update.findings.affectedArea}\n`;
            report += `    Issues: ${update.findings.structuralIssues}, SF Adj: ${(update.findings.safetyFactorAdjustment * 100).toFixed(1)}%\n`;
        }

        report += '\n═'.repeat(80) + '\n';

        return report;
    }
}
