import { TFunction } from 'i18next';

export type TurbineType = 'pelton' | 'francis' | 'kaplan';

export class EngineeringError extends Error {
    constructor(public message: string, public turbineType?: TurbineType) {
        super(message);
        this.name = 'EngineeringError';
    }
}

export interface RecommendationResult {
    score: number;
    reasons: string[];
    notes?: string; // Additional notes for recommendation
}

export interface RiskResult {
    score: number;
    criticalCount: number;
}

export interface TurbineThresholds {
    high: string[];
    medium: string[];
}

export interface TurbineSpecs {
    runnerType: string;
    spiralCase?: string;
    draftTube?: string;
    jets?: number;
    housing?: string;
    material?: string;
    regulation?: string;
    mounting?: string;
    wicketGates?: string;
    specificSpeed: number;
    numberOfBlades?: number; // Kaplan specific
    hubSealMaterial?: string; // Kaplan specific
    type?: string; // Turbine type classification
}

export interface PenstockLossParams {
    length: number;
    diameter: number;
    roughness: number; // Manning's n
}

export interface ITurbineEngine {
    type: string;
    calculatePower(head: number, flow: number, efficiency: number, penstock?: PenstockLossParams): number;
    calculateFrictionLoss(head: number, flow: number, penstock: PenstockLossParams): number;
    calculateEnergy(powerMW: number, flowVariation: string): number;
    calculateSpecificSpeed(head: number, flow: number): number;
    calculateEfficiency(head: number, flow: number): number;
    getRecommendationScore(head: number, flow: number, variation: string, quality: string, t: TFunction): RecommendationResult;
    getToleranceThresholds(): Record<string, number>;
    generateSpecs(head: number, flow: number): TurbineSpecs;
    calculateRisk(answers: Record<string, string>, thresholds: Record<string, TurbineThresholds>): RiskResult;
}
