import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTelemetry } from './TelemetryContext.tsx';

interface ForensicsData {
    timestamp: number;
    cylinderPressure: number;
    actuatorPosition: number;
    oilTemperature: number;
    dpdt: number;
    vibration: number;
    excitationCurrent: number;
    proximityX: number;
    proximityY: number;
}

interface BlackBoxContextType {
    isRecording: boolean;
    frozenBuffer: ForensicsData[] | null;
    currentBuffer: ForensicsData[];
    lockedIncidentId: string | null;
    isPostCaptureAction: boolean;
    resetForensics: () => void;
}

const ForensicsContext = createContext<BlackBoxContextType | undefined>(undefined);

const BUFFER_LIMIT = 60000; // 60 seconds total window (1ms-level simulation @ 10ms sampling)
const POST_INCIDENT_DELAY = 30000; // 30s post-save

export const ForensicsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { telemetry, activeIncident } = useTelemetry();
    const [frozenBuffer, setFrozenBuffer] = useState<ForensicsData[] | null>(null);
    const [lockedIncidentId, setLockedIncidentId] = useState<string | null>(null);
    const [isPostCaptureAction, setIsPostCaptureAction] = useState(false);
    const bufferRef = useRef<ForensicsData[]>([]);
    const incidentTimeRef = useRef<number | null>(null);

    useEffect(() => {
        // High-speed simulation loop
        const interval = setInterval(() => {
            if (isPostCaptureAction && frozenBuffer) return; // Stop update once fully frozen

            const keys = Object.keys(telemetry);
            if (keys.length === 0) return;

            // Track primary asset
            const data = telemetry[keys[0]];
            if (!data) return;

            const newPoint: ForensicsData = {
                timestamp: Date.now(),
                cylinderPressure: data.cylinderPressure,
                actuatorPosition: data.actuatorPosition,
                oilTemperature: data.temperature,
                dpdt: data.oilPressureRate,
                vibration: data.vibration,
                excitationCurrent: data.excitationCurrent,
                proximityX: data.proximityX,
                proximityY: data.proximityY
            };

            bufferRef.current.push(newPoint);

            // Maintenance of rolling buffer if not in post-capture phase
            if (!incidentTimeRef.current && bufferRef.current.length > BUFFER_LIMIT) {
                bufferRef.current.shift();
            }

            // check if we have completed the post-capture window (30s after first alarm)
            if (incidentTimeRef.current && (Date.now() - incidentTimeRef.current > POST_INCIDENT_DELAY) && !frozenBuffer) {
                setFrozenBuffer([...bufferRef.current]);
                setIsPostCaptureAction(true);
            }
        }, 10); // 10ms sampling

        return () => clearInterval(interval);
    }, [telemetry, isPostCaptureAction, frozenBuffer]);

    // Handle Incident Lock initiation
    useEffect(() => {
        if (activeIncident && !incidentTimeRef.current) {
            incidentTimeRef.current = Date.now();
            setLockedIncidentId(`${activeIncident.assetId}-${activeIncident.timestamp}`);
        }
    }, [activeIncident]);

    const resetForensics = () => {
        setFrozenBuffer(null);
        setLockedIncidentId(null);
        setIsPostCaptureAction(false);
        incidentTimeRef.current = null;
        bufferRef.current = [];
    };

    return (
        <ForensicsContext.Provider value={{
            isRecording: !frozenBuffer,
            frozenBuffer,
            currentBuffer: bufferRef.current,
            lockedIncidentId,
            isPostCaptureAction,
            resetForensics
        }}>
            {children}
        </ForensicsContext.Provider>
    );
};

export const useForensics = () => {
    const context = useContext(ForensicsContext);
    if (!context) throw new Error('useForensics must be used within ForensicsProvider');
    return context;
};
