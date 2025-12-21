import { BaseEngine } from './BaseEngine.ts';
import { RecommendationResult } from './types.ts';

export class PeltonEngine extends BaseEngine {
    type = 'pelton';

    calculateEfficiency(head: number, _flow: number): number {
        return head > 200 ? 91 : 85;
    }

    getRecommendationScore(head: number, flow: number, _variation: string, quality: string): RecommendationResult {
        let score = 0;
        const reasons: string[] = [];
        const n_sq = this.calculateSpecificSpeed(head, flow);

        if (n_sq < 30) {
            score += 30;
            reasons.push(`+ Ideal low specific speed (${n_sq})`);
        } else if (n_sq < 70) {
            score += 15;
            reasons.push('+ High specific speed for Pelton (requires multi-jet)');
        } else {
            score -= 20;
        }

        if (head > 200) {
            score += 15;
            reasons.push('+ High head provides optimal kinetic energy');
        } else if (head < 50) {
            score -= 100;
            reasons.push('- Insufficient pressure for impulse design');
        }

        if (quality === 'abrasive') {
            score += 10;
            reasons.push('+ Ease of bucket replacement handles silt better');
        }

        return { score, reasons };
    }

    getToleranceThresholds(): Record<string, number> {
        return { foundationMax: 0.08, shaftMax: 0.05, vibrationMax: 3.5 };
    }

    generateSpecs(head: number, flow: number): import('./types.ts').TurbineSpecs {
        const n_sq = this.calculateSpecificSpeed(head, flow);
        return {
            runnerType: 'Impulse Wheel',
            jets: n_sq > 30 ? 4 : 2,
            housing: 'Atmospheric pressure',
            specificSpeed: n_sq
        };
    }
}
