import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Component Store (Zustand)
 * 
 * Manages component-level health tracking, measurements, and inspections.
 * Separated from technical state to allow independent updates.
 * 
 * Separation Rationale:
 * - Component health is asset-specific, not physics-specific
 * - Measurements can be updated independently of live telemetry
 * - Inspection data is archival and doesn't affect real-time calculations
 */

export interface ComponentHealthData {
    score: number;                  // 0-100
    status: 'OPTIMAL' | 'GOOD' | 'WARNING' | 'CRITICAL';
    lastMeasured: string;           // ISO timestamp
    component: string;
}

export interface MeasurementData {
    measuredValue: number;
    unit: 'mm' | 'bar' | 'rpm' | 'celsius';
    nominalValue: number;
    minValue: number;
    maxValue: number;
    tolerance: number;
    timestamp: string;
    healthScore: number;
    isValid: boolean;
}

export interface InspectionImage {
    imageId: string;
    src: string;                    // base64 or URL
    tag: string;
    timestamp: string;
    notes?: string;
    componentId: string;
    assetId: number;
}

interface ComponentStore {
    // Component Health Registry
    componentHealth: {
        [assetId: number]: {
            [componentId: string]: ComponentHealthData;
        };
    };

    // Measurement History
    measurements: {
        [assetId: number]: {
            [componentId: string]: MeasurementData[];
        };
    };

    // Inspection Images
    inspectionImages: {
        [assetId: number]: {
            [componentId: string]: InspectionImage[];
        };
    };

    // Actions - Component Health
    updateComponentHealth: (
        assetId: number,
        componentId: string,
        healthData: ComponentHealthData
    ) => void;

    getComponentHealth: (assetId: number, componentId: string) => ComponentHealthData | null;

    // Actions - Measurements
    addMeasurement: (
        assetId: number,
        componentId: string,
        measurement: MeasurementData
    ) => void;

    getMeasurements: (assetId: number, componentId: string) => MeasurementData[];

    getLatestMeasurement: (assetId: number, componentId: string) => MeasurementData | null;

    // Actions - Inspections
    addInspectionImage: (
        assetId: number,
        componentId: string,
        imageData: Omit<InspectionImage, 'imageId'>
    ) => string; // Returns imageId

    getInspectionImages: (assetId: number, componentId: string) => InspectionImage[];

    removeInspectionImage: (imageId: string) => void;

    // Utility
    getAssetHealthScore: (assetId: number) => number;

    reset: () => void;
}

export const useComponentStore = create<ComponentStore>()(
    persist(
        (set, get) => ({
            componentHealth: {},
            measurements: {},
            inspectionImages: {},

            // Component Health
            updateComponentHealth: (assetId, componentId, healthData) => {
                set((state) => ({
                    componentHealth: {
                        ...state.componentHealth,
                        [assetId]: {
                            ...(state.componentHealth[assetId] || {}),
                            [componentId]: healthData
                        }
                    }
                }));

                console.log(`[ComponentStore] Health updated: ${assetId}/${componentId} = ${healthData.score} (${healthData.status})`);
            },

            getComponentHealth: (assetId, componentId) => {
                return get().componentHealth[assetId]?.[componentId] || null;
            },

            // Measurements
            addMeasurement: (assetId, componentId, measurement) => {
                set((state) => {
                    const assetMeasurements = state.measurements[assetId] || {};
                    const componentMeasurements = assetMeasurements[componentId] || [];

                    return {
                        measurements: {
                            ...state.measurements,
                            [assetId]: {
                                ...assetMeasurements,
                                [componentId]: [...componentMeasurements, measurement]
                            }
                        }
                    };
                });

                console.log(`[ComponentStore] Measurement added: ${assetId}/${componentId}`);
            },

            getMeasurements: (assetId, componentId) => {
                return get().measurements[assetId]?.[componentId] || [];
            },

            getLatestMeasurement: (assetId, componentId) => {
                const measurements = get().measurements[assetId]?.[componentId] || [];
                return measurements.length > 0 ? measurements[measurements.length - 1] : null;
            },

            // Inspections
            addInspectionImage: (assetId, componentId, imageData) => {
                const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                const image: InspectionImage = {
                    ...imageData,
                    imageId,
                    assetId,
                    componentId
                };

                set((state) => {
                    const assetImages = state.inspectionImages[assetId] || {};
                    const componentImages = assetImages[componentId] || [];

                    return {
                        inspectionImages: {
                            ...state.inspectionImages,
                            [assetId]: {
                                ...assetImages,
                                [componentId]: [...componentImages, image]
                            }
                        }
                    };
                });

                console.log(`[ComponentStore] Inspection image added: ${imageId}`);
                return imageId;
            },

            getInspectionImages: (assetId, componentId) => {
                return get().inspectionImages[assetId]?.[componentId] || [];
            },

            removeInspectionImage: (imageId) => {
                set((state) => {
                    const newImages: Record<string, any> = { ...state.inspectionImages } as any;

                    // Find and remove image (work with string keys returned by Object.keys)
                    Object.keys(newImages).forEach(aid => {
                        const comps = newImages[aid] || {};
                        Object.keys(comps).forEach(componentId => {
                            comps[componentId] = (comps[componentId] || []).filter((img: InspectionImage) => img.imageId !== imageId);
                        });
                        newImages[aid] = comps;
                    });

                    return { inspectionImages: newImages } as any;
                });

                console.log(`[ComponentStore] Inspection image removed: ${imageId}`);
            },

            // Utility
            getAssetHealthScore: (assetId) => {
                const health = get().componentHealth[assetId];
                if (!health) return 100;

                const scores = Object.values(health).map(h => h.score);
                if (scores.length === 0) return 100;

                return scores.reduce((sum, score) => sum + score, 0) / scores.length;
            },

            reset: () => {
                set({
                    componentHealth: {},
                    measurements: {},
                    inspectionImages: {}
                });
            }
        }),
        {
            name: 'anohub-component-store'
        }
    )
);

// Selectors
export const useAssetHealth = (assetId: number) =>
    useComponentStore((state) => state.componentHealth[assetId] || {});

export const useComponentHealthScore = (assetId: number, componentId: string) =>
    useComponentStore((state) => state.componentHealth[assetId]?.[componentId]?.score || 100);
