import Decimal from 'decimal.js';
import { ITurbineEngine, RecommendationResult, RiskResult } from './types.ts';

export abstract class BaseEngine implements ITurbineEngine {
    abstract type: string;

    protected G = new Decimal('9.80665');
    protected WATER_DENSITY = new Decimal('1000');

    calculatePower(head: number, flow: number, efficiency: number): number {
        const h = new Decimal(head);
        const q = new Decimal(flow);
        const eta = new Decimal(efficiency).div(100);
        const powerW = this.WATER_DENSITY.mul(this.G).mul(h).mul(q).mul(eta);
        return powerW.div(1_000_000).toDecimalPlaces(3).toNumber();
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
    abstract getRecommendationScore(head: number, flow: number, variation: string, quality: string): RecommendationResult;
    abstract getToleranceThresholds(): Record<string, number>;
    abstract generateSpecs(head: number, flow: number): import('./types.ts').TurbineSpecs;

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
