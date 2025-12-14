// src/components/Questionnaire.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import type { Question, OperationalData } from '../types.ts';
import { QUESTIONS } from '../constants.ts';

interface QuestionnaireProps {
    onShowSummary: () => void;
}

// Use canonical QUESTIONS from `constants.ts` (English)

const Questionnaire: React.FC<QuestionnaireProps> = ({ onShowSummary }) => {
    const { answers, setAnswer, operationalData, setOperationalData, resetQuestionnaire } = useQuestionnaire();
    const { calculateAndSetQuestionnaireRisk } = useRisk();
    const { navigateToHub } = useNavigation();
    const [step, setStep] = useState(0);

    // Lista polja za Operativne podatke
    const operationalFields: { key: keyof OperationalData, label: string, type: 'text' | 'number' }[] = useMemo(() => [
        { key: 'commissioningYear', label: 'Commissioning Year', type: 'text' },
        { key: 'maintenanceCycle', label: 'Maintenance Cycle (years)', type: 'text' },
        { key: 'powerOutput', label: 'Designed Power Output (MW)', type: 'number' },
        { key: 'turbineType', label: 'Turbine Type (Francis/Kaplan/Pelton)', type: 'text' },
        // Legacy/integration fields for Gemini/PDF
        { key: 'head', label: 'Gross Head [m]', type: 'number' },
        { key: 'flow', label: 'Flow [m³/s]', type: 'number' },
        { key: 'pressure', label: 'Pressure [bar]', type: 'number' },
        { key: 'output', label: 'Current Output (MW)', type: 'number' },
    ], []);


    // Automatsko resetiranje prilikom montiranja komponente (opcionalno)
    useEffect(() => {
        // Ako želite da anketa počinje iznova svaki put kad se otvori
        // resetQuestionnaire(); 
    }, [/* resetQuestionnaire */]);


    // RUKOVATELJ ZAVRŠETKOM
    const handleComplete = () => {
        calculateAndSetQuestionnaireRisk(answers);
        onShowSummary();
    };

    // PROVJERA ZAVRŠETKA
    const isCompleted = useMemo(() => {
        const requiredAnswered = QUESTIONS.every(q => answers[q.id]);
        
        // Provjera jesu li sva operativna polja popunjena (ako su obvezna)
        const requiredOperationalFilled = operationalFields
            .slice(0, 4) // Npr. prva 4 su minimalno obvezna
            .every(field => operationalData[field.key] !== '');

        return requiredAnswered && requiredOperationalFilled;
    }, [answers, operationalData, operationalFields]);


    // RENDERIRANJE TRENUTNOG KORAKA
    const renderStep = () => {
        if (step === 0) {
            return (
                <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-cyan-400">1. Operational Plant Data</h3>
                    <p className="text-slate-300">Enter key operational parameters that define the context for the risk analysis.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {operationalFields.map(({ key, label, type }) => (
                            <div key={key} className="flex flex-col space-y-1">
                                <label className="text-sm font-medium text-slate-400">{label}:</label>
                                <input
                                    type={type}
                                    value={operationalData[key]}
                                    // RJEŠENJE GREŠKE TS2554: 
                                    // setOperationalData sada prima 2 argumenta: ključ i vrijednost
                                    onChange={e => setOperationalData(key, e.target.value)} 
                                    className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    placeholder={label}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <button
                        onClick={() => setStep(1)}
                        disabled={!operationalFields.slice(0, 4).every(field => operationalData[field.key] !== '')}
                        className="w-full mt-6 bg-cyan-600 text-white py-3 rounded-lg font-bold hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
                    >
                        Continue to Discipline Assessment
                    </button>
                </div>
            );
        }

        const currentQuestion = QUESTIONS[step - 1];

            if (!currentQuestion) {
            // Final screen
            return (
                <div className="text-center space-y-8 p-8 bg-slate-700/50 rounded-lg">
                    <h3 className="text-3xl font-bold text-green-400">Assessment Complete!</h3>
                    <p className="text-xl text-slate-200">All data captured. You can generate the Execution Gap Analysis and Risk Report.</p>
                    <button
                        onClick={handleComplete}
                        className="w-full md:w-1/2 bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-500 transition-colors shadow-lg"
                    >
                        Show summary and risk report
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-cyan-400">2. Discipline Assessment (Question {step} / {QUESTIONS.length})</h3>
                <p className="text-slate-300 max-w-2xl">{currentQuestion.text}</p>
                
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => setAnswer(currentQuestion.id, option)}
                            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 
                                ${answers[currentQuestion.id] === option
                                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg'
                                    : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between pt-4">
                    <button
                        onClick={() => setStep(prev => Math.max(0, prev - 1))}
                        className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                    >
                        &larr; Back
                    </button>
                    <button
                        onClick={() => setStep(prev => prev + 1)}
                        disabled={!answers[currentQuestion.id]}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
                    >
                        {step < QUESTIONS.length ? 'Next Question \u2192' : 'Complete Assessment'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-4">
            <h2 className="text-3xl font-extrabold text-white mb-6 text-center">HPP Execution Gap Assessment</h2>
            
            <div className="bg-slate-800 p-6 rounded-xl shadow-inner border border-slate-700">
                {renderStep()}
            </div>

            <div className="mt-8 text-center">
                <button 
                    onClick={navigateToHub} 
                    className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                >
                    &larr; Back to HUB
                </button>
            </div>
        </div>
    );
};

export default Questionnaire;