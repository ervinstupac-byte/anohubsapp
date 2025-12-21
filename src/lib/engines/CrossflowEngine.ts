import { BaseEngine } from './BaseEngine.ts';
import { RecommendationResult } from './types.ts';

export class CrossflowEngine extends BaseEngine {
    type = 'crossflow';

    calculateEfficiency(_head: number, _flow: number): number {
        return 82; // Flat efficiency curve is a key feature
    }

    getRecommendationScore(head: number, flow: number, _variation: string, quality: string): RecommendationResult {
        let score = 0;
        const reasons: string[] = [];

        if (head < 100 && flow < 5) {
            score += 20;
            reasons.push('+ High efficiency for small-scale run-of-river');
        }
        if (quality === 'abrasive') {
            score += 20;
            reasons.push('+ Self-cleaning runner handles debris and silt well');
        }

        return { score, reasons };
    }

    getToleranceThresholds(): Record<string, number> {
        return { foundationMax: 0.1, shaftMax: 0.08, vibrationMax: 4.0 };
    }

    generateSpecs(head: number, _flow: number): import('./types.ts').TurbineSpecs {
        return {
            runnerType: 'Drum',
            material: 'Stainless Steel',
            regulation: head < 50 ? 'Single' : 'Double',
            specificSpeed: this.calculateSpecificSpeed(head, _flow)
        };
    }
}
