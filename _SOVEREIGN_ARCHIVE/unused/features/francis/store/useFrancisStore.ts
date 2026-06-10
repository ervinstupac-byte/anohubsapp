import { create } from 'zustand';

export type FrancisComponentId =
    | 'generator'
    | 'miv'
    | 'spiral_case'
    | 'runner'
    | 'shaft_seal'
    | 'hpu'
    | 'draft_tube'
    | 'insp-de-bearing'
    | 'insp-nde-bearing'
    | 'insp-stator'
    | 'insp-rotor'
    | 'insp-lube-oil';

interface FrancisState {
    activeAssetId: FrancisComponentId | null;
    isFullView: boolean;
    xRayActive: boolean;
    viewMode: 'HUB' | 'DETAIL';

    // Actions
    setActiveAsset: (id: FrancisComponentId | null) => void;
    toggleFullView: () => void;
    setFullView: (active: boolean) => void;
    toggleXRay: () => void;
    resetView: () => void;
}

export const useFrancisStore = create<FrancisState>((set) => ({
    activeAssetId: null,
    isFullView: false,
    xRayActive: false,
    viewMode: 'HUB',

    setActiveAsset: (id) => set((state) => ({
        activeAssetId: id,
        viewMode: id ? 'DETAIL' : 'HUB'
    })),

    toggleFullView: () => set((state) => ({ isFullView: !state.isFullView })),
    setFullView: (active) => set({ isFullView: active }),
    toggleXRay: () => set((state) => ({ xRayActive: !state.xRayActive })),

    resetView: () => set({
        activeAssetId: null,
        viewMode: 'HUB',
        xRayActive: false
    })
}));
