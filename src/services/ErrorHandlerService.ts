/**
 * INVISIBLE MONSTERS DETECTOR
 * Extension for Francis engines to monitor cavitation and erosion
 */

import { FrancisHorizontalEngine } from '../lib/engines/FrancisHorizontalEngine';
import { TelemetryStream } from '../lib/engines/BaseTurbineEngine';

export interface CavitationStatus {
    sigma: number;              // Thoma cavitation parameter  
    riskLevel: 'SAFE' | 'CAUTION' | 'DANGER' | 'CRITICAL';
    message: string;
    npshAvailable: number;      // meters
    npshRequired: number;       // meters  
    recommendation?: string;
}

export interface ErosionStatus {
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    sedimentPPM?: number;
    estimatedWearRate: number;  // mm/year
    message: string;
    recommendation?: string;
}

/**
 * ERROR HANDLER SERVICE (Formerly Invisible Monsters)
 * Monitors cavitation and erosion risks
 */
export class ErrorHandlerService {
    private engine: FrancisHorizontalEngine;

    constructor(engine: FrancisHorizontalEngine) {
        this.engine = engine;
    }

    /**
     * THE SIGMA SPY - Cavitation detector 
     * Calculates sigma and warns when bubbles start biting!
     */
    monitorCavitation(telemetry: TelemetryStream): CavitationStatus {
        const H = telemetry.hydraulic.head;          // Net head (m)
        const P_atm = 101.325;                       // Atmospheric pressure (kPa)
        const P_vapor = 2.34;                        // Vapor pressure at 20°C (kPa)
        const rho = 1000;                            // Water density (kg/m³)
        const g = 9.81;                              // Gravity (m/s²)
        const H_s = 2.0;                             // Tailwater submergence (m) - assumed

        // NPSH Available = (P_atm - P_vapor) / (ρ * g) + H_s
        const npshAvailable = ((P_atm - P_vapor) * 1000) / (rho * g) + H_s;

        // NPSH Required (estimated from specific speed)
        const n_q = this.calculateSpecificSpeed(telemetry);
        const npshRequired = Math.pow(n_q / 200, 1.33) * H; // Empirical formula

        // Thoma number: σ = NPSH_available / H
        const sigma = npshAvailable / H;

        // Determine risk level
        let riskLevel: CavitationStatus['riskLevel'];
        let message: string;
        let recommendation: string;

        if (sigma >= 0.12) {
            riskLevel = 'SAFE';
            message = '✅ Cavitation risk is LOW. Operating safely.';
            recommendation = 'Continue normal operation. Monitor σ if load changes.';
        } else if (sigma >= 0.10) {
            riskLevel = 'CAUTION';
            message = '⚠️ Approaching cavitation zone. Monitor closely.';
            recommendation = 'Consider reducing load to operate closer to BEP. Monitor for crackling sounds.';
        } else if (sigma >= 0.08) {
            riskLevel = 'DANGER';
            message = '🔴 CAVITATION LIKELY! Bubbles are biting the metal. Reduce load or increase tailwater.';
            recommendation = 'URGENT: Reduce flow to increase σ above 0.10. Increase tailwater level if possible. Inspect runner at next shutdown.';
        } else {
            riskLevel = 'CRITICAL';
            message = '🚨 SEVERE CAVITATION! Runner damage occurring NOW. Emergency action required!';
            recommendation = 'EMERGENCY: Reduce load immediately! Runner pitting damage is actively occurring. Plan emergency shutdown for inspection.';
        }

        return {
            sigma,
            riskLevel,
            message,
            npshAvailable,
            npshRequired,
            recommendation
        };
    }

    /**
     * GET FULL MONSTER REPORT
     * Combines cavitation and erosion risks into a single threat assessment
     */
    getFullMonsterReport(
        telemetry: TelemetryStream,
        waterQuality?: { sedimentPPM: number; particleSize: number }
    ): {
        cavitation: CavitationStatus;
        erosion: ErosionStatus;
        overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        recommendations: string[];
    } {
        const cavitation = this.monitorCavitation(telemetry);
        const erosion = this.monitorErosion(telemetry, waterQuality);

        let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        const recs: string[] = [];

        // Determine Overall Risk
        if (cavitation.riskLevel === 'CRITICAL' || erosion.riskLevel === 'SEVERE') {
            overallRisk = 'CRITICAL';
        } else if (cavitation.riskLevel === 'DANGER' || erosion.riskLevel === 'HIGH') {
            overallRisk = 'HIGH';
        } else if (cavitation.riskLevel === 'CAUTION' || erosion.riskLevel === 'MODERATE') {
            overallRisk = 'MEDIUM';
        }

        // Collect Recommendations
        if (cavitation.recommendation) recs.push(`CAVITATION: ${cavitation.recommendation}`);
        if (erosion.recommendation) recs.push(`EROSION: ${erosion.recommendation}`);

        return {
            cavitation,
            erosion,
            overallRisk,
            recommendations: recs
        };
    }
    /**
     * Monitor erosion risk from sediment
     */
    monitorErosion(
        telemetry: TelemetryStream,
        waterQuality?: { sedimentPPM: number; particleSize: number }
    ): ErosionStatus {
        const flow = telemetry.hydraulic.flow;
        const head = telemetry.hydraulic.head;
        const velocity = Math.sqrt(2 * 9.81 * head); // Jet velocity approximation

        if (!waterQuality || waterQuality.sedimentPPM === 0) {
            return {
                riskLevel: 'LOW',
                estimatedWearRate: 0,
                message: '✅ No sediment data available. Assuming clean water.',
                recommendation: 'Install water quality monitoring to track sediment levels.'
            };
        }

        const sediment = waterQuality.sedimentPPM;

        // Empirical wear rate formula (mm/year)
        // Wear ∝ sediment_concentration * velocity^3
        const k = 0.0001; // Erosion constant for 13Cr4Ni stainless steel
        const wearRate = k * sediment * Math.pow(velocity, 3) / 1000;

        let riskLevel: ErosionStatus['riskLevel'];
        let message: string;
        let recommendation: string;

        if (sediment < 100) {
            riskLevel = 'LOW';
            message = '✅ Sediment levels acceptable. Minimal erosion expected.';
            recommendation = 'Continue normal operation. Annual runner inspection.';
        } else if (sediment < 300) {
            riskLevel = 'MODERATE';
            message = '⚠️ Moderate sediment. Expect 1-2mm/year blade wear.';
            recommendation = 'Monitor blade thickness every 6 months. Consider protective coatings.';
        } else if (sediment < 1000) {
            riskLevel = 'HIGH';
            message = '🟠 High sediment! Significant erosion occurring. Protective coatings recommended.';
            recommendation = 'Apply hard-facing weld overlay on leading edges. Inspect every 3 months. Install upstream sand excluder if possible.';
        } else {
            riskLevel = 'SEVERE';
            message = '🚨 EXTREME SEDIMENT! Rapid material loss. Runner life <2 years. Install sand excluder!';
            recommendation = 'URGENT: Install settling basin or sand excluder upstream. Reduce operating hours during monsoon. Plan runner replacement within 2 years.';
        }

        return {
            riskLevel,
            sedimentPPM: sediment,
            estimatedWearRate: wearRate,
            message,
            recommendation
        };
    }

    /**
     * Calculate specific speed (helper)
     */
    private calculateSpecificSpeed(telemetry: TelemetryStream): number {
        const n = telemetry.mechanical.rpm;
        const Q = telemetry.hydraulic.flow;
        const H = telemetry.hydraulic.head;

        if (H === 0) return 0;
        return (n * Math.sqrt(Q)) / Math.pow(H, 0.75);
    }


}

/**
 * LEARNING FROM STORIES
 * Correlate damage reports with operating conditions
 */
export interface DamageConditionCorrelation {
    timestamp: string;
    damageType: 'CAVITATION' | 'EROSION_SAND' | 'EROSION_SILT';
    operatingConditions: {
        flow: number;
        head: number;
        sigma: number;
        sedimentPPM?: number;
        hoursAtCondition: number;
    };
    severity: 'MINOR' | 'MODERATE' | 'SEVERE';
    location: string;
}

export class DamageLearningService {
    private damageHistory: DamageConditionCorrelation[] = [];

    /**
     * Record damage discovery with operating conditions
     */
    recordDamage(
        damageType: 'CAVITATION' | 'EROSION_SAND' | 'EROSION_SILT',
        severity: 'MINOR' | 'MODERATE' | 'SEVERE',
        location: string,
        telemetry: TelemetryStream,
        hoursAtCondition: number,
        sedimentPPM?: number
    ): void {
        const detector = new ErrorHandlerService(new FrancisHorizontalEngine());
        const cavStatus = detector.monitorCavitation(telemetry);

        const correlation: DamageConditionCorrelation = {
            timestamp: new Date().toISOString(),
            damageType,
            operatingConditions: {
                flow: telemetry.hydraulic.flow,
                head: telemetry.hydraulic.head,
                sigma: cavStatus.sigma,
                sedimentPPM,
                hoursAtCondition
            },
            severity,
            location
        };

        this.damageHistory.push(correlation);

        console.log('📚 LEARNING RECORDED:');
        console.log(`  When flow=${correlation.operatingConditions.flow} m³/s`);
        console.log(`  and head=${correlation.operatingConditions.head} m`);
        console.log(`  and σ=${correlation.operatingConditions.sigma.toFixed(3)}`);
        if (sedimentPPM) console.log(`  and sediment=${sedimentPPM} ppm`);
        console.log(`  after ${hoursAtCondition} hours`);
        console.log(`  → ${damageType} damage appeared at ${location} (${severity})`);
    }

    /**
     * Predict damage risk based on learned patterns
     */
    predictDamageRisk(telemetry: TelemetryStream, sedimentPPM: number = 0): {
        cavitationRisk: number;  // 0-100%
        erosionRisk: number;     // 0-100%
        warnings: string[];
    } {
        const detector = new ErrorHandlerService(new FrancisHorizontalEngine());
        const cavStatus = detector.monitorCavitation(telemetry);

        const warnings: string[] = [];

        // Check if current conditions match historical damage patterns
        for (const record of this.damageHistory) {
            const flowMatch = Math.abs(telemetry.hydraulic.flow - record.operatingConditions.flow) < 2;
            const headMatch = Math.abs(telemetry.hydraulic.head - record.operatingConditions.head) < 5;
            const sigmaMatch = Math.abs(cavStatus.sigma - record.operatingConditions.sigma) < 0.02;

            if (flowMatch && headMatch && sigmaMatch) {
                warnings.push(
                    `⚠️ PATTERN MATCH: Similar conditions caused ${record.damageType} damage ` +
                    `after ${record.operatingConditions.hoursAtCondition} hours (${record.severity}) at ${record.location}`
                );
            }
        }

        // Calculate risk scores
        const cavitationRisk = cavStatus.sigma < 0.10 ? ((0.10 - cavStatus.sigma) / 0.10) * 100 : 0;
        const erosionRisk = Math.min(100, (sedimentPPM / 1000) * 100);

        return {
            cavitationRisk,
            erosionRisk,
            warnings
        };
    }
}
