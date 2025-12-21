import { BaseEngine } from './BaseEngine.ts';
import { RecommendationResult } from './types.ts';

export class KaplanEngine extends BaseEngine {
    type = 'kaplan';

    calculateEfficiency(head: number, _flow: number): number {
        // Kaplan specificity: High efficiency at low heads and varying flows
        return head < 40 ? 94 : 90;
    }

    getRecommendationScore(head: number, flow: number, variation: string, _quality: string): RecommendationResult {
        let score = 0;
        const reasons: string[] = [];
        const n_sq = this.calculateSpecificSpeed(head, flow);

        if (n_sq > 350) {
            score += 30;
            reasons.push(`+ High specific speed detected (${n_sq})`);
        }
        if (head < 40) {
            score += 15;
            reasons.push('+ Ideal for low head applications');
        }
        if (head > 70) {
            score -= 50;
            reasons.push('- Head exceeds optimal Kaplan range');
        }
        if (variation === 'variable') {
            score += 20;
            reasons.push('+ Double regulation handles variable flow efficiently');
        }

        return { score, reasons };
    }

    getToleranceThresholds(): Record<string, number> {
        return { foundationMax: 0.05, shaftMax: 0.02, vibrationMax: 2.5 };
    }

    generateSpecs(head: number, flow: number): import('./types.ts').TurbineSpecs {
        return {
            runnerType: 'Adjustable Blade',
            spiralCase: head > 30 ? 'Steel' : 'Concrete',
            draftTube: 'Elbow type',
            specificSpeed: this.calculateSpecificSpeed(head, flow)
        };
    }
}
