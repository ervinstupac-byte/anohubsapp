import Decimal from 'decimal.js';

/**
 * LocalLedger — Offline-First Persistence Layer
 * 
 * Every field action gets a UUID + LocalTimestamp before storage.
 * Ensures data integrity even without network connectivity.
 * Uses Decimal.js for precision-safe serialization (0.052 mm → "0.052").
 */

export interface LedgerEntry {
    uuid: string;
    localTimestamp: number;
    syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR';
    syncAttempts: number;
    lastSyncAttempt?: number;
    errorMessage?: string;
    payload: Record<string, any>;
    source: 'MEASUREMENT' | 'PROTOCOL' | 'WORK_ORDER' | 'TELEMETRY';
}

const LEDGER_KEY = 'anohub_local_ledger';
const MAX_ENTRIES = 500; // LRU eviction threshold

export class LocalLedger {
    /**
     * Create a new ledger entry with UUID and timestamp
     */
    static createEntry(
        payload: Record<string, any>,
        source: LedgerEntry['source'] = 'MEASUREMENT'
    ): LedgerEntry {
        const entry: LedgerEntry = {
            uuid: crypto.randomUUID(),
            localTimestamp: Date.now(),
            syncStatus: 'PENDING',
            syncAttempts: 0,
            payload: this.serializePrecision(payload),
            source
        };

        this.saveEntry(entry);
        return entry;
    }

    /**
     * Decimal.js precision-safe serialization
     * Converts Decimal instances to { __decimal: "0.052" } format
     */
    static serializePrecision(obj: any): any {
        if (obj instanceof Decimal) {
            return { __decimal: obj.toString() };
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.serializePrecision(item));
        }
        if (typeof obj === 'object' && obj !== null) {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [
                    key,
                    this.serializePrecision(value)
                ])
            );
        }
        return obj;
    }

    /**
     * Deserialize back to Decimal instances
     */
    static deserializePrecision(obj: any): any {
        if (obj && typeof obj === 'object' && '__decimal' in obj) {
            return new Decimal(obj.__decimal);
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.deserializePrecision(item));
        }
        if (typeof obj === 'object' && obj !== null) {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [
                    key,
                    this.deserializePrecision(value)
                ])
            );
        }
        return obj;
    }

    /**
     * Get all entries from localStorage
     */
    static getAllEntries(): LedgerEntry[] {
        try {
            const data = localStorage.getItem(LEDGER_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[LocalLedger] Failed to read:', e);
            return [];
        }
    }

    /**
     * Get pending entries that need sync
     */
    static getPending(): LedgerEntry[] {
        return this.getAllEntries().filter(e => e.syncStatus === 'PENDING');
    }

    /**
     * Get entries with errors
     */
    static getErrors(): LedgerEntry[] {
        return this.getAllEntries().filter(e => e.syncStatus === 'ERROR');
    }

    /**
     * Save a single entry (adds to existing)
     */
    static saveEntry(entry: LedgerEntry): void {
        const entries = this.getAllEntries();
        const existingIndex = entries.findIndex(e => e.uuid === entry.uuid);

        if (existingIndex >= 0) {
            entries[existingIndex] = entry;
        } else {
            entries.push(entry);
        }

        // LRU eviction: remove oldest SYNCED entries if over limit
        if (entries.length > MAX_ENTRIES) {
            const synced = entries.filter(e => e.syncStatus === 'SYNCED');
            synced.sort((a, b) => a.localTimestamp - b.localTimestamp);
            const toRemove = synced.slice(0, entries.length - MAX_ENTRIES);
            const toRemoveIds = new Set(toRemove.map(e => e.uuid));
            const filtered = entries.filter(e => !toRemoveIds.has(e.uuid));
            this.saveAll(filtered);
        } else {
            this.saveAll(entries);
        }
    }

    /**
     * Save all entries
     */
    private static saveAll(entries: LedgerEntry[]): void {
        try {
            localStorage.setItem(LEDGER_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error('[LocalLedger] Failed to save:', e);
        }
    }

    /**
     * Mark entry as syncing
     */
    static markSyncing(uuid: string): void {
        const entries = this.getAllEntries();
        const entry = entries.find(e => e.uuid === uuid);
        if (entry) {
            entry.syncStatus = 'SYNCING';
            entry.syncAttempts++;
            entry.lastSyncAttempt = Date.now();
            this.saveAll(entries);
        }
    }

    /**
     * Mark entry as synced
     */
    static markSynced(uuid: string): void {
        const entries = this.getAllEntries();
        const entry = entries.find(e => e.uuid === uuid);
        if (entry) {
            entry.syncStatus = 'SYNCED';
            this.saveAll(entries);
        }
    }

    /**
     * Mark entry as error
     */
    static markError(uuid: string, errorMessage: string): void {
        const entries = this.getAllEntries();
        const entry = entries.find(e => e.uuid === uuid);
        if (entry) {
            entry.syncStatus = 'ERROR';
            entry.errorMessage = errorMessage;
            this.saveAll(entries);
        }
    }

    /**
     * Get sync statistics for UI display
     */
    static getStats(): { pending: number; synced: number; errors: number; total: number } {
        const entries = this.getAllEntries();
        return {
            pending: entries.filter(e => e.syncStatus === 'PENDING' || e.syncStatus === 'SYNCING').length,
            synced: entries.filter(e => e.syncStatus === 'SYNCED').length,
            errors: entries.filter(e => e.syncStatus === 'ERROR').length,
            total: entries.length
        };
    }

    /**
     * Clear all synced entries (manual cleanup)
     */
    static clearSynced(): void {
        const entries = this.getAllEntries().filter(e => e.syncStatus !== 'SYNCED');
        this.saveAll(entries);
    }
}
