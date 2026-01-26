import { TelemetryData } from '../contexts/TelemetryContext.tsx';
import { supabase } from './supabaseClient.ts';
import idAdapter from '../utils/idAdapter';
import ProjectStateManager from '../contexts/ProjectStateContext';
import { TechnicalProjectState, PhysicsResult } from '../core/TechnicalSchema';
import { PhysicsEngine } from '../core/PhysicsEngine';
import Decimal from 'decimal.js';

// --- TYPE DEFINITIONS ---

export interface SynergeticRisk {
    detected: boolean;
    probability: number; // 0-100
    triggers: {
        acoustic: boolean;
        thermal: boolean;
        hydraulic: boolean;
    };
    timestamp: number;
    message: string;
}

export interface StressFactors {
    suddenStarts: number;
    cavitationHours: number;
    alignmentDeviation: number;
}

export interface RULEstimate {
    componentId: string;
    componentType: 'bearing' | 'seal' | 'hose' | 'wicket_gate';
    remainingHours: number;
    hoursRemaining: number; // Alias for UI compatibility
    stressFactors: StressFactors;
    confidence: number; // 0-1
    criticalThreshold: number;
}

export interface SuggestedWorkOrder {
    title: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    reason: string;
}

export interface IncidentPattern {
    matchedIncidentId: string;
    similarity: number; // 0-100
    pattern: 'HYDRAULIC_RUNAWAY' | 'BEARING_SEIZURE' | 'CAVITATION_COLLAPSE' | 'ALIGNMENT_DRIFT';
    warningMessage: string;
    historicalData?: unknown;
}

export interface PrescriptiveAction {
    type: 'IMMEDIATE' | 'SCHEDULED' | 'MONITORING';
    action: string;
    value?: number;
    timeframe?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    executable?: boolean;
}

export interface PrescriptiveRecommendation {
    component: string;
    failureProbability: number;
    message: string;
    actions: PrescriptiveAction[];
}

export interface PredictionReport {
    probability: number; // 0.0 - 1.0
    timeToFailureHours: number | null; // estimated hours until failure
    confidenceScore: number; // 0.0 - 1.0
    mitigationAction: string;
    details?: Record<string, unknown>;
}

// --- HISTORICAL DATA STORAGE ---
const telemetryHistory = new Map<string, TelemetryData[]>();
const HISTORY_WINDOW_SIZE = 30; // Last 30 measurements

// Simulated incident database (in production, this would come from Supabase)
const HISTORICAL_INCIDENTS = [
    {
        id: '2024-KM-HC-001',
        type: 'HYDRAULIC_RUNAWAY',
        description: 'Hydraulic Runaway After 12mm→16mm Hose Replacement',
        pressureSignature: [45, 46, 48, 52, 58, 75, 95, 120, 145, 180],
        hoseTensionSignature: [25, 26, 28, 35, 50, 80, 120, 200, 350, 450],
        triggerCondition: { pipeDiameter: 16, suddenPressureRise: true }
    },
    {
        id: '2023-VJ-BRG-003',
        type: 'BEARING_SEIZURE',
        description: 'Main Bearing Seizure Due to Lubrication Failure',
        temperatureSignature: [55, 56, 58, 62, 68, 75, 85, 98, 110, 125],
        vibrationSignature: [0.02, 0.025, 0.03, 0.04, 0.055, 0.07, 0.082, 0.09, 0.095, 0.1],
        triggerCondition: { rapidTempRise: true, oilViscosityDrop: true }
    }
];

// --- AI PREDICTION SERVICE ---

class AIPredictionService {
    /**
     * MULTI-SENSOR CORRELATION (Spider Logic)
     * Detects synergetic risk when all 3 parameters oscillate simultaneously
     */
    detectSynergeticRisk(assetId: number, telemetry: TelemetryData): SynergeticRisk {
        // Store historical data
        const key = String(assetId);
        if (!telemetryHistory.has(key)) {
            telemetryHistory.set(key, []);
        }

        const history = telemetryHistory.get(key)!;
        history.push(telemetry);

        // Keep only last N measurements
        if (history.length > HISTORY_WINDOW_SIZE) {
            history.shift();
        }

        // Need at least 5 measurements for trend analysis
        if (history.length < 5) {
            return {
                detected: false,
                probability: 0,
                triggers: { acoustic: false, thermal: false, hydraulic: false },
                timestamp: Date.now(),
                message: 'Insufficient data for synergetic analysis'
            };
        }

        // 1. ACOUSTIC OSCILLATION CHECK (Cavitation Intensity)
        const acousticValues = history.map(h => h.cavitationIntensity);
        const acousticMean = acousticValues.reduce((a, b) => a + b, 0) / acousticValues.length;
        const acousticVariance = acousticValues.reduce((sum, val) => sum + Math.pow(val - acousticMean, 2), 0) / acousticValues.length;
        const acousticOscillation = Math.sqrt(acousticVariance) / acousticMean;
        const acousticTrigger = acousticOscillation > 0.3; // 30% oscillation

        // 2. THERMAL GROWTH RATE CHECK (Temperature trend)
        const tempValues = history.map(h => h.temperature);
        const tempGrowthRate = (tempValues[tempValues.length - 1] - tempValues[0]) / (tempValues.length * 0.1); // °C per 0.1 min interval
        const thermalTrigger = tempGrowthRate > 0.5; // 0.5°C/min growth

        // 3. HYDRAULIC STABILITY CHECK (Pressure variance)
        const pressureValues = history.map(h => h.cylinderPressure);
        const pressureMean = pressureValues.reduce((a, b) => a + b, 0) / pressureValues.length;
        const pressureVariance = pressureValues.reduce((sum, val) => sum + Math.abs(val - pressureMean), 0) / pressureValues.length;
        const hydraulicInstability = (pressureVariance / pressureMean) * 100;
        const hydraulicTrigger = hydraulicInstability > 15; // 15% variance

        // SYNERGETIC RISK DETECTION
        const allThreeTriggered = acousticTrigger && thermalTrigger && hydraulicTrigger;

        return {
            detected: allThreeTriggered,
            probability: allThreeTriggered ? 80 : 0,
            triggers: {
                acoustic: acousticTrigger,
                thermal: thermalTrigger,
                hydraulic: hydraulicTrigger
            },
            timestamp: Date.now(),
            message: allThreeTriggered
                ? '⚠️ SYNERGETIC RISK DETECTED: All three parameters showing simultaneous oscillation patterns!'
                : `Partial triggers: ${[acousticTrigger && 'Acoustic', thermalTrigger && 'Thermal', hydraulicTrigger && 'Hydraulic'].filter(Boolean).join(', ')}`
        };
    }

    /**
     * Forecast eta break-even week using linear regression on historical efficiency (%)
     * Returns number of weeks until eta crosses `threshold` (default 90%) and confidence
     */
    async forecastEtaBreakEven(assetId: number, threshold: number = 90): Promise<{ weeksUntil: number | null; predictedTimestamp: number | null; confidence: number; slope?: number; intercept?: number; tStatistic?: number; sampleCount?: number; residualStd?: number; pf?: number; suggestedWorkOrder?: SuggestedWorkOrder }> {
        // Prioritize any in-memory telemetry (useful for tests and live short-term buffers)
        const memHistory = telemetryHistory.get(String(assetId));
        if (memHistory && memHistory.length > 0) {
            if (memHistory.length < 5) return { weeksUntil: null, predictedTimestamp: null, confidence: 0 };
            const pts = memHistory.map(h => ({ t: h.timestamp, y: h.efficiency })).slice(-HISTORY_WINDOW_SIZE);
            return this._computeLinearForecast(pts, threshold);
        }

        // First try persisted telemetry from Supabase (telemetry_logs.details.efficiency)
        try {
            const numeric = idAdapter.toNumber(assetId);
            const dbId = numeric !== null ? idAdapter.toDb(numeric) : String(assetId);

            // Prefer precomputed cache if available (server-side backfill upserts into telemetry_history_cache)
            try {
                const { data: cacheRes, error: cacheErr } = await supabase
                    .from('telemetry_history_cache')
                    .select('history')
                    .eq('asset_id', dbId)
                    .single();

                if (!cacheErr && cacheRes && cacheRes.history && Array.isArray(cacheRes.history)) {
                    const points = cacheRes.history
                        .map((p: unknown) => {
                            if (p && typeof p === 'object' && 't' in (p as Record<string, unknown>) && 'y' in (p as Record<string, unknown>)) {
                                const obj = p as { t: number; y: number };
                                return typeof obj.t === 'number' && typeof obj.y === 'number' ? { t: obj.t, y: obj.y } : null;
                            }
                            return null;
                        })
                        .filter(Boolean) as { t: number; y: number }[];
                    if (points.length >= 5) return this._computeLinearForecast(points, threshold);
                }
            } catch (e) {
                // ignore cache errors and fall back to raw logs
            }

            const { data, error } = await supabase
                .from('telemetry_logs')
                .select('details, created_at')
                .eq('asset_id', dbId)
                .order('created_at', { ascending: true })
                .limit(HISTORY_WINDOW_SIZE * 5);

            if (!error && Array.isArray(data) && data.length > 0) {
                const points = data
                    .map((r: unknown) => {
                        if (!r || typeof r !== 'object') return null;
                        const rec = r as Record<string, unknown>;
                        const details = (rec.details && typeof rec.details === 'object') ? (rec.details as Record<string, unknown>) : {};
                        const effRaw = details.efficiency ?? details.eta ?? details.efficiencyPercent ?? null;
                        const y = typeof effRaw === 'number' ? effRaw : (typeof effRaw === 'string' ? Number(effRaw) : null);
                        const t = rec.created_at ? new Date(String(rec.created_at)).getTime() : Date.now();
                        return y !== null && !Number.isNaN(y) ? { t, y } : null;
                    })
                    .filter(Boolean) as { t: number; y: number }[];

                if (points.length >= 5) {
                    // Keep most recent HISTORY_WINDOW_SIZE samples
                    const recent = points.slice(-HISTORY_WINDOW_SIZE);
                    return this._computeLinearForecast(recent, threshold);
                }
            }
        } catch (err) {
            console.warn('[AIPrediction] Supabase query failed, falling back to in-memory history', err);
        }

        // Fallback to in-memory history
        const history = telemetryHistory.get(String(assetId)) || [];
        if (history.length < 5) return { weeksUntil: null, predictedTimestamp: null, confidence: 0 };

        const points = history.map(h => ({ t: h.timestamp, y: h.efficiency }));
        return this._computeLinearForecast(points, threshold);
    }

    /** Internal: compute linear regression forecast from points */
    private _computeLinearForecast(points: { t: number; y: number }[], threshold: number) {
        const n = points.length;
        const meanT = points.reduce((s, p) => s + p.t, 0) / n;
        const meanY = points.reduce((s, p) => s + p.y, 0) / n;

        // Calculate slope and intercept (ordinary least squares)
        const Sxx = points.reduce((s, p) => s + Math.pow(p.t - meanT, 2), 0);
        const Sxy = points.reduce((s, p) => s + (p.t - meanT) * (p.y - meanY), 0);
        const a = Sxy / (Sxx || 1); // slope (efficiency per ms)
        const b = meanY - a * meanT;

        // Residuals and standard error
        const residuals = points.map(p => p.y - (a * p.t + b));
        const SSE = residuals.reduce((s, r) => s + r * r, 0);
        const sigma2 = SSE / Math.max(1, (n - 2));

        // Standard error of slope
        const SEa = Math.sqrt(sigma2 / (Sxx || 1));

        // t-statistic for slope
        const tStat = SEa > 0 ? a / SEa : 0;
        const tAbs = Math.abs(tStat);

        // Heuristic confidence: map t-stat to [0,1] with threshold at 2 -> ~95% for moderate n
        const confidence = Math.min(1, tAbs / 3);

        // residual standard deviation (process sigma)
        const residualStd = Math.sqrt(sigma2);

        // Map residualStd to failure probability Pf (%) using an S-shaped mapping
        const acceptableSigma = 0.5; // baseline acceptable process sigma
        const z = residualStd / acceptableSigma;
        // Approximate normal CDF tail mapping (Abramowitz approximation)
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989423 * Math.exp(-z * z / 2);
        let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        prob = 1 - prob;
        const pfVal = z < 0 ? 1 - prob : prob;
        const pfPercent = Math.min(99.99, Math.max(0.01, pfVal * 100));

        // Build suggested work order when Pf exceeds 50%
        let suggestedWorkOrder: SuggestedWorkOrder | undefined = undefined;
        try {
            if (pfPercent > 50) {
                suggestedWorkOrder = {
                    title: 'Urgent Francis Runner Inspection',
                    priority: 'Critical',
                    reason: `Efficiency decay detected (σ = ${residualStd.toFixed(4)})`
                };
            }
        } catch (e) {
            // ignore formatting issues
        }

        // if slope is ~0 (stable), nothing to predict
        if (!isFinite(a) || Math.abs(a) < 1e-16) return { weeksUntil: null, predictedTimestamp: null, confidence: Math.min(1, n / HISTORY_WINDOW_SIZE), slope: a, intercept: b, tStatistic: tStat, sampleCount: n, residualStd, pf: pfPercent, suggestedWorkOrder };

        // Solve for t where y = threshold
        const tCross = (threshold - b) / a;
        const now = Date.now();
        if (!isFinite(tCross)) return { weeksUntil: null, predictedTimestamp: null, confidence: Math.min(1, n / HISTORY_WINDOW_SIZE), slope: a, intercept: b, tStatistic: tStat, sampleCount: n, residualStd, suggestedWorkOrder };
        if (tCross <= now) return { weeksUntil: 0, predictedTimestamp: Math.floor(tCross), confidence: Math.min(1, n / HISTORY_WINDOW_SIZE), slope: a, intercept: b, tStatistic: tStat, sampleCount: n, residualStd, pf: pfPercent, suggestedWorkOrder };

        const weeks = (tCross - now) / (7 * 24 * 3600 * 1000);
        return { weeksUntil: Math.max(0, weeks), predictedTimestamp: Math.floor(tCross), confidence: confidence, slope: a, intercept: b, tStatistic: tStat, sampleCount: n, residualStd, pf: pfPercent, suggestedWorkOrder };
    }

    /** Compute forecast excluding given ISO dates (YYYY-MM-DD) present in cached history or telemetry_logs */
    async forecastExcludingDates(assetId: number, excludeDates: string[], threshold: number = 90) {
        try {
            const numeric = idAdapter.toNumber(assetId);
            const dbId = numeric !== null ? idAdapter.toDb(numeric) : String(assetId);
            const { data: cacheRes, error: cacheErr } = await supabase
                .from('telemetry_history_cache')
                .select('history')
                .eq('asset_id', dbId)
                .single();

            if (!cacheErr && cacheRes && cacheRes.history && Array.isArray(cacheRes.history)) {
                const filtered = cacheRes.history
                    .map((p: unknown) => {
                        if (p && typeof p === 'object' && 't' in (p as Record<string, unknown>) && 'y' in (p as Record<string, unknown>)) {
                            const obj = p as { t: number; y: number };
                            return typeof obj.t === 'number' && typeof obj.y === 'number' ? { t: obj.t, y: obj.y, d: new Date(obj.t).toISOString().slice(0, 10) } : null;
                        }
                        return null;
                    })
                    .filter((p: any): p is { t: number; y: number; d: string } => !!p && typeof p.d === 'string')
                    .filter((p: any) => !excludeDates.includes(p.d))
                    .map((p: any) => ({ t: p.t, y: p.y }));

                if (filtered.length >= 5) return this._computeLinearForecast(filtered, threshold);
            }
        } catch (e) {
            // swallow and return null-ish
        }

        return { weeksUntil: null, predictedTimestamp: null, confidence: 0, sampleCount: 0 };
    }

    /**
     * Estimate efficiency (eta) from live telemetry when physics fields available
     * Uses canonical relation: P = rho * g * Q * H * eta
     * Telemetry fields used (best-effort): `output` (MW), `pumpFlowRate` (l/s), `reservoirLevel`, `tailwaterLevel`, `piezometricPressure`
     */
    estimateEfficiencyFromTelemetry(telemetry: TelemetryData): { eta: number | null; etaPercent?: number | null; confidence: number; details?: Record<string, unknown> } {
        try {
            const rho = 1000; // kg/m3 (water)
            const g = 9.80665; // m/s2

            const P_MW = typeof telemetry.output === 'number' ? telemetry.output : null;
            const P_W = P_MW !== null ? P_MW * 1e6 : null;

            const Q_lps = typeof telemetry.pumpFlowRate === 'number' ? telemetry.pumpFlowRate : null; // l/s
            const Q_m3s = Q_lps !== null ? Q_lps / 1000 : null;

            // Prefer geometric head from reservoir - tailwater
            const H_m = (typeof telemetry.reservoirLevel === 'number' && typeof telemetry.tailwaterLevel === 'number')
                ? Math.max(0.01, telemetry.reservoirLevel - telemetry.tailwaterLevel)
                : null;

            // If head not available but cylinderPressure/piezometricPressure present, approximate
            let H_est = H_m;
            if (H_est === null && typeof telemetry.piezometricPressure === 'number') {
                // pressure in bar -> Pa
                const pPa = telemetry.piezometricPressure * 1e5; // bar to Pa
                H_est = Math.max(0.01, pPa / (rho * g));
            }

            // Confidence scoring based on available inputs
            const available = [P_W !== null, Q_m3s !== null, H_est !== null].filter(Boolean).length;
            const confidence = Math.min(0.99, Math.max(0, available / 3));

            if (P_W === null || Q_m3s === null || H_est === null) {
                return { eta: null, etaPercent: null, confidence, details: { P_W, Q_m3s, H_m: H_est } };
            }

            const denom = rho * g * Q_m3s * H_est;
            if (!isFinite(denom) || denom <= 0) return { eta: null, etaPercent: null, confidence: Math.max(0.2, confidence), details: { denom } };

            let eta = P_W / denom; // fraction 0-1
            // sanitize
            if (!isFinite(eta)) return { eta: null, etaPercent: null, confidence: Math.max(0.2, confidence), details: { eta } };
            eta = Math.max(0, Math.min(1.2, eta)); // allow slight >1 for measurement noise

            // Boost confidence if values are reasonable
            const adjConfidence = Math.min(0.999, confidence + (eta > 0.5 && eta < 1.05 ? 0.25 : 0));

            return { eta, etaPercent: eta * 100, confidence: adjConfidence, details: { P_W, Q_m3s, H_m: H_est } };
        } catch (e) {
            return { eta: null, etaPercent: null, confidence: 0, details: { error: String(e) } };
        }
    }

    /**
     * RUL ESTIMATOR (Remaining Useful Life)
     * Calculates remaining operational hours for critical components
     */
    calculateRUL(
        componentType: 'bearing' | 'seal' | 'hose' | 'wicket_gate',
        operatingHours: number,
        telemetry: TelemetryData
    ): RULEstimate {
        // Base life hours for each component type
        const baseLifeHours: Record<string, number> = {
            bearing: 30000,
            seal: 15000,
            hose: 8000,
            wicket_gate: 50000
        };

        // Calculate stress factors
        const history = telemetryHistory.get(String(telemetry.assetId)) || [];

        // Sudden starts: count rapid power changes
        const suddenStarts = history.filter((h, i) => {
            if (i === 0) return false;
            const powerChange = Math.abs(h.output - history[i - 1].output);
            return powerChange > 5; // >5MW change
        }).length;

        // Cavitation hours: time spent in cavitation zone
        const cavitationHours = (history.filter(h => h.cavitationIntensity > 5).length / 6) * operatingHours / HISTORY_WINDOW_SIZE;

        // Alignment deviation
        const alignmentDeviation = telemetry.foundationDisplacement;

        const stressFactors: StressFactors = {
            suddenStarts,
            cavitationHours,
            alignmentDeviation
        };

        // RUL Formula
        const stressFactor =
            0.2 * (suddenStarts / 100) +
            0.3 * (cavitationHours / operatingHours) +
            0.5 * (alignmentDeviation / 0.5); // 0.5mm max allowed

        const remainingHours = baseLifeHours[componentType] * (1 - Math.min(stressFactor, 0.95));

        // Confidence based on data quality
        const confidence = Math.min(0.95, history.length / HISTORY_WINDOW_SIZE);

        return {
            componentId: `${telemetry.assetId}-${componentType}`,
            componentType,
            remainingHours: Math.max(0, remainingHours),
            hoursRemaining: Math.max(0, remainingHours),
            stressFactors,
            confidence,
            criticalThreshold: baseLifeHours[componentType] * 0.1 // 10% of base life
        };
    }

    /**
     * INCIDENT GHOST SIMULATOR
     * Pattern matching with historical incidents using Dynamic Time Warping
     */
    matchHistoricalPattern(assetId: number, telemetry: TelemetryData): IncidentPattern | null {
        const history = telemetryHistory.get(String(assetId)) || [];

        if (history.length < 5) return null;

        // Extract current signatures
        const currentPressure = history.map(h => h.cylinderPressure);
        const currentTension = history.map(h => h.hoseTension);
        const currentTemp = history.map(h => h.temperature);
        const currentVibration = history.map(h => h.vibration);

        let bestMatch: IncidentPattern | null = null;
        let highestSimilarity = 0;

        // Check against each historical incident
        for (const incident of HISTORICAL_INCIDENTS) {
            let similarity = 0;

            if (incident.type === 'HYDRAULIC_RUNAWAY') {
                // Check if pipe diameter matches trigger condition
                if (telemetry.pipeDiameter === incident.triggerCondition.pipeDiameter
                    && incident.pressureSignature && incident.hoseTensionSignature) {
                    // Compare pressure and tension signatures using simplified DTW
                    const pressureSimilarity = this.calculateDTWSimilarity(
                        currentPressure.slice(-incident.pressureSignature.length),
                        incident.pressureSignature
                    );
                    const tensionSimilarity = this.calculateDTWSimilarity(
                        currentTension.slice(-incident.hoseTensionSignature.length),
                        incident.hoseTensionSignature
                    );
                    similarity = (pressureSimilarity + tensionSimilarity) / 2;
                }
            } else if (incident.type === 'BEARING_SEIZURE') {
                // Check temperature and vibration signatures
                if (incident.temperatureSignature && incident.vibrationSignature) {
                    const tempSimilarity = this.calculateDTWSimilarity(
                        currentTemp.slice(-incident.temperatureSignature.length),
                        incident.temperatureSignature
                    );
                    const vibSimilarity = this.calculateDTWSimilarity(
                        currentVibration.slice(-incident.vibrationSignature.length),
                        incident.vibrationSignature
                    );
                    similarity = (tempSimilarity + vibSimilarity) / 2;
                }
            }

            if (similarity > highestSimilarity && similarity > 85) {
                highestSimilarity = similarity;
                bestMatch = {
                    matchedIncidentId: incident.id,
                    similarity,
                    pattern: incident.type as 'HYDRAULIC_RUNAWAY' | 'BEARING_SEIZURE' | 'CAVITATION_COLLAPSE' | 'ALIGNMENT_DRIFT',
                    warningMessage: `🔊 PATTERN MATCH: Possible ${incident.type.replace('_', ' ')} Detected!\n\n"${incident.description}"\n\nSimilarity: ${similarity.toFixed(1)}%`,
                    historicalData: incident
                };
            }
        }

        return bestMatch;
    }

    /**
     * Simplified DTW (Dynamic Time Warping) similarity calculation
     */
    private calculateDTWSimilarity(series1: number[], series2: number[]): number {
        if (series1.length === 0 || series2.length === 0) return 0;

        // Normalize both series
        const normalize = (arr: number[]) => {
            const max = Math.max(...arr);
            const min = Math.min(...arr);
            const range = max - min || 1;
            return arr.map(v => (v - min) / range);
        };

        const norm1 = normalize(series1);
        const norm2 = normalize(series2);

        // Calculate correlation coefficient as similarity measure
        const mean1 = norm1.reduce((a, b) => a + b, 0) / norm1.length;
        const mean2 = norm2.reduce((a, b) => a + b, 0) / norm2.length;

        let covariance = 0;
        let variance1 = 0;
        let variance2 = 0;

        const minLen = Math.min(norm1.length, norm2.length);
        for (let i = 0; i < minLen; i++) {
            const diff1 = norm1[i] - mean1;
            const diff2 = norm2[i] - mean2;
            covariance += diff1 * diff2;
            variance1 += diff1 * diff1;
            variance2 += diff2 * diff2;
        }

        const correlation = covariance / Math.sqrt(variance1 * variance2 || 1);
        return Math.max(0, Math.min(100, (correlation + 1) * 50)); // Convert to 0-100 scale
    }

    /**
     * PRESCRIPTIVE RECOMMENDATIONS
     * Generate actionable recommendations based on failure probability
     */
    generatePrescription(
        component: string,
        failureProbability: number
    ): PrescriptiveRecommendation {
        const actions: PrescriptiveAction[] = [];

        if (failureProbability >= 90) {
            // Critical - immediate action required
            if (component === 'hose' || component === 'hydraulic_system') {
                actions.push({
                    type: 'IMMEDIATE',
                    action: 'REDUCE_PRESSURE',
                    value: -10,
                    priority: 'CRITICAL',
                    executable: true
                });
                actions.push({
                    type: 'SCHEDULED',
                    action: 'REPLACE_COMPONENT',
                    timeframe: '12h',
                    priority: 'CRITICAL',
                    executable: false
                });
            }

            if (component === 'bearing') {
                actions.push({
                    type: 'IMMEDIATE',
                    action: 'ACTIVATE_HYDROSTATIC_LIFT',
                    priority: 'CRITICAL',
                    executable: true
                });
                actions.push({
                    type: 'IMMEDIATE',
                    action: 'REDUCE_LOAD',
                    value: -20,
                    priority: 'CRITICAL',
                    executable: true
                });
                actions.push({
                    type: 'SCHEDULED',
                    action: 'INSPECT_AND_REPLACE',
                    timeframe: '6h',
                    priority: 'CRITICAL',
                    executable: false
                });
            }

            return {
                component,
                failureProbability,
                message: `🔴 CRITICAL: Vjerovatnoća kvara ${component} iznosi ${failureProbability}%. Smanjite pritisak/opterećenje ODMAH i zakažite zamjenu u narednih ${component === 'bearing' ? '6' : '12'} sati.`,
                actions
            };
        } else if (failureProbability >= 70) {
            // High - schedule maintenance
            actions.push({
                type: 'SCHEDULED',
                action: 'SCHEDULE_INSPECTION',
                timeframe: '48h',
                priority: 'HIGH',
                executable: false
            });
            actions.push({
                type: 'MONITORING',
                action: 'INCREASE_MONITORING_FREQUENCY',
                priority: 'HIGH',
                executable: true
            });

            return {
                component,
                failureProbability,
                message: `⚠️ HIGH RISK: ${component} pokazuje znakove degradacije (${failureProbability}%). Zakažite inspekciju narednih 48h.`,
                actions
            };
        } else if (failureProbability >= 50) {
            // Medium - monitor closely
            actions.push({
                type: 'MONITORING',
                action: 'MONITOR_TRENDS',
                priority: 'MEDIUM',
                executable: true
            });

            return {
                component,
                failureProbability,
                message: `🟡 MEDIUM RISK: ${component} pokazuje neznatne anomalije (${failureProbability}%). Nastavite monitoring.`,
                actions
            };
        }

        return {
            component,
            failureProbability,
            message: `✅ ${component} radi u optimalnom režimu.`,
            actions: []
        };
    }

    /**
     * Clear history for asset (useful for testing or after maintenance)
     */
    clearHistory(assetId: number): void {
        telemetryHistory.delete(String(assetId));
    }

    /**
     * Get history size for debugging
     */
    getHistorySize(assetId: number): number {
        return telemetryHistory.get(String(assetId))?.length || 0;
    }

    // --- Phase B: Physics-Informed Prediction Engines ---

    /** Cavitation Risk Engine
     * Uses telemetry and optional physics-derived head/rpm to estimate cavitation probability
     */
    assessCavitationRisk(telemetry: TelemetryData, opts?: { rpm?: number; netHead?: number; temperatureC?: number; atmosphericPressurePa?: number }, projectState?: TechnicalProjectState): PredictionReport {
        // Gather inputs
        const rho = 1000; // kg/m3
        const g = 9.80665;
        const Q_m3s = (typeof telemetry.pumpFlowRate === 'number' && Number.isFinite(telemetry.pumpFlowRate)) ? telemetry.pumpFlowRate / 1000 : null;
        // Prefer canonical netHead from projectState when available
        const H_m = (projectState && projectState.physics && typeof projectState.physics.netHead === 'number' && Number.isFinite(projectState.physics.netHead) && projectState.physics.netHead > 0)
            ? projectState.physics.netHead
            : ((typeof opts?.netHead === 'number' && Number.isFinite(opts.netHead)) ? opts.netHead : null);
        const rpm = (typeof opts?.rpm === 'number' && Number.isFinite(opts.rpm)) ? opts.rpm : null;
        const tempC = opts?.temperatureC ?? telemetry.temperature ?? 20;
        const p_atm = (typeof opts?.atmosphericPressurePa === 'number' && Number.isFinite(opts.atmosphericPressurePa))
            ? opts.atmosphericPressurePa
            : (typeof telemetry.piezometricPressure === 'number' ? (telemetry.piezometricPressure > 50 ? telemetry.piezometricPressure : telemetry.piezometricPressure * 1e5) : 101325);

        // Estimate vapor pressure (Pa) from temperature (Magnus-Tetens approximation)
        const es = 610.78 * Math.exp((17.27 * tempC) / (tempC + 237.3));

        // If head not provided, try to estimate from telemetry using simple approximation
        let head = H_m;
        if (!head && typeof telemetry.reservoirLevel === 'number' && typeof telemetry.tailwaterLevel === 'number') {
            head = Math.max(0.01, telemetry.reservoirLevel - telemetry.tailwaterLevel);
        }

        // Thoma cavitation coefficient sigma = (p_abs - p_v) / (rho * g * H)
        let sigma: number | null = null;
        if (typeof head === 'number' && head > 0) {
            const p_abs = typeof p_atm === 'number' ? p_atm : 101325;
            sigma = (p_abs - es) / (rho * g * head);
        }

        // Specific speed n_s (heuristic): n [rps] * sqrt(Q) / H^(3/4)
        let ns: number | null = null;
        try {
            if (rpm && Q_m3s && head) {
                const n_rps = rpm / 60;
                ns = n_rps * Math.sqrt(Math.max(1e-9, Q_m3s)) / Math.pow(Math.max(1e-9, head), 0.75);
            }
        } catch (e) {
            ns = null;
        }

        // Define heuristic sigma limit depending on n_s (higher ns -> more cavitation-prone)
        const sigmaLimit = ns ? Math.max(0.05, 0.12 - 0.02 * Math.log10(1 + ns)) : 0.08;

        // Compute probability mapping
        let probability = 0;
        if (sigma === null) {
            // Fallback to cavitationIntensity signal when head unknown
            const ci = Math.min(10, Math.max(0, telemetry.cavitationIntensity || 0));
            probability = Math.min(1, ci / 8); // scale 0-10 -> 0-1 with threshold ~8
        } else {
            if (sigma < sigmaLimit) {
                // Lower sigma -> higher probability; map exponentially
                const ratio = Math.max(0.001, (sigmaLimit - sigma) / sigmaLimit);
                probability = Math.min(1, Math.pow(ratio, 0.8));
            } else {
                probability = 0.02 * Math.max(0, 1 - (sigma - sigmaLimit));
            }
        }

        // Confidence depends on availability of head and flow
        const conf = Math.min(0.99, (((typeof head === 'number' && head > 0) ? 0.5 : 0) + (Q_m3s ? 0.3 : 0) + (ns ? 0.2 : 0)));

        const mitigation = probability > 0.5
            ? 'High cavitation risk — reduce load, check suction configuration, inspect runner and inlet, verify NPSH and Thoma sigma compliance.'
            : 'Low cavitation risk — monitor NPSH; if cavitationIntensity rises, reduce flow and inspect intake.';

        return {
            probability: Math.min(1, Math.max(0, probability)),
            timeToFailureHours: probability > 0.75 ? 72 : probability > 0.4 ? 240 : null,
            confidenceScore: conf,
            mitigationAction: mitigation,
            details: { thomaSigma: sigma, sigmaLimit, ns, Q_m3s, head }
        };
    }

    /** Bearing Thermal Drift Predictor
     * Uses recent telemetry history to linear-regress bearing temperature and estimate Time-To-Threshold (hours)
     */
    predictBearingThermalTTT(assetId: number, telemetry: TelemetryData, criticalTemp: number = 75, projectState?: TechnicalProjectState): PredictionReport {
        const key = String(assetId);
        const history = telemetryHistory.get(key) || [];
        // Use last 12 samples or up to history length
        const samples = history.slice(-12).map(h => ({ t: h.timestamp, temp: h.temperature }));
        if (samples.length < 3) {
            // Not enough data — fallback to instantaneous check
            const prob = telemetry.temperature >= criticalTemp ? 1 : 0;
            return { probability: prob, timeToFailureHours: prob ? 0 : null, confidenceScore: samples.length / 12, mitigationAction: prob ? 'Immediate shutdown and bearing inspection' : 'Collect more telemetry for trend analysis', details: { samples: samples.length } };
        }

        // Linear regression t vs temp
        const n = samples.length;
        const meanT = samples.reduce((s, p) => s + Number(p.t || 0), 0) / n;
        const meanTemp = samples.reduce((s, p) => s + Number(p.temp || 0), 0) / n;
        let Sxx = 0, Sxy = 0;
        for (const s of samples) {
            const dt = (Number(s.t || 0) - meanT);
            const dtemp = (Number(s.temp || 0) - meanTemp);
            Sxx += dt * dt;
            Sxy += dt * dtemp;
        }
        const slope = Sxx === 0 ? 0 : Sxy / Sxx; // degC per ms

        if (Math.abs(slope) < 1e-12) {
            return { probability: 0, timeToFailureHours: null, confidenceScore: Math.min(0.9, n / 12), mitigationAction: 'Temperature stable — continue monitoring', details: { slope } };
        }

        const latest = samples[samples.length - 1];
        const tempNow = Number(latest.temp || 0);
        // ambient-adjusted critical temperature
        const ambient = (projectState && projectState.site && typeof projectState.site.temperature === 'number') ? projectState.site.temperature : (telemetry.temperature ?? 20);
        const ambientAdjustedCritical = criticalTemp + ((ambient - 20) * 0.1);
        const delta = ambientAdjustedCritical - tempNow;
        const msTo = (isFinite(slope) && slope !== 0) ? delta / slope : Infinity; // ms
        const hoursTo = (isFinite(msTo) && msTo > 0) ? msTo / (1000 * 3600) : 0;

        // Probability is higher if slope positive and recent samples show accelerating trend
        const prob = slope > 0 ? Math.min(1, Math.tanh((slope * 1e6) * 0.5) + (delta < 5 ? 0.2 : 0)) : 0;
        const conf = Math.min(0.99, Math.max(0.2, n / 12));
        const action = prob > 0.5 ? 'Inspect bearing lubrication and cooling; consider reduce load and schedule immediate maintenance.' : 'Monitor bearing temperature and verify oil cooling flow.';

        return { probability: prob, timeToFailureHours: hoursTo > 0 ? hoursTo : null, confidenceScore: conf, mitigationAction: action, details: { slope, latestTemp: tempNow, samples: n, ambientAdjustedCritical } };
    }

    /** Efficiency Decay Prediction
     * Monitors eta change over a sliding window and flags potential runner erosion or seal wear
     */
    predictEfficiencyDecay(assetId: number, lookbackHours: number = 72): PredictionReport {
        const history = telemetryHistory.get(String(assetId)) || [];
        if (history.length < 3) return { probability: 0, timeToFailureHours: null, confidenceScore: 0, mitigationAction: 'Insufficient data', details: { samples: history.length } };

        // Filter samples within lookback window
        const now = Date.now();
        const cutoff = now - lookbackHours * 3600 * 1000;
        const window = history.filter(h => h.timestamp >= cutoff);
        if (window.length < 2) return { probability: 0, timeToFailureHours: null, confidenceScore: 0.2, mitigationAction: 'Insufficient recent data', details: { windowSize: window.length } };

        const effValues = window.map(w => w.efficiency).filter(v => typeof v === 'number');
        if (effValues.length < 2) return { probability: 0, timeToFailureHours: null, confidenceScore: 0.2, mitigationAction: 'No efficiency samples in window', details: {} };

        const startEff = effValues[0];
        const endEff = effValues[effValues.length - 1];
        const pctDrop = ((startEff - endEff) / Math.max(1, startEff)) * 100; // percent

        // Determine likely cause heuristics
        const recent = window[window.length - 1];
        let cause = 'Unknown';
        if ((recent.rotorEccentricity ?? 0) > 0.2 || (recent.bearingGrindIndex ?? 0) > 2) cause = 'runner_erosion';
        if ((recent.seepageRate ?? 0) > 20 || (recent.ultrasonicLeakIndex ?? 0) > 3) cause = 'seal_wear';

        let probability = 0;
        if (pctDrop > 1.5) probability = Math.min(1, 0.3 + (pctDrop - 1.5) / 10);

        const timeToFailureHours = probability > 0 ? Math.max(1, (100 - endEff) / Math.max(0.01, Math.abs((endEff - startEff) / (window[window.length - 1].timestamp - window[0].timestamp))) * 3600 * 24) : null;

        const action = cause === 'runner_erosion' ? 'Inspect runner and blade surfaces; consider on-site NDT and reduced operation.' : cause === 'seal_wear' ? 'Inspect labyrinth seals and check for increased leakage; prepare for seal replacement.' : 'Investigate performance drop: review intake, seals, and runner; schedule inspection.';

        const confidence = Math.min(0.99, 0.2 + Math.min(0.8, window.length / 50));

        return {
            probability: Math.min(1, probability),
            timeToFailureHours: timeToFailureHours ? Math.round(timeToFailureHours) : null,
            confidenceScore: confidence,
            mitigationAction: action,
            details: { pctDrop, cause, windowSize: window.length }
        };
    }

    /** Aggregate prediction report combining primary failure modes */
    generatePredictionReport(assetId: number, telemetry: TelemetryData): { cavitation: PredictionReport; bearing: PredictionReport; efficiency: PredictionReport } {
        // Try to call PhysicsEngine to enrich inputs (best-effort)
        let physics: PhysicsResult | null = null;
        // Prefer canonical state from ProjectStateManager if available
        let projectState: TechnicalProjectState | null = null;
        try {
            projectState = ProjectStateManager.getState() as TechnicalProjectState;
        } catch (e) {
            projectState = null;
        }

        try {
            if (projectState) {
                physics = PhysicsEngine.recalculatePhysics(projectState);
            }
        } catch (e) {
            physics = null;
        }

        const physicsNetHeadNumber = physics?.netHead ? (physics.netHead instanceof Decimal ? physics.netHead.toNumber() : Number(physics.netHead)) : undefined;
        const cav = this.assessCavitationRisk(telemetry, { rpm: undefined, netHead: physicsNetHeadNumber, temperatureC: telemetry.temperature }, projectState || undefined);
        const bear = this.predictBearingThermalTTT(assetId, telemetry, undefined, projectState || undefined);
        const eff = this.predictEfficiencyDecay(assetId);

        return { cavitation: cav, bearing: bear, efficiency: eff };
    }
}

export const aiPredictionService = new AIPredictionService();
export default aiPredictionService;
