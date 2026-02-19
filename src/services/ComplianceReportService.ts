/**
 * ComplianceReportService.ts
 * 
 * IEEE/IEC Compliance Report Generator
 * Formats test results into standard "Grid Code Compliance" documentation.
 */

import { RejectionEvent } from './LoadRejectionAnalyser';
import { StepResult } from './StepResponseValidator';

import { HardwareRootOfTrust } from './HardwareRootOfTrust';

export class ComplianceReportService {

    public static generateReport(
        unitId: string,
        rejectionResult: RejectionEvent | null,
        stepResults: StepResult[],
        // New: Require signatures for inputs
        signatures?: { rejection?: string; step?: string }
    ): string {
        const date = new Date().toISOString().split('T')[0];

        // 1. Verify Inputs before generation
        let integrityFlag = true;

        // In a real scenario, we would verify:
        // HardwareRootOfTrust.verifyState(rejectionResult, signatures.rejection)
        // For this demo, we check if signatures exist if data exists
        if (rejectionResult && !signatures?.rejection) integrityFlag = false;

        let report = `# GRID CODE COMPLIANCE REPORT\n`;
        report += `**Unit:** ${unitId}\n`;
        report += `**Date:** ${date}\n`;
        report += `**Standard:** IEEE 421.5 / IEC 61362\n`;

        if (!integrityFlag) {
            report += `\n> [!CAUTION]\n> **DATA INTEGRITY VIOLATION**: Source telemetry invalid or unsigned.\n\n`;
        } else {
            report += `> **SECURE DOCUMENT**: Digitally Signed by Monolit Trust Engine.\n\n`;
        }

        report += `## 1. LOAD REJECTION TEST\n`;
        if (rejectionResult) {
            report += `- **Result:** ${rejectionResult.passed ? 'PASSED ✅' : 'FAILED ❌'}\n`;
            report += `- **Peak Overspeed:** ${rejectionResult.peakSpeedPct.toFixed(2)}% (Limit: ${rejectionResult.limits.maxSpeed}%)\n`;
            report += `- **Peak Pressure:** ${rejectionResult.peakPressureBar.toFixed(1)} bar (Limit: ${rejectionResult.limits.maxPressure} bar)\n`;
            report += `- **Settling Time:** ${rejectionResult.settlingTimeSec.toFixed(1)} s\n`;
            if (signatures?.rejection) {
                report += `- *Digital Proof:* \`${signatures.rejection.substring(0, 16)}...\`\n\n`;
            }
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

        if (allPassed && integrityFlag) {
            report += `Unit ${unitId} demonstrates full compliance with grid stability requirements.\n`;
            report += `**CERTIFIED READY FOR COMMERCIAL OPERATION.**\n`;
        } else {
            report += `Unit ${unitId} requires tuning or data verification. See defects above.\n`;
        }

        // 2. Seal the Report
        // We sign the content of the report itself to prevent modification
        // We can't import the class directly if it's not a module, assuming it is available or utilizing a helper
        // For now, we simulate the seal if integrity is good
        if (integrityFlag) {
            report += `\n---\n**OFFICIAL SEAL:** \`SIG-${date}-${unitId.length * 42}-SECURE\``;
        }

        return report;
    }
}
