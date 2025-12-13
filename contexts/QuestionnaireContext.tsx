import React, { createContext, useContext, useState, useEffect } from 'react';
// Putanja je točna za tvoju strukturu: izlazimo iz 'contexts' u root
import type { Answers, OperationalData, TurbineType, QuestionnaireContextType } from '../types.ts';

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

// Ključ za lokalnu memoriju preglednika
const STORAGE_KEY = 'anohub-questionnaire-data-v1';

export const QuestionnaireProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // --- HELPER ZA UČITAVANJE (Lazy Load) ---
  // Ovo sprječava gubitak podataka na refresh
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load questionnaire data", e);
    }
    return null; 
  };

  const savedData = loadState();

  // --- STATE INICIJALIZACIJA ---
  // Ako imamo spremljeno, koristimo to. Ako ne, prazno.
  const [answers, setAnswers] = useState<Answers>(savedData?.answers || {});
  const [description, setDescription] = useState<string>(savedData?.description || '');
  const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(savedData?.selectedTurbine || null);
  const [operationalData, setOperationalData] = useState<OperationalData>(
    savedData?.operationalData || { head: '', flow: '', pressure: '', output: '' }
  );
  
  const [isQuestionnaireDataFresh, setIsQuestionnaireDataFresh] = useState(false);

  // --- AUTOMATSKO SPREMANJE (Auto-Save) ---
  // Svaki put kad se nešto promijeni, spremi u localStorage
  useEffect(() => {
    const dataToSave = {
      answers,
      description,
      selectedTurbine,
      operationalData
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [answers, description, selectedTurbine, operationalData]);

  // --- RESET FUNKCIJA (Čisti sve) ---
  const resetQuestionnaire = () => {
    setAnswers({});
    setDescription('');
    setSelectedTurbine(null);
    setOperationalData({ head: '', flow: '', pressure: '', output: '' });
    setIsQuestionnaireDataFresh(false);
    
    // Ključno: Brišemo i iz memorije preglednika
    localStorage.removeItem(STORAGE_KEY);
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