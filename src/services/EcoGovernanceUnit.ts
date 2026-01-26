/**
 * EcoGovernanceUnit.ts
 * 
 * Environmental Compliance & Ecological Monitoring
 * Tracks environmental flow (E-flow) and dissolved oxygen
 * Ensures biological compliance as a hard KPI
 */

export interface EnvironmentalFlowData {
    timestamp: number;
    requiredEflow: number; // m³/s (legal requirement)
    actualFlow: number; // m³/s (current release)
    compliance: boolean;
    deficit: number; // m³/s (if non-compliant)
}

export interface WaterQualityData {
    timestamp: number;
    dissolvedOxygen: number; // mg/L
    temperature: number; // °C
    pH: number;
    turbidity: number; // NTU
    compliance: boolean;
}

export interface BiologicalCompliance {
    eflowCompliance: number; // % compliance over period
    doCompliance: number; // % time DO > 5 mg/L
    overallCompliance: number; // %
    violationCount: number;
    lastViolation: number; // timestamp
}

export class EcoGovernanceUnit {
    private static eflowHistory: EnvironmentalFlowData[] = [];
    private static waterQualityHistory: WaterQualityData[] = [];
    private static readonly DO_THRESHOLD = 5.0; // mg/L
    private static readonly EFLOW_MONITORING_PERIOD_DAYS = 30;

    /**
     * Monitor environmental flow compliance
     */
    public static monitorEnvironmentalFlow(
        requiredEflow: number,
        actualFlow: number
    ): EnvironmentalFlowData {
        const compliance = actualFlow >= requiredEflow;
        const deficit = compliance ? 0 : requiredEflow - actualFlow;

        const data: EnvironmentalFlowData = {
            timestamp: Date.now(),
            requiredEflow,
            actualFlow,
            compliance,
            deficit
        };

        this.eflowHistory.push(data);

        // Keep last 30 days
        const cutoff = Date.now() - this.EFLOW_MONITORING_PERIOD_DAYS * 24 * 60 * 60 * 1000;
        this.eflowHistory = this.eflowHistory.filter(d => d.timestamp >= cutoff);

        if (!compliance) {
            console.log(`[EcoGov] ⚠️ E-FLOW VIOLATION: Required ${requiredEflow.toFixed(1)} m³/s, Actual ${actualFlow.toFixed(1)} m³/s`);
        }

        return data;
    }

    /**
     * Monitor water quality and trigger interventions
     */
    public static monitorWaterQuality(data: Omit<WaterQualityData, 'compliance' | 'timestamp'>): {
        qualityData: WaterQualityData;
        actionRequired: boolean;
        action?: string;
    } {
        const compliance = data.dissolvedOxygen >= this.DO_THRESHOLD;

        const qualityData: WaterQualityData = {
            timestamp: Date.now(),
            ...data,
            compliance
        };

        this.waterQualityHistory.push(qualityData);

        // Keep last 30 days
        const cutoff = Date.now() - this.EFLOW_MONITORING_PERIOD_DAYS * 24 * 60 * 60 * 1000;
        this.waterQualityHistory = this.waterQualityHistory.filter(d => d.timestamp >= cutoff);

        let actionRequired = false;
        let action: string | undefined;

        // Trigger Francis air injection if DO < 5 mg/L
        if (data.dissolvedOxygen < this.DO_THRESHOLD) {
            actionRequired = true;
            action = 'FRANCIS_AIR_INJECTION';

            console.log(`[EcoGov] 🚨 LOW DISSOLVED OXYGEN: ${data.dissolvedOxygen.toFixed(1)} mg/L`);
            console.log(`[EcoGov] 🔧 TRIGGERING: Francis turbine air injection for aeration`);

            this.triggerFrancisAirInjection();
        }

        // Additional checks
        if (data.temperature > 25) {
            console.log(`[EcoGov] ⚠️ HIGH WATER TEMPERATURE: ${data.temperature.toFixed(1)}°C`);
        }

        if (data.pH < 6.5 || data.pH > 8.5) {
            console.log(`[EcoGov] ⚠️ pH OUT OF RANGE: ${data.pH.toFixed(1)}`);
        }

        return { qualityData, actionRequired, action };
    }

    /**
     * Trigger Francis turbine air injection for water aeration
     */
    private static triggerFrancisAirInjection(): void {
        console.log('[EcoGov] Activating air injection system:');
        console.log('  - Target units: UNIT-1, UNIT-2 (Francis turbines)');
        console.log('  - Air flow rate: 300 m³/h');
        console.log('  - Purpose: Increase dissolved oxygen in discharge');
        console.log('  - Expected DO increase: +2 mg/L within 30 minutes');

        // In production: Send command to Francis turbines
        // FrancisOptimizer.activateAirInjection('UNIT-1', 300);
        // FrancisOptimizer.activateAirInjection('UNIT-2', 300);
    }

    /**
     * Calculate biological compliance KPI
     */
    public static calculateBiologicalCompliance(): BiologicalCompliance {
        const now = Date.now();
        const periodStart = now - this.EFLOW_MONITORING_PERIOD_DAYS * 24 * 60 * 60 * 1000;

        // E-flow compliance
        const eflowData = this.eflowHistory.filter(d => d.timestamp >= periodStart);
        const eflowCompliant = eflowData.filter(d => d.compliance).length;
        const eflowCompliance = eflowData.length > 0
            ? (eflowCompliant / eflowData.length) * 100
            : 100;

        // DO compliance
        const doData = this.waterQualityHistory.filter(d => d.timestamp >= periodStart);
        const doCompliant = doData.filter(d => d.compliance).length;
        const doCompliance = doData.length > 0
            ? (doCompliant / doData.length) * 100
            : 100;

        // Overall compliance (weighted average)
        const overallCompliance = (eflowCompliance * 0.6 + doCompliance * 0.4);

        // Violation count
        const violations = [
            ...eflowData.filter(d => !d.compliance),
            ...doData.filter(d => !d.compliance)
        ];
        const violationCount = violations.length;
        const lastViolation = violations.length > 0
            ? Math.max(...violations.map(v => v.timestamp))
            : 0;

        return {
            eflowCompliance,
            doCompliance,
            overallCompliance,
            violationCount,
            lastViolation
        };
    }

    /**
     * Get environmental status report
     */
    public static getEnvironmentalStatus(): {
        currentEflow: EnvironmentalFlowData | null;
        currentQuality: WaterQualityData | null;
        compliance: BiologicalCompliance;
        status: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
    } {
        const currentEflow = this.eflowHistory.length > 0
            ? this.eflowHistory[this.eflowHistory.length - 1]
            : null;

        const currentQuality = this.waterQualityHistory.length > 0
            ? this.waterQualityHistory[this.waterQualityHistory.length - 1]
            : null;

        const compliance = this.calculateBiologicalCompliance();

        let status: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
        if (compliance.overallCompliance >= 95) {
            status = 'COMPLIANT';
        } else if (compliance.overallCompliance >= 85) {
            status = 'WARNING';
        } else {
            status = 'VIOLATION';
        }

        return { currentEflow, currentQuality, compliance, status };
    }

    /**
     * Generate compliance report
     */
    public static generateComplianceReport(): string {
        const status = this.getEnvironmentalStatus();
        const compliance = status.compliance;

        let report = '';
        report += '═'.repeat(80) + '\n';
        report += 'ENVIRONMENTAL COMPLIANCE REPORT\n';
        report += '═'.repeat(80) + '\n\n';

        report += `Overall Status: ${status.status}\n`;
        report += `Compliance Score: ${compliance.overallCompliance.toFixed(1)}%\n\n`;

        report += 'E-FLOW COMPLIANCE:\n';
        report += `  Compliance Rate: ${compliance.eflowCompliance.toFixed(1)}%\n`;
        if (status.currentEflow) {
            report += `  Current Release: ${status.currentEflow.actualFlow.toFixed(1)} m³/s\n`;
            report += `  Required: ${status.currentEflow.requiredEflow.toFixed(1)} m³/s\n`;
        }
        report += '\n';

        report += 'WATER QUALITY COMPLIANCE:\n';
        report += `  DO Compliance Rate: ${compliance.doCompliance.toFixed(1)}%\n`;
        if (status.currentQuality) {
            report += `  Current DO: ${status.currentQuality.dissolvedOxygen.toFixed(1)} mg/L\n`;
            report += `  Threshold: ${this.DO_THRESHOLD} mg/L\n`;
        }
        report += '\n';

        report += `Total Violations (30 days): ${compliance.violationCount}\n`;
        if (compliance.lastViolation > 0) {
            report += `Last Violation: ${new Date(compliance.lastViolation).toISOString()}\n`;
        }

        report += '═'.repeat(80) + '\n';

        return report;
    }
}
