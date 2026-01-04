import { TurbineFamily } from '../types/assetIdentity';

export interface BaselineFingerprint {
    loadLevel: number; // 0, 25, 50, 75, 100
    timestamp: number;

    // Acoustic signature
    acousticSignature: {
        spectrum: number[]; // FFT spectrum
        dominantFrequencies: number[];
        rmsLevel: number;
        cavitationIndex: number; // 1-10 scale
    };

    // Vibration signature
    vibrationSignature: {
        horizontal: number;
        vertical: number;
        axial: number;
        dominantFrequencies: number[];
        phase: number;
    };

    // Temperature baseline
    temperatureBaseline: {
        bearing_upper: number;
        bearing_lower: number;
        generator_stator: number;
        oil_temperature: number;
    };

    // Pressure baseline (turbine-specific)
    pressureBaseline: {
        inlet: number;
        outlet: number;
        servo?: number;
    };

    // Power & efficiency
    powerOutput: number; // MW
    efficiency: number; // %
    waterFlow: number; // m³/s
}

export interface CommissioningSession {
    id: string;
    assetId: string;
    assetName: string;
    turbineFamily: TurbineFamily;
    startedAt: number;
    completedAt?: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

    // 5-point baseline
    baselines: BaselineFingerprint[];

    // Alignment data
    alignmentData?: AlignmentMeasurement;

    // Hydro-static test
    hydroStaticTest?: HydroStaticTestResult;

    // Special measurements
    specialMeasurements?: SpecialMeasurementData;

    // Validation overrides
    aiValidationOverrides: AIValidationOverride[];
}

export interface AlignmentMeasurement {
    timestamp: number;
    rotorPositions: Array<{
        angle: number; // degrees (0-360)
        runout: number; // mm
    }>;
    shaftSag: number; // mm (for horizontal machines)
    finalAlignment: number; // mm/m
    meetsStandard: boolean; // < 0.05 mm/m
}

export interface HydroStaticTestResult {
    timestamp: number;
    testDuration: number; // seconds
    initialPressure: number; // bar
    pressureReadings: Array<{
        time: number; // seconds
        pressure: number; // bar
    }>;
    pressureDropRate: number; // bar/minute
    isLinear: boolean;
    suspectedIssue?: 'MICROCRACK' | 'AIR_IN_SYSTEM' | 'SEAL_LEAK' | null;
}

export interface SpecialMeasurementData {
    timestamp: number;
    source: 'LASER_TRACKER' | 'MANUAL' | 'IMPORTED';
    geometryPoints: Array<{
        x: number;
        y: number;
        z: number;
        deviation: number; // mm from ideal blueprint
    }>;
    averageDeviation: number;
    efficiencyGap: number; // % loss due to deformation
}

export interface AIValidationOverride {
    timestamp: number;
    engineerId: string;
    engineerName: string;
    aiDiagnosis: string;
    actualDiagnosis: string;
    reason: string;
    severity: 'MINOR' | 'SIGNIFICANT' | 'CRITICAL';
}

export class CommissioningService {
    private static sessions: Map<string, CommissioningSession> = new Map();

    /**
     * Start new commissioning session
     */
    static async startCommissioning(
        assetId: string,
        assetName: string,
        turbineFamily: TurbineFamily
    ): Promise<CommissioningSession> {
        const session: CommissioningSession = {
            id: `COMMISSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            assetId,
            assetName,
            turbineFamily,
            startedAt: Date.now(),
            status: 'IN_PROGRESS',
            baselines: [],
            aiValidationOverrides: []
        };

        this.sessions.set(session.id, session);

        console.log(`🔧 COMMISSIONING STARTED: ${assetName}`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   Next step: Record baseline at 0% load (idle)`);

        return session;
    }

    /**
     * STEP 1: Baseline Fingerprinting
     * Records "healthy state" at 5 load levels
     */
    static async recordBaseline(
        sessionId: string,
        loadLevel: number, // 0, 25, 50, 75, 100
        sensorData: {
            acousticSpectrum: number[];
            vibration: { horizontal: number; vertical: number; axial: number };
            temperatures: any;
            pressures: any;
            powerOutput: number;
            efficiency: number;
            waterFlow: number;
        }
    ): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');

        // Analyze acoustic signature
        const acousticSignature = this.analyzeAcousticBaseline(sensorData.acousticSpectrum);

        // Analyze vibration signature
        const vibrationSignature = {
            horizontal: sensorData.vibration.horizontal,
            vertical: sensorData.vibration.vertical,
            axial: sensorData.vibration.axial,
            dominantFrequencies: this.extractDominantFrequencies(sensorData.vibration),
            phase: 0 // TBD: Calculate phase from raw data
        };

        const baseline: BaselineFingerprint = {
            loadLevel,
            timestamp: Date.now(),
            acousticSignature,
            vibrationSignature,
            temperatureBaseline: sensorData.temperatures,
            pressureBaseline: sensorData.pressures,
            powerOutput: sensorData.powerOutput,
            efficiency: sensorData.efficiency,
            waterFlow: sensorData.waterFlow
        };

        session.baselines.push(baseline);

        console.log(`✅ Baseline recorded for ${loadLevel}% load`);
        console.log(`   Acoustic RMS: ${acousticSignature.rmsLevel.toFixed(2)}`);
        console.log(`   Vibration: ${vibrationSignature.horizontal.toFixed(2)} mm/s`);
        console.log(`   Efficiency: ${sensorData.efficiency.toFixed(1)}%`);

        // Check if all 5 baselines complete
        if (session.baselines.length === 5) {
            console.log(`🎉 All 5 baselines complete! Baseline fingerprinting done.`);
        } else {
            const remaining = [0, 25, 50, 75, 100].filter(
                level => !session.baselines.find(b => b.loadLevel === level)
            );
            console.log(`   Remaining: ${remaining.join(', ')}%`);
        }
    }

    /**
     * STEP 2: Alignment Wizard
     * Records runout data while rotor is manually turned
     */
    static async recordAlignmentPoint(
        sessionId: string,
        angle: number, // degrees
        runout: number, // mm (from dial indicator/comparator)
        isHorizontal: boolean = false
    ): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');

        if (!session.alignmentData) {
            session.alignmentData = {
                timestamp: Date.now(),
                rotorPositions: [],
                shaftSag: 0,
                finalAlignment: 0,
                meetsStandard: false
            };
        }

        session.alignmentData.rotorPositions.push({ angle, runout });

        // Calculate shaft sag for horizontal machines
        if (isHorizontal && session.alignmentData.rotorPositions.length > 4) {
            session.alignmentData.shaftSag = this.calculateShaftSag(
                session.alignmentData.rotorPositions
            );
        }

        console.log(`📏 Alignment point recorded: ${angle}° → ${runout.toFixed(3)} mm`);
    }

    /**
     * STEP 3: Finalize Alignment
     */
    static async finalizeAlignment(
        sessionId: string,
        bearingSpan: number // meters
    ): Promise<AlignmentMeasurement> {
        const session = this.sessions.get(sessionId);
        if (!session || !session.alignmentData) throw new Error('No alignment data');

        const data = session.alignmentData;

        // Calculate total runout (peak-to-peak)
        const runouts = data.rotorPositions.map(p => p.runout);
        const maxRunout = Math.max(...runouts);
        const minRunout = Math.min(...runouts);
        const totalRunout = maxRunout - minRunout;

        // Compensate for shaft sag (horizontal machines)
        const compensatedRunout = totalRunout - data.shaftSag;

        // Convert to mm/m alignment
        data.finalAlignment = (compensatedRunout / bearingSpan) * 1000;

        // Check against 0.05 mm/m standard
        data.meetsStandard = data.finalAlignment <= 0.05;

        console.log(`📐 ALIGNMENT RESULTS:`);
        console.log(`   Total Runout: ${totalRunout.toFixed(3)} mm`);
        console.log(`   Shaft Sag (compensated): ${data.shaftSag.toFixed(3)} mm`);
        console.log(`   Final Alignment: ${data.finalAlignment.toFixed(3)} mm/m`);
        console.log(`   Standard (0.05 mm/m): ${data.meetsStandard ? '✅ PASS' : '❌ FAIL'}`);

        return data;
    }

    /**
     * STEP 4: Hydro-Static Test Logger
     */
    static async logHydroStaticTest(
        sessionId: string,
        pressureReadings: Array<{ time: number; pressure: number }>,
        initialPressure: number
    ): Promise<HydroStaticTestResult> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');

        // Calculate pressure drop rate
        const firstReading = pressureReadings[0];
        const lastReading = pressureReadings[pressureReadings.length - 1];
        const duration = lastReading.time - firstReading.time; // seconds
        const totalDrop = firstReading.pressure - lastReading.pressure;
        const dropRate = (totalDrop / duration) * 60; // bar/minute

        // Check linearity (R² correlation)
        const isLinear = this.checkPressureLinearity(pressureReadings);

        // Diagnose issue
        let suspectedIssue: HydroStaticTestResult['suspectedIssue'] = null;
        if (!isLinear) {
            if (dropRate > 0.5) {
                suspectedIssue = 'MICROCRACK';
            } else if (dropRate > 0.2) {
                suspectedIssue = 'AIR_IN_SYSTEM';
            } else {
                suspectedIssue = 'SEAL_LEAK';
            }
        }

        const result: HydroStaticTestResult = {
            timestamp: Date.now(),
            testDuration: duration,
            initialPressure,
            pressureReadings,
            pressureDropRate: dropRate,
            isLinear,
            suspectedIssue
        };

        session.hydroStaticTest = result;

        console.log(`💧 HYDRO-STATIC TEST RESULTS:`);
        console.log(`   Duration: ${duration}s`);
        console.log(`   Pressure drop: ${dropRate.toFixed(3)} bar/min`);
        console.log(`   Linear: ${isLinear ? 'YES ✅' : 'NO ❌'}`);
        if (suspectedIssue) {
            console.log(`   ⚠️ ANO-AGENT: Sumnja na ${suspectedIssue}`);
        }

        return result;
    }

    /**
     * STEP 5: Validate AI Diagnosis
     * "Old Master" feedback loop
     */
    static async validateAIDiagnosis(
        sessionId: string,
        engineerId: string,
        engineerName: string,
        aiDiagnosis: string,
        actualDiagnosis: string,
        reason: string,
        severity: AIValidationOverride['severity']
    ): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');

        const override: AIValidationOverride = {
            timestamp: Date.now(),
            engineerId,
            engineerName,
            aiDiagnosis,
            actualDiagnosis,
            reason,
            severity
        };

        session.aiValidationOverrides.push(override);

        console.log(`🔄 AI VALIDATION OVERRIDE:`);
        console.log(`   AI said: "${aiDiagnosis}"`);
        console.log(`   Expert says: "${actualDiagnosis}"`);
        console.log(`   Reason: ${reason}`);
        console.log(`   Severity: ${severity}`);
        console.log(`   → Local model will be re-trained`);

        // In production: Trigger ML retraining for this specific plant
        // await mlService.retrainLocalModel(session.assetId, override);
    }

    /**
     * Complete commissioning session
     */
    static async completeCommissioning(sessionId: string): Promise<CommissioningSession> {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');

        // Validation
        if (session.baselines.length < 5) {
            throw new Error('All 5 baseline fingerprints required');
        }

        if (!session.alignmentData) {
            throw new Error('Alignment data required');
        }

        session.status = 'COMPLETED';
        session.completedAt = Date.now();

        console.log(`✅✅✅ COMMISSIONING COMPLETE! ✅✅✅`);
        console.log(`   Asset: ${session.assetName}`);
        console.log(`   Baselines: ${session.baselines.length}/5 ✓`);
        console.log(`   Alignment: ${session.alignmentData.meetsStandard ? 'PASS' : 'FAIL'}`);
        console.log(`   Hydro test: ${session.hydroStaticTest ? 'DONE' : 'SKIPPED'}`);
        console.log(`   AI overrides: ${session.aiValidationOverrides.length}`);

        // Save to database
        // await this.saveToDatabase(session);

        return session;
    }

    // ===== HELPER METHODS =====

    private static analyzeAcousticBaseline(spectrum: number[]): BaselineFingerprint['acousticSignature'] {
        const rmsLevel = Math.sqrt(spectrum.reduce((sum, val) => sum + val * val, 0) / spectrum.length);

        // Extract dominant frequencies (top 5 peaks)
        const peaks = this.findPeaks(spectrum);
        const dominantFrequencies = peaks.slice(0, 5).map(p => p.frequency);

        // Cavitation index (high-frequency energy ratio)
        const highFreqEnergy = spectrum.slice(Math.floor(spectrum.length * 0.7)).reduce((sum, val) => sum + val, 0);
        const totalEnergy = spectrum.reduce((sum, val) => sum + val, 0);
        const cavitationIndex = (highFreqEnergy / totalEnergy) * 10;

        return {
            spectrum,
            dominantFrequencies,
            rmsLevel,
            cavitationIndex
        };
    }

    private static extractDominantFrequencies(vibration: any): number[] {
        // Simplified - in production would use FFT on time-domain data
        return [16.67, 33.33, 50]; // Mock: 1x, 2x, 3x running speed
    }

    private static findPeaks(spectrum: number[]): Array<{ frequency: number; amplitude: number }> {
        const peaks: Array<{ frequency: number; amplitude: number }> = [];

        for (let i = 1; i < spectrum.length - 1; i++) {
            if (spectrum[i] > spectrum[i - 1] && spectrum[i] > spectrum[i + 1]) {
                peaks.push({ frequency: i * 10, amplitude: spectrum[i] }); // Assuming 10 Hz bins
            }
        }

        return peaks.sort((a, b) => b.amplitude - a.amplitude);
    }

    /**
     * Calculate shaft sag for horizontal machines
     * Due to rotor's own weight, shaft bends downward
     * Formula: Sag = (W × L³) / (48 × E × I)
     * 
     * Practical method: Find difference between top and bottom runout readings
     */
    private static calculateShaftSag(positions: Array<{ angle: number; runout: number }>): number {
        // Find readings at top (90°) and bottom (270°)
        const topReading = positions.find(p => Math.abs(p.angle - 90) < 10);
        const bottomReading = positions.find(p => Math.abs(p.angle - 270) < 10);

        if (!topReading || !bottomReading) return 0;

        // Shaft sag is difference between bottom and top
        const sag = Math.abs(bottomReading.runout - topReading.runout) / 2;

        return sag;
    }

    /**
     * Check if pressure drop is linear (no micro-cracks)
     */
    private static checkPressureLinearity(readings: Array<{ time: number; pressure: number }>): boolean {
        // Calculate R² (coefficient of determination)
        const n = readings.length;
        const times = readings.map(r => r.time);
        const pressures = readings.map(r => r.pressure);

        const meanTime = times.reduce((sum, t) => sum + t, 0) / n;
        const meanPressure = pressures.reduce((sum, p) => sum + p, 0) / n;

        let ssRes = 0;
        let ssTot = 0;

        // Simple linear regression
        let sumXY = 0;
        let sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumXY += (times[i] - meanTime) * (pressures[i] - meanPressure);
            sumXX += (times[i] - meanTime) ** 2;
        }
        const slope = sumXY / sumXX;
        const intercept = meanPressure - slope * meanTime;

        // Calculate R²
        for (let i = 0; i < n; i++) {
            const predicted = slope * times[i] + intercept;
            ssRes += (pressures[i] - predicted) ** 2;
            ssTot += (pressures[i] - meanPressure) ** 2;
        }

        const rSquared = 1 - (ssRes / ssTot);

        // Linear if R² > 0.95
        return rSquared > 0.95;
    }
}
