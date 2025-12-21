// Francis Turbine Model Implementation
// Supports: Vertical, Horizontal, Slow Runner, Fast Runner variants

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
    FrancisSensorData
} from './types';

export class FrancisModel implements ITurbineModel {
    family: TurbineFamily = 'francis';
    variant: TurbineVariant;
    config: TurbineConfiguration;

    constructor(variant: TurbineVariant, config: TurbineConfiguration) {
        this.variant = variant;
        this.config = config;
    }

    getSpecificParameters(): string[] {
        const base = [
            'guide_vane_opening',
            'runner_clearance',
            'draft_tube_pressure',
            'stay_ring_vibration',
            'spiral_case_pressure'
        ];

        // Slow runner has additional tip clearance monitoring
        if (this.variant === 'francis_slow_runner') {
            return [...base, 'runner_tip_clearance'];
        }

        return base;
    }

    getTolerances(): ToleranceMap {
        const baseTolerance: ToleranceMap = {
            shaft_alignment: {
                value: 0.05,
                unit: 'mm/m',
                critical: true
            },
            runner_clearance: {
                value: 0.3,
                unit: 'mm',
                critical: false,
                warningThreshold: 0.2
            },
            labyrinth_clearance: {
                value: 0.3,
                unit: 'mm',
                critical: false
            },
            guide_vane_clearance: {
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

        // Slow runner specific
        if (this.variant === 'francis_slow_runner') {
            baseTolerance.runner_tip_clearance = {
                value: 0.2,
                unit: 'mm',
                critical: true,
                warningThreshold: 0.15
            };
        }

        return baseTolerance;
    }

    validateSensorData(data: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (data.guide_vane_opening === undefined) {
            errors.push('Missing required parameter: guide_vane_opening');
        }

        if (!data.runner_clearance) {
            warnings.push('Missing runner_clearance - critical for cavitation detection');
        }

        if (!data.draft_tube_pressure) {
            errors.push('Missing required parameter: draft_tube_pressure');
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
        const francisData = latest.francis as FrancisSensorData;

        if (!francisData) return anomalies;

        // 1. DRAFT TUBE VORTEX CORE DETECTION
        if (historicalData.length >= 5) {
            const pressureOscillation = this.calculatePressureOscillation(historicalData);

            if (pressureOscillation > 0.5) {
                anomalies.push({
                    type: 'DRAFT_TUBE_VORTEX_CORE',
                    severity: pressureOscillation > 1.0 ? 'HIGH' : 'MEDIUM',
                    parameter: 'draft_tube_pressure',
                    currentValue: francisData.draft_tube_pressure,
                    expectedRange: [-1.0, -0.5],
                    recommendation: '⚠️ Vortex core detected in draft tube. Operate at design load or install air admission system. Part-load operation causing unstable vortex.',
                    timestamp: latest.timestamp
                });
            }
        }

        // 2. RUNNER CLEARANCE EXCESSIVE (Cavitation Risk)
        if (francisData.runner_clearance > 0.3) {
            anomalies.push({
                type: 'RUNNER_CLEARANCE_EXCESSIVE',
                severity: francisData.runner_clearance > 0.5 ? 'HIGH' : 'MEDIUM',
                parameter: 'runner_clearance',
                currentValue: francisData.runner_clearance,
                expectedRange: [0, 0.3],
                recommendation: 'Runner clearance excessive. Risk of increased cavitation and efficiency loss. Schedule runner inspection during next outage.',
                timestamp: latest.timestamp
            });
        }

        // 3. CAVITATION DETECTION (via acoustic/vibration)
        if (latest.common.vibration > 4.5 && francisData.draft_tube_pressure > -0.3) {
            anomalies.push({
                type: 'CAVITATION_DETECTED',
                severity: 'HIGH',
                parameter: 'vibration_with_low_suction',
                currentValue: latest.common.vibration,
                expectedRange: [0, 4.5],
                recommendation: '🔴 Cavitation likely occurring. Low draft tube suction + high vibration. Increase tailwater level or reduce load. Inspect runner for pitting damage.',
                timestamp: latest.timestamp
            });
        }

        // 4. GUIDE VANE STUCK/JAMMING
        if (historicalData.length >= 3) {
            const gateMovement = this.detectGateMovement(historicalData);
            if (!gateMovement && francisData.guide_vane_opening < 90 && francisData.guide_vane_opening > 10) {
                anomalies.push({
                    type: 'GUIDE_VANE_STUCK',
                    severity: 'HIGH',
                    parameter: 'guide_vane_opening',
                    currentValue: francisData.guide_vane_opening,
                    expectedRange: [0, 100],
                    recommendation: 'Guide vanes not responding to control signals. Check servomotor, linkage, and bushings. Possible mechanical jam or servo fault.',
                    timestamp: latest.timestamp
                });
            }
        }

        // 5. SLOW RUNNER TIP CLEARANCE
        if (this.variant === 'francis_slow_runner' && francisData.runner_tip_clearance) {
            if (francisData.runner_tip_clearance > 0.2) {
                anomalies.push({
                    type: 'RUNNER_TIP_CLEARANCE_HIGH',
                    severity: 'CRITICAL',
                    parameter: 'runner_tip_clearance',
                    currentValue: francisData.runner_tip_clearance,
                    expectedRange: [0, 0.2],
                    recommendation: 'CRITICAL: Slow runner tip clearance exceeded. High risk of runner-to-casing contact. Reduce load immediately and schedule emergency inspection.',
                    timestamp: latest.timestamp
                });
            }
        }

        return anomalies;
    }

    getForensicsPatterns(): ForensicsPattern[] {
        return [
            {
                id: 'francis_vortex_core',
                name: 'Draft Tube Vortex Core',
                description: 'Unstable vortex formation causing pressure oscillations and noise',
                triggers: ['draft_tube_oscillation', 'part_load_operation'],
                thresholds: {
                    pressure_oscillation: 0.5, // bar
                    frequency: 5.0 // Hz
                },
                solution: 'Install air admission system or operate within optimal load range (70-100%). Consider runner redesign for increased part-load stability.',
                historicalIncidents: ['2018-FR-VC-015']
            },
            {
                id: 'francis_cavitation_collapse',
                name: 'Cavitation Collapse and Runner Damage',
                description: 'Severe cavitation causing material erosion on runner blades',
                triggers: ['runner_pitting', 'efficiency_drop', 'high_vibration'],
                thresholds: {
                    cavitation_noise: 85.0, // dB
                    runner_clearance: 0.5 // mm
                },
                solution: 'Increase tailwater level if possible. Reduce load. Schedule runner repair/coating. Consider installing cavitation-resistant coating (stainless steel overlay).',
                historicalIncidents: []
            },
            {
                id: 'francis_guide_vane_failure',
                name: 'Guide Vane Mechanism Failure',
                description: 'Servomotor or linkage failure causing loss of flow control',
                triggers: ['vanes_stuck', 'servo_fault', 'linkage_broken'],
                thresholds: {
                    vane_response_time: 10.0 // seconds
                },
                solution: 'Emergency shutdown if vanes stuck open. Inspect servomotor, regulating ring, and all linkages. Check for bent rods or worn bushings.',
                historicalIncidents: []
            }
        ];
    }

    calculateComponentRUL(component: string, operatingHours: number): number {
        const baseLifeHours: Record<string, number> = {
            runner: 50000,
            guide_vane_bearing: 30000,
            labyrinth_seal: 25000,
            servomotor: 20000,
            draft_tube_liner: 40000
        };

        const baseLife = baseLifeHours[component] || 30000;
        return Math.max(0, baseLife - operatingHours);
    }

    renderDashboard(): ReactNode {
        return null; // To be implemented
    }

    // ===== PRIVATE HELPER METHODS =====

    private calculatePressureOscillation(data: CompleteSensorData[]): number {
        const pressures = data.slice(-5).map(d => d.francis?.draft_tube_pressure || 0);
        const mean = pressures.reduce((a, b) => a + b, 0) / pressures.length;
        const variance = pressures.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / pressures.length;
        return Math.sqrt(variance);
    }

    private detectGateMovement(data: CompleteSensorData[]): boolean {
        const openings = data.slice(-3).map(d => d.francis?.guide_vane_opening || 0);
        const changes = openings.map((val, i) => i > 0 ? Math.abs(val - openings[i - 1]) : 0);
        return changes.some(change => change > 0.5); // Movement threshold
    }
}
