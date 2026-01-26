import React, { createContext, useContext, useState } from 'react';
import type { 
    Answers, 
    OperationalData, 
    QuestionnaireContextType 
} from '../types.ts';

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Stanje za odgovore na pitanja
    const [answers, setAnswersState] = useState<Answers>({});
    
    // Stanje za operativne podatke (Head, Flow, itd.)
    const [operationalData, setOperationalDataState] = useState<OperationalData>({
        commissioningYear: '',
        maintenanceCycle: '',
        powerOutput: '',
        turbineType: '',
        head: '',
        flow: '',
        pressure: '',
        output: '',
    });
    
    // Stanje za opis/zaključak
    const [description, setDescription] = useState('');

    // Funkcija za ažuriranje pojedinog odgovora
    const setAnswer = (questionId: string, value: string) => {
        setAnswersState(prev => ({ ...prev, [questionId]: value }));
    };

    // Funkcija za ažuriranje operativnih podataka
    const setOperationalData = (key: keyof OperationalData, value: string | number) => {
        setOperationalDataState(prev => ({ ...prev, [key]: value }));
    };

    // Resetiranje cijelog upitnika na nulu
    const resetQuestionnaire = () => {
        setAnswersState({});
        setOperationalDataState({
            commissioningYear: '',
            maintenanceCycle: '',
            powerOutput: '',
            turbineType: '',
            head: '',
            flow: '',
            pressure: '',
            output: '',
        });
        setDescription('');
    };

    const value = {
        answers,
        setAnswer,
        operationalData,
        setOperationalData,
        description,
        setDescription,
        resetQuestionnaire
    };

    return (
        <QuestionnaireContext.Provider value={value}>
            {children}
        </QuestionnaireContext.Provider>
    );
};

export const useQuestionnaire = () => {
    const context = useContext(QuestionnaireContext);
    if (!context) {
        throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
    }
    return context;
};
