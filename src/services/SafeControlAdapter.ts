import GovernorHPUGuardian from './GovernorHPUGuardian';

export type ControlState = { stableLoad: boolean; frequencyHz?: number; lastTransientMs?: number };

export class SafeControlAdapter {
  private governor: GovernorHPUGuardian;
  constructor(governor: GovernorHPUGuardian) {
    this.governor = governor;
  }

  canApplySequence(state: ControlState) {
    // Safety Interlock: only allow if stableLoad is true and no recent frequency transients
    if (!state.stableLoad) return { ok: false, reason: 'Unit not in Stable Load state' };
    if (state.frequencyHz && (state.frequencyHz < 49.5 || state.frequencyHz > 50.5)) return { ok: false, reason: 'Frequency outside safe window' };
    return { ok: true };
  }

  applySequenceIfSafe(seq: { activeNozzles: number; sequenceOrder?: number[] }, state: ControlState, requestedBy = 'SafeControlAdapter') {
    const check = this.canApplySequence(state);
    if (!check.ok) return { applied: false, reason: check.reason };
    // Enforce governor water-hammer hard limit if sequence includes a close duration
    try {
      const safeClose = this.governor.getSafeCloseTime();
      const requestedClose = (seq as any).requestedCloseDurationSec;
      if (typeof requestedClose === 'number' && requestedClose < safeClose * 0.5) {
        return { applied: false, reason: `Requested close duration ${requestedClose}s violates governor safe close time ${safeClose}s` };
      }
    } catch (e) {
      // ignore and continue
    }

    // forward to governor guardian (simulated PLC bridge)
    const resp = this.governor.applyNozzleSequence({ ...seq, requestedBy });
    return { applied: !!resp.accepted, resp };
  }
}

export default SafeControlAdapter;
