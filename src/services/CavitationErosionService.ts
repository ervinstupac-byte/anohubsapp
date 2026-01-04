// Cavitation Erosion Tracking Service
// AR camera mapping of pitting damage on runner blades

export interface ErosionPoint {
    x: number; // mm from blade leading edge
    y: number; // mm from hub
    z: number; // mm depth of pit
    diameter: number; // mm pit diameter
    timestamp: number;
}

export interface BladeErosionMap {
    bladeId: number; // 1-N blades
    surfaceArea: number; // cm² total blade surface
    erosionPoints: ErosionPoint[];
    totalVolumeLost: number; // mm³
    massLoss: number; // grams (assuming steel density 7.85 g/cm³)
}

export interface ErosionAnalysis {
    timestamp: number;
    assetId: string;
    turbineFamily: string;
    operatingHours: number; // Hours since last measurement

    blades: BladeErosionMap[];

    // Calculated metrics
    totalMassLoss: number; // grams
    massLossRate: number; // grams/month
    erosionAcceleration: number; // % increase in rate vs previous

    // Material recommendation
    currentMaterial: string;
    recommendedMaterial?: string;
    recommendedAction?: 'STELLITE_WELD' | 'BLADE_REPLACEMENT' | 'REGIME_CHANGE' | 'CONTINUE_MONITORING';

    // Operational changes
    recommendedRegimeChange?: {
        parameter: 'HEAD' | 'FLOW' | 'RPM';
        currentValue: number;
        recommendedValue: number;
        expectedReduction: number; // % erosion rate reduction
    };
}

export class CavitationErosionService {
    /**
     * AR Camera: Map pitting on runner blades
     * Simulates AR point cloud → erosion point extraction
     */
    static mapBladePitting(
        bladeId: number,
        arPointCloud: Array<{ x: number; y: number; z: number }>,
        surfaceArea: number
    ): BladeErosionMap {
        // In production: Process actual AR point cloud data
        // Extract pits by detecting Z-depth anomalies

        const erosionPoints: ErosionPoint[] = [];
        let totalVolume = 0;

        // Simulate pit detection
        for (const point of arPointCloud) {
            if (point.z < -0.5) { // Pit threshold: 0.5mm deep
                const pitDepth = Math.abs(point.z);
                const pitDiameter = Math.sqrt(pitDepth) * 2; // Simplified

                // Calculate pit volume (hemisphere approximation)
                const pitVolume = (2 / 3) * Math.PI * Math.pow(pitDiameter / 2, 2) * pitDepth;

                erosionPoints.push({
                    x: point.x,
                    y: point.y,
                    z: pitDepth,
                    diameter: pitDiameter,
                    timestamp: Date.now()
                });

                totalVolume += pitVolume;
            }
        }

        // Convert volume (mm³) to mass (grams)
        // Steel density: 7.85 g/cm³ = 0.00785 g/mm³
        const massLoss = totalVolume * 0.00785;

        return {
            bladeId,
            surfaceArea,
            erosionPoints,
            totalVolumeLost: totalVolume,
            massLoss
        };
    }

    /**
     * Analyze erosion trends and recommend actions
     */
    static analyzeErosionTrend(
        assetId: string,
        turbineFamily: string,
        currentScan: BladeErosionMap[],
        previousScan: BladeErosionMap[] | null,
        operatingHours: number
    ): ErosionAnalysis {
        // Calculate total mass loss
        const totalMassLoss = currentScan.reduce((sum, blade) => sum + blade.massLoss, 0);

        // Calculate mass loss rate (grams/month)
        const monthsElapsed = operatingHours / 730; // Assuming 730 hours/month average
        const massLossRate = totalMassLoss / monthsElapsed;

        // Calculate acceleration
        let erosionAcceleration = 0;
        if (previousScan) {
            const previousTotal = previousScan.reduce((sum, blade) => sum + blade.massLoss, 0);
            const previousRate = previousTotal / monthsElapsed;
            erosionAcceleration = ((massLossRate - previousRate) / previousRate) * 100;
        }

        // Determine current material (typical for turbine family)
        let currentMaterial = 'Martenzitni Cr13 čelik'; // Default
        if (turbineFamily === 'KAPLAN') currentMaterial = 'Austenitic Stainless 18Cr-8Ni';
        if (turbineFamily === 'PELTON') currentMaterial = 'Hardened 17Cr-4Ni';

        // Recommend action based on erosion rate
        let recommendedMaterial: string | undefined;
        let recommendedAction: ErosionAnalysis['recommendedAction'];
        let recommendedRegimeChange: ErosionAnalysis['recommendedRegimeChange'];

        if (massLossRate > 50) {
            // CRITICAL: > 50 g/month
            recommendedAction = 'STELLITE_WELD';
            recommendedMaterial = 'Stellite 6 (Co-Cr-W navarivanje)';
        } else if (massLossRate > 20) {
            // HIGH: 20-50 g/month
            recommendedAction = erosionAcceleration > 30 ? 'STELLITE_WELD' : 'REGIME_CHANGE';

            // Suggest operational changes
            if (turbineFamily === 'FRANCIS') {
                recommendedRegimeChange = {
                    parameter: 'HEAD',
                    currentValue: 100, // meters (example)
                    recommendedValue: 95,
                    expectedReduction: 15 // % erosion reduction
                };
            } else if (turbineFamily === 'KAPLAN') {
                recommendedRegimeChange = {
                    parameter: 'FLOW',
                    currentValue: 50, // m³/s (example)
                    recommendedValue: 48,
                    expectedReduction: 10
                };
            }
        } else if (massLossRate > 5) {
            // MEDIUM: 5-20 g/month
            recommendedAction = 'CONTINUE_MONITORING';
        } else {
            // LOW: < 5 g/month
            recommendedAction = 'CONTINUE_MONITORING';
        }

        return {
            timestamp: Date.now(),
            assetId,
            turbineFamily,
            operatingHours,
            blades: currentScan,
            totalMassLoss,
            massLossRate,
            erosionAcceleration,
            currentMaterial,
            recommendedMaterial,
            recommendedAction,
            recommendedRegimeChange
        };
    }

    /**
     * Generate ANO-AGENT recommendation message
     */
    static generateRecommendation(analysis: ErosionAnalysis): string {
        const { massLossRate, erosionAcceleration, recommendedAction, recommendedMaterial, recommendedRegimeChange } = analysis;

        let message = `🤖 ANO-AGENT CAVITATION ANALIZA:\n\n`;
        message += `Stopa gubitka mase: ${massLossRate.toFixed(1)} g/mjesec\n`;

        if (erosionAcceleration > 0) {
            message += `⚠️ Erozija se ubrzava: +${erosionAcceleration.toFixed(0)}% vs prethodno mjerenje\n\n`;
        } else {
            message += `✓ Erozija se stabilizovala ili usporava: ${erosionAcceleration.toFixed(0)}%\n\n`;
        }

        message += `PREPORUKA:\n`;

        switch (recommendedAction) {
            case 'STELLITE_WELD':
                message += `🔴 HITNO: Stellite navarivanje preporučeno.\n`;
                message += `Materijal: ${recommendedMaterial}\n`;
                message += `Očekivano smanjenje erozije: 70-80%\n`;
                message += `Vijek trajanja: 5x duže od baznog materijala\n`;
                break;

            case 'BLADE_REPLACEMENT':
                message += `🟡 Zamjena lopatica preporučena u narednih 6-12 mjeseci.\n`;
                break;

            case 'REGIME_CHANGE':
                message += `🟡 Promjena režima rada preporučena:\n`;
                if (recommendedRegimeChange) {
                    message += `${recommendedRegimeChange.parameter}: ${recommendedRegimeChange.currentValue} → ${recommendedRegimeChange.recommendedValue}\n`;
                    message += `Očekivano smanjenje erozije: ~${recommendedRegimeChange.expectedReduction}%\n`;
                }
                break;

            case 'CONTINUE_MONITORING':
                message += `✅ Erozija pod kontrolom. Nastaviti sa monitoringom.\n`;
                message += `Sledeće skeniranje: 6 mjeseci\n`;
                break;
        }

        return message;
    }
}
