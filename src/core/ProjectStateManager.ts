import { DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from './TechnicalSchema';
import { EventJournal } from '../services/EventJournal';
import { PhysicsEngine } from './PhysicsEngine';
import { dispatch } from '../lib/events';

// NC-20301: Shallow copy replaces JSON.parse(JSON.stringify()) CPU killer
const shallowCopy = <T,>(v: T): T => {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return [...v] as unknown as T;
    return { ...v } as T;
};
// Keep cloneDeep only for the rare snapback path where we truly need isolation
const cloneDeep = <T,>(v: T): T => {
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; }
};

type Subscriber = (state: TechnicalProjectState) => void;

class ProjectStateManagerClass {
    private state: TechnicalProjectState;
    private subs: Subscriber[] = [];
    private lastSerialized: string | null = null;
    private history: { id: string; ts: string; snapshot: TechnicalProjectState }[] = [];

    constructor() {
        this.state = cloneDeep(DEFAULT_TECHNICAL_STATE);
    }

    getState() {
        return shallowCopy(this.state);
    }

    // expose last N snapshots
    getHistory(n = 50) {
        return this.history.slice(0, n).map(h => ({ id: h.id, ts: h.ts }));
    }

    // revert to a prior snapshot by id
    snapback(id: string) {
        const found = this.history.find(h => h.id === id);
        if (found) {
            this.state = cloneDeep(found.snapshot);
            this.lastSerialized = JSON.stringify(this.state);
            EventJournal.append('snapback', { id });
            this.notify();
            return true;
        }

        // If requested snapshot is older than our in-memory history, attempt reconstructed replay
        try {
            const oldest = this.history.length > 0 ? this.history[this.history.length - 1] : null;
            if (!oldest) return false;

            // Start from oldest available snapshot
            let reconstructed = cloneDeep(oldest.snapshot);

            // Pull recent events from the journal (chronological order)
            const events = EventJournal.recent(5000).slice().reverse();
            // Filter events that occurred after oldest.ts
            const replay = events.filter(e => new Date(e.ts) > new Date(oldest.ts));

            for (const ev of replay) {
                try {
                    const p = ev.payload as any;
                    if (p && p.snapshot) {
                        reconstructed = cloneDeep(p.snapshot);
                    } else if (p && p.stateDelta) {
                        // apply a shallow merge delta
                        reconstructed = { ...(reconstructed as any), ...(p.stateDelta as any) } as TechnicalProjectState;
                    }
                    // If this event matches the requested id, finalize
                    if (ev.id === id || (p && (p.id === id || p.stateId === id))) {
                        this.state = reconstructed;
                        this.lastSerialized = JSON.stringify(this.state);
                        // record reconstructed snapback
                        const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                        this.history.unshift({ id: entryId, ts: new Date().toISOString(), snapshot: cloneDeep(this.state) });
                        if (this.history.length > 50) this.history.pop();
                        EventJournal.append('snapback_reconstructed', { requestedId: id, base: oldest.id, entryId });
                        this.notify();
                        return true;
                    }
                } catch (e) { /* swallow per-event errors */ }
            }
        } catch (e) {
            // fallthrough
        }

        // As a last resort, request the worker to stream older events from persistent storage and perform reconstruction while streaming.
        try {
            const oldest = this.history.length > 0 ? this.history[this.history.length - 1] : null;
            if (!oldest) return false;

            // notify UI that reconstruction is starting
            try { dispatch.reconstructionStart({ requestedId: id, base: oldest.id }); } catch (e) { /* ignore */ }

            let reconstructed = cloneDeep(oldest.snapshot);
            let processed = 0;
            let found = false;

            EventJournal.fetchOlderEvents(oldest.ts, (rec) => {
                try {
                    if (found) return; // ignore further streamed events once found
                    processed += 1;
                    try { dispatch.reconstructionProgress({ processed }); } catch (e) { }
                    const p = rec.payload as any;
                    if (p && p.snapshot) {
                        reconstructed = cloneDeep(p.snapshot);
                    } else if (p && p.stateDelta) {
                        reconstructed = { ...(reconstructed as any), ...(p.stateDelta as any) } as TechnicalProjectState;
                    }

                    // check if this streamed event matches the requested id
                    if (rec.id === id || (p && (p.id === id || p.stateId === id))) {
                        // finalize
                        found = true;
                        this.state = reconstructed;
                        this.lastSerialized = JSON.stringify(this.state);
                        const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                        this.history.unshift({ id: entryId, ts: new Date().toISOString(), snapshot: cloneDeep(this.state) });
                        if (this.history.length > 50) this.history.pop();
                        EventJournal.append('snapback_reconstructed', { requestedId: id, base: oldest.id, entryId });
                        this.notify();
                        try { dispatch.reconstructionComplete({ requestedId: id, entryId }); } catch (e) { }
                        // done — further streamed events will be ignored
                    }
                } catch (e) {
                    // ignore per-record errors
                }
            }).then(({ count }) => {
                if (!found) {
                    try { dispatch.reconstructionComplete({ requestedId: id, entryId: null }); } catch (e) { }
                }
            }).catch((err) => {
                try { dispatch.reconstructionError({ message: String(err?.message || err) }); } catch (e) { }
            });

            // return false now — reconstruction will finish asynchronously and update state when ready
            return false;
        } catch (e: any) {
            if (e && e.__reconstructed) {
                // reconstructed and short-circuited
                return true;
            }
            // otherwise, fall through and return false
        }

        return false;
    }

    setState(newState: Partial<TechnicalProjectState> | TechnicalProjectState) {
        // shallow merge top-level keys, preserve object identity where possible
        const merged = { ...(this.state as any), ...(newState as any) } as TechnicalProjectState;
        // NC-20301: Fast identity check via reference, skip expensive JSON.stringify
        if (merged === this.state) return;
        this.state = merged;
        // NC-20301: Ring buffer limited to 5 shallow copies (was 50 deep clones)
        try {
            const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            this.history.unshift({ id: entryId, ts: new Date().toISOString(), snapshot: shallowCopy(this.state) });
            if (this.history.length > 5) this.history.pop();
            EventJournal.append('state_update', { id: entryId, summary: { keys: Object.keys(newState) } });
        } catch (e) { /* swallow */ }
        this.notify();
    }

    updateFromTelemetry(telemetry: Record<string, any>, assets: any[]) {
        // NC-20301: Shallow working copy instead of JSON.parse(JSON.stringify())
        const s = { ...this.state } as any;
        const asset = assets && assets.length > 0 ? assets[0] : null;
        const teleKeys = Object.keys(telemetry || {});
        if (teleKeys.length > 0) {
            const firstKey = teleKeys[0];
            const t = telemetry[firstKey];
            if (t) {
                s.hydraulic = { ...(s.hydraulic as any), head: t.reservoirLevel || (s.hydraulic as any).head, flow: t.pumpFlowRate || (s.hydraulic as any).flow, efficiency: (typeof t.efficiency === 'number') ? (t.efficiency / 100) : (s.hydraulic as any).efficiency } as any;
                s.mechanical = { ...(s.mechanical as any), rpm: t.rpm || (s.mechanical as any).rpm, bearingTemp: t.temperature || (s.mechanical as any).bearingTemp } as any;
                try {
                    const result = PhysicsEngine.recalculatePhysics({ identity: s.identity, hydraulic: s.hydraulic, mechanical: s.mechanical, site: s.site } as any);
                    if (result) {
                        s.physics = { ...(s.physics as any), netHead: result.netHead ?? (s.physics as any).netHead, volumetricLoss: result.volumetricLoss ?? (s.physics as any).volumetricLoss, eccentricity: result.eccentricity ?? (s.physics as any).eccentricity } as any;
                    }
                } catch (e) { /* ignore physics failures */ }
            }
        }

        if (asset) {
            s.identity = { ...(s.identity as any), assetId: asset.id, assetName: asset.name, commissioningYear: asset.commissioningYear || s.identity.commissioningYear } as any;
        }

        // NC-20301: Skip expensive JSON.stringify comparison — use shallow reference check
        this.state = s as TechnicalProjectState;
        try {
            const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            this.history.unshift({ id: entryId, ts: new Date().toISOString(), snapshot: shallowCopy(this.state) });
            if (this.history.length > 5) this.history.pop();
        } catch (e) { }
        this.notify();
    }

    subscribe(fn: Subscriber) {
        this.subs.push(fn);
        return () => { this.subs = this.subs.filter(s => s !== fn); };
    }

    // NC-20301: Shallow copy per notify instead of deep clone
    private notify() { const snapshot = shallowCopy(this.state); this.subs.forEach(s => { try { s(snapshot); } catch (e) { /* swallow */ } }); }
}

export const ProjectStateManager = new ProjectStateManagerClass();
export default ProjectStateManager;
