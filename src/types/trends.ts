/**
 * Historical Trend Analysis Types
 * Predictive maintenance through linear regression
 */

export interface HistoricalMeasurement {
    timestamp: string;
    value: number;
    technicianName: string;
    checklistId?: string;
    notes?: string;
}

export interface TrendProjection {
    slope: number;  // Rate of change per day
    intercept: number;
    rSquared: number;  // Goodness of fit 0-1
    projectedCriticalDate?: string;  // When threshold will be exceeded
    daysUntilCritical?: number;
    criticalThreshold: number;
}

export interface MeasurementHistory {
    parameterId: string;
    parameterName: string;
    unit: string;
    measurements: HistoricalMeasurement[];
    trend?: TrendProjection;
}

export interface PrecisionMeasurement {
    id: string;
    parameterId: string;
    parameterName: string;
    valueMM: number;  // Full precision
    displayValue: string;  // "0.05mm"
    precisionValue: string;  // "52.3 hundredths"

    measuredAt: string;
    measuredBy: string;

    // Digital Signature
    signature: {
        engineerName: string;
        engineerLicense: string;
        signedAt: string;
        signatureHash: string;  // SHA-256
    };

    // Context
    temperature: number;
    calibrationCertificateId?: string;
    measurementMethod: 'FEELER_GAUGE' | 'MICROMETER' | 'DIAL_INDICATOR' | 'LASER';
}

export interface FineEngineeringLog {
    assetId: string;
    measurements: PrecisionMeasurement[];
    lastUpdated: string;
}

export type TurbineType = 'PELTON' | 'KAPLAN' | 'FRANCIS';

export interface SparePart {
    id: string;
    catalogNumber: string;
    name: string;
    nameDE: string;
    category: 'BEARING' | 'SEAL' | 'BOLT' | 'LABYRINTH' | 'FILTER' | 'OIL';
    manufacturer: string;
    unitPriceEUR: number;
    leadTimeDays: number;
    inStock: number;
    minStockLevel: number;
    compatibleTurbineTypes: TurbineType[];
}

export interface SparePartsInventory {
    parts: SparePart[];
    lastUpdated: string;
}

export interface DraftPurchaseOrder {
    id: string;
    createdAt: string;
    createdBy: string;
    triggeredBy: {
        checklistId: string;
        itemId: string;
        failureReason: string;
    };
    parts: {
        partId: string;
        catalogNumber: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    totalValueEUR: number;
    status: 'DRAFT' | 'APPROVED' | 'ORDERED';
    approvedBy?: string;
    approvedAt?: string;
}
