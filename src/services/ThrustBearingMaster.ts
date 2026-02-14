/**
 * Thrust Bearing Master
 * - Hydrodynamic film thickness calculator (h_min)
 * - Pad symmetry audit (pad temperature std dev)
 * - Startup jacking oil check (blocks START_SEQUENCE if jacking fails)
 *
 * Notes:
 * - This is a pragmatic engineering approximation intended for decision logic.
 * - h_min is estimated as (eta * U) / p_surface where:
 *     eta = dynamic viscosity (Pa·s)
 *     U = surface speed (m/s) ~ omega * radius
 *     p_surface = load per pad / padArea (Pa)
 *  The result is in meters; thresholds given in micrometers in config.
 */

export type ThrustAction =
    | { action: 'NO_ACTION'; reason?: string }
    | { action: 'LUBRICATION_CRISIS'; hMin_m: number; reason: string }
    | { action: 'SOVEREIGN_TRIP'; hMin_m: number; reason: string }
    | { action: 'PAD_TEMPERATURE_DIVERGENCE'; sigmaC: number; reason: string }
    | { action: 'MECHANICAL_MISALIGNMENT'; sigmaC: number; reason: string }
    | { action: 'BLOCK_START'; reason: string };

export interface ThrustMeasurement {
    timestamp: string; // ISO
    axialLoadN: number; // axial load (N)
    oilViscosityPas: number; // Pa.s
    shaftSpeedRpm: number; // rpm
    padTempsC: number[]; // temperatures of each pad
    padAreaM2?: number; // optional pad area (m^2)
    radiusM?: number; // effective radius for surface speed
    jackingPressureBar?: number; // current jacking oil pressure
    duringStartup?: boolean; // true when start sequence in progress
}

import BaseGuardian from './BaseGuardian';

export class ThrustBearingMaster extends BaseGuardian {
    // thresholds (configurable)
    private warningHMin = 20e-6; // 20 micrometers (m)
    private tripHMin = 12e-6; // 12 micrometers (m)
    private padDivergenceThreshold = 5.0; // degC => warning
    private padMisalignmentThreshold = 12.0; // degC => critical

    // geometry defaults
    private defaultPadArea = 0.05; // m^2 (approx)
    private defaultRadius = 0.35; // m (effective pad radius)

    private priorRisk = 0.01; // small prior for health impact

    constructor(opts?: { warningHMinMicron?: number; tripHMinMicron?: number }) {
        super();
        if (opts?.warningHMinMicron) this.warningHMin = opts.warningHMinMicron * 1e-6;
        if (opts?.tripHMinMicron) this.tripHMin = opts.tripHMinMicron * 1e-6;
    }

    addMeasurement(m: ThrustMeasurement): ThrustAction {
        // Compute film thickness
        const hMin = ThrustBearingMaster.calculateFilmThickness(m.axialLoadN, m.oilViscosityPas, m.shaftSpeedRpm, m.padAreaM2 ?? this.defaultPadArea, m.radiusM ?? this.defaultRadius, m.padTempsC.length);

        // Pad symmetry
        const sigma = this.computeStdDev(m.padTempsC);

        // Check jacking pressure during startup
        if (m.duringStartup && typeof m.jackingPressureBar === 'number') {
            const minRequired = 0.1; // bar — placeholder; real value comes from asset config
            if (m.jackingPressureBar < minRequired) {
                return { action: 'BLOCK_START', reason: `Jacking oil pressure low (${m.jackingPressureBar} bar) — blocking startup.` };
            }
        }

        // Film thickness thresholds
        if (hMin <= this.tripHMin) {
            return { action: 'SOVEREIGN_TRIP', hMin_m: hMin, reason: `h_min=${(hMin * 1e6).toFixed(2)} μm below trip threshold (${this.tripHMin * 1e6} μm).` };
        }

        if (hMin <= this.warningHMin) {
            return { action: 'LUBRICATION_CRISIS', hMin_m: hMin, reason: `h_min=${(hMin * 1e6).toFixed(2)} μm below warning (${this.warningHMin * 1e6} μm).` };
        }

        // Pad symmetry checks
        if (sigma >= this.padMisalignmentThreshold) {
            return { action: 'MECHANICAL_MISALIGNMENT', sigmaC: sigma, reason: `Pad temperature stddev ${sigma.toFixed(2)}°C exceeds ${this.padMisalignmentThreshold}°C.` };
        }

        if (sigma >= this.padDivergenceThreshold) {
            return { action: 'PAD_TEMPERATURE_DIVERGENCE', sigmaC: sigma, reason: `Pad temperature deviation ${sigma.toFixed(2)}°C.` };
        }

        return { action: 'NO_ACTION', reason: `h_min=${(hMin * 1e6).toFixed(2)} μm, pad sigma=${sigma.toFixed(2)}°C` };
    }

    /**
     * Hydrodynamic film thickness approximation
     * h_min (m) = (eta * U) / p_surface
     * - eta: Pa.s
     * - U: m/s surface speed = omega * radius, omega = 2*pi*(rpm/60)
     * - p_surface: Pa = (axialLoadN / nPads) / padArea
     */
    static calculateFilmThickness(axialLoadN: number, etaPas: number, shaftRpm: number, padAreaM2: number, radiusM: number, nPads = 8): number {
        const omega = 2 * Math.PI * (shaftRpm / 60); // rad/s
        const U = omega * radiusM; // m/s (surface speed)

        const loadPerPad = Math.max(1e-3, axialLoadN / Math.max(1, nPads));
        const pSurface = loadPerPad / Math.max(1e-6, padAreaM2); // Pa

        // avoid division by zero; use pragmatic floor
        const h = (etaPas * U) / Math.max(pSurface, 1e-3); // meters
        // cap to a reasonable range
        const hClamped = Math.max(1e-9, Math.min(1e-2, h));
        return hClamped;
    }

    computeStdDev(values: number[]): number {
        if (!values || values.length === 0) return 0;
        const n = values.length;
        const mean = values.reduce((s, v) => s + v, 0) / n;
        const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n;
        return Math.sqrt(variance);
    }

    // Health impact mapping (simple): more severe issues cause larger negative delta
    getHealthImpactForAction(a: ThrustAction) {
        switch (a.action) {
            case 'SOVEREIGN_TRIP': return { overallDelta: -60, details: a.reason };
            case 'LUBRICATION_CRISIS': return { overallDelta: -30, details: a.reason };
            case 'MECHANICAL_MISALIGNMENT': return { overallDelta: -25, details: a.reason };
            case 'PAD_TEMPERATURE_DIVERGENCE': return { overallDelta: -10, details: a.reason };
            case 'BLOCK_START': return { overallDelta: -50, details: a.reason };
            default: return { overallDelta: 0, details: (a.reason || 'No impact') };
        }
    }

    // Compute a simple confidence score (0-100) for recent measurements
    // Heuristic: expects temperature rise -> viscosity drop -> vibration rise
    public getConfidenceScore(measurements: ThrustMeasurement[] = [], vibrationSeries: number[] = []): number {
        // Not enough data
        if (!measurements || measurements.length < 3) return 40; // low confidence

        // Build series
        const temps = measurements.map(m => (m.padTempsC && m.padTempsC.length ? (m.padTempsC.reduce((s, n) => s + n, 0) / m.padTempsC.length) : (m.padTempsC && typeof m.padTempsC === 'number' ? (m.padTempsC as any) : (m.oilViscosityPas ? 0 : 0))));
        const viscosities = measurements.map(m => m.oilViscosityPas || 0);
        const vib = (vibrationSeries && vibrationSeries.length >= measurements.length) ? vibrationSeries.slice(-measurements.length) : [];

        const corrTV = this.safeCorrelation(temps, vib.length ? vib : temps.map(() => 0)); // temp vs vibration
        const corrTVisc = this.safeCorrelation(temps, viscosities); // temp vs viscosity

        // expected: corr(temp, vibration) >= 0.3, corr(temp, viscosity) <= -0.3
        let score = 100;
        if (isNaN(corrTV) || isNaN(corrTVisc)) score = 50;
        else {
            if (corrTV < 0.3) score -= Math.round((0.3 - corrTV) * 100);
            if (corrTVisc > -0.3) score -= Math.round((corrTVisc + 0.3) * 100);
        }

        // penalize high pad temp std dev variability
        const tempStd = this.computeStdDev(temps || []);
        if (tempStd > 8) score -= 15;

        // clamp
        score = Math.max(0, Math.min(100, score));
        return Math.round(score);
    }

    protected safeCorrelation(a: number[], b: number[]) {
        if (!a || !b || a.length < 2 || b.length < 2) return NaN;
        const n = Math.min(a.length, b.length);
        const xa = a.slice(-n), yb = b.slice(-n);
        const meanA = xa.reduce((s, v) => s + v, 0) / n; const meanB = yb.reduce((s, v) => s + v, 0) / n;
        let num = 0, denA = 0, denB = 0;
        for (let i = 0; i < n; i++) { const da = xa[i] - meanA; const db = yb[i] - meanB; num += da * db; denA += da * da; denB += db * db; }
        const den = Math.sqrt(Math.max(1e-12, denA * denB));
        return den === 0 ? NaN : (num / den);
    }
}

export default ThrustBearingMaster;
