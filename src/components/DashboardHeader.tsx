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

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleSidebar, title = "AnoHUB Diagnostic Twin" }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { riskState: questionnaireRisk } = useRisk();
    const { status: assetRiskStatus, reason: riskReasons } = useRiskCalculator();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);

    // Search Index Construction
    const SEARCH_INDEX = [
        { label: 'Shaft Alignment (SOP)', path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.ALIGNMENT },
        { label: 'Bearings (SOP)', path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.BEARINGS },
        { label: 'Water Hammer (SOP)', path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.WATER_HAMMER },
        { label: 'Excitation / AVR (SOP)', path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.EXCITATION },
        { label: 'Transformer (SOP)', path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.TRANSFORMER },
        { label: 'Penstock Integrity (SOP)', path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.PENSTOCK },
        { label: 'Intake / Trash Rack (SOP)', path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.SOP.INTAKE },
        { label: 'Hydraulic Maintenance', path: '/' + ROUTES.MAINTENANCE.ROOT + '/' + ROUTES.MAINTENANCE.HYDRAULIC },
        { label: 'Bolt Torque', path: '/' + ROUTES.MAINTENANCE.ROOT + '/' + ROUTES.MAINTENANCE.BOLT_TORQUE },
        { label: 'Logbook', path: '/' + ROUTES.MAINTENANCE.ROOT + '/' + ROUTES.MAINTENANCE.LOGBOOK },
        { label: 'Risk Assessment', path: ROUTES.RISK_ASSESSMENT },
        { label: 'Francis Hub', path: '/' + ROUTES.FRANCIS.ROOT + '/' + ROUTES.FRANCIS.HUB },
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
    const badgeLabel = isCritical ? "CRITICAL" : isWarning ? "WARNING" : "OPTIMAL";
    const badgeStatus = isCritical ? "critical" : isWarning ? "warning" : "normal";

    const handleBadgeClick = () => {
        if (assetRiskStatus !== 'SAFE') console.log("Risk Reasons:", riskReasons);
        navigate('riskAssessment');
    };

    return (
        <>
            <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button onClick={onToggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white">☰</button>
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-black text-white tracking-widest uppercase">
                            {title}
                        </h1>

                        {/* Command Palette Trigger */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all"
                        >
                            <Search className="w-3 h-3" />
                            <span>Search modules...</span>
                            <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-500 font-mono">Ctrl+K</span>
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
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsSearchOpen(false)}>
                    <div
                        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-800/50">
                            <Search className="w-5 h-5 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Type a command or search..."
                                className="bg-transparent border-none outline-none text-white w-full font-mono text-sm"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <button onClick={() => setIsSearchOpen(false)} className="text-slate-500 hover:text-white">
                                <X className="w-4 h-4" />
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
                                        <span className="text-[10px] text-slate-600 font-mono">Jump to</span>
                                    </button>
                                ))
                            ) : searchQuery ? (
                                <div className="p-4 text-center text-slate-500 text-xs">No results found.</div>
                            ) : (
                                <div className="p-2">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">Recent / Suggested</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold text-white mb-2">{t('auth.signOut', 'Sign Out')}</h3>
                        <p className="text-slate-400 text-sm mb-6">{t('auth.signOutConfirm', 'Are you sure you want to sign out?')}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowSignOutDialog(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors">
                                {t('actions.cancel', 'Cancel')}
                            </button>
                            <button
                                onClick={async () => {
                                    await signOut();
                                    setShowSignOutDialog(false);
                                    navigate('/login');
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors"
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
