// ServiceChecklistEngine Types
// Turbine-specific service checklist system with 0.05mm precision validation

export type TurbineType = 'PELTON' | 'KAPLAN' | 'FRANCIS';
export type ChecklistItemType = 'BOOLEAN' | 'MEASUREMENT' | 'PHOTO';
export type MeasurementUnit = 'mm' | 'bar' | 'rpm' | 'celsius';
export type ValidationSeverity = 'OK' | 'WARNING' | 'CRITICAL';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MeasurementConfig {
    unit: MeasurementUnit;
    nominalValue: number;
    tolerance: number;  // 0.05mm for precision checks
    minValue: number;
    maxValue: number;
}

export interface PhotoConfig {
    minPhotos: number;
    maxPhotos: number;
    tags: string[];
}

export interface ChecklistItem {
    id: string;
    label: string;
    labelDE: string;
    type: ChecklistItemType;
    required: boolean;
    measurementConfig?: MeasurementConfig;
    photoConfig?: PhotoConfig;
    expertNotes?: string;
}

export interface ChecklistCategory {
    id: string;
    name: string;
    nameDE: string;
    items: ChecklistItem[];
}

export interface ChecklistTemplate {
    turbineType: TurbineType;
    version: string;
    categories: ChecklistCategory[];
    requiredPhotos: number;
    estimatedDurationMinutes: number;
}

export interface ValidationResult {
    isValid: boolean;
    severity: ValidationSeverity;
    message?: string;
    deviation?: number;
}

export interface ChecklistPhoto {
    id: string;
    src: string;  // base64 or blob URL
    tag: string;
    timestamp: string;
    gps?: string;
}

export interface ChecklistItemResponse {
    itemId: string;
    timestamp: string;

    // Response based on type
    booleanValue?: boolean;
    measurementValue?: number;
    photos?: ChecklistPhoto[];

    validationResult: ValidationResult;
}

export interface FieldNote {
    id: string;
    itemId: string;
    audioSrc?: string;
    transcriptOriginal: string;  // Speech-to-Text output
    transcriptDE?: string;       // Auto-translated
    recordedAt: string;
}

export interface ServiceAlert {
    id: string;
    checklistId: string;
    itemId: string;
    assetId: number;
    assetName: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    measuredValue?: number;
    nominalValue?: number;
    deviation?: number;
    unit?: MeasurementUnit;
    createdAt: string;
    acknowledgedAt?: string;
    technicianName?: string;
}

export interface ChecklistProgress {
    totalItems: number;
    completedItems: number;
    photosTaken: number;
    requiredPhotos: number;
    alertsGenerated: number;
}

export interface ActiveChecklist {
    id: string;
    templateId: string;
    turbineType: TurbineType;
    assetId: number;
    assetName: string;
    startedAt: string;
    completedAt?: string;
    technicianName: string;
    items: ChecklistItemResponse[];
    fieldNotes: FieldNote[];
    generatedAlerts: ServiceAlert[];
    progress: ChecklistProgress;
}
