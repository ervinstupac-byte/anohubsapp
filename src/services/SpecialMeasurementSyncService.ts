// Special Measurement Sync Service
// Imports data from laser trackers, geodetic instruments, and compares with ideal blueprints

export interface GeometryPoint {
    id: string;
    name: string; // e.g., "Spiral Case Point 12"
    x: number; // mm
    y: number; // mm
    z: number; // mm
    timestamp: number;
}

export interface IdealBlueprint {
    turbineFamily: string;
    variant: string;
    geometryPoints: Array<{
        name: string;
        x: number;
        y: number;
        z: number;
        tolerance: number; // mm
    }>;
}

export interface GeometryComparison {
    timestamp: number;
    totalPoints: number;
    pointsWithinTolerance: number;
    averageDeviation: number; // mm
    maxDeviation: {
        point: string;
        deviation: number; // mm
    };
    deviations: Array<{
        point: string;
        measured: { x: number; y: number; z: number };
        ideal: { x: number; y: number; z: number };
        deviation: number; // mm
        withinTolerance: boolean;
    }>;
}

export interface EfficiencyGapAnalysis {
    geometryDeviation: number; // mm average
    predictedEfficiencyLoss: number; // %
    lostRevenueAnnual: number; // $
    reconstructionCost: number; // $
    roi: number; // %
    paybackMonths: number;
}

export class SpecialMeasurementSyncService {
    /**
     * Import geometry data from laser tracker or total station
     * Supports multiple formats: CSV, JSON, proprietary laser tracker formats
     */
    static async importGeometryData(
        filePath: string,
        format: 'CSV' | 'JSON' | 'FARO' | 'LEICA'
    ): Promise<GeometryPoint[]> {
        console.log(`📥 Importing geometry data from: ${filePath}`);
        console.log(`   Format: ${format}`);

        // In production: Parse actual file
        // For now, mock data
        const points: GeometryPoint[] = [
            { id: '1', name: 'Spiral Case Inlet', x: 1500.234, y: 2000.156, z: 500.089, timestamp: Date.now() },
            { id: '2', name: 'Spiral Case Section A', x: 1450.123, y: 1980.234, z: 490.123, timestamp: Date.now() },
            { id: '3', name: 'Stay Ring Bolt Hole 1', x: 1200.456, y: 1800.345, z: 450.234, timestamp: Date.now() }
            // ... 100+ points typical
        ];

        console.log(`✅ Imported ${points.length} geometry points`);

        return points;
    }

    /**
     * Compare measured geometry with ideal blueprint
     */
    static compareWithBlueprint(
        measuredPoints: GeometryPoint[],
        idealBlueprint: IdealBlueprint
    ): GeometryComparison {
        const deviations: GeometryComparison['deviations'] = [];
        let totalDeviation = 0;
        let maxDeviation = { point: '', deviation: 0 };
        let pointsWithinTolerance = 0;

        for (const measured of measuredPoints) {
            const ideal = idealBlueprint.geometryPoints.find(p => p.name === measured.name);

            if (!ideal) {
                console.warn(`Blueprint point not found for: ${measured.name}`);
                continue;
            }

            // Calculate 3D deviation
            const dx = measured.x - ideal.x;
            const dy = measured.y - ideal.y;
            const dz = measured.z - ideal.z;
            const deviation = Math.sqrt(dx * dx + dy * dy + dz * dz);

            totalDeviation += deviation;

            if (deviation > maxDeviation.deviation) {
                maxDeviation = { point: measured.name, deviation };
            }

            const withinTolerance = deviation <= ideal.tolerance;
            if (withinTolerance) pointsWithinTolerance++;

            deviations.push({
                point: measured.name,
                measured: { x: measured.x, y: measured.y, z: measured.z },
                ideal: { x: ideal.x, y: ideal.y, z: ideal.z },
                deviation,
                withinTolerance
            });
        }

        const averageDeviation = totalDeviation / measuredPoints.length;

        return {
            timestamp: Date.now(),
            totalPoints: measuredPoints.length,
            pointsWithinTolerance,
            averageDeviation,
            maxDeviation,
            deviations
        };
    }

    /**
     * Calculate efficiency gap from geometry deformation
     * 
     * FORMULA (empirical from field data):
     * Efficiency Loss (%) = k × ln(1 + deviation_mm / reference_dimension)
     * 
     * Where:
     * k = 2.5 for Francis spiral case distortion
     * k = 3.0 for Kaplan hub deformation  
     * k = 1.8 for Pelton housing alignment
     */
    static calculateEfficiencyGap(
        comparison: GeometryComparison,
        turbineFamily: string,
        ratedPowerMW: number,
        electricityPrice: number // $/MWh
    ): EfficiencyGapAnalysis {
        // Determine k factor
        let k = 2.5; // Default for Francis
        if (turbineFamily === 'kaplan') k = 3.0;
        if (turbineFamily === 'pelton') k = 1.8;

        // Reference dimension (typical spiral case diameter ~3000mm)
        const referenceDimension = 3000; // mm

        // Calculate efficiency loss
        const efficiencyLoss = k * Math.log(1 + comparison.averageDeviation / referenceDimension);

        // Calculate lost revenue
        const hoursPerYear = 8760;
        const capacityFactor = 0.75; // Typical
        const annualMWh = ratedPowerMW * hoursPerYear * capacityFactor;
        const lostMWh = annualMWh * (efficiencyLoss / 100);
        const lostRevenueAnnual = lostMWh * electricityPrice;

        // Estimate reconstruction cost
        // Empirical: $50k per mm of average deviation for major geometry correction
        const reconstructionCost = comparison.averageDeviation * 50000;

        // ROI calculation
        const roi = (lostRevenueAnnual * 10 - reconstructionCost) / reconstructionCost * 100; // 10-year horizon
        const paybackMonths = (reconstructionCost / lostRevenueAnnual) * 12;

        return {
            geometryDeviation: comparison.averageDeviation,
            predictedEfficiencyLoss: efficiencyLoss,
            lostRevenueAnnual,
            reconstructionCost,
            roi,
            paybackMonths
        };
    }

    /**
     * Generate detailed report with visualizations
     */
    static generateGeometryReport(
        comparison: GeometryComparison,
        efficiencyGap: EfficiencyGapAnalysis
    ): string {
        let report = '=== GEOMETRY ANALYSIS REPORT ===\n\n';

        report += `Total Points Measured: ${comparison.totalPoints}\n`;
        report += `Points Within Tolerance: ${comparison.pointsWithinTolerance} (${(comparison.pointsWithinTolerance / comparison.totalPoints * 100).toFixed(1)}%)\n`;
        report += `Average Deviation: ${comparison.averageDeviation.toFixed(2)} mm\n`;
        report += `Maximum Deviation: ${comparison.maxDeviation.deviation.toFixed(2)} mm at "${comparison.maxDeviation.point}"\n\n`;

        report += '--- EFFICIENCY IMPACT ---\n';
        report += `Predicted Efficiency Loss: ${efficiencyGap.predictedEfficiencyLoss.toFixed(2)}%\n`;
        report += `Lost Revenue (Annual): $${efficiencyGap.lostRevenueAnnual.toLocaleString()}\n`;
        report += `Reconstruction Cost: $${efficiencyGap.reconstructionCost.toLocaleString()}\n`;
        report += `ROI (10-year): ${efficiencyGap.roi.toFixed(0)}%\n`;
        report += `Payback Period: ${efficiencyGap.paybackMonths.toFixed(1)} months\n\n`;

        report += '--- TOP 5 DEVIATIONS ---\n';
        const top5 = [...comparison.deviations]
            .sort((a, b) => b.deviation - a.deviation)
            .slice(0, 5);

        top5.forEach((d, i) => {
            report += `${i + 1}. ${d.point}: ${d.deviation.toFixed(2)} mm ${d.withinTolerance ? '✓' : '✗'}\n`;
        });

        report += '\n--- RECOMMENDATION ---\n';
        if (efficiencyGap.predictedEfficiencyLoss > 1.0) {
            report += '🔴 CRITICAL: Efficiency loss > 1%. Recommend immediate geometry correction.\n';
            report += `   Expected payback: ${efficiencyGap.paybackMonths.toFixed(1)} months.\n`;
        } else if (efficiencyGap.predictedEfficiencyLoss > 0.5) {
            report += '🟡 MODERATE: Efficiency loss 0.5-1%. Plan correction during next major overhaul.\n';
        } else {
            report += '✅ ACCEPTABLE: Efficiency loss < 0.5%. Continue monitoring.\n';
        }

        return report;
    }

    /**
     * Bluetooth sync for dial indicator / comparator readings
     * For alignment wizard during commissioning
     */
    static async syncBluetoothIndicator(
        deviceId: string
    ): Promise<number> {
        console.log(`📲 Connecting to Bluetooth indicator: ${deviceId}`);

        // In production: Use Web Bluetooth API
        /*
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['dial_indicator_service'] }]
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('dial_indicator_service');
        const characteristic = await service.getCharacteristic('runout_measurement');
        const value = await characteristic.readValue();
        return value.getFloat32(0, true); // Little-endian float
        */

        // Mock for development
        const mockReading = 0.045 + Math.random() * 0.01; // mm
        console.log(`   Reading: ${mockReading.toFixed(3)} mm`);

        return mockReading;
    }
}

// ===== IDEAL BLUEPRINT EXAMPLES =====

export const FRANCIS_IDEAL_BLUEPRINT: IdealBlueprint = {
    turbineFamily: 'francis',
    variant: 'francis_vertical',
    geometryPoints: [
        { name: 'Spiral Case Inlet', x: 1500.000, y: 2000.000, z: 500.000, tolerance: 2.0 },
        { name: 'Spiral Case Section A', x: 1450.000, y: 1980.000, z: 490.000, tolerance: 1.5 },
        { name: 'Stay Ring Bolt Hole 1', x: 1200.000, y: 1800.000, z: 450.000, tolerance: 0.5 },
        // ... 100+ points
    ]
};
