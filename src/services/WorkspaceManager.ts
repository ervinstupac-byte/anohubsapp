/**
 * WorkspaceManager.ts
 * 
 * NC-800: Workspace Presets System
 * Manages pre-defined layouts for different user workflows:
 * - Operational: Focus on 3D visualization and live telemetry
 * - Forensic: Focus on RCA analysis and vibration spectra
 * - Executive: Focus on ROI metrics and PDF reporting
 */

// Define layout types locally (react-grid-layout types)
export interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
}

export type Layouts = {
    [breakpoint: string]: LayoutItem[];
};

export interface WorkspacePreset {
    id: string;
    name: string;
    description: string;
    icon: string;
    layouts: Layouts;
}


// Grid widget identifiers
export const WIDGET_IDS = {
    VITALS: 'vitals',
    MAIN_ENGINE: 'main-engine',
    TURBINE_3D: 'turbine-3d',
    VIBRATION: 'vibration-analyzer',
    FORENSIC: 'forensic-lab',
    EXECUTIVE: 'executive-summary',
    AI_BRAIN: 'ai-brain',
    SAFETY_GUARD: 'safety-guard',
    AUDIT_LOG: 'audit-log',
} as const;

/**
 * Operational Preset: War Room view for operators
 * - Large 3D turbine visualization
 * - Live telemetry vitals
 * - Safety status prominent
 */
const operationalLayout: LayoutItem[] = [
    { i: WIDGET_IDS.TURBINE_3D, x: 0, y: 0, w: 6, h: 4 },
    { i: WIDGET_IDS.VITALS, x: 6, y: 0, w: 3, h: 2 },
    { i: WIDGET_IDS.SAFETY_GUARD, x: 6, y: 2, w: 3, h: 2 },
    { i: WIDGET_IDS.AI_BRAIN, x: 9, y: 0, w: 3, h: 2 },
    { i: WIDGET_IDS.MAIN_ENGINE, x: 9, y: 2, w: 3, h: 2 },
    { i: WIDGET_IDS.AUDIT_LOG, x: 0, y: 4, w: 12, h: 2 },
    { i: WIDGET_IDS.VIBRATION, x: 0, y: 6, w: 6, h: 3, minW: 3, minH: 2 },
    { i: WIDGET_IDS.FORENSIC, x: 6, y: 6, w: 6, h: 3, minW: 3, minH: 2 },
    { i: WIDGET_IDS.EXECUTIVE, x: 0, y: 9, w: 12, h: 3, minW: 4, minH: 2 },
];

/**
 * Forensic Preset: Deep diagnostic view
 * - Vibration analyzer prominent
 * - Forensic Lab for RCA
 * - Smaller 3D for reference
 */
const forensicLayout: LayoutItem[] = [
    { i: WIDGET_IDS.VIBRATION, x: 0, y: 0, w: 6, h: 4 },
    { i: WIDGET_IDS.FORENSIC, x: 6, y: 0, w: 6, h: 4 },
    { i: WIDGET_IDS.TURBINE_3D, x: 0, y: 4, w: 4, h: 3 },
    { i: WIDGET_IDS.AI_BRAIN, x: 4, y: 4, w: 4, h: 3 },
    { i: WIDGET_IDS.AUDIT_LOG, x: 8, y: 4, w: 4, h: 3 },
    { i: WIDGET_IDS.VITALS, x: 0, y: 7, w: 3, h: 2 },
    { i: WIDGET_IDS.MAIN_ENGINE, x: 3, y: 7, w: 6, h: 2 },
    { i: WIDGET_IDS.SAFETY_GUARD, x: 9, y: 7, w: 3, h: 2 },
    { i: WIDGET_IDS.EXECUTIVE, x: 0, y: 9, w: 12, h: 2, minW: 4, minH: 2 },
];

/**
 * Executive Preset: High-level business view
 * - Executive Summary card large and prominent
 * - Key metrics and ROI focus
 * - Minimal technical detail
 */
const executiveLayout: LayoutItem[] = [
    { i: WIDGET_IDS.EXECUTIVE, x: 0, y: 0, w: 8, h: 4 },
    { i: WIDGET_IDS.VITALS, x: 8, y: 0, w: 4, h: 2 },
    { i: WIDGET_IDS.SAFETY_GUARD, x: 8, y: 2, w: 4, h: 2 },
    { i: WIDGET_IDS.TURBINE_3D, x: 0, y: 4, w: 4, h: 3 },
    { i: WIDGET_IDS.AI_BRAIN, x: 4, y: 4, w: 4, h: 3 },
    { i: WIDGET_IDS.MAIN_ENGINE, x: 8, y: 4, w: 4, h: 3 },
    { i: WIDGET_IDS.AUDIT_LOG, x: 0, y: 7, w: 12, h: 2 },
    { i: WIDGET_IDS.VIBRATION, x: 0, y: 9, w: 6, h: 2, minW: 3, minH: 2 },
    { i: WIDGET_IDS.FORENSIC, x: 6, y: 9, w: 6, h: 2, minW: 3, minH: 2 },
];

export const WORKSPACE_PRESETS: Record<string, WorkspacePreset> = {
    OPERATIONAL: {
        id: 'OPERATIONAL',
        name: 'Operational',
        description: 'War Room view: 3D visualization and live telemetry',
        icon: 'activity',
        layouts: { lg: operationalLayout, md: operationalLayout, sm: operationalLayout, xs: operationalLayout, xxs: operationalLayout },
    },
    FORENSIC: {
        id: 'FORENSIC',
        name: 'Forensic',
        description: 'Deep diagnostics: RCA analysis and vibration spectra',
        icon: 'search',
        layouts: { lg: forensicLayout, md: forensicLayout, sm: forensicLayout, xs: forensicLayout, xxs: forensicLayout },
    },
    EXECUTIVE: {
        id: 'EXECUTIVE',
        name: 'Executive',
        description: 'Business view: ROI metrics and reporting',
        icon: 'briefcase',
        layouts: { lg: executiveLayout, md: executiveLayout, sm: executiveLayout, xs: executiveLayout, xxs: executiveLayout },
    },
};

const STORAGE_KEY = 'anohub_workspace_layout';
const PRESET_STORAGE_KEY = 'anohub_workspace_preset';

class WorkspaceManagerService {
    private currentPreset: string | null = null;

    constructor() {
        this.currentPreset = localStorage.getItem(PRESET_STORAGE_KEY);
    }

    /**
     * Get saved layout from localStorage or return default
     */
    getSavedLayout(): Layouts | null {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Save current layout to localStorage
     */
    saveLayout(layouts: Layouts): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
        // Clear preset indicator since user customized
        this.currentPreset = null;
        localStorage.removeItem(PRESET_STORAGE_KEY);
    }

    /**
     * Apply a workspace preset
     */
    applyPreset(presetId: string): Layouts | null {
        const preset = WORKSPACE_PRESETS[presetId];
        if (!preset) return null;

        this.currentPreset = presetId;
        localStorage.setItem(PRESET_STORAGE_KEY, presetId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preset.layouts));

        return preset.layouts;
    }

    /**
     * Get current active preset (null if custom)
     */
    getCurrentPreset(): string | null {
        return this.currentPreset;
    }

    /**
     * Get default layout (Operational preset)
     */
    getDefaultLayout(): Layouts {
        return WORKSPACE_PRESETS.OPERATIONAL.layouts;
    }

    /**
     * Reset to default layout
     */
    resetToDefault(): Layouts {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PRESET_STORAGE_KEY);
        this.currentPreset = 'OPERATIONAL';
        return this.getDefaultLayout();
    }

    /**
     * Get all available presets
     */
    getPresets(): WorkspacePreset[] {
        return Object.values(WORKSPACE_PRESETS);
    }
}

export const workspaceManager = new WorkspaceManagerService();
