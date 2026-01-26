/**
 * BearingHydrodynamics.ts
 * 
 * Bearing Lubrication & Film Thickness Monitor
 * Implements hydrodynamic theory to protect thrust and guide bearings.
 * Manages High-Pressure Jacking Pumps for lift-off and stopping.
 */

export interface BearingState {
    unitId: string;
    rpm: number;
    padTemperatures: number[]; // °C
    oilTemperature: number; // °C
    thrustLoadkN: number;
    filmThicknessMicrons: number;
    jackingPumpStatus: 'OFF' | 'RUNNING';
    lubricationRegime: 'BOUNDARY' | 'MIXED' | 'HYDRODYNAMIC';
}

export class BearingHydrodynamics {
    private static readonly MIN_FILM_THICKNESS = 15; // microns for safe hydrodynamic
    private static readonly LIFT_OFF_RPM = 15; // RPM where film establishes

    /**
     * CALCULATE BEARING STATE
     * Estimates film thickness and determines lubrication regime.
     */
    public static analyzeBearing(
        unitId: string,
        rpm: number,
        thrustLoadkN: number,
        oilViscosityCS: number, // at operating temp
        padTemps: number[]
    ): BearingState {
        // 1. Estimate Minimum Film Thickness (h0)
        // Simplified Stribeck / Hydrodynamic approximation
        // h0 proportional to (Viscosity * Speed) / Load
        // This is a heuristic model for SCADA display, not FEA

        let filmThickness = 0;
        if (rpm > 0) {
            // Constant factor 'k' depends on bearing geometry
            const k = 1000;
            filmThickness = (k * oilViscosityCS * rpm) / (thrustLoadkN || 1);
            filmThickness = Math.min(filmThickness, 100); // Cap at realistic max
        } else if (unitId === 'JACKING_ACTIVE') {
            filmThickness = 50; // Hydrostatic lift
        }

        // 2. Determine Regime
        let regime: BearingState['lubricationRegime'] = 'BOUNDARY';
        if (filmThickness > this.MIN_FILM_THICKNESS) regime = 'HYDRODYNAMIC';
        else if (filmThickness > 5) regime = 'MIXED';

        // 3. Jacking Pump Logic
        // Pump should run if RPM < LIFT_OFF_RPM (Start/Stop) or if Film is critical
        let jackingPump: 'OFF' | 'RUNNING' = 'OFF';
        if (Math.abs(rpm) < this.LIFT_OFF_RPM && Math.abs(rpm) > 0) {
            jackingPump = 'RUNNING';
        }

        // Safety Override: If bad film at high speed, maybe pump help? 
        // Usually JP only used at start/stop, but logic detects need.
        if (rpm > this.LIFT_OFF_RPM && filmThickness < 10) {
            console.warn(`[Bearing] ⚠️ CRITICAL: Low film thickness (${filmThickness.toFixed(1)}µm) at speed! Check oil!`);
        }

        return {
            unitId,
            rpm,
            padTemperatures: padTemps,
            oilTemperature: 0, // Passed in calcs usually
            thrustLoadkN,
            filmThicknessMicrons: filmThickness,
            jackingPumpStatus: jackingPump,
            lubricationRegime: regime
        };
    }

    /**
     * JACKING PUMP CONTROLLER
     * Returns true if pump should be active to prevent metal-on-metal.
     */
    public static shouldActivateJackingPump(rpm: number, filmThickness: number): boolean {
        // Activate if stopped/slow OR if film collapsed
        return (Math.abs(rpm) < this.LIFT_OFF_RPM) || (filmThickness < 5 && Math.abs(rpm) > 0);
    }
}
