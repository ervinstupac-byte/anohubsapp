/**
 * TelemetrySyncService.ts
 * 
 * NC-800: Multi-Window Synchronization
 * Uses BroadcastChannel API to sync high-frequency telemetry between the main dashboard
 * and popped-out widget windows.
 */

class TelemetrySyncService {
    private channels: Map<string, BroadcastChannel> = new Map();
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    constructor() {
        // Singleton initialization if needed
    }

    /**
     * Get or create a channel
     */
    private getChannel(channelName: string): BroadcastChannel {
        if (!this.channels.has(channelName)) {
            const channel = new BroadcastChannel(`anohub_${channelName}`);
            channel.onmessage = (event) => {
                this.notifyListeners(channelName, event.data);
            };
            this.channels.set(channelName, channel);
        }
        return this.channels.get(channelName)!;
    }

    private notifyListeners(channelName: string, data: any) {
        if (this.listeners.has(channelName)) {
            this.listeners.get(channelName)!.forEach(cb => cb(data));
        }
    }

    /**
     * Broadcast data to all listeners on a specific channel
     */
    public broadcast(channelName: string, data: any) {
        const channel = this.getChannel(channelName);
        channel.postMessage(data);
    }

    /**
     * Subscribe to updates on a channel
     */
    public subscribe(channelName: string, callback: (data: any) => void) {
        // Ensure channel exists to start listening
        this.getChannel(channelName);

        if (!this.listeners.has(channelName)) {
            this.listeners.set(channelName, new Set());
        }
        this.listeners.get(channelName)!.add(callback);

        // Return unsubscribe function
        return () => {
            if (this.listeners.has(channelName)) {
                this.listeners.get(channelName)!.delete(callback);
            }
        };
    }

    /**
     * Close all channels (cleanup)
     */
    public closeAll() {
        this.channels.forEach(channel => channel.close());
        this.channels.clear();
        this.listeners.clear();
    }
}

export const telemetrySync = new TelemetrySyncService();
