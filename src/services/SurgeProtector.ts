/**
 * SurgeProtector.ts
 * 
 * Water Hammer Mitigation & Non-linear Closing Law
 * Prevents penstock pressure spikes during rapid shutdown.
 * Maps the "Cushion Point" transition.
 */

export interface ClosingLaw {
    totalTime: number; // seconds
    breakpointPosition: number; // % open
    fastRate: number; // % per sec
    slowRate: number; // % per sec (Cushion)
}

export class SurgeProtector {

    /**
     * CALCULATE CLOSING LAW
     * Determines optimal 2-stage closing to balance overspeed vs pressure rise.
     */
    public static calculateClosingLaw(
        penstockLength: number,
        waveVelocity: number, // a (m/s)
        ratedHead: number
    ): ClosingLaw {
        // Allievi Characteristic (rho)
        // Safe time > 2L/a
        const criticalTime = (2 * penstockLength) / waveVelocity;

        // Heuristic:
        // Close FAST from 100% to 20% (to stop overspeed)
        // Close SLOW from 20% to 0% (to cushion hammer)

        const breakpoint = 20; // 20% opening is "Cushion Point"

        return {
            totalTime: criticalTime * 10, // Safety factor
            breakpointPosition: breakpoint,
            fastRate: 15.0, // %/s
            slowRate: 2.0 // %/s (Cushion phase)
        };
    }

    /**
     * ESTIMATE SURGE PRESSURE
     * Zhukovsky Equation: dH = (-a * dV) / g
     */
    public static estimateSurge(
        closingRatePctResSec: number,
        currentFlowM3s: number,
        waveVelocity: number
    ): { surgeHeadM: number; safetyMargin: number } {
        // Simplified dV based on closing rate (assuming linear flow to gate)
        // dV/dt approx
        const flowChangeRate = currentFlowM3s * (closingRatePctResSec / 100);
        // dH = (a/g) * dV

        const g = 9.81;
        // Need velocity change in m/s, not flow. Need area. 
        // Assume Area such that V_rated ~ 5 m/s
        const estimatedArea = currentFlowM3s / 5.0; // rough
        const dV = flowChangeRate / estimatedArea;

        const surgeHead = (waveVelocity * dV) / g;

        // Safety Margin against rated head (e.g. max 130% allowed)
        // Margin = (Allowed - Actual) / Allowed
        // Assume max 50% rise allowed
        const limit = 50; // m surge
        const safetyMargin = Math.max(0, (limit - surgeHead) / limit * 100);

        return {
            surgeHeadM: surgeHead,
            safetyMargin
        };
    }
}
