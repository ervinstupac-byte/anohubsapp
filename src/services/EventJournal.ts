import { supabase } from './supabaseClient';

type EventRecord = {
    id: string;
    type: string;
    payload: any;
    ts: string;
};

const MAX_IN_MEMORY = 5000; // keep a larger in-memory window for reconstruction

class EventJournalService {
    private store: EventRecord[] = [];
    private worker: Worker | null = null;

    constructor() {
        // try to create a journal worker in browser environments
        try {
            if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
                // @ts-ignore
                this.worker = new Worker(new URL('../workers/journal.worker.ts', import.meta.url), { type: 'module' });
            }
        } catch (e) {
            this.worker = null;
        }

        // NC-87.1: Legal Sovereignty Debug Hook
        if (typeof window !== 'undefined') {
            (window as any).__MONOLIT_DEBUG__ = {
                ...(window as any).__MONOLIT_DEBUG__,
                exportLedgerSnapshot: () => this.exportSnapshot()
            };
        }
    }

    private exportSnapshot() {
        const data = JSON.stringify(this.store, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MONOLIT_LEDGER_AUDIT_${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ [EventJournal] Ledger snapshot exported for forensic audit.');
    }

    append(eventType: string, payload: any) {
        const rec: EventRecord = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: eventType, payload, ts: new Date().toISOString() };
        this.store.unshift(rec);
        if (this.store.length > MAX_IN_MEMORY) this.store.pop();

        // If a worker is available, post to it for non-blocking batched persistence.
        try {
            if (this.worker) {
                try { this.worker.postMessage({ action: 'append', record: rec }); } catch (e) { /* swallow */ }
            } else {
                // fallback: best-effort direct persist
                (async () => {
                    try {
                        await supabase.from('event_journal').insert([{ id: rec.id, kind: rec.type, payload: JSON.stringify(rec.payload || {}), created_at: rec.ts }]);
                    } catch (e) { /* ignore persistence errors */ }
                })();
            }
        } catch (e) { /* swallow */ }

        return rec;
    }

    recent(n = 50) {
        return this.store.slice(0, n);
    }

    // Request the worker to stream older events starting at a timestamp (ISO string).
    // onRecord will be invoked for each streamed record. Resolves when stream completes or errors.
    fetchOlderEvents(fromTs: string, onRecord: (r: EventRecord) => void, batchSize = 200): Promise<{ count: number }> {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                // fallback: query supabase directly (use static import to keep chunking consistent)
                (async () => {
                    try {
                        const { data } = await supabase.from('event_journal').select('id, kind, payload, created_at').gte('created_at', fromTs).order('created_at', { ascending: true });
                        const rows = (data as any[]) || [];
                        for (const r of rows) {
                            let payload = r.payload;
                            try { payload = typeof payload === 'string' ? JSON.parse(payload) : payload; } catch (e) { }
                            onRecord({ id: r.id, type: r.kind, payload, ts: r.created_at });
                        }
                        resolve({ count: rows.length });
                    } catch (e) { reject(e); }
                })();
                return;
            }

            const handler = (ev: MessageEvent) => {
                const m = ev.data as any;
                if (!m || !m.action) return;
                if (m.action === 'streamEvent') {
                    try { onRecord(m.record); } catch (e) { /* swallow */ }
                } else if (m.action === 'streamComplete') {
                    this.worker?.removeEventListener('message', handler as any);
                    resolve({ count: m.count || 0 });
                } else if (m.action === 'streamError') {
                    this.worker?.removeEventListener('message', handler as any);
                    reject(new Error(m.message || 'streamError'));
                }
            };

            this.worker.addEventListener('message', handler as any);
            try {
                this.worker.postMessage({ action: 'fetchOlderEvents', fromTs, batchSize });
            } catch (e) {
                this.worker.removeEventListener('message', handler as any);
                reject(e);
            }
        });
    }
}

export const EventJournal = new EventJournalService();

export default EventJournal;
