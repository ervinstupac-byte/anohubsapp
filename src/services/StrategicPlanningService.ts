import { TurbineType } from '../models/turbine/TurbineFactory';
import Decimal from 'decimal.js';
import * as PhysicsLogic from '../features/physics-core/PhysicsCalculations.logic';

export type PipeMaterial = 'GRP' | 'STEEL' | 'CONCRETE' | 'PEHD';

export interface SiteParameters {
    grossHead: number; // m
    pipeLength: number; // m
    pipeDiameter: number; // mm
    pipeMaterial: 'GRP' | 'STEEL' | 'CONCRETE' | 'PEHD';
    // Granular Control (Cerebro Upgrade)
    wallThickness: number; // mm
    boltClass: '4.6' | '5.6' | '8.8' | '10.9'; // Synced with TechnicalSchema BoltGrade
    corrosionProtection: 'NONE' | 'PAINT' | 'GALVANIZED';

    waterQuality: 'CLEAN' | 'SILT' | 'SAND' | 'GLACIAL'; // Synced with TechnicalSchema
    flowDurationCurve: { flow: number; probability: number }[]; // Q vs % exceedance
    ecologicalFlow: number; // m3/s (Must remain in river)
}

export interface InspectionImage {
    id: string;
    componentId: string;
    description: string; // German Technical Caption
    src: string; // Base64 or Blob URL
    metadata: {
        timestamp: string;
        gps: string;
    };
    aiTags: string[]; // e.g., 'Kavitation'
}

export interface ImpactAnalysis {
    safetyFactor: number; // > 2.0 is Good
    hoopStressMPa: number;
    boltStressStatus: 'OK' | 'CRITICAL' | 'FAIL';
    corrosionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    lifespanEstimateyears: number;
    warnings: { key: string; params?: any }[]; // Changed string[] to structured warning object
}

export interface FeasibilityResult {
    netHead: number;
    frictionLoss: number;
    optimalFlow: number; // Design flow (Q_design)
    annualProductionMWh: number;
    recommendedAggregates: {
        count: number;
        type: string; // "2x Francis" or "1x Kaplan"
        reasoning: string;
    };
}

export interface Bid {
    manufacturer: string;
    turbineType: TurbineType;
    ratedPowerMW: number;
    efficiencyAtBestPoint: number; // %
    runnerDiameter: number; // mm
    price: number;
    guaranteedIncluded: boolean;
}

export interface BidEvaluation {
    isRealistic: boolean;
    risks: string[];
    efficiencyGap: number; // Difference between claimed and theoretical max
    score: number; // 0-100
    recommendation: 'SHORTLIST' | 'REJECT' | 'NEGOTIATE';
}

export interface LogisticsConstraints {
    accessRoadWidth: number; // m
    tunnelHeight: number; // m
    bridgeCapacity: number; // tons
    nearestPortDistance: number; // km
}

export class StrategicPlanningService {

    /**
     * HYDRAULIC FEASIBILITY ENGINE
     * Calculates Net Head and Annual Production
     */
    static calculateFeasibility(site: SiteParameters): FeasibilityResult {
        try {
            // SAFEGUARD: Basic Input Validation
            if (!site || site.grossHead <= 0 || site.pipeDiameter <= 0) {
                return {
                    netHead: 0,
                    frictionLoss: 0,
                    optimalFlow: 0,
                    annualProductionMWh: 0,
                    recommendedAggregates: { count: 0, type: 'N/A', reasoning: 'Insufficient data' }
                };
            }

            // 1. Calculate Friction Head Loss (Darcy-Weisbach with professional Swamee-Jain)
            const ROUGHNESS_MAP: Record<string, number> = {
                'STEEL': 0.045,
                'GRP': 0.01,
                'PEHD': 0.005,
                'CONCRETE': 1.5
            };
            const roughnessMM = new Decimal(ROUGHNESS_MAP[site.pipeMaterial] || 0.045);

            const L = new Decimal(site.pipeLength || 100);
            const D = new Decimal(site.pipeDiameter).div(1000); // Convert mm to meters

            // Optimal design flow (usually Q30)
            const qDesignRaw = (site.flowDurationCurve || []).find(p => p.probability >= 30)?.flow || 10;
            const qDesign = new Decimal(qDesignRaw);
            const qEco = new Decimal(site.ecologicalFlow || 0);
            const usefulFlow = Decimal.max(0, qDesign.sub(qEco));

            const velocity = PhysicsLogic.calculateFlowVelocity(usefulFlow, D);
            const Re = PhysicsLogic.calculateReynoldsNumber(velocity, D);
            const f = PhysicsLogic.calculateFrictionFactor(Re, roughnessMM, D); // roughnessMM is passed, logic handles /1000
            const hLoss = PhysicsLogic.calculateHeadLoss(f, L, D, velocity);

            const gHead = new Decimal(site.grossHead);
            const hNet = Decimal.max(0, gHead.sub(hLoss));

            // 2. Annual Production Calculation (Professional Integration)
            let totalEnergyKWh = new Decimal(0);
            const efficiency = new Decimal(0.91);
            const gravity = new Decimal(9.81);
            const density = new Decimal(1000);

            const fdc = site.flowDurationCurve || [];
            if (fdc.length > 1) {
                for (let i = 0; i < fdc.length - 1; i++) {
                    const p1 = fdc[i];
                    const p2 = fdc[i + 1];

                    const probDiff = new Decimal(p2.probability).sub(p1.probability).div(100);
                    const hours = probDiff.mul(8760);

                    const avgFlow = new Decimal(p1.flow).plus(p2.flow).div(2);
                    const turbineFlow = Decimal.min(avgFlow.sub(qEco), qDesign);

                    if (turbineFlow.gt(0)) {
                        // Power P = rho * g * Q * H * eta / 1000 (for kW)
                        const powerKW = density.mul(gravity).mul(turbineFlow).mul(hNet).mul(efficiency).div(1000);
                        totalEnergyKWh = totalEnergyKWh.plus(powerKW.mul(hours));
                    }
                }
            } else {
                // Simplified FALLBACK if FDC is missing
                const hours = new Decimal(8760).mul(0.65); // 65% Capacity Factor estimate
                const powerKW = density.mul(gravity).mul(usefulFlow).mul(hNet).mul(efficiency).div(1000);
                totalEnergyKWh = powerKW.mul(hours);
            }

            // 3. Aggregate Recommendation
            // If Q_min / Q_max ratio is small (< 10%), a single turbine struggles.
            const fdcSafe = site.flowDurationCurve && site.flowDurationCurve.length > 0 ? site.flowDurationCurve : [{ flow: 10, probability: 0 }, { flow: 1, probability: 100 }];
            const variability = fdcSafe[fdcSafe.length - 1].flow / fdcSafe[0].flow;
            let recommendation = { count: 1, type: 'Unknown', reasoning: '' };

            if (hNet.lt(30)) {
                recommendation.type = 'Kaplan';
                if (variability < 0.2) {
                    recommendation.count = 2;
                    recommendation.reasoning = 'insights.kaplan_double_reg';
                } else {
                    recommendation.reasoning = 'insights.kaplan_single';
                }
            } else if (hNet.lt(400)) {
                recommendation.type = 'Francis';
                if (usefulFlow.lt(qDesign.mul(0.3))) { // If often running part load
                    recommendation.count = 2;
                    recommendation.reasoning = 'insights.francis_part_load';
                }
            } else {
                recommendation.type = 'Pelton';
            }

            return {
                netHead: isNaN(hNet.toNumber()) ? 0 : hNet.toNumber(),
                frictionLoss: isNaN(hLoss.toNumber()) ? 0 : hLoss.toNumber(),
                optimalFlow: isNaN(usefulFlow.toNumber()) ? 0 : usefulFlow.toNumber(),
                annualProductionMWh: isNaN(totalEnergyKWh.toNumber()) ? 0 : (totalEnergyKWh.div(1000).toNumber()),
                recommendedAggregates: recommendation
            };
        } catch (error) {
            console.error("CRITICAL MATH ERROR in Feasibility Calc:", error);
            // Fallback to safe 0 values to prevent UI crash
            return {
                netHead: 0,
                frictionLoss: 0,
                optimalFlow: 0,
                annualProductionMWh: 0,
                recommendedAggregates: { count: 0, type: 'Error', reasoning: 'Calculation Failed' }
            };
        }
    }

    /**
     * IMPACT ENGINE (CEREBRO)
     * Validates granular choices against physics (Stress, Corrosion, etc.)
     */
    static validateImpact(site: SiteParameters): ImpactAnalysis {
        const warnings: { key: string; params?: any }[] = [];

        // 1. Hoop Stress Calculation (Barlow's Formula)
        // P = rho * g * H
        const staticHead = site.grossHead * 1.2; // +20% surge allowance
        const pressureMPa = (1000 * 9.81 * staticHead) / 1000000;

        const r_outer = site.pipeDiameter / 2;
        const thickness = site.wallThickness || 10; // Default safety

        // sigma = (P * D) / (2 * t)
        const hoopStressMPa = (pressureMPa * site.pipeDiameter) / (2 * thickness);

        let yieldStrength = 235; // Default Steel S235
        if (site.pipeMaterial === 'GRP') yieldStrength = 60; // Approx
        if (site.pipeMaterial === 'PEHD') yieldStrength = 20;

        const safetyFactor = yieldStrength / hoopStressMPa;

        if (safetyFactor < 1.5) {
            warnings.push({
                key: 'warnings.wall_thin_burst',
                params: { thickness, head: staticHead.toFixed(0), sf: safetyFactor.toFixed(2) }
            });
        }

        // 2. Bolt Class Validation
        // Higher pressure requires stronger bolts
        let boltStatus: 'OK' | 'CRITICAL' | 'FAIL' = 'OK';
        if (pressureMPa > 2.5 && site.boltClass === '4.6') {
            warnings.push({ key: 'warnings.bolt_failure_46' });
            boltStatus = 'FAIL';
        }

        // 3. Corrosion & Lifespan Logic
        let lifespan = 50;
        if (site.waterQuality !== 'CLEAN' && site.corrosionProtection === 'NONE' && site.pipeMaterial === 'STEEL') {
            lifespan = 10;
            warnings.push({ key: 'warnings.corrosion_steel' });
        }
        if (site.corrosionProtection === 'PAINT' && site.waterQuality === 'SILT') {
            lifespan = 20;
            warnings.push({ key: 'warnings.corrosion_paint' });
        }

        return {
            safetyFactor,
            hoopStressMPa,
            boltStressStatus: boltStatus,
            corrosionRisk: lifespan < 25 ? 'HIGH' : lifespan < 40 ? 'MEDIUM' : 'LOW',
            lifespanEstimateyears: lifespan,
            warnings
        };
    }

    /**
     * THE BID EVALUATOR
     * Validates manufacturer claims against physics
     */
    static evaluateBid(bid: Bid, site: SiteParameters): BidEvaluation {
        const risks: string[] = [];
        let score = 100;

        // 1. Efficiency Reality Check
        // Modern Francis peak ~94-95%, Kaplan ~93-94%, Pelton ~91-92%
        const maxTheoreticalEta = ({
            'FRANCIS': 95.5,
            'KAPLAN': 94.5,
            'PELTON': 92.5,
            'CROSSFLOW': 90.0
        } as Record<TurbineType, number>)[bid.turbineType];

        if (bid.efficiencyAtBestPoint > maxTheoreticalEta) {
            risks.push(`Sumnjivo visoka efikasnost (${bid.efficiencyAtBestPoint}%). Fizički limit je oko ${maxTheoreticalEta}%. Tražiti IEC 60041 test izvještaj.`);
            score -= 20;
        }

        // 2. Type Mismatch (Application Matrix Validation)
        // Kaplan on high head? Francis on low head?
        const H = site.grossHead;

        if (bid.turbineType === 'KAPLAN' && H > 70) {
            risks.push('LEGACY WARNING: Kaplan na padu > 70m nosi ogroman rizik od kavitacije. Potrebna duboka potopljenost (negativna kota).');
            score -= 30;
        }

        if (bid.turbineType === 'FRANCIS' && H < 20) {
            risks.push('Ekonomska neisplativost: Francis na padu < 20m zahtijeva ogroman spiralni cjevovod.');
            score -= 15;
        }

        // 3. Price Check (Simplified)
        // E.g., if price is too low, suspect bad materials
        // Simulated threshold
        const estimatedMarketPrice = bid.ratedPowerMW * 1000000; // 1M per MW approx
        if (bid.price < estimatedMarketPrice * 0.6) {
            risks.push('Cijena značajno ispod tržišne. Provjeriti porijeklo čelika i referentnu listu.');
            score -= 10;
        }

        return {
            isRealistic: score > 70,
            risks,
            efficiencyGap: Math.max(0, bid.efficiencyAtBestPoint - maxTheoreticalEta),
            score,
            recommendation: score > 80 ? 'SHORTLIST' : score > 50 ? 'NEGOTIATE' : 'REJECT'
        };
    }

    /**
     * LOGISTICS CALCULATOR
     * Calculates split requirements based on transport limits
     */
    static checkLogistics(
        runnerDiameterMM: number,
        weightTons: number,
        constraints: LogisticsConstraints
    ): { feasible: boolean; warnings: string[]; solution: string } {
        const warnings: string[] = [];
        const runnerDiameterM = runnerDiameterMM / 1000;

        // 1. Height/Width Check (Tunnel)
        // Transport height usually Diameter + 0.5m trailer
        if (runnerDiameterM + 0.5 > constraints.tunnelHeight) {
            warnings.push(`Rotor (${runnerDiameterM.toFixed(2)}m) je viši od tunela (${constraints.tunnelHeight}m).`); // Needs param logic update in separate ticket if critical
        }
        // ... Logistcs kept as strings for now or update later if needed
        if (warnings.length > 0) {
            return {
                feasible: false,
                warnings,
                solution: 'insights.split_rotor_required'
            };
        }
        return {
            feasible: true,
            warnings: [],
            solution: 'insights.transport_standard'
        };
    }
}

// Regulatory Gantt Data Model
export const REGULATORY_STEPS = [
    { id: '1', name: 'Energetska Dozvola', durationMonths: 6, dependsOn: [] },
    { id: '2', name: 'Lokacijski Uslovi', durationMonths: 3, dependsOn: ['1'] },
    { id: '3', name: 'Studija Uticaja (EIA)', durationMonths: 12, dependsOn: ['2'] },
    { id: '4', name: 'Građevinska Dozvola', durationMonths: 4, dependsOn: ['3'] },
    { id: '5', name: 'Vodna Saglasnost', durationMonths: 3, dependsOn: ['3'] }
];
