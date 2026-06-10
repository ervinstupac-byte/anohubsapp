import SovereignAuditAdapter from './SovereignAuditAdapter';

export default class SovereignOperationalLog {
  private adapter: SovereignAuditAdapter;

  constructor() {
    this.adapter = new SovereignAuditAdapter();
  }

  // Aggregate persisted wisdom into a Shift Handover Summary
  generateShiftHandoverSummary(shiftStartTs: number, shiftEndTs: number) {
    const entries = this.adapter.getAuditLog().filter(e => e.timestamp >= shiftStartTs && e.timestamp <= shiftEndTs);
    const summary = {
      generatedAt: Date.now(),
      shiftStartTs,
      shiftEndTs,
      totalEntries: entries.length,
      criticals: entries.filter(e => JSON.stringify(e.report).toLowerCase().includes('critical')).length,
      highlights: entries.slice(-10).map(e => ({ id: e.id, ts: e.timestamp, title: e.report.executiveSummary || (e.report.entries && e.report.entries[0] && e.report.entries[0].title) }))
    };
    return { summary, entries };
  }

  // Searchability helper
  searchLegacyTips(term: string, days: number = 30) {
    return this.adapter.queryByLegacyTip(term, days).map(e => ({ id: e.id, ts: e.timestamp, snippet: (e.report && e.report.entries && e.report.entries[0]) ? e.report.entries[0].legacyTip : '' }));
  }
}
