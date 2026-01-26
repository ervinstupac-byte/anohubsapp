import { SovereignMemory } from './SovereignMemory';

export type PersistedWisdom = {
  id: string;
  assetId?: string | number;
  timestamp: number;
  telemetryRef?: string; // link or pointer to telemetry snapshot
  report: any;
};

export default class SovereignAuditAdapter {
  private memory: SovereignMemory;

  constructor() {
    this.memory = new SovereignMemory();
  }

  persistWisdom(report: any, assetId?: string | number, telemetryRef?: string) {
    const entry: PersistedWisdom = {
      id: `wisdom_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      assetId,
      timestamp: Date.now(),
      telemetryRef: telemetryRef || undefined,
      report
    };

    // Append to audit log list
    const log = ((this.memory as any).getItem('wisdom_audit_log') as any[]) || [];
    log.push(entry);
    this.memory.saveOverrideRecord({ type: 'WISDOM_PERSIST', timestamp: entry.timestamp, id: entry.id, assetId, telemetryRef });
    // store full log
    (this.memory as any).setItem && (this.memory as any).setItem('wisdom_audit_log', log);
    return entry;
  }

  getAuditLog(): PersistedWisdom[] {
    return ((this.memory as any).getItem('wisdom_audit_log') as PersistedWisdom[]) || [];
  }

  getById(id: string): PersistedWisdom | null {
    const all = this.getAuditLog();
    const found = all.find(a => a.id === id);
    return found || null;
  }

  queryByLegacyTip(term: string, sinceDays: number = 30): PersistedWisdom[] {
    const now = Date.now();
    const cutoff = now - (sinceDays * 24 * 60 * 60 * 1000);
    const all = this.getAuditLog();
    return all.filter(a => a.timestamp >= cutoff && JSON.stringify(a.report).toLowerCase().includes(term.toLowerCase()));
  }
}
