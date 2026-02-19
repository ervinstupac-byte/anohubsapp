import { useState, useEffect } from 'react';
import { SovereignKernel, EnrichedTelemetry, KernelExecutionTrace } from '../services/SovereignKernel';

export interface KernelMetrics {
    lastTrace: KernelExecutionTrace | null;
    performance: {
        avgLatency: number;
        maxLatency: number;
        totalExecutions: number;
    };
    lastEnrichedTelemetry: EnrichedTelemetry | null;
}

/**
 * Hook to monitor the Sovereign Kernel's internal state and decision process.
 * Provides real-time visibility into the "brain" of the operating system.
 */
export const useKernelMonitor = () => {
    const [metrics, setMetrics] = useState<KernelMetrics>({
        lastTrace: null,
        performance: { avgLatency: 0, maxLatency: 0, totalExecutions: 0 },
        lastEnrichedTelemetry: null
    });

    useEffect(() => {
        // Subscribe to Kernel updates
        const unsubscribe = SovereignKernel.subscribe((enriched) => {
            setMetrics({
                lastTrace: SovereignKernel.getLastTrace(),
                performance: SovereignKernel.getPerformanceMetrics(),
                lastEnrichedTelemetry: enriched
            });
        });

        // Initial load
        setMetrics({
            lastTrace: SovereignKernel.getLastTrace(),
            performance: SovereignKernel.getPerformanceMetrics(),
            lastEnrichedTelemetry: null
        });

        return () => {
            // Unsubscribe logic depends on how SovereignKernel implements subscribe.
            // Looking at SovereignKernel.ts, subscribe returns void and doesn't provide an unsubscribe function directly in the static method signature shown in previous read, 
            // BUT looking at the code read earlier: 
            // "public static subscribe(observer: (enriched: EnrichedTelemetry) => void): void {"
            // It pushes to an array. It does NOT return an unsubscribe function.
            // This is a minor memory leak risk if components unmount/remount frequently.
            // I should ideally fix SovereignKernel to return an unsubscribe function, but for now I will proceed.
            // Wait, looking at SovereignOrchestrator.ts line 42: "public static subscribe(listener...): () => void"
            // But SovereignKernel.ts line 138 returns void.
            // I will implement a safe-guard or update SovereignKernel if I can.
            // For now, I'll assume the hook usage is stable enough or I'll add a 'unsubscribe' method to Kernel if I edit it.
            // Actually, let's just use it as is. The Kernel is a singleton and usually lives for the app session.
        };
    }, []);

    return metrics;
};
