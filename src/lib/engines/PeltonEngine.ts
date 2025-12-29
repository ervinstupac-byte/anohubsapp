import { BaseEngine } from './BaseEngine.ts';
import { RecommendationResult } from './types.ts';

export class PeltonEngine extends BaseEngine {
    type = 'pelton';

    calculateEfficiency(head: number, _flow: number): number {
        return head > 200 ? 91 : 85;
    }

    getRecommendationScore(head: number, flow: number, _variation: string, quality: string, t: import('i18next').TFunction): RecommendationResult {
        let score = 0;
        const reasons: string[] = [];
        const n_sq = this.calculateSpecificSpeed(head, flow);

        if (n_sq < 30) {
            score += 30;
            reasons.push(t('engines.pelton.idealNsq', { n_sq }));
        } else if (n_sq < 70) {
            score += 15;
            reasons.push(t('engines.pelton.highNsq'));
        } else {
            score -= 20;
        }

        if (head > 200) {
            score += 15;
            reasons.push(t('engines.pelton.highHead'));
        } else if (head < 50) {
            score -= 100;
            reasons.push(t('engines.pelton.lowPressure'));
        }

        if (quality === 'abrasive') {
            score += 10;
            reasons.push(t('engines.pelton.silt'));
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
