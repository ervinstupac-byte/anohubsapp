import Decimal from 'decimal.js';
import { ITurbineEngine, RecommendationResult, RiskResult } from './types.ts';
import BaseGuardian from '../../services/BaseGuardian';

export abstract class BaseEngine extends BaseGuardian implements ITurbineEngine {
    abstract type: string;

    protected G = new Decimal('9.80665');
    protected WATER_DENSITY = new Decimal('1000');

    calculatePower(head: number, flow: number, efficiency: number, penstock?: import('./types.ts').PenstockLossParams): number {
        let netHead = head;
        if (penstock) {
            const loss = this.calculateFrictionLoss(head, flow, penstock);
            netHead = Math.max(0, head - loss);
        }

        const h = new Decimal(netHead);
        const q = new Decimal(flow);
        const eta = new Decimal(efficiency).div(100);
        const powerW = this.WATER_DENSITY.mul(this.G).mul(h).mul(q).mul(eta);
        return powerW.div(1_000_000).toDecimalPlaces(3).toNumber();
    }

    calculateFrictionLoss(_head: number, flow: number, penstock: import('./types.ts').PenstockLossParams): number {
        if (penstock.diameter <= 0) return 0;

        // Manning's Equation for Friction Loss (SI)
        // hf = (n^2 * L * v^2) / R^(4/3)
        // v = Q / A
        // R = D / 4 (for full pipe)

        const n = new Decimal(penstock.roughness);
        const L = new Decimal(penstock.length);
        const Q = new Decimal(flow);
        const D = new Decimal(penstock.diameter);

        const area = Decimal.acos(-1).mul(D.pow(2)).div(4);
        const velocity = Q.div(area);
        const hydraulicRadius = D.div(4);

        const loss = n.pow(2).mul(L).mul(velocity.pow(2)).div(hydraulicRadius.pow(1.333));

        return loss.toDecimalPlaces(3).toNumber();
    }

    calculateEnergy(powerMW: number, flowVariation: string): number {
        const p = new Decimal(powerMW);
        const hours = new Decimal('8760');
        const capacityFactor = flowVariation === 'stable'
            ? new Decimal('0.85')
            : flowVariation === 'seasonal'
                ? new Decimal('0.60')
                : new Decimal('0.45');
        return p.mul(hours).mul(capacityFactor).div(1000).toDecimalPlaces(2).toNumber();
    }

    calculateSpecificSpeed(head: number, flow: number): number {
        const h = new Decimal(head);
        const q = new Decimal(flow);
        const n = new Decimal('1000');
        const sqrtQ = q.sqrt();
        const hPow75 = h.pow(0.75);
        return n.mul(sqrtQ).div(hPow75).toDecimalPlaces(0).toNumber();
    }

    abstract calculateEfficiency(head: number, flow: number): number;
    abstract getRecommendationScore(head: number, flow: number, variation: string, quality: string, t: import('i18next').TFunction): RecommendationResult;
    abstract getToleranceThresholds(): Record<string, number>;
    abstract generateSpecs(head: number, flow: number): import('./types.ts').TurbineSpecs;

    // Default confidence reporting for engines lacking domain-specific mapping
    public getConfidenceScore(..._args: any[]): number {
        // Conservative neutral score when no dedicated telemetry correlation is supplied
        return this.corrToScore(0);
    }

    calculateRisk(answers: Record<string, string>, thresholds: Record<string, import('./types.ts').TurbineThresholds>): RiskResult {
        let score = 0;
        let criticalCount = 0;

        Object.keys(answers).forEach((qId) => {
            const answer = (answers[qId] || '').toLowerCase();
            const threshold = thresholds[qId];

            if (!answer || !threshold) return;

            if (threshold.high.some((k: string) => answer.includes(k.toLowerCase()))) {
                score += 20;
                criticalCount++;
            } else if (threshold.medium.some((k: string) => answer.includes(k.toLowerCase()))) {
                score += 10;
            }
        });

        return { score, criticalCount };
    }
}
