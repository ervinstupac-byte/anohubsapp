import { createContext, useContext } from 'react';

// OVO JE JEDINI IZVOR ISTINE ZA SVE RUTING ALIASE I POGLEDE U APLIKACIJI
export type AppView =
    | 'home'
    | 'login'
    | 'intro'
    | 'digitalIntroduction'
    | 'hub'
    | 'riskAssessment'
    | 'riskReport'
    | 'hppBuilder'
    | 'installation'
    | 'installationGuarantee'
    | 'contracts'
    | 'contractManagement'
    | 'globalMap'
    | 'standard'
    | 'standardOfExcellence'
    | 'improvements'
    | 'hppImprovements'
    | 'investor'
    | 'investorBriefing'
    | 'wildlife'
    | 'riverWildlife'
    | 'phases'
    | 'phaseGuide'
    | 'gender'
    | 'genderEquity'
    | 'library'
    | 'integrity'
    | 'digitalIntegrity'
    | 'revitalizationStrategy'
    | 'questionnaireSummary'
    | 'turbineDetail'
    | 'profile'
    | 'maintenanceDashboard'
    | 'executiveDashboard'
    | 'structuralIntegrity'
    | 'shaftAlignment'
    | 'hydraulicMaintenance'
    | 'boltTorque'
    | 'shadowEngineer'
    | 'intuitionLog'
    | 'adminApproval'
    | 'clientPortal'
    | 'logbook'
    | 'francisHub';

interface NavigationContextType {
    currentPage: AppView;
    navigateTo: (page: AppView) => void;
    navigateBack: () => void;
    navigateToHub: () => void;
    navigateToTurbineDetail: (id: string) => void;
    showOnboarding: boolean;
    completeOnboarding: () => void;
    showFeedbackModal: () => void;
    // --- NEW: Golden Thread Navigation Helpers ---
    navigateToExecutive: () => void;
    navigateToBuilder: () => void;
    navigateToToolbox: () => void;
    navigateToMaintenance: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Provider je samo "pass-through" jer stvarni provider dolazi iz App.tsx
export const NavigationProvider = NavigationContext.Provider;

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};