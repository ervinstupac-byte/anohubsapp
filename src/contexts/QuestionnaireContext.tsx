// src/contexts/QuestionnaireContext.tsx

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { 
    Answers, 
    OperationalData, 
    QuestionnaireContextType, 
    TurbineType 
} from '../types.ts';

// Početno stanje za operativne podatke (prazne stringove)
const initialOperationalData: OperationalData = {
    commissioningYear: '',
    maintenanceCycle: '',
    powerOutput: '',
    turbineType: '',
    head: '',
    flow: '',
    pressure: '',
    output: '',
};

const initialContext: QuestionnaireContextType = {
    answers: {},
    description: '',
    selectedTurbine: null,
    operationalData: initialOperationalData,
    isQuestionnaireDataFresh: false,
    
    // Potrebne dummy funkcije za inicijalizaciju
    setAnswer: () => {}, 
    setOperationalData: () => {},
    
    // Ostatak
    setAnswers: () => {},
    setDescription: () => {},
    setSelectedTurbine: () => {},
    setIsQuestionnaireDataFresh: () => {},
    resetQuestionnaire: () => {},
};

export const QuestionnaireContext = createContext<QuestionnaireContextType>(initialContext);

export const useQuestionnaire = () => useContext(QuestionnaireContext);

export const QuestionnaireProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [answers, setAnswers] = useState<Answers>({});
    const [description, setDescriptionState] = useState('');
    const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(null);
    const [operationalData, setOperationalDataState] = useState<OperationalData>(initialOperationalData);
    const [isQuestionnaireDataFresh, setIsQuestionnaireDataFresh] = useState(false);

    // FUNKCIJA: Postavlja odgovor na jedno pitanje
    const setAnswer = useCallback((questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    }, []);

    // FUNKCIJA: Postavlja vrijednost za jedan operativni podatak
    const setOperationalData = useCallback((key: keyof OperationalData, value: string) => {
        setOperationalDataState(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);
    
    // FUNKCIJA: Postavlja opis
    const setDescription = useCallback((desc: string) => {
        setDescriptionState(desc);
    }, []);

    // FUNKCIJA: Resetuje cijelu anketu
    const resetQuestionnaire = useCallback(() => {
        setAnswers({});
        setDescriptionState('');
        setSelectedTurbine(null);
        setOperationalDataState(initialOperationalData);
        setIsQuestionnaireDataFresh(false);
    }, []);

    const contextValue = useMemo(() => ({
        answers,
        description,
        selectedTurbine,
        operationalData,
        isQuestionnaireDataFresh,
        
        // Funkcije
        setAnswers,
        setDescription,
        setAnswer, // <-- ISPRAVLJENO: Dodano
        setSelectedTurbine,
        setOperationalData, // <-- ISPRAVLJENO: Dodano
        setIsQuestionnaireDataFresh,
        resetQuestionnaire,
    }), [
        answers, 
        description, 
        selectedTurbine, 
        operationalData, 
        isQuestionnaireDataFresh,
        setDescription, 
        setAnswer, 
        setOperationalData, 
        resetQuestionnaire
    ]);

    return (
        <QuestionnaireContext.Provider value={contextValue}>
            {children}
        </QuestionnaireContext.Provider>
    );
};