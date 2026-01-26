// Performance Guard Service
// Validates design vs reality, ensures hydraulic safety, and tracks losses

import { PipeMaterial } from './StrategicPlanningService';

export interface OperatingPoint {
    flow: number; // m3/s
    netHead: number; // m
    powerOutput: number; // MW
    efficiency: number; // %
    gateOpening: number; // %
}

export interface HillChartZone {
    name: 'OPTIMAL' | 'ACCEPTABLE' | 'CAVITATION' | 'VIBRATION' | 'POOR_EFFICIENCY';
    minHead: number;
    maxHead: number;
    minFlow: number;
    maxFlow: number;
}

export interface WaterToWireLosses {
    trashRackLossKW: number;
    penstockFrictionLossKW: number;
    turbineMechLossKW: number; // Bearings, windage
    generatorElecLossKW: number; // Copper, iron
    transformerLossKW: number;
    totalLossKW: number;
}

export interface WaterHammerSafeLimits {
    waveSpeed: number; // m/s (a)
    criticalTime: number; // s (Tc)
    minClosingTime: number; // s (Safety Limit)
    maxSurgePressure: number; // bar
}

export class PerformanceGuardService {

    /**
     * WATER HAMMER CALCULATOR (Hydraulic Shock Safeguard)
     * Calculates 'a' (wave speed) and critical time 2L/a
     */
    static calculateSafeClosingTime(
        length: number, // m
        diameterMM: number, // mm
        thicknessMM: number, // mm
        material: PipeMaterial
    ): WaterHammerSafeLimits {
        const D = diameterMM / 1000;
        const e = thicknessMM / 1000;

        // Modules of Elasticity (Pa)
        const E_material = {
            'STEEL': 210e9,
            'GRP': 20e9, // Glass Reinforced Plastic is much more flexible
            'PEHD': 0.8e9, // Polyethylene is very flexible (low surge, but careful with vacuum)
            'CONCRETE': 30e9
        }[material];

        const K_water = 2.2e9; // Bulk modulus of water
        const rho = 1000; // Density

        // Wave speed formula: a = sqrt( K/rho / (1 + (K/E)*(D/e) * C1) )
        // Simplified: a = 1485 / sqrt(1 + (K/E)*(D/e))

        const flexibilityFactor = (K_water / E_material) * (D / e);
        const waveSpeed = 1485 / Math.sqrt(1 + flexibilityFactor);

        const criticalTime = (2 * length) / waveSpeed;

        // Introduction of "Consultant Safety Factor"
        // 15 years experience says: Theoretical Tc is too aggressive. 
        // Always add 3-5x Tc for linear closing, or 2x for dual-stage.
        const safetyFactor = 4.0;
        const minClosingTime = criticalTime * safetyFactor;

        // Joukowsky Max Surge (assuming instant close): dP = rho * a * dV
        // Assuming max velocity ~4 m/s (standard hydro design)
        const maxSurgePressureBar = (rho * waveSpeed * 4) / 100000;

        return {
            waveSpeed,
            criticalTime,
            minClosingTime,
            maxSurgePressure: maxSurgePressureBar
        };
    }

    /**
     * WATER-TO-WIRE LOSS TRACKER
     * Identify where the energy is bleeding
     */
    static analyzeLosses(
        grossHead: number,
        netHead: number, // Measure at turbine inlet
        flow: number,
        mechPowerKW: number, // Shaft power
        elecPowerKW: number // Gen terminals
    ): WaterToWireLosses {
        const g = 9.81;
        const rho = 1000;

        // 1. Hydraulic Losses (Head Loss)
        // Power potential of the lost head
        const headLoss = grossHead - netHead;
        const hydraulicLossKW = (rho * g * flow * headLoss) / 1000;

        // Breakdown hydraulic: assume 10% trash rack, 90% penstock (sensor differentiation needed in reality)
        const trashRackLossKW = hydraulicLossKW * 0.1;
        const penstockFrictionLossKW = hydraulicLossKW * 0.9;

        // 2. Turbine/Mechanical Loss
        // Input hydraulic power at net head
        const hydraulicPowerAtNetHead = (rho * g * flow * netHead) / 1000;
        const turbineMechLossKW = hydraulicPowerAtNetHead - mechPowerKW;

        // 3. Generator Loss
        const generatorElecLossKW = mechPowerKW - elecPowerKW;

        // 4. Transformer (est 1%)
        const transformerLossKW = elecPowerKW * 0.01;

        return {
            trashRackLossKW,
            penstockFrictionLossKW,
            turbineMechLossKW,
            generatorElecLossKW,
            transformerLossKW,
            totalLossKW: hydraulicLossKW + turbineMechLossKW + generatorElecLossKW + transformerLossKW
        };
    }

    /**
     * EFFICIENCY AUDIT (HILL CHART CHECK)
     * Maps current point to design zones
     */
    static checkOperatingZone(
        point: OperatingPoint,
        ratedHead: number,
        ratedFlow: number
    ): { zone: string; color: string; alert?: string } {
        // Normalize coordinates (n11, Q11 usually, but here %H, %Q for simplicity)
        const hPct = (point.netHead / ratedHead) * 100;
        const qPct = (point.flow / ratedFlow) * 100;

        // 1. CAVITATION ZONE (High Q, Low H - typical for Kaplan/Francis)
        // Or Very Low Q (Suction side recirculation)
        if (hPct < 60 && qPct > 80) {
            return {
                zone: 'CAVITATION_RISK',
                color: '#ef4444',
                alert: 'CRITICAL: High flow at low head. Leading edge cavitation imminent.'
            };
        }

        // 2. VIBRATION / ROUGH ZONE (Part Load)
        // Francis: 30-55% load is rough
        if (qPct > 30 && qPct < 55) {
            return {
                zone: 'VORTEX_ROPE',
                color: '#f59e0b',
                alert: 'WARNING: Part Load Vortex Rope operational zone.'
            };
        }

        // 3. OPTIMAL ZONE
        if (hPct > 90 && hPct < 110 && qPct > 75 && qPct < 95) {
            return {
                zone: 'BEST_EFFICIENCY',
                color: '#10b981'
            };
        }

        return { zone: 'NORMAL', color: '#3b82f6' };
    }
}
