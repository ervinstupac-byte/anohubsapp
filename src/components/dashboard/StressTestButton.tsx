import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { AlertTriangle, Zap } from 'lucide-react';

export const StressTestButton: React.FC = () => {
    const { updateTelemetry, loadScenario } = useTelemetryStore();

    const simulateCavitationEvent = () => {
        console.log('🚨 STRESS TEST: Triggering Cavitation Event');
        
        // Override telemetry values to simulate severe cavitation
        updateTelemetry({
            hydraulic: {
                flow: 38, // Reduced flow
                head: 145, // Slightly reduced head
                efficiency: 0.72 // Major efficiency drop
            },
            mechanical: {
                vibrationX: 8.5, // Severe vibration
                vibrationY: 7.8,
                bearingTemp: 95, // High temperature
                rpm: 480 // Slightly off-speed
            }
        });

        // Also trigger the cavitation scenario for full effect
        loadScenario('CAVITATION');
    };

    const resetToNormal = () => {
        console.log('✅ STRESS TEST: Resetting to Normal Operation');
        loadScenario('NOMINAL');
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={simulateCavitationEvent}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
            >
                <AlertTriangle className="w-4 h-4" />
                Simulate Cavitation
            </button>
            
            <button
                onClick={resetToNormal}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
            >
                <Zap className="w-4 h-4" />
                Reset to Normal
            </button>
        </div>
    );
};
