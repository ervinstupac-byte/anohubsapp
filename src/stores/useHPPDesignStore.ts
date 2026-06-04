import { create } from 'zustand';

export interface HPPDesignData {
    design_name: string;
    recommended_turbine: string;
    parameters: {
        head: number;
        flow: number;
        efficiency: number;
        powerFactor?: number;
        waterQuality?: string;
        flowVariation?: string;
    };
    calculations: {
        powerMW: number;
        energyGWh: number;
        annualGWh: string;
        n_sq: string;
    };
    asset_id?: number;
    created_at?: string;
}

interface HPPDesignStore {
    currentDesign: HPPDesignData | null;
    setDesign: (design: HPPDesignData) => void;
    resetDesign: () => void;
}

export const useHPPDesignStore = create<HPPDesignStore>((set) => ({
    currentDesign: null,
    setDesign: (design: HPPDesignData) => set({ currentDesign: design }),
    resetDesign: () => set({ currentDesign: null }),
}));
