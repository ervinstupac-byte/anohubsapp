import { create } from 'zustand';
import type { Answers, OperationalData } from '../types';

interface QuestionnaireStore {
    answers: Answers;
    operationalData: OperationalData;
    description: string;
    setAnswer: (questionId: string, value: string) => void;
    setOperationalData: (key: keyof OperationalData, value: string | number) => void;
    setDescription: (value: string) => void;
    resetQuestionnaire: () => void;
}

export const useQuestionnaireStore = create<QuestionnaireStore>((set) => ({
    answers: {},
    operationalData: {
        commissioningYear: '',
        maintenanceCycle: '',
        powerOutput: '',
        turbineType: '',
        head: '',
        flow: '',
        pressure: '',
        output: '',
    },
    description: '',
    
    setAnswer: (questionId: string, value: string) => 
        set((state) => ({ answers: { ...state.answers, [questionId]: value } })),
    
    setOperationalData: (key: keyof OperationalData, value: string | number) => 
        set((state) => ({ operationalData: { ...state.operationalData, [key]: value } })),
    
    setDescription: (value: string) => set({ description: value }),
    
    resetQuestionnaire: () => 
        set({
            answers: {},
            operationalData: {
                commissioningYear: '',
                maintenanceCycle: '',
                powerOutput: '',
                turbineType: '',
                head: '',
                flow: '',
                pressure: '',
                output: '',
            },
            description: ''
        })
}));
