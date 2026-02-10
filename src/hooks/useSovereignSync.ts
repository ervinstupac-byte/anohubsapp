import { useEffect, useRef, useState } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';

const CHANNEL_NAME = 'sovereign_sync';
const SYNC_INTERVAL_MS = 16; // ~60fps

/**
 * NC-9000: Multi-Screen Command Infrastructure
 * synchronizes state between Main Window (Commander) and Detached Modules.
 */
export const useSovereignSync = (isDetached: boolean = false) => {
    const channelRef = useRef<BroadcastChannel | null>(null);
    const lastBroadcastRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);
    const [lastSync, setLastSync] = useState<number>(0);

    useEffect(() => {
        // Initialize Channel
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = channel;

        if (isDetached) {
            // LISTENER MODE (Detached Window)
            const handleMessage = (event: MessageEvent) => {
                // Use RAF to throttle UI updates if needed, but setState is usually fast enough.
                // For "Live Wire" latency, we apply immediately but let React schedule.
                // Ensure we don't trigger a broadcast loop if we were broadcasting too.
                useTelemetryStore.setState(event.data);
                setLastSync(Date.now());
            };

            channel.addEventListener('message', handleMessage);

            // Request immediate sync on mount
            channel.postMessage({ type: 'SYNC_REQUEST' });

            return () => {
                channel.removeEventListener('message', handleMessage);
                channel.close();
            };
        } else {
            // COMMANDER MODE (Main Window)
            // Subscribe to store changes and broadcast
            const unsub = useTelemetryStore.subscribe((state) => {
                const now = performance.now();
                if (now - lastBroadcastRef.current >= SYNC_INTERVAL_MS) {
                    // Throttle to 60fps
                    // We only broadcast high-frequency data to avoid payload overhead
                    const payload = {
                        hydraulic: state.hydraulic,
                        mechanical: state.mechanical,
                        physics: state.physics,
                        electrical: state.electrical, // For efficiency calc
                        resonanceState: state.resonanceState, // NC-9300: Audio Sync
                        isCommanderMode: state.isCommanderMode, // Sync guest/commander state
                        timestamp: Date.now()
                    };
                    
                    // Use RAF to decouple from React render cycle if needed
                    if (rafRef.current) cancelAnimationFrame(rafRef.current);
                    rafRef.current = requestAnimationFrame(() => {
                         channel.postMessage(payload);
                         lastBroadcastRef.current = performance.now();
                    });
                }
            });

            // Listen for sync requests from new windows
            channel.onmessage = (event) => {
                if (event.data?.type === 'SYNC_REQUEST') {
                    const state = useTelemetryStore.getState();
                    channel.postMessage({
                        hydraulic: state.hydraulic,
                        mechanical: state.mechanical,
                        physics: state.physics,
                        electrical: state.electrical,
                        resonanceState: state.resonanceState,
                        isCommanderMode: state.isCommanderMode,
                        timestamp: Date.now()
                    });
                }
            };

            return () => {
                unsub();
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                channel.close();
            };
        }
    }, [isDetached]);

    return { isReady: !!channelRef.current, lastSync };
};
