import React, { createContext, useContext, useState } from 'react';
import type { Answers, OperationalData, TurbineType, QuestionnaireContextType } from '../types';

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [answers, setAnswers] = useState<Answers>({});
  const [description, setDescription] = useState<string>('');
  const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(null);
  const [operationalData, setOperationalData] = useState<OperationalData>({ head: '', flow: '', pressure: '', output: '' });
  const [isQuestionnaireDataFresh, setIsQuestionnaireDataFresh] = useState(false);

  const resetQuestionnaire = () => {
    setAnswers({});
    setDescription('');
    setSelectedTurbine(null);
    setOperationalData({ head: '', flow: '', pressure: '', output: '' });
    setIsQuestionnaireDataFresh(false);
  };

  const value = {
    answers,
    description,
    selectedTurbine,
    operationalData,
    isQuestionnaireDataFresh,
    setAnswers,
    setDescription,
    setSelectedTurbine,
    setOperationalData,
    setIsQuestionnaireDataFresh,
    resetQuestionnaire,
  };

  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = (): QuestionnaireContextType => {
  const context = useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
};