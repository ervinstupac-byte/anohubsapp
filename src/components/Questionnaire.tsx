import React, { useState, useMemo } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import type { OperationalData } from '../types.ts';
import { QUESTIONS } from '../constants.ts';
import { GlassCard } from './ui/GlassCard.tsx'; // <--- UI Kit
import { ModernInput } from './ui/ModernInput.tsx'; // <--- UI Kit
import { ModernButton } from './ui/ModernButton.tsx'; // <--- UI Kit

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
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-cyan-900/30 rounded-2xl mb-4 border border-cyan-500/20">
                            <span className="text-3xl">🏗️</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Operational Context</h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                            Define the physical parameters of the asset to calibrate the risk model.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {operationalFields.map(({ key, label, type }) => (
                            <ModernInput
                                key={key}
                                label={label}
                                type={type}
                                value={operationalData[key]}
                                onChange={e => setOperationalData(key, e.target.value)}
                                placeholder={`Enter ${label.toLowerCase()}...`}
                            />
                        ))}
                    </div>
                    
                    <div className="pt-6 flex justify-end">
                        <ModernButton
                            onClick={() => setStep(1)}
                            disabled={!operationalFields.slice(0, 3).every(field => operationalData[field.key] !== '')}
                            variant="primary"
                            className="px-8"
                            icon={<span>→</span>}
                        >
                            Proceed to Diagnostic Protocol
                        </ModernButton>
                    </div>
                </div>
            );
        }

        const currentQuestion = QUESTIONS[step - 1];

        // FINAL SCREEN
        if (!currentQuestion) {
            return (
                <div className="text-center space-y-8 py-12 animate-scale-in">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6">
                            <span className="text-5xl text-white">✅</span>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Diagnostic Complete</h3>
                        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                            All data points have been captured. The system is ready to generate the Execution Gap Analysis.
                        </p>
                    </div>

                    <div className="pt-4">
                        <ModernButton
                            onClick={handleComplete}
                            variant="primary"
                            className="px-10 py-4 text-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                            icon={<span>📊</span>}
                        >
                            Generate Risk Report
                        </ModernButton>
                    </div>
                </div>
            );
        }

        // QUESTIONS
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="border-b border-white/5 pb-6">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3 block">
                        Question {step} of {QUESTIONS.length}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed tracking-wide">
                        {currentQuestion.text}
                    </h3>
                </div>
                
                <div className="grid gap-4">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = answers[currentQuestion.id] === option;
                        return (
                            <button
                                key={index}
                                onClick={() => setAnswer(currentQuestion.id, option)}
                                className={`
                                    w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center gap-5 group relative overflow-hidden
                                    ${isSelected
                                        ? 'bg-cyan-600/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                        : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                                    }
                                `}
                            >
                                {/* Selection Indicator */}
                                <div className={`
                                    w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300
                                    ${isSelected ? 'border-cyan-400 bg-cyan-400 scale-110' : 'border-slate-600 group-hover:border-slate-400'}
                                `}>
                                    {isSelected && <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />}
                                </div>
                                
                                <span className={`text-lg font-medium transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                    {option}
                                </span>

                                {/* Hover Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none opacity-50`}></div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between pt-8 border-t border-white/5">
                    <ModernButton
                        onClick={() => setStep(prev => Math.max(0, prev - 1))}
                        variant="ghost"
                        icon={<span>←</span>}
                    >
                        Back
                    </ModernButton>
                    
                    <ModernButton
                        onClick={() => setStep(prev => prev + 1)}
                        disabled={!answers[currentQuestion.id]}
                        variant="primary"
                        className="shadow-cyan-500/20"
                        icon={<span>→</span>}
                    >
                        Next Step
                    </ModernButton>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-900/50 h-2 rounded-full mb-8 overflow-hidden border border-white/5">
                <div 
                    className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full transition-all duration-700 ease-out shadow-[0_0_15px_cyan] relative" 
                    style={{ width: `${progressPercentage}%` }}
                >
                    <div className="absolute top-0 right-0 w-2 h-full bg-white/50 blur-[2px]"></div>
                </div>
            </div>

            <GlassCard className="p-8 md:p-10 shadow-2xl shadow-cyan-900/10 min-h-[600px] flex flex-col justify-center">
                {renderStep()}
            </GlassCard>

            {step > 0 && step <= QUESTIONS.length && (
                <div className="mt-8 text-center">
                    <button 
                        onClick={navigateToHub} 
                        className="text-slate-500 hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-[0.2em] hover:underline decoration-red-400 underline-offset-4"
                    >
                        Abort Diagnostic Protocol
                    </button>
                </div>
            )}
        </div>
    );
};

export default Questionnaire;