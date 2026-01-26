import { FrancisHorizontalEngine } from '../lib/engines/FrancisHorizontalEngine';
import { TelemetryStream, HealthCheckResult } from '../lib/engines/BaseTurbineEngine';
import { HydraulicStream, MechanicalStream } from '../core/TechnicalSchema';

/**
 * Health Diagnostic Service for Francis Horizontal Turbine
 * Detects critical faults and provides actionable recommendations
 */
export class FrancisHealthDiagnostics {
    private engine: FrancisHorizontalEngine;

    constructor() {
        this.engine = new FrancisHorizontalEngine();
    }

    /**
     * THE HEALTHY HEARTBEAT CHECK
     * 
     * Checks if the turbine is behaving normally or has critical faults
     * 
     * Special Case: Water flowing but RPM = 0
     * This is a CRITICAL FAULT indicating:
     * - Shaft coupling failure
     * - Brake engaged while running
     * - Generator disconnection
     * - Catastrophic bearing seizure
     */
    runHealthCheck(telemetry: TelemetryStream): HealthCheckResult {
        // Use the base engine's health assessment
        const healthCheck = this.engine.assessHealthScore(telemetry);

        // Add Francis-specific checks
        this.checkCavitation(telemetry, healthCheck);
        this.checkGuideVanes(telemetry, healthCheck);
        this.checkUnderExcitation(telemetry, healthCheck);

        return healthCheck;
    }

    /**
     * CRITICAL FAULT: Zero RPM with Flow
     * 
     * What the boss sees:
     * 🔴 EMERGENCY - TURBINE SHAFT FAILURE SUSPECTED
     */
    checkZeroRPMWithFlow(telemetry: TelemetryStream): HealthCheckResult | null {
        const flow = telemetry.hydraulic.flow;
        const rpm = telemetry.mechanical.rpm;

        if (flow > 1 && rpm === 0) {
            return {
                healthScore: 0,
                status: 'FAULT',
                diagnosticCode: 'R-CRIT',
                alerts: [
                    {
                        severity: 'CRITICAL',
                        message: '🚨 EMERGENCY: Water flowing but turbine not rotating',
                        parameter: 'rpm',
                        currentValue: rpm,
                        threshold: 600,
                        recommendation: 'IMMEDIATE SHUTDOWN REQUIRED. Possible shaft coupling failure, brake malfunction, or catastrophic bearing seizure. DO NOT ATTEMPT TO RESTART.'
                    },
                    {
                        severity: 'CRITICAL',
                        message: `Water flow detected: ${flow.toFixed(1)} m³/s with zero shaft speed`,
                        parameter: 'flow',
                        currentValue: flow,
                        threshold: 0
                    }
                ]
            };
        }

        return null;
    }

    /**
     * Check for cavitation risk
     */
    private checkCavitation(telemetry: TelemetryStream, healthCheck: HealthCheckResult) {
        const specialized = this.engine.getSpecializedMetrics(telemetry);
        const sigma = specialized.cavitationIndex;

        // Francis turbines need σ > 0.1 typically
        if (sigma < 0.08) {
            healthCheck.healthScore -= 25;
            healthCheck.alerts.push({
                severity: 'CRITICAL',
                message: 'Cavitation risk - Thoma number below safe threshold',
                parameter: 'cavitation_index',
                currentValue: sigma,
                threshold: 0.1,
                recommendation: 'Reduce load or increase tailwater level to prevent runner damage'
            });
        } else if (sigma < 0.1) {
            healthCheck.healthScore -= 10;
            healthCheck.alerts.push({
                severity: 'WARNING',
                message: 'Approaching cavitation zone',
                parameter: 'cavitation_index',
                currentValue: sigma,
                threshold: 0.1
            });
        }
    }

    /**
     * Check guide vane operation
     */
    private checkGuideVanes(telemetry: TelemetryStream, healthCheck: HealthCheckResult) {
        const guideVaneOpening = telemetry.hydraulic.guideVaneOpening || 0;
        const flow = telemetry.hydraulic.flow;
        const ratedFlow = 12; // m³/s

        const expectedOpening = (flow / ratedFlow) * 100;
        const deviation = Math.abs(guideVaneOpening - expectedOpening);

        if (deviation > 20) {
            healthCheck.healthScore -= 15;
            healthCheck.alerts.push({
                severity: 'WARNING',
                message: 'Guide vane position inconsistent with flow rate',
                parameter: 'guide_vane_position',
                currentValue: guideVaneOpening,
                threshold: expectedOpening,
                recommendation: 'Check servomotor calibration and linkage for mechanical binding'
            });
        }
    }

    /**
     * Check for generator under-excitation (low power factor)
     */
    private checkUnderExcitation(telemetry: TelemetryStream, healthCheck: HealthCheckResult) {
        // This would require reactive power data in real telemetry
        // Placeholder for demonstration
        const powerOutput = this.engine.getPowerOutput(telemetry);

        if (powerOutput > 0 && powerOutput < 500) {
            healthCheck.alerts.push({
                severity: 'INFO',
                message: 'Low load operation - monitor bearing temperatures',
                parameter: 'power',
                currentValue: powerOutput,
                threshold: 500
            });
        }
    }

    /**
     * Generate human-readable status message for the boss
     */
    getStatusMessageForBoss(healthCheck: HealthCheckResult): string {
        if (healthCheck.status === 'HEALTHY') {
            return `✅ Unit operating normally. Health score: ${healthCheck.healthScore}/100`;
        }

        if (healthCheck.status === 'WARNING') {
            const topAlert = healthCheck.alerts[0];
            return `⚠️ CAUTION: ${topAlert.message}. Health score: ${healthCheck.healthScore}/100. ${topAlert.recommendation || 'Monitor closely.'}`;
        }

        if (healthCheck.status === 'CRITICAL') {
            const criticalAlerts = healthCheck.alerts.filter(a => a.severity === 'CRITICAL');
            return `🔴 CRITICAL: ${criticalAlerts.length} critical issue(s) detected. Health score: ${healthCheck.healthScore}/100. IMMEDIATE ACTION REQUIRED: ${criticalAlerts[0].recommendation}`;
        }

        if (healthCheck.status === 'FAULT') {
            return `🚨 EMERGENCY SHUTDOWN REQUIRED! ${healthCheck.alerts[0].message}. ${healthCheck.alerts[0].recommendation}`;
        }

        return 'Unknown status';
    }
}

/**
 * ========================================
 * DEMONSTRATION EXAMPLE
 * ========================================
 */

// Scenario 1: HEALTHY operation
export function demonstrateHealthyOperation() {
    const diagnostics = new FrancisHealthDiagnostics();

    const healthyTelemetry: TelemetryStream = {
        timestamp: Date.now(),
        hydraulic: {
            flow: 11.5,           // Near rated
            head: 82,             // Close to design
            pressure: 8.2,
            guideVaneOpening: 88
        } as any,
        mechanical: {
            rpm: 600,             // Perfect synchronous speed
            vibrationX: 1.8,      // Low vibration
            vibrationY: 1.5,
            bearingTemp: 52       // Normal temperature
        } as any
    };

    const result = diagnostics.runHealthCheck(healthyTelemetry);
    console.log('=== HEALTHY SCENARIO ===');
    console.log(diagnostics.getStatusMessageForBoss(result));
    console.log('Alerts:', result.alerts);
    console.log();

    return result;
}

// Scenario 2: CRITICAL FAULT - Zero RPM with flow!
export function demonstrateZeroRPMFault() {
    const diagnostics = new FrancisHealthDiagnostics();

    const faultTelemetry: TelemetryStream = {
        timestamp: Date.now(),
        hydraulic: {
            flow: 8.5,            // 🌊 WATER IS FLOWING!
            head: 80,
            pressure: 8.0,
            guideVaneOpening: 70
        } as any,
        mechanical: {
            rpm: 0,               // 🚨 BUT TURBINE NOT SPINNING!
            vibrationX: 0,        // No vibration because not rotating
            vibrationY: 0,
            bearingTemp: 45       // Temperature still normal initially
        } as any
    };

    const result = diagnostics.runHealthCheck(faultTelemetry);
    console.log('=== CRITICAL FAULT: ZERO RPM WITH FLOW ===');
    console.log(diagnostics.getStatusMessageForBoss(result));
    console.log('Diagnostic Code:', result.diagnosticCode);
    console.log('Alerts:');
    result.alerts.forEach(alert => {
        console.log(`  [${alert.severity}] ${alert.message}`);
        if (alert.recommendation) {
            console.log(`    → ${alert.recommendation}`);
        }
    });
    console.log();

    return result;
}

// Scenario 3: WARNING - High vibration
export function demonstrateHighVibration() {
    const diagnostics = new FrancisHealthDiagnostics();

    const vibrationTelemetry: TelemetryStream = {
        timestamp: Date.now(),
        hydraulic: {
            flow: 10.2,
            head: 78,
            pressure: 7.8,
            guideVaneOpening: 82
        } as any,
        mechanical: {
            rpm: 598,             // Slight slip
            vibrationX: 5.8,      // ⚠️ Elevated vibration
            vibrationY: 4.2,
            bearingTemp: 68       // ⚠️ Warm bearings
        } as any
    };

    const result = diagnostics.runHealthCheck(vibrationTelemetry);
    console.log('=== WARNING: HIGH VIBRATION ===');
    console.log(diagnostics.getStatusMessageForBoss(result));
    console.log('Health Score:', result.healthScore);
    console.log();

    return result;
}

/**
 * WHAT THE BOSS SEES IN THE DASHBOARD
 * 
 * ```
 * === HEALTHY SCENARIO ===
 * ✅ Unit operating normally. Health score: 100/100
 * 
 * === CRITICAL FAULT: ZERO RPM WITH FLOW ===
 * 🚨 EMERGENCY SHUTDOWN REQUIRED! 
 * Water flowing but turbine not rotating
 * IMMEDIATE SHUTDOWN REQUIRED. Possible shaft coupling failure, 
 * brake malfunction, or catastrophic bearing seizure. 
 * DO NOT ATTEMPT TO RESTART.
 * 
 * === WARNING: HIGH VIBRATION ===
 * ⚠️ CAUTION: Vibration above acceptable range. 
 * Health score: 80/100. Schedule balancing or alignment check.
 * ```
 */

// Run demonstrations if this file is executed directly
if (require.main === module) {
    demonstrateHealthyOperation();
    demonstrateZeroRPMFault();
    demonstrateHighVibration();
}
