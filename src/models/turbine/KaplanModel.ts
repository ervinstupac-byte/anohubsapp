// Kaplan Turbine Model Implementation
// Supports: Vertical, Horizontal, Pit, Bulb, S-Type, Spiral variants

import React, { ReactNode } from 'react';
import {
    ITurbineModel,
    TurbineVariant,
    TurbineConfiguration,
    ToleranceMap,
    CompleteSensorData,
    Anomaly,
    ValidationResult,
    ForensicsPattern,
    KaplanSensorData
} from './types';
import { TurbineFamily } from '../../types/assetIdentity';

export class KaplanModel implements ITurbineModel {
    family: TurbineFamily = 'KAPLAN';
    variant: TurbineVariant;
    config: TurbineConfiguration;

    constructor(variant: TurbineVariant, config: TurbineConfiguration) {
        this.variant = variant;
        this.config = config;
    }

    getSpecificParameters(): string[] {
        return [
            'blade_angle',
            'wicket_gate_position',
            'servo_oil_pressure',
            'hub_position'
        ];
    }

    getTolerances(): ToleranceMap {
        return {
            blade_gate_error: {
                value: 2.5,
                unit: '%',
                critical: true
            },
            vibration_limit: {
                value: 4.5, // mm/s ISO 10816
                unit: 'mm/s',
                critical: true
            },
            bearing_temp_limit: {
                value: 65,
                unit: '°C',
                critical: true,
                warningThreshold: 60
            }
        };
    }

    validateSensorData(data: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (data.blade_angle === undefined) errors.push('Missing blade_angle');
        if (data.wicket_gate_position === undefined) errors.push('Missing wicket_gate_position');

        if (data.servo_oil_pressure !== undefined && data.servo_oil_pressure < 30) {
            errors.push('Servo Oil Pressure critically low (<30 bar)');
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
        const kaplanData = latest.specialized as KaplanSensorData;

        if (!kaplanData) return anomalies;

        // 1. Off-Cam Operation Detection
        const expectedAngle = kaplanData.wicket_gate_position * 0.8; // Simplified Cam relationship
        if (Math.abs(kaplanData.blade_angle - expectedAngle) > 5) {
            anomalies.push({
                type: 'OFF_CAM_OPERATION',
                severity: 'HIGH',
                parameter: 'blade_angle',
                currentValue: kaplanData.blade_angle,
                expectedRange: [expectedAngle - 2, expectedAngle + 2],
                recommendation: 'Unit is operating OFF-CAM. Adjust governor cam curve to prevent cavitation and vibration.',
                timestamp: latest.timestamp
            });
        }

        // 2. Draft Tube Vortex (Part Load)
        // Using flow_max as a proxy for rated capacity if rated_power is not in config
        if (latest.common.output_power < 0.3 * (this.config.flow_max || 100)) {
            anomalies.push({
                type: 'DRAFT_TUBE_VORTEX',
                severity: 'MEDIUM',
                parameter: 'output_power',
                currentValue: latest.common.output_power,
                expectedRange: [0.4 * (this.config.flow_max || 100), this.config.flow_max || 1000],
                recommendation: 'Unit in part-load vortex zone. Consider air admission or increasing load.',
                timestamp: latest.timestamp
            });
        }

        return anomalies;
    }

    getForensicsPatterns(): ForensicsPattern[] {
        return [
            {
                id: 'kaplan_blade_drift',
                name: 'Hydraulic Blade Drift',
                description: 'Blades slowly closing or opening against setpoint',
                triggers: ['servo_oil_pressure_drop', 'blade_angle_deviation'],
                thresholds: { deviation: 3.0 },
                solution: 'Inspect piston seals and pilot valve.',
                historicalIncidents: []
            }
        ];
    }

    calculateComponentRUL(component: string, operatingHours: number): number {
        return 40000 - operatingHours;
    }

    renderDashboard(): ReactNode {
        return null;
    }
}
