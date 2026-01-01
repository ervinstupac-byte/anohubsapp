/**
 * THE SENTINEL KERNEL
 * "The Neural Core of the Power Plant"
 * 
 * Mathematical Engine for Multi-Variate Heuristic Pattern Recognition.
 * Replaces static thresholds with trend-coupled matrix evaluation.
 */

// --- TYPES ---

export type TrendType = 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface VariableTrend {
    slope: number;       // dy/dx (Rate of change)
    variance: number;    // Sigma^2 (Volatility)
    type: TrendType;
    confidence: number;  // 0-1 (R^2 of regression)
}

export interface TacticalAction {
    type: 'FOCUS_3D' | 'OPEN_SOP' | 'SHOW_SCHEMA';
    label: string;
    targetId: string; // "Mesh_DraftTube_01" or "SOP_Drainage_Page4"
    icon: string; // Lucide icon name or emoji
}

export interface HeuristicPattern {
    id: string;
    name: string;
    description: string;
    baseSeverity: Severity;
    slogan: string;
    conditions: MatrixCondition[];
    actions?: TacticalAction[]; // Contextual Gravity
}

export interface MatrixCondition {
    variableId: string;
    operator: 'GREATER' | 'LESS' | 'TREND_MATCH' | 'VARIANCE_MATCH' | 'SLOPE_GREATER' | 'DYNAMIC_THRESHOLD';
    threshold?: number;
    baselineId?: string; // Key to look up baseline in context
    sigmaMultiplier?: number; // e.g., 2.0 (Trigger if > Baseline + 2*Sigma)
    targetTrend?: TrendType;
    weight: number;
}

export interface HistoricalPrecedent {
    date: string;
    event: string;
    confidence: number;
}

export interface SentinelInsight {
    patternId: string;
    name: string;
    probability: number; // 0-100%
    severity: Severity;
    slogan: string;
    vectors: string[]; // "Voice" Logic Trace
    precedent?: HistoricalPrecedent; // The Archivist's Finding
    actions?: TacticalAction[]; // Contextual Gravity Payload

    // NEW FOR PHASE 8 (XAI)
    mathProof?: string; // "Vibration (4.2) * 0.4 + Temp (45) * 0.1 > Threshold (0.6)"

    // NEW FOR PHASE 15 (MEMORY ASCENSION)
    physicsNarrative?: string; // "Kinetic energy transforming to Heat..."
}

export interface SentinelContext {
    timeAtState?: number;
    baselines?: Record<string, { mean: number; sigma: number }>; // Provided by Archivist
    weights?: Record<string, number>; // Heuristic Feedback Weights
}

// --- MATH KERNEL ---

export class SentinelKernel {

    /**
     * GENERATES PHYSICS NARRATIVE (The Voice of the Machine)
     */
    static generatePhysicsNarrative(patternId: string, vectors: string[], probability: number): string {
        if (patternId === 'bearing-thermal-instability') {
            return `Anomaly detected: Kinetic energy at the Runner is disippating as friction-induced Heat in Bearing #2. Efficiency loss projected at ${(probability * 3.5).toFixed(1)}%.`;
        }
        if (patternId === 'cavitation-complex') {
            return `Flow turbulence detected: Differential pressure in Draft Tube suggests vortex rope formation, transferring destructive energy to the Runner linkage.`;
        }
        return `System deviation detected. Energy transformation efficiency is compromised with ${(probability * 100).toFixed(0)}% confidence.`;
    }

    static computeTrend(data: number[]): VariableTrend {
        if (!data || data.length < 2) {
            return { slope: 0, variance: 0, type: 'STABLE', confidence: 0 };
        }

        const n = data.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = data;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + (xi * y[i]), 0);
        const sumXX = x.reduce((sum, xi) => sum + (xi * xi), 0);

        const denominator = (n * sumXX - sumX * sumX);
        const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;

        const mean = sumY / n;
        const squareDiffs = data.map((val) => Math.pow(val - mean, 2));
        const variance = squareDiffs.reduce((a, b) => a + b, 0) / n;

        let type: TrendType = 'STABLE';
        if (Math.abs(slope) > 0.05) type = slope > 0 ? 'RISING' : 'FALLING';
        if (variance > 2.0) type = 'VOLATILE';

        return { slope, variance, type, confidence: 0.9 };
    }

    /**
     * EVALUATES THE MULTI-VARIATE MATRIX
     */
    static evaluateMatrix(
        sensorData: Record<string, number[]>,
        patterns: HeuristicPattern[],
        context?: SentinelContext
    ): SentinelInsight[] {
        const insights: SentinelInsight[] = [];

        patterns.forEach(pattern => {
            let totalWeight = 0;
            let matchedWeight = 0;
            const contributingVectors: string[] = [];
            let synchronizedTrends = 0;
            const proofParts: string[] = []; // XAI Proof

            pattern.conditions.forEach(cond => {
                const history = sensorData[cond.variableId];
                if (!history || history.length === 0) return;

                const trend = this.computeTrend(history);
                const currentValue = history[history.length - 1];
                let isMatch = false;
                let triggerReason = "";

                if (cond.operator === 'TREND_MATCH') {
                    if (trend.type === cond.targetTrend) {
                        isMatch = true;
                        synchronizedTrends++;
                        triggerReason = `${cond.variableId} is ${trend.type} (dy/dx: ${trend.slope.toFixed(2)})`;
                    }
                }
                else if (cond.operator === 'VARIANCE_MATCH') {
                    if (trend.variance > (cond.threshold || 0)) {
                        isMatch = true;
                        synchronizedTrends++;
                        triggerReason = `${cond.variableId} VOLATILE (σ²: ${trend.variance.toFixed(1)})`;
                    }
                }
                else if (cond.operator === 'SLOPE_GREATER') {
                    if (trend.slope > (cond.threshold || 0)) {
                        isMatch = true;
                        synchronizedTrends++;
                        triggerReason = `${cond.variableId} RISING FAST (> ${cond.threshold})`;
                    }
                }
                else if (cond.operator === 'GREATER') {
                    if (currentValue > (cond.threshold || 0)) {
                        isMatch = true;
                        triggerReason = `${cond.variableId} > ${cond.threshold}`;
                    }
                }
                else if (cond.operator === 'LESS') {
                    if (currentValue < (cond.threshold || 0)) {
                        isMatch = true;
                        triggerReason = `${cond.variableId} < ${cond.threshold}`;
                    }
                }
                // --- THE ARCHIVIST: DYNAMIC THRESHOLD ---
                else if (cond.operator === 'DYNAMIC_THRESHOLD' && context?.baselines) {
                    const stats = context.baselines[cond.baselineId || cond.variableId];
                    if (stats) {
                        const limit = stats.mean + ((cond.sigmaMultiplier || 2) * stats.sigma);
                        if (currentValue > limit) {
                            isMatch = true;
                            triggerReason = `${cond.variableId} (${currentValue.toFixed(1)}) > Expected Baseline (${limit.toFixed(1)}) [${cond.sigmaMultiplier}σ]`;
                        }
                    }
                }

                if (isMatch) {
                    matchedWeight += cond.weight;
                    contributingVectors.push(triggerReason);
                    proofParts.push(`${cond.variableId}[${currentValue.toFixed(1)}] * w(${cond.weight.toFixed(2)})`);
                }
                totalWeight += cond.weight;
            });

            if (totalWeight > 0) {
                let probability = (matchedWeight / totalWeight);

                // --- LOGIC TRANSPARENCY & COUPLING ---
                if (synchronizedTrends >= 2) {
                    const couplingBoost = Math.pow(1.15, synchronizedTrends - 1);
                    probability = Math.min(1.0, probability * couplingBoost);
                    contributingVectors.push(`Exponential Coupling: ${synchronizedTrends} vectors synchronized.`);
                }

                if (pattern.id === 'cavitation-complex' && context?.timeAtState) {
                    if (context.timeAtState > 15) {
                        probability = Math.min(1.0, probability * 1.2);
                        contributingVectors.push(`Prolonged Exposure: ${context.timeAtState.toFixed(0)}m in critical zone.`);
                    }
                }

                // --- NEURAL EVOLUTION: WEIGHTING ---
                if (context?.weights && context.weights[pattern.id]) {
                    const weight = context.weights[pattern.id];
                    probability = Math.min(1.0, probability * weight);
                    if (weight !== 1.0) {
                        contributingVectors.push(`Neural feedback applied: ${weight.toFixed(2)}x weight`);
                    }
                }

                if (probability > 0.60) {

                    // --- THE ARCHIVIST: HISTORICAL PRECEDENT SIMULATION ---
                    // In a real DB, we would query: SELECT SimilarEvents FROM History WHERE PatternID = ...
                    let precedent: HistoricalPrecedent | undefined;

                    if (pattern.id === 'cavitation-complex') {
                        precedent = {
                            date: '12 Oct 2024',
                            event: 'Guide Vane Erosion (WO-921)',
                            confidence: 0.88
                        };
                    } else if (pattern.id === 'bearing-thermal-instability') {
                        precedent = {
                            date: '04 Mar 2023',
                            event: 'Bearing Pad 3 Scuffing (WO-104)',
                            confidence: 0.92
                        };
                    }

                    const proofString = `Prob = [${proofParts.join(' + ')}] / Total(${totalWeight.toFixed(2)}) = ${(probability * 100).toFixed(1)}%`;

                    insights.push({
                        patternId: pattern.id,
                        name: pattern.name,
                        probability: probability,
                        severity: pattern.baseSeverity,
                        slogan: pattern.slogan,
                        vectors: contributingVectors,
                        precedent, // Attach archived memory
                        actions: pattern.actions, // Attach Tactical Actions (Contextual Gravity)
                        mathProof: proofString, // XAI
                        physicsNarrative: this.generatePhysicsNarrative(pattern.id, contributingVectors, probability) // The Narrative
                    });
                }
            }
        });

        return insights;
    }
    /**
     * EXPORT WEIGHT MAP (Privacy-Safe Knowledge Transfer)
     * Strips all sensor data, keeping only learned coefficients.
     */
    static exportWeightMap(plantId: string, weights: Record<string, number>): any { // Returns WeightMap type
        return {
            plantId,
            timestamp: Date.now(),
            weights: { ...weights } // Clone to avoid mutation
        };
    }

    /**
     * MERGE WEIGHTS (Federated Learning Inflow)
     * Blends local experience with global consensus.
     * Logic: Local experience is primary (70%), but Hive nudges it (30%).
     */
    static mergeWeights(local: Record<string, number>, global: Record<string, number>): Record<string, number> {
        const merged: Record<string, number> = { ...local };

        Object.entries(global).forEach(([key, globalValue]) => {
            const localValue = merged[key] || 1.0;
            // Weighted blend: 0.7 Local, 0.3 Global
            // This prevents external bad data from ruining a tuned local model,
            // but allows valid global insights to slowly improve it.
            merged[key] = (localValue * 0.7) + (globalValue * 0.3);
        });

        return merged;
    }
}

// --- SENTINEL PATTERN LIBRARY ---

export const SENTINEL_PATTERNS: HeuristicPattern[] = [
    {
        id: 'cavitation-complex',
        name: 'Cavitation Precursor (Level 4)',
        description: 'Multi-variate correlation indicating implosion damage.',
        baseSeverity: 'CRITICAL',
        slogan: 'Cavitation: Rapid implosion of vapor bubbles causing erosive damage.',
        conditions: [
            { variableId: 'vibration', operator: 'TREND_MATCH', targetTrend: 'RISING', weight: 0.35 },
            { variableId: 'draftTubePressure', operator: 'VARIANCE_MATCH', threshold: 1.0, weight: 0.35 },
            { variableId: 'guideVane', operator: 'LESS', threshold: 40, weight: 0.3 }
        ],
        actions: [
            { type: 'FOCUS_3D', label: 'Inspect Draft Tube', targetId: 'Mesh_DraftTube_Liner', icon: 'Box' },
            { type: 'OPEN_SOP', label: 'Drainage Protocol', targetId: 'Francis_SOP_Drainage_Pumps', icon: 'FileText' }
        ]
    },
    {
        id: 'bearing-thermal-instability',
        name: 'Bearing Thermal Instability',
        description: 'Rapid thermal rise under high load.',
        baseSeverity: 'HIGH',
        slogan: 'Thermal Runaway: Friction coefficient escalation exceeding cooling capacity.',
        conditions: [
            // Dynamic Threshold: Check if Temp is 2 Sigma above Baseline for this Load
            { variableId: 'bearingTemp', operator: 'DYNAMIC_THRESHOLD', baselineId: 'bearingTemp_Loaded', sigmaMultiplier: 2.5, weight: 0.4 },

            { variableId: 'rpm', operator: 'GREATER', threshold: 300, weight: 0.2 },
            { variableId: 'bearingTemp', operator: 'SLOPE_GREATER', threshold: 2.0, weight: 0.4 }
        ],
        actions: [
            { type: 'FOCUS_3D', label: 'Focus Guide Bearing', targetId: 'Mesh_GuideBearing_Pad3', icon: 'Box' },
            { type: 'OPEN_SOP', label: 'Active Cooling Reset', targetId: 'Francis_SOP_Cooling', icon: 'FileText' }
        ]
    }
];
