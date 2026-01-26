/**
 * ConnectivityManager.ts
 * 
 * Fail-safe Offline Mode.
 * Detects network loss and serves cached "Last Known Good" state.
 */

import { TelemetryLogger } from './TelemetryLogger';

export class ConnectivityManager {
    private static isOnline = true;
    private static listeners: ((online: boolean) => void)[] = [];

    static {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.setOnline(true));
            window.addEventListener('offline', () => this.setOnline(false));
            this.isOnline = navigator.onLine;
        }
    }

    private static setOnline(status: boolean) {
        if (this.isOnline !== status) {
            this.isOnline = status;
            TelemetryLogger.log('INFO', `Network Status Changed: ${status ? 'ONLINE' : 'OFFLINE'}`);
            this.listeners.forEach(cb => cb(status));
        }
    }

    public static getStatus(): boolean {
        return this.isOnline;
    }

    public static subscribe(callback: (online: boolean) => void) {
        this.listeners.push(callback);
        // Initial call
        callback(this.isOnline);
    }

    /**
     * CACHE STRATEGY
     * Save critical Sovereign State to LocalStorage for offline hydration.
     */
    public static saveLocalState(key: string, data: any) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage save failed');
        }
    }

    public static loadLocalState(key: string): any | null {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }
}
