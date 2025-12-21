// Strategic Planning & Feasibility Service
// Pre-construction analysis, hydraulic optimization, and bid evaluation

export type PipeMaterial = 'STEEL' | 'GRP' | 'PEHD' | 'CONCRETE';

export interface SiteParameters {
    grossHead: number; // m
    pipeLength: number; // m
    pipeDiameter: number; // mm
    pipeMaterial: PipeMaterial;
    waterQuality: 'CLEAN' | 'SILT' | 'SAND' | 'GLACIAL'; // Added for Knowledge Bridge
    flowDurationCurve: { flow: number; probability: number }[]; // Q vs % exceedance
    ecologicalFlow: number; // m3/s (Must remain in river)
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
    turbineType: 'kaplan' | 'francis' | 'pelton';
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
        // 1. Calculate Friction Head Loss (Darcy-Weisbach approximation or Hazen-Williams)
        // Simplified using specific roughness approximation

        const roughness = {
            'STEEL': 0.045, // mm
            'GRP': 0.01,
            'PEHD': 0.005,
            'CONCRETE': 1.5
        }[site.pipeMaterial];

        const D = site.pipeDiameter / 1000; // m
        const L = site.pipeLength;
        const A = Math.PI * Math.pow(D / 2, 2);

        // Find optimal design flow (simplified: usually between Q30 and Q40 on curve)
        // Let's assume Q_design is set based on Q30 for calculation
        // In real app, we iterate to find NPV max. Here we pick Q30.
        const qDesign = site.flowDurationCurve.find(p => p.probability >= 30)?.flow || 10;
        const usefulFlow = Math.max(0, qDesign - site.ecologicalFlow);

        const velocity = usefulFlow / A;

        // Darcy-Weisbach: hf = f * (L/D) * (v^2/2g)
        // f approximation (Swamee-Jain is better, but constant for demo)
        const f = 0.02; // Placeholder, would depend on Reynolds number

        const hLoss = f * (L / D) * (Math.pow(velocity, 2) / (2 * 9.81));
        const hNet = site.grossHead - hLoss;

        // 2. Annual Production Calculation (Integration of FDC)
        let totalEnergyKWh = 0;
        const efficiency = 0.91; // Global system efficiency estimate

        // Iterate through probability steps (e.g. 10% steps)
        for (let i = 0; i < site.flowDurationCurve.length - 1; i++) {
            const p1 = site.flowDurationCurve[i];
            const p2 = site.flowDurationCurve[i + 1];

            const probDiff = (p2.probability - p1.probability) / 100; // fraction of year
            const hours = probDiff * 8760;

            const avgFlow = (p1.flow + p2.flow) / 2;
            const turbineFlow = Math.min(avgFlow - site.ecologicalFlow, qDesign);

            if (turbineFlow > 0) {
                // Power P = rho * g * Q * H * eta
                const powerKW = 1000 * 9.81 * turbineFlow * hNet * efficiency / 1000;
                totalEnergyKWh += powerKW * hours;
            }
        }

        // 3. Aggregate Recommendation
        // If Q_min / Q_max ratio is small (< 10%), a single turbine struggles.
        const variability = site.flowDurationCurve[site.flowDurationCurve.length - 1].flow / site.flowDurationCurve[0].flow;
        let recommendation = { count: 1, type: 'Unknown', reasoning: '' };

        if (hNet < 30) {
            recommendation.type = 'Kaplan';
            if (variability < 0.2) {
                recommendation.count = 2;
                recommendation.reasoning = 'Velike varijacije protoka. Kaplan double-regulated je dobar, ali 2 jedinice (1/3 + 2/3) pokrivaju minimum bolje.';
            } else {
                recommendation.reasoning = 'Stabilan protok, 1 velika Kaplan turbina je najjeftinija opcija.';
            }
        } else if (hNet < 400) {
            recommendation.type = 'Francis';
            if (usefulFlow < 0.3 * qDesign) { // If often running part load
                recommendation.count = 2;
                recommendation.reasoning = 'Francis ima lošu efikasnost ispod 40%. Bolje 2 manje jedinice za pokrivanje niskih voda.';
            }
        } else {
            recommendation.type = 'Pelton';
        }

        return {
            netHead: hNet,
            frictionLoss: hLoss,
            optimalFlow: usefulFlow,
            annualProductionMWh: totalEnergyKWh / 1000,
            recommendedAggregates: recommendation
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
        const maxTheoreticalEta = {
            'francis': 95.5,
            'kaplan': 94.5,
            'pelton': 92.5
        }[bid.turbineType];

        if (bid.efficiencyAtBestPoint > maxTheoreticalEta) {
            risks.push(`Sumnjivo visoka efikasnost (${bid.efficiencyAtBestPoint}%). Fizički limit je oko ${maxTheoreticalEta}%. Tražiti IEC 60041 test izvještaj.`);
            score -= 20;
        }

        // 2. Type Mismatch (Application Matrix Validation)
        // Kaplan on high head? Francis on low head?
        const H = site.grossHead;

        if (bid.turbineType === 'kaplan' && H > 70) {
            risks.push('LEGACY WARNING: Kaplan na padu > 70m nosi ogroman rizik od kavitacije. Potrebna duboka potopljenost (negativna kota).');
            score -= 30;
        }

        if (bid.turbineType === 'francis' && H < 20) {
            risks.push('Ekonomska neisplativost: Francis na padu < 20m zahtijeva ogroman spiralni cjevovod.');
            score -= 15;
        }

        // 3. Price Check (Simplified)
        // E.g., if price is too low, suspect bad materials
        // Mock threshold
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
            warnings.push(`Rotor (${runnerDiameterM.toFixed(2)}m) je viši od tunela (${constraints.tunnelHeight}m).`);
        }

        if (runnerDiameterM > constraints.accessRoadWidth) {
            warnings.push(`Rotor je širi od pristupnog puta.`);
        }

        // 2. Weight Check (Bridge)
        if (weightTons > constraints.bridgeCapacity) {
            warnings.push(`Težina (${weightTons}t) prelazi nosivost mosta (${constraints.bridgeCapacity}t).`);
        }

        if (warnings.length > 0) {
            return {
                feasible: false,
                warnings,
                solution: 'Obavezan "Split Rotor" dizajn (iz dva dijela) ili zavarivanje na licu mjesta.'
            };
        }

        return {
            feasible: true,
            warnings: [],
            solution: 'Standardni transport moguć.'
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
