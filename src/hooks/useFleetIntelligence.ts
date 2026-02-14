import { useState, useEffect, useMemo } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { PlantStatus, HiveEvent } from '../features/telemetry/store/useTelemetryStore';

export type { PlantStatus, HiveEvent };

export const useFleetIntelligence = () => {
    // 1. GLOBAL STORE STATE
    const { fleet, hiveEvents, updateFleet, addHiveEvent } = useTelemetryStore(state => ({
        fleet: state.fleet,
        hiveEvents: state.hiveEvents,
        updateFleet: state.updateFleet,
        addHiveEvent: state.addHiveEvent
    }));

    // 2. SIMULATION LOOP (The Hive Pulse)
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly fluctuate metrics
            const updatedFleet = fleet.map(p => ({
                ...p,
                load: Math.min(100, Math.max(0, p.load + (Math.random() - 0.5) * 5)),
                efficiency: Math.min(98, Math.max(80, p.efficiency + (Math.random() - 0.5) * 0.2))
            }));
            updateFleet(updatedFleet);

            // Randomly trigger a HIVE EVENT (Knowledge Transfer)
            if (Math.random() > 0.7) {
                const source = fleet[Math.floor(Math.random() * fleet.length)]?.id || 'UNIT-01';
                const target = fleet[Math.floor(Math.random() * fleet.length)]?.id || 'UNIT-02';
                
                if (source === target) return;

                const type = Math.random() > 0.5 ? 'WEIGHT_SYNC' : 'PREDICTIVE_INJECTION';

                const newEvent: HiveEvent = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    sourcePlant: source,
                    targetPlant: target,
                    type: type,
                    detail: type === 'WEIGHT_SYNC'
                        ? `Optimized 'Vibration.Skew' weights (${(0.9 + Math.random() * 0.2).toFixed(2)}x)`
                        : 'Injecting Proactive Maintenance: Bearing Check'
                };

                addHiveEvent(newEvent);
            }

        }, 3000);

        return () => clearInterval(interval);
    }, [fleet, updateFleet, addHiveEvent]);

    // 3. AGGREGATE METRICS
    const fleetRI = useMemo(() => {
        if (fleet.length === 0) return '0.0';
        const totalHealth = fleet.reduce((acc, p) => acc + p.healthScore, 0);
        return (totalHealth / fleet.length).toFixed(1);
    }, [fleet]);

    return {
        plants: fleet,
        fleetRI,
        hiveEvents
    };
};
