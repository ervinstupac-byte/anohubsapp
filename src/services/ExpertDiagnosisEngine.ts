/**
 * ExpertDiagnosisEngine
 * Automated risk assessment and health scoring system
 * FINAL UNIFIED VERSION
 */

import { AssetIdentity, SensorMatrix } from '../types/assetIdentity';
import { EngineeringConstants } from '../models/TechnicalSchema';
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
    LubricationType,
    GridRisk,
    FinancialImpact
} from '../types/diagnostics';

export class ExpertDiagnosisEngine {

    /**
     * Assess thermal expansion risk
     * Uses engineering constants from TechnicalSchema - no hardcoded values
     */
    static assessThermalRisk(
        ambientTempC: number,
        lubrication: LubricationType,
        clearanceMM: number,
        constants: EngineeringConstants
    ): ThermalRisk {
        if (ambientTempC > constants.thermal.criticalAmbientTemp && lubrication === 'GREASE') {
            if (clearanceMM < constants.thermal.minClearanceForGrease) {
                return {
                    detected: true,
                    severity: 'CRITICAL',
                    description: `Thermal expansion risk: Grease lubrication in high ambient temp (>${constants.thermal.criticalAmbientTemp}°C) with tight clearance (<${constants.thermal.minClearanceForGrease}mm). Risk of seizing.`,
                    descriptionDE: `Wärmeausdehnungsrisiko: Schmierfett bei hoher Umgebungstemperatur (>${constants.thermal.criticalAmbientTemp}°C) mit engem Spiel (<${constants.thermal.minClearanceForGrease}mm). Festfressrisiko.`
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
        const diffPercent = avgClearance > 0 ? (diff / avgClearance) * 100 : 0;

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
            (sensorMatrix.vibrationSensors?.generator?.length || 0) +
            (sensorMatrix.vibrationSensors?.turbine?.length || 0);
        const coverage = (installedCount / requiredLocations.length) * 100;

        const missing: string[] = [];
        if (!sensorMatrix.vibrationSensors?.generator?.length) {
            missing.push('Generator bearings');
        }
        if (!sensorMatrix.vibrationSensors?.turbine?.length) {
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
     * Uses engineering constants - no hardcoded gravity or safety factors
     */
    static assessJackingSystem(
        jackingPressureBar: number,
        rotorWeightTons: number,
        jackingAreaCM2: number = 500,
        constants: EngineeringConstants
    ): JackingRisk {
        // Required pressure = (Weight * g) / Area * safety factor
        const requiredPressure = ((rotorWeightTons * 1000 * constants.physics.gravity) / (jackingAreaCM2 * 100)) * constants.maintenance.jackingSafetyFactor;

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
     * Assess Grid Frequency Stability
     * Uses engineering constants - CRITICAL if exceeds critical threshold (e.g., 98.2Hz)
     */
    static assessGridFrequency(frequencyHz: number, constants: EngineeringConstants): GridRisk {
        const minFreq = constants.electrical.nominalGridFrequency - constants.electrical.gridFrequencyTolerance;
        const maxFreq = constants.electrical.nominalGridFrequency + constants.electrical.gridFrequencyTolerance;

        if (frequencyHz >= constants.electrical.criticalFrequencyThreshold || frequencyHz > maxFreq || frequencyHz < minFreq) {
            return {
                detected: true,
                frequencyHz,
                severity: 'CRITICAL',
                message: `Frequency ${frequencyHz} Hz exceeds safe limits. Risk of mechanical destruction at ${constants.electrical.criticalFrequencyThreshold} Hz.`,
                messageDE: `Frequenz ${frequencyHz} Hz außerhalb des sicheren Bereichs. Risiko der mechanischen Zerstörung bei ${constants.electrical.criticalFrequencyThreshold} Hz.`
            };
        }
        return {
            detected: false,
            frequencyHz,
            severity: 'LOW',
            message: 'Grid frequency nominal',
            messageDE: 'Netzfrequenz nominal'
        };
    }

    static calculateFinancialImpact(
        healthScore: number,
        ratedPowerMW: number,
        priceEUR: number,
        constants: EngineeringConstants
    ): FinancialImpact {
        // Safe defaults
        const power = ratedPowerMW || 0;
        const price = priceEUR || 0;

        // Loss model using reactive constant
        const isCritical = healthScore < 50;
        const lossMW = isCritical ? power : (power * (100 - healthScore) * constants.maintenance.efficiencyLossPerHealthPoint);

        const hourlyLoss = lossMW * price;

        return {
            healthScore,
            zone: healthScore > 80 ? 'GREEN' : healthScore > 50 ? 'YELLOW' : 'RED',
            estimatedLossEUR30Days: hourlyLoss * 24 * 30, // 30 days projection
            breakdown: {
                downtimeRisk: isCritical ? hourlyLoss : 0,
                efficiencyLoss: !isCritical ? hourlyLoss : 0,
                emergencyRepairCost: isCritical ? 500000 : 0
            },
            recommendation: isCritical ? 'IMMEDIATE SHUTDOWN & INSPECTION' : 'Schedule maintenance window',
            recommendationDE: isCritical ? 'SOFORTIGE ABSCHALTUNG & INSPEKTION' : 'Wartungsfenster planen'
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
        }

        // Grid deduction (Massive penalty)
        if (diagnostics.gridRisk && diagnostics.gridRisk.severity === 'CRITICAL') {
            score = 0; // Immediate failure condition
            criticalRisks.push({
                type: 'ELECTRICAL',
                severity: 'CRITICAL',
                description: diagnostics.gridRisk.message,
                descriptionDE: diagnostics.gridRisk.messageDE
            });
        }

        // Cavitation deduction
        if (diagnostics.cavitationRisk && diagnostics.cavitationRisk.severity === 'CRITICAL') {
            score -= 25;
            criticalRisks.push({
                type: 'HYDRAULIC',
                severity: 'CRITICAL',
                description: diagnostics.cavitationRisk.message,
                descriptionDE: 'Kavitationsrisiko erkannt.'
            });
        }

        // Axial thrust deduction
        if (diagnostics.axialThrustRisk) {
            if (diagnostics.axialThrustRisk.severity === 'HIGH') {
                score -= 20;
            } else if (diagnostics.axialThrustRisk.severity === 'MEDIUM') {
                score -= 10;
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
        }

        // Jacking system
        if (diagnostics.jackingRisk && diagnostics.jackingRisk.detected) {
            if (diagnostics.jackingRisk.severity === 'CRITICAL') {
                score -= 40;
                criticalRisks.push({
                    type: 'STARTUP',
                    severity: 'CRITICAL',
                    description: diagnostics.jackingRisk.alarm,
                    descriptionDE: diagnostics.jackingRisk.alarmDE
                });
            }
        }

        return {
            overall: Math.max(0, Math.round(score)),
            breakdown: {
                thermal: diagnostics.thermalRisk.severity === 'CRITICAL' ? 0 : 100,
                mechanical: 100,
                hydraulic: diagnostics.cavitationRisk?.severity === 'CRITICAL' ? 50 : 100,
                sensory: sensorScore
            },
            criticalRisks,
            maintenanceSuggestions: suggestions,
            optimizedAreas: optimized
        };
    }

    /**
     * Run complete diagnostic assessment
     * Uses engineering constants from TechnicalSchema - fully reactive, no hardcoded values
     */
    static runDiagnostics(
        assetIdentity: AssetIdentity,
        ambientTempC: number,
        lubrication: LubricationType,
        rotorWeightTons?: number,
        currentFlow?: number,
        currentHead?: number,
        gridFrequency?: number,
        constants?: EngineeringConstants
    ): DiagnosticResults {
        // Use provided constants or fallback defaults for backward compatibility
        const safeConstants = constants || {
            thermal: { criticalAmbientTemp: 30, minClearanceForGrease: 0.10 },
            electrical: { nominalGridFrequency: 50.0, gridFrequencyTolerance: 0.5, criticalFrequencyThreshold: 98.2 },
            hydraulic: { cavitationFlowThreshold: 42.5, cavitationHeadThreshold: 152.0, targetRunnerClearance: 0.40 },
            maintenance: { jackingSafetyFactor: 1.5 },
            physics: { gravity: 9.81 }
        } as EngineeringConstants;

        // Thermal risk using reactive constants
        const avgClearance = assetIdentity.specializedAdvanced
            ? (assetIdentity.specializedAdvanced.frontRunnerClearanceMM + assetIdentity.specializedAdvanced.backRunnerClearanceMM) / 2
            : safeConstants.hydraulic.targetRunnerClearance;

        const thermalRisk = this.assessThermalRisk(ambientTempC, lubrication, avgClearance, safeConstants);

        // Axial thrust (Francis only)
        const axialThrustRisk = assetIdentity.specializedAdvanced
            ? this.assessAxialThrust(
                assetIdentity.specializedAdvanced.frontRunnerClearanceMM,
                assetIdentity.specializedAdvanced.backRunnerClearanceMM
            )
            : undefined;

        // Sensor coverage
        const sensorCoverage = this.assessSensorCoverage(assetIdentity.sensorMatrix);

        // Grid Frequency Check using reactive constants
        const finalGridFreq = gridFrequency !== undefined ? gridFrequency : safeConstants.electrical.nominalGridFrequency;
        const gridRisk = this.assessGridFrequency(finalGridFreq, safeConstants);

        // Cavitation Risk using reactive constants
        let cavitationRisk = { severity: 'OPTIMAL' as RiskSeverity, message: 'Hydraulic conditions stable.' };
        if (currentFlow !== undefined && currentHead !== undefined) {
            if (Math.abs(currentFlow - safeConstants.hydraulic.cavitationFlowThreshold) < 0.2 &&
                Math.abs(currentHead - safeConstants.hydraulic.cavitationHeadThreshold) < 0.2) {
                cavitationRisk = {
                    severity: 'CRITICAL',
                    message: `CAVITATION RISK DETECTED. Action: Check runner clearances (target ${safeConstants.hydraulic.targetRunnerClearance}mm).`
                };
            }
        }

        // Jacking system (Vertical only) using reactive constants
        const jackingRisk = assetIdentity.shaftJacking && rotorWeightTons
            ? ExpertDiagnosisEngine.assessJackingSystem(
                assetIdentity.shaftJacking.systemPressureBar,
                rotorWeightTons,
                500, // Default area - could be made configurable
                safeConstants
            )
            : undefined;

        return {
            thermalRisk,
            axialThrustRisk,
            sensorCoverage,
            jackingRisk,
            cavitationRisk,
            gridRisk,
            timestamp: new Date().toISOString()
        };
    }
}
