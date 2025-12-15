import React, { useEffect, useState } from 'react';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useAssetContext } from './AssetPicker.tsx'; // <--- ENTERPRISE CONTEXT

// --- HELPER COMPONENTS ---

const StatusIndicator: React.FC<{ score: number }> = ({ score }) => {
    let color = '';
    let text = '';
    let icon = '';

    if (score < 30) {
        color = 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]';
        text = 'SYSTEM OPTIMAL';
        icon = '🛡️';
    } else if (score < 60) {
        color = 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
        text = 'WARNING';
        icon = '⚠️';
    } else {
        color = 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse';
        text = 'CRITICAL FAILURE';
        icon = '🚨';
    }

    return (
        <div className="text-center space-y-2">
            <div className="text-6xl">{icon}</div>
            <h3 className={`text-2xl font-black tracking-widest ${color}`}>{text}</h3>
        </div>
    );
};

const RiskCategoryBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="mb-4">
        <div className="flex justify-between text-xs uppercase font-bold text-slate-400 mb-1">
            <span>{label}</span>
            <span>{value}% Risk</span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${color}`} 
                style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const RiskReport: React.FC = () => {
    const { navigateToHub } = useNavigation();
    const { disciplineRiskScore } = useRisk();
    const { selectedAsset } = useAssetContext(); // <--- ASSET INFO
    const [analyzing, setAnalyzing] = useState(true);

    // AI Simulation
    useEffect(() => {
        const timer = setTimeout(() => setAnalyzing(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const technicalRisk = Math.max(0, Math.min(100, Math.floor(disciplineRiskScore * 1.2)));
    const legalRisk = Math.max(0, Math.min(100, Math.floor(disciplineRiskScore * 0.9)));
    const financialRisk = Math.max(0, Math.min(100, Math.floor(disciplineRiskScore * 1.5)));

    if (analyzing) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-fade-in">
                <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <p className="text-cyan-400 font-mono text-sm tracking-widest">GENERATING SYSTEM REPORT...</p>
            </div>
        );
    }

    const maxRisk = Math.max(technicalRisk, legalRisk, financialRisk);
    const mainRiskCategory = 
        (maxRisk === technicalRisk && maxRisk > 50) ? 'Technical' :
        (maxRisk === legalRisk && maxRisk > 50) ? 'Legal' :
        (maxRisk === financialRisk && maxRisk > 50) ? 'Financial' : 'Low';

    return (
        <div className="animate-fade-in space-y-8 pb-12 max-w-5xl mx-auto">
            
            {/* HEADER ACTION BAR */}
            <div className="flex justify-between items-center no-print">
                <button 
                    onClick={() => navigateToHub()}
                    className="flex items-center text-slate-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
                <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-sm rounded-lg border border-cyan-500/30 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    PRINT REPORT
                </button>
            </div>

            {/* REPORT CONTAINER */}
            <div className="glass-panel p-8 md:p-12 rounded-2xl border-t-8 border-t-cyan-500 shadow-2xl relative overflow-hidden bg-slate-900">
                
                {/* Background Watermark */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[20rem] font-bold text-slate-800/20 pointer-events-none select-none z-0">
                    {disciplineRiskScore}
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-tight">System Integrity Audit</h1>
                        
                        {/* ASSET NAME */}
                        {selectedAsset && (
                            <div className="inline-block px-4 py-1 bg-slate-800 rounded-full border border-slate-600 mb-2">
                                <span className="text-cyan-400 font-bold font-mono">{selectedAsset.name.toUpperCase()}</span>
                            </div>
                        )}
                        
                        <p className="text-slate-400">Generated by AnoHUB Diagnostic Protocol</p>
                        <div className="text-xs font-mono text-slate-500 mt-2">{new Date().toLocaleDateString()} • ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        
                        {/* LEFT: SCOREBOARD */}
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                            <StatusIndicator score={disciplineRiskScore} />
                            
                            <div className="mt-8 text-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discipline Risk Index</span>
                                <div className="text-8xl font-black text-white leading-none mt-2">{disciplineRiskScore}</div>
                                <div className="text-xs text-slate-400 mt-2">/ 100 (Lower is Better)</div>
                            </div>
                        </div>

                        {/* RIGHT: BREAKDOWN */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2 mb-4">Risk Vector Analysis</h3>
                            
                            <RiskCategoryBar 
                                label="Execution Gap (Technical)" 
                                value={technicalRisk} 
                                color={technicalRisk > 50 ? 'bg-red-500' : 'bg-cyan-500'} 
                            />
                            <p className="text-xs text-slate-400 mb-4 italic">
                                Probability of mechanical failure due to misalignment or assembly errors (e.g. {'>'} 0.05 mm/m).
                            </p>
                            
                            <RiskCategoryBar 
                                label="Warranty Liability (Legal)" 
                                value={legalRisk} 
                                color={legalRisk > 50 ? 'bg-red-500' : 'bg-purple-500'} 
                            />
                            <p className="text-xs text-slate-400 mb-4 italic">
                                Risk of warranty invalidation due to lack of immutable documentation.
                            </p>

                            <RiskCategoryBar 
                                label="LCC Impact (Financial)" 
                                value={financialRisk} 
                                color={financialRisk > 50 ? 'bg-red-500' : 'bg-yellow-500'} 
                            />
                            <p className="text-xs text-slate-400 italic">
                                Projected increase in OPEX due to reactive maintenance.
                            </p>
                        </div>
                    </div>

                    {/* RECOMMENDATION ENGINE */}
                    <div className="mt-12 p-6 rounded-xl border border-dashed border-slate-600 bg-slate-800/30">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-cyan-400">⚡</span> Strategic Recommendations
                        </h4>
                        
                        {disciplineRiskScore > 50 ? (
                            <ul className="space-y-3">
                                {mainRiskCategory === 'Technical' && (
                                    <li className="flex items-start gap-3 text-red-200">
                                        <span className="font-bold text-red-500">1.</span>
                                        <span><strong>Immediate Intervention:</strong> Schedule a 'Zero-Tolerance Audit' to identify specific points of failure.</span>
                                    </li>
                                )}
                                <li className="flex items-start gap-3 text-slate-300">
                                    <span className="font-bold text-cyan-500">2.</span>
                                    <span><strong>Digital Lockdown:</strong> Enforce the use of the "Installation Guarantee" tool. No photo = No sign-off.</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-300">
                                    <span className="font-bold text-cyan-500">3.</span>
                                    <span><strong>RCFA Protocol:</strong> Initiate Root Cause Failure Analysis for vibration anomalies.</span>
                                </li>
                            </ul>
                        ) : (
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-green-200">
                                    <span className="font-bold text-green-500">1.</span>
                                    <span><strong>Maintain Discipline:</strong> Continue using the 0.05 mm/m standard. Good adherence detected.</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-300">
                                    <span className="font-bold text-cyan-500">2.</span>
                                    <span><strong>Optimize LCC:</strong> Shift focus to predictive maintenance to further reduce OPEX.</span>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-8 text-center border-t border-slate-800 pt-6">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">
                            Authorized by AnoHUB Standard of Excellence
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">
                            This document serves as a preliminary diagnostic and does not replace a certified on-site inspection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskReport;