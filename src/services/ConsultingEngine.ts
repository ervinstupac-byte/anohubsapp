// Consulting Engine for Optimization Reports
// Generates ROI-based reconstruction recommendations from special measurements

import {
    SpecialMeasurement,
    Finding,
    Recommendation,
    OptimizationReport,
    CompleteSensorData,
    ITurbineModel,
    ToleranceMap
} from '../models/turbine/types';
import { EnhancedAsset } from '../models/turbine/types';

export class ConsultingEngine {
    /**
     * Generates comprehensive optimization report
     * Combines geodetic, vibration, thermography, and operating data
     */
    static generateOptimizationReport(
        asset: EnhancedAsset,
        turbineModel: ITurbineModel,
        measurements: SpecialMeasurement[],
        operatingHistory: CompleteSensorData[]
    ): OptimizationReport {
        const findings: Finding[] = [];

        // 1. GEODETSKA MJERENJA (Alignment Analysis)
        const geodeticMeasurements = measurements.filter(m => m.type === 'geodetic');
        if (geodeticMeasurements.length > 0) {
            findings.push(...this.analyzeAlignment(
                geodeticMeasurements,
                turbineModel.getTolerances(),
                asset.turbine_family
            ));
        }

        // 2. VIBRACIONA ANALIZA
        const vibrationMeasurements = measurements.filter(m => m.type === 'vibration');
        if (vibrationMeasurements.length > 0) {
            findings.push(...this.analyzeVibration(
                vibrationMeasurements,
                turbineModel,
                operatingHistory,
                asset.turbine_family
            ));
        }

        // 3. TERMOGRAFIJA (Thermal Hotspots)
        const thermoMeasurements = measurements.filter(m => m.type === 'thermography');
        if (thermoMeasurements.length > 0) {
            findings.push(...this.analyzeThermalSignature(
                thermoMeasurements,
                asset.turbine_family
            ));
        }

        // 4. OIL ANALYSIS
        const oilMeasurements = measurements.filter(m => m.type === 'oil_analysis');
        if (oilMeasurements.length > 0) {
            findings.push(...this.analyzeOilQuality(oilMeasurements));
        }

        // 5. PRIORITIZE RECOMMENDATIONS
        const recommendations = this.prioritizeReconstructionOptions(findings, asset);

        // 6. CALCULATE ROI
        const totalROI = this.calculateROI(recommendations);

        return {
            assetId: asset.id,
            assetName: asset.name,
            turbineFamily: asset.turbine_family,
            generatedAt: Date.now(),
            findings,
            recommendations,
            estimatedROI: totalROI,
            executionPriority: this.rankByRisk(recommendations)
        };
    }

    // ===== ANALYSIS METHODS =====

    private static analyzeAlignment(
        measurements: SpecialMeasurement[],
        tolerances: ToleranceMap,
        turbineFamily: string
    ): Finding[] {
        const findings: Finding[] = [];
        const latest = measurements[measurements.length - 1];

        // Extract geodetic data
        const shaftDeviation = latest.data?.shaft_deviation || 0; // mm/m
        const foundationSettlement = latest.data?.foundation_settlement || 0; // mm

        const alignmentTolerance = tolerances.shaft_alignment?.value || 0.05;

        if (shaftDeviation > alignmentTolerance) {
            const excessDeviation = shaftDeviation - alignmentTolerance;
            const severityLevel: any = excessDeviation > 0.1 ? 'CRITICAL' : excessDeviation > 0.03 ? 'HIGH' : 'MEDIUM';

            findings.push({
                severity: severityLevel,
                category: 'ALIGNMENT',
                description: `Shaft deviation ${shaftDeviation.toFixed(3)} mm/m exceeds tolerance ${alignmentTolerance} mm/m by ${excessDeviation.toFixed(3)} mm/m`,
                suggestedAction: severityLevel === 'CRITICAL'
                    ? 'URGENT: Emergency shutdown required. Complete realignment before restart. Foundation may be compromised.'
                    : 'Schedule precision realignment during next planned outage. Monitor vibration trends closely.',
                estimatedRepairCost: severityLevel === 'CRITICAL' ? 150000 : 75000,
                riskMitigation: 250000 // Avoided bearing failure + unplanned downtime
            });
        }

        if (foundationSettlement > 2.0) {
            findings.push({
                severity: 'HIGH',
                category: 'ALIGNMENT',
                description: `Foundation settlement detected: ${foundationSettlement.toFixed(1)} mm. Progressive alignment degradation likely.`,
                suggestedAction: 'Geotechnical survey required. Foundation grouting or underpinning may be necessary. Monitor quarterly.',
                estimatedRepairCost: 200000,
                riskMitigation: 500000 // Major structural failure avoided
            });
        }

        return findings;
    }

    private static analyzeVibration(
        measurements: SpecialMeasurement[],
        turbineModel: ITurbineModel,
        operatingHistory: CompleteSensorData[],
        turbineFamily: string
    ): Finding[] {
        const findings: Finding[] = [];
        const latest = measurements[measurements.length - 1];

        const vibrationLevel = latest.data?.rms_vibration || 0; // mm/s
        const dominantFrequency = latest.data?.dominant_frequency || 0; // Hz
        const runningSpeed = latest.data?.running_speed || 500; // RPM

        const tolerances = turbineModel.getTolerances();
        const vibrationLimit = tolerances.vibration_limit?.value || 4.5;

        if (vibrationLevel > vibrationLimit) {
            // Frequency analysis to diagnose root cause
            const rotationalFreq = runningSpeed / 60; // Hz
            const isRotationalFreq = Math.abs(dominantFrequency - rotationalFreq) < 0.5;
            const is2xFreq = Math.abs(dominantFrequency - (2 * rotationalFreq)) < 0.5;

            let diagnosis = 'Excessive vibration detected';
            let repairCost = 50000;

            if (isRotationalFreq) {
                diagnosis = 'Rotational frequency vibration (1x) - Unbalance or misalignment';
                repairCost = 30000; // Balancing + alignment
            } else if (is2xFreq) {
                diagnosis = '2x running speed vibration - Mechanical looseness or bearing wear';
                repairCost = 80000; // Bearing replacement
            } else if (dominantFrequency > 1000) {
                diagnosis = 'High frequency vibration - Possible cavitation or blade issues';
                if (turbineFamily === 'KAPLAN') {
                    diagnosis += '. Check blade tip clearance and hub mechanism.';
                    repairCost = 120000; // Runner inspection/repair
                } else if (turbineFamily === 'FRANCIS') {
                    diagnosis += '. Check runner for cavitation damage.';
                    repairCost = 150000; // Runner coating/repair
                }
            }

            findings.push({
                severity: vibrationLevel > (vibrationLimit * 1.5) ? 'CRITICAL' : 'HIGH',
                category: 'VIBRATION',
                description: `${diagnosis}. Measured: ${vibrationLevel.toFixed(2)} mm/s @ ${dominantFrequency.toFixed(1)} Hz`,
                suggestedAction: 'Perform detailed vibration diagnostics with FFT analysis. Shutdown if vibration exceeds 7.0 mm/s.',
                estimatedRepairCost: repairCost,
                riskMitigation: repairCost * 3 // Avoided catastrophic failure
            });
        }

        return findings;
    }

    private static analyzeThermalSignature(
        measurements: SpecialMeasurement[],
        turbineFamily: string
    ): Finding[] {
        const findings: Finding[] = [];
        const latest = measurements[measurements.length - 1];

        const bearingTemp = latest.data?.bearing_temp || 0;
        const generatorTemp = latest.data?.generator_temp || 0;
        const ambientTemp = latest.data?.ambient_temp || 25;

        // Bearing hotspot detection
        const bearingTempRise = bearingTemp - ambientTemp;
        if (bearingTempRise > 40) {
            findings.push({
                severity: bearingTempRise > 60 ? 'CRITICAL' : 'HIGH',
                category: 'THERMAL',
                description: `Bearing temperature ${bearingTemp}°C (rise: ${bearingTempRise}°C). Lubrication failure suspected.`,
                suggestedAction: bearingTempRise > 60
                    ? 'IMMEDIATE: Shutdown and inspect bearing. Check for oil contamination or inadequate flow.'
                    : 'Increase oil flow rate. Check oil cooler. Schedule bearing inspection.',
                estimatedRepairCost: 60000, // Bearing + oil system service
                riskMitigation: 200000 // Avoided bearing seizure
            });
        }

        // Generator overheating
        if (generatorTemp > 95) {
            findings.push({
                severity: 'HIGH',
                category: 'THERMAL',
                description: `Generator stator temperature ${generatorTemp}°C exceeds design limit.`,
                suggestedAction: 'Reduce load. Check cooling water flow and air filters. Inspect for blocked cooling ducts.',
                estimatedRepairCost: 80000,
                riskMitigation: 300000 // Avoided generator rewind
            });
        }

        return findings;
    }

    private static analyzeOilQuality(measurements: SpecialMeasurement[]): Finding[] {
        const findings: Finding[] = [];
        const latest = measurements[measurements.length - 1];

        const waterContent = latest.data?.water_content || 0; // ppm
        const particleCount = latest.data?.particle_count || 0; // particles > 4µm per ml
        const viscosity = latest.data?.viscosity || 46; // cSt

        if (waterContent > 500) {
            findings.push({
                severity: 'HIGH',
                category: 'HYDRAULIC',
                description: `Oil water contamination: ${waterContent} ppm. Risk of servo valve corrosion and emulsification.`,
                suggestedAction: 'Replace oil. Inspect seals and breathers for water ingress points. Install desiccant breather.',
                estimatedRepairCost: 15000,
                riskMitigation: 50000 // Avoided servo system failure
            });
        }

        if (particleCount > 5000) {
            findings.push({
                severity: 'MEDIUM',
                category: 'HYDRAULIC',
                description: `High particle count: ${particleCount}/ml. Filtration system inadequate or wear debris accumulating.`,
                suggestedAction: 'Install finer filters (ISO 16/14/11 target). Flush system. Check for pump wear.',
                estimatedRepairCost: 10000,
                riskMitigation: 40000
            });
        }

        return findings;
    }

    // ===== RECOMMENDATION GENERATION =====

    private static prioritizeReconstructionOptions(
        findings: Finding[],
        asset: EnhancedAsset
    ): Recommendation[] {
        const recommendations: Recommendation[] = [];

        findings.forEach(finding => {
            const paybackPeriod = finding.estimatedRepairCost / (finding.riskMitigation / 12); // months
            const priority = this.calculatePriority(finding.severity, paybackPeriod);

            recommendations.push({
                title: finding.category === 'ALIGNMENT'
                    ? `Precision Realignment - ${asset.name}`
                    : finding.category === 'VIBRATION'
                        ? `Vibration Remediation - ${asset.name}`
                        : `${finding.category} Intervention - ${asset.name}`,
                action: finding.suggestedAction,
                estimatedCost: finding.estimatedRepairCost,
                expectedBenefit: finding.riskMitigation,
                paybackPeriod,
                priority
            });
        });

        // Sort by ROI (benefit / cost ratio)
        return recommendations.sort((a, b) =>
            (b.expectedBenefit / b.estimatedCost) - (a.expectedBenefit / a.estimatedCost)
        );
    }

    private static calculatePriority(severity: string, paybackMonths: number): number {
        let basePriority = 3;

        if (severity === 'CRITICAL') basePriority = 1;
        else if (severity === 'HIGH') basePriority = 2;
        else if (severity === 'MEDIUM') basePriority = 3;
        else basePriority = 4;

        // Adjust for payback period (faster payback = higher priority)
        if (paybackMonths < 6) basePriority = Math.max(1, basePriority - 1);
        else if (paybackMonths > 24) basePriority = Math.min(5, basePriority + 1);

        return basePriority;
    }

    private static calculateROI(recommendations: Recommendation[]): number {
        const totalCost = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0);
        const totalBenefit = recommendations.reduce((sum, r) => sum + r.expectedBenefit, 0);

        if (totalCost === 0) return 0;
        return ((totalBenefit - totalCost) / totalCost) * 100; // ROI percentage
    }

    private static rankByRisk(recommendations: Recommendation[]): Recommendation[] {
        return [...recommendations].sort((a, b) => a.priority - b.priority);
    }
}
