/**
 * SwitchyardIntegrityNode.ts
 * 
 * GIS & Circuit Breaker Monitor
 * Tracks SF6 Density (Leaks) and Breaker Wear (I2t).
 * Predicts Remaining Operations.
 */

export interface BreakerStatus {
    breakerId: string;
    sf6DensityPct: number;
    leakRateYear: number;
    accumulatedWearI2t: number; // Amps^2 * Sec
    remainingOperations: number;
    lockoutActive: boolean;
    status: 'SERVICEABLE' | 'REFILL_NEEDED' | 'REPLACE_CONTACTS' | 'LOCKOUT';
}

export class SwitchyardIntegrityNode {
    private static readonly RATED_WEAR_LIMIT = 50000000; // Example limit
    private static readonly SF6_ALARM_LEVEL = 95; // % of nominal
    private static readonly SF6_LOCKOUT_LEVEL = 85;

    /**
     * MONITOR BREAKER
     */
    public static monitor(
        breakerId: string,
        pressureBar: number,
        tempC: number,
        lastTripCurrent: number // Amps (0 if no trip)
    ): BreakerStatus {

        // 1. SF6 Density Calc (Ideal Gas approx for deviation)
        // P = rho * R * T  -> rho = P / (R*T)
        // Normalize to 20C.
        const nominalP = 6.0; // Bar abs
        const T_kelvin = tempC + 273.15;
        const P_norm = pressureBar * (293.15 / T_kelvin); // Normalized to 20C

        const densityPct = (P_norm / nominalP) * 100;

        // 2. Wear Accumulation
        // In real app, this accumulates. Here we simulate a static accumulation + last trip
        const currentWear = 12000000; // Mock accumulated
        const tripAdd = lastTripCurrent * lastTripCurrent * 0.05; // 50ms arc time approx
        const totalWear = currentWear + tripAdd;

        // 3. Remaining Ops
        const wearPct = (totalWear / this.RATED_WEAR_LIMIT);
        // Assume avg trip is 20kA -> wear per trip
        const wearPerTrip = 20000 * 20000 * 0.05;
        const remainingOps = Math.floor((this.RATED_WEAR_LIMIT - totalWear) / wearPerTrip);

        // 4. Status
        let status: BreakerStatus['status'] = 'SERVICEABLE';
        let lockout = false;

        if (densityPct < this.SF6_ALARM_LEVEL) status = 'REFILL_NEEDED';
        if (densityPct < this.SF6_LOCKOUT_LEVEL) {
            status = 'LOCKOUT';
            lockout = true;
        }
        if (wearPct > 0.9) status = 'REPLACE_CONTACTS';

        return {
            breakerId,
            sf6DensityPct: densityPct,
            leakRateYear: 0.5, // Mock %/yr
            accumulatedWearI2t: totalWear,
            remainingOperations: Math.max(0, remainingOps),
            lockoutActive: lockout,
            status
        };
    }
}
