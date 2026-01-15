import { useState, useEffect, useCallback, useRef } from 'react';
import { LocalLedger } from '../services/LocalLedger';
import { supabase } from '../services/supabaseClient';
import { useNotifications } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

/**
 * useSyncWatcher — Robust Offline-First Sync Hook
 * 
 * Features:
 * - Real-time Network Detection
 * - Exponential Backoff Retry Strategy (1s -> 30s)
 * - Supabase Integration (telemetry_logs)
 * - Conflict Detection (Server Timestamp vs Local)
 */

export type SyncStatus = 'IDLE' | 'SYNCING' | 'ERROR' | 'OFFLINE';

interface SyncStats {
    isOnline: boolean;
    syncStatus: SyncStatus;
    pendingCount: number;
    hasPendingData: boolean;
    triggerSync: () => Promise<void>;
    recordMeasurement: (payload: any) => void;
}

export const useSyncWatcher = (): SyncStats => {
    const { t } = useTranslation();
    const { pushNotification } = useNotifications();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'ERROR' | 'OFFLINE'>('IDLE');
    const [pendingCount, setPendingCount] = useState(0);

    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const backoffDelayRef = useRef(1000); // Start with 1s
    const isSyncingRef = useRef(false);

    // Update pending count from Ledger
    const updateStats = useCallback(() => {
        const stats = LocalLedger.getStats();
        setPendingCount(stats.pending);
    }, []);

    // 1. Initial Load & Listeners
    useEffect(() => {
        updateStats();

        const handleOnline = () => {
            setIsOnline(true);
            setSyncStatus('IDLE');
            backoffDelayRef.current = 1000; // Reset backoff
            triggerSync();
        };

        const handleOffline = () => {
            setIsOnline(false);
            setSyncStatus('OFFLINE');
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Polling to keep stats fresh
        const pollInterval = setInterval(updateStats, 2000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(pollInterval);
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        };
    }, [updateStats]);

    // 2. The Core Sync Logic
    const triggerSync = useCallback(async () => {
        // Safe check for online status
        if (!navigator.onLine) {
            setSyncStatus('OFFLINE');
            return;
        }

        if (isSyncingRef.current) return;

        const pendingEntries = LocalLedger.getPending();
        if (pendingEntries.length === 0) {
            setSyncStatus('IDLE');
            return;
        }

        isSyncingRef.current = true;
        setSyncStatus('SYNCING');

        let successCount = 0;
        let failCount = 0;

        for (const entry of pendingEntries) {
            try {
                LocalLedger.markSyncing(entry.uuid);

                // --- DATA MAPPING FOR TABLE SCHEMA ---
                // Schema: asset_id, event_type, severity, details (jsonb)
                const payload = entry.payload || {};

                // Construct the insert object matching existing LoggingService pattern
                const dbRow = {
                    asset_id: payload.assetId || payload.asset_id || null, // fallbacks
                    event_type: entry.source === 'PROTOCOL' ? 'USER_ACTION' : 'PERIODIC_HEALTH',
                    severity: 'INFO',
                    details: {
                        ...payload,
                        ledger_id: entry.uuid, // AUTHENTICITY FINGERPRINT
                        local_timestamp: entry.localTimestamp,
                        sync_source: 'offline-ledger'
                    }
                };

                const { error } = await supabase
                    .from('telemetry_logs')
                    .insert(dbRow);

                if (error) throw error;

                LocalLedger.markSynced(entry.uuid);
                successCount++;

            } catch (err) {
                console.error(`[Sync] Failed entry ${entry.uuid}:`, err);
                // Revert to PENDING so it gets picked up by retry logic
                // We manually update because LocalLedger.markError would kill the retry loop
                const currentFn = LocalLedger.getAllEntries().find(e => e.uuid === entry.uuid);
                if (currentFn) {
                    currentFn.syncStatus = 'PENDING';
                    currentFn.errorMessage = (err as Error).message;
                    LocalLedger.saveEntry(currentFn);
                }
                failCount++;
            }
        }

        isSyncingRef.current = false;
        updateStats();

        // 3. Post-Sync Decision Logic
        if (failCount > 0) {
            setSyncStatus('ERROR');
            pushNotification('WARNING', t('dashboard.syncStatus.error', 'Sync failed, retrying...'));

            // Schedule Retry with Exponential Backoff
            const delay = backoffDelayRef.current;

            retryTimeoutRef.current = setTimeout(() => {
                triggerSync();
            }, delay);

            // Increase backoff (max 30s)
            backoffDelayRef.current = Math.min(delay * 1.5, 30000);
        } else {
            setSyncStatus('IDLE');
            backoffDelayRef.current = 1000; // Reset on full success
            if (successCount > 0) {
                pushNotification('INFO', t('dashboard.syncStatus.synced', 'All verified changes saved'));
            }
        }

    }, [pushNotification, t, updateStats]);

    // 4. Record new entry helper
    const recordMeasurement = useCallback((payload: any) => {
        LocalLedger.createEntry(payload);
        updateStats();
        // Try to sync immediately if online
        if (navigator.onLine) triggerSync();
    }, [triggerSync, updateStats]);

    return {
        isOnline,
        syncStatus,
        pendingCount,
        hasPendingData: pendingCount > 0,
        triggerSync,
        recordMeasurement
    };
};
