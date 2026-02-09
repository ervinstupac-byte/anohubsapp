import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';

type LedgerEntry = {
  timestamp: number;
  action: 'START' | 'MANUAL_OVERRIDE' | 'ACKNOWLEDGE' | 'CONFIG_CHANGE' | 'SNAPSHOT_SAVE' | 'SNAPSHOT_LOAD';
  componentId: string | null;
  previousValue: number | string | null;
  newValue: number | string | null;
  hash: string;
};

function hashEntry(e: Omit<LedgerEntry, 'hash'>): string {
  const s = `${e.timestamp}|${e.action}|${e.componentId ?? ''}|${e.previousValue ?? ''}|${e.newValue ?? ''}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
    h |= 0;
  }
  return `h${Math.abs(h).toString(16)}`;
}

export const EventLogger = {
  log(action: LedgerEntry['action'], componentId: string | null, previousValue: any, newValue: any) {
    const entryBase = {
      timestamp: Date.now(),
      action,
      componentId,
      previousValue: previousValue ?? null,
      newValue: newValue ?? null
    } as Omit<LedgerEntry, 'hash'>;
    const hash = hashEntry(entryBase);
    const entry: LedgerEntry = { ...entryBase, hash };
    const { recordLedgerEvent } = useTelemetryStore.getState() as any;
    recordLedgerEvent?.(entry);
    return entry;
  }
};
