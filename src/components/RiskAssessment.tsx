import React from 'react';
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
    const { updateRiskState } = useRisk();
    const { activeIncident } = useTelemetry();
    const numericSelected = selectedAsset ? idAdapter.toNumber(selectedAsset.id) : null;

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

            {/* 2. LOGIC DISPLAY */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {!selectedAsset ? (
                    // STANDBY SCREEN (Ako nije odabran Asset)
                    <GlassCard className="text-center py-24 border-dashed border-slate-700/50 bg-slate-900/40">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse"></div>
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
                    <div className="space-y-8">
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
