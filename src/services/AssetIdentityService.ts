/**
 * AssetIdentity Service
 * Auto-calculation logic for Digital Twin parameters
 */

import {
    AssetIdentity,
    TurbineType,
    SpecializedAdvancedModule,
    FluidIntelligence,
    EnvironmentalBaseline,
    OperatingPoint,
    OperationalMapping,
    SensorMatrix,
    UpgradeRecommendation
} from '../types/assetIdentity';

export class AssetIdentityService {

    /**
     * Calculate Axial Thrust Balance for specialized turbines (e.g. Francis)
     */
    static calculateAxialThrustBalance(specialized: SpecializedAdvancedModule): {
        balanced: boolean;
        pressureDifference: number;
    } {
        const diff = Math.abs(
            specialized.draftTubePressure.nominalBar -
            specialized.backRunnerPressure.nominalBar
        );

        return {
            balanced: diff < 0.2,  // ±0.2 bar tolerance
            pressureDifference: diff
        };
    }

    /**
     * Calculate HPU Health Score (0-100)
     */
    static calculateHPUHealth(fluid: FluidIntelligence): number {
        let score = 100;

        // Deduct for old oil
        const oilAge = fluid.oilSystem.currentHours / fluid.oilSystem.changeIntervalHours;
        if (oilAge > 1.2) score -= 30;
        else if (oilAge > 1.0) score -= 15;
        else if (oilAge > 0.8) score -= 5;

        // Deduct for clogged filter
        if (fluid.filterSystem.filterClogged) score -= 20;

        // Deduct for excessive bearing heat
        if (fluid.temperatureCorrelation.excessiveHeatDetected) score -= 25;

        return Math.max(0, score);
    }

    /**
     * Check if filter is clogged
     */
    static checkFilterClogged(deltaPBar: number, alarmThreshold: number): boolean {
        return deltaPBar > alarmThreshold;
    }

    /**
     * Check for excessive heat in bearings
     */
    static checkExcessiveHeat(
        ambientC: number,
        bearingTemps: number[]
    ): boolean {
        const maxBearingTemp = Math.max(...bearingTemps);
        return (maxBearingTemp - ambientC) > 40;  // More than 40°C above ambient
    }

    /**
     * Calculate Erosion Risk Score (0-10)
     */
    static calculateErosionRisk(env: EnvironmentalBaseline): number {
        let risk = 0;

        // No sludge cleaner = +5 risk
        if (!env.sludgeRemoval.hasSludgeCleaner) {
            risk += 5;
        }

        // High sediment content
        if (env.waterQuality.sedimentContentMGL > 100) {
            risk += 3;
        } else if (env.waterQuality.sedimentContentMGL > 50) {
            risk += 2;
        }

        // Abrasivity index
        switch (env.waterQuality.abrasivityIndex) {
            case 'EXTREME':
                risk += 2;
                break;
            case 'HIGH':
                risk += 1;
                break;
        }

        return Math.min(10, risk);
    }

    /**
     * Calculate operating point efficiency
     */
    static calculateEfficiency(
        powerMW: number,
        headM: number,
        flowM3S: number
    ): number {
        // η = P / (ρ * g * Q * H) * 100
        // Where: ρ = 1000 kg/m³, g = 9.81 m/s²
        const theoreticalPowerKW = 9.81 * flowM3S * headM * 1000;  // in kW
        const actualPowerKW = powerMW * 1000;

        const efficiency = (actualPowerKW / theoreticalPowerKW) * 100;
        return Math.min(100, Math.max(0, efficiency));
    }

    /**
     * Add operating point to mapping
     */
    static addOperatingPoint(
        mapping: OperationalMapping,
        vaneOpening: number,
        powerMW: number,
        headM: number,
        flowM3S: number
    ): OperationalMapping {
        const efficiency = this.calculateEfficiency(powerMW, headM, flowM3S);

        const newPoint: OperatingPoint = {
            timestamp: new Date().toISOString(),
            vaneOpeningPercent: vaneOpening,
            activePowerMW: powerMW,
            headM: headM,
            flowM3S: flowM3S,
            efficiency
        };

        const updatedPoints = [...mapping.operatingPoints, newPoint];

        // Calculate coverage (0-100% vane opening in 5% increments = 20 bins)
        const uniqueBins = new Set(
            updatedPoints.map(p => Math.round(p.vaneOpeningPercent / 5) * 5)
        );
        const coveragePercent = (uniqueBins.size / 20) * 100;

        // Find best efficiency point
        const bestPoint = updatedPoints.reduce((best, current) => {
            if (!current.efficiency) return best;
            if (!best || !best.efficiency || current.efficiency > best.efficiency) {
                return current;
            }
            return best;
        }, null as OperatingPoint | null);

        return {
            operatingPoints: updatedPoints,
            currentPoint: newPoint,
            hillChart: {
                dataPoints: updatedPoints.length,
                coveragePercent,
                lastUpdated: new Date().toISOString()
            },
            bestEfficiencyPoint: bestPoint ? {
                vaneOpeningPercent: bestPoint.vaneOpeningPercent,
                activePowerMW: bestPoint.activePowerMW,
                efficiency: bestPoint.efficiency!
            } : null
        };
    }

    /**
     * Generate upgrade recommendations for missing sensors
     */
    static generateUpgradeRecommendations(
        sensorMatrix: SensorMatrix,
        machineConfig: { orientation: string; transmissionType: string }
    ): UpgradeRecommendation[] {
        const recommendations: UpgradeRecommendation[] = [];

        // Check generator vibration sensors
        if (sensorMatrix.vibrationSensors.generator.length === 0) {
            recommendations.push({
                id: 'upgrade_vib_gen',
                category: 'VIBRATION',
                priority: 'HIGH',
                title: 'Install Generator Vibration Monitoring',
                description: 'Generator has no vibration sensors. Early detection of bearing failure can prevent catastrophic damage (avg. €25,000 emergency repair cost).',
                estimatedCostEUR: 3500,
                roi: 'Payback in 3 months through avoided emergency repairs',
                autoGenerated: true
            });
        }

        // Check turbine vibration sensors
        if (sensorMatrix.vibrationSensors.turbine.length === 0) {
            recommendations.push({
                id: 'upgrade_vib_turbine',
                category: 'VIBRATION',
                priority: 'CRITICAL',
                title: 'Install Turbine Vibration Monitoring',
                description: 'Turbine vibration monitoring essential for detecting cavitation, misalignment, and bearing wear.',
                estimatedCostEUR: 4200,
                roi: 'Prevents unplanned downtime (avg. €15,000/day revenue loss)',
                autoGenerated: true
            });
        }

        // Check gearbox sensors (if gearbox exists)
        if (machineConfig.transmissionType === 'GEARBOX') {
            if (!sensorMatrix.vibrationSensors.gearbox || sensorMatrix.vibrationSensors.gearbox.length === 0) {
                recommendations.push({
                    id: 'upgrade_vib_gearbox',
                    category: 'VIBRATION',
                    priority: 'HIGH',
                    title: 'Install Gearbox Vibration Monitoring',
                    description: 'Gearbox failures are expensive (€50,000+). Vibration monitoring provides 2-4 weeks advance warning.',
                    estimatedCostEUR: 3800,
                    roi: 'Single prevented gearbox failure pays for entire system',
                    autoGenerated: true
                });
            }
        }

        // Check bearing temperature sensors
        if (sensorMatrix.temperatureSensors.bearings.length < 2) {
            recommendations.push({
                id: 'upgrade_temp_bearings',
                category: 'TEMPERATURE',
                priority: 'MEDIUM',
                title: 'Add Bearing Temperature Sensors',
                description: 'Only ' + sensorMatrix.temperatureSensors.bearings.length + ' bearing temperature sensor(s) installed. Recommend minimum 4 (all critical bearings).',
                estimatedCostEUR: 1200,
                roi: 'Early detection of bearing failures, typical ROI 6 months',
                autoGenerated: true
            });
        }

        // Check powerhouse ambient temperature
        if (sensorMatrix.temperatureSensors.powerhouse.length === 0) {
            recommendations.push({
                id: 'upgrade_temp_ambient',
                category: 'TEMPERATURE',
                priority: 'LOW',
                title: 'Install Powerhouse Ambient Temperature Sensor',
                description: 'Ambient temperature correlation helps diagnose bearing overheating vs. environmental factors.',
                estimatedCostEUR: 350,
                roi: 'Improves diagnostic accuracy, prevents false alarms',
                autoGenerated: true
            });
        }

        return recommendations;
    }

    /**
     * Create default AssetIdentity template
     */
    static createDefaultIdentity(
        assetId: string,
        assetName: string,
        turbineType: TurbineType,
        createdBy: string
    ): AssetIdentity {
        const now = new Date().toISOString();

        return {
            assetId,
            assetName,
            turbineType,
            manufacturer: '',
            commissioningYear: new Date().getFullYear(),
            totalOperatingHours: 0,
            hoursSinceLastOverhaul: 0,
            startStopCount: 0,
            location: 'Station A',

            machineConfig: {
                orientation: 'HORIZONTAL',
                transmissionType: 'DIRECT',
                ratedPowerMW: 0,
                ratedSpeedRPM: 0,
                ratedHeadM: 0,
                ratedFlowM3S: 0,
                runnerDiameterMM: 0,
                numberOfBlades: 0
            },

            sensorMatrix: {
                vibrationSensors: {
                    generator: [],
                    turbine: []
                },
                temperatureSensors: {
                    bearings: [],
                    oilSystem: [],
                    powerhouse: []
                },
                pressureSensors: [],
                upgradeRecommendations: []
            },

            fluidIntelligence: {
                oilSystem: {
                    oilType: '',
                    oilCapacityLiters: 0,
                    currentHours: 0,
                    changeIntervalHours: 4000,
                    lastChangeDate: now,
                    nextChangeDue: now
                },
                filterSystem: {
                    filterType: '',
                    installDate: now,
                    deltaPBar: 0,
                    deltaPAlarmBar: 1.5,
                    filterClogged: false
                },
                temperatureCorrelation: {
                    powerhouseAmbientC: 20,
                    bearingTempsC: [],
                    excessiveHeatDetected: false
                },
                healthScore: 100
            },

            environmentalBaseline: {
                noiseLevel: {
                    operatingDB: 0,
                    locations: {
                        powerhouse: 0,
                        turbinePit: 0,
                        controlRoom: 0
                    },
                    regulatoryLimitDB: 85,
                    complianceStatus: 'COMPLIANT'
                },
                ambientTemperature: 20,
                relativeHumidity: 50,
                penstockType: 'STEEL',
                penstockDiameterMM: 0,
                penstockLengthM: 0,
                penstockThicknessMM: 0,
                sludgeRemoval: {
                    hasSludgeCleaner: false,
                    erosionRiskScore: 5
                },
                waterQuality: {
                    sedimentContentMGL: 0,
                    abrasivityIndex: 'LOW',
                    phLevel: 7.0
                }
            },

            operationalMapping: {
                operatingPoints: [],
                currentPoint: null,
                hillChart: {
                    dataPoints: 0,
                    coveragePercent: 0,
                    lastUpdated: now
                },
                bestEfficiencyPoint: null
            },

            createdAt: now,
            createdBy,
            lastUpdatedAt: now,
            version: '1.0'
        };
    }
}
