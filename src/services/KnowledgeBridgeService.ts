// Knowledge Bridge Service
// The intelligence layer that connects Genesis (Planning) to Operations

import { ProjectDNA } from '../models/ProjectLifecycle';

export interface OperationalBaseline {
    runnerInspectionIntervalHours: number;
    expectedEfficiencyDropPerYear: number;
    allowableVibrationLimit: number; // mm/s
    revenueImpactPerHourDowntime: number; // EUR
}

export class KnowledgeBridgeService {

    /**
     * DERIVE OPERATIONAL BASELINES FROM GENESIS DATA
     * This is the core "Bridge" logic
     */
    static deriveBaselines(project: ProjectDNA): OperationalBaseline {
        const genesis = project.genesis;
        const build = project.build;

        // 1. Runner Inspection Interval (Abrasiveness Logic)
        let baseInterval = 8000; // Standard 1 year
        const quality = genesis.siteParams.waterQuality || 'CLEAN';

        switch (quality) {
            case 'GLACIAL':
                baseInterval = 4000; // Glacial flour is extremely abrasive
                break;
            case 'SAND':
                baseInterval = 5000;
                break;
            case 'SILT':
                baseInterval = 6500;
                break;
            case 'CLEAN':
            default:
                baseInterval = 8000;
        }

        // Adjust based on Head (Higher head = Higher velocity = More erosion)
        if (genesis.siteParams.grossHead > 200) { // High head Pelton/Francis
            baseInterval *= 0.8;
        }

        // 2. Efficiency Drop Prediction
        // Abrasive water kills efficiency faster
        let effDrop = 0.5; // % per year
        if (quality !== 'CLEAN') effDrop = 1.2;

        // 3. Allowable Vibration (Precision link)
        // If we know the foundation is rocky (from Genesis logs - mocked here), we might be stricter?
        // Let's rely on Turbine Type
        let vibrationLimit = 2.5; // ISO standard
        if (build.selectedTurbineType === 'pelton') vibrationLimit = 1.5; // Stricter for Pelton

        // 4. Financial Link (Economics)
        // Revenue = Power * Price
        // Using Rated Power from Build spec
        const powerMW = build.hardwareSpec.ratedPower || 1;
        const price = 85; // EUR/MWh (Standard assumed or fetched)
        const revenuePerHour = powerMW * price;

        return {
            runnerInspectionIntervalHours: Math.round(baseInterval),
            expectedEfficiencyDropPerYear: effDrop,
            allowableVibrationLimit: vibrationLimit,
            revenueImpactPerHourDowntime: revenuePerHour
        };
    }

    /**
     * GENERATE SMART MAINTENANCE SCHEDULE
     */
    static getSmartSchedule(project: ProjectDNA): { action: string; dueInHours: number; reason: string }[] {
        const baselines = this.deriveBaselines(project);
        const currentRunHours = project.operations.totalRunningHours;

        const schedule = [];

        // Runner Inspection
        const hoursUntilInspection = baselines.runnerInspectionIntervalHours - (currentRunHours % baselines.runnerInspectionIntervalHours);
        schedule.push({
            action: 'Runner Erosion Inspection',
            dueInHours: hoursUntilInspection,
            reason: `Water Quality is '${project.genesis.siteParams.waterQuality || 'UNKNOWN'}'. Genereated interval: ${baselines.runnerInspectionIntervalHours}h.`
        });

        // Economic Impact Alert
        if (hoursUntilInspection < 100) {
            schedule.push({
                action: 'PREPARE REVENUE OFFSET',
                dueInHours: 0,
                reason: `Upcoming downtime will cost €${baselines.revenueImpactPerHourDowntime.toFixed(0)}/hr. Ensure parts are ready to minimize loss.`
            });
        }

        return schedule;
    }
}
