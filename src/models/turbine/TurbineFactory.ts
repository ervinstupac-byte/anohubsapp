// Turbine Factory Pattern - Universal Hydro Interface
// Defines behavior for Kaplan, Francis, and Pelton turbines

import React from 'react';

export type TurbineType = 'kaplan' | 'francis' | 'pelton' | 'bulb' | 'pit';

export interface AlarmDefinition {
    id: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
    condition: (data: any) => boolean;
}

export interface TurbineFamily {
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
export class KaplanTurbine implements TurbineFamily {
    type: TurbineType = 'kaplan';

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
import { diagnoseFrancisFault } from '../../lib/francis_logic';

// === FRANCIS IMPLEMENTATION ===
export class FrancisTurbine implements TurbineFamily {
    type: TurbineType = 'francis';

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
        // Map any generic data to FrancisTelemetry if needed
        // Assuming data structure matches or we overlap
        const telemetry = {
            bearingTemp: data.bearingTemp || 45,
            vibration: data.vibration || 0.5,
            siltPpm: data.siltPpm || 0,
            gridFreq: data.gridFreq || 50.0,
            loadMw: data.load || 0,
            mivStatus: (data.mivStatus || 'OPEN') as 'OPEN' | 'CLOSED'
        };

        const findings = diagnoseFrancisFault(telemetry);

        // Convert structured findings to string array for simple consumers
        return findings
            .filter(f => f.status !== 'NORMAL')
            .map(f => `${f.status}: ${f.message} [Ref: ${f.referenceProtocol || 'N/A'}]`);
    }
}

// === PELTON IMPLEMENTATION ===
export class PeltonTurbine implements TurbineFamily {
    type: TurbineType = 'pelton';

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
    static create(type: TurbineType, variant?: string, config?: any): TurbineFamily {
        switch (type) {
            case 'kaplan':
            case 'bulb': // Bulb is essentially a horizontal Kaplan
            case 'pit':
                return new KaplanTurbine();
            case 'francis':
                return new FrancisTurbine();
            case 'pelton':
                return new PeltonTurbine();
            default:
                console.warn(`Unknown turbine type: ${type}. Defaulting to Francis.`);
                return new FrancisTurbine();
        }
    }

    static getVariantDisplayName(variant: string): string {
        if (!variant) return 'Standard Configuration';
        return variant.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
}
