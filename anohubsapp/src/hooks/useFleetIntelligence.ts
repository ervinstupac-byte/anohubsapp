import { useState, useEffect, useMemo } from 'react';

export interface PlantStatus {
    id: string;
    name: string;
    location: { x: number; y: number }; // Relative coordinates for map (0-100)
    healthScore: number; // 0-100
    efficiency: number; // %
    load: number; // %
    activeAlerts: number;
    description: string;
}

export interface HiveEvent {
    id: string;
    timestamp: number;
    sourcePlant: string;
    targetPlant: string;
    type: 'WEIGHT_SYNC' | 'KNOWLEDGE_TRANSFER' | 'PREDICTIVE_INJECTION';
    detail: string;
}

export const useFleetIntelligence = () => {
    // 1. MOCK FLEET STATE
    const [plants, setPlants] = useState<PlantStatus[]>([
        {
            id: 'biha_01',
            name: 'HPP Bihać (Una)',
            location: { x: 20, y: 30 },
            healthScore: 98,
            efficiency: 92.5,
            load: 85,
            activeAlerts: 0,
            description: 'Kaplan - River Run'
        },
        {
            id: 'jajce_02',
            name: 'HPP Jajce (Vrbas)',
            location: { x: 50, y: 50 },
            healthScore: 85,
            efficiency: 88.2,
            load: 92,
            activeAlerts: 2, // Has issues
            description: 'Francis - High Head'
        },
        {
            id: 'saraj_03',
            name: 'HPP Sarajevo (Bosna)',
            location: { x: 80, y: 35 },
            healthScore: 94,
            efficiency: 90.1,
            load: 60,
            activeAlerts: 0,
            description: 'Pelton - Storage'
        }
    ]);

    const [hiveEvents, setHiveEvents] = useState<HiveEvent[]>([]);

    // 2. SIMULATION LOOP (The Hive Pulse)
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly fluctuate metrics
            setPlants(prev => prev.map(p => ({
                ...p,
                load: Math.min(100, Math.max(0, p.load + (Math.random() - 0.5) * 5)),
                efficiency: Math.min(98, Math.max(80, p.efficiency + (Math.random() - 0.5) * 0.2))
            })));

            // Randomly trigger a HIVE EVENT (Knowledge Transfer)
            if (Math.random() > 0.7) {
                const source = Math.random() > 0.5 ? 'biha_01' : 'saraj_03';
                const target = 'jajce_02';
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

                setHiveEvents(prev => [newEvent, ...prev].slice(0, 10));
            }

        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // 3. AGGREGATE METRICS
    const fleetRI = useMemo(() => {
        const totalHealth = plants.reduce((acc, p) => acc + p.healthScore, 0);
        return (totalHealth / plants.length).toFixed(1);
    }, [plants]);

    return {
        plants,
        fleetRI,
        hiveEvents
    };
};
