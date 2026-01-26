/**
 * DamStabilityService.ts
 * 
 * Dam Safety Factor Calculation
 * Monitors structural stability based on water levels and pore pressures
 */

export interface DamStabilityData {
    waterLevel: number; // m above foundation
    piezometricPressures: number[]; // bar at various depths
    seepageRate: number; // L/s
    concreteTemperature: number; // °C
    pendulumDisplacements: number[]; // mm
}

export interface StabilityAnalysis {
    safetyFactor: number;
    status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WARNING' | 'CRITICAL';
    evacuationRequired: boolean;
    warnings: string[];
    recommendations: string[];
}

export class DamStabilityService {

    // Design parameters (would be from dam specifications)
    private static readonly DAM_HEIGHT = 100; // meters
    private static readonly DAM_BASE_WIDTH = 80; // meters
    private static readonly CONCRETE_DENSITY = 2400; // kg/m³
    private static readonly WATER_DENSITY = 1000; // kg/m³
    private static readonly MAX_DISPLACEMENT_THRESHOLD = 15; // mm
    private static readonly MAX_SEEPAGE_RATE = 50; // L/s

    /**
     * Calculate dam safety factor
     * 
     * Safety Factor (FS) = Resisting Forces / Driving Forces
     * FS > 1.5: Excellent
     * FS > 1.2: Acceptable
     * FS < 1.2: Warning
     * FS < 1.0: Critical (failure imminent)
     */
    public static calculateSafetyFactor(data: DamStabilityData): StabilityAnalysis {
        // Simplified gravity dam analysis
        const waterPressure = this.calculateWaterPressure(data.waterLevel);
        const upliftPressure = this.calculateUpliftPressure(data.piezometricPressures);
        const concreteWeight = this.calculateConcreteWeight();

        // Resisting moment (weight × distance from toe)
        const resistingMoment = concreteWeight * (this.DAM_BASE_WIDTH / 2);

        // Driving moment (water pressure × height/3 - hydrostatic pressure distribution)
        const drivingMoment = waterPressure * (data.waterLevel / 3);

        // Uplift reduces effective weight
        const effectiveWeight = concreteWeight - upliftPressure;

        // Safety factor against overturning
        const safetyFactor = (effectiveWeight > 0 && drivingMoment > 0)
            ? resistingMoment / drivingMoment
            : 0;

        // Analyze stability
        return this.analyzeStability(safetyFactor, data);
    }

    /**
     * Calculate water pressure force
     */
    private static calculateWaterPressure(waterLevel: number): number {
        // Hydrostatic pressure: P = 0.5 × ρ × g × h²
        const g = 9.81; // m/s²
        return 0.5 * this.WATER_DENSITY * g * waterLevel * waterLevel;
    }

    /**
     * Calculate uplift pressure from piezometers
     */
    private static calculateUpliftPressure(piezometricPressures: number[]): number {
        if (piezometricPressures.length === 0) return 0;

        // Average pore pressure
        const avgPressure = piezometricPressures.reduce((sum, p) => sum + p, 0) / piezometricPressures.length;

        // Uplift force = average pressure × base area (simplified)
        const baseArea = this.DAM_BASE_WIDTH * 1; // per meter width
        return avgPressure * 100000 * baseArea; // bar to Pa conversion
    }

    /**
     * Calculate concrete weight
     */
    private static calculateConcreteWeight(): number {
        // Simplified: trapezoidal cross-section
        const volume = 0.5 * (this.DAM_BASE_WIDTH + 10) * this.DAM_HEIGHT * 1; // per meter width
        const g = 9.81;
        return this.CONCRETE_DENSITY * volume * g;
    }

    /**
     * Analyze overall stability
     */
    private static analyzeStability(safetyFactor: number, data: DamStabilityData): StabilityAnalysis {
        const warnings: string[] = [];
        const recommendations: string[] = [];
        let status: StabilityAnalysis['status'];
        let evacuationRequired = false;

        // Safety factor assessment
        if (safetyFactor >= 1.5) {
            status = 'EXCELLENT';
        } else if (safetyFactor >= 1.2) {
            status = 'GOOD';
            warnings.push(`Safety factor at minimum acceptable level (${safetyFactor.toFixed(2)})`);
        } else if (safetyFactor >= 1.0) {
            status = 'WARNING';
            warnings.push(`Safety factor below design standard (${safetyFactor.toFixed(2)} < 1.2)`);
            recommendations.push('Reduce reservoir level by 10%');
            recommendations.push('Schedule immediate structural inspection');
        } else {
            status = 'CRITICAL';
            evacuationRequired = true;
            warnings.push(`CRITICAL: Safety factor below 1.0 (${safetyFactor.toFixed(2)})`);
            warnings.push('STRUCTURAL FAILURE RISK - IMMEDIATE ACTION REQUIRED');
            recommendations.push('EMERGENCY: Lower reservoir level immediately');
            recommendations.push('EVACUATE downstream areas');
            recommendations.push('Alert civil authorities');
        }

        // Displacement checks
        const maxDisplacement = Math.max(...data.pendulumDisplacements);
        if (maxDisplacement > this.MAX_DISPLACEMENT_THRESHOLD) {
            warnings.push(`Excessive displacement detected: ${maxDisplacement.toFixed(1)} mm (threshold: ${this.MAX_DISPLACEMENT_THRESHOLD} mm)`);
            recommendations.push('Increase monitoring frequency to hourly');

            if (maxDisplacement > this.MAX_DISPLACEMENT_THRESHOLD * 1.5) {
                evacuationRequired = true;
                status = 'CRITICAL';
            }
        }

        // Seepage checks
        if (data.seepageRate > this.MAX_SEEPAGE_RATE) {
            warnings.push(`Excessive seepage: ${data.seepageRate.toFixed(1)} L/s (max: ${this.MAX_SEEPAGE_RATE} L/s)`);
            recommendations.push('Inspect foundation drains and grout curtain');

            if (data.seepageRate > this.MAX_SEEPAGE_RATE * 1.5) {
                status = status === 'CRITICAL' ? status : 'WARNING';
            }
        }

        // Uplift pressure check
        const avgPorePressure = data.piezometricPressures.reduce((sum, p) => sum + p, 0) / data.piezometricPressures.length;
        if (avgPorePressure > 5.0) { // >5 bar is concerning
            warnings.push(`High pore pressure: ${avgPorePressure.toFixed(2)} bar`);
            recommendations.push('Verify drainage system operation');
        }

        return {
            safetyFactor,
            status,
            evacuationRequired,
            warnings,
            recommendations
        };
    }

    /**
     * Trigger evacuation protocol
     */
    public static triggerEvacuationProtocol(analysis: StabilityAnalysis): void {
        if (!analysis.evacuationRequired) return;

        console.log('\n' + '═'.repeat(80));
        console.log('🚨 EVACUATION PROTOCOL ADVISORY ACTIVATED 🚨');
        console.log('═'.repeat(80));
        console.log(`Safety Factor: ${analysis.safetyFactor.toFixed(3)}`);
        console.log(`Status: ${analysis.status}`);
        console.log('\nWARNINGS:');
        analysis.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
        console.log('\nRECOMMENDATIONS:');
        analysis.recommendations.forEach(r => console.log(`  →  ${r}`));
        console.log('═'.repeat(80));

        // In production: Trigger actual emergency response
        // - Alert civil defense
        // - Activate sirens
        // - Send SMS to downstream residents
        // - Notify emergency services
    }
}
