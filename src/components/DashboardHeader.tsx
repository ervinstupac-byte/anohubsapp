import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DigitalPanel } from './diagnostic-twin/DigitalPanel';
import { LanguageSelector } from './LanguageSelector';
import { ROUTES } from '../routes/paths';
import { Search, Command, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRisk } from '../contexts/RiskContext';
import { useRiskCalculator } from '../hooks/useRiskCalculator';

interface DashboardHeaderProps {
    onToggleSidebar: () => void;
    title?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleSidebar, title }) => {
    const { t } = useTranslation();
    const displayTitle = title || t('header.title');
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { riskState: questionnaireRisk } = useRisk();
    const { status: assetRiskStatus, reason: riskReasons } = useRiskCalculator();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);

    // Search Index Construction
    const SEARCH_INDEX = [
        { label: t('sidebar.shaftAlignment'), path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.ALIGNMENT },
        { label: t('sidebar.bearings'), path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.BEARINGS },
        { label: t('francis.waterHammer.title'), path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.WATER_HAMMER },
        { label: t('sidebar.excitation'), path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.EXCITATION },
        { label: t('sidebar.transformer'), path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.TRANSFORMER },
        { label: t('sidebar.penstock'), path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.PENSTOCK },
        { label: t('sidebar.intake'), path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.INTAKE },
        { label: t('sidebar.hydraulicMaintenance'), path: '/' + ROUTES.MAINTENANCE.ROOT + '/' + ROUTES.MAINTENANCE.HYDRAULIC },
        { label: t('sidebar.boltTorque'), path: '/' + ROUTES.MAINTENANCE.ROOT + '/' + ROUTES.MAINTENANCE.BOLT_TORQUE },
        { label: t('sidebar.maintenanceLogbook'), path: '/' + ROUTES.MAINTENANCE.ROOT + '/' + ROUTES.MAINTENANCE.LOGBOOK },
        { label: t('modules.riskAssessment'), path: ROUTES.RISK_ASSESSMENT },
        { label: t('sidebar.francisLogic'), path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.HUB },
    ];

    const filteredResults = searchQuery
        ? SEARCH_INDEX.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    // Ctrl+K Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleResultClick = (path: string) => {
        navigate(path);
        setIsSearchOpen(false);
        setSearchQuery('');
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

    return (
        <>
            <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-slate-950/40 glass-panel-deep !rounded-none flex items-center justify-between px-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={onToggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white">☰</button>
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-black text-white tracking-widest uppercase">
                            {displayTitle}
                        </h1>

                        {/* Command Palette Trigger */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Search className="w-3.5 h-3.5" />
                            <span className="font-medium tracking-tight">{t('header.searchPlaceholder')}</span>
                            <span className="ml-2 px-1.5 py-0.5 bg-black/40 rounded text-[10px] text-slate-500 font-mono border border-white/5">Ctrl+K</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mobile Search Icon */}
                    <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 text-slate-400">
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
                            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-800/50 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded transition-all hidden md:block"
                        >
                            {t('auth.signOut', 'Sign Out')}
                        </button>
                    )}
                    <LanguageSelector />
                </div>
            </header>

            {/* Command Palette Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/80 backdrop-blur-sm animate-fade-in px-4" onClick={() => setIsSearchOpen(false)}>
                    <div
                        className="w-full max-w-2xl bg-slate-900/90 glass-panel-deep border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 bg-white/5 noise-commander">
                            <Search className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                            <input
                                autoFocus
                                type="text"
                                placeholder={t('header.modalPlaceholder')}
                                className="bg-transparent border-none outline-none text-white w-full font-mono text-base placeholder:text-slate-600 tracking-wider"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <button onClick={() => setIsSearchOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((result, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleResultClick(result.path)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 text-left group transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Command className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                                            <span className="text-slate-300 group-hover:text-white font-medium text-sm">{result.label}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-600 font-mono">{t('header.jumpTo')}</span>
                                    </button>
                                ))
                            ) : searchQuery ? (
                                <div className="p-4 text-center text-slate-500 text-xs">{t('header.noResults')}</div>
                            ) : (
                                <div className="p-2">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">{t('header.recentSuggested')}</span>
                                    {SEARCH_INDEX.slice(0, 3).map((result, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleResultClick(result.path)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 text-left group transition-colors mt-1"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Command className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                                                <span className="text-slate-300 group-hover:text-white font-medium text-sm">{result.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
