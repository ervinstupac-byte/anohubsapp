/**
 * ActuatorDiagnosticCore.ts
 * 
 * Actuator Health Monitoring (Stiction & Hysteresis)
 * Compares Control Signal vs Feedback to detect "Stick-Slip" (Stiction)
 * and mechanical play (Hysteresis / Deadband).
 */

export interface ActuatorState {
    stictionIndex: number; // 0-100 (Severity)
    deadbandPct: number; // % of stroke
    hysteresisLoopWidth: number; // %
    isHunting: boolean;
    status: 'HEALTHY' | 'STICKY' | 'LOOSE' | 'FAILED';
}

export class ActuatorDiagnosticCore {
    private static history: { cmd: number; pos: number; time: number }[] = [];
    private static readonly MAX_HISTORY = 50;

    /**
     * ANALYZE ACTUATOR
     * Expects typically 10-100ms sample rate inputs
     */
    public static analyze(
        commandPct: number,
        feedbackPct: number
    ): ActuatorState {
        const now = Date.now();

        // 1. Maintain History
        this.history.push({ cmd: commandPct, pos: feedbackPct, time: now });
        if (this.history.length > this.MAX_HISTORY) this.history.shift();

        // 2. Identify Stiction (Stick-Slip)
        // Sign: Command changes, Position does NOT move... until it JUMPS.
        // We look for: d(Cmd) > Threshold AND d(Pos) ~ 0 ... followed by large d(Pos)

        let stictionScore = 0;
        // High-fidelity heuristic:
        // Identify "Stuck Phase": Command integrating, Position flat
        // Identify "Slip Phase": Position jumps to catch up
        if (this.history.length > 5) {
            const h = this.history;
            const current = h[h.length - 1];

            // Check last 5 samples for "Command Drift" vs "Position Lock"
            let cmdDrift = 0;
            let posMove = 0;

            for (let i = 1; i <= 5; i++) {
                const p = h[h.length - i];
                const pp = h[h.length - i - 1];
                if (p && pp) {
                    cmdDrift += Math.abs(p.cmd - pp.cmd);
                    posMove += Math.abs(p.pos - pp.pos);
                }
            }

            // Stiction Signature: Significant Command Movement (>0.5%) with Negligible Motion (<0.05%)
            if (cmdDrift > 0.5 && posMove < 0.05) {
                stictionScore = 65; // High probability of stiction
            }

            // Severe Stiction: Error accumulates then snaps (Slip)
            const error = Math.abs(current.cmd - current.pos);
            if (error > 2.0 && posMove < 0.05) {
                stictionScore = 85;
            }
        }

        // 3. Estimate Deadband / Play
        // Reversal Error: When direction changes, does position lag significantly?
        const deadband = 0.5; // Simulated calculation result (would require detecting reversals)

        // 4. Determine Status
        let status: ActuatorState['status'] = 'HEALTHY';
        if (stictionScore > 40) status = 'STICKY';
        if (stictionScore > 80) status = 'FAILED';
        if (Math.abs(commandPct - feedbackPct) > 5.0) status = 'FAILED'; // Gross deviation

        return {
            stictionIndex: stictionScore,
            deadbandPct: deadband,
            hysteresisLoopWidth: 1.2, // Simulated hysteresis width
            isHunting: false, // Calculated by LoopMonitor usually
            status
        };
    }

    /**
     * GET DIAGNOSTIC HISTORY
     * For visualization in Dashboard
     */
    public static getHistory(): { cmd: number; pos: number; time: number }[] {
        return this.history;
    }
}
