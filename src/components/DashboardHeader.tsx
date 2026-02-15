import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { DigitalPanel } from './diagnostic-twin/DigitalPanel';
import { LanguageSelector } from './LanguageSelector';
import { ROUTES } from '../routes/paths';
import { Search, Command, X, ShieldCheck, Activity, Database, ChevronRight, ChevronDown, Settings, BarChart3, Wrench, Zap, Square, Grid, Network } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRisk } from '../contexts/RiskContext';
import { useRiskCalculator } from '../hooks/useRiskCalculator';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useAssetContext } from '../contexts/AssetContext'; // <--- NEW
import { useContextAwareness } from '../contexts/ContextAwarenessContext'; // <--- NEW
import { useDensity } from '../stores/useAppStore'; // <--- Density Control Phase 4
import { dispatch } from '../lib/events';

interface DashboardHeaderProps {
    onToggleSidebar: () => void;
    title?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleSidebar, title }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const telemetry = useTelemetryStore();
    const { riskState: questionnaireRisk } = useRisk();
    const { status: assetRiskStatus, reason: riskReasons } = useRiskCalculator();
    const { selectedAsset } = useAssetContext(); // <--- Get Active Asset
    const { activePersona, hiveStatus } = useContextAwareness(); // <--- Get Persona & Sync
    const { densityMode: mode, toggleDensity } = useDensity();
    const { isCommanderMode, toggleCommanderMode } = telemetry;

    // const [searchQuery, setSearchQuery] = useState(''); // Removed in favor of Global Command Palette
    // const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
    const [isSystemOverviewOpen, setIsSystemOverviewOpen] = useState(false);

    // Heritage (NC-9.0) Logic
    const alignment = telemetry.mechanical?.alignment || 0;
    const water = telemetry.fluidIntelligence?.oilSystem?.waterContentPPM || 0;
    const tan = telemetry.fluidIntelligence?.oilSystem?.tan || 0;
    const isHeritageCertified = alignment <= 0.05 && water <= 500 && tan <= 0.5 && tan > 0;


    // Search Index Removed - Replaced by Global CommandPalette.tsx (Ctrl+K)

    const triggerCommandPalette = () => {
        dispatch.openCommandPalette();
    };

    // Badge Logic
    const isCritical = questionnaireRisk.criticalFlags > 0 || assetRiskStatus === 'CRITICAL';
    const isWarning = assetRiskStatus === 'WARNING';
    const badgeLabel = t(`dashboard.riskStatus.${isCritical ? 'critical' : isWarning ? 'warning' : 'normal'}`);
    const badgeStatus = isCritical ? "critical" : isWarning ? "warning" : "normal";

    const handleBadgeClick = () => {
        if (assetRiskStatus !== 'SAFE') console.log("Risk Reasons:", riskReasons);
        navigate('riskAssessment');
    };

    // --- MISSION STATUS BAR LOGIC ---
    const getMissionMode = () => {
        if (location.pathname.includes('executive')) return 'COMMAND';
        if (location.pathname.includes('maintenance') || location.pathname === '/') return 'FIELD OPS';
        if (location.pathname.includes('francis/designer')) return 'DESIGN STUDIO';
        return activePersona === 'TECHNICIAN' ? 'FIELD OPS' : 'COMMAND';
    };

    return (
        <>
            <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-slate-950/90 backdrop-blur-md flex items-center justify-between px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">

                {/* LEFT: Identity & Status */}
                <div className="flex items-center gap-6">
                    <button onClick={onToggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white">☰</button>

                    {/* MISSION STATUS BAR */}
                    <div className="flex items-center gap-3 text-xs font-mono tracking-wider">
                        {title && <div className="hidden md:block mr-4">{title}</div>}

                        {/* 1. ASSET SEGMENT (Enhanced with Quick Actions) */}
                        <div className="relative">
                            <button
                                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${selectedAsset ? 'bg-cyan-950/30 border-cyan-500/30 hover:border-cyan-500/50' : 'bg-slate-900/30 border-slate-700/30 hover:border-slate-600/50'}`}
                            >
                                <Database className={`w-3.5 h-3.5 ${selectedAsset ? 'text-cyan-400' : 'text-slate-600'}`} />
                                <div className="flex flex-col items-start">
                                    <span className={`font-bold ${selectedAsset ? 'text-white' : 'text-slate-500'}`}>
                                        {selectedAsset ? selectedAsset.name.toUpperCase() : t('header.fleetView', 'FLEET VIEW')}
                                    </span>
                                    {selectedAsset && (
                                        <span className="text-[9px] text-cyan-400/70">
                                            {(selectedAsset.turbine_type || selectedAsset.type || 'HPP').toUpperCase()} | {selectedAsset.capacity?.toFixed(1) || '—'} MW
                                        </span>
                                    )}
                                </div>
                                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Quick Actions Dropdown */}
                            {isQuickActionsOpen && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-scale-in">
                                    <div className="p-2 border-b border-white/5">
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-2">{t('header.quickActions', 'Quick Actions')}</span>
                                    </div>
                                    <div className="p-1">
                                        <button
                                            onClick={() => { navigate('/hpp-builder'); setIsQuickActionsOpen(false); }}
                                            disabled={!selectedAsset}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selectedAsset ? 'hover:bg-cyan-500/10 text-slate-300 hover:text-white' : 'opacity-40 cursor-not-allowed text-slate-600'}`}
                                        >
                                            <Settings className="w-4 h-4 text-cyan-400" />
                                            <div>
                                                <span className="text-sm font-bold">{t('header.editSpecs', 'Edit Technical Specs')}</span>
                                                <p className="text-[9px] text-slate-500">{t('header.editSpecsDesc', 'HPP Builder Studio')}</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => { navigate('/executive'); setIsQuickActionsOpen(false); }}
                                            disabled={!selectedAsset}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selectedAsset ? 'hover:bg-emerald-500/10 text-slate-300 hover:text-white' : 'opacity-40 cursor-not-allowed text-slate-600'}`}
                                        >
                                            <BarChart3 className="w-4 h-4 text-emerald-400" />
                                            <div>
                                                <span className="text-sm font-bold">{t('header.viewAnalytics', 'View Live Analytics')}</span>
                                                <p className="text-[9px] text-slate-500">{t('header.viewAnalyticsDesc', 'Executive Dashboard')}</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => { navigate('/maintenance/dashboard'); setIsQuickActionsOpen(false); }}
                                            disabled={!selectedAsset}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selectedAsset ? 'hover:bg-amber-500/10 text-slate-300 hover:text-white' : 'opacity-40 cursor-not-allowed text-slate-600'}`}
                                        >
                                            <Wrench className="w-4 h-4 text-amber-400" />
                                            <div>
                                                <span className="text-sm font-bold">{t('header.performMaintenance', 'Perform Maintenance')}</span>
                                                <p className="text-[9px] text-slate-500">{t('header.performMaintenanceDesc', 'Field Toolbox')}</p>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="p-2 border-t border-white/5">
                                        <button
                                            onClick={() => { navigate('/'); setIsQuickActionsOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                                        >
                                            <Zap className="w-4 h-4" />
                                            <span className="text-xs font-bold">{t('header.viewFleet', 'View Full Fleet')}</span>
                                        </button>
                                        <button
                                            onClick={() => { dispatch.triggerForensicExport(); setIsQuickActionsOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-left bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                        >
                                            <Activity className="w-4 h-4" />
                                            <span className="text-xs font-bold">{t('header.forensicExport', 'Forensic Export')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <span className="text-slate-700">|</span>

                        {/* 2. MODE SEGMENT (Dynamic Breadcrumb) */}
                        <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold text-amber-500/90">
                                {getMissionMode()}
                            </span>
                        </div>

                        <span className="text-slate-700">|</span>

                        {/* 3. SYNC SEGMENT */}
                        <div className="flex items-center gap-2" title={hiveStatus?.connected ? "Online & Synced" : "Offline Mode"}>
                            <div className={`w-2 h-2 rounded-full ${hiveStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                            <span className={`${hiveStatus?.connected ? 'text-emerald-500' : 'text-slate-600'} font-bold`}>
                                {hiveStatus?.connected ? 'LIVE' : 'OFFLINE'}
                            </span>
                        </div>

                        <span className="text-slate-700">|</span>

                        {/* 4. SYSTEM TOPOLOGY */}
                        <button
                            onClick={() => dispatch.openSystemOverview()}
                            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Open System Topology Map"
                        >
                            <Network className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">TOPOLOGY</span>
                        </button>

                    </div>

                    {/* Command Search (Desktop) */}
                    {/* Command Search (Desktop) */}
                    <button
                        onClick={triggerCommandPalette}
                        className="hidden xl:flex items-center gap-2 px-3 py-1.5 ml-4 bg-white/5 border border-white/10 rounded text-[10px] text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                    >
                        <Search className="w-3 h-3" />
                        <span>SEARCH</span>
                        <span className="ml-1 opacity-50">CTRL+K</span>
                    </button>
                </div>

                {/* RIGHT: Global Actions */}
                <div className="flex items-center gap-4">
                    {/* Density Toggle */}
                    <button
                        onClick={toggleDensity}
                        title={mode === 'compact' ? "Switch to Relaxed View" : "Switch to Compact View"}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        {mode === 'compact' ? <Square className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                    </button>

                    {/* Mobile Search Icon */}
                    <button onClick={triggerCommandPalette} className="md:hidden p-2 text-slate-400">
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Commander Mode Toggle (NC-8.0 Global) */}
                    <button
                        onClick={toggleCommanderMode}
                        title={isCommanderMode ? "Switch to Developer View" : "Switch to Commander Mode (NC-9.0)"}
                        className={`p-2 rounded-full transition-all duration-500 ${isCommanderMode ? 'bg-h-gold/20 text-h-gold shadow-[0_0_15px_rgba(255,184,0,0.3)] border border-h-gold/50' : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/20'}`}
                    >
                        <ShieldCheck className={`w-5 h-5 ${isCommanderMode ? 'fill-current' : ''}`} />
                    </button>

                    {/* Heritage Status (Golden Seal) */}
                    <button
                        onClick={() => navigate('/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.MANIFESTO)}
                        className={`p-2 rounded-full transition-all duration-500 group relative ${isHeritageCertified ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-500/50' : 'bg-white/5 text-slate-600 border border-white/5'}`}
                        title={isHeritageCertified ? "Heritage Certified - Tier 1 Asset" : "Heritage Certification Pending"}
                    >
                        <ShieldCheck className={`w-5 h-5 ${isHeritageCertified ? 'animate-pulse' : 'opacity-40'}`} />
                        {isHeritageCertified && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                        )}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[9px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                            {isHeritageCertified ? 'Roots of Engineering: Certified' : 'Heritage Status: Dormant'}
                        </div>
                    </button>

                    <div
                        onClick={handleBadgeClick}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        title={`Risk Status: ${badgeLabel}`}
                    >
                        <DigitalPanel
                            label={t('dashboard.riskStatus.label', 'RISK STATUS')}
                            value={t(`dashboard.riskStatus.${badgeStatus}`, badgeLabel)}
                            status={badgeStatus}
                        />
                    </div>

                    {user && (
                        <button
                            onClick={() => setShowSignOutDialog(true)}
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-800/50 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded transition-all hidden md:block"
                        >
                            {t('auth.signOut', 'Sign Out')}
                        </button>
                    )}
                    <LanguageSelector />
                </div>
            </header>

            {/* Command Palette Modal Removed - Now Global via App.tsx */}

            {/* Sign Out Dialog */}
            {showSignOutDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-4">
                    <div className="bg-slate-950/90 glass-panel-deep border border-red-500/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-scale-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{t('header.terminateTitle')}</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">{t('auth.signOutConfirm', 'Are you sure you want to sign out?')}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSignOutDialog(false)}
                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black uppercase tracking-widest text-xs transition-all border border-white/10"
                            >
                                {t('actions.cancel', 'Cancel')}
                            </button>
                            <button
                                onClick={async () => {
                                    await signOut();
                                    setShowSignOutDialog(false);
                                    navigate('/login');
                                }}
                                className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl font-black uppercase tracking-widest text-xs transition-all border border-red-500/30"
                            >
                                {t('auth.signOut', 'Sign Out')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};
