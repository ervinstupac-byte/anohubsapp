/**
 * AI Enhancement Types
 * DrTurbineAI findings with expert verification and data integrity
 */

export type AnalysisType = 'CAVITATION' | 'EROSION' | 'CORROSION' | 'CRACK' | 'THERMAL' | 'VIBRATION';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ExpertVerdict = 'CONFIRMED' | 'MODIFIED' | 'REJECTED';

export interface AIFinding {
    id: string;
    imageUrl: string;
    analysisType: AnalysisType;

    // AI Analysis
    aiDiagnosis: string;
    aiDiagnosisDE: string;
    confidenceScore: number;  // 0-100%
    severity: FindingSeverity;

    // Expert Verification
    verifiedByExpert: boolean;
    expertName?: string;
    expertLicense?: string;
    expertComments?: string;
    expertCommentsDE?: string;
    verifiedAt?: string;
    verdict?: ExpertVerdict;

    // Recommendations
    recommendedAction: string;
    recommendedActionDE: string;
    referencedStandard?: string;  // e.g., "ISO 10816-1"

    // Data Integrity
    dataIntegrityHash: string;  // SHA-256

    createdAt: string;
}

export interface ExpertVerification {
    findingId: string;
    expertName: string;
    expertLicense: string;
    verdict: ExpertVerdict;
    comments: string;
    commentsDE: string;
    verifiedAt: string;
    signatureHash: string;  // SHA-256
}

export interface TechnicalStandard {
    id: string;
    standardCode: string;  // "ISO 10816-1"
    title: string;
    titleDE: string;
    category: 'VIBRATION' | 'LUBRICATION' | 'HYDRAULICS' | 'MECHANICAL';
    applicableConditions: AnalysisType[];
    url?: string;
}

export interface ThermalOverlay {
    imageUrl: string;
    heatmapData: HeatmapPoint[];
    correlationScore: number;  // 0-1
    criticalZones: CriticalZone[];
    generatedAt: string;
}

export interface HeatmapPoint {
    x: number;
    y: number;
    temperature: number;
    color: string;
    intensity: number;  // 0-1
}

export interface CriticalZone {
    x: number;
    y: number;
    radius: number;
    severity: FindingSeverity;
    description: string;
    descriptionDE: string;
}
