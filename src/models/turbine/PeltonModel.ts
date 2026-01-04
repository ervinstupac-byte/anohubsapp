// Pelton Turbine Model Implementation
// Supports: Vertical, Horizontal, Multi-Jet variants

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
    PeltonSensorData
} from './types';
import { TurbineFamily } from '../../types/assetIdentity';

export class PeltonModel implements ITurbineModel {
    family: TurbineFamily = 'PELTON';
    variant: TurbineVariant;
    config: TurbineConfiguration;

    constructor(variant: TurbineVariant, config: TurbineConfiguration) {
        this.variant = variant;
        this.config = config;
    }

    getSpecificParameters(): string[] {
        return [
            'nozzle_openings',
            'jet_velocities',
            'bucket_wear_index',
            'deflector_position',
            'nozzle_alignment'
        ];
    }

    getTolerances(): ToleranceMap {
        return {
            nozzle_alignment: {
                value: 0.1,
                unit: 'mm',
                critical: true
            },
            bucket_spacing: {
                value: 0.5,
                unit: 'mm',
                critical: false
            },
            jet_axis_deviation: {
                value: 2.0,
                unit: 'mm',
                critical: true
            },
            vibration_limit: {
                value: 3.5,
                unit: 'mm/s',
                critical: true
            },
            nozzle_wear: {
                value: 0.5,
                unit: 'mm',
                critical: false,
                warningThreshold: 0.3
            }
        };
    }

    validateSensorData(data: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!data.nozzle_openings || !Array.isArray(data.nozzle_openings)) {
            errors.push('Missing or invalid nozzle_openings array');
        } else {
            const expectedNozzles = this.getExpectedNozzleCount();
            if (data.nozzle_openings.length !== expectedNozzles) {
                warnings.push(`Expected ${expectedNozzles} nozzles, got ${data.nozzle_openings.length}`);
            }
        }

        if (data.bucket_wear_index === undefined) {
            warnings.push('Missing bucket_wear_index');
        }

        if (!data.deflector_position) {
            errors.push('Missing required parameter: deflector_position');
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
        const peltonData = latest.specialized as PeltonSensorData;

        if (!peltonData) return anomalies;

        // 1. WATER HAMMER DETECTION
        if (historicalData.length >= 2) {
            const deflectorClosed = this.detectRapidDeflectorClosure(historicalData);
            const pressureSpike = this.detectPressureSpike(historicalData);

            if (deflectorClosed && pressureSpike) {
                anomalies.push({
                    type: 'WATER_HAMMER_RISK',
                    severity: 'CRITICAL',
                    parameter: 'pressure_spike',
                    currentValue: pressureSpike,
                    expectedRange: [0, 50],
                    recommendation: '🔴 WATER HAMMER DETECTED! Rapid deflector closure without proper lead time. Install surge tank or air chamber. Program deflector to close gradually (minimum 2 seconds).',
                    timestamp: latest.timestamp
                });
            }
        }

        // 2. NOZZLE ASYMMETRY (Multi-Jet)
        if (peltonData.nozzle_openings.length > 1) {
            const avgOpening = peltonData.nozzle_openings.reduce((a, b) => a + b, 0) / peltonData.nozzle_openings.length;
            const maxDeviation = Math.max(...peltonData.nozzle_openings.map(n => Math.abs(n - avgOpening)));

            if (maxDeviation > 5.0) {
                anomalies.push({
                    type: 'NOZZLE_ASYMMETRY',
                    severity: 'MEDIUM',
                    parameter: 'nozzle_openings',
                    currentValue: maxDeviation,
                    expectedRange: [0, 3.0],
                    recommendation: 'Nozzle opening imbalance detected. Check servomotor calibration. Possible mechanical binding in one or more nozzles.',
                    timestamp: latest.timestamp
                });
            }
        }

        // 3. BUCKET EROSION EXCESSIVE
        if (peltonData.bucket_wear_index > 0.3) {
            anomalies.push({
                type: 'BUCKET_EROSION_EXCESSIVE',
                severity: peltonData.bucket_wear_index > 0.5 ? 'HIGH' : 'MEDIUM',
                parameter: 'bucket_wear_index',
                currentValue: peltonData.bucket_wear_index,
                expectedRange: [0, 0.2],
                recommendation: 'Bucket erosion rate high. Check water sediment content. Consider coating or material upgrade. Inspect jet alignment - misaligned jets accelerate wear.',
                timestamp: latest.timestamp
            });
        }

        // 4. JET MISALIGNMENT (if data available)
        if (peltonData.nozzle_alignment) {
            const maxMisalignment = Math.max(...peltonData.nozzle_alignment);
            if (maxMisalignment > 0.1) {
                anomalies.push({
                    type: 'JET_MISALIGNMENT',
                    severity: 'HIGH',
                    parameter: 'nozzle_alignment',
                    currentValue: maxMisalignment,
                    expectedRange: [0, 0.1],
                    recommendation: 'Critical jet misalignment detected. Realign nozzles to ±0.1mm. Misalignment causes asymmetric bucket wear and efficiency loss of 3-5%.',
                    timestamp: latest.timestamp
                });
            }
        }

        // 5. JET VELOCITY IMBALANCE
        if (peltonData.jet_velocities && peltonData.jet_velocities.length > 1) {
            const avgVelocity = peltonData.jet_velocities.reduce((a, b) => a + b, 0) / peltonData.jet_velocities.length;
            const maxDeviation = Math.max(...peltonData.jet_velocities.map(v => Math.abs(v - avgVelocity)));

            if (maxDeviation > 5.0) {
                anomalies.push({
                    type: 'JET_VELOCITY_IMBALANCE',
                    severity: 'MEDIUM',
                    parameter: 'jet_velocities',
                    currentValue: maxDeviation,
                    expectedRange: [0, 3.0],
                    recommendation: 'Jet velocity imbalance. Check for nozzle wear or partial blockage. Inspect distributor and penstock for debris.',
                    timestamp: latest.timestamp
                });
            }
        }

        return anomalies;
    }

    getForensicsPatterns(): ForensicsPattern[] {
        return [
            {
                id: 'pelton_water_hammer',
                name: 'Water Hammer in Penstock',
                description: 'Sudden pressure spike due to rapid deflector/nozzle closure',
                triggers: ['emergency_stop_without_deflector', 'rapid_closure < 2s'],
                thresholds: {
                    pressure_spike: 150, // bar
                    closure_time: 2.0 // seconds
                },
                solution: 'Install surge tank or air chamber upstream of nozzle. Program deflector lead time (deflector must close before nozzle). Minimum closure time: 2 seconds.',
                historicalIncidents: ['2019-PL-WH-002']
            },
            {
                id: 'pelton_bucket_erosion',
                name: 'Asymmetric Bucket Erosion Pattern',
                description: 'Uneven wear on bucket surfaces due to jet misalignment or sediment',
                triggers: ['jet_misalignment > 0.1mm', 'high_sediment_content'],
                thresholds: {
                    wear_rate: 0.3, // mm/1000h
                    power_drop: 5.0 // %
                },
                solution: 'Realign all nozzles to ±0.1mm tolerance. Consider hardfacing or stainless steel overlay on buckets. Install sediment trap upstream.',
                historicalIncidents: []
            },
            {
                id: 'pelton_nozzle_blockage',
                name: 'Partial Nozzle Blockage',
                description: 'Debris or scale buildup reducing jet quality',
                triggers: ['jet_velocity_drop', 'nozzle_opening_high_but_power_low'],
                thresholds: {
                    velocity_drop: 10.0 // %
                },
                solution: 'Inspect and clean nozzle interior. Check distributor and penstock screens. Consider automated strainer system.',
                historicalIncidents: []
            }
        ];
    }

    calculateComponentRUL(component: string, operatingHours: number): number {
        const baseLifeHours: Record<string, number> = {
            bucket: 60000,
            nozzle: 40000,
            deflector: 30000,
            servomotor: 25000,
            bearing: 50000
        };

        const baseLife = baseLifeHours[component] || 40000;
        return Math.max(0, baseLife - operatingHours);
    }

    renderDashboard(): ReactNode {
        return null; // To be implemented
    }

    // ===== PRIVATE HELPER METHODS =====

    private getExpectedNozzleCount(): number {
        switch (this.variant) {
            case 'pelton_horizontal':
                return 2; // Typically 1-2
            case 'pelton_vertical':
            case 'pelton_multi_jet':
                return this.config.nozzle_count || 4; // Typically 4-6
            default:
                return 1;
        }
    }

    private detectRapidDeflectorClosure(data: CompleteSensorData[]): boolean {
        if (data.length < 2) return false;

        const latest = (data[data.length - 1].specialized as PeltonSensorData)?.deflector_position;
        const previous = (data[data.length - 2].specialized as PeltonSensorData)?.deflector_position;

        // Rapid closure: OPEN -> CLOSED in less than 2 seconds
        if (previous === 'OPEN' && latest === 'CLOSED') {
            const timeDiff = (data[data.length - 1].timestamp - data[data.length - 2].timestamp) / 1000;
            return timeDiff < 2.0;
        }

        return false;
    }

    private detectPressureSpike(data: CompleteSensorData[]): number {
        // This would need to read from a pressure sensor in common data
        // For now, simplified detection based on power fluctuation
        if (data.length < 2) return 0;

        const powerChange = Math.abs(
            data[data.length - 1].common.output_power - data[data.length - 2].common.output_power
        );

        return powerChange; // Simplified - in reality, read penstock pressure
    }
}
