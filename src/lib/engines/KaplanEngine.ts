import { BaseEngine } from './BaseEngine';
import { RecommendationResult, TurbineSpecs, TurbineType } from './types';
import Decimal from 'decimal.js';

/**
 * THE DOUBLE-REGULATION ENGINE (KAPLAN)
 * Low-Head Specialist (< 30m)
 * Master of Volume and Coordination
 */
export class KaplanEngine extends BaseEngine {
    type = 'kaplan';

    /**
     * THE CAM CURVE (Kombinatorna Kriva)
     * Coordinates Guide Vane Opening (Y) and Runner Blade Angle (Phi).
     * If they deviate from the optimal curve, efficiency drops and vibration rises.
     */
    checkCamCurve(
        guideVaneOpeningY: number, // % (0-100)
        runnerBladeAnglePhi: number, // % (0-100)
        head: number
    ): { onCam: boolean; deviation: number; message: string } {
        // Simplified Cam Model: Phi should roughly follow Y, but adjusted for Head.
        // At lower heads, Phi opens more for same Y.
        // Ideal Model: Phi_optimal = f(Y, Head)

        // Let's assume a linear base relationship for simplicity: Phi = Y * 0.9 + (30 - Head)
        // (Just a physics-flavored heuristic for the demo)
        const optimalPhi = (guideVaneOpeningY * 0.9) + (30 - head);
        const clampedOptimal = Math.max(0, Math.min(100, optimalPhi));

        const deviation = Math.abs(runnerBladeAnglePhi - clampedOptimal);

        // Tolerance: 2% deviation allowed
        if (deviation > 2.0) {
            return {
                onCam: false,
                deviation,
                message: `⚠️ OFF-CAM OPERATION! Deviation ${deviation.toFixed(1)}%. Efficiency dropping. Risk of cavitation/vibration.`
            };
        }

        return {
            onCam: true,
            deviation,
            message: '✅ ON-CAM. Double-Regulation perfectly synchronized.'
        };
    }

    /**
     * HUB INTEGRITY MONITOR (Environmental Guardian)
     * Checks if Hub Oil Pressure > Water Pressure.
     * If Oil < Water -> Water enters hub (Bad, but contained).
     * If Oil drops rapidly -> Oil leaking OUT to river (ENVIRONMENTAL DISASTER).
     */
    checkHubIntegrity(
        oilPressureBar: number,
        waterPressureBar: number
    ): { secure: boolean; message: string } {
        // Rule: Oil Pressure must be > Water Pressure + 0.2 bar (positive bias)
        // This ensures if a seal fails, oil leaks OUT slowly (visible) rather than water IN (invisible damage).
        // Wait, modern eco-turbines might want neutral, but traditional rule is P_oil > P_water.

        if (oilPressureBar < waterPressureBar) {
            return {
                secure: false,
                message: `🚨 CRITICAL: HUB PRESSURE LOW (${oilPressureBar} < ${waterPressureBar})! Water Ingress Risk! Mechanical damage imminent.`
            };
        }

        // Environmental Check: If pressure is TOO low vs expected, might be a leak
        if (oilPressureBar < 0.5) {
            return {
                secure: false,
                message: `⚠️ ENVIRONMENTAL ALERT: Hub Oil Pressure Critical (${oilPressureBar} bar). Possible leak to river! Check seals immediately.`
            };
        }

        return {
            secure: true,
            message: '✅ Hub Integrity Secure. Positive pressure maintained.'
        };
    }

    /**
     * THE VORTEX HUNTER
     * Monitors Draft Tube Pressure Pulsations.
     * High pulsations = Unstable Vortex (Rough Zone).
     */
    checkDraftTubePulsations(
        pulsationPeakToPeakPercent: number // Delta Pressure / Rated Head
    ): { stable: boolean; message: string } {
        // Limits:
        // < 2%: Smooth
        // 2-5%: Rough
        // > 5%: DANGEROUS (Structural resonance risk)

        if (pulsationPeakToPeakPercent > 5.0) {
            return {
                stable: false,
                message: `🚨 DANGER: DRAFT TUBE SURGE (${pulsationPeakToPeakPercent}%). Structural shaking! Change load immediately.`
            };
        }

        if (pulsationPeakToPeakPercent > 2.0) {
            return {
                stable: false,
                message: `⚠️ ROUGH ZONE: Moderate Pulsations (${pulsationPeakToPeakPercent}%). Vortex unstable. Avoid prolonged operation.`
            };
        }

        return { stable: true, message: '✅ Flow Stable. Draft tube quiet.' };
    }

    calculateEfficiency(head: number, flow: number): number {
        // Kaplan has flat efficiency curve due to double regulation
        return 93.5; // High peak efficiency
    }

    getRecommendationScore(
        head: number,
        flow: number,
        variation: string,
        quality: string,
        t: any
    ): RecommendationResult {
        // Kaplan loves Low Head (<30m) and variable flow
        const score = new Decimal(0);
        const notes: string[] = [];

        if (head > 40) return { score: 0, reasons: ['Head too high for Kaplan'] };

        if (head < 30) {
            return { score: 100, reasons: ['Perfect for Low Head & Variability'] };
        }

        return { score: 85, reasons: ['Good candidate'] };
    }

    getToleranceThresholds(): Record<string, number> {
        return {};
    }

    generateSpecs(head: number, flow: number): TurbineSpecs {
        const specs: TurbineSpecs = {
            type: 'kaplan',
            runnerType: 'Mixed-flow',
            specificSpeed: 300, // Placeholder
            numberOfBlades: 4,
            hubSealMaterial: 'Bio-safe Polymer'
        };
        return specs;
    }

    /**
     * Get confidence score based on cam curve alignment
     * Kaplan efficiency depends on proper coordination of guide vane and blade angle
     */
    public getConfidenceScore(head?: number, guideVaneOpening?: number, bladeAngle?: number): number {
        if (typeof head !== 'number' || typeof guideVaneOpening !== 'number' || typeof bladeAngle !== 'number') {
            return 50;
        }
        
        // Check cam curve alignment
        const camCheck = this.checkCamCurve(guideVaneOpening, bladeAngle, head);
        
        let score = 70;
        if (camCheck.onCam) score += 25;
        else if (camCheck.deviation < 10) score += 15;
        else if (camCheck.deviation < 20) score += 5;
        else score -= 20;
        
        // Bonus for low head (Kaplan specialty)
        if (head < 30) score += 5;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
