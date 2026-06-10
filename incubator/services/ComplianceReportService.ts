/**
 * ComplianceReportService.ts
 * 
 * IEEE/IEC Compliance Report Generator
 * Formats test results into standard "Grid Code Compliance" documentation.
 */

import { RejectionEvent } from './LoadRejectionAnalyser';
import { StepResult } from './StepResponseValidator';

export class ComplianceReportService {

    public static generateReport(
        unitId: string,
        rejectionResult: RejectionEvent | null,
        stepResults: StepResult[]
    ): string {
        const date = new Date().toISOString().split('T')[0];

        let report = `# GRID CODE COMPLIANCE REPORT\n`;
        report += `**Unit:** ${unitId}\n`;
        report += `**Date:** ${date}\n`;
        report += `**Standard:** IEEE 421.5 / IEC 61362\n\n`;

        report += `## 1. LOAD REJECTION TEST\n`;
        if (rejectionResult) {
            report += `- **Result:** ${rejectionResult.passed ? 'PASSED ✅' : 'FAILED ❌'}\n`;
            report += `- **Peak Overspeed:** ${rejectionResult.peakSpeedPct.toFixed(2)}% (Limit: ${rejectionResult.limits.maxSpeed}%)\n`;
            report += `- **Peak Pressure:** ${rejectionResult.peakPressureBar.toFixed(1)} bar (Limit: ${rejectionResult.limits.maxPressure} bar)\n`;
            report += `- **Settling Time:** ${rejectionResult.settlingTimeSec.toFixed(1)} s\n\n`;
        } else {
            report += `*No recent test data.*\n\n`;
        }

        report += `## 2. GOVERNOR STEP RESPONSE\n`;
        const speedStep = stepResults.find(s => s.axis === 'SPEED');
        if (speedStep) {
            report += `- **Damping Ratio:** ${speedStep.dampingRatio.toFixed(3)}\n`;
            report += `- **Rise Time:** ${speedStep.riseTimeSec.toFixed(2)} s\n`;
            report += `- **Overshoot:** ${speedStep.overshootPct.toFixed(1)}%\n`;
            report += `- **Assessment:** ${speedStep.status}\n\n`;
        } else {
            report += `*No recent test data.*\n\n`;
        }

        report += `## 3. CONCLUSION\n`;
        const allPassed = (rejectionResult?.passed ?? false) &&
            (speedStep?.status !== 'OSCILLATORY');

        if (allPassed) {
            report += `Unit ${unitId} demonstrates full compliance with grid stability requirements.\n`;
            report += `**CERTIFIED READY FOR COMMERCIAL OPERATION.**\n`;
        } else {
            report += `Unit ${unitId} requires tuning. See defects above.\n`;
        }

        return report;
    }
}
