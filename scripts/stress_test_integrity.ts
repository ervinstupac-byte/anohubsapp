import ProjectStateManager from '../src/contexts/ProjectStateContext';
import { EventJournal } from '../src/services/EventJournal';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function run() {
    console.log('Starting stress test: 1000 rapid state changes in ~2s');
    const total = 1000;
    const durationMs = 2000;
    const delay = Math.max(0, Math.floor(durationMs / total));

    for (let i = 1; i <= total; i++) {
        ProjectStateManager.setState({ simulated: { seq: i, ts: Date.now() } } as any);
        // tiny pause to spread over duration
        if (delay > 0) await sleep(delay);
    }

    console.log('All state updates applied. Collecting journal entries...');
    const journal = EventJournal.recent(1200);
    const stateUpdates = journal.filter(e => e.type === 'state_update' || e.type === 'telemetry_update');
    console.log(`Journal recorded ${journal.length} events, of which ${stateUpdates.length} are state/telemetry updates.`);

    // Attempt to find the 500th chronological state update
    const chronological = journal.slice().reverse(); // oldest first
    const targetIdx = 499; // zero-based for 500th
    const target = chronological[targetIdx];
    if (!target) {
        console.log('Target (500th) event not available in in-memory journal (stored recent:', journal.length, '). Cannot snapback to #500.');
    } else {
        console.log('Found 500th event:', target.type, target.id || '(no id)');
        // If payload contains id referencing ProjectStateManager history, try snapback
        const payloadId = (target.payload && (target.payload.id || target.payload.stateId)) || null;
        if (!payloadId) {
            console.log('Event payload does not include a state snapshot id. Attempting to snapback using recorded id field if present.');
        }
        const snapId = payloadId || target.id;
        const snapResult = ProjectStateManager.snapback(snapId as string);
        console.log('Attempted snapback to id', snapId, '->', snapResult ? 'SUCCESS' : 'FAILED');

        if (snapResult) {
            const state = ProjectStateManager.getState();
            const seq = (state as any).simulated?.seq;
            console.log('Post-snapback state simulated.seq =', seq);
            console.log('Integrity check:', seq === 500 ? 'PASS' : `MISMATCH (expected 500, got ${seq})`);
        } else {
            console.log('Snapback failed — ProjectStateManager likely retains only recent snapshots (e.g., last 50).');
        }
    }

    // Quick event drift analysis: do we have monotonic ordering for snapshots in the journal?
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
    console.log('Stress test complete.');
}

if (require.main === module) {
    run().catch(e => { console.error('Stress test failed', e); process.exit(1); });
}

export default run;
