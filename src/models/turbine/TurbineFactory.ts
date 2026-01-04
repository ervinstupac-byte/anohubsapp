// Turbine Factory Pattern - Universal Hydro Interface
// Defines behavior for Kaplan, Francis, and Pelton turbines

import React from 'react';

import { TurbineType, TurbineFamily } from '../../types/assetIdentity';
export type { TurbineType, TurbineFamily };

export interface AlarmDefinition {
    id: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
    condition: (data: any) => boolean;
}

export interface ITurbineBehavior {
    type: TurbineType;

    // Physics & Limits
    getMaxAlignment(): number; // mm/m
    getCavitationRisk(sigma: number, head: number): 'LOW' | 'MEDIUM' | 'HIGH';
    getEfficiencyCurve(flow: number, head: number): number;

    // UI Configuration
    getSpecificWidgets(): React.FC<any>[];
    getColorScheme(): { primary: string; accent: string; background: string };

    // Specific Diagnosis
    analyzeSpecificRisks(telemetry: any): string[];
}

// === KAPLAN IMPLEMENTATION ===
export class KaplanTurbine implements ITurbineBehavior {
    type: TurbineType = 'KAPLAN';

    getMaxAlignment() {
        return 0.08; // Kaplan allows more flexibility due to lower RPM usually
    }

    getCavitationRisk(sigma: number, head: number): 'LOW' | 'MEDIUM' | 'HIGH' {
        // Thoma's Sigma critical check for Kaplan (high specific speed)
        const sigmaCritical = 0.15 + (0.001 * head);
        if (sigma < sigmaCritical) return 'HIGH';
        if (sigma < sigmaCritical * 1.2) return 'MEDIUM';
        return 'LOW';
    }

    getEfficiencyCurve(flow: number, head: number): number {
        // Double regulation (Blade + Wicket Gate) = Flat curve
        // Simplified mock calculation
        return 92.5;
    }

    getSpecificWidgets(): React.FC<any>[] {
        // Returns list of components to import (names only for factory)
        // In real app, these would be matched to actual imports
        return [];
    }

    getColorScheme() {
        return {
            primary: '#06b6d4', // Cyan (Hydraulic feel)
            accent: '#0891b2',
            background: 'from-cyan-950/30 to-blue-950/30'
        };
    }

    analyzeSpecificRisks(data: any): string[] {
        const risks = [];

        // 1. Blade-Gate Relationship (Cam Curve)
        if (Math.abs(data.bladeAngle - data.gateOpening * 0.8) > 5) {
            risks.push('Cam Curve Deviation: Blade angle mismatch with Gate opening');
        }

        // 2. Draft Tube Vortex (Part Load)
        if (data.load < 40 && data.load > 20) {
            risks.push('Draft Tube Vortex Risk: Operating in restricted 20-40% zone');
        }

        // 3. Servo Pressure Stability
        if (data.servoPressure < 45) {
            risks.push('Low Servo Pressure: Risk of blade drift');
        }

        return risks;
    }
}

// Import logic engine
// Import logic engine
import { FrancisModel } from './FrancisModel';
import { CompleteSensorData, FrancisSensorData } from './types';


// === FRANCIS IMPLEMENTATION ===
export class FrancisTurbine implements ITurbineBehavior {
    type: TurbineType = 'FRANCIS';

    getMaxAlignment() {
        return 0.05; // Standard 0.05mm
    }

    getCavitationRisk(sigma: number, head: number): 'LOW' | 'MEDIUM' | 'HIGH' {
        // Francis critical sigma
        const sigmaCritical = 0.05 + (0.0005 * head);
        if (sigma < sigmaCritical) return 'HIGH';
        return 'LOW';
    }

    getEfficiencyCurve(flow: number, head: number): number {
        // Peak efficiency high, but drops off at part load
        return 94.0;
    }

    getSpecificWidgets(): React.FC<any>[] {
        return [];
    }

    getColorScheme() {
        return {
            primary: '#10b981', // Emerald (Balanced)
            accent: '#059669',
            background: 'from-emerald-950/30 to-green-950/30'
        };
    }

    analyzeSpecificRisks(data: any): string[] {
        // Adapt generic data to internal FrancisModel
        const model = new FrancisModel('francis_horizontal', {} as any);

        // Mock historical data snapshot
        const sensorData: CompleteSensorData = {
            timestamp: Date.now(),
            assetId: 'mock',
            turbineFamily: 'FRANCIS',
            common: {
                vibration: data.vibration || 0.5,
                temperature: data.bearingTemp || 45,
                output_power: data.load || 12, // Mw
                efficiency: 92,
                status: 'OPTIMAL'
            },
            specialized: {
                guide_vane_opening: data.gateOpening || 50,
                runner_clearance: 1.0,
                draft_tube_pressure: data.draftTubePressure || -0.2,
                spiral_case_pressure: 5.0
            }
        };

        const anomalies = model.detectAnomalies([sensorData]);

        return anomalies.map(a =>
            `${a.severity}: ${a.type} - ${a.recommendation}`
        );
    }
}

// === PELTON IMPLEMENTATION ===
export class PeltonTurbine implements ITurbineBehavior {
    type: TurbineType = 'PELTON';

    getMaxAlignment() {
        return 0.03; // Very precise due to high speed/head
    }

    getCavitationRisk(sigma: number, head: number): 'LOW' | 'MEDIUM' | 'HIGH' {
        // Pelton doesn't cavitate in the same way, but suffers from erosion
        return 'LOW';
    }

    getEfficiencyCurve(flow: number, head: number): number {
        // Extremely flat curve due to multi-nozzle operation
        return 91.5;
    }

    getSpecificWidgets(): React.FC<any>[] {
        return [];
    }

    getColorScheme() {
        return {
            primary: '#d946ef', // Fuchsia/Purple (High Energy)
            accent: '#c026d3',
            background: 'from-fuchsia-950/30 to-purple-950/30'
        };
    }

    analyzeSpecificRisks(data: any): string[] {
        const risks = [];

        // 1. Nozzle Misalignment
        if (data.vibrationAxial > 2.5) {
            risks.push('Axial Vibration High: Possible jet misalignment hitting bucket back');
        }

        // 2. Sand Erosion
        if (data.acousticHighFreq > 80) {
            risks.push('High Freq Noise: Sand erosion detected on needles/buckets');
        }

        return risks;
    }
}

// === FACTORY ===
export class TurbineFactory {
    static create(type: TurbineType | string, variant?: string, config?: any): ITurbineBehavior {
        const normalizedType = type.toUpperCase();
        switch (normalizedType) {
            case 'KAPLAN':
                return new KaplanTurbine();
            case 'FRANCIS':
                return new FrancisTurbine();
            case 'PELTON':
                return new PeltonTurbine();
            default:
                console.warn(`Unknown turbine type: ${type}. Defaulting to Francis.`);
                return new FrancisTurbine();
        }
    }

    static getEngine(type: string): ITurbineBehavior {
        return this.create(type as TurbineType);
    }

    static getVariantDisplayName(variant: string): string {
        if (!variant) return 'Standard Configuration';
        return variant.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    static createModel(variant: string, config: any): any {
        const normalizedVariant = variant.toLowerCase();
        if (normalizedVariant.startsWith('francis')) {
            return new FrancisModel(variant as any, config);
        }
        // Fallback for demo
        return new FrancisModel('francis_horizontal', config);
    }
}
