// Fix type access by checking schema
import { TechnicalProjectState } from '../models/TechnicalSchema';
import { SiteParameters } from './StrategicPlanningService';
import Decimal from 'decimal.js';

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

const GRAVITY = new Decimal(9.81);
const WATER_DENSITY = new Decimal(1000);

export const LiveMathSync = {
    calculateSystemHealth: (
        site: SiteParameters,
        tech: TechnicalProjectState
    ): SystemHealth => {
        // Fallbacks if tech state is partial
        // Koristi ispravan pristup objektu: tech.site.grossHead umjesto tech.siteConditions
        const grossHead = new Decimal(tech.site?.grossHead || site.grossHead || 50);
        const designFlow = new Decimal(tech.site?.designFlow || site.ecologicalFlow || 5.0);
        const penstock = tech.penstock || { length: 1000, diameter: 1000, material: 'STEEL', roughness: 0.045 };

        const netHead = Decimal.max(0, grossHead.mul(0.95)); // Example loss factor

        // 2. Efficiency Calculation (Turbine specific curves)
        let efficiency = new Decimal(0.85);

        if (netHead.gt(100)) {
            efficiency = new Decimal(0.90);
        } else if (netHead.gt(30)) {
            efficiency = new Decimal(0.92);
        } else {
            efficiency = new Decimal(0.93);
        }

        // 3. Power Output
        // P = rho * g * H * Q * eta
        const powerOutputKW = WATER_DENSITY.mul(GRAVITY).mul(netHead).mul(designFlow).mul(efficiency).div(1000);

        // 4. Annual Production (Simple estimation)
        const annualProductionMWh = powerOutputKW.mul(8760).mul(0.5).div(1000);

        // 5. Water Hammer (Joukowsky)
        let waveSpeed = new Decimal(1000);
        const material = penstock.material || site.pipeMaterial || 'STEEL';
        switch (material) {
            case 'STEEL': waveSpeed = new Decimal(1200); break;
            case 'GRP': waveSpeed = new Decimal(400); break;
            case 'PEHD': waveSpeed = new Decimal(300); break;
            case 'CONCRETE': waveSpeed = new Decimal(900); break;
        }

        const PI = Decimal.acos(-1);
        const area = PI.mul(new Decimal(penstock.diameter).div(1000).div(2).pow(2));
        const velocity = designFlow.div(area.gt(0) ? area : 1);

        const surgePressurePa = WATER_DENSITY.mul(waveSpeed).mul(velocity);
        const waterHammerSurgeBar = surgePressurePa.div(100000);

        // 6. ROI
        const estimatedCapEx = powerOutputKW.mul(2000);
        const estimatedRevenue = annualProductionMWh.mul(100);
        const roiYears = estimatedRevenue.gt(0) ? estimatedCapEx.div(estimatedRevenue) : new Decimal(99);

        // 7. Analysis
        const cavitationRisk = netHead.lt(10) && velocity.gt(5);
        const resonanceRisk = new Decimal(penstock.length).div(waveSpeed).gt(0.5) && new Decimal(penstock.length).div(waveSpeed).lt(1.5);

        return {
            efficiency: efficiency.toNumber(),
            powerOutputKW: powerOutputKW.toNumber(),
            annualProductionMWh: annualProductionMWh.toNumber(),
            waterHammerSurgeBar: waterHammerSurgeBar.toNumber(),
            netHead: netHead.toNumber(),
            roiYears: roiYears.toNumber(),
            analysis: {
                cavitationRisk,
                resonanceRisk,
                efficiencyTrend: efficiency.gt(0.9) ? 'rising' : 'stable'
            }
        };
    }
};
