import { create } from 'zustand';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'info' | 'success';
    onConfirm: () => void;
    onCancel?: () => void;
}

interface ConfirmStore {
    isOpen: boolean;
    config: ConfirmOptions | null;
    confirm: (options: ConfirmOptions) => void;
    handleConfirm: () => void;
    handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
    isOpen: false,
    config: null,
    confirm: (options: ConfirmOptions) => {
        set({ isOpen: true, config: options });
    },
    handleConfirm: () => {
        set((state) => {
            state.config?.onConfirm();
            return { isOpen: false, config: null };
        });
    },
    handleCancel: () => {
        set((state) => {
            state.config?.onCancel?.();
            return { isOpen: false, config: null };
        });
    },
}));
