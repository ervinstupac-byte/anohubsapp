import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAudit } from '../contexts/AuditContext.tsx';
// New SCADA Imports
import { Sidebar } from './scada/Sidebar.tsx';
import { FleetOverview } from './scada/FleetOverview.tsx';
import { AlarmBar } from './scada/AlarmBar.tsx';
import { DigitalPanel } from './scada/DigitalPanel.tsx';
import { ScadaMimic } from './scada/ScadaMimic.tsx';
import { GlobalMap } from './GlobalMap.tsx';
import { AssetRegistrationWizard } from './AssetRegistrationWizard.tsx';
import type { AppView } from '../contexts/NavigationContext.tsx';

// --- SIDEBAR MODULE ITEM ---
const ModuleItem: React.FC<{
    title: string;
    icon: string;
    active?: boolean;
    onClick: () => void;
    variant?: 'primary' | 'secondary'
}> = ({ title, icon, active, onClick, variant = 'primary' }) => (
    <button
        onClick={onClick}
        className={`
            w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group
            ${active
                ? 'bg-cyan-900/20 border-cyan-400 text-white'
                : 'border-transparent hover:bg-slate-900 text-slate-500 hover:text-slate-300'}
            ${variant === 'secondary' ? 'py-2' : ''}
        `}
    >
        <span className={`text-lg ${active ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`}>{icon}</span>
        <div className="flex flex-col items-start">
            <span className={`text-xs font-bold uppercase tracking-wider ${variant === 'secondary' ? 'text-[10px]' : ''}`}>
                {title}
            </span>
        </div>
    </button>
);

export const Hub: React.FC = () => {
    const { navigateTo } = useNavigation();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { riskState } = useRisk();
    const { telemetry } = useTelemetry();
    const { logAction } = useAudit();

    // SCADA State
    const [totalPower, setTotalPower] = useState(0);
    const [alarmActive, setAlarmActive] = useState(false);

    const [showMap, setShowMap] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const power = Object.values(telemetry).reduce((acc, curr) => acc + curr.output, 0);
        setTotalPower(parseFloat(power.toFixed(1)));

        // Alarm Logic
        const criticalCount = Object.values(telemetry).filter(t => t.status === 'CRITICAL').length;
        if (criticalCount > 0 || (riskState.isAssessmentComplete && riskState.criticalFlags > 0)) {
            setAlarmActive(true);
        } else {
            setAlarmActive(false);
        }
    }, [telemetry, riskState]);

    const operationalModules = [
        { id: 'riskAssessment', title: t('modules.riskAssessment', 'Risk Diagnostics'), icon: '🛡️' },
        { id: 'installationGuarantee', title: t('modules.installationGuarantee', 'Precision Audit'), icon: '🏗️' },
        { id: 'hppBuilder', title: t('modules.hppBuilder', 'HPP Studio'), icon: '⚡' },
    ];

    const secondaryModules = [
        { id: 'riskReport', title: t('modules.riskReport', 'Dossier Archive'), icon: '📂' },
        { id: 'library', title: t('modules.library', 'Tech Library'), icon: '📚' },
        { id: 'standardOfExcellence', title: 'Standard', icon: '🏅' },
        { id: 'activeContext', title: 'Vision', icon: '👁️' } // Placeholder for Vision
    ];

    return (
        <div className="w-full h-screen bg-slate-950 text-white flex relative overflow-hidden">

            {/* WIZARD MODAL */}
            {/* Asset Registration Wizard Modal */}
            {isWizardOpen && <AssetRegistrationWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />}

            {/* Hamburger Menu Button (Mobile Only) - Top Right */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-2 right-2 z-50 p-3 bg-cyan-900/90 border border-cyan-700 rounded-lg backdrop-blur-md hover:bg-cyan-800 transition-colors shadow-lg"
                aria-label="Toggle menu"
            >
                <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isSidebarOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* SIDEBAR */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
                {/* 1. Fleet Overview at Top */}
                <FleetOverview
                    onToggleMap={() => setShowMap(!showMap)}
                    showMap={showMap}
                    onRegisterAsset={() => {
                        setIsWizardOpen(true);
                        setIsSidebarOpen(false);
                    }}
                />

                {/* 2. Operational Modules (Primary) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1">
                    <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {t('hub.operationalModules', 'OPERATIONS')}
                    </div>
                    {operationalModules.map(mod => (
                        <ModuleItem
                            key={mod.id}
                            {...mod}
                            onClick={() => {
                                logAction('MODULE_OPEN', mod.title, 'SUCCESS');
                                navigateTo(mod.id as AppView);
                                setIsSidebarOpen(false);
                            }}
                        />
                    ))}

                    <div className="my-4 border-t border-slate-900 mx-4"></div>

                    {/* 3. Reference/Culture (Secondary) */}
                    <div className="px-4 py-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                        {t('hub.strategicIntelligence', 'KNOWLEDGE')}
                    </div>
                    {secondaryModules.map(mod => (
                        <ModuleItem
                            key={mod.id}
                            {...mod}
                            variant="secondary"
                            onClick={() => {
                                logAction('MODULE_OPEN', mod.title, 'SUCCESS');
                                navigateTo(mod.id as AppView);
                                setIsSidebarOpen(false);
                            }}
                        />
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-900 bg-slate-950 text-xs text-slate-600 font-mono">
                    <div>OP: {user?.email?.split('@')[0].toUpperCase() || 'GUEST'}</div>
                    <div className="text-[10px] mt-1 opacity-50">v2.5.0 ENTERPRISE</div>
                </div>
            </Sidebar>

            {/* MAIN CONTENT AREA */}
            <main className="ml-0 lg:ml-[280px] w-full lg:w-[calc(100%-280px)] h-screen flex flex-col relative bg-slate-950 overflow-hidden">

                {/* SCADA HEADER (Digital Panel) - Hide on mobile */}
                <header className="hidden lg:flex h-20 border-b border-slate-800 bg-slate-950 items-center justify-between px-8 shadow-sm z-30">
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <h1 className="text-2xl font-black text-white tracking-tighter">AnoHUB <span className="text-cyan-600">SCADA</span></h1>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <DigitalPanel
                            label={t('hub.fleetOutput', 'FLEET OUTPUT')}
                            value={totalPower}
                            unit="MW"
                        />
                        <DigitalPanel
                            label={t('hub.riskFactors', 'RISK FACTORS')}
                            value={riskState.criticalFlags}
                            status={riskState.criticalFlags > 0 ? 'critical' : 'normal'}
                        />
                        <DigitalPanel
                            label="ACTIVE ALARMS"
                            value={alarmActive ? 1 : 0}
                            status={alarmActive ? 'critical' : 'normal'}
                        />
                    </div>
                </header>

                {/* BOTTOM: Process Mimic / Map */}
                <div className="flex-1 relative overflow-hidden">
                    {showMap ? <GlobalMap /> : <ScadaMimic />}
                </div>

                {/* BOTTOM: Alarm Bar - Responsive positioning */}
                <AlarmBar isActive={alarmActive} />

            </main>
        </div>
    );
};
