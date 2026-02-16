// Lifecycle Manager Service
// Orchestrates the transition between project phases and ensures data integrity

import { ProjectDNA, ProjectPhase, GenesisData, BuildData, OperationsData } from '../models/ProjectLifecycle';
import { StrategicPlanningService } from './StrategicPlanningService';
import { TurbineFactory } from '../models/turbine/TurbineFactory';

export class LifecycleManager {
    private static currentProject: ProjectDNA | null = null;

    /**
     * Start a new project (Genesis Phase)
     */
    static initializeProject(name: string, location: { lat: number; lng: number; region: string }): ProjectDNA {
        const projectRef = `PROJ-${Date.now().toString(36).toUpperCase()}`;
        const id = Date.now(); // numeric asset id for ProjectIdentity

        // Default scaffolding
        this.currentProject = {
            identity: {
                assetId: id,
                assetName: name,
                location,
                createdDate: Date.now()
            },
            currentPhase: 'GENESIS',
            genesis: {
                siteParams: { // Default defaults
                    grossHead: 50,
                    pipeLength: 500,
                    pipeDiameter: 1200,
                    pipeMaterial: 'STEEL',
                    // Cerebro Defaults
                    wallThickness: 12,
                    boltClass: '8.8',
                    corrosionProtection: 'PAINT',

                    waterQuality: 'CLEAN',
                    flowDurationCurve: [],
                    ecologicalFlow: 0.1
                },
                feasibility: {
                    netHead: 0,
                    frictionLoss: 0,
                    optimalFlow: 0,
                    annualProductionMWh: 0,
                    recommendedAggregates: { count: 1, type: 'Francis', reasoning: '' }
                },
                regulatoryStatus: new Map()
            },
            build: {
                selectedTurbineType: 'FRANCIS', // default
                manufacturer: '',
                constructionProgress: 0,
                hardwareSpec: { // To be filled from Bid
                    ratedHead: 0,
                    ratedFlow: 0,
                    ratedPower: 0,
                    maxRunawaySpeed: 0,
                    guideVaneCount: 0,
                    runnerBladeCount: 0,
                    bearingType: 'Segmental',
                    coolingSystem: 'Water'
                }
            },
            operations: {
                totalRunningHours: 0,
                totalCycles: 0,
                currentAlerts: [],
                healthScore: 100
            },
            forensics: {
                incidentHistory: []
            }
        };

        this.saveState();
        return this.currentProject!;
    }

    private static saveState() {
        if (this.currentProject) {
            localStorage.setItem('ProjectDNA', JSON.stringify(this.currentProject));
        }
    }

    private static loadState() {
        const saved = localStorage.getItem('ProjectDNA');
        if (saved) {
            try {
                this.currentProject = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load ProjectDNA', e);
            }
        }
    }

    /**
     * GET ACTIVE PROJECT
     */
    static getActiveProject(): ProjectDNA {
        if (!this.currentProject) {
            this.loadState();
        }

        if (!this.currentProject) {
            // Auto-create if missing (for demo purposes)
            return this.initializeProject('Demo Hydro Plant', { lat: 43.85, lng: 18.41, region: 'Balkan' });
        }
        return this.currentProject!;
    }

    /**
     * TRANSITION: GENESIS -> PROCUREMENT
     * Validates feasibility before allowing procurement
     */
    static advanceToProcurement(): { success: boolean; errors: string[] } {
        const proj = this.getActiveProject();
        const errors = [];

        if (proj.genesis.feasibility.annualProductionMWh <= 0) {
            errors.push('Hydraulic Feasibility not calculated.');
        }

        // Logic: Cannot proceed if Regulatory Status is blocking
        // (Simulated check)

        if (errors.length === 0) {
            proj.currentPhase = 'PROCUREMENT';
            this.saveState();
            return { success: true, errors: [] };
        }

        return { success: false, errors };
    }

    /**
     * TRANSITION: PROCUREMENT -> CONSTRUCTION
     * Applies the selected bid params to the Hardware Spec
     */
    static confirmProcurement(winningBid: any): boolean {
        const proj = this.getActiveProject();

        proj.build.selectedBid = winningBid;
        proj.build.selectedTurbineType = winningBid.turbineType;
        proj.build.manufacturer = winningBid.manufacturer;

        // Map Bid to HardwareSpec (Critical for Operations Phase!)
        proj.build.hardwareSpec = {
            ratedHead: proj.genesis.siteParams.grossHead, // Approx
            ratedPower: winningBid.ratedPowerMW,
            ratedFlow: 0, // Would derive from P = rho*g*Q*H*eta
            maxRunawaySpeed: 0, // Vendor data
            guideVaneCount: winningBid.turbineType === 'francis' ? 24 : 0, // Defaults
            runnerBladeCount: winningBid.turbineType === 'kaplan' ? 6 : 15,
            bearingType: 'Segmental',
            coolingSystem: 'Water'
        };

        proj.currentPhase = 'CONSTRUCTION';
        this.saveState();
        return true;
    }

    /**
     * TRANSITION: CONSTRUCTION -> OPERATIONS
     * Finalizes the "Twin" setup
     */
    static commissionPlant(): boolean {
        const proj = this.getActiveProject();

        // Initialize Baseline Data
        proj.commissioning = {
            baselineFingerprints: {
                vibrationSpectrum: {},
                acousticSignature: {},
                thermalMap: {}
            },
            performanceTestResults: {
                actualEfficiency: proj.build.selectedBid?.efficiencyAtBestPoint || 90,
                maxOutput: proj.build.hardwareSpec.ratedPower,
                vibrationAtNominal: 0.5
            },
            acceptedConstraints: ['Avoid 45-55% load (Vortex)']
        };

        proj.currentPhase = 'OPERATIONS';
        this.saveState();
        return true;
    }

    /**
     * UPDATE OPERATIONS DATA
     */
    static updateOperations(telemetry: any) {
        // This would be called by the telemetry ingestion service
        if (this.currentProject) {
            // Update running hours, etc.
        }
    }
}
