import { supabase } from '../services/supabaseClient';

type WorkerMessage = { action: 'append'; record: any } | { action: 'flush' } | { action: 'fetchOlderEvents'; fromTs: string; targetId?: string; batchSize?: number };

const buffer: any[] = [];
let flushing = false;

const FLUSH_INTERVAL = 10000; // ms (10s batch)
const BATCH_SIZE = 50;

async function flushBuffer() {
    if (buffer.length === 0 || flushing) return;
    flushing = true;

    // Split batches by destination
    const batch = buffer.splice(0, BATCH_SIZE);
    const telemetryEvents = batch.filter(r => r.type === 'TELEMETRY_INGEST');
    const journalEvents = batch.filter(r => r.type !== 'TELEMETRY_INGEST');

    try {
        // 1. Flush Standard Journal Events
        if (journalEvents.length > 0) {
            await supabase.from('event_journal').insert(
                journalEvents.map(r => ({
                    id: r.id,
                    kind: r.type,
                    payload: JSON.stringify(r.payload || {}),
                    created_at: r.ts
                })),
                // @ts-ignore
                { count: 'none' }
            );
        }

        // 2. Flush Telemetry Samples (Unroll dense objects into narrow rows)
        if (telemetryEvents.length > 0) {
            const telemetryRows: any[] = [];

            telemetryEvents.forEach(evt => {
                const data = evt.payload?.data || {};
                let assetId = evt.payload?.assetId;

                // Ensure assetId is a BigInt-safe string or BigInt object
                try {
                    // Normalize to BigInt then back to string to ensure validity and standard format
                    if (assetId !== undefined && assetId !== null) {
                        const bi = BigInt(assetId);
                        // For JSON transport (since JSON doesn't support BigInt), store as string
                        // But for comparisons we have 'bi'
                        assetId = bi.toString();
                    }
                } catch (e) {
                    // Invalid ID format
                    return;
                }

                if (!assetId) {
                    // Skip if valid ID cannot be resolved
                    return;
                }

                const timestamp = evt.ts || new Date().toISOString();

                // Exclude metadata keys
                const IGNORED = ['assetId', 'timestamp', 'status', 'incidentDetails'];

                Object.keys(data).forEach(key => {
                    if (IGNORED.includes(key)) return;

                    const val = data[key];
                    if (typeof val === 'number') {
                        telemetryRows.push({
                            asset_id: assetId,
                            metric_name: key,
                            numeric_value: val,
                            source: 'TELEMETRY_INGEST',
                            captured_at: timestamp
                        });
                    }
                });
            });

            if (telemetryRows.length > 0) {
                // Batch insert into telemetry_samples (Supabase handles large batches well via REST, but chunking is safer if > 1000)
                // We'll trust BATCH_SIZE=50 events * ~20 metrics = 1000 rows is fine.
                // @ts-ignore
                await supabase.from('telemetry_samples').insert(telemetryRows, { count: 'none' });
            }
        }
    } catch (e) {
        // on failure, requeue items at front (simplified: just standard events/telemetry combined back)
        buffer.unshift(...batch);
        console.error('Journal flush failed:', e);
    } finally {
        flushing = false;
    }
}

setInterval(() => {
    flushBuffer().catch(() => { /* swallow */ });
}, FLUSH_INTERVAL);

self.addEventListener('message', (ev: MessageEvent<WorkerMessage>) => {
    const msg = ev.data;
    if (!msg) return;
    if (msg.action === 'append') {
        buffer.push(msg.record);
        if (buffer.length >= BATCH_SIZE) {
            flushBuffer().catch(() => { /* swallow */ });
        }
    } else if (msg.action === 'flush') {
        flushBuffer().catch(() => { /* swallow */ });
    } else if (msg.action === 'fetchOlderEvents') {
        // stream events from Supabase starting at fromTs (inclusive)
        const fromTs = msg.fromTs;
        const batch = msg.batchSize || 200;
        (async () => {
            try {
                let offset = 0;
                let done = false;
                while (!done) {
                    const q = await supabase
                        .from('event_journal')
                        .select('id, kind, payload, created_at')
                        .gte('created_at', fromTs)
                        .order('created_at', { ascending: true })
                        .range(offset, offset + batch - 1);

                    const rows = q.data || [];
                    if (!rows || !rows.length) {
                        // no more rows
                        done = true;
                        break;
                    }

                    // stream rows back to main thread one-by-one to keep memory low
                    for (const r of rows) {
                        try {
                            // attempt to parse payload JSON
                            let payload = r.payload;
                            try { payload = typeof payload === 'string' ? JSON.parse(payload) : payload; } catch (e) { /* leave as-is */ }
                            (self as any).postMessage({ action: 'streamEvent', record: { id: r.id, type: r.kind, payload, ts: r.created_at } });
                        } catch (e) { /* swallow per-row errors */ }
                    }

                    offset += rows.length;

                    // if fewer than batch rows returned, we've reached the end
                    if (rows.length < batch) {
                        done = true;
                        break;
                    }
                }

                (self as any).postMessage({ action: 'streamComplete', count: offset });
            } catch (err) {
                (self as any).postMessage({ action: 'streamError', message: String((err as any)?.message || err) });
            }
        })();
    }
});
