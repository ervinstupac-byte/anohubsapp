import React, { useState } from 'react';
import { useQuestionnaire } from '../contexts/QuestionnaireContext';
import { QUESTIONS, TURBINE_CATEGORIES } from '../constants';
import type { OperationalData } from '../types';

interface QuestionnaireProps {
  onShowSummary: () => void;
}

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

  const onAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const onDescriptionChange = (value: string) => {
    setDescription(value);
  };
  
  const onOperationalDataChange = (field: keyof OperationalData, value: string) => {
    setOperationalData(prev => ({ ...prev, [field]: value }));
  };

  const isSubmitDisabled = Object.keys(answers).length < QUESTIONS.length;
  const isOpDataComplete = Object.values(operationalData).every(val => typeof val === 'string' && val.trim() !== '');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleCategorySelect = (key: string) => {
    setSelectedCategoryKey(key);
    setSelectedTurbine(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      fetch(form.action, { method: form.method, body: formData, headers: { 'Accept': 'application/json' } })
          .catch(error => console.error('Form submission error:', error));
      
      setIsQuestionnaireDataFresh(true);
      onShowSummary();
  };
  
  const stepLabels = ['Turbine Selection', 'Operational Parameters', 'Detailed Analysis'];

  return (
    <form 
        onSubmit={handleSubmit}
        action="https://formspree.io/f/xwkgylzv" 
        method="POST"
        className="space-y-8 animate-fade-in"
    >
      <div className="flex items-center mb-8">
        {stepLabels.map((label, index) => {
          const isCompleted = step > index + 1;
          const isActive = step === index + 1;
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col sm:flex-row items-center text-center transition-colors duration-300">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${isActive ? 'border-cyan-500 bg-cyan-900/50 text-white scale-110' : isCompleted ? 'border-cyan-600 bg-cyan-600/30 text-cyan-300' : 'border-slate-600 bg-slate-700/50 text-slate-400'}`}>
                  {isCompleted ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : index + 1}
                </div>
                <span className={`hidden sm:block mt-2 sm:mt-0 sm:ml-3 text-sm font-semibold ${isActive ? 'text-white' : isCompleted ? 'text-cyan-400' : 'text-slate-500'}`}>{label}</span>
              </div>
              {index < stepLabels.length - 1 && <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded ${isCompleted ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>}
            </React.Fragment>
          );
        })}
      </div>

      {step === 1 && (
        <div key={1} className="animate-fade-in">
          <h2 className="text-2xl font-bold text-center mb-6">{stepLabels[0]}</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {Object.keys(TURBINE_CATEGORIES).map((key) => {
                const category = TURBINE_CATEGORIES[key];
                return (
                  <button key={key} type="button" onClick={() => handleCategorySelect(key)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategoryKey === key ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{category.name}</button>
                );
            })}
          </div>
          {selectedCategoryKey && (() => {
              const category = TURBINE_CATEGORIES[selectedCategoryKey];
              return (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
                    {category.types.map(turbine => (
                    <label key={turbine.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTurbine?.id === turbine.id ? 'border-cyan-500 bg-cyan-900/50 scale-105' : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'}`}>
                        <input type="radio" name="Turbine Type" value={`${category.name} - ${turbine.name}`} checked={selectedTurbine?.id === turbine.id} onChange={() => setSelectedTurbine(turbine)} className="hidden"/>
                        <h3 className="text-lg font-bold">{turbine.name}</h3>
                        <p className="text-sm text-slate-400">{turbine.description}</p>
                    </label>
                    ))}
                </div>
              )
          })()}
          <div className="text-center mt-8">
            <button type="button" onClick={nextStep} disabled={!selectedTurbine} className="px-8 py-3 text-lg font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div key={2} className="animate-fade-in">
          <h2 className="text-2xl font-bold text-center mb-6">{stepLabels[1]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="head" className="block text-sm font-medium mb-1">Water Head (m)</label>
              <input type="text" name="Water Head (m)" id="head" value={operationalData.head} onChange={e => onOperationalDataChange('head', e.target.value)} className="w-full p-2 bg-slate-700/50 rounded-md border border-slate-600" required />
            </div>
            <div>
              <label htmlFor="flow" className="block text-sm font-medium mb-1">Flow Rate (m³/s)</label>
              <input type="text" name="Flow Rate (m³/s)" id="flow" value={operationalData.flow} onChange={e => onOperationalDataChange('flow', e.target.value)} className="w-full p-2 bg-slate-700/50 rounded-md border border-slate-600" required />
            </div>
            <div>
              <label htmlFor="pressure" className="block text-sm font-medium mb-1">Pressure (bar)</label>
              <input type="text" name="Pressure (bar)" id="pressure" value={operationalData.pressure} onChange={e => onOperationalDataChange('pressure', e.target.value)} className="w-full p-2 bg-slate-700/50 rounded-md border border-slate-600" required />
            </div>
            <div>
              <label htmlFor="output" className="block text-sm font-medium mb-1">Power Output (MW)</label>
              <input type="text" name="Power Output (MW)" id="output" value={operationalData.output} onChange={e => onOperationalDataChange('output', e.target.value)} className="w-full p-2 bg-slate-700/50 rounded-md border border-slate-600" required />
            </div>
          </div>
           <div className="flex justify-between mt-8">
            <button type="button" onClick={prevStep} className="px-6 py-2 font-bold rounded-lg bg-slate-600 hover:bg-slate-500">Back</button>
            <button type="button" onClick={nextStep} disabled={!isOpDataComplete} className="px-8 py-3 text-lg font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div key={3} className="animate-fade-in">
           <h2 className="text-2xl font-bold text-center mb-6">{stepLabels[2]}</h2>
          {QUESTIONS.map((q, index) => (
            <div key={q.id} className="border-b border-slate-700 pb-6 mb-6">
              <p className="text-lg font-semibold mb-4"><span className="text-cyan-400 mr-2">{index + 1}.</span>{q.text}</p>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                {q.options.map(option => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700">
                    <input type="radio" name={q.text} value={option} checked={answers[q.id] === option} onChange={() => onAnswerChange(q.id, option)} className="form-radio h-5 w-5 text-cyan-500" required />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div>
            <label htmlFor="description" className="block text-lg font-semibold mb-2">Additional Description (optional)</label>
            <textarea id="description" name="Additional Observations" value={description} onChange={(e) => onDescriptionChange(e.target.value)} rows={4} className="w-full p-3 bg-slate-700/50 rounded-lg border border-slate-600" placeholder="E.g., a buzzing sound is heard at high RPMs..." />
          </div>
          <input type="hidden" name="_subject" value={`New Submission - HPP Risk Assessment (${selectedTurbine?.name})`} />
          <div className="flex justify-between items-center pt-4">
             <button type="button" onClick={prevStep} className="px-6 py-2 font-bold rounded-lg bg-slate-600 hover:bg-slate-500">Back</button>
            <div className="text-center">
              <button type="submit" disabled={isSubmitDisabled} className={`px-8 py-3 text-lg font-bold rounded-lg transition-all ${isSubmitDisabled ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg transform hover:-translate-y-1'}`}>Submit for Summary</button>
              {isSubmitDisabled && <p className="text-sm text-slate-500 mt-3">Please answer all questions to proceed.</p>}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};