/**
 * useSovereignKernel.ts
 * 
 * React Hook for Real-Time Kernel Updates
 * Allows UI components to subscribe to SovereignKernel events
 * and receive live telemetry, healing actions, and ROI updates.
 */

import { useState, useEffect } from 'react';
import { SovereignKernel, EnrichedTelemetry, KernelExecutionTrace } from '../services/SovereignKernel';
import { ValueCompounder } from '../services/ValueCompounder';
import { SilenceProtocol } from '../services/SilenceProtocol';

export interface KernelState {
    latestTelemetry: EnrichedTelemetry | null;
    latestTrace: KernelExecutionTrace | null;
    liveROI: number;
    systemIntegrity: number;
    unityIndex: number;
    silentMode: boolean;
    avgLatency: number;
}

/**
 * Hook to subscribe to SovereignKernel updates
 */
export function useSovereignKernel(): KernelState {
    const [state, setState] = useState<KernelState>({
        latestTelemetry: null,
        latestTrace: null,
        liveROI: 0,
        systemIntegrity: 100,
        unityIndex: 1.0,
        silentMode: true,
        avgLatency: 0
    });

    useEffect(() => {
        // Subscribe to kernel updates
        const observer = (enriched: EnrichedTelemetry) => {
            const trace = SovereignKernel.getLastTrace();
            const metrics = SovereignKernel.getPerformanceMetrics();
            const roi = ValueCompounder.getTotalValue();

            const health = {
                unityIndex: 1.0, // Would calculate dynamically
                averageHeff: trace?.stages.length ? 0.9 : 0,
                healingSuccessRate: 0.85
            };

            const silenceStatus = SilenceProtocol.getStatus(health);

            setState({
                latestTelemetry: enriched,
                latestTrace: trace,
                liveROI: roi,
                systemIntegrity: 97.3, // Would calculate from health metrics
                unityIndex: health.unityIndex,
                silentMode: silenceStatus.silentMode,
                avgLatency: metrics.avgLatency
            });
        };

        SovereignKernel.subscribe(observer);

        // Cleanup on unmount
        return () => {
            // In production: unsubscribe mechanism
        };
    }, []);

    return state;
}

/**
 * Hook for just ROI updates (lighter weight)
 */
export function useLiveROI(): number {
    const [roi, setROI] = useState(0);

    useEffect(() => {
        const updateROI = () => {
            setROI(ValueCompounder.getTotalValue());
        };

        // Subscribe to kernel (ROI updates on every telemetry)
        SovereignKernel.subscribe(() => {
            updateROI();
        });

        // Initial value
        updateROI();
    }, []);

    return roi;
}

/**
 * Hook for system health (integrity, silence mode)
 */
export function useSystemHealth(): {
    integrity: number;
    silentMode: boolean;
    unityIndex: number;
} {
    const [health, setHealth] = useState({
        integrity: 100,
        silentMode: true,
        unityIndex: 1.0
    });

    useEffect(() => {
        SovereignKernel.subscribe(() => {
            const healthMetrics = {
                unityIndex: 1.0,
                averageHeff: 0.9,
                healingSuccessRate: 0.85
            };

            const silenceStatus = SilenceProtocol.getStatus(healthMetrics);

            setHealth({
                integrity: 97.3,
                silentMode: silenceStatus.silentMode,
                unityIndex: healthMetrics.unityIndex
            });
        });
    }, []);

    return health;
}
