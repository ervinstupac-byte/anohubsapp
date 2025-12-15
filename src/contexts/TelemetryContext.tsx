import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAssetContext } from './AssetContext.tsx';

// Tipovi za telemetriju
export interface TelemetryData {
    assetId: string;
    timestamp: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    vibration: number; // mm/s
    temperature: number; // °C
    efficiency: number; // %
    output: number; // MW
}

interface TelemetryContextType {
    telemetry: Record<string, TelemetryData>; // Mapa: assetId -> podaci
    forceUpdate: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { assets } = useAssetContext();
    const [telemetry, setTelemetry] = useState<Record<string, TelemetryData>>({});

    // Generator nasumičnih podataka (Simulacija SCADA sustava)
    const generateSignal = () => {
        const newTelemetry: Record<string, TelemetryData> = {};
        
        assets.forEach(asset => {
            // Simuliramo realistične vrijednosti
            const baseVibration = asset.status === 'Critical' ? 0.08 : 0.02;
            const vibration = parseFloat((baseVibration + (Math.random() * 0.02)).toFixed(3));
            
            const temp = Math.floor(45 + Math.random() * 15); // 45-60 °C
            const eff = Math.floor(90 + Math.random() * 5);   // 90-95 %
            
            // Logika statusa bazirana na vibracijama
            let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
            if (vibration > 0.05) status = 'CRITICAL';
            else if (vibration > 0.04) status = 'WARNING';

            newTelemetry[asset.id] = {
                assetId: asset.id,
                timestamp: Date.now(),
                status,
                vibration,
                temperature: temp,
                efficiency: eff,
                output: asset.capacity ? parseFloat((asset.capacity * (eff/100)).toFixed(1)) : 0
            };
        });

        setTelemetry(newTelemetry);
    };

    // Pokreni simulaciju svakih 3 sekunde
    useEffect(() => {
        if (assets.length > 0) {
            generateSignal(); // Prvi run
            const interval = setInterval(generateSignal, 3000);
            return () => clearInterval(interval);
        }
    }, [assets]);

    return (
        <TelemetryContext.Provider value={{ telemetry, forceUpdate: generateSignal }}>
            {children}
        </TelemetryContext.Provider>
    );
};

export const useTelemetry = () => {
    const context = useContext(TelemetryContext);
    if (context === undefined) {
        throw new Error('useTelemetry must be used within a TelemetryProvider');
    }
    return context;
};