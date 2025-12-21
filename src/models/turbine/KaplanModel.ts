// Kaplan Turbine Model Implementation
// Supports: Vertical, Horizontal, PIT, Bulb, S-Type, Spiral variants

import React, { ReactNode } from 'react';
import {
    ITurbineModel,
    TurbineFamily,
    TurbineVariant,
    TurbineConfiguration,
    ToleranceMap,
    CompleteSensorData,
    Anomaly,
    ValidationResult,
    ForensicsPattern,
    KaplanSensorData
} from './types';

export class KaplanModel implements ITurbineModel {
    family: TurbineFamily = 'kaplan';
    variant: TurbineVariant;
    config: TurbineConfiguration;

    constructor(variant: TurbineVariant, config: TurbineConfiguration) {
        this.variant = variant;
        this.config = config;
    }

    getSpecificParameters(): string[] {
        const base = [
            'blade_angle',
            'blade_angle_setpoint',
            'hub_position',
            'wicket_gate_position',
            'servo_oil_pressure'
        ];

        // Variant-specific parameters
        switch (this.variant) {
            case 'kaplan_bulb':
                return [...base, 'generator_submersion_depth', 'seal_water_pressure'];

            case 'kaplan_horizontal':
                return [...base, 'hose_tension', 'pipe_diameter'];

            case 'kaplan_s':
                // S-Type has simplified servo system
                return base.filter(p => p !== 'servo_oil_pressure').concat('simplified_servo_pressure');

            default:
                return base;
        }
    }

    getTolerances(): ToleranceMap {
        const baseTolerance: ToleranceMap = {
            shaft_alignment: {
                value: 0.05,
                unit: 'mm/m',
                critical: true,
                warningThreshold: 0.03
            },
            blade_angle_deviation: {
                value: 0.1,
                unit: 'degrees',
                critical: false,
                warningThreshold: 0.05
            },
            hub_play: {
                value: 0.02,
                unit: 'mm',
                critical: true
            },
            wicket_gate_clearance: {
                value: 0.5,
                unit: 'mm',
                critical: false
            },
            vibration_limit: {
                value: 4.5,
                unit: 'mm/s',
                critical: true
            }
        };

        // Variant-specific tolerance overrides
        if (this.variant === 'kaplan_horizontal') {
            baseTolerance.hydraulic_shock_tolerance = {
                value: 5.0,
                unit: 'bar/s',
                critical: true,
                warningThreshold: 3.0
            };
        }

        if (this.variant === 'kaplan_bulb') {
            baseTolerance.seal_integrity = {
                value: 2.0,
                unit: 'bar',
                critical: true,
                warningThreshold: 1.5
            };
        }

        return baseTolerance;
    }

    validateSensorData(data: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!data.blade_angle) {
            errors.push('Missing required parameter: blade_angle');
        }

        if (!data.hub_position) {
            errors.push('Missing required parameter: hub_position');
        }

        if (!data.wicket_gate_position) {
            errors.push('Missing required parameter: wicket_gate_position');
        }

        // Variant-specific validation
        if (this.variant === 'kaplan_bulb' && data.generator_submersion_depth === undefined) {
            warnings.push('Missing bulb-specific parameter: generator_submersion_depth');
        }

        if (this.variant === 'kaplan_horizontal' && !data.pipe_diameter) {
            warnings.push('Missing horizontal Kaplan parameter: pipe_diameter (critical for runaway detection!)');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    detectAnomalies(historicalData: CompleteSensorData[]): Anomaly[] {
        const anomalies: Anomaly[] = [];

        if (historicalData.length === 0) return anomalies;

        const latest = historicalData[historicalData.length - 1];
        const kaplanData = latest.kaplan as KaplanSensorData;

        if (!kaplanData) return anomalies;

        // 1. BLADE ANGLE DRIFT DETECTION
        const angleDeviation = Math.abs(kaplanData.blade_angle - kaplanData.blade_angle_setpoint);
        if (angleDeviation > 1.0) {
            anomalies.push({
                type: 'BLADE_ANGLE_DRIFT',
                severity: angleDeviation > 2.0 ? 'CRITICAL' : 'HIGH',
                parameter: 'blade_angle',
                currentValue: kaplanData.blade_angle,
                expectedRange: [
                    kaplanData.blade_angle_setpoint - 0.5,
                    kaplanData.blade_angle_setpoint + 0.5
                ],
                recommendation: 'Check servo mechanism and hydraulic oil quality. Possible servo valve blockage or air in system.',
                timestamp: latest.timestamp
            });
        }

        // 2. HUB PLAY EXCESSIVE
        if (kaplanData.hub_position > 0.02) {
            anomalies.push({
                type: 'HUB_PLAY_EXCESSIVE',
                severity: kaplanData.hub_position > 0.05 ? 'CRITICAL' : 'HIGH',
                parameter: 'hub_position',
                currentValue: kaplanData.hub_position,
                expectedRange: [0, 0.02],
                recommendation: 'Hub bearing wear detected. Schedule inspection. May require thrust bearing replacement.',
                timestamp: latest.timestamp
            });
        }

        // 3. HORIZONTAL KAPLAN SPECIFIC: HYDRAULIC RUNAWAY PATTERN
        if (this.variant === 'kaplan_horizontal' && historicalData.length >= 2) {
            const pressureRate = this.calculatePressureRate(historicalData);

            if (pressureRate > 5.0) {
                anomalies.push({
                    type: 'HYDRAULIC_RUNAWAY_RISK',
                    severity: 'CRITICAL',
                    parameter: 'servo_pressure_rate',
                    currentValue: pressureRate,
                    expectedRange: [0, 3.0],
                    recommendation: '⚠️ PATTERN MATCH: Similar to 12mm→16mm pipe incident (2024-KM-HC-001). Verify pipe diameter immediately! Reduce system pressure by 10%.',
                    timestamp: latest.timestamp
                });
            }

            // Check if pipe diameter was recently changed
            if (historicalData.length >= 5) {
                const pipeDiameterHistory = historicalData.slice(-5).map(d => d.kaplan?.pipe_diameter).filter(Boolean);
                if (new Set(pipeDiameterHistory).size > 1) {
                    anomalies.push({
                        type: 'PIPE_DIAMETER_CHANGE_DETECTED',
                        severity: 'HIGH',
                        parameter: 'pipe_diameter',
                        currentValue: kaplanData.pipe_diameter || 0,
                        expectedRange: [12, 12], // Expected original
                        recommendation: '🚨 Pipe diameter change detected in recent history. Monitor servo pressure closely for next 24h. This is a known trigger for hydraulic runaway.',
                        timestamp: latest.timestamp
                    });
                }
            }
        }

        // 4. BULB-SPECIFIC: SEAL INTEGRITY
        if (this.variant === 'kaplan_bulb' && kaplanData.seal_water_pressure) {
            if (kaplanData.seal_water_pressure < 1.5) {
                anomalies.push({
                    type: 'SEAL_PRESSURE_LOW',
                    severity: kaplanData.seal_water_pressure < 1.0 ? 'CRITICAL' : 'HIGH',
                    parameter: 'seal_water_pressure',
                    currentValue: kaplanData.seal_water_pressure,
                    expectedRange: [2.0, 3.5],
                    recommendation: 'Seal water pressure low. Risk of water ingress into generator. Check seal pump and filter.',
                    timestamp: latest.timestamp
                });
            }
        }

        // 5. SERVO OIL PRESSURE SPIKE (Blade Seizure Indicator)
        if (kaplanData.servo_oil_pressure > 60) {
            anomalies.push({
                type: 'SERVO_PRESSURE_SPIKE',
                severity: 'CRITICAL',
                parameter: 'servo_oil_pressure',
                currentValue: kaplanData.servo_oil_pressure,
                expectedRange: [35, 50],
                recommendation: '🔴 CRITICAL: Servo pressure spike detected. Possible blade mechanism seizure. Emergency shutdown recommended. Check for foreign object or bearing failure in hub.',
                timestamp: latest.timestamp
            });
        }

        return anomalies;
    }

    getForensicsPatterns(): ForensicsPattern[] {
        return [
            {
                id: 'kaplan_horizontal_hydraulic_runaway',
                name: 'Hydraulic Runaway After Pipe Replacement',
                description: 'Violent servo pressure spike when incorrect pipe diameter is installed',
                triggers: ['pipe_diameter_change', 'sudden_pressure_rise > 5 bar/s'],
                thresholds: {
                    servo_pressure_rate: 5.0,
                    hose_tension: 400
                },
                solution: '⚠️ IMMEDIATE ACTION: Reduce system pressure by 10%. Verify pipe diameter matches original specs (typically 12mm). Replace with correct diameter within 12 hours. Monitor hose tension continuously.',
                historicalIncidents: ['2024-KM-HC-001']
            },
            {
                id: 'kaplan_blade_seizure',
                name: 'Blade Mechanism Seizure',
                description: 'Hub mechanism locks due to bearing failure or foreign object',
                triggers: ['blade_angle_stuck', 'servo_pressure_spike > 60 bar', 'hub_vibration_increase'],
                thresholds: {
                    servo_pressure: 60.0,
                    blade_angle_deviation: 5.0
                },
                solution: 'Emergency shutdown. Inspect hub mechanism for foreign objects. Check thrust bearing condition. May require runner removal for full inspection.',
                historicalIncidents: []
            },
            {
                id: 'kaplan_wicket_gate_jamming',
                name: 'Wicket Gate Jamming',
                description: 'Guide vanes unable to move due to debris or mechanical failure',
                triggers: ['wicket_gate_stuck', 'gate_clearance_loss'],
                thresholds: {
                    wicket_gate_clearance: 0.1
                },
                solution: 'Controlled shutdown. Inspect wicket gate linkage and bushings. Clean debris from gate area. Check for bent servomotor rods.',
                historicalIncidents: []
            }
        ];
    }

    calculateComponentRUL(component: string, operatingHours: number): number {
        const baseLifeHours: Record<string, number> = {
            blade_bearing: 25000,
            hub_seal: 15000,
            servo_cylinder: 20000,
            wicket_gate_bearing: 30000,
            // Bulb-specific
            generator_seal: 10000
        };

        // Simple linear depreciation for now
        // In production, factor in actual stress from sensor data
        const baseLife = baseLifeHours[component] || 20000;
        return Math.max(0, baseLife - operatingHours);
    }

    renderDashboard(): ReactNode {
        // This will be implemented as a React component
        // For now, return null (will be replaced with KaplanDashboard component)
        return null;
    }

    // ===== PRIVATE HELPER METHODS =====

    private calculatePressureRate(data: CompleteSensorData[]): number {
        if (data.length < 2) return 0;

        const latest = data[data.length - 1].kaplan?.servo_oil_pressure || 0;
        const previous = data[data.length - 2].kaplan?.servo_oil_pressure || 0;
        const timeDiff = (data[data.length - 1].timestamp - data[data.length - 2].timestamp) / 1000; // seconds

        if (timeDiff === 0) return 0;
        return Math.abs(latest - previous) / timeDiff;
    }
}
