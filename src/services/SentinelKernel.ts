import { LegacyKnowledgeService } from './LegacyKnowledgeService';
import { TelemetryData } from '../contexts/TelemetryContext';
import Decimal from 'decimal.js';

/**
 * SENTINEL KERNEL (NC-4.7)
 * The real-time engineering diagnostic engine.
 * Transcribed from 15 years of Python/SQLite engineering logic.
 */
export class SentinelKernel {

    private static DANGEROUS_TEMP_RISE_RATE = 2.0; // degC / min
    private static MAX_STANDBY_GREASE_CYCLES = 20;

    /**
     * Legacy #3: Detects excessive greasing during standby.
     * Prevents seal blowouts in inactive turbines.
     */
    static checkGreaseRisk(status: string, standbyCycles: number): { risk: 'HIGH' | 'CRITICAL' | null, message?: string } {
        if (['STOPPED', 'STBY'].includes(status) && standbyCycles > this.MAX_STANDBY_GREASE_CYCLES) {
            return {
                risk: 'CRITICAL',
                message: `Excessive Grease (${standbyCycles} cycles). Seal blowout risk detected during standby!`
            };
        }
        return { risk: null };
    }

    /**
     * Legacy #10: Thermal Inertia Watcher.
     * Detects post-shutdown bearing temperature surges.
     */
    static checkThermalInertia(
        temps: number[],
        timestamps: number[]
    ): { risk: 'EMERGENCY' | 'WARNING' | null, message?: string, rateOfRise?: number } {
        if (temps.length < 2) return { risk: null };

        const t1 = timestamps[timestamps.length - 2];
        const t2 = timestamps[timestamps.length - 1];
        const temp1 = temps[temps.length - 2];
        const temp2 = temps[temps.length - 1];

        const deltaMin = (t2 - t1) / 60000; // ms to min
        if (deltaMin <= 0) return { risk: null };

        const rate = (temp2 - temp1) / deltaMin;

        if (rate > this.DANGEROUS_TEMP_RISE_RATE) {
            return {
                risk: 'EMERGENCY',
                rateOfRise: rate,
                message: `Rapid Compounding Heat! Rate: ${rate.toFixed(1)}°C/min. SHAFT SEIZURE RISK.`
            };
        } else if (rate > 1.0) {
            return {
                risk: 'WARNING',
                rateOfRise: rate,
                message: `Abnormal Bearing Heat Rise: ${rate.toFixed(1)}°C/min.`
            };
        }

        return { risk: null };
    }

    /**
     * NC-4.2 Directive: Stator Hotspot & Magnetic Side Pull.
     * Correlation between excitation current and stator temperature variance.
     */
    static checkMagneticUnbalance(
        statorTemps: number[],
        excitationA: number
    ): { risk: 'WARNING' | 'CRITICAL' | null, deltaT?: number, message?: string } {
        if (!statorTemps || statorTemps.length < 2) return { risk: null };

        const maxTemp = Math.max(...statorTemps);
        const minTemp = Math.min(...statorTemps);
        const deltaT = maxTemp - minTemp;

        // If deltaT > 15C while under excitation, possible rotor eccentricity
        if (excitationA > 100 && deltaT > 15) {
            return {
                risk: 'CRITICAL',
                deltaT,
                message: `Stator Hotspot Delta (${deltaT.toFixed(1)}°C). Possible Rotor Eccentricity / Magnetic Side Pull.`
            };
        } else if (deltaT > 10) {
            return {
                risk: 'WARNING',
                deltaT,
                message: `Stator Temperature Variance High: ${deltaT.toFixed(1)}°C.`
            };
        }

        return { risk: null };
    }

    /**
     * Forensic Analytics: Correlates telemetry against Legacy Knowledge Base.
     */
    static crossReferenceLegacy(telemetry: TelemetryData): string[] {
        const findings: string[] = [];
        const cases = LegacyKnowledgeService.getAllCases();

        for (const c of cases) {
            // Check for keyword matches in current status
            if (c.severity === 'CRITICAL' && telemetry.status === 'CRITICAL') {
                // If the user's issue matches known symptoms
                if (telemetry.incidentDetails?.toLowerCase().includes(c.keywords[0])) {
                    findings.push(`MATCH DETECTED: [${c.id}] ${c.symptom}`);
                }
            }
        }

        return findings;
    }

    public static getConfidenceScore(..._args: any[]): number {
        return 50;
    }
}
