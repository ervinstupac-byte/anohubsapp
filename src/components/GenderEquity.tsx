import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
// UKLONJEN NEISKORIŠTENI IMPORT GlassCard

// --- DATA STRUCTURE ---
const sectionsData = [
  {
    id: 'imperativ',
    title: 'The Strategic Imperative',
    subtitle: 'Organizational Flaws Create Systemic Risk',
    content: (
      <div className="space-y-6">
        <p className="leading-relaxed text-slate-300 font-light text-lg">
            True engineering precision extends beyond mechanical tolerances to the precision of human capital management. 
            An organization that fails to attract, retain, and promote diverse talent suffers from a <strong className="text-white font-bold">deep, systemic failure</strong>.
        </p>
        <div className="p-6 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-xl">
            <p className="text-sm text-cyan-200 italic font-medium">
                "This is not just an HR initiative; it is a strategic imperative for eliminating a critical source of systemic risk and closing the Execution Gap."
            </p>
        </div>
      </div>
    )
  },
  {
    id: 'redefiniranje',
    title: "1. Redefining 'Excellence'",
    subtitle: 'Inclusive Growth as a Technical Standard',
    content: (
      <div className="space-y-4">
        <p className="mb-4 text-slate-400">The philosophy of the 'Standard of Excellence' provides a powerful framework. We must connect technical failure to organizational shortcomings.</p>
        <div className="grid gap-4">
            <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                <strong className="block text-cyan-400 mb-2 text-sm uppercase tracking-wider">The Inescapable Analogy</strong>
                <span className="text-slate-300 text-sm leading-relaxed">
                    If we tolerate 10% bias in our hiring, that is equivalent to building a turbine with a <strong className="text-white">10% tolerance gap</strong>. 
                    Both are conscious decisions that knowingly guarantee future system failure.
                </span>
            </div>
            <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                <strong className="block text-cyan-400 mb-2 text-sm uppercase tracking-wider">Holistic Precision Mandate</strong>
                <span className="text-slate-300 text-sm leading-relaxed">
                    Just as technical precision is required to <strong className="text-white">0.05 mm/m</strong>, organizational precision requires a 
                    <strong className="text-white"> zero-tolerance policy for bias</strong>.
                </span>
            </div>
            <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                <strong className="block text-cyan-400 mb-2 text-sm uppercase tracking-wider">The Human Capital Execution Gap</strong>
                <span className="text-slate-300 text-sm leading-relaxed">
                    The loss of a highly skilled female engineer due to a non-inclusive culture is an <strong>Execution Gap</strong>. 
                    Its financial cost is equivalent to a catastrophic component failure.
                </span>
            </div>
        </div>
      </div>
    )
  },
  {
    id: 'umrezavanje',
    title: '2. System Integration',
    subtitle: 'Building a Diverse Talent Network',
    content: (
        <div className="space-y-6">
            <p className="text-slate-300">Networking is insufficient. We must engage in <strong>System Integration</strong>, building a robust, diverse talent network capable of upholding the Standard of Excellence.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50">
                    <div className="text-3xl mb-3 p-3 bg-white/5 rounded-lg inline-block">🎯</div>
                    <h4 className="font-bold text-white text-sm mb-2 uppercase tracking-wide">Targeted Technical Outreach</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Focus on Chief Engineers and Technical Directors. The Standard must be championed by those who own the technical outcomes.</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50">
                    <div className="text-3xl mb-3 p-3 bg-white/5 rounded-lg inline-block">🌱</div>
                    <h4 className="font-bold text-white text-sm mb-2 uppercase tracking-wide">The Mentorship Mandate</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Mentoring the next generation of female engineers to master the non-negotiable principles of precision and discipline.</p>
                </div>
            </div>
        </div>
    )
  },
  {
    id: 'politike',
    title: '3. Policy & Audit',
    subtitle: 'The Systemic Bias Audit Protocol',
    content: (
       <div className="space-y-6">
        <p className="text-slate-300">Vague aspirations are insufficient. We require actionable, engineering-grade protocols.</p>
        <div className="relative p-8 bg-gradient-to-br from-cyan-900/20 to-slate-900 rounded-2xl border border-cyan-500/20 overflow-hidden group hover:border-cyan-500/40 transition-colors">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h4 className="font-bold text-cyan-300 mb-3 text-lg">NEW PROTOCOL: The "Systemic Bias Audit"</h4>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">
                We must treat HR data with the same analytical rigor as SCADA data. 
                Using data analytics to identify bottlenecks allows us to move from subjective discussion to <strong className="text-white font-bold">objective, diagnostic action</strong>.
            </p>
            
            <div className="h-px w-full bg-gradient-to-r from-cyan-500/50 to-transparent my-6"></div>
            
            <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Leveraging Legal Frameworks</h4>
             <p className="text-xs text-slate-400 leading-relaxed">
                Using Austrian/EU labor law to build legally-sound inclusion standards that are robust, enforceable, and resistant to the 'Execution Gap'.
            </p>
        </div>
       </div>
    )
  },
];

// --- MODERN ACCORDION COMPONENT ---
const AccordionSection: React.FC<{ 
    title: string; 
    subtitle: string;
    children: React.ReactNode; 
    isOpen: boolean; 
    onClick: () => void;
    delay: number;
}> = ({ title, subtitle, children, isOpen, onClick, delay }) => (
    <div 
        className={`
            group rounded-2xl mb-4 overflow-hidden transition-all duration-500 ease-out
            ${isOpen 
                ? 'bg-slate-800/80 border border-cyan-500/50 shadow-lg shadow-cyan-900/10' 
                : 'bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-800/60'}
            backdrop-blur-md animate-fade-in-up
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 md:p-8 transition-colors"
            aria-expanded={isOpen}
        >
            <div>
                <h3 className={`text-xl md:text-2xl font-bold transition-colors ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {title}
                </h3>
                <p className={`text-sm mt-1 transition-colors ${isOpen ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400/70'}`}>{subtitle}</p>
            </div>
            
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border
                ${isOpen ? 'bg-cyan-500 text-slate-900 rotate-180 border-cyan-400' : 'bg-transparent border-slate-700 text-slate-500 group-hover:border-slate-500'}
            `}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </button>
        
        <div 
            className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="p-8 pt-0 border-t border-white/10 mt-2">
                <div className="pt-6 animate-fade-in">
                    {children}
                </div>
            </div>
        </div>
    </div>
);


export const GenderEquity: React.FC = () => {
  const [openSectionId, setOpenSectionId] = useState<string | null>('imperativ');

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* HERO HEADER */}
      <div className="relative text-center space-y-4 pt-6">
        <div className="absolute top-0 left-0">
            <BackButton text="Back to Hub" />
        </div>
        
        <div className="pt-12">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">
                Engineering a Culture of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Inclusivity</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed">
                A strategic blueprint for gender equity in hydropower. Applying the same zero-tolerance principles as our technical mandates.
            </p>
        </div>
      </div>
      
      {/* ACCORDION CONTENT */}
      <div className="mt-12 space-y-6">
        {sectionsData.map((section, index) => (
           <AccordionSection
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            isOpen={openSectionId === section.id}
            onClick={() => handleToggleSection(section.id)}
            delay={index * 100}
          >
            {section.content}
          </AccordionSection>
        ))}
      </div>

    </div>
  );
};

export default GenderEquity;