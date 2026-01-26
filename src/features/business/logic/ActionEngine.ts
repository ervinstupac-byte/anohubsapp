import { TechnicalProjectState } from '../../../core/TechnicalSchema';
import BaseGuardian from '../../../services/BaseGuardian';

export type ActionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    priority: ActionPriority;
    actionType: 'OPTIMIZATION' | 'SAFETY' | 'MAINTENANCE';
    relatedMetric?: string;
    triggerValue?: string;
}

export class ActionEngine extends BaseGuardian {
    /**
     * Analyzes the current technical state and generates actionable recommendations.
     */
    static generateRecommendations(state: TechnicalProjectState): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // 1. Cavitation Analysis
        // Rule: Efficiency < 88% OR Cavitation Noise detected -> Close MIV logic (e.g., reduce load)
        const eff = state.hydraulic.efficiency || 0;
        const cavNoise = state.mechanical.acousticMetrics?.cavitationIntensity || 0;

        if (eff < 88 && eff > 0) {
            recommendations.push({
                id: 'opt-cav-eff',
                title: 'Optimize Guide Vane Angle',
                description: 'Turbine efficiency has dropped below 88%. Adjust guide vanes to restore optimal flow angle.',
                priority: 'MEDIUM',
                actionType: 'OPTIMIZATION',
                relatedMetric: 'Efficiency',
                triggerValue: `${eff.toFixed(1)}%`
            });
        }

        if (cavNoise > 20) {
            recommendations.push({
                id: 'safety-cav-active',
                title: 'Mitigate Active Cavitation',
                description: 'High frequency acoustic noise detected. Close MIV by 5% or increase tailwater level to suppress cavitation bubbles.',
                priority: 'HIGH',
                actionType: 'SAFETY',
                relatedMetric: 'Cavitation dB',
                triggerValue: castingToString(cavNoise)
            });
        }

        // 2. Vibration Analysis
        const vib = state.mechanical.vibration || 0;
        if (vib > 4.5) { // ISO 10816 Zone C/D
            recommendations.push({
                id: 'maint-vib-high',
                title: 'Critical Vibration Protocol',
                description: 'Vibration levels exceed ISO 10816 limits. Schedule immediate bearing inspection.',
                priority: 'HIGH',
                actionType: 'SAFETY',
                relatedMetric: 'Vibration',
                triggerValue: `${vib.toFixed(2)} mm/s`
            });
        } else if (vib > 2.5) {
            recommendations.push({
                id: 'maint-vib-warn',
                title: 'Monitor Shaft Runout',
                description: 'Vibration rising above baseline. Verify shaft alignment and check for thermal growth.',
                priority: 'MEDIUM',
                actionType: 'MAINTENANCE',
                relatedMetric: 'Vibration',
                triggerValue: `${vib.toFixed(2)} mm/s`
            });
        }

        // 3. Temperature Analysis
        const bearingTemp = state.mechanical.bearingTemp || 0;
        if (bearingTemp > 65) {
            recommendations.push({
                id: 'maint-temp-cool',
                title: 'Check Cooling System',
                description: 'Bearing temperature high. Verify cooling water flow rate and heat exchanger efficiency.',
                priority: 'MEDIUM',
                actionType: 'MAINTENANCE',
                relatedMetric: 'Bearing Temp',
                triggerValue: `${bearingTemp.toFixed(1)}°C`
            });
        }

        return recommendations;
    }

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}

function castingToString(val: number): string {
    return val.toFixed(1);
}
