import React, { useState } from 'react';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useAssetContext } from './AssetPicker.tsx';

export const InterventionCTA: React.FC = () => {
    const { disciplineRiskScore } = useRisk();
    const { selectedAsset } = useAssetContext();
    const [isVisible, setIsVisible] = useState(true);

    // Only show if risk is critical
    if (disciplineRiskScore < 55 || !isVisible) {
        return null;
    }

    const assetName = selectedAsset ? selectedAsset.name : 'Unknown Asset';
    const mailtoLink = `mailto:ino@anohubs.com?subject=PROTOCOL ALERT: Intervention Request for ${assetName}&body=SYSTEM DIAGNOSTIC REPORT:\n\nAsset: ${assetName}\nCurrent Risk Index: ${disciplineRiskScore}/100 (CRITICAL)\n\nI hereby request an immediate mobilization of the Zero-Tolerance Audit team to mitigate warranty exposure.\n\nAwaiting flight plan/connection details.`;

    return (
        <div className="fixed bottom-8 right-8 z-[100] no-print animate-slide-in-right max-w-sm w-full">
            
            <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-red-500/50 shadow-2xl shadow-red-900/50">
                
                {/* Pulse Glow Background */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 rounded-full blur-[50px] animate-pulse"></div>
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-600"></div>

                {/* Close Button */}
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors z-20"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-5 pl-7 relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            <span className="absolute inset-0 bg-red-500 animate-ping rounded-full opacity-30"></span>
                            <div className="relative bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-lg text-lg shadow-lg shadow-red-500/30">
                                ⚠️
                            </div>
                        </div>
                        <div>
                            <h4 className="text-red-400 font-bold text-[10px] uppercase tracking-widest">System Alert</h4>
                            <p className="text-white font-bold text-sm leading-tight">Critical Threshold Breached</p>
                        </div>
                    </div>

                    {/* Metric Display */}
                    <div className="flex justify-between items-center bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-4">
                        <span className="text-xs text-red-200 font-medium">Risk Index</span>
                        <span className="text-2xl font-mono font-black text-red-500 tracking-tighter">{disciplineRiskScore}<span className="text-sm opacity-50">/100</span></span>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Asset <strong className="text-white">{assetName}</strong> is operating outside safe warranty parameters. Immediate intervention required.
                    </p>

                    {/* Action Button */}
                    <a
                        href={mailtoLink}
                        className="block w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-center text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-red-500/25 border border-red-500/30 active:scale-[0.98]"
                    >
                        Initiate Emergency Protocol
                    </a>
                </div>
            </div>
        </div>
    );
};