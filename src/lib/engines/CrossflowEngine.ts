import { BaseEngine } from './BaseEngine.ts';
import { RecommendationResult } from './types.ts';

export class CrossflowEngine extends BaseEngine {
    type = 'crossflow';

    calculateEfficiency(_head: number, _flow: number): number {
        return 82; // Flat efficiency curve is a key feature
    }

    getRecommendationScore(head: number, flow: number, _variation: string, quality: string, t: import('i18next').TFunction): RecommendationResult {
        let score = 0;
        const reasons: string[] = [];
        const n_sq = this.calculateSpecificSpeed(head, flow); // Calculated but unused in reasons, keeping logic

        if (head < 100 && flow < 5) {
            score += 20;
            reasons.push(t('engines.crossflow.runOfRiver'));
        }
        if (quality === 'abrasive') {
            score += 20;
            reasons.push(t('engines.crossflow.selfCleaning'));
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

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
