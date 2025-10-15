import React, { useState } from 'react';
import { componentData } from '../data/componentData';
import type { TurbineCategories, TurbineType } from '../types';

type RiskLevel = 'High' | 'Medium' | 'Low';

interface Risk {
  text: string;
  level: RiskLevel;
}

const briefingContent: Record<string, { conditions: string[]; risks: Risk[] }> = {
  // Kaplan
  kaplan_vertical: {
    conditions: ['Niski padovi (10-70m)', 'Veliki i promjenjivi protoci (do >300 m³/s)', 'Podesive lopatice rotora i privodnog kola'],
    risks: [
      { text: 'Kavitacija na lopaticama pri djelomičnom opterećenju', level: 'High' },
      { text: 'Stvaranje vrtloga u usisnoj cijevi (draft tube vortex)', level: 'Medium' },
      { text: 'Rizik od curenja na mehanizmu za zakretanje lopatica', level: 'Medium' },
    ],
  },
  kaplan_horizontal: {
    conditions: ['Niski padovi (10-70m)', 'Veliki protoci, često za specifične instalacije', 'Slično vertikalnoj izvedbi'],
    risks: [
      { text: 'Veće opterećenje na ležajeve zbog horizontalne orijentacije', level: 'Medium' },
      { text: 'Složeni sustavi brtvljenja osovine', level: 'High' },
      { text: 'Kavitacija na lopaticama', level: 'High' },
    ],
  },
  kaplan_bulb: {
    conditions: ['Vrlo niski padovi (< 20m)', 'Vrlo veliki protoci (riječne elektrane)', 'Agregat je potopljen u vodotoku'],
    risks: [
      { text: 'Visok rizik od kavitacije', level: 'High' },
      { text: 'Složeno i kritično brtvljenje (zaštita generatora od vode)', level: 'High' },
      { text: 'Otežan pristup za održavanje', level: 'Medium' },
    ],
  },
  kaplan_s: {
    conditions: ['Niski padovi, često za adaptacije starih mlinova', 'S-oblikovana usisna cijev', 'Manje jedinice'],
    risks: [
      { text: 'Povećani hidraulički gubici zbog S-cijevi', level: 'Medium' },
      { text: 'Neujednačeno opterećenje na rotoru', level: 'Medium' },
      { text: 'Kavitacija i vibracije', level: 'High' },
    ],
  },
  // Francis
  francis_vertical: {
    conditions: ['Srednji do visoki padovi (40-600m)', 'Srednji protoci', 'Fiksne lopatice rotora'],
    risks: [
      { text: 'Teška kavitacija pri radu izvan optimalne točke (part load)', level: 'High' },
      { text: 'Erozija rotora sedimentima (abrazivno trošenje)', level: 'Medium' },
      { text: 'Pukotine zamora materijala na rotoru zbog hidrauličkih pulsacija', level: 'High' },
    ],
  },
  francis_horizontal: {
    conditions: ['Niži i srednji padovi (do 250m)', 'Manje snage, često sa spiralnim kućištem', 'Jednostavnija instalacija za manje jedinice'],
    risks: [
      { text: 'Slični rizici kao kod vertikalne, ali pojačani', level: 'High' },
      { text: 'Potencijalno veće opterećenje ležajeva', level: 'Medium' },
      { text: 'Trošenje brtvi osovine', level: 'Medium' },
    ],
  },
  // Pelton
  pelton_vertical: {
    conditions: ['Visoki do vrlo visoki padovi (> 300m)', 'Mali protoci', 'Više mlaznica (3-6)'],
    risks: [
      { text: 'Zamor materijala i pucanje lopatica (buckets)', level: 'High' },
      { text: 'Trošenje mlaznica i igle (smanjuje efikasnost)', level: 'Medium' },
      { text: 'Vibracije uzrokovane interferencijom mlazova', level: 'Medium' },
    ],
  },
  pelton_horizontal: {
    conditions: ['Visoki padovi (> 250m)', 'Manji protoci i snage', 'Jedna ili dvije mlaznice'],
    risks: [
      { text: 'Trošenje ležajeva zbog neuravnoteženosti', level: 'Medium' },
      { text: 'Zamor materijala lopatica', level: 'High' },
      { text: 'Erozija kućišta od prskanja vode pod visokim tlakom', level: 'Low' },
    ],
  },
  // Crossflow
  crossflow: {
    conditions: ['Niski do srednji padovi (2-200m)', 'Širok raspon promjenjivih protoka', 'Jednostavna konstrukcija'],
    risks: [
      { text: 'Niža vršna efikasnost u usporedbi s drugim tipovima', level: 'Low' },
      { text: 'Trošenje ležajeva', level: 'Medium' },
      { text: 'Oštećenje lopatica od većih krhotina u vodi (kamenje, drvo)', level: 'Medium' },
    ],
  },
};

const riskLevelStyles: Record<RiskLevel, string> = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

interface InvestorBriefingProps {
  turbineCategories: TurbineCategories; 
}

export const InvestorBriefing: React.FC<InvestorBriefingProps> = ({ turbineCategories }) => {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCategorySelect = (key: string) => {
    setSelectedCategoryKey(key);
    setSelectedTurbine(null);
  };
  
  const handleResetSelection = () => {
    setSelectedCategoryKey(null);
    setSelectedTurbine(null);
    setRiskFilter(null);
  }

  // Selection UI
  if (!selectedTurbine) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">Korak 1: Odaberite Kategoriju Turbine</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {Object.keys(turbineCategories).map((key) => {
              const category = turbineCategories[key];
              if (!category) return null;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategorySelect(key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategoryKey === key ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center animate-fade-in border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-300 mb-3">Opcionalno: Filtrirajte po Dominantnom Riziku</h3>
            <div className="flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    onClick={() => setRiskFilter(null)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${!riskFilter ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                    Svi Rizici
                </button>
                {(['High', 'Medium', 'Low'] as RiskLevel[]).map(level => (
                     <button
                        key={level}
                        type="button"
                        onClick={() => setRiskFilter(level)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${riskFilter === level ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                    >
                        <span className={`w-3 h-3 rounded-full ${riskLevelStyles[level]}`}></span>
                        {level === 'High' ? 'Visok' : level === 'Medium' ? 'Srednji' : 'Nizak'}
                    </button>
                ))}
            </div>
        </div>


        {selectedCategoryKey && (() => {
          const category = turbineCategories[selectedCategoryKey];
          if (!category) return null;

          const filteredTypes = category.types.filter(turbine => {
              if (!riskFilter) return true;
              const details = briefingContent[turbine.id];
              if (!details) return false;
              return details.risks.some(risk => risk.level === riskFilter);
          });

          return (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">Korak 2: Odaberite Specifičan Tip</h2>
              {filteredTypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {filteredTypes.map(turbine => (
                    <div 
                        key={turbine.id} 
                        onClick={() => setSelectedTurbine(turbine)}
                        className="p-4 border-2 rounded-lg cursor-pointer transition-all border-slate-600 hover:border-cyan-500 hover:bg-cyan-900/50 bg-slate-700/50"
                    >
                      <h3 className="text-lg font-bold text-slate-100">{turbine.name}</h3>
                      <p className="text-sm text-slate-400">{turbine.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="text-center text-slate-400 p-8 bg-slate-700/50 rounded-lg">
                    Nema turbina koje odgovaraju odabranom filteru rizika.
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  const turbineDetails = briefingContent[selectedTurbine.id];

  // Briefing View
  return (
    <div className="animate-fade-in space-y-8">
      {/* Part 1: Selected Turbine Details */}
      <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-700 relative">
         <button 
           onClick={handleResetSelection} 
           className="absolute top-4 right-4 text-xs flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition-colors"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0114.12-5.12M20 15a9 9 0 01-14.12 5.12" /></svg>
            <span>Promijeni Turbinu</span>
         </button>
         <h2 className="text-2xl font-bold text-cyan-400 mb-2">{selectedTurbine.name}</h2>
         <p className="text-slate-400 mb-4">{selectedTurbine.description}</p>
         
         {turbineDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t border-slate-700 pt-4">
                <div>
                    <h4 className="text-lg font-semibold text-slate-200 mb-2">Tipični Uvjeti Rada</h4>
                     <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {turbineDetails.conditions.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Ključni Povezani Rizici</h4>
                    <ul className="list-none space-y-2 text-slate-300">
                        {turbineDetails.risks.map((risk, index) => (
                           <li key={index} className="flex items-start">
                             <span className={`mr-3 mt-1.5 w-2 h-2 rounded-full ${riskLevelStyles[risk.level]} flex-shrink-0`}></span>
                             <span>{risk.text}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            </div>
         )}
      </div>

      {/* Part 2: General Component Browser */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6 text-slate-200">Analiza Ključnih Komponenti Postrojenja</h3>
         {componentData.map((component) => (
            <div key={component.id} className="bg-slate-700/50 rounded-lg border border-slate-700 overflow-hidden mb-4">
            <button
                onClick={() => toggleExpand(component.id)}
                className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-700 transition-colors"
                aria-expanded={expandedId === component.id}
                aria-controls={`content-${component.id}`}
            >
                <h3 className="text-xl font-bold text-slate-100">{component.title}</h3>
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${
                    expandedId === component.id ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24"
                stroke="currentColor"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {expandedId === component.id && (
                <div id={`content-${component.id}`} className="p-4 border-t border-slate-600 bg-slate-800/50 animate-fade-in">
                <p className="text-slate-300 mb-4">{component.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">Ključni Pokazatelji (KPIs)</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {component.kpis.map((kpi, index) => (
                        <li key={index}>{kpi}</li>
                        ))}
                    </ul>
                    </div>
                    <div>
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Potencijalni Rizici</h4>
                    <ul className="list-none space-y-2 text-slate-300">
                        {component.risks.map((risk, index) => (
                           <li key={index} className="flex items-start">
                             <span className={`mr-3 mt-1.5 w-2 h-2 rounded-full ${riskLevelStyles[risk.level]} flex-shrink-0`}></span>
                             <span>{risk.text}</span>
                           </li>
                        ))}
                    </ul>
                    </div>
                </div>
                </div>
            )}
            </div>
      ))}
      </div>
    </div>
  );
};