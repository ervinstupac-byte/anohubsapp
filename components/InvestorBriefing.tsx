import React, { useState } from 'react';
import { componentData } from '../data/componentData';
import type { TurbineCategories, TurbineType } from '../types';

// --- TYPES & DATA ---
type RiskLevel = 'High' | 'Medium' | 'Low';

interface Risk {
  text: string;
  level: RiskLevel;
}

const briefingContent: Record<string, { conditions: string[]; risks: Risk[] }> = {
  // Kaplan
  kaplan_vertical: {
    conditions: ['Low heads (10-70m)', 'Large/variable flow (>300 m³/s)', 'Adjustable runner & guide vanes'],
    risks: [
      { text: 'Cavitation on blades at partial load', level: 'High' },
      { text: 'Draft tube vortex formation', level: 'Medium' },
      { text: 'Leakage at blade adjustment mechanism', level: 'Medium' },
    ],
  },
  kaplan_horizontal: {
    conditions: ['Low heads (10-70m)', 'Specific flow installations', 'Similar to vertical design'],
    risks: [
      { text: 'Increased bearing load (gravity/orientation)', level: 'Medium' },
      { text: 'Complex shaft sealing systems', level: 'High' },
      { text: 'Cavitation on blades', level: 'High' },
    ],
  },
  kaplan_bulb: {
    conditions: ['Very low heads (< 20m)', 'Run-of-river plants', 'Submerged unit'],
    risks: [
      { text: 'High risk of cavitation', level: 'High' },
      { text: 'Critical generator sealing (water ingress)', level: 'High' },
      { text: 'Difficult maintenance access', level: 'Medium' },
    ],
  },
  kaplan_s: {
    conditions: ['Retrofitting old mills', 'S-shaped draft tube', 'Smaller units'],
    risks: [
      { text: 'Hydraulic losses due to S-tube', level: 'Medium' },
      { text: 'Uneven runner loading', level: 'Medium' },
      { text: 'Cavitation and vibrations', level: 'High' },
    ],
  },
  // Francis
  francis_vertical: {
    conditions: ['Medium-High heads (40-600m)', 'Medium flow', 'Fixed runner blades'],
    risks: [
      { text: 'Severe cavitation at off-design (part load)', level: 'High' },
      { text: 'Runner erosion (Execution Gap in RCFA)', level: 'High' },
      { text: 'Fatigue cracks due to pulsations', level: 'High' },
    ],
  },
  francis_horizontal: {
    conditions: ['Lower-Medium heads (< 250m)', 'Smaller output', 'Spiral casing'],
    risks: [
      { text: 'Amplified vertical risks', level: 'High' },
      { text: 'Higher bearing loads', level: 'Medium' },
      { text: 'Shaft seal wear', level: 'Medium' },
    ],
  },
  // Pelton
  pelton_vertical: {
    conditions: ['Very high heads (> 300m)', 'Low flow', 'Multiple jets (3-6)'],
    risks: [
      { text: 'Bucket fatigue and cracking', level: 'High' },
      { text: 'Nozzle/Needle wear (Efficiency loss)', level: 'Medium' },
      { text: 'Jet interference vibrations', level: 'Medium' },
    ],
  },
  pelton_horizontal: {
    conditions: ['High heads (> 250m)', 'Lower power', '1-2 Jets'],
    risks: [
      { text: 'Bearing wear (imbalance)', level: 'Medium' },
      { text: 'Bucket fatigue', level: 'High' },
      { text: 'Housing erosion (spray)', level: 'Low' },
    ],
  },
  // Crossflow
  crossflow: {
    conditions: ['Low-Medium heads (2-200m)', 'Variable flow', 'Simple construction'],
    risks: [
      { text: 'Lower peak efficiency', level: 'Low' },
      { text: 'Bearing wear', level: 'Medium' },
      { text: 'Debris damage (stones/wood)', level: 'Medium' },
    ],
  },
};

const riskLevelStyles: Record<RiskLevel, string> = {
  High: 'bg-red-500/20 text-red-300 border-red-500/50',
  Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  Low: 'bg-green-500/20 text-green-300 border-green-500/50',
};

// --- HELPER COMPONENTS ---

const RiskBadge: React.FC<{ level: RiskLevel; text: string }> = ({ level, text }) => (
  <div className={`flex items-start p-3 rounded-lg border ${riskLevelStyles[level]} transition-all hover:bg-opacity-30`}>
    <span className={`w-2 h-2 mt-1.5 rounded-full mr-3 flex-shrink-0 ${level === 'High' ? 'bg-red-500 animate-pulse' : level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const AccordionItem: React.FC<{ title: string; description: string; risks: string[]; kpis: string[]; isOpen: boolean; onClick: () => void }> = ({ title, description, risks, kpis, isOpen, onClick }) => (
    <div className="border border-slate-700/50 rounded-xl bg-slate-800/40 overflow-hidden mb-3 transition-all duration-300 hover:border-slate-600">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-5 hover:bg-slate-800/60 transition-colors"
        >
            <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-cyan-400' : 'text-slate-200'}`}>{title}</h3>
            <div className={`w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-cyan-900 text-cyan-400' : 'text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </div>
        </button>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 pt-0 border-t border-slate-700/50">
                <p className="text-slate-300 mb-6 mt-4 leading-relaxed">{description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-3">Performance KPIs</h4>
                        <ul className="space-y-2">
                            {kpis.map((kpi, i) => (
                                <li key={i} className="text-sm text-slate-300 flex items-start">
                                    <span className="text-cyan-500 mr-2">Target:</span> {kpi}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Technical Risks</h4>
                        <ul className="space-y-2">
                            {risks.map((risk, i) => (
                                <li key={i} className="text-sm text-slate-300 flex items-start">
                                    <span className="text-red-500 mr-2">⚠️</span> {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

interface InvestorBriefingProps {
  turbineCategories: TurbineCategories;
}

export const InvestorBriefing: React.FC<InvestorBriefingProps> = ({ turbineCategories }) => {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('kaplan');
  const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(null);
  const [expandedComponentId, setExpandedComponentId] = useState<string | null>(null);

  // Auto-select first turbine when category changes
  const handleCategorySelect = (key: string) => {
    setSelectedCategoryKey(key);
    setSelectedTurbine(null); // Reset detail view
  };

  const currentCategory = turbineCategories[selectedCategoryKey];
  const activeTurbine = selectedTurbine || currentCategory?.types[0]; // Default to first if none selected
  const activeDetails = activeTurbine ? briefingContent[activeTurbine.id] : null;

  return (
    <div className="animate-fade-in space-y-8 pb-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Investor Briefing & <span className="text-cyan-400">KPI Review</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Technical review ensuring KPIs are based on realistic risk assessment and ethical LCC Optimization.
        </p>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-700 overflow-x-auto max-w-full no-scrollbar">
            {Object.keys(turbineCategories).map((key) => (
                <button
                    key={key}
                    onClick={() => handleCategorySelect(key)}
                    className={`
                        px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap
                        ${selectedCategoryKey === key 
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25 scale-105' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                    `}
                >
                    {turbineCategories[key].name}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: TURBINE SELECTOR & CONDITIONS */}
          <div className="lg:col-span-4 space-y-6">
              <div className="glass-panel p-6 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Configuration</h3>
                  <div className="grid grid-cols-1 gap-3">
                      {currentCategory?.types.map(turbine => (
                          <button
                            key={turbine.id}
                            onClick={() => setSelectedTurbine(turbine)}
                            className={`
                                text-left p-4 rounded-xl border transition-all duration-300 group
                                ${activeTurbine?.id === turbine.id 
                                    ? 'bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'}
                            `}
                          >
                              <div className="flex justify-between items-center mb-1">
                                  <span className={`font-bold ${activeTurbine?.id === turbine.id ? 'text-white' : 'text-slate-300'}`}>{turbine.name}</span>
                                  {activeTurbine?.id === turbine.id && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>}
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2">{turbine.description}</p>
                          </button>
                      ))}
                  </div>
              </div>

              {activeDetails && (
                  <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                          <span className="text-lg mr-2">⚙️</span> Operating Envelope
                      </h3>
                      <ul className="space-y-3">
                          {activeDetails.conditions.map((cond, i) => (
                              <li key={i} className="flex items-start text-sm text-slate-300">
                                  <span className="text-cyan-500 mr-2 mt-0.5">▹</span>
                                  {cond}
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>

          {/* RIGHT SIDE: RISK PROFILE & COMPONENTS */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* Risk Profile */}
              {activeDetails && (
                  <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500 animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-white">Risk Profile: {activeTurbine?.name}</h3>
                          <button className="text-xs text-cyan-400 hover:text-white transition-colors uppercase font-bold tracking-wider">
                              Export Report ↗
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {activeDetails.risks.map((risk, i) => (
                              <RiskBadge key={i} {...risk} />
                          ))}
                      </div>
                  </div>
              )}

              {/* Component Deep Dive */}
              <div>
                  <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-slate-700">Component Analysis & KPIs</h3>
                  <div className="space-y-2">
                      {componentData.map((component) => (
                          <AccordionItem 
                            key={component.id}
                            title={component.title}
                            description={component.description}
                            risks={component.risks.map(r => r.text)}
                            kpis={component.kpis}
                            isOpen={expandedComponentId === component.id}
                            onClick={() => setExpandedComponentId(expandedComponentId === component.id ? null : component.id)}
                          />
                      ))}
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default InvestorBriefing;