import React, { useState } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { QUESTIONS, TURBINE_CATEGORIES } from '../constants.ts';
import { BackButton } from './BackButton.tsx';
import type { OperationalData } from '../types.ts';

interface QuestionnaireProps {
    onShowSummary: () => void;
}

// --- HELPER: STEPPER COMPONENT ---
const Stepper: React.FC<{ currentStep: number; steps: string[] }> = ({ currentStep, steps }) => (
    <div className="flex items-center justify-center w-full mb-12">
        {steps.map((label, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
                <div key={index} className="flex items-center">
                    <div className="relative flex flex-col items-center group cursor-default">
                        <div 
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 z-10
                                ${isActive 
                                    ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.6)] scale-110 border-2 border-white' 
                                    : isCompleted 
                                        ? 'bg-slate-800 text-cyan-400 border-2 border-cyan-500' 
                                        : 'bg-slate-800 text-slate-500 border-2 border-slate-700'}
                            `}
                        >
                            {isCompleted ? '✓' : stepNum}
                        </div>
                        <span 
                            className={`
                                absolute top-12 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300
                                ${isActive ? 'text-cyan-400' : isCompleted ? 'text-slate-400' : 'text-slate-600'}
                            `}
                        >
                            {label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div 
                            className={`h-1 w-16 sm:w-32 transition-all duration-700 mx-2 ${isCompleted ? 'bg-cyan-500' : 'bg-slate-800'}`} 
                        />
                    )}
                </div>
            );
        })}
    </div>
);

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onShowSummary }) => {
    const {
        answers,
        description,
        selectedTurbine,
        operationalData,
        setAnswers,
        setDescription,
        setSelectedTurbine,
        setOperationalData,
        setIsQuestionnaireDataFresh,
    } = useQuestionnaire();

    const [step, setStep] = useState(1);
    const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };
    
    const onOperationalDataChange = (field: keyof OperationalData, value: string) => {
        setOperationalData(prev => ({ ...prev, [field]: value }));
    };

    const isOpDataComplete = Object.values(operationalData).every(val => typeof val === 'string' && val.trim() !== '');
    const isQuestionsComplete = Object.keys(answers).length >= QUESTIONS.length;

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleCategorySelect = (key: string) => {
        setSelectedCategoryKey(key);
        setSelectedTurbine(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            await fetch(form.action, { 
                method: form.method, 
                body: formData, 
                headers: { 'Accept': 'application/json' } 
            });
        } catch (error) {
            console.error('Form submission error:', error);
        }
        
        // Simuliramo kratku "analizu" za UX efekt
        setTimeout(() => {
            setIsQuestionnaireDataFresh(true);
            setIsSubmitting(false);
            onShowSummary();
        }, 1500);
    };
    
    const stepLabels = ['Configuration', 'Parameters', 'Diagnostics'];
    const inputClass = "w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 backdrop-blur-sm";

    return (
        <div className="animate-fade-in pb-12 max-w-5xl mx-auto">
            <BackButton text="Cancel Analysis" className="mb-8" />
            
            <Stepper currentStep={step} steps={stepLabels} />

            <form 
                onSubmit={handleSubmit}
                action="https://formspree.io/f/xwkgylzv" 
                method="POST"
                className="glass-panel p-8 rounded-2xl border-slate-700/50 shadow-2xl"
            >
                {/* --- STEP 1: TURBINE SELECTION --- */}
                {step === 1 && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">System Configuration</h2>
                            <p className="text-slate-400">Select your turbine type to calibrate the risk model.</p>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap justify-center gap-4">
                            {Object.keys(TURBINE_CATEGORIES).map((key) => (
                                <button 
                                    key={key} 
                                    type="button" 
                                    onClick={() => handleCategorySelect(key)} 
                                    className={`
                                        px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 uppercase tracking-wide
                                        ${selectedCategoryKey === key 
                                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25 scale-105' 
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'}
                                    `}
                                >
                                    {TURBINE_CATEGORIES[key].name}
                                </button>
                            ))}
                        </div>

                        {/* Turbine Cards */}
                        {selectedCategoryKey && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
                                {TURBINE_CATEGORIES[selectedCategoryKey].types.map(turbine => (
                                    <label 
                                        key={turbine.id} 
                                        className={`
                                            relative p-6 rounded-xl cursor-pointer border-2 transition-all duration-300 group
                                            ${selectedTurbine?.id === turbine.id 
                                                ? 'border-cyan-500 bg-cyan-900/20' 
                                                : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'}
                                        `}
                                    >
                                        <input 
                                            type="radio" 
                                            name="Turbine Type" 
                                            value={`${TURBINE_CATEGORIES[selectedCategoryKey].name} - ${turbine.name}`} 
                                            checked={selectedTurbine?.id === turbine.id} 
                                            onChange={() => setSelectedTurbine(turbine)} 
                                            className="hidden"
                                        />
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-lg font-bold mb-1 ${selectedTurbine?.id === turbine.id ? 'text-white' : 'text-slate-300'}`}>
                                                {turbine.name}
                                            </h3>
                                            {selectedTurbine?.id === turbine.id && <span className="text-cyan-400 text-xl">●</span>}
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300">
                                            {turbine.description}
                                        </p>
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button 
                                type="button" 
                                onClick={nextStep} 
                                disabled={!selectedTurbine} 
                                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-cyan-500/25 hover:-translate-y-1 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STEP 2: OPERATIONAL DATA --- */}
                {step === 2 && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Operational Parameters</h2>
                            <p className="text-slate-400">Input current operating data for the digital twin baseline.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Water Head (m)</label>
                                <input type="number" name="Water Head" value={operationalData.head} onChange={e => onOperationalDataChange('head', e.target.value)} className={inputClass} placeholder="e.g. 120" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Flow Rate (m³/s)</label>
                                <input type="number" name="Flow Rate" value={operationalData.flow} onChange={e => onOperationalDataChange('flow', e.target.value)} className={inputClass} placeholder="e.g. 45" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Pressure (bar)</label>
                                <input type="number" name="Pressure" value={operationalData.pressure} onChange={e => onOperationalDataChange('pressure', e.target.value)} className={inputClass} placeholder="e.g. 12" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Power Output (MW)</label>
                                <input type="number" name="Power Output" value={operationalData.output} onChange={e => onOperationalDataChange('output', e.target.value)} className={inputClass} placeholder="e.g. 5.5" required />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button type="button" onClick={prevStep} className="px-6 py-2 text-slate-400 hover:text-white font-bold transition-colors">Back</button>
                            <button type="button" onClick={nextStep} disabled={!isOpDataComplete} className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 hover:-translate-y-1 transition-all">Continue</button>
                        </div>
                    </div>
                )}

                {/* --- STEP 3: DIAGNOSTIC QUESTIONS --- */}
                {step === 3 && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Diagnostic Protocol</h2>
                            <p className="text-slate-400">Answer carefully. These inputs drive the Execution Gap analysis.</p>
                        </div>

                        <div className="space-y-6">
                            {QUESTIONS.map((q, index) => (
                                <div key={q.id} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                    <p className="text-lg font-medium text-slate-200 mb-4 flex gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-cyan-400 font-bold text-sm">{index + 1}</span>
                                        {q.text}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-11">
                                        {q.options.map(option => (
                                            <label 
                                                key={option} 
                                                className={`
                                                    cursor-pointer p-3 rounded-lg border text-sm font-medium text-center transition-all
                                                    ${answers[q.id] === option 
                                                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-md' 
                                                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                                                `}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name={q.text} 
                                                    value={option} 
                                                    checked={answers[q.id] === option} 
                                                    onChange={() => onAnswerChange(q.id, option)} 
                                                    className="hidden" 
                                                    required 
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
                            <label className="block text-sm font-bold text-slate-300 mb-2">Additional Field Observations (Optional)</label>
                            <textarea 
                                name="Additional Observations" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                rows={3} 
                                className={inputClass} 
                                placeholder="Describe any specific noises, vibrations, or anomalies..." 
                            />
                        </div>

                        <input type="hidden" name="_subject" value={`New Risk Analysis: ${selectedTurbine?.name}`} />

                        <div className="flex justify-between pt-6 border-t border-slate-700/50">
                            <button type="button" onClick={prevStep} className="px-6 py-2 text-slate-400 hover:text-white font-bold transition-colors">Back</button>
                            <button 
                                type="submit" 
                                disabled={!isQuestionsComplete || isSubmitting} 
                                className={`
                                    px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-xl 
                                    hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center gap-2
                                    ${(!isQuestionsComplete || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Analyzing...
                                    </>
                                ) : (
                                    'GENERATE RISK REPORT'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};