import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, getFrancisPath, getMaintenancePath } from '../../routes/paths.ts';
import { useAudit } from '../../contexts/AuditContext.tsx';
import { useTranslation } from 'react-i18next';
import {
    ChevronDown, ChevronRight, Plus, Search, X,
    FileText, Shield, Settings, Zap, BookOpen, Target,
    AlertTriangle, Cpu, Gauge, Map, ChevronLeft,
    Home, ClipboardList, Wrench, User
} from 'lucide-react';
import { FleetOverview } from './FleetOverview.tsx';
import { ErrorBoundary } from '../ErrorBoundary.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextAwareness } from '../../contexts/ContextAwarenessContext';
import { useAssetContext } from '../../contexts/AssetContext';
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
    glowColor: string;
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
        <div className="border-b border-black/5 bg-black/5">
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Map className="w-3.5 h-3.5 text-slate-500" />
                    <span className={`text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest transition-colors ${isExpanded ? 'text-cyan-600' : ''}`}>
                        {t('sidebar.fleet_overview')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRegisterAsset();
                        }}
                        className="p-1 rounded bg-black/10 text-slate-600 hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-black/5"
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
        <div className="mb-1 transition-all">
            <button
                onClick={onToggle}
                className={`w-full px-4 py-2.5 flex items-center justify-between transition-all relative overflow-hidden group/accordion ${hasActiveModule ? 'bg-black/5' : 'hover:bg-white/5'}`}
            >
                <div className={`absolute inset-0 border-b border-black/5 ${isExpanded ? 'bg-black/5' : ''}`} />

                <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-1.5 rounded bg-black/10 shadow-[inner_0_1px_2px_rgba(0,0,0,0.2)] ${sector.color}`}>
                        {sector.icon}
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#2f3542]">
                            {sector.title}
                        </span>
                        {hasActiveModule && (
                            <div className="text-[8px] font-mono text-cyan-600 font-black animate-pulse">SYSTEM_ACTIVE</div>
                        )}
                    </div>
                </div>

                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/5"
                    >
                        <div className="p-1 space-y-0.5">
                            {filteredModules.map((module) => {
                                const isActive = currentPath === module.route;
                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => onNavigate(module.route, module.title)}
                                        className={`w-full text-left px-11 py-2 text-[10px] font-mono flex items-center justify-between transition-all group/item ${isActive ? 'text-black font-black bg-white/40 shadow-sm' : 'text-slate-600 hover:text-black hover:bg-white/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="opacity-60 grayscale group-hover/item:grayscale-0 transition-all">{module.icon}</span>
                                            <span>{module.title}</span>
                                            {module.isoRef && (
                                                <span className="text-[7px] bg-black/10 px-1 rounded opacity-50">{module.isoRef}</span>
                                            )}
                                        </div>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 shadow-[0_0_8px_rgba(8,145,178,0.5)]" />}
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
    const [isTurbinesExpanded, setIsTurbinesExpanded] = useState(true);

    const menuItems = useMemo(() => [
        { id: 'home', title: t('sidebar.modules.mission_control', 'Početna'), route: '/', icon: <Home className="w-4 h-4 text-cyan-600" /> },
        { id: 'logbook', title: t('sidebar.modules.logbook', 'Moj Logbook'), route: '/logbook', icon: <ClipboardList className="w-4 h-4 text-amber-600" /> },
        { id: 'problems', title: t('sidebar.modules.problems', 'Detekcija problema'), route: '/problems', icon: <Cpu className="w-4 h-4 text-red-500" /> },
        { id: 'francis', title: 'Francis', route: '/turbines/francis', icon: <span className="text-sm">🌊</span>, parent: 'turbines' },
        { id: 'pelton', title: 'Pelton', route: '/turbines/pelton', icon: <span className="text-sm">💧</span>, parent: 'turbines' },
        { id: 'kaplan', title: 'Kaplan', route: '/turbines/kaplan', icon: <span className="text-sm">🔄</span>, parent: 'turbines' },
        { id: 'tools', title: t('sidebar.modules.engineering_tools', 'Inžinjerski alati'), route: '/hpp-builder', icon: <Wrench className="w-4 h-4 text-purple-600" /> },
        { id: 'knowledge', title: t('sidebar.modules.knowledge', 'Znanje'), route: '/knowledge-base', icon: <BookOpen className="w-4 h-4 text-cyan-600" /> },
        { id: 'profile', title: t('sidebar.modules.profile', 'Profil & Postavke'), route: '/profile', icon: <User className="w-4 h-4 text-slate-600" /> }
    ], [t]);

    const handleNavigate = (route: string, title: string) => {
        logAction('NAVIGATION', `Accessed ${title}`);
        navigate(route);
        if (window.innerWidth < 1024) onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isVisible = (id: string) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const item = menuItems.find(m => m.id === id);
        if (!item) return false;
        return item.title.toLowerCase().includes(query);
    };

    // Auto-expand turbines if searching for a sub-item
    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchingSub = menuItems.some(m => m.parent === 'turbines' && m.title.toLowerCase().includes(query));
            if (matchingSub) {
                setIsTurbinesExpanded(true);
            }
        }
    }, [searchQuery, menuItems]);

    const industrialGradient = "bg-gradient-to-br from-[#f1f2f6] via-[#ced6e0] to-[#747d8c]";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* MOBILE OVERLAY */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden"
                    />

                    {/* MAIN SIDEBAR */}
                    <motion.div
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed lg:relative left-0 top-0 bottom-0 h-full w-[280px] ${industrialGradient} border-r border-[#2f3542]/40 z-[100] flex flex-col shadow-[12px_0_32px_rgba(0,0,0,0.5)] overflow-hidden transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        {/* BRUSHED METAL TEXTURE */}
                        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] pointer-events-none mix-blend-overlay" />

                        {/* EDGE ACCENTS */}
                        <div className="absolute inset-y-0 left-0 w-[2px] bg-white/40 pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-[1px] bg-black/20 pointer-events-none" />

                        {/* HEADER */}
                        <div className="p-6 border-b border-black/10 relative z-10 bg-black/5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">COMMAND CENTER</h2>
                                    <div className="text-sm font-black text-slate-900 tracking-tighter flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse" />
                                        ANOHUB NAV
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 text-slate-600 hover:text-black transition-colors" title="Collapse sidebar">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>

                            {/* SEARCH */}
                            <div className="relative flex items-center bg-black/5 rounded-lg border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] px-3 py-2 transition-all focus-within:border-cyan-500/50">
                                <Search className="w-4 h-4 text-slate-500" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="PRETRAGA..."
                                    className="bg-transparent border-none outline-none ml-2 text-[10px] font-mono text-slate-800 placeholder:text-slate-400 w-full"
                                />
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 min-h-0 overflow-y-auto relative z-10">
                            <FleetSection
                                showMap={showMap}
                                onToggleMap={onToggleMap}
                                onRegisterAsset={onRegisterAsset}
                            />

                            <div className="p-3 space-y-1 bg-black/5">
                                {/* Početna */}
                                {isVisible('home') && (
                                    <button
                                        onClick={() => handleNavigate('/', 'Početna')}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-3 transition-all ${location.pathname === '/' ? 'bg-white/40 text-black font-black shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                    >
                                        <Home className="w-4 h-4 text-cyan-600" />
                                        <span>{menuItems[0].title}</span>
                                    </button>
                                )}

                                {/* Moj Logbook */}
                                {isVisible('logbook') && (
                                    <button
                                        onClick={() => handleNavigate('/logbook', 'Moj Logbook')}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-3 transition-all ${location.pathname === '/logbook' ? 'bg-white/40 text-black font-black shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                    >
                                        <ClipboardList className="w-4 h-4 text-amber-600" />
                                        <span>{menuItems[1].title}</span>
                                    </button>
                                )}

                                {/* Detekcija problema */}
                                {isVisible('problems') && (
                                    <button
                                        onClick={() => handleNavigate('/problems', 'Detekcija problema')}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-3 transition-all ${location.pathname === '/problems' ? 'bg-white/40 text-black font-black shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                    >
                                        <Cpu className="w-4 h-4 text-red-500" />
                                        <span>{menuItems[2].title}</span>
                                    </button>
                                )}

                                {/* Turbine section */}
                                {(isVisible('francis') || isVisible('pelton') || isVisible('kaplan')) && (
                                    <div className="border-t border-black/5 pt-2 mt-2">
                                        <button
                                            onClick={() => setIsTurbinesExpanded(!isTurbinesExpanded)}
                                            className="w-full text-left px-4 py-2 flex items-center justify-between text-[10px] font-mono font-black uppercase tracking-widest text-slate-700 hover:text-black transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Settings className="w-4 h-4 text-slate-600 animate-gear" />
                                                <span>Turbine</span>
                                            </div>
                                            {isTurbinesExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                                        </button>

                                        {isTurbinesExpanded && (
                                            <div className="pl-6 pr-2 py-1 space-y-0.5 mt-1 bg-black/5 rounded-lg">
                                                {/* Francis */}
                                                {isVisible('francis') && (
                                                    <button
                                                        onClick={() => handleNavigate('/turbines/francis', 'Francis Hub')}
                                                        className={`w-full text-left px-3 py-2 rounded text-[10px] font-mono flex items-center gap-3 transition-all ${location.pathname.startsWith('/francis') || location.pathname === '/turbines/francis' || location.pathname === '/turbines' ? 'text-black font-black bg-white/40 shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                                    >
                                                        <span>🌊</span>
                                                        <span>Francis</span>
                                                    </button>
                                                )}

                                                {/* Pelton */}
                                                {isVisible('pelton') && (
                                                    <button
                                                        onClick={() => handleNavigate('/turbines/pelton', 'Pelton Hub')}
                                                        className={`w-full text-left px-3 py-2 rounded text-[10px] font-mono flex items-center gap-3 transition-all ${location.pathname === '/turbines/pelton' ? 'text-black font-black bg-white/40 shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                                    >
                                                        <span>💧</span>
                                                        <span>Pelton</span>
                                                    </button>
                                                )}

                                                {/* Kaplan */}
                                                {isVisible('kaplan') && (
                                                    <button
                                                        onClick={() => handleNavigate('/turbines/kaplan', 'Kaplan Hub')}
                                                        className={`w-full text-left px-3 py-2 rounded text-[10px] font-mono flex items-center gap-3 transition-all ${location.pathname === '/turbines/kaplan' ? 'text-black font-black bg-white/40 shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                                    >
                                                        <span>🔄</span>
                                                        <span>Kaplan</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Inžinjerski alati */}
                                {isVisible('tools') && (
                                    <button
                                        onClick={() => handleNavigate('/hpp-builder', 'Inžinjerski alati')}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-3 transition-all ${location.pathname === '/hpp-builder' ? 'bg-white/40 text-black font-black shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                    >
                                        <Wrench className="w-4 h-4 text-purple-600" />
                                        <span>{menuItems[6].title}</span>
                                    </button>
                                )}

                                {/* Znanje */}
                                {isVisible('knowledge') && (
                                    <button
                                        onClick={() => handleNavigate('/knowledge-base', 'Znanje')}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-3 transition-all ${location.pathname.startsWith('/knowledge-base') ? 'bg-white/40 text-black font-black shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                    >
                                        <BookOpen className="w-4 h-4 text-cyan-600" />
                                        <span>{menuItems[7].title}</span>
                                    </button>
                                )}

                                <div className="border-t border-black/10 my-3" />

                                {/* Profil & Postavke */}
                                {isVisible('profile') && (
                                    <button
                                        onClick={() => handleNavigate('/profile', 'Profil & Postavke')}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-3 transition-all ${location.pathname === '/profile' ? 'bg-white/40 text-black font-black shadow-sm' : 'text-slate-700 hover:text-black hover:bg-white/20'}`}
                                    >
                                        <User className="w-4 h-4 text-slate-600" />
                                        <span>{menuItems[8].title}</span>
                                    </button>
                                )}

                                {/* ACTION BUTTON */}
                                <div className="pt-4 px-2">
                                    <button
                                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded border-b-4 border-slate-950 active:translate-y-0.5 active:border-b-1 transition-all flex items-center justify-center gap-2 group shadow-lg"
                                        onClick={() => window.dispatchEvent(new CustomEvent(TRIGGER_FORENSIC_EXPORT))}
                                    >
                                        <FileText className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">GENERATE_FORENSIC</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 border-t border-black/10 relative z-10 bg-black/5 flex flex-col items-center">
                            <div className="w-full flex justify-between items-center text-[7px] font-mono text-slate-500 mb-2 uppercase tracking-tighter">
                                <div className="flex items-center gap-1">
                                    <Cpu className="w-3 h-3" />
                                    <span>LINK_{hiveStatus?.connected ? 'ESTABLISHED' : 'STANDBY'} // NC-9.0</span>
                                </div>
                                <span className={hiveStatus?.connected ? 'text-emerald-600 font-black' : 'text-slate-500'}>
                                    {hiveStatus?.connected ? 'ENCRYPTED' : 'OFFLINE'}
                                </span>
                            </div>
                            <div className="opacity-40 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                <QrCode size={40} value={`anohub-nc42:${activeDefinition?.id || 'null'}`} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
