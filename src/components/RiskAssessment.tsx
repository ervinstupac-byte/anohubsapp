import React from 'react';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx';
// ISPRAVKA IMPORTA: Uvozimo Questionnaire kao Named Export
import { Questionnaire } from './Questionnaire.tsx';
import { BackButton } from './BackButton.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
// DODANO: Import AssetPicker-a koji je nedostajao
import { AssetPicker } from './AssetPicker.tsx';

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const RiskAssessment: React.FC<{ onShowSummary: () => void }> = ({ onShowSummary }) => {
    const { selectedAsset } = useAssetContext();
    const { updateRiskState } = useRisk();

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
                <BackButton text="Return to Hub" />
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold hidden sm:block">
                    Diagnostic Protocol v2.0
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
                            Initialize Diagnostics
                        </h2>
                        
                        <p className="text-slate-400 max-w-lg mx-auto text-lg font-light leading-relaxed">
                            System is in standby. Please select a <strong className="text-cyan-400 font-bold">Target Asset</strong> above to begin the Execution Gap analysis.
                        </p>

                        <div className="mt-8 flex justify-center gap-2 opacity-50">
                            <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </GlassCard>
                ) : (
                    // ACTIVE MODULE (Prikazujemo Upitnik i prosljeđujemo Neural Link handler)
                    <Questionnaire 
                        onShowSummary={onShowSummary} 
                        onRiskSync={handleRiskSync} // <--- KLJUČNO: Ovdje spajamo Upitnik s Contextom
                    />
                )}
            </div>
        </div>
    );
};