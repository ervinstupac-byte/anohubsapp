import React, { useEffect, useMemo } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx'; // <--- NOVO
// Putanja: Izlazimo iz 'components' (..), ulazimo u 'src/utils/'
import { generateRiskReport } from '../utils/pdfGenerator.ts'; // <--- NOVO
import { QUESTIONS } from '../constants.ts';
import type { Question } from '../types.ts';

// --- RISK ANALYSIS LOGIC ---
export const riskKeywords: Record<string, { high: string[], medium: string[] }> = {
    q1: { high: ['no'], medium: ['not documented'] }, q2: { high: ['no'], medium: ['partially'] },
    q4: { high: ['no'], medium: ['sometimes'] }, q5: { high: ['frequently'], medium: ['occasionally'] },
    q6: { high: ['not maintained'], medium: ['partially filled'] },
    q7: { high: ['often we only fix the symptom'], medium: ['sometimes we only fix the symptom'] },
    q8: { high: ['no'], medium: ['in testing phase'] }, q9: { high: ['no'], medium: ['limited access'] },
    q10: { high: ['not monitored'], medium: ['monitored periodically'] },
    q11: { high: ['no', 'do not measure'], medium: [] }, q12: { high: ['only replacement', 'no, only replacement is offered'], medium: ['sometimes'] },
    q13: { high: ['no'], medium: ['periodically'] }, q14: { high: ['not installed/functional'], medium: ['some require checking'] },
    q15: { high: ['no'], medium: ['outdated'] }, q16: { high: ['manual'], medium: ['semi-automatic'] },
    q17: { high: ['major service needed'], medium: ['requires minor maintenance'] },
};

// --- HELPER COMPONENT: RISK GAUGE ---
const RiskGauge: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    let color = '';
    let percentage = 0;
    let text = '';

    switch (level) {
        case 'High': color = 'text-red-500'; percentage = 90; text = 'CRITICAL'; break;
        case 'Medium': color = 'text-yellow-400'; percentage = 50; text = 'MODERATE'; break;
        case 'Low': color = 'text-green-400'; percentage = 15; text = 'STABLE'; break;
    }

    return (
        <div className="relative flex flex-col items-center justify-center py-6">
            <div className="w-40 h-40 rounded-full border-8 border-slate-800 relative flex items-center justify-center shadow-inner bg-slate-900/50">
                {/* SVG Circle for Progress */}
                <svg className="absolute inset-0 transform -rotate-90 w-full h-full p-1" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-700 opacity-20" />
                    <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                        strokeDasharray="283" strokeDashoffset={283 - (283 * percentage) / 100}
                        className={`${color} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <div className="text-center z-10">
                    <span className={`text-3xl font-black ${color} tracking-tighter block`}>{text}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest">Risk Level</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const QuestionnaireSummary: React.FC = () => {
    const { navigateToHub } = useNavigation();
    const { answers, resetQuestionnaire, operationalData, description } = useQuestionnaire();
    const { calculateAndSetQuestionnaireRisk } = useRisk();
    const { showToast } = useToast(); // <--- TOAST HOOK

    const analysis = useMemo(() => {
        const highRisk: Question[] = [];
        const mediumRisk: Question[] = [];

        QUESTIONS.forEach(q => {
            const answer = answers[q.id]?.toLowerCase();
            if (!answer) return;
            const riskDef = riskKeywords[q.id];
            if (!riskDef) return;

            if (riskDef.high.some(keyword => answer.includes(keyword))) highRisk.push(q);
            else if (riskDef.medium.some(keyword => answer.includes(keyword))) mediumRisk.push(q);
        });
        return { highRisk, mediumRisk };
    }, [answers]);

    useEffect(() => {
        calculateAndSetQuestionnaireRisk(answers);
    }, [answers, calculateAndSetQuestionnaireRisk]);

    const getRiskLevel = (highCount: number, mediumCount: number) => {
        const totalScore = highCount * 2 + mediumCount;
        if (totalScore > 10) return { text: 'High Risk', color: 'text-red-400', level: 'High' as const };
        if (totalScore > 5) return { text: 'Medium Risk', color: 'text-yellow-400', level: 'Medium' as const };
        return { text: 'Low Risk', color: 'text-green-400', level: 'Low' as const };
    };
    
    const riskIndicator = getRiskLevel(analysis.highRisk.length, analysis.mediumRisk.length);

    // --- PDF GENERATION HANDLER ---
    const handleDownloadPDF = () => {
        if (Object.keys(answers).length === 0) {
            showToast('No data available. Please complete the assessment first.', 'warning');
            return;
        }
        
        try {
            generateRiskReport(answers, operationalData, { text: riskIndicator.text, color: riskIndicator.color }, description);
            showToast('Risk Report PDF Downloaded.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to generate report.', 'error');
        }
    };

    const handleReturn = () => {
        resetQuestionnaire();
        navigateToHub();
    };

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Diagnostic <span className="text-cyan-400">Report</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Automated analysis of systemic risks and potential Execution Gaps based on site parameters.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: EXECUTIVE SUMMARY */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-cyan-500 bg-gradient-to-b from-slate-800/80 to-slate-900/80">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Overall Assessment</h3>
                        <RiskGauge level={riskIndicator.level} />
                        
                        <div className="mt-6 pt-6 border-t border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-400">High Priority Alerts</span>
                                <span className="text-xl font-bold text-red-400">{analysis.highRisk.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Warnings</span>
                                <span className="text-xl font-bold text-yellow-400">{analysis.mediumRisk.length}</span>
                            </div>
                        </div>

                        {/* --- PDF DOWNLOAD BUTTON (NOVO) --- */}
                        <button 
                            onClick={handleDownloadPDF}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-lg shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                        >
                            <span className="text-lg group-hover:scale-110 transition-transform">📄</span> Download PDF Report
                        </button>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl bg-cyan-900/10 border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">🧠</span>
                            <h4 className="font-bold text-cyan-300 text-sm uppercase">Concept: The Execution Gap</h4>
                        </div>
                        <p className="text-xs text-cyan-100/80 leading-relaxed">
                            The critical divergence between a flawless engineering plan and the inconsistent reality of on-site implementation. 
                            It is the primary source of operational risk, often indicated by failures in discipline (e.g., undocumented alignment).
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: DETAILED FINDINGS */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* High Risk Section */}
                    {analysis.highRisk.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-red-500 animate-scale-in" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Critical Indicators</h3>
                                    <p className="text-xs text-red-300">Immediate attention required to prevent warranty invalidation.</p>
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {analysis.highRisk.map(q => (
                                    <li key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-900/10 border border-red-500/10">
                                        <span className="text-red-500 mt-0.5">•</span>
                                        <span className="text-sm text-slate-300">{q.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Medium Risk Section */}
                    {analysis.mediumRisk.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-yellow-500 animate-scale-in" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Operational Warnings</h3>
                                    <p className="text-xs text-yellow-200/80">Potential gaps in documentation or discipline.</p>
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {analysis.mediumRisk.map(q => (
                                    <li key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-900/10 border border-yellow-500/10">
                                        <span className="text-yellow-500 mt-0.5">•</span>
                                        <span className="text-sm text-slate-300">{q.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Clean State (No Risks) */}
                    {analysis.highRisk.length === 0 && analysis.mediumRisk.length === 0 && (
                        <div className="glass-panel p-8 rounded-2xl border-green-500/30 text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-xl font-bold text-white">System Optimal</h3>
                            <p className="text-slate-400 mt-2">No significant deviations from the Standard of Excellence detected.</p>
                        </div>
                    )}

                    <div className="text-center pt-8 border-t border-slate-700/50">
                        <button 
                            onClick={handleReturn}
                            className="px-8 py-3 text-sm font-bold rounded-lg transition-colors bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionnaireSummary;