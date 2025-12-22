/**
 * ExpertDiagnosisEngine
 * Automated risk assessment and health scoring system
 */

import { AssetIdentity, SensorMatrix } from '../types/assetIdentity';
import {
    ThermalRisk,
    AxialThrustRisk,
    SensorCoverageRisk,
    JackingRisk,
    HealthScore,
    DiagnosticResults,
    Risk,
    Suggestion,
    RiskSeverity,
    LubricationType
} from '../types/diagnostics';

export class ExpertDiagnosisEngine {

    /**
     * Assess thermal expansion risk
     * CRITICAL if: Grease lubrication + Ambient > 30°C + Clearance < 0.10mm
     */
    static assessThermalRisk(
        ambientTempC: number,
        lubrication: LubricationType,
        clearanceMM: number
    ): ThermalRisk {
        if (ambientTempC > 30 && lubrication === 'GREASE') {
            if (clearanceMM < 0.10) {
                return {
                    detected: true,
                    severity: 'CRITICAL',
                    description: 'Thermal expansion risk: Grease lubrication in high ambient temp (>30°C) with tight clearance (<0.10mm). Risk of seizing.',
                    descriptionDE: 'Wärmeausdehnungsrisiko: Schmierfett bei hoher Umgebungstemperatur (>30°C) mit engem Spiel (<0,10mm). Festfressrisiko.'
                };
            } else {
                return {
                    detected: true,
                    severity: 'MEDIUM',
                    description: 'Thermal expansion warning: Monitor clearances closely. Grease expands more than oil at high temperatures.',
                    descriptionDE: 'Wärmeausdehnungswarnung: Spiele genau überwachen. Schmierfett dehnt sich bei hohen Temperaturen stärker aus als Öl.'
                };
            }
        }

        return {
            detected: false,
            severity: 'LOW',
            description: '',
            descriptionDE: ''
        };
    }

    /**
     * Assess Francis axial thrust balance
     * HIGH risk if clearance difference > 15%
     */
    static assessAxialThrust(
        frontClearanceMM: number,
        backClearanceMM: number
    ): AxialThrustRisk {
        const diff = Math.abs(frontClearanceMM - backClearanceMM);
        const avgClearance = (frontClearanceMM + backClearanceMM) / 2;
        const diffPercent = (diff / avgClearance) * 100;

        if (diffPercent > 15) {
            return {
                detected: true,
                frontClearanceMM,
                backClearanceMM,
                differencePercent: diffPercent,
                severity: 'HIGH',
                recommendation: 'Asymmetric clearances (>15% difference) cause unbalanced axial thrust. Inspect thrust bearing and balance chamber pressures.',
                recommendationDE: 'Asymmetrische Spiele (>15% Unterschied) verursachen unausgeglichenen Axialschub. Drucklager und Ausgleichskammerdruck prüfen.'
            };
        } else if (diffPercent > 10) {
            return {
                detected: true,
                frontClearanceMM,
                backClearanceMM,
                differencePercent: diffPercent,
                severity: 'MEDIUM',
                recommendation: 'Minor clearance asymmetry detected. Monitor thrust bearing temperature.',
                recommendationDE: 'Geringe Spiel-Asymmetrie festgestellt. Drucklagertemperatur überwachen.'
            };
        }

        return {
            detected: false,
            frontClearanceMM,
            backClearanceMM,
            differencePercent: diffPercent,
            severity: 'LOW',
            recommendation: '',
            recommendationDE: ''
        };
    }

    /**
     * Assess sensor coverage for Digital Twin readiness
     */
    static assessSensorCoverage(
        sensorMatrix: SensorMatrix
    ): SensorCoverageRisk {
        const requiredLocations = [
            'Generator DE Bearing',
            'Generator NDE Bearing',
            'Turbine Upper Guide Bearing',
            'Turbine Lower Guide Bearing'
        ];

        const installedCount =
            sensorMatrix.vibrationSensors.generator.length +
            sensorMatrix.vibrationSensors.turbine.length;
        const coverage = (installedCount / requiredLocations.length) * 100;

        const missing: string[] = [];
        if (sensorMatrix.vibrationSensors.generator.length === 0) {
            missing.push('Generator bearings');
        }
        if (sensorMatrix.vibrationSensors.turbine.length === 0) {
            missing.push('Turbine bearings');
        }

        let severity: RiskSeverity = 'LOW';
        if (coverage < 50) severity = 'HIGH';
        else if (coverage < 75) severity = 'MEDIUM';

        return {
            coverage,
            missingLocations: missing,
            severity,
            digitalTwinReadiness: coverage,
            suggestion: missing.length > 0
                ? `Install vibration sensors on: ${missing.join(', ')} for complete Digital Twin visibility.`
                : 'Sensor coverage complete for Digital Twin operation.',
            suggestionDE: missing.length > 0
                ? `Schwingungssensoren installieren an: ${missing.join(', ')} für vollständige Digital-Twin-Sichtbarkeit.`
                : 'Sensorabdeckung für Digital-Twin-Betrieb vollständig.'
        };
    }

    /**
     * Validate jacking system for vertical turbines
     * CRITICAL if pressure insufficient for rotor weight
     */
    static assessJackingSystem(
        jackingPressureBar: number,
        rotorWeightTons: number,
        jackingAreaCM2: number = 500  // Default area
    ): JackingRisk {
        // Required pressure = (Weight * g) / Area * safety factor 1.5
        const requiredPressure = ((rotorWeightTons * 1000 * 9.81) / (jackingAreaCM2 * 100)) * 1.5;

        if (jackingPressureBar < requiredPressure * 0.8) {
            return {
                detected: true,
                pressureBar: jackingPressureBar,
                rotorWeightTons,
                requiredPressureBar: requiredPressure,
                severity: 'CRITICAL',
                alarm: `CRITICAL: Jacking pressure ${jackingPressureBar} bar insufficient for rotor weight ${rotorWeightTons}t. Required: ${requiredPressure.toFixed(1)} bar. DO NOT START TURBINE.`,
                alarmDE: `KRITISCH: Jacking-Druck ${jackingPressureBar} bar unzureichend für Rotorgewicht ${rotorWeightTons}t. Erforderlich: ${requiredPressure.toFixed(1)} bar. TURBINE NICHT STARTEN.`
            };
        } else if (jackingPressureBar < requiredPressure) {
            return {
                detected: true,
                pressureBar: jackingPressureBar,
                rotorWeightTons,
                requiredPressureBar: requiredPressure,
                severity: 'MEDIUM',
                alarm: `Jacking pressure slightly low. Increase to ${requiredPressure.toFixed(1)} bar for optimal operation.`,
                alarmDE: `Jacking-Druck etwas niedrig. Auf ${requiredPressure.toFixed(1)} bar erhöhen für optimalen Betrieb.`
            };
        }

        return {
            detected: false,
            pressureBar: jackingPressureBar,
            rotorWeightTons,
            requiredPressureBar: requiredPressure,
            severity: 'LOW',
            alarm: '',
            alarmDE: ''
        };
    }

    /**
     * Calculate overall health score (0-100)
     */
    static calculateHealthScore(
        diagnostics: DiagnosticResults
    ): HealthScore {
        let score = 100;
        const criticalRisks: Risk[] = [];
        const suggestions: Suggestion[] = [];
        const optimized: string[] = [];

        // Thermal deduction
        if (diagnostics.thermalRisk.severity === 'CRITICAL') {
            score -= 30;
            criticalRisks.push({
                type: 'THERMAL',
                severity: 'CRITICAL',
                description: diagnostics.thermalRisk.description,
                descriptionDE: diagnostics.thermalRisk.descriptionDE
            });
        } else if (diagnostics.thermalRisk.severity === 'HIGH') {
            score -= 15;
        } else if (diagnostics.thermalRisk.severity === 'MEDIUM') {
            score -= 5;
        }

        // Axial thrust deduction
        if (diagnostics.axialThrustRisk) {
            if (diagnostics.axialThrustRisk.severity === 'HIGH') {
                score -= 20;
                criticalRisks.push({
                    type: 'MECHANICAL',
                    severity: 'HIGH',
                    description: diagnostics.axialThrustRisk.recommendation,
                    descriptionDE: diagnostics.axialThrustRisk.recommendationDE
                });
            } else if (diagnostics.axialThrustRisk.severity === 'MEDIUM') {
                score -= 10;
                suggestions.push({
                    priority: 'MEDIUM',
                    description: diagnostics.axialThrustRisk.recommendation,
                    descriptionDE: diagnostics.axialThrustRisk.recommendationDE
                });
            }
        }

        // Sensor coverage deduction
        const sensorScore = diagnostics.sensorCoverage.digitalTwinReadiness;
        score = score * (sensorScore / 100);

        if (sensorScore < 75) {
            suggestions.push({
                priority: 'MEDIUM',
                description: diagnostics.sensorCoverage.suggestion,
                descriptionDE: diagnostics.sensorCoverage.suggestionDE,
                estimatedCost: 5000
            });
        } else {
            optimized.push('Sensor coverage complete - Digital Twin ready');
        }

        // Jacking system (if applicable)
        if (diagnostics.jackingRisk && diagnostics.jackingRisk.detected) {
            if (diagnostics.jackingRisk.severity === 'CRITICAL') {
                score -= 40;
                criticalRisks.push({
                    type: 'STARTUP',
                    severity: 'CRITICAL',
                    description: diagnostics.jackingRisk.alarm,
                    descriptionDE: diagnostics.jackingRisk.alarmDE
                });
            } else if (diagnostics.jackingRisk.severity === 'MEDIUM') {
                score -= 10;
                suggestions.push({
                    priority: 'HIGH',
                    description: diagnostics.jackingRisk.alarm,
                    descriptionDE: diagnostics.jackingRisk.alarmDE
                });
            }
        }

        const thermalScore = diagnostics.thermalRisk.severity === 'CRITICAL' ? 0
            : diagnostics.thermalRisk.severity === 'HIGH' ? 50
                : diagnostics.thermalRisk.severity === 'MEDIUM' ? 75
                    : 100;

        const mechanicalScore = diagnostics.axialThrustRisk?.severity === 'HIGH' ? 60
            : diagnostics.axialThrustRisk?.severity === 'MEDIUM' ? 80
                : 100;

        return {
            overall: Math.max(0, Math.round(score)),
            breakdown: {
                thermal: thermalScore,
                mechanical: mechanicalScore,
                hydraulic: 100,  // Will be calculated separately with HydraulicIntelligence
                sensory: sensorScore
            },
            criticalRisks,
            maintenanceSuggestions: suggestions,
            optimizedAreas: optimized
        };
    }

    /**
     * Run complete diagnostic assessment
     */
    static runDiagnostics(
        assetIdentity: AssetIdentity,
        ambientTempC: number,
        lubrication: LubricationType,
        rotorWeightTons?: number
    ): DiagnosticResults {
        // Thermal risk
        const avgClearance = assetIdentity.francisAdvanced
            ? (assetIdentity.francisAdvanced.frontRunnerClearanceMM + assetIdentity.francisAdvanced.backRunnerClearanceMM) / 2
            : 0.40;  // Default

        const thermalRisk = this.assessThermalRisk(ambientTempC, lubrication, avgClearance);

        // Axial thrust (Francis only)
        const axialThrustRisk = assetIdentity.francisAdvanced
            ? this.assessAxialThrust(
                assetIdentity.francisAdvanced.frontRunnerClearanceMM,
                assetIdentity.francisAdvanced.backRunnerClearanceMM
            )
            : undefined;

        // Sensor coverage
        const sensorCoverage = this.assessSensorCoverage(assetIdentity.sensorMatrix);

        // Jacking system (Vertical only)
        const jackingRisk = assetIdentity.shaftJacking && rotorWeightTons
            ? this.assessJackingSystem(
                assetIdentity.shaftJacking.systemPressureBar,
                rotorWeightTons
            )
            : undefined;

        return {
            thermalRisk,
            axialThrustRisk,
            sensorCoverage,
            jackingRisk,
            timestamp: new Date().toISOString()
        };
    }
}
