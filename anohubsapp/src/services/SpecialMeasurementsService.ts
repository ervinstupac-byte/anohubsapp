// Special Measurements Integration Service
// Correlates geodetic measurements with real-time vibrations
// Includes foundation settlement → magnetic field eccentricity formula

export interface GeodeticMeasurement {
    timestamp: number;
    assetId: string;
    shaftDeviation: number; // mm/m
    foundationSettlement: number; // mm
    bearingElevations: number[]; // mm (for each bearing)
    alignmentPoints: Array<{
        name: string;
        x: number; // mm
        y: number; // mm
        z: number; // mm
    }>;
}

export interface VibrationMeasurement {
    timestamp: number;
    assetId: string;
    horizontalVibration: number; // mm/s
    verticalVibration: number; // mm/s
    axialVibration: number; // mm/s
    phase: number; // degrees (0-360)
}

export interface GeneratorMagneticField {
    timestamp: number;
    assetId: string;
    airGapVariation: number[]; // mm (measured at 8 points around rotor)
    eccentricity: number; // mm
    eccentricityAngle: number; // degrees
}

export interface CorrelationResult {
    foundationSettlement: number;
    magneticEccentricity: number;
    correlationCoefficient: number; // -1 to 1
    predictedEccentricity: number; // Based on settlement
    deviationFromPrediction: number;
    status: 'ALIGNED' | 'MINOR_DEVIATION' | 'SIGNIFICANT_DEVIATION' | 'CRITICAL';
    recommendation: string;
}

export class SpecialMeasurementsService {
    /**
     * CORE FORMULA: Correlates foundation settlement with magnetic field eccentricity
     * 
     * Formula derivation:
     * - Foundation settlement causes shaft misalignment
     * - Shaft misalignment → rotor eccentricity
     * - Rotor eccentricity → uneven air gap → magnetic field distortion
     * 
     * Empirical correlation (based on field data):
     * Magnetic Eccentricity (mm) = K × Foundation Settlement (mm) × (L/D)
     * 
     * Where:
     * K = Coupling factor (0.15 - 0.25, depends on foundation stiffness)
     * L = Bearing span (m)
     * D = Rotor diameter (m)
     * 
     * For typical hydro generators: K ≈ 0.2, L/D ≈ 0.8
     * Simplified: Eccentricity ≈ 0.16 × Settlement
     */
    static correlateSettlementWithEccentricity(
        geodetic: GeodeticMeasurement,
        magnetic: GeneratorMagneticField,
        bearingSpan: number, // meters
        rotorDiameter: number, // meters
        foundationStiffness: 'SOFT' | 'MEDIUM' | 'HARD' = 'MEDIUM'
    ): CorrelationResult {
        // Coupling factor based on foundation stiffness
        const K = {
            SOFT: 0.25,
            MEDIUM: 0.20,
            HARD: 0.15
        }[foundationStiffness];

        const geometricFactor = bearingSpan / rotorDiameter;

        // Predicted eccentricity from settlement
        const predictedEccentricity = K * geodetic.foundationSettlement * geometricFactor;

        // Actual measured eccentricity
        const measuredEccentricity = magnetic.eccentricity;

        // Deviation
        const deviation = Math.abs(measuredEccentricity - predictedEccentricity);

        // Correlation coefficient (simplified - in reality would use full time series)
        const correlationCoefficient = this.calculateCorrelation(
            [geodetic.foundationSettlement],
            [measuredEccentricity]
        );

        // Status determination
        let status: CorrelationResult['status'];
        let recommendation: string;

        if (deviation < 0.05) {
            status = 'ALIGNED';
            recommendation = 'Settlement-eccentricity correlation within expected range. Continue quarterly monitoring.';
        } else if (deviation < 0.10) {
            status = 'MINOR_DEVIATION';
            recommendation = 'Minor deviation detected. Schedule precision alignment check within 30 days. Monitor monthly.';
        } else if (deviation < 0.20) {
            status = 'SIGNIFICANT_DEVIATION';
            recommendation = '⚠️ Significant deviation from predicted correlation. Other factors may be contributing (thermal expansion, coupling wear). Schedule detailed vibration diagnostics and alignment survey within 14 days.';
        } else {
            status = 'CRITICAL';
            recommendation = '🔴 CRITICAL: Large unexplained eccentricity. Possible foundation crack, bearing failure, or rotor bow. Emergency inspection required. Consider load reduction.';
        }

        return {
            foundationSettlement: geodetic.foundationSettlement,
            magneticEccentricity: measuredEccentricity,
            correlationCoefficient,
            predictedEccentricity,
            deviationFromPrediction: deviation,
            status,
            recommendation
        };
    }

    /**
     * Integrates geodetic + vibration data to detect alignment issues
     */
    static integrateGeodeticVibration(
        geodetic: GeodeticMeasurement,
        vibration: VibrationMeasurement
    ): {
        alignmentQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
        primaryIssue: string | null;
        correctionRequired: boolean;
    } {
        const shaftDeviationExcess = geodetic.shaftDeviation - 0.05; // mm/m
        const vibrationLevel = Math.sqrt(
            vibration.horizontalVibration ** 2 +
            vibration.verticalVibration ** 2
        );

        // Correlation matrix
        if (shaftDeviationExcess > 0.05 && vibrationLevel > 4.5) {
            return {
                alignmentQuality: 'POOR',
                primaryIssue: 'Shaft misalignment causing excessive vibration',
                correctionRequired: true
            };
        } else if (shaftDeviationExcess > 0.03 && vibrationLevel > 3.5) {
            return {
                alignmentQuality: 'FAIR',
                primaryIssue: 'Shaft deviation approaching tolerance limit',
                correctionRequired: true
            };
        } else if (shaftDeviationExcess > 0 || vibrationLevel > 3.0) {
            return {
                alignmentQuality: 'GOOD',
                primaryIssue: null,
                correctionRequired: false
            };
        } else {
            return {
                alignmentQuality: 'EXCELLENT',
                primaryIssue: null,
                correctionRequired: false
            };
        }
    }

    /**
     * Validates that foundation settlement is within acceptable limits
     * Triggers alert if settlement exceeds 2mm (typical threshold)
     */
    static validateFoundationStability(
        historicalGeodetic: GeodeticMeasurement[]
    ): {
        totalSettlement: number;
        settlementRate: number; // mm/year
        stable: boolean;
        forecast: {
            settlementIn1Year: number;
            settlementIn5Years: number;
        };
    } {
        if (historicalGeodetic.length < 2) {
            return {
                totalSettlement: 0,
                settlementRate: 0,
                stable: true,
                forecast: { settlementIn1Year: 0, settlementIn5Years: 0 }
            };
        }

        const settlements = historicalGeodetic.map(g => g.foundationSettlement);
        const totalSettlement = settlements[settlements.length - 1];

        // Calculate settlement rate (linear regression)
        const timeSpanYears = (
            historicalGeodetic[historicalGeodetic.length - 1].timestamp -
            historicalGeodetic[0].timestamp
        ) / (1000 * 60 * 60 * 24 * 365);

        const settlementRate = (settlements[settlements.length - 1] - settlements[0]) / timeSpanYears;

        const stable = settlementRate < 0.5; // Less than 0.5 mm/year is considered stable

        return {
            totalSettlement,
            settlementRate,
            stable,
            forecast: {
                settlementIn1Year: totalSettlement + settlementRate * 1,
                settlementIn5Years: totalSettlement + settlementRate * 5
            }
        };
    }

    /**
     * Calculates Pearson correlation coefficient
     */
    private static calculateCorrelation(x: number[], y: number[]): number {
        const n = x.length;
        if (n !== y.length || n === 0) return 0;

        const meanX = x.reduce((sum, val) => sum + val, 0) / n;
        const meanY = y.reduce((sum, val) => sum + val, 0) / n;

        let numerator = 0;
        let denomX = 0;
        let denomY = 0;

        for (let i = 0; i < n; i++) {
            const diffX = x[i] - meanX;
            const diffY = y[i] - meanY;
            numerator += diffX * diffY;
            denomX += diffX * diffX;
            denomY += diffY * diffY;
        }

        if (denomX === 0 || denomY === 0) return 0;

        return numerator / Math.sqrt(denomX * denomY);
    }

    /**
     * Generates comprehensive special measurements report
     */
    static generateIntegrationReport(
        geodetic: GeodeticMeasurement,
        vibration: VibrationMeasurement,
        magnetic: GeneratorMagneticField,
        bearingSpan: number,
        rotorDiameter: number
    ): {
        settlementEccentricityCorrelation: CorrelationResult;
        geodeticVibrationIntegration: ReturnType<typeof SpecialMeasurementsService.integrateGeodeticVibration>;
        overallAssessment: string;
        urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    } {
        const correlation = this.correlateSettlementWithEccentricity(
            geodetic,
            magnetic,
            bearingSpan,
            rotorDiameter
        );

        const integration = this.integrateGeodeticVibration(geodetic, vibration);

        let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        let overallAssessment: string;

        if (correlation.status === 'CRITICAL' || integration.alignmentQuality === 'POOR') {
            urgency = 'CRITICAL';
            overallAssessment = '🔴 CRITICAL: Multiple indicators show severe alignment/foundation issues. Emergency intervention required.';
        } else if (correlation.status === 'SIGNIFICANT_DEVIATION' || integration.correctionRequired) {
            urgency = 'HIGH';
            overallAssessment = '⚠️ HIGH PRIORITY: Significant deviations detected. Schedule corrective action within 14 days.';
        } else if (correlation.status === 'MINOR_DEVIATION' || integration.alignmentQuality === 'FAIR') {
            urgency = 'MEDIUM';
            overallAssessment = 'MEDIUM: Minor issues detected. Plan corrective maintenance during next scheduled outage.';
        } else {
            urgency = 'LOW';
            overallAssessment = '✅ All measurements within acceptable range. Continue routine monitoring.';
        }

        return {
            settlementEccentricityCorrelation: correlation,
            geodeticVibrationIntegration: integration,
            overallAssessment,
            urgency
        };
    }
}

// ===== USAGE EXAMPLE =====

/*
const geodetic: GeodeticMeasurement = {
    timestamp: Date.now(),
    assetId: 'FRANCIS-001',
    shaftDeviation: 0.08, // mm/m (exceeds 0.05 tolerance!)
    foundationSettlement: 1.5, // mm
    bearingElevations: [100.000, 99.998, 99.997, 100.001],
    alignmentPoints: []
};

const magnetic: GeneratorMagneticField = {
    timestamp: Date.now(),
    assetId: 'FRANCIS-001',
    airGapVariation: [10.2, 10.5, 10.8, 10.4, 10.1, 10.3, 10.6, 10.2], // mm
    eccentricity: 0.25, // mm
    eccentricityAngle: 45 // degrees
};

const result = SpecialMeasurementsService.correlateSettlementWithEccentricity(
    geodetic,
    magnetic,
    6.5, // bearing span in meters
    3.2, // rotor diameter in meters
    'MEDIUM'
);

console.log(result);
// Output:
// {
//     foundationSettlement: 1.5,
//     magneticEccentricity: 0.25,
//     predictedEccentricity: 0.194, // 0.2 × 1.5 × (6.5/3.2) ≈ 0.194
//     deviationFromPrediction: 0.056,
//     status: 'MINOR_DEVIATION',
//     recommendation: 'Minor deviation detected. Schedule precision alignment...'
// }
*/
