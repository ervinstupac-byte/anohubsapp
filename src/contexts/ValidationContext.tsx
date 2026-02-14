import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { LegacyValidationModal } from '../components/LegacyValidationModal';

interface ValidationOptions {
    turbineFamily: string;
    component: string;
    taskDescription: string;
    onProceed: () => void;
}

interface ValidationContextType {
    validateTask: (options: ValidationOptions) => void;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export const ValidationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<ValidationOptions | null>(null);

    const validateTask = useCallback((options: ValidationOptions) => {
        setConfig(options);
        setIsOpen(true);
    }, []);

    const handleProceed = () => {
        config?.onProceed();
        setIsOpen(false);
        setConfig(null);
    };

    const handleClose = () => {
        setIsOpen(false);
        setConfig(null);
    };

    return (
        <ValidationContext.Provider value={{ validateTask }}>
            {children}
            {config && (
                <LegacyValidationModal
                    isOpen={isOpen}
                    onClose={handleClose}
                    onProceed={handleProceed}
                    turbineFamily={config.turbineFamily}
                    component={config.component}
                    taskDescription={config.taskDescription}
                />
            )}
        </ValidationContext.Provider>
    );
};

export const useValidation = () => {
    const context = useContext(ValidationContext);
    if (!context) {
        throw new Error('useValidation must be used within a ValidationProvider');
    }
    return context;
};
