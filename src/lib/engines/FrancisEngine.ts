import { BaseEngine } from './BaseEngine.ts';
import { RecommendationResult } from './types.ts';

export class FrancisEngine extends BaseEngine {
    type = 'francis';

    calculateEfficiency(head: number, _flow: number): number {
        return (head >= 40 && head <= 400) ? 92 : 88;
    }

    getRecommendationScore(head: number, flow: number, variation: string, quality: string): RecommendationResult {
        let score = 0;
        const reasons: string[] = [];
        const n_sq = this.calculateSpecificSpeed(head, flow);

        if (n_sq >= 70 && n_sq <= 350) {
            score += 30;
            reasons.push(`+ Optimal specific speed for Francis (${n_sq})`);
        }
        if (head >= 40 && head <= 400) {
            score += 10;
            reasons.push('+ Head is within standard medium-head range');
        }
        if (variation === 'variable') {
            score -= 10;
            reasons.push('- Fixed blade geometry less efficient for flow variations');
        }
        if (quality === 'abrasive') {
            score -= 15;
            reasons.push('- Submerged runner susceptible to silt erosion');
        }

        return { score, reasons };
    }

    getToleranceThresholds(): Record<string, number> {
        return { foundationMax: 0.04, shaftMax: 0.015, vibrationMax: 1.8 };
    }

    generateSpecs(head: number, flow: number): import('./types.ts').TurbineSpecs {
        return {
            runnerType: 'Mixed-flow',
            wickerGates: 'Adjustable', // Added back if needed or mapped to TurbineSpecs
            mounting: head > 100 ? 'Vertical' : 'Horizontal',
            specificSpeed: this.calculateSpecificSpeed(head, flow)
        };
    }
}
