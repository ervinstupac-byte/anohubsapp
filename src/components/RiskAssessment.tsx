import React from 'react';
import { AssetPicker, useAssetContext } from './AssetPicker.tsx';
import Questionnaire from './Questionnaire.tsx'; 
import { BackButton } from './BackButton.tsx';

export const RiskAssessment: React.FC<{ onShowSummary: () => void }> = ({ onShowSummary }) => {
    const { selectedAsset } = useAssetContext();

    return (
        <div className="animate-fade-in space-y-6 pb-12 max-w-6xl mx-auto">
            <BackButton text="Back to Hub" />
            
            {/* 1. ASSET PICKER JE UVIJEK VIDLJIV I GLOBALAN */}
            <AssetPicker />
            
            {/* 2. LOGIKA PRIKAZA */}
            {!selectedAsset ? (
                // Ako nema Asseta, prikaži poruku da ga odaberu
                <div className="text-center p-12 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed animate-fade-in">
                    <div className="text-5xl mb-4 opacity-50">🏗️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Initialize Diagnostics</h2>
                    <p className="text-slate-400">
                        Please select a <strong className="text-cyan-400">Target Asset</strong> above to begin the Execution Gap analysis.
                    </p>
                </div>
            ) : (
                // Ako ima Asseta, učitaj Questionnaire komponentu
                // Ona se brine o pitanjima, progress baru i spremanju u state
                <Questionnaire onShowSummary={onShowSummary} />
            )}
        </div>
    );
};

export default RiskAssessment;