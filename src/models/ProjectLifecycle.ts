// Project DNA Model - The Single Source of Truth
// Flows data from initial concept to decommissioning

import { SiteParameters, Bid, FeasibilityResult } from '../services/StrategicPlanningService';
import { TurbineType, TurbineFamily } from './turbine/TurbineFactory';
import { WTFCase } from '../services/LegacyKnowledgeService';

export type ProjectPhase = 'GENESIS' | 'PROCUREMENT' | 'CONSTRUCTION' | 'COMMISSIONING' | 'OPERATIONS' | 'FORENSICS';

export interface ProjectIdentity {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
        region: string; // e.g., "Balkan"
    };
    createdDate: number;
}

// 1. GENESIS PHASE DATA
export interface GenesisData {
    siteParams: SiteParameters;
    feasibility: FeasibilityResult;
    regulatoryStatus: Map<string, 'PENDING' | 'APPROVED' | 'REJECTED'>;
}

// 2. PROCUREMENT & BUILD DATA
export interface BuildData {
    selectedTurbineType: TurbineType;
    selectedBid?: Bid;
    manufacturer: string;
    constructionProgress: number; // 0-100%
    // The "Hardware Spec" that defines physical limits for the Decision Engine
    hardwareSpec: {
        ratedHead: number; // m
        ratedFlow: number; // m3/s
        ratedPower: number; // MW
        maxRunawaySpeed: number; // rpm
        guideVaneCount: number;
        runnerBladeCount: number;
        bearingType: 'Segmental' | 'Cylindrical';
        coolingSystem: 'Air' | 'Water';
    };
}

// 3. COMMISSIONING DATA (Baseline)
export interface CommissioningData {
    baselineFingerprints: {
        vibrationSpectrum: any; // FFT data
        acousticSignature: any;
        thermalMap: any;
    };
    performanceTestResults: {
        actualEfficiency: number;
        maxOutput: number;
        vibrationAtNominal: number;
    };
    acceptedConstraints: string[]; // e.g. "Do not operate 45-55% load"
}

// 4. OPERATIONS DATA (Real-time & History)
export interface OperationsData {
    totalRunningHours: number;
    totalCycles: number;
    currentAlerts: any[];
    healthScore: number; // 0-100
}

// 5. FORENSICS (Incident History)
export interface ForensicsData {
    incidentHistory: {
        id: string;
        date: number;
        type: string;
        blackBoxRecordingId?: string;
        legacyCaseMatch?: WTFCase;
    }[];
}

// === THE MASTER OBJECT ===
export interface ProjectDNA {
    identity: ProjectIdentity;
    currentPhase: ProjectPhase;

    // Phase Data Containers
    genesis: GenesisData;
    build: BuildData;
    commissioning?: CommissioningData;
    operations: OperationsData;
    forensics: ForensicsData;
}
