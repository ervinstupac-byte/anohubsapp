import React, { useState } from 'react';
import { BackButton } from './BackButton';

const modulesData = [
  {
    id: 'm1',
    icon: '💧',
    title: 'I. Hydrodynamic Immunity',
    problem: 'How to apply design-phase RCFA to eliminate Cavitation and Erosion?',
    content: 'The mandatory use of 13Cr4Ni steel and advanced blade design to create inherent plant immunity to chronic hydrodynamic failures. This is a foundational step in LCC Optimization, eliminating a root cause of failure before it occurs.'
  },
  {
    id: 'm2',
    icon: '🎯',
    title: 'II. Flawless Execution',
    problem: 'How to enforce the 0.05 mm/m precision and eliminate the Execution Gap?',
    content: 'A system of digital verification (3D scanning), laser alignment mandates (0.05 mm/m), and documented torque protocols that bridge the Execution Gap between plan and reality, securing the full warranty term.'
  },
  {
    id: 'm3',
    icon: '🧠',
    title: 'III. Active Operational Resilience',
    problem: 'How to shift from reactive repair to predictive analytics (RCFA) for true LCC Optimization?',
    content: 'Using AI-driven acoustic monitoring and baseline "fingerprints" to apply Root Cause Failure Analysis (RCFA), detecting instability at 60% of ISO limits before damage occurs. This is the core of our ethical LCC Optimization mandate.'
  },
  {
    id: 'm4',
    icon: '🤝',
    title: 'IV. Strategic & Cultural Mandate',
    problem: 'How is the cultural Execution Gap closed through a zero-tolerance policy?',
    content: 'Integrating technical precision with a culture of excellence, where Gender Equity and diverse teams are recognized as critical assets for closing the Execution Gap in human capital and fostering innovation.'
  },
  {
    id: 'm5',
    icon: '📚',
    title: 'V. Knowledge Retention',
    problem: 'How to prevent the loss of institutional knowledge (the silent Execution Gap)?',
    content: 'A mandate for a "Living Standard"—a digital knowledge base where all Root Cause Analyses and field data are documented, ensuring continuous, closed-loop learning to prevent recurring failures and optimize LCC.'
  },
  {
    id: 'm6',
    icon: '🔗',
    title: 'VI. Excellence in the Supply Chain',
    problem: 'How to close the supply chain Execution Gap and guarantee material integrity?',
    content: 'A Certified Partner Program and a non-negotiable Material Traceability Mandate (EN 10204 3.1) to eliminate a critical source of systemic risk and ensure long-term LCC performance.'
  }
];

const ModuleCard: React.FC<{
  module: typeof modulesData[0];
  isOpen: boolean;
  onClick: () => void;
}> = ({ module, isOpen, onClick }) => {
  return (
    <div className={`bg-slate-800/60 border rounded-2xl transition-all duration-300 ${isOpen ? 'border-cyan-400 shadow-2xl shadow-cyan-500/20' : 'border-slate-700'}`}>
        <div className="p-6">
            <div className="flex items-start gap-4">
                <div className="text-4xl">{module.icon}</div>
                <div>
                    <h3 className="text-xl font-bold text-slate-100">{module.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 italic">{module.problem}</p>
                </div>
            </div>
        </div>
        {isOpen && (
            <div className="p-6 pt-0 animate-fade-in">
                <div className="border-t border-slate-700 pt-4">
                    <p className="text-slate-300">{module.content}</p>
                </div>
            </div>
        )}
         <div className="px-6 pb-4">
            <button
                onClick={onClick}
                className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-slate-700/70 text-cyan-400 hover:bg-slate-700 transition-colors"
            >
                {isOpen ? 'CLOSE MODULE' : 'DEEPER DIVE'}
            </button>
        </div>
    </div>
  );
};


const StandardOfExcellence: React.FC = () => {
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  const handleToggleModule = (moduleId: string) => {
    setOpenModuleId(prevId => (prevId === moduleId ? null : moduleId));
  };
  
  return (
    <div className="animate-fade-in">
      <BackButton text="Back to HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">THE STANDARD OF EXCELLENCE: Masterclass Modules</h2>
        <p className="text-slate-400 mb-8 max-w-3xl mx-auto">This Hub contains deep-dive modules that transition the user from 'protocol adherence' to 'systemic mastery', taught through the lens of Hydro-Prijatelj's RCFA and Discipline Philosophy.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulesData.map(module => (
           <ModuleCard
            key={module.id}
            module={module}
            isOpen={openModuleId === module.id}
            onClick={() => handleToggleModule(module.id)}
          />
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-slate-900/50 border-2 border-yellow-400/50 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-yellow-300 mb-3">GUARANTEEING THE METAL: The Certified Partner Mandate</h3>
          <div className="flex justify-center items-center gap-8 text-5xl text-slate-400 my-4">
            <span>🏅</span>
            <span>📜</span>
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto">
            The **Material Traceability Mandate** (EN 10204 3.1) is non-negotiable. It represents the ultimate ethical defense against financial risk and premature failure caused by counterfeit or substandard materials.
          </p>
      </div>

    </div>
  );
};

export default StandardOfExcellence;