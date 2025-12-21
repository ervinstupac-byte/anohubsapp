// AnoHUB OS - The Total Lifecycle Container
// "Consultant-in-a-box" architecture

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Map as MapIcon,
    HardHat,
    Activity,
    Search,
    Settings,
    ChevronRight,
    Play,
    ShieldCheck as LucideShieldCheck
} from 'lucide-react';

// Modules
import { StrategicPlanningDashboard } from './StrategicPlanningDashboard';
import { ProjectGenesisForm } from './ProjectGenesisForm';
import { UniversalTurbineDashboard } from './UniversalTurbineDashboard';
import { KnowledgeBridgeVisualizer } from './KnowledgeBridgeVisualizer';
import { LegacyModeHub } from './LegacyModeHub';
import { VisualInspectionHub } from './VisualInspectionHub';
import { ClientConsultantDashboard } from './PerformanceGuardDashboard';
import { SmartStartChecklist } from './SmartStartChecklist';
import { PostShutdownWatchdog } from './PostShutdownWatchdog';
import { TechnicalAuditReportModule } from './TechnicalAuditReportModule';
import { LifecycleManager } from '../services/LifecycleManager';
import { ProjectPhase } from '../models/ProjectLifecycle';

export const AnoHubOS: React.FC = () => {
    // Global Project State
    const [project, setProject] = useState(LifecycleManager.getActiveProject());
    const [activeModule, setActiveModule] = useState<ProjectPhase | 'PERFORMANCE' | 'LEGACY' | 'SETTINGS'>('GENESIS');

    // Sync with Lifecycle Manager
    useEffect(() => {
        // Ideally subscribe to observable
        const interval = setInterval(() => {
            setProject({ ...LifecycleManager.getActiveProject() });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Navigation Items
    const navItems = [
        { id: 'GENESIS', label: 'Project Genesis', icon: MapIcon, phase: 'GENESIS' },
        { id: 'PROCUREMENT', label: 'Procurement', icon: DollarSignIcon, phase: 'PROCUREMENT' },
        { id: 'CONSTRUCTION', label: 'Build & Commission', icon: HardHat, phase: 'CONSTRUCTION' },
        { id: 'OPERATIONS', label: 'Operations Center', icon: Activity, phase: 'OPERATIONS' },
        { id: 'PERFORMANCE', label: 'Performance Guard', icon: ShieldCheckIcon, phase: 'OPERATIONS' },
        { id: 'FORENSICS', label: 'Forensics Lab', icon: Search, phase: 'FORENSICS' },
    ];

    // Auto-switch module based on phase if user hasn't overridden
    // (Simplified for demo: just manually click)

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">

            {/* SIDEBAR NAVIGATION */}
            <nav className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <span className="font-black text-white">A</span>
                        </div>
                        <h1 className="text-xl font-black text-white tracking-tighter">AnoHUB OS</h1>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                        {project.identity.name}
                    </div>
                    <div className="mt-2 text-xs flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        PHASE: {project.currentPhase}
                    </div>
                </div>

                <div className="flex-1 py-6 space-y-1">
                    {/* Lifecycle Phases */}
                    <div className="px-6 mb-2 text-xs font-bold text-slate-500 uppercase">Lifecycle Phases</div>
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            item={item}
                            isActive={activeModule === item.id || (activeModule === 'OPERATIONS' && item.id === 'OPERATIONS')} // Mapping correction
                            onClick={() => setActiveModule(item.id as any)}
                            isLocked={getPhaseIndex(project.currentPhase) < getPhaseIndex(item.phase)}
                        />
                    ))}

                    {/* Knowledge Base */}
                    <div className="px-6 mt-8 mb-2 text-xs font-bold text-slate-500 uppercase">Knowledge Base</div>
                    <NavItem
                        item={{ id: 'LEGACY', label: 'Legacy Mode', icon: BookIcon }}
                        isActive={activeModule === 'LEGACY'}
                        onClick={() => setActiveModule('LEGACY')}
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800">
                    <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                        System Settings
                    </button>
                    <div className="mt-2 text-[10px] text-slate-600">
                        v2.0.0 (Total Lifecycle Build)
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-auto bg-slate-950 relative">
                <AnimatePresence mode="wait">
                    {activeModule === 'GENESIS' && (
                        <WrappedComponent key="genesis">
                            <ProjectGenesisForm />
                        </WrappedComponent>
                    )}

                    {activeModule === 'FORENSICS' && (
                        <WrappedComponent key="forensics">
                            <VisualInspectionHub />
                        </WrappedComponent>
                    )}

                    {activeModule === 'PROCUREMENT' && (
                        <WrappedComponent key="procurement">
                            <StrategicPlanningDashboard /> {/* Reuse for now, ideally specific view */}
                        </WrappedComponent>
                    )}

                    {activeModule === 'CONSTRUCTION' && (
                        <WrappedComponent key="construction">
                            <ConstructionView project={project} />
                        </WrappedComponent>
                    )}

                    {activeModule === 'OPERATIONS' && (
                        <WrappedComponent key="operations">
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <UniversalTurbineDashboard />
                                    <SmartStartChecklist />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <PostShutdownWatchdog />
                                    <TechnicalAuditReportModule />
                                </div>
                                <KnowledgeBridgeVisualizer />
                            </div>
                        </WrappedComponent>
                    )}

                    {activeModule === 'PERFORMANCE' && (
                        <WrappedComponent key="performance">
                            <ClientConsultantDashboard />
                        </WrappedComponent>
                    )}

                    {activeModule === 'LEGACY' && (
                        <WrappedComponent key="legacy">
                            <LegacyModeHub />
                        </WrappedComponent>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

// --- Sub-components & Helpers ---

const BookIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const DollarSignIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <LucideShieldCheck className={className} />
);

const NavItem = ({ item, isActive, onClick, isLocked }: any) => (
    <button
        onClick={onClick}
        // disabled={isLocked} // Optional locking
        className={`w-full flex items-center gap-3 px-6 py-3 border-l-2 transition-all group ${isActive
            ? 'border-cyan-500 bg-cyan-950/10 text-white'
            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="font-bold text-sm tracking-wide">{item.label}</span>
        {isLocked && <div className="ml-auto text-xs text-slate-600">🔒</div>}
    </button>
);

const WrappedComponent = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="h-full"
    >
        {children}
    </motion.div>
);

// Helper to determine phase order
const getPhaseIndex = (phase: string) => {
    const order = ['GENESIS', 'PROCUREMENT', 'CONSTRUCTION', 'OPERATIONS', 'FORENSICS'];
    return order.indexOf(phase); // Partial matching handled by exact strings in model
};

// Mini Construction View (Placeholder)
const ConstructionView = ({ project }: { project: any }) => (
    <div className="p-8">
        <h2 className="text-3xl font-black text-white mb-6">Construction & Commissioning</h2>
        <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">Installation Progress</h3>
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden mb-2">
                    <div className="bg-amber-500 h-full w-[45%]"></div>
                </div>
                <p className="text-right text-amber-500 font-bold">45%</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">Commissioning Checklist</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">✓</div>
                        <span>Foundation Level Check</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-5 h-5 rounded-full border border-current"></div>
                        <span>Dry Stroke Test</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-5 h-5 rounded-full border border-current"></div>
                        <span>Load Rejection (12mm-16mm Guard Active)</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
