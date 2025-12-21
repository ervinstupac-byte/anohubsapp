// Fix type access by checking schema
import { TechnicalProjectState } from '../models/TechnicalSchema';
import { SiteParameters } from './StrategicPlanningService';

export interface SystemHealth {
    efficiency: number;
    powerOutputKW: number;
    annualProductionMWh: number;
    waterHammerSurgeBar: number;
    netHead: number;
    roiYears: number;
    analysis: {
        cavitationRisk: boolean;
        resonanceRisk: boolean;
        efficiencyTrend: 'rising' | 'falling' | 'stable';
    };
}

const GRAVITY = 9.81;
const WATER_DENSITY = 1000;

export const LiveMathSync = {
    calculateSystemHealth: (
        site: SiteParameters,
        tech: TechnicalProjectState
    ): SystemHealth => {
        // Fallbacks if tech state is partial
        // Koristi ispravan pristup objektu: tech.site.grossHead umjesto tech.siteConditions
        const grossHead = tech.site?.grossHead || site.grossHead || 50;
        const designFlow = tech.site?.designFlow || site.ecologicalFlow || 5.0;
        const penstock = tech.penstock || { length: 1000, diameter: 1000, material: 'STEEL', roughness: 0.045 };

        const netHead = Math.max(0, grossHead * 0.95); // Example loss factor

        // 2. Efficiency Calculation (Turbine specific curves)
        let efficiency = 0.85;

        if (netHead > 100) {
            efficiency = 0.90;
        } else if (netHead > 30) {
            efficiency = 0.92;
        } else {
            efficiency = 0.93;
        }

        // 3. Power Output
        const powerOutputKW = (WATER_DENSITY * GRAVITY * netHead * designFlow * efficiency) / 1000;

        // 4. Annual Production (Simple estimation)
        const annualProductionMWh = (powerOutputKW * 8760 * 0.5) / 1000;

        // 5. Water Hammer (Joukowsky)
        let waveSpeed = 1000;
        const material = penstock.material || site.pipeMaterial || 'STEEL';
        switch (material) {
            case 'STEEL': waveSpeed = 1200; break;
            case 'GRP': waveSpeed = 400; break;
            case 'PEHD': waveSpeed = 300; break;
            case 'CONCRETE': waveSpeed = 900; break;
        }

        const area = Math.PI * Math.pow((penstock.diameter / 1000) / 2, 2);
        const velocity = designFlow / (area || 1);

        const surgePressurePa = WATER_DENSITY * waveSpeed * velocity;
        const waterHammerSurgeBar = surgePressurePa / 100000;

        // 6. ROI
        const estimatedCapEx = powerOutputKW * 2000;
        const estimatedRevenue = annualProductionMWh * 100;
        const roiYears = estimatedRevenue > 0 ? estimatedCapEx / estimatedRevenue : 99;

        // 7. Analysis
        const cavitationRisk = netHead < 10 && velocity > 5;
        const resonanceRisk = penstock.length / waveSpeed > 0.5 && penstock.length / waveSpeed < 1.5;

        return {
            efficiency,
            powerOutputKW,
            annualProductionMWh,
            waterHammerSurgeBar,
            netHead,
            roiYears,
            analysis: {
                cavitationRisk,
                resonanceRisk,
                efficiencyTrend: efficiency > 0.9 ? 'rising' : 'stable'
            }
        };
    }
};
