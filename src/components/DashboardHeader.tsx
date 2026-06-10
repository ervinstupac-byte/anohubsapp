import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { DigitalPanel } from './diagnostics/DigitalPanel';
import { AssetPicker } from './AssetPicker';
import { ROUTES } from '../routes/paths';
import { Search, Command, X, ShieldCheck, Activity, Database, ChevronRight, ChevronDown, Settings, BarChart3, Wrench, Zap, Square, Grid } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCerebro } from '../contexts/ProjectContext';
import { useRisk } from '../contexts/RiskContext';
import { useRiskCalculator } from '../hooks/useRiskCalculator';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useAssetContext } from '../contexts/AssetContext';
import { useContextAwareness } from '../contexts/ContextAwarenessContext';
import { useDensity } from '../contexts/DensityContext';

interface DashboardHeaderProps {
    onToggleSidebar: () => void;
    isSidebarOpen?: boolean;
    title?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleSidebar, isSidebarOpen, title }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const { state: techState } = useCerebro();
    const { riskState: questionnaireRisk } = useRisk();
    const { status: assetRiskStatus, reason: riskReasons } = useRiskCalculator();
    const { selectedAsset } = useAssetContext(); // <--- Get Active Asset
    const { activePersona, hiveStatus } = useContextAwareness(); // <--- Get Persona & Sync
    const { isCommanderMode } = useTelemetryStore();

    // const [searchQuery, setSearchQuery] = useState(''); // Removed in favor of Global Command Palette
    // const [isSearchOpen, setSearchOpen] = useState(false);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

    // Heritage (NC-9.0) Logic
    const alignment = techState?.mechanical?.alignment || 0;
    const water = techState?.identity?.fluidIntelligence?.oilSystem?.waterContentPPM || 0;
    const tan = techState?.identity?.fluidIntelligence?.oilSystem?.tan || 0;
    const isHeritageCertified = alignment <= 0.05 && water <= 500 && tan <= 0.5 && tan > 0;


    // Search Index Removed - Replaced by Global CommandPalette.tsx (Ctrl+K)

    const triggerCommandPalette = () => {
        window.dispatchEvent(new CustomEvent('openCommandPalette'));
    };

    // Badge Logic
    const isCritical = questionnaireRisk.criticalFlags > 0 || assetRiskStatus === 'CRITICAL';
    const isWarning = assetRiskStatus === 'WARNING';
    const badgeLabel = t(`dashboard.riskStatus.${isCritical ? 'critical' : isWarning ? 'warning' : 'normal'}`);
    const badgeStatus = isCritical ? "critical" : isWarning ? "warning" : "normal";

    const handleBadgeClick = () => {
        if (assetRiskStatus !== 'SAFE') console.log("Risk Reasons:", riskReasons);
        navigate('/risk-assessment');
    };

    return (
        <>
            <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950/95 backdrop-blur flex items-center justify-between px-6 shadow-sm">

                {/* LEFT: Identity & Status */}
                <div className="flex items-center gap-4">
                    <button onClick={onToggleSidebar} className="p-2 text-slate-400 hover:text-slate-100" title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}>
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <span className="text-lg">☰</span>}
                    </button>

                    <div className="flex items-center gap-3 text-xs font-mono tracking-wider">
                        {title && (
                            <div 
                                className="hidden md:block mr-4 cursor-pointer hover:opacity-80 transition-opacity" 
                                onClick={() => navigate('/')}
                            >
                                {title}
                            </div>
                        )}

                        {/* 1. ASSET SEGMENT (Enhanced with Quick Actions) */}
                        <div className="relative">
                            <button
                                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${selectedAsset ? 'bg-slate-900 border-slate-700 hover:border-slate-600' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}
                            >
                                <Database className={`w-3.5 h-3.5 ${selectedAsset ? 'text-slate-400' : 'text-slate-600'}`} />
                                <div className="flex flex-col items-start">
                                    <span className={`font-semibold ${selectedAsset ? 'text-slate-100' : 'text-slate-500'}`}>
                                        {selectedAsset ? selectedAsset.name.toUpperCase() : t('header.fleetView', 'FLEET VIEW')}
                                    </span>
                                    {selectedAsset && (
                                        <span className="text-[9px] text-slate-500">
                                            {(selectedAsset.turbine_type || selectedAsset.type || 'HPP').toUpperCase()} | {selectedAsset.capacity?.toFixed(1) || '—'} MW
                                        </span>
                                    )}
                                </div>
                                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Quick Actions Dropdown */}
                            {isQuickActionsOpen && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                                    <div className="p-2 border-b border-slate-700">
                                        <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest px-2">{t('header.quickActions', 'Quick Actions')}</span>
                                    </div>
                                    <div className="p-1">
                                        <button
                                            onClick={() => { navigate('/hpp-builder'); setIsQuickActionsOpen(false); }}
                                            disabled={!selectedAsset}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all ${selectedAsset ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'opacity-40 cursor-not-allowed text-slate-600'}`}
                                        >
                                            <Settings className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <span className="text-sm font-semibold">{t('header.editSpecs', 'Edit Technical Specs')}</span>
                                                <p className="text-[9px] text-slate-500">{t('header.editSpecsDesc', 'HPP Builder Studio')}</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => { navigate('/executive'); setIsQuickActionsOpen(false); }}
                                            disabled={!selectedAsset}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all ${selectedAsset ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'opacity-40 cursor-not-allowed text-slate-600'}`}
                                        >
                                            <BarChart3 className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <span className="text-sm font-semibold">{t('header.viewAnalytics', 'View Live Analytics')}</span>
                                                <p className="text-[9px] text-slate-500">{t('header.viewAnalyticsDesc', 'Executive Dashboard')}</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => { navigate('/maintenance/dashboard'); setIsQuickActionsOpen(false); }}
                                            disabled={!selectedAsset}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all ${selectedAsset ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'opacity-40 cursor-not-allowed text-slate-600'}`}
                                        >
                                            <Wrench className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <span className="text-sm font-semibold">{t('header.performMaintenance', 'Perform Maintenance')}</span>
                                                <p className="text-[9px] text-slate-500">{t('header.performMaintenanceDesc', 'Field Toolbox')}</p>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="p-2 border-t border-slate-700">
                                        <button
                                            onClick={() => { navigate('/'); setIsQuickActionsOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                                        >
                                            <Zap className="w-4 h-4" />
                                            <span className="text-xs font-semibold">{t('header.viewFleet', 'View Full Fleet')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Global Actions */}
                <div className="flex items-center gap-4">
                    {/* Mobile Search Icon */}
                    <button onClick={triggerCommandPalette} className="p-2 text-slate-400 hover:text-slate-100">
                        <Search className="w-5 h-5" />
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
                            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition-all"
                        >
                            {t('auth.signOut', 'Sign Out')}
                        </button>
                    )}
                    <AssetPicker />
                </div>
            </header>

            {/* Sign Out Dialog */}
            {showSignOutDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-4">
                    <div className="bg-slate-950 border border-slate-700 rounded-2xl p-8 max-w-sm w-full">
                        <h3 className="text-2xl font-semibold text-slate-100 mb-2 uppercase tracking-tight">{t('header.terminateTitle')}</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">{t('auth.signOutConfirm', 'Are you sure you want to sign out?')}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSignOutDialog(false)}
                                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold uppercase tracking-widest text-xs transition-all border border-slate-700"
                            >
                                {t('actions.cancel', 'Cancel')}
                            </button>
                            <button
                                onClick={async () => {
                                    await signOut();
                                    setShowSignOutDialog(false);
                                    navigate('/login');
                                }}
                                className="flex-1 px-4 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-500 rounded-xl font-semibold uppercase tracking-widest text-xs transition-all border border-red-900/30"
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
