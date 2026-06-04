import { create } from 'zustand';

interface ValidationOptions {
    turbineFamily: string;
    component: string;
    taskDescription: string;
    onProceed: () => void;
}

interface ValidationStore {
    isOpen: boolean;
    config: ValidationOptions | null;
    validateTask: (options: ValidationOptions) => void;
    handleProceed: () => void;
    handleClose: () => void;
}

export const useValidationStore = create<ValidationStore>((set, get) => ({
    isOpen: false,
    config: null,
    validateTask: (options) => {
        set({ config: options, isOpen: true });
    },
    handleProceed: () => {
        const { config } = get();
        if (config) {
            config.onProceed();
        }
        set({ config: null, isOpen: false });
    },
    handleClose: () => {
        set({ config: null, isOpen: false });
    }
}));
