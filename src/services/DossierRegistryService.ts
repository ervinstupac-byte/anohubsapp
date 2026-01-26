/**
 * DossierRegistryService.ts (NC-76.1)
 * 
 * Centralized lazy-loading accessor for ExpertDossierRegistry.
 * Implements on-demand loading with caching for optimal TTI.
 * 
 * IEC 60041 Compliant | ISO 10816-5 Mapped
 */

// ============================================================================
// TYPES
// ============================================================================

export type TurbineSubsystem = 'RUNNER' | 'GUIDE_VANE' | 'DRAFT_TUBE' | 'BEARING' | 'SEAL';
export type TurbineVariant = 'BULB' | 'PIT' | 'S_TYPE_KAPLAN' | 'FRANCIS' | 'PELTON';
export type PhysicsModelType = 'JOUKOWSKY' | 'THOMA' | 'ISO_10816_5' | 'BERNOULLI' | 'DARCY_WEISBACH';
export type IECCompliance = 'IEC_60041' | 'IEC_61850' | 'ISO_10816';

export interface PhysicsModelRef {
    primary: PhysicsModelType;
    iecCompliance: IECCompliance;
}

export interface ThresholdConfig {
    nominal: Record<string, number>;
    warning: Record<string, number>;
    critical: Record<string, number>;
}

export interface RemediationPlan {
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    action: string;
}

export interface ExpertDossier {
    DossierID: string;
    Subsystem: TurbineSubsystem;
    TurbineType: TurbineVariant;
    PhysicsModel: PhysicsModelRef;
    Thresholds: ThresholdConfig;
    Symptoms: string[];
    Diagnosis: string;
    Remediation: RemediationPlan;
}

export interface DossierRegistryMeta {
    version: string;
    protocol: string;
    lastUpdated: string;
    compliance: string[];
    totalEntries: number;
}

export interface PhysicsModelDefinition {
    equation: string;
    description: string;
    variables: Record<string, string>;
}

export interface DossierRegistry {
    meta: DossierRegistryMeta;
    physicsModels: Record<string, PhysicsModelDefinition | { zones: Record<string, unknown> }>;
    dossiers: ExpertDossier[];
}

// ============================================================================
// SERVICE
// ============================================================================

export class DossierRegistryService {
    private static instance: DossierRegistryService;
    private registry: DossierRegistry | null = null;
    private loadPromise: Promise<DossierRegistry> | null = null;
    private cache: Map<string, ExpertDossier> = new Map();

    private constructor() { }

    public static getInstance(): DossierRegistryService {
        if (!DossierRegistryService.instance) {
            DossierRegistryService.instance = new DossierRegistryService();
        }
        return DossierRegistryService.instance;
    }

    /**
     * Lazy load the registry on first access
     */
    async loadRegistry(): Promise<DossierRegistry> {
        if (this.registry) return this.registry;

        if (!this.loadPromise) {
            this.loadPromise = import('../data/ExpertDossierRegistry.json')
                .then((module) => {
                    this.registry = module.default as unknown as DossierRegistry;
                    console.log(`[DossierRegistry] Loaded ${this.registry.dossiers.length} dossiers`);
                    return this.registry;
                });
        }

        return this.loadPromise;
    }

    /**
     * Get a specific dossier by ID (cached after first load)
     */
    async getDossier(id: string): Promise<ExpertDossier | null> {
        if (this.cache.has(id)) {
            return this.cache.get(id) || null;
        }

        const registry = await this.loadRegistry();
        const dossier = registry.dossiers.find(d => d.DossierID === id);

        if (dossier) {
            this.cache.set(id, dossier);
        }

        return dossier || null;
    }

    /**
     * Query dossiers by turbine type and subsystem
     */
    async queryDossiers(
        turbineType?: TurbineVariant,
        subsystem?: TurbineSubsystem
    ): Promise<ExpertDossier[]> {
        const registry = await this.loadRegistry();

        return registry.dossiers.filter(d => {
            const typeMatch = !turbineType || d.TurbineType === turbineType;
            const subsystemMatch = !subsystem || d.Subsystem === subsystem;
            return typeMatch && subsystemMatch;
        });
    }

    /**
     * Get physics model definition
     */
    async getPhysicsModel(modelType: PhysicsModelType): Promise<PhysicsModelDefinition | null> {
        const registry = await this.loadRegistry();
        const model = registry.physicsModels[modelType];
        return (model && 'equation' in model) ? model as PhysicsModelDefinition : null;
    }

    /**
     * Calculate Joukowsky water hammer pressure rise
     * ΔH = (a × Δv) / g
     */
    calculateJoukowsky(waveSpeed_m_s: number, velocityChange_m_s: number): number {
        const g = 9.81;
        return (waveSpeed_m_s * velocityChange_m_s) / g;
    }

    /**
     * Calculate Thoma cavitation coefficient
     * σ = NPSH / H
     */
    calculateThoma(npsh_m: number, head_m: number): number {
        if (head_m === 0) return 0;
        return npsh_m / head_m;
    }

    /**
     * Get ISO 10816-5 vibration severity zone
     */
    getVibrationZone(vibration_mm_s: number): 'A' | 'B' | 'C' | 'D' {
        if (vibration_mm_s <= 2.8) return 'A';
        if (vibration_mm_s <= 7.1) return 'B';
        if (vibration_mm_s <= 11.2) return 'C';
        return 'D';
    }

    /**
     * Find matching dossiers for symptoms
     */
    async findBySymptom(symptomKeyword: string): Promise<ExpertDossier[]> {
        const registry = await this.loadRegistry();
        const keyword = symptomKeyword.toLowerCase();

        return registry.dossiers.filter(d =>
            d.Symptoms.some(s => s.toLowerCase().includes(keyword))
        );
    }
}

// Export singleton
export const dossierRegistry = DossierRegistryService.getInstance();
