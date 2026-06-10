import { BaseTurbineEngine, TelemetryStream } from './BaseTurbineEngine';

/**
 * Francis Horizontal Turbine Engine (<5 MW)
 * 
 * Characteristics:
 * - Medium head (40-150m typical for horizontal mounting)
 * - Horizontal shaft configuration
 * - Runner fully submerged in spiral casing
 * - Guide vanes for flow control
 * - Suitable for compact powerhouses
 */
export class FrancisHorizontalEngine extends BaseTurbineEngine {
    readonly turbineType = 'francis';
    readonly variant = 'horizontal';

    // Design parameters for horizontal Francis
    private readonly RATED_HEAD_M = 80;           // Typical for horizontal config
    private readonly RATED_FLOW_M3S = 12;         // <5 MW rating
    private readonly RATED_RPM = 600;             // Synchronous speed for 50 Hz, 10-pole
    private readonly BEST_EFFICIENCY_POINT = 0.91; // Peak efficiency at BEP

    // ========================================
    // 1. RPM WHISPER - Rotational Speed
    // ========================================

    getRPM(telemetry: TelemetryStream): number {
        return telemetry.mechanical.rpm;
    }

    protected getExpectedRPM(telemetry: TelemetryStream): number {
        // For synchronous generator, RPM should match rated speed
        return this.RATED_RPM;
    }

    // ========================================
    // 2. POWER WHISPER - Mechanical Output
    // ========================================

    getPowerOutput(telemetry: TelemetryStream): number {
        // P = ρ * g * Q * H * η
        const rho = 1000;  // Water density (kg/m³)
        const g = 9.81;    // Gravity (m/s²)
        const Q = telemetry.hydraulic.flow;      // Flow rate (m³/s)
        const H = telemetry.hydraulic.head;      // Net head (m)
        const eta = this.getEfficiency(telemetry) / 100; // Convert % to decimal

        const powerW = rho * g * Q * H * eta;
        return powerW / 1000; // Convert to kW
    }

    // ========================================
    // 3. EFFICIENCY WHISPER - Performance
    // ========================================

    getEfficiency(telemetry: TelemetryStream): number {
        // Francis efficiency varies with operating point
        // Uses Hill chart approximation

        const currentFlow = telemetry.hydraulic.flow;
        const currentHead = telemetry.hydraulic.head;

        // Normalize to rated conditions
        const flowRatio = currentFlow / this.RATED_FLOW_M3S;
        const headRatio = currentHead / this.RATED_HEAD_M;

        // Best efficiency at ~90% flow, 100% head
        const flowDeviation = Math.abs(flowRatio - 0.9);
        const headDeviation = Math.abs(headRatio - 1.0);

        // Efficiency penalty function
        const flowPenalty = Math.pow(flowDeviation, 2) * 0.15;
        const headPenalty = Math.pow(headDeviation, 2) * 0.08;

        let efficiency = this.BEST_EFFICIENCY_POINT - flowPenalty - headPenalty;

        // Account for mechanical losses at partial load
        if (flowRatio < 0.3) {
            efficiency *= 0.85; // Steep efficiency drop below 30% load
        }

        // Age/wear degradation (if vibration is high, efficiency suffers)
        const vibration = this.getVibration(telemetry);
        if (vibration > 4.5) {
            const wearFactor = Math.min((vibration - 4.5) / 10, 0.1);
            efficiency -= wearFactor;
        }

        return Math.max(0, Math.min(100, efficiency * 100)); // Clamp to 0-100%
    }

    // ========================================
    // 4. VIBRATION WHISPER - Mechanical Health
    // ========================================

    getVibration(telemetry: TelemetryStream): number {
        // Combine X and Y axes into RMS value
        // Horizontal machines typically have higher radial vibration
        const vx = telemetry.mechanical.vibrationX || 0;
        const vy = telemetry.mechanical.vibrationY || 0;

        // RMS calculation
        return Math.sqrt(vx * vx + vy * vy);
    }

    // ========================================
    // 5. TEMPERATURE WHISPER - Thermal Health
    // ========================================

    getTemperature(telemetry: TelemetryStream): number {
        // For horizontal Francis, guide bearing is critical
        return telemetry.mechanical.bearingTemp || 45;
    }

    // ========================================
    // FRANCIS-SPECIFIC CALCULATIONS
    // ========================================

    getSpecializedMetrics(telemetry: TelemetryStream): Record<string, number> {
        return {
            cavitationIndex: this.calculateCavitationIndex(telemetry),
            guideVanePosition: telemetry.hydraulic.guideVaneOpening || 0,
            specificSpeed: this.calculateSpecificSpeed(telemetry),
            runnerWearEstimate: this.estimateRunnerWear(telemetry)
        };
    }

    /**
     * Calculate Thoma cavitation parameter (σ)
     * Critical for Francis turbines to avoid cavitation damage
     */
    private calculateCavitationIndex(telemetry: TelemetryStream): number {
        const H = telemetry.hydraulic.head;
        const atmPressure = 101.325; // kPa at sea level
        const vaporPressure = 2.34;  // kPa at 20°C
        const tailwaterDepth = 2.0;  // Assume 2m submergence

        // Available NPSH
        const NPSH_available = (atmPressure - vaporPressure) / (1000 * 9.81) + tailwaterDepth;

        // Thoma number
        const sigma = NPSH_available / H;

        return sigma;
    }

    /**
     * Calculate specific speed (dimensionless)
     */
    private calculateSpecificSpeed(telemetry: TelemetryStream): number {
        const n = this.getRPM(telemetry);  // rpm
        const Q = telemetry.hydraulic.flow; // m³/s
        const H = telemetry.hydraulic.head; // m

        if (H === 0) return 0;

        // n_q = n * √Q / H^(3/4)
        return (n * Math.sqrt(Q)) / Math.pow(H, 0.75);
    }

    /**
     * Estimate runner wear based on operating history
     * Uses vibration and efficiency as proxies
     */
    private estimateRunnerWear(telemetry: TelemetryStream): number {
        const efficiency = this.getEfficiency(telemetry);
        const vibration = this.getVibration(telemetry);

        // Wear increases with low efficiency and high vibration
        const efficiencyFactor = Math.max(0, (91 - efficiency) / 91);
        const vibrationFactor = Math.min(1, vibration / 7.1);

        const wearPercentage = (efficiencyFactor * 0.6 + vibrationFactor * 0.4) * 100;

        return Math.min(100, wearPercentage);
    }

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
