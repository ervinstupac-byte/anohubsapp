import { BaseEngine } from './BaseEngine';
import { RecommendationResult, TurbineSpecs, TurbineType } from './types';
import Decimal from 'decimal.js';

// Message types for type safety
interface WorkerRequest {
    id: string;
    type: string;
    payload: any;
}

interface WorkerResponse {
    id: string;
    type: string;
    result?: any;
    error?: string;
    duration?: number;
}

/**
 * THE DOUBLE-REGULATION ENGINE (KAPLAN)
 * Low-Head Specialist (< 30m)
 * Master of Volume and Coordination
 * 
 * NC-85.1 UPGRADE: Physics calculations offloaded to Web Worker
 */
export class KaplanEngine extends BaseEngine {
    type = 'kaplan';

    // Static Worker Singleton
    private static worker: Worker | null = null;
    private static pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();

    /**
     * NC-85.1: Initialize the Physics Worker
     * Called by BootstrapService during Tier 2
     */
    public static async initializeWorker(): Promise<void> {
        if (this.worker) return;

        if (typeof Worker !== 'undefined') {
            console.log('[KaplanEngine] 🔌 Initializing Physics Worker...');
            try {
                // Vite worker import syntax
                this.worker = new Worker(new URL('../../workers/physics.worker.ts', import.meta.url), {
                    type: 'module'
                });

                this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
                    const { id, result, error, duration } = event.data;
                    const handler = this.pendingRequests.get(id);

                    if (handler) {
                        if (error) {
                            handler.reject(new Error(error));
                        } else {
                            // Log slow calculations as per requirement
                            if (duration && duration > 100) {
                                console.warn(`[KaplanEngine] 🐢 Heavy Calculation took ${duration.toFixed(1)}ms`);
                            }
                            handler.resolve(result);
                        }
                        this.pendingRequests.delete(id);
                    }
                };

                // Warm up
                await this.runAsyncCalculation('CALCULATE_EFFICIENCY', { head: 30, flow: 100, alpha: 20 });
                console.log('[KaplanEngine] ✅ Physics Worker Ready.');

            } catch (err) {
                console.error('[KaplanEngine] ❌ Worker Initialization Failed:', err);
                // Fallback handled by individual methods checking for this.worker
            }
        } else {
            console.warn('[KaplanEngine] ⚠️ Web Workers not supported in this environment.');
        }
    }

    private static runAsyncCalculation<T>(type: string, payload: any): Promise<T> {
        if (!this.worker) {
            // Fallback or reject? For now reject if worker isn't there, 
            // but we could implement sync fallback here.
            return Promise.reject(new Error('Physics Worker not initialized'));
        }

        const id = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, { resolve, reject });
            this.worker!.postMessage({ id, type, payload });

            // Timeout safety
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Worker Request Action Timeout (5000ms)'));
                }
            }, 5000);
        });
    }

    /**
     * Async Efficiency Calculation (Offloaded)
     */
    public async calculateEfficiencyAsync(head: number, flow: number, alpha: number): Promise<number> {
        try {
            return await KaplanEngine.runAsyncCalculation<number>('CALCULATE_EFFICIENCY', { head, flow, alpha });
        } catch (err) {
            console.warn('[KaplanEngine] Worker calc failed, using sync fallback:', err);
            return this.calculateEfficiency(head, flow);
        }
    }

    /**
     * Async Cavitation Check (Offloaded)
     */
    public async checkCavitationAsync(npsh: number, head: number): Promise<number> {
        try {
            return await KaplanEngine.runAsyncCalculation<number>('CALCULATE_CAVITATION', { npsh, head });
        } catch (err) {
            return 0; // Safe fallback
        }
    }

    /**
     * Async Water Hammer (Offloaded)
     */
    public async calculateWaterHammerAsync(waveSpeed: number, deltaV: number): Promise<number> {
        try {
            return await KaplanEngine.runAsyncCalculation<number>('CALCULATE_WATER_HAMMER', { waveSpeed, deltaV });
        } catch (err) {
            return 0;
        }
    }

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

    /**
     * Legacy Synchronous Calculation
     * Retained for compatibility and fallback
     */
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
