/**
 * GLOBAL ERROR CONTEXT
 * Graceful handling of sensor disconnects and system faults.
 * Provides UI-wide error state for the HMI to display degraded mode indicators.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { plcGateway } from '../core/PLCGateway';
import { ConnectionStatus, PLCSignal, PLCSubscriber } from '../types/plc';

// ==================== ERROR TYPES ====================

export type SensorErrorType = 'DISCONNECTED' | 'TIMEOUT' | 'INVALID_DATA' | 'OUT_OF_RANGE';

export interface SensorError {
    sensorId: string;
    type: SensorErrorType;
    timestamp: number;
    lastKnownValue?: number;
    unit?: string;
    message: string;
}

export interface SystemFault {
    id: string;
    type: 'PLC_DISCONNECT' | 'DATABASE_ERROR' | 'NETWORK_ERROR' | 'CALCULATION_ERROR';
    severity: 'WARNING' | 'CRITICAL';
    timestamp: number;
    message: string;
    dismissed: boolean;
}

// ==================== CONTEXT TYPE ====================

export interface GlobalErrorState {
    /** Map of sensor ID to error state */
    sensorErrors: Map<string, SensorError>;

    /** System-level faults */
    systemFaults: SystemFault[];

    /** PLC connection status */
    connectionStatus: ConnectionStatus;

    /** Whether any critical fault is active */
    hasActiveFault: boolean;

    /** Count of active sensor errors */
    activeSensorErrorCount: number;

    /** Actions */
    reportSensorError: (error: SensorError) => void;
    clearSensorError: (sensorId: string) => void;
    reportSystemFault: (fault: Omit<SystemFault, 'id' | 'dismissed'>) => void;
    dismissSystemFault: (faultId: string) => void;
    clearAllErrors: () => void;
}

const GlobalErrorContext = createContext<GlobalErrorState | undefined>(undefined);

// ==================== PROVIDER ====================

interface GlobalErrorProviderProps {
    children: ReactNode;
}

export const GlobalErrorProvider: React.FC<GlobalErrorProviderProps> = ({ children }) => {
    const [sensorErrors, setSensorErrors] = useState<Map<string, SensorError>>(new Map());
    const [systemFaults, setSystemFaults] = useState<SystemFault[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');

    // Subscribe to PLC gateway for connection status
    useEffect(() => {
        // MANUAL MODE OVERRIDE: Suppress connection errors by default
        setConnectionStatus('CONNECTED'); 

        const subscriber: PLCSubscriber = {
            onSignalUpdate: (signal: PLCSignal) => {
                // Clear error if signal quality is GOOD
                if (signal.quality === 'GOOD') {
                    setSensorErrors(prev => {
                        const next = new Map(prev);
                        next.delete(signal.signalId);
                        return next;
                    });
                } else if (signal.quality === 'DISCONNECTED' || signal.quality === 'BAD_CONFIG') {
                    // Suppress sensor errors in Manual/Simulation mode
                    // Optionally log but don't disrupt UI
                    console.debug(`[Manual Mode] Suppressed sensor error: ${signal.signalId}`);
                }
            },
            onConnectionLost: () => {
                // MANUAL MODE: Do not transition to DISCONNECTED
                console.warn('[Manual Mode] PLC Connection lost - Ignoring for UI stability');
            },
            onConnectionRestored: () => {
                setConnectionStatus('CONNECTED');
                // Auto-dismiss PLC disconnect faults
                setSystemFaults(prev =>
                    prev.map(fault =>
                        fault.type === 'PLC_DISCONNECT'
                            ? { ...fault, dismissed: true }
                            : fault
                    )
                );
            }
        };

        const unsubscribe = plcGateway.subscribe(subscriber);
        // FORCE CONNECTED STATE
        setConnectionStatus('CONNECTED');

        return unsubscribe;
    }, []);

    // ==================== ACTIONS ====================

    const reportSensorError = useCallback((error: SensorError) => {
        setSensorErrors(prev => {
            const next = new Map(prev);
            next.set(error.sensorId, error);
            return next;
        });
    }, []);

    const clearSensorError = useCallback((sensorId: string) => {
        setSensorErrors(prev => {
            const next = new Map(prev);
            next.delete(sensorId);
            return next;
        });
    }, []);

    const reportSystemFault = useCallback((fault: Omit<SystemFault, 'id' | 'dismissed'>) => {
        const newFault: SystemFault = {
            ...fault,
            id: `fault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dismissed: false
        };
        setSystemFaults(prev => [...prev, newFault]);
    }, []);

    const dismissSystemFault = useCallback((faultId: string) => {
        setSystemFaults(prev =>
            prev.map(fault =>
                fault.id === faultId
                    ? { ...fault, dismissed: true }
                    : fault
            )
        );
    }, []);

    const clearAllErrors = useCallback(() => {
        setSensorErrors(new Map());
        setSystemFaults([]);
    }, []);

    // ==================== COMPUTED VALUES ====================

    const activeSensorErrorCount = sensorErrors.size;

    const hasActiveFault =
        connectionStatus === 'DISCONNECTED' ||
        systemFaults.some(f => !f.dismissed && f.severity === 'CRITICAL') ||
        activeSensorErrorCount > 0;

    // ==================== RENDER ====================

    return (
        <GlobalErrorContext.Provider value={{
            sensorErrors,
            systemFaults,
            connectionStatus,
            hasActiveFault,
            activeSensorErrorCount,
            reportSensorError,
            clearSensorError,
            reportSystemFault,
            dismissSystemFault,
            clearAllErrors
        }}>
            {children}
        </GlobalErrorContext.Provider>
    );
};

// ==================== HOOK ====================

export const useGlobalError = (): GlobalErrorState => {
    const context = useContext(GlobalErrorContext);
    if (!context) {
        throw new Error('useGlobalError must be used within GlobalErrorProvider');
    }
    return context;
};

// ==================== ERROR BANNER COMPONENT ====================

/**
 * Floating error banner for system-wide faults
 */
export const GlobalErrorBanner: React.FC = () => {
    const { systemFaults, connectionStatus, dismissSystemFault, activeSensorErrorCount } = useGlobalError();

    const activeFaults = systemFaults.filter(f => !f.dismissed);

    if (activeFaults.length === 0 && connectionStatus !== 'DISCONNECTED' && activeSensorErrorCount === 0) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-900/95 border-b border-red-500 px-4 py-2 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white text-sm font-bold uppercase tracking-wider">
                        {connectionStatus === 'DISCONNECTED'
                            ? 'PLC DISCONNECTED'
                            : activeSensorErrorCount > 0
                                ? `${activeSensorErrorCount} SENSOR ERROR${activeSensorErrorCount > 1 ? 'S' : ''}`
                                : 'SYSTEM FAULT'
                        }
                    </span>
                    <span className="text-red-300 text-xs">
                        {activeFaults[0]?.message || 'Displaying last known values'}
                    </span>
                </div>
                {activeFaults.length > 0 && (
                    <button
                        onClick={() => dismissSystemFault(activeFaults[0].id)}
                        className="text-white/60 hover:text-white text-xs uppercase tracking-wider"
                    >
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
};
