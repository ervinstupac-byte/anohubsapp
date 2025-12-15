import React, { useState, useMemo } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import type { OperationalData } from '../types.ts';
import { QUESTIONS } from '../constants.ts';

interface QuestionnaireProps {
    onShowSummary: () => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onShowSummary }) => {
    const { answers, setAnswer, operationalData, setOperationalData } = useQuestionnaire();
    const { calculateAndSetQuestionnaireRisk } = useRisk();
    const { navigateToHub } = useNavigation();
    const [step, setStep] = useState(0);

    const operationalFields: { key: keyof OperationalData, label: string, type: 'text' | 'number' }[] = useMemo(() => [
        { key: 'commissioningYear', label: 'Commissioning Year', type: 'text' },
        { key: 'maintenanceCycle', label: 'Maintenance Cycle (years)', type: 'text' },
        { key: 'powerOutput', label: 'Designed Power Output (MW)', type: 'number' },
        { key: 'turbineType', label: 'Turbine Type (Francis/Kaplan/Pelton)', type: 'text' },
        { key: 'head', label: 'Gross Head [m]', type: 'number' },
        { key: 'flow', label: 'Flow [m³/s]', type: 'number' },
    ], []);

    const handleComplete = () => {
        calculateAndSetQuestionnaireRisk(answers);
        onShowSummary();
    };

    const progressPercentage = Math.round((step / (QUESTIONS.length + 1)) * 100);

    const renderStep = () => {
        // STEP 0: Operational Data
        if (step === 0) {
            return (
                <div className="space-y-8 animate-fade-in">
                    <div className="border-b border-slate-700 pb-6 mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">1. Operational Context</h3>
                        <p className="text-slate-400 text-sm">
                            Define the physical parameters of the asset to calibrate the risk model.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {operationalFields.map(({ key, label, type }) => (
                            <div key={key} className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                                <input
                                    type={type}
                                    value={operationalData[key]}
                                    onChange={e => setOperationalData(key, e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none shadow-sm"
                                    placeholder={label}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-6">
                        <button
                            onClick={() => setStep(1)}
                            disabled={!operationalFields.slice(0, 3).every(field => operationalData[field.key] !== '')}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                        >
                            Proceed to Diagnostic Protocol
                        </button>
                    </div>
                </div>
            );
        }

        const currentQuestion = QUESTIONS[step - 1];

        // FINAL SCREEN
        if (!currentQuestion) {
            return (
                <div className="text-center space-y-8 p-12 bg-slate-800/50 rounded-2xl border border-slate-700 animate-scale-in">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <span className="text-5xl">✅</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">Diagnostic Complete</h3>
                    <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                        All data points have been captured. The system is ready to generate the Execution Gap Analysis.
                    </p>
                    <button
                        onClick={handleComplete}
                        className="w-full md:w-auto px-12 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-500 transition-colors shadow-lg hover:shadow-green-500/20"
                    >
                        Generate Risk Report
                    </button>
                </div>
            );
        }

        // QUESTIONS
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-start border-b border-slate-700 pb-6">
                    <div>
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 block">
                            Question {step} / {QUESTIONS.length}
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                            {currentQuestion.text}
                        </h3>
                    </div>
                </div>
                
                <div className="grid gap-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => setAnswer(currentQuestion.id, option)}
                            className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center gap-4 group
                                ${answers[currentQuestion.id] === option
                                    ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                                ${answers[currentQuestion.id] === option ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500 group-hover:border-slate-400'}
                            `}>
                                {answers[currentQuestion.id] === option && <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />}
                            </div>
                            <span className={`text-lg ${answers[currentQuestion.id] === option ? 'text-white font-medium' : 'text-slate-300'}`}>
                                {option}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between pt-8 border-t border-slate-700/50">
                    <button
                        onClick={() => setStep(prev => Math.max(0, prev - 1))}
                        className="px-6 py-2 text-slate-400 hover:text-white font-bold transition-colors flex items-center gap-2"
                    >
                        <span>←</span> Back
                    </button>
                    <button
                        onClick={() => setStep(prev => prev + 1)}
                        disabled={!answers[currentQuestion.id]}
                        className="px-8 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-cyan-50 disabled:bg-slate-700 disabled:text-slate-500 transition-all shadow-lg hover:shadow-cyan-500/20 disabled:shadow-none flex items-center gap-2"
                    >
                        Next Step <span>→</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-4">
            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mb-8 overflow-hidden">
                <div 
                    className="bg-cyan-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_cyan]" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
                {renderStep()}
            </div>

            {step > 0 && step <= QUESTIONS.length && (
                <div className="mt-8 text-center">
                    <button 
                        onClick={navigateToHub} 
                        className="text-slate-500 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-red-400 pb-0.5"
                    >
                        Abort Diagnostic
                    </button>
                </div>
            )}
        </div>
    );
};

export default Questionnaire;