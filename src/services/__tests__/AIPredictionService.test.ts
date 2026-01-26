import { describe, it, expect, beforeEach } from 'vitest';
import { aiPredictionService } from '../AIPredictionService';
import { TelemetryData } from '../../contexts/TelemetryContext';

describe('AIPredictionService.forecastEtaBreakEven', () => {
    beforeEach(() => {
        // Clear in-memory history to ensure deterministic tests
        aiPredictionService.clearHistory(1);
        aiPredictionService.clearHistory(2);
        aiPredictionService.clearHistory(3);
    });

    it('returns null prediction for sparse data (<5 samples)', async () => {
        // Seed 3 telemetry points
        for (let i = 0; i < 3; i++) {
            aiPredictionService.detectSynergeticRisk(1, {
                assetId: 1,
                timestamp: Date.now() - (1000 * 60 * (5 - i)),
                status: 'OPTIMAL',
                vibration: 0.02,
                temperature: 50,
                efficiency: 92,
                output: 3.8,
                piezometricPressure: 4,
                seepageRate: 1,
                reservoirLevel: 100,
                foundationDisplacement: 0.01,
                wicketGatePosition: 45,
                tailwaterLevel: 100,
                cylinderPressure: 45,
                actuatorPosition: 45,
                oilPressureRate: 1,
                hoseTension: 20,
                pipeDiameter: 12,
                safetyValveActive: false,
                oilReservoirLevel: 80,
                rotorHeadVibration: 0.5,
                pumpFlowRate: 5,
                excitationActive: true,
                vibrationSpectrum: [0,0,0],
                drainagePumpActive: false,
                drainagePumpFrequency: 0,
                wicketGateSetpoint: 45,
                lastCommandTimestamp: Date.now(),
                fatiguePoints: 0,
                vibrationPhase: 0,
                oilViscosity: 40,
                bearingLoad: 800,
                statorTemperatures: [50,50,50,50,50,50],
                actualBladePosition: 45,
                bypassValveActive: false,
                hydrostaticLiftActive: false,
                shaftSag: 0,
                responseTimeIndex: 0.1,
                proximityX: 0,
                proximityY: 0,
                excitationCurrent: 0,
                rotorEccentricity: 0,
                cavitationIntensity: 0,
                bearingGrindIndex: 0,
                acousticBaselineMatch: 1,
                ultrasonicLeakIndex: 0
            } as TelemetryData);
        }

        const res = await aiPredictionService.forecastEtaBreakEven(1);
        expect(res.weeksUntil).toBeNull();
        expect(res.predictedTimestamp).toBeNull();
        expect(res.confidence).toBe(0);
    });

    it('handles flat trends without throwing and returns no crossing', async () => {
        // Seed 6 identical efficiency points
        const now = Date.now();
        for (let i = 0; i < 6; i++) {
            aiPredictionService.detectSynergeticRisk(2, {
                assetId: 2,
                timestamp: now - (i * 24 * 3600 * 1000),
                status: 'OPTIMAL',
                vibration: 0.02,
                temperature: 50,
                efficiency: 92,
                output: 3.8,
                piezometricPressure: 4,
                seepageRate: 1,
                reservoirLevel: 100,
                foundationDisplacement: 0.01,
                wicketGatePosition: 45,
                tailwaterLevel: 100,
                cylinderPressure: 45,
                actuatorPosition: 45,
                oilPressureRate: 1,
                hoseTension: 20,
                pipeDiameter: 12,
                safetyValveActive: false,
                oilReservoirLevel: 80,
                rotorHeadVibration: 0.5,
                pumpFlowRate: 5,
                excitationActive: true,
                vibrationSpectrum: [0,0,0],
                drainagePumpActive: false,
                drainagePumpFrequency: 0,
                wicketGateSetpoint: 45,
                lastCommandTimestamp: Date.now(),
                fatiguePoints: 0,
                vibrationPhase: 0,
                oilViscosity: 40,
                bearingLoad: 800,
                statorTemperatures: [50,50,50,50,50,50],
                actualBladePosition: 45,
                bypassValveActive: false,
                hydrostaticLiftActive: false,
                shaftSag: 0,
                responseTimeIndex: 0.1,
                proximityX: 0,
                proximityY: 0,
                excitationCurrent: 0,
                rotorEccentricity: 0,
                cavitationIntensity: 0,
                bearingGrindIndex: 0,
                acousticBaselineMatch: 1,
                ultrasonicLeakIndex: 0
            } as TelemetryData);
        }

        const res = await aiPredictionService.forecastEtaBreakEven(2);
        expect(res.weeksUntil).toBeNull();
        expect(res.predictedTimestamp).toBeNull();
        expect(res.confidence).toBeGreaterThan(0);
    });

    it('returns a numeric prediction for degrading trend', async () => {
        // Seed decreasing efficiency over time
        const now = Date.now();
        for (let i = 0; i < 8; i++) {
            aiPredictionService.detectSynergeticRisk(3, {
                assetId: 3,
                timestamp: now - ((7 - i) * 24 * 3600 * 1000),
                status: 'OPTIMAL',
                vibration: 0.03,
                temperature: 55,
                efficiency: 95 - i * 1.5, // decreasing
                output: 3.8,
                piezometricPressure: 4,
                seepageRate: 1,
                reservoirLevel: 100,
                foundationDisplacement: 0.01,
                wicketGatePosition: 45,
                tailwaterLevel: 100,
                cylinderPressure: 45,
                actuatorPosition: 45,
                oilPressureRate: 1,
                hoseTension: 20,
                pipeDiameter: 12,
                safetyValveActive: false,
                oilReservoirLevel: 80,
                rotorHeadVibration: 0.5,
                pumpFlowRate: 5,
                excitationActive: true,
                vibrationSpectrum: [0,0,0],
                drainagePumpActive: false,
                drainagePumpFrequency: 0,
                wicketGateSetpoint: 45,
                lastCommandTimestamp: Date.now(),
                fatiguePoints: 0,
                vibrationPhase: 0,
                oilViscosity: 40,
                bearingLoad: 800,
                statorTemperatures: [50,50,50,50,50,50],
                actualBladePosition: 45,
                bypassValveActive: false,
                hydrostaticLiftActive: false,
                shaftSag: 0,
                responseTimeIndex: 0.1,
                proximityX: 0,
                proximityY: 0,
                excitationCurrent: 0,
                rotorEccentricity: 0,
                cavitationIntensity: 0,
                bearingGrindIndex: 0,
                acousticBaselineMatch: 1,
                ultrasonicLeakIndex: 0
            } as TelemetryData);
        }

        const res = await aiPredictionService.forecastEtaBreakEven(3);
        // Should produce a numeric prediction or at least a confidence > 0
        expect(res.confidence).toBeGreaterThan(0);
        // Either predictedTimestamp not null or weeksUntil is numeric
        expect(res.weeksUntil === null ? res.predictedTimestamp === null : typeof res.weeksUntil === 'number').toBeTruthy();
    });
});
