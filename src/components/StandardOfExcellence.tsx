import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx'; 

// --- DATA STRUCTURE (SADA S TEKSTOM) ---
const modulesData = [
  { 
    id: 'm1', 
    sysId: 'MOD-01', 
    icon: '💧',
    title: 'Hydraulic Integrity',
    problem: 'Turbulence creates vibration. Vibration destroys bearings.',
    content: 'We mandate Computational Fluid Dynamics (CFD) verification for all intake structures to ensure laminar flow. Cavitation guarantees are not just paper promises; they are verified by 3D scanning of runner blades after 8000 hours. The "0.05 mm/m" alignment rule is absolute.'
  },
  { 
    id: 'm2', 
    sysId: 'MOD-02', 
    icon: '🎯',
    title: 'Precision Alignment',
    problem: 'Misalignment is the silent killer of rotating machinery.',
    content: 'Standard ISO tolerances are insufficient for 50-year longevity. We require laser alignment protocols with thermal growth compensation calculations verified by a third-party audit. Every bolt torque is digitally logged.'
  },
  { 
    id: 'm3', 
    sysId: 'MOD-03', 
    icon: '🧠',
    title: 'Digital Twin Integration',
    problem: 'Data without context is noise.',
    content: 'SCADA systems must do more than monitor; they must predict. We enforce the integration of vibration spectral analysis (FFT) directly into the control loop to detect anomalies weeks before failure.'
  },
  { 
    id: 'm4', 
    sysId: 'MOD-04', 
    icon: '🤝',
    title: 'Human Capital Discipline',
    problem: 'The best machine fails in the hands of an undisciplined operator.',
    content: 'Technical excellence requires cultural excellence. We mandate "Ownership Maintenance" where operators are trained not just to run the machine, but to understand its physics. Shifts are not just time-slots; they are custodianships.'
  },
  { 
    id: 'm5', 
    sysId: 'MOD-05', 
    icon: '📚',
    title: 'Material Traceability',
    problem: 'Unknown steel is a ticking time bomb.',
    content: 'We reject "equivalent" materials. Turbine runners must be forged 13Cr4Ni stainless steel. Supply chain transparency (EN 10204 3.1 certificates) is mandatory for every critical bolt, seal, and bearing.'
  },
  { 
    id: 'm6', 
    sysId: 'MOD-06', 
    icon: '🔗',
    title: 'Ethical Stewardship',
    problem: 'Profit at the expense of the river is a short-term illusion.',
    content: 'We enforce automated E-Flow compliance logging. Our "Zero-Harm" protocol mandates oil-free hubs and fish-friendly turbine designs wherever ecologically sensitive.'
  }
];

// --- MODULE CARD ---
const ModuleCard: React.FC<{
  meta: typeof modulesData[0];
  isOpen: boolean;
  onClick: () => void;
  delay: number;
}> = ({ meta, isOpen, onClick, delay }) => {
  return (
    <div 
        onClick={onClick}
        className={`
            group relative cursor-pointer rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
            ${isOpen 
                ? 'bg-slate-800/90 ring-1 ring-cyan-500 shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] scale-[1.02] z-10' 
                : 'bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 hover:border-white/10 hover:shadow-lg'}
            backdrop-blur-md overflow-hidden animate-fade-in-up
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Glow Effect on Open */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

        <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-5">
                    <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all duration-500
                        ${isOpen ? 'bg-cyan-500/20 text-cyan-300 rotate-3 scale-110' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'}
                    `}>
                        {meta.icon}
                    </div>
                    <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1 group-hover:text-cyan-400 transition-colors">
                            {meta.sysId}
                        </span>
                        <h3 className={`text-xl font-bold tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                            {meta.title}
                        </h3>
                    </div>
                </div>
                
                {/* Expand Icon */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 rotate-180' : 'border-slate-700 text-slate-500 group-hover:border-slate-500'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Problem Statement */}
            <p className={`text-sm italic font-medium border-l-2 pl-4 transition-all duration-500 ${isOpen ? 'text-cyan-100 border-cyan-500/50' : 'text-slate-500 border-slate-700 group-hover:text-slate-400'}`}>
                "{meta.problem}"
            </p>

            {/* Expanded Content */}
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                <div className="overflow-hidden">
                    <div className="pt-6 border-t border-white/10">
                        <p className="text-slate-300 text-sm leading-relaxed font-light">
                            {meta.content}
                        </p>
                        
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-500">
                            <span>Read full protocol</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const StandardOfExcellence: React.FC = () => {
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleToggleModule = (moduleId: string) => {
    setOpenModuleId(prevId => (prevId === moduleId ? null : moduleId));
  };
  
  return (
    <div className="animate-fade-in pb-12 space-y-12">
      
      {/* HERO HEADER */}
      <div className="relative pt-6 text-center">
          <div className="absolute top-0 left-0 px-4">
            <BackButton text={t('actions.back', 'Back to Hub')} />
          </div>
          
          <div className="max-w-4xl mx-auto mt-12">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">The Standard of</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Excellence</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                We do not accept "industry standard". We accept only physics-based precision. This document defines the non-negotiable protocols.
            </p>
          </div>
      </div>
      
      {/* MODULE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {modulesData.map((meta, index) => (
           <ModuleCard
            key={meta.id}
            meta={meta}
            isOpen={openModuleId === meta.id}
            onClick={() => handleToggleModule(meta.id)}
            delay={index * 100}
          />
        ))}
      </div>
      
      {/* CERTIFIED PARTNER MANDATE */}
      <div className="max-w-5xl mx-auto px-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="relative overflow-hidden rounded-3xl bg-[#0B0F19] border border-amber-500/30 p-1">
            <div className="relative rounded-[20px] border border-amber-500/20 p-8 md:p-12 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-amber-500/10 blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 p-[2px] mb-6 shadow-xl shadow-amber-900/40">
                        <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center">
                            <span className="text-4xl">🏅</span>
                        </div>
                    </div>

                    <h3 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4 tracking-wide">
                        The AnoHUB Certified Partner Mandate
                    </h3>
                    
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-6"></div>

                    <p className="text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto font-light italic">
                        "By engaging with the AnoHUB ecosystem, we pledge to uphold these standards not as guidelines, but as absolute requirements for the longevity of our assets and the safety of our river systems."
                    </p>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="h-px w-12 bg-slate-700"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/80">
                            Official Certification
                        </span>
                        <div className="h-px w-12 bg-slate-700"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default StandardOfExcellence;