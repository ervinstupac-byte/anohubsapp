import { HydraulicStream, MechanicalStream } from '../../core/TechnicalSchema';
import BaseGuardian from '../../services/BaseGuardian';

/**
 * Universal telemetry interface - every turbine must provide these 5 core metrics
 */
export interface UniversalTelemetry {
    rpm: number;           // Rotational speed
    powerKW: number;       // Mechanical power output
    efficiency: number;    // Hydraulic efficiency (0-100%)
    vibrationRMS: number;  // Overall vibration magnitude (mm/s)
    temperature: number;   // Critical component temperature (°C)
}

/**
 * Telemetry stream combining hydraulic and mechanical data
 */
export interface TelemetryStream {
    timestamp: number;
    hydraulic: HydraulicStream;
    mechanical: MechanicalStream;
    physics?: any;
    identity?: any;
}

/**
 * Health assessment result
 */
export interface HealthCheckResult {
    healthScore: number;        // 0-100
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'FAULT';
    alerts: HealthAlert[];
    diagnosticCode?: string;
}

export interface HealthAlert {
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    parameter: string;
    currentValue: number;
    threshold: number;
    recommendation?: string;
}

/**
 * Abstract base class for all turbine engines
 * Defines the universal contract that every turbine type must implement
 * 
 * The 5 Universal Whispers:
 * 1. RPM - Fundamental rotational speed
 * 2. Power - Energy output
 * 3. Efficiency - Performance indicator
 * 4. Vibration - Health/condition metric
 * 5. Temperature - Thermal health
 */
export abstract class BaseTurbineEngine extends BaseGuardian {
    abstract readonly turbineType: string;
    abstract readonly variant: string;  // e.g., 'horizontal', 'vertical', 'bulb'

    // ========================================
    // THE 5 UNIVERSAL WHISPERS (REQUIRED)
    // ========================================

    /**
     * 1. ROTATIONAL SPEED (RPM)
     * Every turbine has a rotating shaft
     */
    abstract getRPM(telemetry: TelemetryStream): number;

    /**
     * 2. MECHANICAL POWER OUTPUT (kW)
     * Universal measure of energy conversion
     */
    abstract getPowerOutput(telemetry: TelemetryStream): number;

    /**
     * 3. HYDRAULIC EFFICIENCY (%)
     * Core performance metric for all hydro machines
     */
    abstract getEfficiency(telemetry: TelemetryStream): number;

    /**
     * 4. VIBRATION MAGNITUDE (mm/s RMS)
     * Critical health indicator across all rotating machinery
     * Combines X, Y, Z axes into single RMS value
     */
    abstract getVibration(telemetry: TelemetryStream): number;

    /**
     * 5. OPERATING TEMPERATURE (°C)
     * Thermal health - bearings, oil, windings
     */
    abstract getTemperature(telemetry: TelemetryStream): number;

    // ========================================
    // UNIVERSAL METHODS (PROVIDED)
    // ========================================

    /**
     * Get all 5 universal metrics at once
     */
    getUniversalMetrics(telemetry: TelemetryStream): UniversalTelemetry {
        return {
            rpm: this.getRPM(telemetry),
            powerKW: this.getPowerOutput(telemetry),
            efficiency: this.getEfficiency(telemetry),
            vibrationRMS: this.getVibration(telemetry),
            temperature: this.getTemperature(telemetry)
        };
    }

    /**
     * Calculate mechanical torque from power and RPM
     */
    calculateTorque(powerKW: number, rpm: number): number {
        if (rpm === 0) return 0;
        return (powerKW * 9549) / rpm; // Nm
    }

    /**
     * Assess overall health score based on universal metrics
     * Returns 0-100 score where 100 is perfect health
     */
    assessHealthScore(telemetry: TelemetryStream): HealthCheckResult {
        const metrics = this.getUniversalMetrics(telemetry);
        const alerts: HealthAlert[] = [];
        let healthScore = 100;

        // Check RPM against expected
        const expectedRPM = this.getExpectedRPM(telemetry);
        if (metrics.rpm === 0 && telemetry.hydraulic.flow > 1) {
            // CRITICAL: Water flowing but not spinning!
            healthScore = 0;
            alerts.push({
                severity: 'CRITICAL',
                message: 'Turbine not rotating despite water flow - shaft coupling failure suspected',
                parameter: 'rpm',
                currentValue: metrics.rpm,
                threshold: expectedRPM,
                recommendation: 'EMERGENCY SHUTDOWN - Inspect shaft, coupling, and brake system'
            });
        } else if (Math.abs(metrics.rpm - expectedRPM) > expectedRPM * 0.1) {
            // WARNING: RPM deviation >10%
            healthScore -= 15;
            alerts.push({
                severity: 'WARNING',
                message: `RPM deviation: ${((metrics.rpm - expectedRPM) / expectedRPM * 100).toFixed(1)}%`,
                parameter: 'rpm',
                currentValue: metrics.rpm,
                threshold: expectedRPM
            });
        }

        // Check vibration against ISO 20816
        if (metrics.vibrationRMS > 11.2) {
            // CRITICAL: Severe vibration
            healthScore -= 40;
            alerts.push({
                severity: 'CRITICAL',
                message: 'Vibration exceeds ISO 20816-5 alarm threshold',
                parameter: 'vibration',
                currentValue: metrics.vibrationRMS,
                threshold: 11.2,
                recommendation: 'Shutdown required for mechanical inspection'
            });
        } else if (metrics.vibrationRMS > 7.1) {
            // WARNING: Elevated vibration
            healthScore -= 20;
            alerts.push({
                severity: 'WARNING',
                message: 'Vibration above acceptable range',
                parameter: 'vibration',
                currentValue: metrics.vibrationRMS,
                threshold: 7.1,
                recommendation: 'Schedule balancing or alignment check'
            });
        }

        // Check temperature
        if (metrics.temperature > 90) {
            // CRITICAL: Overheating
            healthScore -= 30;
            alerts.push({
                severity: 'CRITICAL',
                message: 'Bearing temperature critical',
                parameter: 'temperature',
                currentValue: metrics.temperature,
                threshold: 90,
                recommendation: 'Check lubrication system immediately'
            });
        } else if (metrics.temperature > 75) {
            // WARNING: Hot
            healthScore -= 15;
            alerts.push({
                severity: 'WARNING',
                message: 'Elevated bearing temperature',
                parameter: 'temperature',
                currentValue: metrics.temperature,
                threshold: 75
            });
        }

        // Check efficiency
        if (metrics.efficiency < 75) {
            healthScore -= 20;
            alerts.push({
                severity: 'WARNING',
                message: 'Efficiency degradation detected',
                parameter: 'efficiency',
                currentValue: metrics.efficiency,
                threshold: 85,
                recommendation: 'Inspect runner for wear or cavitation damage'
            });
        }

        // Determine overall status
        let status: HealthCheckResult['status'];
        if (healthScore >= 90) status = 'HEALTHY';
        else if (healthScore >= 70) status = 'WARNING';
        else if (healthScore >= 40) status = 'CRITICAL';
        else status = 'FAULT';

        return {
            healthScore: Math.max(0, healthScore),
            status,
            alerts,
            diagnosticCode: this.generateDiagnosticCode(alerts)
        };
    }

    /**
     * Generate diagnostic code from alerts (e.g., "HVTE" = High Vibration, Temperature, Efficiency)
     */
    private generateDiagnosticCode(alerts: HealthAlert[]): string {
        const codes: string[] = [];
        alerts.forEach(alert => {
            if (alert.parameter === 'rpm') codes.push('R');
            if (alert.parameter === 'vibration') codes.push('V');
            if (alert.parameter === 'temperature') codes.push('T');
            if (alert.parameter === 'efficiency') codes.push('E');
            if (alert.parameter === 'power') codes.push('P');
        });
        return codes.length > 0 ? codes.join('') : 'OK';
    }

    // ========================================
    // OPTIONAL OVERRIDES
    // ========================================

    /**
     * Calculate expected RPM based on synchronous speed
     * Override in subclass for specific generator configurations
     */
    protected getExpectedRPM(telemetry: TelemetryStream): number {
        // Default: use actual RPM as expected (can be overridden)
        return telemetry.mechanical.rpm || 500;
    }

    /**
     * Get turbine-specific specialized metrics
     * Override in subclass to provide custom calculations
     */
    getSpecializedMetrics?(telemetry: TelemetryStream): Record<string, number>;

    // Default confidence reporting for turbine engines
    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
