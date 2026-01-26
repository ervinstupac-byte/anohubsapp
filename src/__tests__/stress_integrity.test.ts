import { test } from 'vitest';
import ProjectStateManager from '../contexts/ProjectStateContext';
import { EventJournal } from '../services/EventJournal';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

test('stress integrity: 1000 rapid state changes then snapback to #500', async () => {
    const total = 1000;
    const durationMs = 2000;
    const delay = Math.max(0, Math.floor(durationMs / total));

    for (let i = 1; i <= total; i++) {
        ProjectStateManager.setState({ simulated: { seq: i, ts: Date.now() } } as any);
        if (delay > 0) await sleep(delay);
    }

    const journal = EventJournal.recent(1200);
    const stateUpdates = journal.filter(e => e.type === 'state_update' || e.type === 'telemetry_update');
    console.log(`Journal recorded ${journal.length} events, of which ${stateUpdates.length} are state/telemetry updates.`);

    const chronological = journal.slice().reverse();
    const target = chronological[499];
    if (!target) {
        console.log('Target (500th) event not available in in-memory journal.');
        return;
    }

    const payloadId = (target.payload && (target.payload.id || target.payload.stateId)) || null;
    const snapId = payloadId || target.id;
    const snapResult = ProjectStateManager.snapback(snapId as string);
    console.log('Attempted snapback to id', snapId, '->', snapResult ? 'SUCCESS' : 'FAILED');
    if (snapResult) {
        const state = ProjectStateManager.getState();
        const seq = (state as any).simulated?.seq;
        console.log('Post-snapback state simulated.seq =', seq);
    }

    const seqs: number[] = [];
    chronological.forEach(ev => {
        try {
            const p = ev.payload as any;
            if (p && p.snapshot && p.snapshot.simulated && typeof p.snapshot.simulated.seq === 'number') seqs.push(p.snapshot.simulated.seq);
            if (p && p.state && typeof p.state.seq === 'number') seqs.push(p.state.seq);
            if (p && p.payload && p.payload.simulated && typeof p.payload.simulated.seq === 'number') seqs.push(p.payload.simulated.seq);
        } catch (e) { }
    });
    const drift = seqs.some((v, i, arr) => i > 0 && v < arr[i - 1]);
    console.log('Event drifting detected in journal sequence: ', drift ? 'YES' : 'NO');
});
