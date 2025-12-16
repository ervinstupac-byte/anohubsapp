import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { QUESTIONS } from '../constants.ts';

interface QuestionnaireProps {
    onShowSummary: () => void;
    onRiskSync?: (score: number, criticalCount: number) => void;
}

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const Questionnaire: React.FC<QuestionnaireProps> = ({ onShowSummary, onRiskSync }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Dodano stanje za fokusiranu opciju (za navigaciju tastaturom)
    const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);

    const currentQ = QUESTIONS[currentStep];
    const isLastQuestion = currentStep === QUESTIONS.length - 1;
    const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

    // Reset fokusa kod promjene pitanja
    React.useEffect(() => {
        setFocusedOptionIndex(-1);
    }, [currentStep]);

    // Upravljanje tastaturom
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                // PRIORITET 1: Ako je pitanje već odgovoreno, idi na sljedeće
                if (answers[currentQ.id]) {
                    handleNext();
                }
                // PRIORITET 2: Ako opcija je fokusirana, odaberi je
                else if (focusedOptionIndex !== -1) {
                    handleAnswer(currentQ.options[focusedOptionIndex]);
                }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                setFocusedOptionIndex(prev =>
                    prev < currentQ.options.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                setFocusedOptionIndex(prev =>
                    prev > 0 ? prev - 1 : currentQ.options.length - 1
                );
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedOptionIndex, answers, currentQ, currentStep]);

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
            if (answer && answer === q.critical) {
                calculatedScore += 20; // Puno bodova za loš odgovor
                criticalCount++;      // Zabilježi kritičnu grešku
            } else if (answer && (answer.includes('No') || answer.includes('Unknown') || answer.includes('Partial'))) {
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

    return (
        <div className="max-w-3xl mx-auto">
            {/* PROGRESS BAR */}
            <div className="mb-8">
                <div className="flex justify-between text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">
                    <span>{t('questionnaire.title', 'System Diagnostic')}</span>
                    <span>{Math.round(progress)}% {t('questionnaire.completed', 'Complete')}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 transition-all duration-500 ease-out shadow-[0_0_10px_cyan]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* QUESTION CARD */}
            <GlassCard className="min-h-[500px] flex flex-col justify-between border-t-4 border-t-cyan-500">
                <div>
                    <span className="inline-block px-3 py-1 bg-cyan-950/50 text-cyan-400 text-xs font-mono rounded border border-cyan-500/20 mb-6 font-bold">
                        QUERY_ID: {currentQ.id.toUpperCase()}
                    </span>

                    <h3 className="text-3xl font-black text-white mb-10 leading-snug tracking-tight">
                        {t(`questions.${currentQ.id}.text`, currentQ.text)}
                    </h3>

                    <div className="space-y-4">
                        {currentQ.options.map((option, index) => {
                            const isSelected = answers[currentQ.id] === option;
                            const isFocused = focusedOptionIndex === index;

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    onMouseEnter={() => setFocusedOptionIndex(index)}
                                    className={`
                                        w-full text-left p-6 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden
                                        ${isSelected
                                            ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-900/50 scale-[1.02]'
                                            : isFocused
                                                ? 'bg-slate-800 border-cyan-500/50 text-white scale-[1.01]'
                                                : 'bg-slate-800/30 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/20 hover:text-white'}
                                    `}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all
                                                ${isSelected ? 'border-white bg-white text-cyan-600' : 'border-slate-500 text-slate-500 group-hover:border-cyan-400 group-hover:text-cyan-400'}
                                            `}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className="text-lg font-medium">{t(`questions.${currentQ.id}.options.${index}`, option)}</span>
                                        </div>

                                        {isSelected && (
                                            <span className="text-white animate-scale-in text-xl font-bold">✓</span>
                                        )}
                                        {isFocused && !isSelected && (
                                            <span className="text-cyan-500 text-xs uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                Select
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                    <div className="text-xs text-slate-500 font-mono hidden sm:block">
                        [ENTER] Confirm selection • [ARROWS] Navigate
                    </div>

                    <ModernButton
                        onClick={handleNext}
                        disabled={!answers[currentQ.id]}
                        variant="primary"
                        className="px-10 py-4 text-lg"
                        icon={isLastQuestion ? <span>💾</span> : <span>→</span>}
                    >
                        {isLastQuestion ? t('questionnaire.finalize', 'Finalize & Analyze') : t('questionnaire.next', 'Next Parameter')}
                    </ModernButton>
                </div>
            </GlassCard>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.