import React, { useState } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext';
import { QUESTIONS, TURBINE_CATEGORIES } from '../constants';
import { BackButton } from './BackButton';
import type { OperationalData } from '../types';

interface QuestionnaireProps {
    onShowSummary: () => void;
}

// --- STEPPER HELPER ---
const Stepper: React.FC<{ currentStep: number; steps: string[] }> = ({ currentStep, steps }) => (
    <div className="flex items-center justify-center w-full mb-10">
        {steps.map((label, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            return (
                <div key={index} className="flex items-center">
                    <div className="relative flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 border-2 ${isActive ? 'bg-cyan-600 border-cyan-400 text-white scale-110 shadow-lg' : isCompleted ? 'bg-slate-800 border-cyan-600 text-cyan-500' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                            {isCompleted ? '✓' : stepNum}
                        </div>
                        <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{label}</span>
                    </div>
                    {index < steps.length - 1 && <div className={`h-1 w-16 sm:w-24 mx-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-cyan-600' : 'bg-slate-700'}`} />}
                </div>
            );
        })}
    </div>
);

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onShowSummary }) => {
    const { answers, description, selectedTurbine, operationalData, setAnswers, setDescription, setSelectedTurbine, setOperationalData, setIsQuestionnaireDataFresh } = useQuestionnaire();
    const [step, setStep] = useState(1);
    const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

    const handleCategorySelect = (key: string) => {
        setSelectedCategoryKey(key);
        setSelectedTurbine(null);
    };

    // --- FUNKCIJA ZA EMAIL (Ključni dio) ---
    const handleSendEmail = () => {
        const subject = `HPP Diagnostics Request: ${selectedTurbine?.name || 'Unknown'}`;
        const body = `
Hello AnoHub Team (ino@anohubs.com),

Please review the following diagnostic data:

--- SYSTEM CONFIGURATION ---
Turbine: ${selectedTurbine?.name} (${selectedTurbine?.description})
Head: ${operationalData.head} m
Flow: ${operationalData.flow} m3/s
Pressure: ${operationalData.pressure} bar
Output: ${operationalData.output} MW

--- DIAGNOSTIC ANSWERS ---
${QUESTIONS.map(q => `Q: ${q.text}\nA: ${answers[q.id] || 'Not answered'}`).join('\n\n')}

--- ADDITIONAL OBSERVATIONS ---
${description || 'None provided.'}

Requesting expert analysis and risk mitigation strategy.
        `;
        window.location.href = `mailto:ino@anohubs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        setIsQuestionnaireDataFresh(true);
        onShowSummary();
    };

    const isOpDataComplete = Object.values(operationalData).every(v => v !== '');
    const isQuestionsComplete = Object.keys(answers).length >= QUESTIONS.length;

    return (
        <div className="animate-fade-in pb-12 max-w-5xl mx-auto">
            <BackButton text="Cancel Analysis" className="mb-6" />
            <Stepper currentStep={step} steps={['Configuration', 'Parameters', 'Diagnostics']} />

            <div className="glass-panel p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
                
                {/* STEP 1: TURBINE SELECTION */}
                {step === 1 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">System Configuration</h2>
                            <p className="text-slate-400">Select your turbine type to calibrate the risk model.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            {Object.keys(TURBINE_CATEGORIES).map((key) => (
                                <button key={key} onClick={() => handleCategorySelect(key)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${selectedCategoryKey === key ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{TURBINE_CATEGORIES[key].name}</button>
                            ))}
                        </div>
                        {selectedCategoryKey && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {TURBINE_CATEGORIES[selectedCategoryKey].types.map((t: any) => (
                                    <div key={t.id} onClick={() => setSelectedTurbine(t)} className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedTurbine?.id === t.id ? 'bg-cyan-900/30 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-white text-lg">{t.name}</h3>
                                            {selectedTurbine?.id === t.id && <span className="text-cyan-400 text-xl">●</span>}
                                        </div>
                                        <p className="text-sm text-slate-400 mt-2">{t.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setStep(2)} disabled={!selectedTurbine} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Continue →</button>
                        </div>
                    </div>
                )}

                {/* STEP 2: OPERATIONAL DATA */}
                {step === 2 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">Operational Parameters</h2>
                            <p className="text-slate-400">Input current operating data for the digital twin baseline.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['head', 'flow', 'pressure', 'output'].map((field) => (
                                <div key={field}>
                                    <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">{field} ({field === 'pressure' ? 'bar' : field === 'output' ? 'MW' : field === 'head' ? 'm' : 'm³/s'})</label>
                                    <input 
                                        type="number" 
                                        value={operationalData[field as keyof OperationalData]} 
                                        onChange={e => setOperationalData({...operationalData, [field]: e.target.value})} 
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-400 font-bold hover:text-white">← Back</button>
                            <button onClick={() => setStep(3)} disabled={!isOpDataComplete} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition-all">Continue →</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: DIAGNOSTIC QUESTIONS */}
                {step === 3 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">Diagnostic Protocol</h2>
                            <p className="text-slate-400">Answer carefully. These inputs drive the Execution Gap analysis.</p>
                        </div>
                        <div className="space-y-6">
                            {QUESTIONS.map((q, i) => (
                                <div key={q.id} className="bg-slate-800/30 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                    <p className="text-md font-semibold text-slate-200 mb-3"><span className="text-cyan-500 mr-2">{i+1}.</span>{q.text}</p>
                                    <div className="flex flex-wrap gap-3">
                                        {q.options.map(opt => (
                                            <label key={opt} className={`cursor-pointer px-4 py-2 rounded-lg border text-sm transition-all ${answers[q.id] === opt ? 'bg-cyan-600 border-cyan-500 text-white shadow-md' : 'bg-slate-900/50 border-slate-600 text-slate-400 hover:bg-slate-800'}`}>
                                                <input type="radio" className="hidden" checked={answers[q.id] === opt} onChange={() => setAnswers({...answers, [q.id]: opt})} />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700">
                            <label className="block text-sm font-bold text-slate-300 mb-2">Field Observations (Optional)</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="Notes on vibration, noise, leaks..." />
                        </div>

                        <div className="flex flex-col gap-4 border-t border-slate-700 pt-6">
                            <button 
                                onClick={handleSendEmail} 
                                className="w-full py-4 bg-slate-800 border border-cyan-500/50 text-cyan-400 font-bold rounded-xl hover:bg-cyan-900/20 hover:border-cyan-400 transition-all flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                SEND DATA TO HQ (ino@anohubs.com)
                            </button>

                            <button 
                                onClick={() => { setIsQuestionnaireDataFresh(true); onShowSummary(); }} 
                                disabled={!isQuestionsComplete}
                                className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all ${isQuestionsComplete ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/30 hover:-translate-y-1' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                            >
                                {isQuestionsComplete ? 'GENERATE LOCAL RISK REPORT' : 'Complete All Questions to Analyze'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};