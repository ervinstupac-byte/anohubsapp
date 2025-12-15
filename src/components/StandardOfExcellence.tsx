import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx'; // <--- DODANO

// --- DATA ---
const modulesData = [
  {
    id: 'm1',
    sysId: 'MOD-01',
    icon: '💧',
    title: 'Hydrodynamic Immunity',
    problem: 'Eliminating Cavitation & Erosion by Design',
    content: 'The mandatory use of 13Cr4Ni steel and advanced blade design to create inherent plant immunity to chronic hydrodynamic failures. This is a foundational step in LCC Optimization, eliminating a root cause of failure before it occurs.'
  },
  {
    id: 'm2',
    sysId: 'MOD-02',
    icon: '🎯',
    title: 'Flawless Execution',
    problem: 'Enforcing the 0.05 mm/m Precision Mandate',
    content: 'A system of digital verification (3D scanning), laser alignment mandates (0.05 mm/m), and documented torque protocols that bridge the Execution Gap between plan and reality, securing the full warranty term.'
  },
  {
    id: 'm3',
    sysId: 'MOD-03',
    icon: '🧠',
    title: 'Operational Resilience',
    problem: 'Predictive Analytics vs. Reactive Repair',
    content: 'Using AI-driven acoustic monitoring and baseline "fingerprints" to apply Root Cause Failure Analysis (RCFA), detecting instability at 60% of ISO limits before damage occurs. This is the core of our ethical LCC Optimization mandate.'
  },
  {
    id: 'm4',
    sysId: 'MOD-04',
    icon: '🤝',
    title: 'Cultural Mandate',
    problem: 'Closing the Human Capital Execution Gap',
    content: 'Integrating technical precision with a culture of excellence, where Gender Equity and diverse teams are recognized as critical assets for closing the Execution Gap in human capital and fostering innovation.'
  },
  {
    id: 'm5',
    sysId: 'MOD-05',
    icon: '📚',
    title: 'Knowledge Retention',
    problem: 'The "Living Standard" Database',
    content: 'A mandate for a digital knowledge base where all Root Cause Analyses and field data are documented, ensuring continuous, closed-loop learning to prevent recurring failures and optimize LCC.'
  },
  {
    id: 'm6',
    sysId: 'MOD-06',
    icon: '🔗',
    title: 'Supply Chain Excellence',
    problem: 'Material Integrity & Traceability',
    content: 'A Certified Partner Program and a non-negotiable Material Traceability Mandate (EN 10204 3.1) to eliminate a critical source of systemic risk and ensure long-term LCC performance.'
  }
];

// --- COMPONENT: MODULE CARD ---
const ModuleCard: React.FC<{
  module: typeof modulesData[0];
  isOpen: boolean;
  onClick: () => void;
  delay: number;
}> = ({ module, isOpen, onClick, delay }) => {
  return (
    <div 
        onClick={onClick}
        className={`
            relative group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-500 ease-out
            ${isOpen 
                ? 'bg-slate-800/80 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.15)] scale-[1.02]' 
                : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-500'}
            animate-fade-in-up
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px'}}>
        </div>

        <div className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className={`text-3xl p-3 rounded-xl transition-colors ${isOpen ? 'bg-cyan-900/30' : 'bg-slate-800'}`}>
                        {module.icon}
                    </div>
                    <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{module.sysId}</span>
                        <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-white' : 'text-slate-200'}`}>{module.title}</h3>
                    </div>
                </div>
                {isOpen && <div className="text-cyan-500 animate-pulse text-xs font-bold uppercase tracking-wider border border-cyan-500/30 px-2 py-1 rounded">Active</div>}
            </div>

            <p className={`text-sm italic mb-4 transition-colors ${isOpen ? 'text-cyan-200' : 'text-slate-400'}`}>
                "{module.problem}"
            </p>

            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {module.content}
                    </p>
                </div>
            </div>
        </div>

        {/* Hover Accent Line */}
        <div className={`absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-500 ${isOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
    </div>
  );
};

const StandardOfExcellence: React.FC = () => {
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  const handleToggleModule = (moduleId: string) => {
    setOpenModuleId(prevId => (prevId === moduleId ? null : moduleId));
  };
  
  return (
    <div className="animate-fade-in space-y-12 pb-12 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <BackButton text="Back to Hub" />
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4">
            The Standard of <span className="text-cyan-400">Excellence</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Masterclass modules for transitioning from simple protocol adherence to systemic mastery.
        </p>
      </div>
      
      {/* MODULE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulesData.map((module, index) => (
           <ModuleCard
            key={module.id}
            module={module}
            isOpen={openModuleId === module.id}
            onClick={() => handleToggleModule(module.id)}
            delay={index * 100}
          />
        ))}
      </div>
      
      {/* CERTIFIED PARTNER MANDATE (GOLD SECTION) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-900/40 to-slate-900 border border-yellow-500/30 p-8 text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
              <div className="flex justify-center items-center gap-6 text-5xl mb-6 opacity-90">
                <span>🏅</span>
                <div className="h-12 w-px bg-yellow-500/30"></div>
                <span>📜</span>
              </div>
              
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 tracking-wide">
                  The Certified Partner Mandate
              </h3>
              
              <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
                The <strong className="text-white">Material Traceability Mandate (EN 10204 3.1)</strong> is non-negotiable. 
                It represents the ultimate ethical defense against financial risk and premature failure caused by counterfeit or substandard materials.
              </p>

              <div className="mt-6 inline-block px-4 py-1 rounded border border-yellow-500/30 text-yellow-200 text-xs font-mono uppercase tracking-widest">
                  Official Requirement • ISO 9001 Compliant
              </div>
          </div>
      </div>

    </div>
  );
};

export default StandardOfExcellence;