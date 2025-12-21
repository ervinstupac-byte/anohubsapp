// Project Context - The "Backbone"
// Provides global access to Technical State and Reactively recalculates physics

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TechnicalProjectState, DEFAULT_TECHNICAL_STATE } from '../models/TechnicalSchema';
import { PhysicsEngine } from '../services/PhysicsEngine';

interface ProjectContextType {
    technicalState: TechnicalProjectState;
    updateSiteConditions: (updates: Partial<TechnicalProjectState['site']>) => void;
    updatePenstockSpecs: (updates: Partial<TechnicalProjectState['penstock']>) => void;
    updateMechanicalDetails: (updates: Partial<TechnicalProjectState['mechanical']>) => void;
    updateTolerances: (updates: Partial<TechnicalProjectState['tolerances']>) => void;
    recalculate: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [technicalState, setTechnicalState] = useState<TechnicalProjectState>(DEFAULT_TECHNICAL_STATE);

    // Reactive Calculation Engine
    // Triggered automatically when inputs change (or called manually via recalculate)
    const recalculate = () => {
        setTechnicalState(prev => {
            const calculated = PhysicsEngine.recalculateProjectPhysics(prev);
            // Only update if physics changed significantly to avoid loops? 
            // For now, allow update. React's state comparison might save us if strictly equal, 
            // but physics object is always new. 
            // To prevent infinite re-renders if used in useEffect dependencies downstream,
            // we rely on the fact that this state update comes from USER input setters primarily.
            return calculated;
        });
    };

    // Auto-recalculate on mount and when sections update fully
    // Note: We don't put 'technicalState' in dependency to avoid loop.
    // Instead, setters call recalculate, or we use a separate effect listening to 'inputs' specifically.

    const updateSiteConditions = (updates: Partial<TechnicalProjectState['site']>) => {
        setTechnicalState(prev => PhysicsEngine.recalculateProjectPhysics({
            ...prev,
            site: { ...prev.site, ...updates }
        }));
    };

    const updatePenstockSpecs = (updates: Partial<TechnicalProjectState['penstock']>) => {
        setTechnicalState(prev => PhysicsEngine.recalculateProjectPhysics({
            ...prev,
            penstock: { ...prev.penstock, ...updates }
        }));
    };

    const updateMechanicalDetails = (updates: Partial<TechnicalProjectState['mechanical']>) => {
        setTechnicalState(prev => PhysicsEngine.recalculateProjectPhysics({
            ...prev,
            mechanical: { ...prev.mechanical, ...updates }
        }));
    };

    const updateTolerances = (updates: Partial<TechnicalProjectState['tolerances']>) => {
        setTechnicalState(prev => PhysicsEngine.recalculateProjectPhysics({
            ...prev,
            tolerances: { ...prev.tolerances, ...updates }
        }));
    };

    return (
        <ProjectContext.Provider value={{
            technicalState,
            updateSiteConditions,
            updatePenstockSpecs,
            updateMechanicalDetails,
            updateTolerances,
            recalculate
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjectEngine = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjectEngine must be used within a ProjectProvider');
    }
    return context;
};
