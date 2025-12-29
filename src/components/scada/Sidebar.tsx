import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation, AppView } from '../../contexts/NavigationContext.tsx';
import { useAudit } from '../../contexts/AuditContext.tsx';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { FleetOverview } from './FleetOverview.tsx';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { LanguageSelector } from '../LanguageSelector.tsx';

// --- FLEET SECTION COMPONENT ---
interface FleetSectionProps {
    showMap: boolean;
    onToggleMap: () => void;
    onRegisterAsset: () => void;
}

const FleetSection: React.FC<FleetSectionProps> = ({ showMap, onToggleMap, onRegisterAsset }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border-b border-white/5 bg-slate-900/50">
            {/* Header - Always Visible */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em] transition-colors ${isExpanded ? 'text-cyan-400' : ''}`}>
                        {useTranslation().t('sidebar.fleetOverview')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Quick Add Button (Visible even when collapsed) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRegisterAsset();
                        }}
                        className="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Register New Asset"
                    >
                        <Plus className="w-3 h-3" />
                    </button>

                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
            </div>

            {/* Content - Collapsible */}
            {isExpanded && (
                <div className="pb-4 animate-in slide-in-from-top-2 duration-200">
                    <ErrorBoundary fallback={<div className="p-4 text-xs text-red-500 bg-red-950/30 border border-red-500/30 rounded">Fleet Overview Unavailable</div>}>
                        <FleetOverview
                            onToggleMap={onToggleMap}
                            showMap={showMap}
                            onRegisterAsset={onRegisterAsset}
                        />
                    </ErrorBoundary>
                </div>
            )}
        </div>
    );
};

// --- SIDEBAR COMPONENT ---
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    showMap: boolean;
    onToggleMap: () => void;
    onRegisterAsset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, showMap, onToggleMap, onRegisterAsset }) => {
    const location = useLocation();
    const { navigateTo } = useNavigation();
    const { logAction } = useAudit();
    const { t } = useTranslation();

    const operationalModules = [
        { id: 'riskAssessment', title: t('modules.riskAssessment', 'Risk Diagnostics'), icon: '🛡️' },
        { id: 'maintenanceDashboard', title: t('modules.maintenance', 'Maintenance Engine'), icon: '⚙️' },
        { id: 'shaftAlignment', title: t('sidebar.shaftAlignment', 'Shaft Alignment'), icon: '🔄' },
        { id: 'hydraulicMaintenance', title: t('sidebar.hydraulicMaintenance', 'Hydraulic Maintenance'), icon: '🚰' },
        { id: 'boltTorque', title: t('sidebar.boltTorque', 'Bolt Torque'), icon: '🔩' },
        { id: 'shadowEngineer', title: t('sidebar.shadowEngineer', 'Shadow Engineer'), icon: '👻' },
        { id: 'intuitionLog', title: t('sidebar.intuitionLog', 'Intuition Log'), icon: '👂' },
        { id: 'structuralIntegrity', title: t('sidebar.structuralIntegrity', 'Structural Integrity'), icon: '🏗️' },
        { id: 'installationGuarantee', title: t('modules.installationGuarantee', 'Precision Audit'), icon: '📏' },
        { id: 'hppBuilder', title: t('modules.hppBuilder', 'HPP Studio'), icon: '⚡' },
    ];

    const secondaryModules = [
        { id: 'riskReport', title: t('modules.riskReport', 'Dossier Archive'), icon: '📂' },
        { id: 'library', title: t('modules.library', 'Tech Library'), icon: '📚' },
        { id: 'standardOfExcellence', title: t('modules.standardOfExcellence'), icon: '🏅' },
        { id: 'activeContext', title: t('hub.vision'), icon: '👁️' }
    ];

    const handleNavigation = (id: string, title: string) => {
        logAction('MODULE_OPEN', title, 'SUCCESS');
        navigateTo(id as AppView);
        onClose();
    };

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-[280px] bg-slate-950/95 backdrop-blur-3xl border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl
                ring-1 ring-white/5 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <FleetSection
                    showMap={showMap}
                    onToggleMap={onToggleMap}
                    onRegisterAsset={onRegisterAsset}
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1 relative z-10">

                    {/* OPERATIONS */}
                    <div className="px-4 py-2 text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em]">{t('sidebar.operations')}</div>
                    <ErrorBoundary>
                        {operationalModules.map(mod => (
                            <button
                                key={mod.id}
                                onClick={() => handleNavigation(mod.id, mod.title)}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${location.pathname.includes(mod.id.replace('Dashboard', '')) || (location.pathname.includes('shadow-engineer') && mod.id === 'shadowEngineer') || (location.pathname.includes('intuition-log') && mod.id === 'intuitionLog') ? 'bg-cyan-900/20 border-h-cyan text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
                            >
                                <span className={`text-lg ${location.pathname.includes(mod.id.replace('Dashboard', '')) ? 'text-h-cyan' : 'group-hover:text-h-cyan transition-colors'}`}>{mod.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{mod.title}</span>
                            </button>
                        ))}

                        {/* Logbook Special Case */}
                        <button
                            onClick={() => handleNavigation('logbook', t('sidebar.maintenanceLogbook', 'Logbook'))}
                            className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group ${location.pathname === '/logbook' ? 'bg-[#2dd4bf]/20 border-[#2dd4bf] text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
                        >
                            <span className={`text-lg ${location.pathname === '/logbook' ? 'text-[#2dd4bf]' : 'group-hover:text-[#2dd4bf] transition-colors'}`}>🛡️</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{t('sidebar.maintenanceLogbook', 'Logbook')}</span>
                        </button>
                    </ErrorBoundary>

                    <div className="my-4 border-t border-white/5 mx-4"></div>

                    {/* STRATEGY */}
                    <div className="px-4 py-2 text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em]">{t('sidebar.strategy')}</div>
                    <ErrorBoundary>
                        <button
                            onClick={() => handleNavigation('executiveDashboard', t('sidebar.toolboxAnalytics', 'Toolbox Analytics'))}
                            className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${location.pathname === '/executive' ? 'bg-cyan-900/20 border-cyan-500 text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
                        >
                            <span className={`text-lg ${location.pathname === '/executive' ? 'text-cyan-500' : 'group-hover:text-cyan-400 transition-colors'}`}>📊</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{t('sidebar.toolboxAnalytics', 'Toolbox Analytics')}</span>
                        </button>
                    </ErrorBoundary>

                    <div className="my-4 border-t border-white/5 mx-4"></div>

                    {/* KNOWLEDGE */}
                    <div className="px-4 py-2 text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.1em]">{t('sidebar.knowledge')}</div>
                    <ErrorBoundary>
                        {secondaryModules.map(mod => (
                            <button
                                key={mod.id}
                                onClick={() => handleNavigation(mod.id, mod.title)}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group text-left whitespace-normal h-auto min-h-[48px] ${location.pathname.includes(mod.id) ? 'bg-cyan-900/20 border-h-cyan text-white' : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-white'}`}
                            >
                                <span className={`text-lg ${location.pathname.includes(mod.id) ? 'text-h-cyan' : 'group-hover:text-h-gold transition-colors'}`}>{mod.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{mod.title}</span>
                            </button>
                        ))}
                    </ErrorBoundary>

                    <div className="my-4 border-t border-white/5 mx-4"></div>

                    <a
                        href="https://www.anohubs.com"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-4 py-3 border-l-2 border-transparent hover:bg-slate-900 text-slate-500 hover:text-white transition-all group"
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">🌐</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('sidebar.exitToSite')}</span>
                    </a>
                </div>
            </aside>
        </>
    );
};
