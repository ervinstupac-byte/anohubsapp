/**
 * PersistenceService.ts
 * NC-24000: IndexedDB persistence via Dexie.js
 * NC-25100: Cloud Amputation (Audit Logging)
 * 
 * Provides local "Offline-First" storage for:
 *  - Telemetry snapshots (last 24h)
 *  - Active alarms
 *  - User settings (theme, density)
 *  - Sovereign Audit Logs (Offline)
 */
import Dexie, { type Table } from 'dexie';

// ─── SCHEMA TYPES ────────────────────────────────────────────────

export interface TelemetrySnapshot {
    id?: number;            // Auto-increment PK
    timestamp: number;      // epoch ms
    dataBlob: Record<string, unknown>; // Full TelemetryData object
}

export interface AlarmRecord {
    id?: number;
    code: string;           // Alarm ID
    severity: string;
    message: string;
    timestamp: number;
    acknowledged: boolean;
}

export interface UserSetting {
    key: string;            // PK
    value: any;
}

export interface AuditLogRecord {
    id?: number;
    timestamp: number;
    event_type: string;
    reason: string;
    metric_value?: string | number;
    metric_unit?: string;
    active_protection?: string;
    details?: any;
}

// ─── DATABASE ────────────────────────────────────────────────────

class AnohubsIndustrialDB extends Dexie {
    telemetrySnapshots!: Table<TelemetrySnapshot, number>;
    activeAlarms!: Table<AlarmRecord, number>;
    userSettings!: Table<UserSetting, string>;
    auditLogs!: Table<AuditLogRecord, number>;

    constructor() {
        super('AnohubsIndustrialDB');

        // Version 1 (NC-24000)
        this.version(1).stores({
            telemetrySnapshots: '++id, timestamp',
            activeAlarms: '++id, code, severity, timestamp, acknowledged',
            userSettings: 'key'
        });

        // Version 2 (NC-25100: Cloud Amputation)
        // Adding auditLogs for offline compliance
        this.version(2).stores({
            telemetrySnapshots: '++id, timestamp',
            activeAlarms: '++id, code, severity, timestamp, acknowledged',
            userSettings: 'key',
            auditLogs: '++id, timestamp, event_type'
        });
    }
}

export const db = new AnohubsIndustrialDB();

// ─── TELEMETRY PERSISTENCE ───────────────────────────────────────

const RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function saveTelemetryBatch(
    data: Record<string, unknown>
): Promise<void> {
    try {
        const now = Date.now();
        await db.telemetrySnapshots.add({
            timestamp: now,
            dataBlob: data
        });

        // Auto-purge older than 24h
        db.telemetrySnapshots
            .where('timestamp')
            .below(now - RETENTION_MS)
            .delete()
            .catch(e => console.warn('[Persistence] Purge failed', e));

    } catch (e) {
        console.warn('[PersistenceService] telemetry save failed:', e);
    }
}

export async function getRecentHistory(limit: number = 50): Promise<TelemetrySnapshot[]> {
    try {
        return await db.telemetrySnapshots
            .orderBy('timestamp')
            .reverse()
            .limit(limit)
            .toArray();
    } catch (e) {
        return [];
    }
}

export async function loadLatestTelemetry(): Promise<Record<string, unknown> | null> {
    try {
        const latest = await db.telemetrySnapshots.orderBy('timestamp').last();
        return latest ? latest.dataBlob : null;
    } catch (e) {
        return null;
    }
}

// ─── ALARM PERSISTENCE ───────────────────────────────────────────

export async function persistAlarm(alarm: {
    id: string; // code
    severity: string;
    message: string;
    timestamp: number;
    acknowledged: boolean;
}): Promise<void> {
    try {
        await db.activeAlarms.add({
            code: alarm.id,
            severity: alarm.severity,
            message: alarm.message,
            timestamp: alarm.timestamp || Date.now(),
            acknowledged: alarm.acknowledged
        });
    } catch (e) {
        console.warn('[PersistenceService] alarm save failed:', e);
    }
}

export async function resolveAlarm(code: string): Promise<void> {
    try {
        await db.activeAlarms
            .where('code')
            .equals(code)
            .modify({ acknowledged: true });
    } catch (e) {
        console.warn('[PersistenceService] alarm resolve failed:', e);
    }
}

export async function loadAlarms(): Promise<AlarmRecord[]> {
    try {
        return await db.activeAlarms.toArray();
    } catch (e) {
        return [];
    }
}

// ─── USER SETTINGS ───────────────────────────────────────────────

export async function saveSetting(key: string, value: any): Promise<void> {
    try {
        await db.userSettings.put({ key, value });
    } catch (e) {
        console.warn('[Persistence] setting save failed:', e);
    }
}

export async function loadSetting(key: string): Promise<any> {
    try {
        const row = await db.userSettings.get(key);
        return row?.value ?? null;
    } catch (e) {
        return null;
    }
}

// ─── SOVEREIGN AUDIT LOGS (NC-25100) ─────────────────────────────

export async function saveLog(entry: {
    event_type: string;
    reason: string;
    metric_value?: string | number;
    metric_unit?: string;
    active_protection?: string;
    details?: any;
}): Promise<void> {
    try {
        await db.auditLogs.add({
            timestamp: Date.now(),
            ...entry
        });
    } catch (e) {
        console.warn('[Persistence] Log save failed:', e);
    }
}

export default db;
