// Context-Aware Morphing Dashboard System
// Adapts UI complexity and content based on user role, expertise, and task

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'FIELD_ENGINEER' | 'CONSULTANT' | 'DIRECTOR' | 'TECHNICIAN' | 'OPERATOR';
export type ExpertiseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
export type CurrentTask = 'DIAGNOSIS' | 'MAINTENANCE' | 'CONSULTING' | 'REPORTING' | 'MONITORING';

export interface UserContext {
    role: UserRole;
    expertise: ExpertiseLevel;
    currentTask: CurrentTask;
    preferences: {
        showTechnicalDetails: boolean;
        showFinancialMetrics: boolean;
        enableARMode: boolean;
        preferredComplexity: 'SIMPLIFIED' | 'STANDARD' | 'ADVANCED';
    };
}

export interface MorphingConfig {
    showComponents: {
        technicalDiagnostics: boolean;
        financialROI: boolean;
        arVisualization: boolean;
        detailedSensors: boolean;
        simplifiedOverview: boolean;
        knowledgeBase: boolean;
        consultingReports: boolean;
    };
    complexity: 'SIMPLIFIED' | 'STANDARD' | 'ADVANCED';
    primaryFocus: string;
    colorScheme: 'TECHNICAL' | 'BUSINESS' | 'OPERATIONAL';
}

interface ContextAwareSystemContextType {
    userContext: UserContext;
    morphingConfig: MorphingConfig;
    updateRole: (role: UserRole) => void;
    updateTask: (task: CurrentTask) => void;
    updatePreferences: (preferences: Partial<UserContext['preferences']>) => void;
}

const ContextAwareSystemContext = createContext<ContextAwareSystemContextType | undefined>(undefined);

export function useContextAwareSystem() {
    const context = useContext(ContextAwareSystemContext);
    if (!context) {
        throw new Error('useContextAwareSystem must be used within ContextAwareSystemProvider');
    }
    return context;
}

export const ContextAwareSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userContext, setUserContext] = useState<UserContext>({
        role: 'FIELD_ENGINEER',
        expertise: 'INTERMEDIATE',
        currentTask: 'DIAGNOSIS',
        preferences: {
            showTechnicalDetails: true,
            showFinancialMetrics: false,
            enableARMode: true,
            preferredComplexity: 'STANDARD'
        }
    });

    const [morphingConfig, setMorphingConfig] = useState<MorphingConfig>(
        generateMorphingConfig(userContext)
    );

    // Update config whenever user context changes
    useEffect(() => {
        const newConfig = generateMorphingConfig(userContext);
        setMorphingConfig(newConfig);

        console.log('🔄 UI Morphing:', {
            role: userContext.role,
            task: userContext.currentTask,
            complexity: newConfig.complexity,
            focus: newConfig.primaryFocus
        });
    }, [userContext]);

    const updateRole = (role: UserRole) => {
        setUserContext(prev => ({ ...prev, role }));
    };

    const updateTask = (task: CurrentTask) => {
        setUserContext(prev => ({ ...prev, currentTask: task }));
    };

    const updatePreferences = (preferences: Partial<UserContext['preferences']>) => {
        setUserContext(prev => ({
            ...prev,
            preferences: { ...prev.preferences, ...preferences }
        }));
    };

    return (
        <ContextAwareSystemContext.Provider value={{
            userContext,
            morphingConfig,
            updateRole,
            updateTask,
            updatePreferences
        }}>
            {children}
        </ContextAwareSystemContext.Provider>
    );
};

// ===== MORPHING LOGIC =====

function generateMorphingConfig(context: UserContext): MorphingConfig {
    const { role, expertise, currentTask, preferences } = context;

    // Default config
    let config: MorphingConfig = {
        showComponents: {
            technicalDiagnostics: false,
            financialROI: false,
            arVisualization: false,
            detailedSensors: false,
            simplifiedOverview: false,
            knowledgeBase: false,
            consultingReports: false
        },
        complexity: 'STANDARD',
        primaryFocus: 'General Operations',
        colorScheme: 'OPERATIONAL'
    };

    // ===== ROLE-BASED MORPHING =====

    switch (role) {
        case 'FIELD_ENGINEER':
            config.showComponents = {
                technicalDiagnostics: true,
                financialROI: false,
                arVisualization: preferences.enableARMode,
                detailedSensors: true,
                simplifiedOverview: false,
                knowledgeBase: true,
                consultingReports: false
            };
            config.complexity = expertise === 'BEGINNER' ? 'SIMPLIFIED' : 'ADVANCED';
            config.primaryFocus = 'Technical Diagnostics & Repair';
            config.colorScheme = 'TECHNICAL';
            break;

        case 'CONSULTANT':
            config.showComponents = {
                technicalDiagnostics: true,
                financialROI: true,
                arVisualization: false,
                detailedSensors: true,
                simplifiedOverview: false,
                knowledgeBase: true,
                consultingReports: true
            };
            config.complexity = 'ADVANCED';
            config.primaryFocus = 'Optimization & ROI Analysis';
            config.colorScheme = 'BUSINESS';
            break;

        case 'DIRECTOR':
            config.showComponents = {
                technicalDiagnostics: false,
                financialROI: true,
                arVisualization: false,
                detailedSensors: false,
                simplifiedOverview: true,
                knowledgeBase: false,
                consultingReports: true
            };
            config.complexity = 'SIMPLIFIED';
            config.primaryFocus = 'Financial Performance & ROI';
            config.colorScheme = 'BUSINESS';
            break;

        case 'TECHNICIAN':
            config.showComponents = {
                technicalDiagnostics: true,
                financialROI: false,
                arVisualization: true,
                detailedSensors: false,
                simplifiedOverview: true,
                knowledgeBase: true,
                consultingReports: false
            };
            config.complexity = 'SIMPLIFIED';
            config.primaryFocus = 'Maintenance Tasks';
            config.colorScheme = 'OPERATIONAL';
            break;

        case 'OPERATOR':
            config.showComponents = {
                technicalDiagnostics: false,
                financialROI: false,
                arVisualization: false,
                detailedSensors: false,
                simplifiedOverview: true,
                knowledgeBase: false,
                consultingReports: false
            };
            config.complexity = 'SIMPLIFIED';
            config.primaryFocus = 'Real-time Monitoring';
            config.colorScheme = 'OPERATIONAL';
            break;
    }

    // ===== TASK-BASED REFINEMENT =====

    switch (currentTask) {
        case 'DIAGNOSIS':
            config.showComponents.technicalDiagnostics = true;
            config.showComponents.knowledgeBase = true;
            break;

        case 'CONSULTING':
            config.showComponents.financialROI = true;
            config.showComponents.consultingReports = true;
            break;

        case 'MAINTENANCE':
            config.showComponents.arVisualization = preferences.enableARMode;
            config.showComponents.detailedSensors = true;
            break;

        case 'REPORTING':
            config.showComponents.simplifiedOverview = true;
            config.complexity = 'SIMPLIFIED';
            break;
    }

    // Apply preference overrides
    if (preferences.preferredComplexity) {
        config.complexity = preferences.preferredComplexity;
    }

    return config;
}

// ===== COMPONENT VISIBILITY HOOK =====

export function useComponentVisibility(componentName: keyof MorphingConfig['showComponents']): boolean {
    const { morphingConfig } = useContextAwareSystem();
    return morphingConfig.showComponents[componentName];
}

// ===== ADAPTIVE STYLING HOOK =====

export function useAdaptiveStyles() {
    const { morphingConfig, userContext } = useContextAwareSystem();

    const colorSchemes = {
        TECHNICAL: {
            primary: 'from-cyan-500 to-blue-500',
            accent: 'text-cyan-400',
            border: 'border-cyan-500',
            bg: 'bg-cyan-500/20'
        },
        BUSINESS: {
            primary: 'from-emerald-500 to-green-500',
            accent: 'text-emerald-400',
            border: 'border-emerald-500',
            bg: 'bg-emerald-500/20'
        },
        OPERATIONAL: {
            primary: 'from-purple-500 to-pink-500',
            accent: 'text-purple-400',
            border: 'border-purple-500',
            bg: 'bg-purple-500/20'
        }
    };

    return {
        colors: colorSchemes[morphingConfig.colorScheme],
        fontSize: morphingConfig.complexity === 'SIMPLIFIED' ? 'text-base' : 'text-sm',
        spacing: morphingConfig.complexity === 'SIMPLIFIED' ? 'p-6' : 'p-4',
        showLabels: morphingConfig.complexity === 'SIMPLIFIED'
    };
}

// ===== ROLE SELECTOR COMPONENT =====

export const RoleSelector: React.FC = () => {
    const { userContext, updateRole, morphingConfig } = useContextAwareSystem();

    const roles: { role: UserRole; label: string; icon: string }[] = [
        { role: 'FIELD_ENGINEER', label: 'Field Engineer', icon: '🔧' },
        { role: 'CONSULTANT', label: 'Consultant', icon: '💼' },
        { role: 'DIRECTOR', label: 'Director/CEO', icon: '👔' },
        { role: 'TECHNICIAN', label: 'Technician', icon: '🛠️' },
        { role: 'OPERATOR', label: 'Operator', icon: '🎮' }
    ];

    return (
        <div className="flex gap-2 p-4 bg-slate-900/50 rounded-lg border border-white/10">
            <div className="text-xs text-slate-400 self-center mr-2">VIEW AS:</div>
            {roles.map(({ role, label, icon }) => (
                <button
                    key={role}
                    onClick={() => updateRole(role)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${userContext.role === role
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                        }`}
                >
                    {icon} {label}
                </button>
            ))}
            <div className="text-xs text-slate-500 self-center ml-auto">
                Focus: {morphingConfig.primaryFocus}
            </div>
        </div>
    );
};
