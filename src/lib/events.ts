
// Type-safe Event Bus for Global Actions

export const EVENTS = {
    OPEN_SYSTEM_OVERVIEW: 'openSystemOverview',
    OPEN_ASSET_PASSPORT: 'openAssetPassport',
    OPEN_ASSET_WIZARD: 'openAssetWizard',
    OPEN_DOSSIER: 'openDossier',
    EXPERT_FEEDBACK_RECORDED: 'expertFeedbackRecorded',
    SET_TURBINE_TYPE: 'SET_TURBINE_TYPE',
    OPEN_COMMAND_PALETTE: 'openCommandPalette',
    SYSTEM_KERNEL_LOG: 'SYSTEM_KERNEL_LOG',
    TWIN_ASSET_CLICK: 'twin:asset-click',
    RECONSTRUCTION_START: 'reconstruction:start',
    RECONSTRUCTION_PROGRESS: 'reconstruction:progress',
    RECONSTRUCTION_COMPLETE: 'reconstruction:complete',
    RECONSTRUCTION_ERROR: 'reconstruction:error',
    TRIGGER_FORENSIC_EXPORT: 'TRIGGER_FORENSIC_EXPORT', // Keeping legacy name for now
} as const;

export interface AssetPassportPayload {
    id: string;
    name: string;
    type: string;
}

export interface DossierPayload {
    keyword: string;
}

export interface ExpertFeedbackPayload {
    guardianKey: string;
}

export interface TurbineTypePayload {
    family: string;
    variant: string;
}

export interface SystemKernelLogPayload {
    level: string;
    source: string;
    message: string;
}

export interface ReconstructionStartPayload {
    requestedId: string;
    base: string;
}

export interface ReconstructionProgressPayload {
    processed: number;
}

export interface ReconstructionCompletePayload {
    requestedId: string;
    entryId: string | null;
}

export interface ReconstructionErrorPayload {
    message: string;
}

// Helper to dispatch typed events
export const dispatch = {
    openSystemOverview: () => {
        window.dispatchEvent(new CustomEvent(EVENTS.OPEN_SYSTEM_OVERVIEW));
    },
    openAssetPassport: (payload: AssetPassportPayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.OPEN_ASSET_PASSPORT, { detail: payload }));
    },
    openAssetWizard: () => {
        window.dispatchEvent(new CustomEvent(EVENTS.OPEN_ASSET_WIZARD));
    },
    openDossier: (payload: DossierPayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.OPEN_DOSSIER, { detail: payload }));
    },
    expertFeedbackRecorded: (payload: ExpertFeedbackPayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.EXPERT_FEEDBACK_RECORDED, { detail: payload }));
    },
    setTurbineType: (payload: TurbineTypePayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.SET_TURBINE_TYPE, { detail: payload }));
    },
    openCommandPalette: () => {
        window.dispatchEvent(new CustomEvent(EVENTS.OPEN_COMMAND_PALETTE));
    },
    systemKernelLog: (payload: SystemKernelLogPayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.SYSTEM_KERNEL_LOG, { detail: payload }));
    },
    twinAssetClick: (assetId: string) => {
        window.dispatchEvent(new CustomEvent(EVENTS.TWIN_ASSET_CLICK, { detail: assetId }));
    },
    reconstructionStart: (payload: ReconstructionStartPayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.RECONSTRUCTION_START, { detail: payload }));
    },
    reconstructionProgress: (payload: ReconstructionProgressPayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.RECONSTRUCTION_PROGRESS, { detail: payload }));
    },
    reconstructionComplete: (payload: ReconstructionCompletePayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.RECONSTRUCTION_COMPLETE, { detail: payload }));
    },
    reconstructionError: (payload: ReconstructionErrorPayload) => {
        window.dispatchEvent(new CustomEvent(EVENTS.RECONSTRUCTION_ERROR, { detail: payload }));
    },
    triggerForensicExport: () => {
        window.dispatchEvent(new CustomEvent(EVENTS.TRIGGER_FORENSIC_EXPORT));
    }
};
