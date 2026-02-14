import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'info' | 'success';
    onConfirm: () => void;
    onCancel?: () => void;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<ConfirmOptions | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        setConfig(options);
        setIsOpen(true);
    }, []);

    const handleConfirm = () => {
        config?.onConfirm();
        setIsOpen(false);
        setConfig(null);
    };

    const handleCancel = () => {
        config?.onCancel?.();
        setIsOpen(false);
        setConfig(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {config && (
                <ConfirmModal
                    open={isOpen}
                    title={config.title}
                    message={config.message}
                    confirmLabel={config.confirmLabel}
                    variant={config.variant}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};
