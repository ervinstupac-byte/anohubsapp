import React, { useState } from 'react';
import type { Question, Answers, TurbineType, OperationalData, TurbineCategories } from '../types';

interface QuestionnaireProps {
  questions: Question[];
  answers: Answers;
  description: string;
  onAnswerChange: (questionId: string, value: string) => void;
  onDescriptionChange: (value: string) => void;
  turbineCategories: TurbineCategories;
  selectedTurbine: TurbineType | null;
  onSelectTurbine: (turbine: TurbineType) => void;
  operationalData: OperationalData;
  onOperationalDataChange: (field: keyof OperationalData, value: string) => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  questions,
  answers,
  description,
  onAnswerChange,
  onDescriptionChange,
  turbineCategories,
  selectedTurbine,
  onSelectTurbine,
  operationalData,
  onOperationalDataChange,
}) => {
  const [step, setStep] = useState(1);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

  const isSubmitDisabled = Object.keys(answers).length < questions.length;
  const isOpDataComplete = Object.values(operationalData).every(val => val.trim() !== '');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleCategorySelect = (key: string) => {
    setSelectedCategoryKey(key);
    onSelectTurbine(null); // Reset specific turbine choice when category changes
  };

  return (
    <form 
        action="https://formspree.io/f/xwkgylzv" // Formspree endpoint za slanje na ino@anohubs.com
        method="POST"
        className="space-y-8 animate-fade-in"
    >
      {/* KORAK 1: Odabir Turbine */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">Korak 1: Odaberite Tip Turbine</h2>
          
          {/* Category Selection */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {Object.entries(turbineCategories).map(([key, category]) => (
              <button 
                key={key} 
                type="button"
                onClick={() => handleCategorySelect(key)} 
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategoryKey === key ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sub-type Selection */}
          {selectedCategoryKey && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
                {turbineCategories[selectedCategoryKey].types.map(turbine => (
                <label key={turbine.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTurbine?.id === turbine.id ? 'border-cyan-500 bg-cyan-900/50' : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'}`}>
                    <input
                    type="radio"
                    name="Tip Turbine"
                    value={`${turbineCategories[selectedCategoryKey].name} - ${turbine.name}`}
                    checked={selectedTurbine?.id === turbine.id}
                    onChange={() => onSelectTurbine(turbine)}
                    className="hidden"
                    />
                    <h3 className="text-lg font-bold text-slate-100">{turbine.name}</h3>
                    <p className="text-sm text-slate-400">{turbine.description}</p>
                </label>
                ))}
            </div>
          )}

          <div className="text-center mt-8">
            <button type="button" onClick={nextStep} disabled={!selectedTurbine} className="px-8 py-3 text-lg font-bold rounded-lg transition-colors bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-600 disabled:cursor-not-allowed">
              Dalje
            </button>
          </div>
        </div>
      )}

      {/* KORAK 2: Operativni Podaci */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">Korak 2: Unesite Operativne Parametre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="head" className="block text-sm font-medium text-slate-300 mb-1">Pad Vode (m)</label>
              <input type="text" name="Pad Vode (m)" id="head" value={operationalData.head} onChange={e => onOperationalDataChange('head', e.target.value)} className="w-full p-2 bg-slate-700/50 rounded-md border border-slate-600" required />
            </div>
            <div>
              <label htmlFor="flow" className="block text-sm font-medium text-slate-300 mb-1">Količina Vode (m³/s)</label>
              <input type="text" name="Količina Vode (m³/s)" id="flow" value={operationalData.flow} onChange={e => onOperationalDataChange('flow', e.target.value)} className="w-full p-2 bg-slate-700/50 rounded-md border border-slate-600" required />
            </div>
            <div>
              <label htmlFor="pressure" className="block text-sm font-medium text-slate-300 mb-1">Pritisak (bar)</label>
              <input type="text" name="Pritisak (bar)" id="pressure" value={operationalData.pressure} onChange={e => onOperationalDataChange('pressure', e.target.value)} className="w-full p-2 bg-slate-700/50 rounded-md border border-slate-600" required />
            </div>
            <div>
              <label htmlFor="output" className="block text-sm font-medium text-slate-300 mb-1">Snaga (MW)</label>
              <input type="text" name="Snaga (MW)" id="output" value={operationalData.output} onChange={e => onOperationalDataChange('output', e.target.value)} className="w-full p-2 bg-slate-700/50 rounded-md border border-slate-600" required />
            </div>
          </div>
           <div className="flex justify-between mt-8">
            <button type="button" onClick={prevStep} className="px-6 py-2 font-bold rounded-lg bg-slate-600 hover:bg-slate-500 text-white">Nazad</button>
            <button type="button" onClick={nextStep} disabled={!isOpDataComplete} className="px-8 py-3 text-lg font-bold rounded-lg transition-colors bg-cyan-600 hover:bg-cyan-500 text-white disabled:bg-slate-600 disabled:cursor-not-allowed">Dalje</button>
          </div>
        </div>
      )}

      {/* KORAK 3: Glavni Upitnik */}
      {step === 3 && (
        <div>
           <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">Korak 3: Detaljna Analiza Uzročnika</h2>
          {questions.map((q, index) => (
            <div key={q.id} className="border-b border-slate-700 pb-6 mb-6">
              <p className="text-lg font-semibold mb-4 text-slate-300">
                <span className="text-cyan-400 mr-2">{index + 1}.</span>{q.text}
              </p>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                {q.options.map(option => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                    <input type="radio" name={q.text} value={option} checked={answers[q.id] === option} onChange={() => onAnswerChange(q.id, option)} className="form-radio h-5 w-5 text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-500" required />
                    <span className="text-slate-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label htmlFor="description" className="block text-lg font-semibold mb-2 text-slate-300">Dodatni opis (opcionalno)</label>
            <textarea id="description" name="Dodatna zapažanja" value={description} onChange={(e) => onDescriptionChange(e.target.value)} rows={4} className="w-full p-3 bg-slate-700/50 rounded-lg border border-slate-600" placeholder="Npr. čuje se zujanje pri visokim okretajima..." />
          </div>

          <input type="hidden" name="_subject" value={`Novi Unos - Procjena Rizika HPP-a (${selectedTurbine?.name})`} />

          <div className="flex justify-between items-center pt-4">
             <button type="button" onClick={prevStep} className="px-6 py-2 font-bold rounded-lg bg-slate-600 hover:bg-slate-500 text-white">Nazad</button>
            <div className="text-center">
              <button type="submit" disabled={isSubmitDisabled} className={`px-8 py-3 text-lg font-bold rounded-lg transition-all duration-300 ${isSubmitDisabled ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transform hover:-translate-y-1'}`}>
                Pošalji na Analizu
              </button>
              {isSubmitDisabled && <p className="text-sm text-slate-500 mt-3">Molimo odgovorite na sva pitanja.</p>}
            </div>
          </div>
        </div>
      )}
    </form>
  );
};