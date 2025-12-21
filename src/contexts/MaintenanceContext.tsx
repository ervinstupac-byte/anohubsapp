import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useAssetContext } from './AssetContext.tsx';
import { useTelemetry } from './TelemetryContext.tsx';
import { useToast } from './ToastContext.tsx';

interface MaintenanceProtocol {
    id: string;
    name: string;
    threshold: number; // in hours
    description: string;
}

interface MaintenanceContextType {
    operatingHours: Record<string, number>;
    protocols: MaintenanceProtocol[];
    predictServiceDate: (assetId: string, protocolThreshold: number) => Date | null;
    sealingService: (assetId: string, protocolName: string, engineerId: string) => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const protocols: MaintenanceProtocol[] = [
    { id: 'bearing_insp', name: 'Bearing Inspection', threshold: 8000, description: 'Internal inspection of turbine bearings and temperature sensors.' },
    { id: 'oil_filt', name: 'Oil Filtration', threshold: 4000, description: 'Complete filtration and analysis of hydraulic and lubricating oils.' },
    { id: 'align_check', name: 'Alignment Check', threshold: 12000, description: 'High-precision laser alignment of the main shaft and generator.' }
];

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { assets } = useAssetContext();
    const { telemetry } = useTelemetry();
    const { showToast } = useToast();
    const [operatingHours, setOperatingHours] = useState<Record<string, number>>({});

    // 1. Initial Load: Fetch hours from Supabase
    useEffect(() => {
        const fetchHours = async () => {
            const { data, error } = await supabase.from('assets').select('id, operating_hours');
            if (error) console.error('Error fetching operating hours:', error);
            if (data) {
                const hourMap: Record<string, number> = {};
                data.forEach(a => hourMap[a.id] = parseFloat(a.operating_hours) || 0);
                setOperatingHours(hourMap);
            }
        };
        fetchHours();
    }, [assets]);

    // 2. Accumulate Hours: Real-time increment logic
    // We increment hours every 10 seconds for turbines that are RUNNING
    useEffect(() => {
        const interval = setInterval(() => {
            setOperatingHours(prev => {
                const next = { ...prev };
                Object.keys(telemetry).forEach(assetId => {
                    const data = telemetry[assetId];
                    // If the turbine is generating power, we consider it "Running"
                    if (data && data.output > 0) {
                        const increment = (10 / 3600); // 10 seconds converted to hours
                        next[assetId] = (next[assetId] || 0) + increment;
                    }
                });
                return next;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [telemetry]);

    // 3. Persist Hours (Debounced update to DB)
    useEffect(() => {
        const timer = setTimeout(async () => {
            const updates = Object.entries(operatingHours).map(([id, hours]) => ({
                id,
                operating_hours: hours
            }));

            // Note: Batch update in Supabase would be better, but we'll do individual for simplicity in this proto
            for (const update of updates) {
                await supabase.from('assets').update({ operating_hours: update.operating_hours }).eq('id', update.id);
            }
        }, 60000); // Persist every minute

        return () => clearTimeout(timer);
    }, [operatingHours]);

    // 4. Predictive Algorithm
    const predictServiceDate = useCallback((assetId: string, protocolThreshold: number): Date | null => {
        const currentHours = operatingHours[assetId] || 0;
        const liveData = telemetry[assetId];
        if (!liveData || liveData.output === 0) return null;

        const remainingHours = protocolThreshold - (currentHours % protocolThreshold);

        // Intensity Calculation: How many hours/day does it run?
        // We assume 24h as baseline, modified by efficiency/output ratio
        const avgHoursPerDay = 24 * (liveData.efficiency / 100);
        const daysUntilService = remainingHours / avgHoursPerDay;

        const date = new Date();
        date.setDate(date.getDate() + daysUntilService);
        return date;
    }, [operatingHours, telemetry]);

    // 5. Digital Integrity Integration (Sealing)
    const sealingService = async (assetId: string, protocolName: string, engineerId: string) => {
        const hours = operatingHours[assetId] || 0;

        // Push to Maintenance Log
        const { error: logError } = await supabase.from('maintenance_logs').insert([{
            asset_id: assetId,
            service_type: protocolName,
            hours_at_service: hours,
            engineer_id: engineerId,
            details: { timestamp: new Date().toISOString() }
        }]);

        if (logError) throw logError;

        showToast(`Maintenance Seal Generated for ${protocolName}`, 'success');
    };

    return (
        <MaintenanceContext.Provider value={{ operatingHours, protocols, predictServiceDate, sealingService }}>
            {children}
        </MaintenanceContext.Provider>
    );
};

export const useMaintenance = () => {
    const context = useContext(MaintenanceContext);
    if (!context) throw new Error('useMaintenance must be used within a MaintenanceProvider');
    return context;
};
