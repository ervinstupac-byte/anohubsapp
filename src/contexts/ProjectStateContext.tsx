import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// Small cloneDeep fallback to avoid an extra runtime dependency.
const cloneDeep = <T,>(v: T): T => {
    try {
        return JSON.parse(JSON.stringify(v));
    } catch (e) {
        return v;
    }
};
import { DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../core/TechnicalSchema';
import { EventJournal } from '../services/EventJournal';
import { useTelemetry } from './TelemetryContext';
import { useAssetContext } from './AssetContext';
import { PhysicsEngine } from '../core/PhysicsEngine';

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
        return cloneDeep(this.state);
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
                        const entryId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
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
            try { window.dispatchEvent(new CustomEvent('reconstruction:start', { detail: { requestedId: id, base: oldest.id } })); } catch (e) { /* ignore */ }

            let reconstructed = cloneDeep(oldest.snapshot);
            let processed = 0;
            let found = false;

            EventJournal.fetchOlderEvents(oldest.ts, (rec) => {
                try {
                    if (found) return; // ignore further streamed events once found
                    processed += 1;
                    try { window.dispatchEvent(new CustomEvent('reconstruction:progress', { detail: { processed } })); } catch (e) { }
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
                        const entryId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                        this.history.unshift({ id: entryId, ts: new Date().toISOString(), snapshot: cloneDeep(this.state) });
                        if (this.history.length > 50) this.history.pop();
                        EventJournal.append('snapback_reconstructed', { requestedId: id, base: oldest.id, entryId });
                        this.notify();
                        try { window.dispatchEvent(new CustomEvent('reconstruction:complete', { detail: { requestedId: id, entryId } })); } catch (e) {}
                        // done — further streamed events will be ignored
                    }
                } catch (e) {
                    // ignore per-record errors
                }
            }).then(({ count }) => {
                if (!found) {
                    try { window.dispatchEvent(new CustomEvent('reconstruction:complete', { detail: { requestedId: id, entryId: null } })); } catch (e) {}
                }
            }).catch((err) => {
                try { window.dispatchEvent(new CustomEvent('reconstruction:error', { detail: { message: String(err?.message || err) } })); } catch (e) {}
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
        const serialized = JSON.stringify(merged);
        if (this.lastSerialized === serialized) return; // no-op if identical
        this.state = merged;
        this.lastSerialized = serialized;
        // add to history ring buffer (store up to 50 recent)
            try {
                const entryId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                this.history.unshift({ id: entryId, ts: new Date().toISOString(), snapshot: cloneDeep(this.state) });
                if (this.history.length > 50) this.history.pop();
                // store full snapshot in the journal to enable reconstruction
                EventJournal.append('state_update', { id: entryId, snapshot: cloneDeep(this.state), summary: { keys: Object.keys(newState) } });
            } catch (e) { /* swallow */ }
        this.notify();
    }

    updateFromTelemetry(telemetry: Record<string, any>, assets: any[]) {
        // Create a working copy
        const s = cloneDeep(this.state);
        // For demo and simplicity, map first asset telemetry into hydraulic/mechanical/physics
        const asset = assets && assets.length > 0 ? assets[0] : null;
        const teleKeys = Object.keys(telemetry || {});
        if (teleKeys.length > 0) {
            const firstKey = teleKeys[0];
            const t = telemetry[firstKey];
            if (t) {
                // Map telemetry fields into the canonical state
                s.hydraulic = { ...(s.hydraulic as any), head: t.reservoirLevel || (s.hydraulic as any).head, flow: t.pumpFlowRate || (s.hydraulic as any).flow, efficiency: (typeof t.efficiency === 'number') ? (t.efficiency / 100) : (s.hydraulic as any).efficiency } as any;
                s.mechanical = { ...(s.mechanical as any), rpm: t.rpm || (s.mechanical as any).rpm, bearingTemp: t.temperature || (s.mechanical as any).bearingTemp } as any;
                // attempt to run physics engine to enrich physics block
                try {
                    const result = PhysicsEngine.recalculatePhysics({ identity: s.identity, hydraulic: s.hydraulic, mechanical: s.mechanical, site: s.site } as any);
                    if (result) {
                        s.physics = { ...(s.physics as any), netHead: result.netHead ?? (s.physics as any).netHead, volumetricLoss: result.volumetricLoss ?? (s.physics as any).volumetricLoss, eccentricity: result.eccentricity ?? (s.physics as any).eccentricity } as any;
                    }
                } catch (e) {
                    // ignore physics failures — keep previous physics values
                }
            }
        }

        // refresh identity from assets
        if (asset) {
            s.identity = { ...(s.identity as any), assetId: asset.id, assetName: asset.name, commissioningYear: asset.commissioningYear || s.identity.commissioningYear } as any;
        }

        const serialized = JSON.stringify(s);
        if (this.lastSerialized !== serialized) {
            this.state = s;
            this.lastSerialized = serialized;
                try {
                    const entryId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                    this.history.unshift({ id: entryId, ts: new Date().toISOString(), snapshot: cloneDeep(this.state) });
                    if (this.history.length > 50) this.history.pop();
                    EventJournal.append('telemetry_update', { id: entryId, source: 'telemetry', snapshot: cloneDeep(this.state) });
                } catch (e) { }
            this.notify();
        }
    }

    subscribe(fn: Subscriber) {
        this.subs.push(fn);
        return () => { this.subs = this.subs.filter(s => s !== fn); };
    }

    private notify() { const snapshot = cloneDeep(this.state); this.subs.forEach(s => { try { s(snapshot); } catch (e) { /* swallow */ } }); }
}

export const ProjectStateManager = new ProjectStateManagerClass();

const ProjectStateContext = createContext<TechnicalProjectState | undefined>(undefined);

export const ProjectStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const telemetryCtx = useTelemetry();
    const assetCtx = useAssetContext();
    const [state, setState] = useState<TechnicalProjectState>(ProjectStateManager.getState());

    // subscribe to manager changes
    useEffect(() => {
        const unsub = ProjectStateManager.subscribe((s) => setState(s));
        return unsub;
    }, []);

    // When telemetry or assets change, update ProjectStateManager
    useEffect(() => {
        try {
            ProjectStateManager.updateFromTelemetry(telemetryCtx.telemetry, assetCtx.assets);
        } catch (e) {
            // ignore
        }
    }, [telemetryCtx.telemetry, assetCtx.assets]);

    return (
        <ProjectStateContext.Provider value={state}>
            {children}
        </ProjectStateContext.Provider>
    );
};

export const useProjectState = () => {
    const ctx = useContext(ProjectStateContext);
    if (!ctx) throw new Error('useProjectState must be used inside ProjectStateProvider');
    return ctx;
};

export default ProjectStateManager;
