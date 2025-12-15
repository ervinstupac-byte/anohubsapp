import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// Pitanja i opcije
const QUESTIONS = [
    { 
        id: 'q1', 
        text: 'Do you verify intake velocity profiles using CFD or physical scale models?', 
        options: ['Yes, always', 'Only for large units', 'No, relied on OEM', 'Not documented'],
        critical: 'No, relied on OEM' // Ako ovo odabere, dobiva Critical Flag
    },
    { 
        id: 'q2', 
        text: 'Is the "0.05 mm/m" alignment tolerance strictly enforced in contracts?', 
        options: ['Yes, non-negotiable', 'Yes, but defined loosely', 'No', 'Unknown'],
        critical: 'No'
    },
    { 
        id: 'q3', 
        text: 'Are vibration spectra (FFT) integrated into the SCADA logic?', 
        options: ['Yes, full integration', 'Standalone system only', 'Portable measurements', 'No'],
        critical: 'No'
    },
    { 
        id: 'q4', 
        text: 'Do you have EN 10204 3.1 certificates for all runner bolts?', 
        options: ['Yes, archived digitally', 'Paper copies only', 'Partial', 'No'],
        critical: 'No'
    },
    { 
        id: 'q5', 
        text: 'Is "Ownership Maintenance" practiced by operators?', 
        options: ['Yes, highly disciplined', 'Variable discipline', 'No, "Run-to-Failure" mentality'],
        critical: 'No, "Run-to-Failure" mentality'
    }
];

interface QuestionnaireProps {
    onShowSummary: () => void;
    onRiskSync?: (score: number, criticalCount: number) => void; // Funkcija koju dobivamo od roditelja
}

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const Questionnaire: React.FC<QuestionnaireProps> = ({ onShowSummary, onRiskSync }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleAnswer = (option: string) => {
        setAnswers(prev => ({ ...prev, [QUESTIONS[currentStep].id]: option }));
    };

    const handleNext = () => {
        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        // 1. IZRAČUN REZULTATA (LOGIKA)
        let calculatedScore = 0;
        let criticalCount = 0;

        QUESTIONS.forEach((q) => {
            const answer = answers[q.id];
            
            // Logika bodovanja
            if (answer === q.critical) {
                calculatedScore += 20; // Puno bodova za loš odgovor
                criticalCount++;      // Zabilježi kritičnu grešku
            } else if (answer.includes('No') || answer.includes('Unknown') || answer.includes('Partial')) {
                calculatedScore += 10; // Srednji rizik
            }
        });

        // 2. AKTIVACIJA NEURAL LINKA (Šaljemo podatke u System Core)
        if (onRiskSync) {
            console.log(`🧠 Neural Link Transmitting: Score ${calculatedScore}, Flags: ${criticalCount}`);
            onRiskSync(calculatedScore, criticalCount);
        }

        // 3. PRIKAZI SAŽETAK
        onShowSummary();
    };

    const currentQ = QUESTIONS[currentStep];
    const isLastQuestion = currentStep === QUESTIONS.length - 1;
    const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

    return (
        <div className="max-w-2xl mx-auto">
            {/* PROGRESS BAR */}
            <div className="mb-8">
                <div className="flex justify-between text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">
                    <span>System Diagnostic</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-cyan-500 transition-all duration-500 ease-out shadow-[0_0_10px_cyan]" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* QUESTION CARD */}
            <GlassCard className="min-h-[400px] flex flex-col justify-between border-t-4 border-t-cyan-500">
                <div>
                    <span className="inline-block px-2 py-1 bg-cyan-950/50 text-cyan-400 text-[10px] font-mono rounded border border-cyan-500/20 mb-4">
                        QUERY_ID: {currentQ.id.toUpperCase()}
                    </span>
                    
                    <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">
                        {currentQ.text}
                    </h3>

                    <div className="space-y-3">
                        {currentQ.options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className={`
                                    w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
                                    ${answers[currentQ.id] === option 
                                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-900/50' 
                                        : 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/20 hover:text-white'}
                                `}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-sm font-medium">{option}</span>
                                    {answers[currentQ.id] === option && (
                                        <span className="text-white animate-scale-in">✓</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                    <ModernButton 
                        onClick={handleNext} 
                        disabled={!answers[currentQ.id]}
                        variant="primary"
                        className="px-8"
                        icon={isLastQuestion ? <span>💾</span> : <span>→</span>}
                    >
                        {isLastQuestion ? 'Finalize Analysis' : 'Next Parameter'}
                    </ModernButton>
                </div>
            </GlassCard>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.