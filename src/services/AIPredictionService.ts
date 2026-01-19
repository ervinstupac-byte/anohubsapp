import { TelemetryData } from '../contexts/TelemetryContext.tsx';

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

export interface IncidentPattern {
    matchedIncidentId: string;
    similarity: number; // 0-100
    pattern: 'HYDRAULIC_RUNAWAY' | 'BEARING_SEIZURE' | 'CAVITATION_COLLAPSE' | 'ALIGNMENT_DRIFT';
    warningMessage: string;
    historicalData?: any;
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

// --- HISTORICAL DATA STORAGE ---
// Keyed by numeric asset id to match app-wide asset id type
const telemetryHistory = new Map<number, TelemetryData[]>();
const HISTORY_WINDOW_SIZE = 10; // Last 10 measurements

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
        if (!telemetryHistory.has(assetId)) {
            telemetryHistory.set(assetId, []);
        }

        const history = telemetryHistory.get(assetId)!;
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
        const history = telemetryHistory.get(telemetry.assetId) || [];

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
        const history = telemetryHistory.get(assetId) || [];

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
                    pattern: incident.type as any,
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
        telemetryHistory.delete(assetId);
    }

    /**
     * Get history size for debugging
     */
    getHistorySize(assetId: number): number {
        return telemetryHistory.get(assetId)?.length || 0;
    }
}

export const aiPredictionService = new AIPredictionService();
