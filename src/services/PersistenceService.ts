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
  id?: number; // Auto-increment PK
  timestamp: number; // epoch ms
  dataBlob: Record<string, unknown>; // Full TelemetryData object
}

export interface AlarmRecord {
  id?: number;
  code: string; // Alarm ID
  severity: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface UserSetting {
  key: string; // PK
  value: unknown;
}

export interface GlobalContext {
  mode: string;
  health_score: number;
  tier: string;
}

export interface AuditLogRecord {
  id?: number;
  timestamp: number;
  event_type: string;
  reason: string;
  metric_value?: string | number;
  metric_unit?: string;
  active_protection?: string;
  details?: string | Record<string, unknown>;
  global_context?: GlobalContext | null;
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
      userSettings: 'key',
    });

    // Version 2 (NC-25100: Cloud Amputation)
    // Adding auditLogs for offline compliance
    this.version(2).stores({
      telemetrySnapshots: '++id, timestamp',
      activeAlarms: '++id, code, severity, timestamp, acknowledged',
      userSettings: 'key',
      auditLogs: '++id, timestamp, event_type',
    });
  }
}

export const db = new AnohubsIndustrialDB();

// ─── TELEMETRY PERSISTENCE ───────────────────────────────────────

const RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function saveTelemetryBatch(data: Record<string, unknown>): Promise<void> {
  try {
    const now = Date.now();

    // Sanitize data for IndexedDB (remove functions, convert Decimal and other non-cloneable types)
    const sanitize = (input: unknown): unknown => {
      if (input === null || input === undefined) return input;
      const t = typeof input;
      if (t === 'number' || t === 'string' || t === 'boolean') return input;
      if (input instanceof Date) return input.toISOString();
      if (Array.isArray(input)) return input.map(sanitize);
      if (t === 'object') {
        // Detect Decimal.js instances by constructor name to avoid importing Decimal here
        const maybeObj = input as Record<string, unknown>;
        const ctorName =
          maybeObj && (maybeObj as any).constructor && (maybeObj as any).constructor.name;
        if (ctorName && /decimal/i.test(String(ctorName))) {
          try {
            return String(maybeObj);
          } catch {
            return String(maybeObj);
          }
        }

        const out: Record<string, unknown> = {};
        for (const k of Object.keys(maybeObj)) {
          try {
            const v = maybeObj[k];
            // Skip functions
            if (typeof v === 'function') continue;
            out[k] = sanitize(v);
          } catch (e) {
            out[k] = String(maybeObj[k]);
          }
        }
        return out;
      }
      // Fallback to string
      try {
        return String(input);
      } catch {
        return null;
      }
    };

    const cleaned = sanitize(data);

    await db.telemetrySnapshots.add({
      timestamp: now,
      dataBlob: cleaned as Record<string, unknown>,
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
    return await db.telemetrySnapshots.orderBy('timestamp').reverse().limit(limit).toArray();
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
      acknowledged: alarm.acknowledged,
    });
  } catch (e) {
    console.warn('[PersistenceService] alarm save failed:', e);
  }
}

export async function resolveAlarm(code: string): Promise<void> {
  try {
    await db.activeAlarms.where('code').equals(code).modify({ acknowledged: true });
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

export async function saveSetting(key: string, value: unknown): Promise<void> {
  try {
    await db.userSettings.put({ key, value });
  } catch (e) {
    console.warn('[Persistence] setting save failed:', e);
  }
}

export async function loadSetting(key: string): Promise<unknown> {
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
  details?: string | Record<string, unknown> | null;
  global_context?: GlobalContext | null;
}): Promise<void> {
  try {
    // Capture global context if available (NC-25100 Enhancement)
    let globalContext = entry.global_context;
    if (!globalContext) {
      try {
        // @ts-ignore - Dynamic import to avoid circular dependency
        const { useTelemetryStore } = await import('../features/telemetry/store/useTelemetryStore');
        const state = useTelemetryStore.getState();
        if (state && state.executiveResult) {
          globalContext = {
            mode: state.executiveResult.financials?.mode || 'UNKNOWN',
            health_score: state.executiveResult.masterHealthScore || 0,
            tier: state.executiveResult.permissionTier || 'READ_ONLY',
          };
        }
      } catch (e) {
        // Store might not be initialized or accessible in this context
      }
    }

    const record: AuditLogRecord = {
      timestamp: Date.now(),
      event_type: entry.event_type,
      reason: entry.reason,
      metric_value: entry.metric_value,
      metric_unit: entry.metric_unit,
      active_protection: entry.active_protection,
      details:
        entry.details === null
          ? undefined
          : (entry.details as string | Record<string, unknown> | undefined),
      global_context: (globalContext as GlobalContext) || null,
    };

    await db.auditLogs.add(record);

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('SOVEREIGN_AUDIT_LOG', { detail: record }));
  } catch (e) {
    console.warn('[Persistence] Log save failed:', e);
  }
}

export async function getAuditLogs(limit: number = 100): Promise<AuditLogRecord[]> {
  try {
    return await db.auditLogs.orderBy('timestamp').reverse().limit(limit).toArray();
  } catch (e) {
    console.warn('[Persistence] Log fetch failed:', e);
    return [];
  }
}

export default db;
