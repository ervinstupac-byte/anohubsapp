import { useMemo } from 'react';
import { useTelemetryStore } from '../../telemetry/store/useTelemetryStore';
import { calculateMaintenancePrediction } from '../logic/Predictor';
import { PredictionInput, MaintenancePrediction } from '../types';

// UI Interface (Adapter Pattern)
export interface MaintenanceEvent {
    id: string;
    componentName: string;
    predictedDate: Date;
    daysRemaining: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number; // %
    reason: string;
}

export const useMaintenancePrediction = (): MaintenanceEvent[] => {
    const { mechanical, hydraulic } = useTelemetryStore();

    // MOCK CONFIGURATION (Ideally from AssetStore)
    const mockComponents = [
        {
            id: 'thrust-bearing-01',
            name: 'Thrust Bearing Pads',
            designLifeHours: 50000,
            accumulatedRunHours: 35000 // Mock Base
        },
        {
            id: 'runner-01',
            name: 'Runner Cavitation Check',
            designLifeHours: 8000, // Frequent inspection
            accumulatedRunHours: 4000
        }
    ];

    const telemetrySnapshot = useMemo(() => ({
        vibration: mechanical.vibration || 0.032,
        cavitation: (hydraulic.efficiency || 0.9) < 0.85 ? 0.8 : 0.1, // Proxy cavitation from efficiency
        runHoursDelta: 0, // Mock
        starts: 0
    }), [mechanical, hydraulic]);

    const predictions = useMemo(() => {
        return mockComponents.map(comp => {
            const input: PredictionInput = {
                config: {
                    id: comp.id,
                    name: comp.name,
                    designLifeHours: comp.designLifeHours,
                    installationDate: '2023-01-01',
                    wearFactorCurve: 'LINEAR'
                },
                telemetry: {
                    accumulatedRunHours: comp.accumulatedRunHours,
                    currentVibrationMMs: telemetrySnapshot.vibration,
                    currentEfficiencyPercent: (hydraulic.efficiency || 0.9) * 100,
                    startsAndStops: 50,
                    cavitationIndex: telemetrySnapshot.cavitation
                }
            };

            const prediction = calculateMaintenancePrediction(input);

            // Adapt to UI Event
            const days = Math.round(prediction.remainingLifeHours / 24);

            const urgencyMap: Record<string, MaintenanceEvent['urgency']> = {
                'OPTIMAL': 'LOW',
                'PLANNING': 'MEDIUM',
                'PRIORITY': 'HIGH',
                'CRITICAL': 'CRITICAL'
            };

            return {
                id: prediction.componentId,
                componentName: comp.name,
                predictedDate: new Date(prediction.predictedFailureDate),
                daysRemaining: days,
                urgency: urgencyMap[prediction.urgency],
                confidence: 85 + (prediction.degradationFactor > 1 ? 10 : 0), // Higher confidence if we see degradation? or lower?
                reason: prediction.primaryStressor === 'NONE' ? 'Standard Wear' : `Accelerated by ${prediction.primaryStressor}`
            } as MaintenanceEvent;
        });
    }, [telemetrySnapshot]);

    // Sort by urgency/days
    return predictions.sort((a, b) => a.daysRemaining - b.daysRemaining);
};
