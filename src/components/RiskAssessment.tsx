import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx';
import idAdapter from '../utils/idAdapter';
// ISPRAVKA IMPORTA: Uvozimo Questionnaire kao Named Export
import { Questionnaire } from './Questionnaire.tsx';
import { BackButton } from './BackButton.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { useRisk } from '../contexts/RiskContext.tsx';
// DODANO: Import AssetPicker-a koji je nedostajao
import { AssetPicker } from './AssetPicker.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { QuickAccessCard } from '../shared/components/ui/QuickAccessCard';
import { Shield, AlertTriangle, FileText, Activity, TrendingUp, CheckCircle, Info, AlertCircle } from 'lucide-react';

// --- EMERGENCY PROTOCOL ACTIONS ---
const EmergencyProtocol: React.FC<{ type: string }> = ({ type }) => {
    const { t } = useTranslation();

    // Use translation keys for protocols
    const steps = [
        t(`emergency.protocols.${type}.0`, t('emergency.protocols.default.0')),
        t(`emergency.protocols.${type}.1`, t('emergency.protocols.default.1')),
        t(`emergency.protocols.${type}.2`, ''),
        t(`emergency.protocols.${type}.3`, '')
    ].filter(s => s !== '');

    return (
        <div className="mt-8 space-y-4 animate-fade-in">
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl animate-pulse">☢️</span>
                    <h3 className="text-lg font-black text-red-500 uppercase tracking-tighter">{t('emergency.activeProtocol')}</h3>
                </div>
                <div className="grid gap-2">
                    {steps.map((step, i) => (
                        <div key={i} className="flex gap-3 bg-slate-900 border border-white/5 p-4 rounded-xl group hover:border-red-500/30 transition-colors">
                            <span className="text-red-500 font-mono font-bold">0{i + 1}</span>
                            <span className="text-slate-200 text-sm font-bold uppercase tracking-wide">{step}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const RiskAssessment: React.FC<{ onShowSummary: () => void }> = ({ onShowSummary }) => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const { updateRiskState, riskState } = useRisk();
    const { activeIncident } = useTelemetry();
    const numericSelected = selectedAsset ? idAdapter.toNumber(selectedAsset.id) : null;
    const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

    // Calculate risk level based on risk state and active incident
    useEffect(() => {
        if (activeIncident && numericSelected !== null && activeIncident.assetId === numericSelected) {
            setRiskLevel('critical');
        } else if (riskState && riskState.riskScore > 75) {
            setRiskLevel('high');
        } else if (riskState && riskState.riskScore > 50) {
            setRiskLevel('medium');
        } else {
            setRiskLevel('low');
        }
    }, [activeIncident, numericSelected, riskState]);

    // Ova funkcija se aktivira kada korisnik klikne "Finalize Analysis" u upitniku
    const handleRiskSync = (score: number, criticalCount: number) => {

        // 1. Pošalji podatke u 'Neural Link' (ažuriraj globalno stanje rizika)
        updateRiskState(score, criticalCount);

        // 2. Nastavi na ekran sa sažetkom (postojeća navigacija)
        onShowSummary();
    };

    return (
        <div className="animate-fade-in space-y-8 pb-12 max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <BackButton text={t('actions.back')} />
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold hidden sm:block">
                    {t('riskAssessment.protocol')}
                </div>
            </div>

            {/* 1. ASSET PICKER (Global) */}
            <div className="relative z-20">
                <AssetPicker />
            </div>

            {/* QUICK ACCESS CARDS SECTION */}
            <div className="mb-6">
                {/* Risk Status Banner */}
                {selectedAsset && (
                    <div className={`mb-4 p-4 rounded-xl border-2 flex items-center justify-between ${
                        riskLevel === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        riskLevel === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                        riskLevel === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                        <div className="flex items-center gap-3">
                            {riskLevel === 'critical' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                             riskLevel === 'high' ? <AlertTriangle className="w-5 h-5 text-orange-500" /> :
                             riskLevel === 'medium' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                             <CheckCircle className="w-5 h-5 text-emerald-500" />}
                            <div>
                                <div className={`text-xs font-bold uppercase tracking-wider ${
                                    riskLevel === 'critical' ? 'text-red-500' :
                                    riskLevel === 'high' ? 'text-orange-500' :
                                    riskLevel === 'medium' ? 'text-amber-500' :
                                    'text-emerald-500'
                                }`}>
                                    Risk Level: {riskLevel.toUpperCase()}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    {riskState ? `Risk Score: ${riskState.riskScore.toFixed(0)}/100` : 'No assessment data'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Critical Issues</div>
                            <div className="text-sm font-bold text-white">{riskState?.criticalFlags || 0}</div>
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">Risk Assessment Command Center</h2>
                    <p className="text-sm text-slate-400">Quick access to risk analysis tools</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <QuickAccessCard
                        id="questionnaire"
                        title="Questionnaire"
                        description="Risk assessment"
                        icon={<Shield className="w-6 h-6" />}
                        color="bg-red-500/10"
                        borderColor="border-red-500/30"
                        priority="critical"
                        onClick={() => document.getElementById('questionnaire-section')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                    <QuickAccessCard
                        id="structural"
                        title="Structural"
                        description="Integrity check"
                        icon={<Activity className="w-6 h-6" />}
                        route="/executive"
                        color="bg-red-500/10"
                        borderColor="border-red-500/30"
                        priority="critical"
                    />
                    <QuickAccessCard
                        id="barlow-audit"
                        title="Barlow Audit"
                        description="Pressure safety"
                        icon={<AlertTriangle className="w-6 h-6" />}
                        route="/executive"
                        color="bg-amber-500/10"
                        borderColor="border-amber-500/30"
                        priority="high"
                    />
                    <QuickAccessCard
                        id="longevity"
                        title="Longevity"
                        description="Asset lifespan"
                        icon={<TrendingUp className="w-6 h-6" />}
                        route="/executive"
                        color="bg-amber-500/10"
                        borderColor="border-amber-500/30"
                        priority="high"
                    />
                    <QuickAccessCard
                        id="forensics"
                        title="Forensics"
                        description="Incident analysis"
                        icon={<FileText className="w-6 h-6" />}
                        route="/forensics"
                        color="bg-cyan-500/10"
                        borderColor="border-cyan-500/30"
                        priority="medium"
                    />
                    <QuickAccessCard
                        id="summary"
                        title="Summary"
                        description="Risk report"
                        icon={<CheckCircle className="w-6 h-6" />}
                        onClick={onShowSummary}
                        color="bg-cyan-500/10"
                        borderColor="border-cyan-500/30"
                        priority="medium"
                    />
                </div>
            </div>

            {/* 2. LOGIC DISPLAY */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {!selectedAsset ? (
                    // STANDBY SCREEN (Ako nije odabran Asset)
                    <GlassCard className="text-center py-24 border-dashed border-slate-700/50 bg-slate-900/40">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                            <span className="relative text-6xl opacity-90 grayscale">🏗️</span>
                        </div>

                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                            {t('riskAssessment.initTitle')}
                        </h2>

                        <p className="text-slate-400 max-w-lg mx-auto text-lg font-light leading-relaxed">
                            <Trans i18nKey="riskAssessment.standbyDesc" components={{ strong: <strong className="text-cyan-400 font-bold" /> }} />
                        </p>

                        <div className="mt-8 flex justify-center gap-2 opacity-50">
                            <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </GlassCard>
                ) : (
                    // ACTIVE MODULE
                    <div className="space-y-8" id="questionnaire-section">
                        {/* Risk Insights Panel */}
                        {riskState && (
                            <GlassCard className={`bg-gradient-to-r ${
                                riskLevel === 'critical' ? 'from-red-950/20 to-orange-950/20 border-red-500/30' :
                                riskLevel === 'high' ? 'from-orange-950/20 to-amber-950/20 border-orange-500/30' :
                                riskLevel === 'medium' ? 'from-amber-950/20 to-yellow-950/20 border-amber-500/30' :
                                'from-emerald-950/20 to-cyan-950/20 border-emerald-500/30'
                            } border`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Risk Assessment Summary</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-900/50 rounded border border-white/5">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Overall Risk Score</div>
                                        <div className={`text-2xl font-black ${
                                            riskState.riskScore > 75 ? 'text-red-400' :
                                            riskState.riskScore > 50 ? 'text-amber-400' :
                                            'text-emerald-400'
                                        }`}>{riskState.riskScore.toFixed(0)}/100</div>
                                    </div>
                                    <div className="p-3 bg-slate-900/50 rounded border border-white/5">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Critical Issues</div>
                                        <div className={`text-2xl font-black ${
                                            riskState.criticalFlags > 0 ? 'text-red-400' : 'text-emerald-400'
                                        }`}>{riskState.criticalFlags}</div>
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {activeIncident && numericSelected !== null && activeIncident.assetId === numericSelected && (
                            <EmergencyProtocol type={activeIncident.type} />
                        )}

                        <Questionnaire
                            onShowSummary={onShowSummary}
                            onRiskSync={handleRiskSync}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
