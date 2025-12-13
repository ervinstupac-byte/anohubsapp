// src/components/Questionnaire.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import type { Question, OperationalData } from '../types.ts';

interface QuestionnaireProps {
    onShowSummary: () => void;
}

// --- Fiksna struktura pitanja (za primjer) ---
const QUESTIONS: Question[] = [
    {
        id: 'q1_corrosion',
        text: 'Koliko često se uočava problem korozije na glavnim dijelovima turbine?',
        options: ['Nikad', 'Rijetko (godišnje inspekcije)', 'Umjereno (kvartalno)', 'Vrlo često (mjesečno)'],
    },
    {
        id: 'q2_vibration',
        text: 'Kakva je razina vibracija zabilježena u posljednjih 6 mjeseci?',
        options: ['Unutar nominalnih granica', 'Povremena odstupanja (+10% nominalne)', 'Stalna odstupanja (+20% nominalne)', 'Kritična odstupanja (+30% nominalne)'],
    },
    {
        id: 'q3_documentation',
        text: 'Koliko je ažurna tehnička dokumentacija (digitalni blizanci, logbook, itd.)?',
        options: ['Potpuno ažurna (u realnom vremenu)', 'Ažurna (unutar 7 dana)', 'Djelomično ažurna (kašnjenje > 1 mjesec)', 'Neažurna (potpuno zastarjela)'],
    },
    // Dodajte ostala pitanja po potrebi...
];

const Questionnaire: React.FC<QuestionnaireProps> = ({ onShowSummary }) => {
    const { answers, setAnswer, operationalData, setOperationalData, resetQuestionnaire } = useQuestionnaire();
    const { calculateAndSetQuestionnaireRisk } = useRisk();
    const { navigateToHub } = useNavigation();
    const [step, setStep] = useState(0);

    // Lista polja za Operativne podatke
    const operationalFields: { key: keyof OperationalData, label: string, type: 'text' | 'number' }[] = useMemo(() => [
        { key: 'commissioningYear', label: 'Godina puštanja u rad', type: 'text' },
        { key: 'maintenanceCycle', label: 'Ciklus održavanja (godine)', type: 'text' },
        { key: 'powerOutput', label: 'Projektirana izlazna snaga (MW)', type: 'number' },
        { key: 'turbineType', label: 'Tip turbine (Francis/Kaplan/Pelton)', type: 'text' },
        // Stara polja koja se koriste za integracije (Gemini/PDF)
        { key: 'head', label: 'Bruto pad (Head) [m]', type: 'number' },
        { key: 'flow', label: 'Protok (Flow) [m³/s]', type: 'number' },
        { key: 'pressure', label: 'Tlak (Pressure) [bar]', type: 'number' },
        { key: 'output', label: 'Trenutna snaga (MW)', type: 'number' },
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
                    <h3 className="text-2xl font-semibold text-cyan-400">1. Operativni podaci HPP-a</h3>
                    <p className="text-slate-300">Unesite ključne operativne parametre koji će definirati kontekst analize rizika.</p>
                    
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
                        Nastavi na procjenu discipline
                    </button>
                </div>
            );
        }

        const currentQuestion = QUESTIONS[step - 1];

        if (!currentQuestion) {
            // Završni ekran
            return (
                <div className="text-center space-y-8 p-8 bg-slate-700/50 rounded-lg">
                    <h3 className="text-3xl font-bold text-green-400">Procjena završena!</h3>
                    <p className="text-xl text-slate-200">Svi podaci su prikupljeni. Spremni ste generirati Analizu izvršnog jaza (Execution Gap Analysis) i izvještaj o riziku.</p>
                    <button
                        onClick={handleComplete}
                        className="w-full md:w-1/2 bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-500 transition-colors shadow-lg"
                    >
                        Prikaži sažetak i izvještaj o riziku
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-cyan-400">2. Procjena discipline (Pitanje {step} / {QUESTIONS.length})</h3>
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
                        &larr; Natrag
                    </button>
                    <button
                        onClick={() => setStep(prev => prev + 1)}
                        disabled={!answers[currentQuestion.id]}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
                    >
                        {step < QUESTIONS.length ? 'Sljedeće pitanje \u2192' : 'Završi procjenu'}
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
                    &larr; Povratak na HUB
                </button>
            </div>
        </div>
    );
};

export default Questionnaire;