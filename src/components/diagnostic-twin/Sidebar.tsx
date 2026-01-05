import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, getFrancisPath, getMaintenancePath } from '../../routes/paths.ts';
import { useAudit } from '../../contexts/AuditContext.tsx';
import { useTranslation } from 'react-i18next';
import {
    ChevronDown, ChevronRight, Plus, Search, X,
    FileText, Shield, Settings, Zap, BookOpen, Target,
    AlertTriangle, Cpu, Gauge, Map
} from 'lucide-react';
import { FleetOverview } from './FleetOverview.tsx';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { LanguageSelector } from '../LanguageSelector.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { QrCode } from '../ui/QrCode';

// GLOBAL EVENT FOR REMOTE TRIGGER
export const TRIGGER_FORENSIC_EXPORT = 'ANOHUB_TRIGGER_FORENSIC_EXPORT';

// --- MISSION SECTOR DEFINITIONS ---
interface SectorModule {
    id: string;
    title: string;
    icon: string;
    route: string;
    isoRef?: string;
}

interface MissionSector {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    modules: SectorModule[];
}

// --- FLEET SECTION COMPONENT ---
interface FleetSectionProps {
    showMap: boolean;
    onToggleMap: () => void;
    onRegisterAsset: () => void;
}

const FleetSection: React.FC<FleetSectionProps> = ({ showMap, onToggleMap, onRegisterAsset }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="border-b border-cyan-900/30 bg-slate-950/50">
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Map className="w-3.5 h-3.5 text-slate-500" />
                    <span className={`text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest transition-colors ${isExpanded ? 'text-cyan-400' : ''}`}>
                        {t('sidebar.fleet_overview')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRegisterAsset();
                        }}
                        className="p-1 rounded bg-emerald-900/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-emerald-900/30"
                        title="Register New Asset"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4">
                            <ErrorBoundary fallback={<div className="p-4 text-xs text-red-500 font-mono">FLEET UNAVAILABLE</div>}>
                                <FleetOverview
                                    onToggleMap={onToggleMap}
                                    showMap={showMap}
                                    onRegisterAsset={onRegisterAsset}
                                />
                            </ErrorBoundary>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MISSION SECTOR ACCORDION ---
interface SectorAccordionProps {
    sector: MissionSector;
    isExpanded: boolean;
    onToggle: () => void;
    currentPath: string;
    onNavigate: (route: string, title: string) => void;
    searchQuery: string;
}

const SectorAccordion: React.FC<SectorAccordionProps> = ({
    sector, isExpanded, onToggle, currentPath, onNavigate, searchQuery
}) => {
    const filteredModules = useMemo(() => {
        if (!searchQuery) return sector.modules;
        const query = searchQuery.toLowerCase();
        return sector.modules.filter(m =>
            m.title.toLowerCase().includes(query) ||
            m.isoRef?.toLowerCase().includes(query)
        );
    }, [sector.modules, searchQuery]);

    if (searchQuery && filteredModules.length === 0) return null;

    const hasActiveModule = filteredModules.some(m => currentPath === m.route);

    return (
        <div className={`rounded-lg overflow-hidden border ${sector.borderColor} bg-slate-900/30 mb-1.5`}>
            <button
                onClick={onToggle}
                className={`w-full px-3 py-2.5 flex items-center justify-between transition-colors ${hasActiveModule ? 'bg-cyan-500/10' : 'hover:bg-white/5'}`}
            >
                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded ${sector.color}`}>
                        {sector.icon}
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                        {sector.title}
                    </span>
                    {hasActiveModule && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    )}
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                    >
                        <div className="px-2 pb-2 space-y-0.5">
                            {filteredModules.map((module) => {
                                const isActive = currentPath === module.route;
                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => onNavigate(module.route, module.title)}
                                        className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-all ${isActive
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                            }`}
                                    >
                                        <span className="text-sm">{module.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wide block truncate">
                                                {module.title}
                                            </span>
                                            {module.isoRef && (
                                                <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">
                                                    {module.isoRef}
                                                </span>
                                            )}
                                        </div>
                                        {isActive && <div className="w-1 h-1 rounded-full bg-cyan-400 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
    const navigate = useNavigate();
    const { logAction } = useAudit();
    const { t } = useTranslation();
    const { activeDefinition, hiveStatus } = useContextAwareness();

    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Accordion state with localStorage persistence
    const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem('sidebar_expandedSectors_v2');
            if (saved) return JSON.parse(saved);
        } catch { }
        return { criticalOps: true, mechanical: false, electrical: false, risk: false, knowledge: false };
    });

    useEffect(() => {
        localStorage.setItem('sidebar_expandedSectors_v2', JSON.stringify(expandedSectors));
    }, [expandedSectors]);

    // Mission Sectors Configuration (NC-4.2 Industrial Hierarchy)
    const missionSectors: MissionSector[] = useMemo(() => [
        {
            id: 'criticalOps',
            title: t('sidebar.sectors.critical_ops'),
            icon: <Target className="w-3.5 h-3.5 text-red-400" />,
            color: 'bg-red-500/20',
            borderColor: 'border-red-500/20',
            modules: [
                { id: 'missionControl', title: t('sidebar.modules.mission_control'), icon: '🎯', route: ROUTES.HOME },
                { id: 'francisHub', title: t('sidebar.modules.francis_hub'), icon: '🧠', route: getFrancisPath(ROUTES.FRANCIS.HUB) },
                { id: 'diagnosticTwin', title: t('sidebar.modules.diagnostic_twin'), icon: '♊', route: `/${ROUTES.DIAGNOSTIC_TWIN}` },
            ]
        },
        {
            id: 'mechanical',
            title: t('sidebar.sectors.mechanical'),
            icon: <Settings className="w-3.5 h-3.5 text-amber-400" />,
            color: 'bg-amber-500/20',
            borderColor: 'border-amber-500/20',
            modules: [
                { id: 'shaftAlignment', title: t('sidebar.modules.shaft_alignment'), icon: '🔄', route: getFrancisPath(ROUTES.FRANCIS.SOP.ALIGNMENT), isoRef: 'ISO 13705' },
                { id: 'boltTorque', title: t('sidebar.modules.bolt_torque'), icon: '🔩', route: getMaintenancePath(ROUTES.MAINTENANCE.BOLT_TORQUE), isoRef: 'EN 1591-1' },
                { id: 'labyrinthHealth', title: t('sidebar.modules.labyrinth_health'), icon: '🌀', route: getMaintenancePath(ROUTES.MAINTENANCE.HYDRAULIC), isoRef: 'API 610' },
                { id: 'hydraulicMaint', title: t('sidebar.modules.hydraulic_maint'), icon: '🚰', route: getMaintenancePath(ROUTES.MAINTENANCE.HYDRAULIC) },
                { id: 'maintenanceEngine', title: t('sidebar.modules.maintenance_engine'), icon: '⚙️', route: getMaintenancePath(ROUTES.MAINTENANCE.DASHBOARD) },
            ]
        },
        {
            id: 'electrical',
            title: t('sidebar.sectors.electrical'),
            icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
            color: 'bg-yellow-500/20',
            borderColor: 'border-yellow-500/20',
            modules: [
                { id: 'gridSync', title: t('sidebar.modules.grid_sync'), icon: '📡', route: '/executive', isoRef: 'IEC 61850' },
                { id: 'generatorIntegrity', title: t('sidebar.modules.generator_integrity'), icon: '⚡', route: `/${ROUTES.INFRASTRUCTURE.ROOT}`, isoRef: 'IEEE C50' },
                { id: 'excitation', title: t('sidebar.modules.excitation'), icon: '🔌', route: `/${ROUTES.INFRASTRUCTURE.ROOT}`, isoRef: 'IEEE 421' },
                { id: 'executive', title: t('sidebar.modules.executive'), icon: '📊', route: '/executive' },
            ]
        },
        {
            id: 'risk',
            title: t('sidebar.sectors.risk'),
            icon: <Shield className="w-3.5 h-3.5 text-purple-400" />,
            color: 'bg-purple-500/20',
            borderColor: 'border-purple-500/20',
            modules: [
                { id: 'barlowAudit', title: t('sidebar.modules.barlow_audit'), icon: '🔬', route: `/${ROUTES.STRUCTURAL_INTEGRITY}`, isoRef: 'ASME B31.1' },
                { id: 'longevityRoadmap', title: t('sidebar.modules.longevity_roadmap'), icon: '🗺️', route: `/${ROUTES.RISK_ASSESSMENT}` },
                { id: 'forensicAnalysis', title: t('sidebar.modules.forensic_analysis'), icon: '🔍', route: '/forensics' },
                { id: 'precisionAudit', title: t('sidebar.modules.precision_audit'), icon: '📏', route: `/${ROUTES.INSTALLATION_GUARANTEE}` },
            ]
        },
        {
            id: 'knowledge',
            title: t('sidebar.sectors.knowledge'),
            icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />,
            color: 'bg-cyan-500/20',
            borderColor: 'border-cyan-500/20',
            modules: [
                { id: 'sopManager', title: t('sidebar.modules.sop_manager'), icon: '👻', route: getMaintenancePath(ROUTES.MAINTENANCE.SHADOW_ENGINEER) },
                { id: 'engineeringManifesto', title: t('sidebar.modules.engineering_manifesto'), icon: '📜', route: `/${ROUTES.LEARNING_LAB}` },
                { id: 'learningLab', title: t('sidebar.modules.learning_lab'), icon: '🎓', route: `/${ROUTES.LEARNING_LAB}` },
                { id: 'intuitionLog', title: t('sidebar.modules.intuition_log'), icon: '👂', route: getMaintenancePath(ROUTES.MAINTENANCE.INTUITION_LOG) },
                { id: 'logbook', title: t('sidebar.modules.logbook'), icon: '📓', route: getMaintenancePath(ROUTES.MAINTENANCE.LOGBOOK) },
                { id: 'hppBuilder', title: t('sidebar.modules.hpp_studio'), icon: '⚡', route: `/${ROUTES.HPP_BUILDER}` },
            ]
        }
    ], [t]);

    const toggleSector = (sectorId: string) => {
        setExpandedSectors(prev => ({ ...prev, [sectorId]: !prev[sectorId] }));
    };

    const handleNavigate = (route: string, title: string) => {
        logAction('NAVIGATION', `Accessed ${title}`);
        navigate(route);
        if (window.innerWidth < 1024) onClose();
    };

    // Keyboard shortcut for search (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-expand sectors matching search
    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchingSectors: Record<string, boolean> = {};
            missionSectors.forEach(sector => {
                const hasMatch = sector.modules.some(m =>
                    m.title.toLowerCase().includes(query) ||
                    m.isoRef?.toLowerCase().includes(query)
                );
                matchingSectors[sector.id] = hasMatch;
            });
            setExpandedSectors(prev => ({ ...prev, ...matchingSectors }));
        }
    }, [searchQuery, missionSectors]);

    return (
        <>
            {/* OVERLAY for Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR CONTAINER */}
            <motion.div
                className={`fixed top-0 left-0 h-full w-72 bg-slate-950 z-40 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-cyan-900/40 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Blueprint Grid Background */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(34, 211, 238, 0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34, 211, 238, 0.02) 1px, transparent 1px)
                        `,
                        backgroundSize: '30px 30px'
                    }}
                />

                {/* 1. HEADER */}
                <div className="p-4 border-b border-cyan-900/40 flex items-center justify-between relative z-10">
                    <div
                        className="flex items-center gap-2.5 cursor-pointer group transition-all hover:opacity-80"
                        onClick={() => navigate(ROUTES.HOME)}
                    >
                        <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/40 rounded flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                            <span className="text-base font-black text-cyan-400 font-mono">Ah</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white tracking-widest uppercase font-mono">AnoHUB</h1>
                            <span className="text-[8px] text-cyan-500 font-mono font-bold tracking-[0.15em]">NC-4.2 COMMAND</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* 2. QUICK SEARCH */}
                <div className="px-3 py-2.5 border-b border-cyan-900/30 relative z-10">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Quick Search... (Ctrl+K)"
                            className="w-full pl-8 pr-8 py-2 bg-slate-900/80 border border-cyan-900/40 rounded text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. SCROLLABLE NAVIGATION */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                    <FleetSection
                        showMap={showMap}
                        onToggleMap={onToggleMap}
                        onRegisterAsset={onRegisterAsset}
                    />

                    <div className="p-2.5 space-y-0.5">
                        <div className="px-2 py-1.5 text-[8px] font-mono font-black text-slate-600 uppercase tracking-[0.2em]">
                            MISSION SECTORS
                        </div>

                        {missionSectors.map((sector) => (
                            <SectorAccordion
                                key={sector.id}
                                sector={sector}
                                isExpanded={expandedSectors[sector.id] || false}
                                onToggle={() => toggleSector(sector.id)}
                                currentPath={location.pathname}
                                onNavigate={handleNavigate}
                                searchQuery={searchQuery}
                            />
                        ))}

                        {/* FORENSIC EXPORT ACTION */}
                        <div className="pt-3">
                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent(TRIGGER_FORENSIC_EXPORT));
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded flex items-center justify-center gap-2 transition-all"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-mono font-black uppercase tracking-widest">
                                    GENERATE FORENSIC
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. FOOTER */}
                <div className="p-3 border-t border-cyan-900/40 relative z-10 space-y-3">
                    <LanguageSelector />

                    {/* HIVE STATUS */}
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <Cpu className="w-3 h-3" />
                            <span>HIVE LINK</span>
                        </div>
                        <span className={`font-bold ${hiveStatus?.connected ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {hiveStatus?.connected ? 'CONNECTED' : 'OFFLINE'}
                        </span>
                    </div>

                    {/* QR CODE */}
                    <div className="flex justify-center pt-2 border-t border-cyan-900/20">
                        <QrCode value={`anohub-nc42:${Date.now()}:${activeDefinition?.id}`} size={56} />
                    </div>
                </div>
            </motion.div>
        </>
    );
};
