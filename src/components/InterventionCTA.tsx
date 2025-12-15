import React, { useState } from 'react';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useAssetContext } from './AssetPicker.tsx';

export const InterventionCTA: React.FC = () => {
    const { disciplineRiskScore } = useRisk();
    const { selectedAsset } = useAssetContext();
    const [isVisible, setIsVisible] = useState(true);

    // Prikazuj samo ako je rizik visok (>= 55)
    if (disciplineRiskScore < 55 || !isVisible) {
        return null;
    }

    const assetName = selectedAsset ? selectedAsset.name : 'Unknown Asset';
    const mailtoLink = `mailto:ino@anohubs.com?subject=PROTOCOL ALERT: Intervention Request for ${assetName}&body=SYSTEM DIAGNOSTIC REPORT:\n\nAsset: ${assetName}\nCurrent Risk Index: ${disciplineRiskScore}/100 (CRITICAL)\n\nI hereby request an immediate mobilization of the Zero-Tolerance Audit team to mitigate warranty exposure.\n\nAwaiting flight plan/connection details.`;

    return (
        <div className="fixed bottom-6 right-6 z-[100] no-print animate-slide-in-right max-w-sm w-full">
            
            {/* GLAVNA KARTICA */}
            <div className="relative bg-slate-900/95 backdrop-blur-xl border-l-4 border-red-500 rounded-r-xl shadow-2xl overflow-hidden group">
                
                {/* Pozadinski sjaj (Subtle Pulse) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse"></div>

                {/* CLOSE GUMB (Mali X gore desno) */}
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-white p-1 rounded-full transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-5">
                    {/* HEADER */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            <span className="absolute inset-0 bg-red-500 animate-ping rounded-full opacity-20"></span>
                            <div className="bg-red-500 text-white p-1.5 rounded text-xs font-bold">
                                ⚠️
                            </div>
                        </div>
                        <div>
                            <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest">System Alert</h4>
                            <p className="text-white font-bold text-sm">Critical Threshold Breached</p>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="space-y-3">
                        <div className="bg-slate-800/50 p-3 rounded border border-slate-700 flex justify-between items-center">
                            <span className="text-xs text-slate-400">Risk Index</span>
                            <span className="text-2xl font-mono font-black text-red-500">{disciplineRiskScore}</span>
                        </div>
                        
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Asset <strong>{assetName}</strong> is operating outside safe warranty parameters.
                        </p>

                        {/* ACTION BUTTON */}
                        <a
                            href={mailtoLink}
                            className="block w-full py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-center text-xs font-bold uppercase tracking-widest rounded transition-all shadow-lg hover:shadow-red-900/50 transform hover:-translate-y-0.5 border border-red-500/50"
                        >
                            Initiate Protocol
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};