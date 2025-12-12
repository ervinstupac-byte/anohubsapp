import React, { useState } from 'react';

// --- DATA STRUCTURE ---
const sectionsData = [
  {
    id: 'imperativ',
    title: 'The Strategic Imperative',
    subtitle: 'Organizational Flaws Create Systemic Risk',
    content: (
      <div className="space-y-4">
        <p className="leading-relaxed">
            True engineering precision extends beyond mechanical tolerances to the precision of human capital management. 
            An organization that fails to attract, retain, and promote diverse talent suffers from a <strong className="text-white">deep, systemic failure</strong>.
        </p>
        <div className="p-4 bg-cyan-900/20 border-l-2 border-cyan-500 rounded-r-lg">
            <p className="text-sm text-cyan-100 italic">
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
        <p className="mb-2">The philosophy of the 'Standard of Excellence' provides a powerful framework. We must connect technical failure to organizational shortcomings.</p>
        <ul className="space-y-4">
            <li className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                <strong className="block text-cyan-400 mb-1">The Inescapable Analogy</strong>
                <span className="text-slate-300 text-sm">
                    If we tolerate 10% bias in our hiring, that is equivalent to building a turbine with a <strong className="text-white">10% tolerance gap</strong>. 
                    Both are conscious decisions that knowingly guarantee future system failure.
                </span>
            </li>
            <li className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                <strong className="block text-cyan-400 mb-1">Holistic Precision Mandate</strong>
                <span className="text-slate-300 text-sm">
                    Just as technical precision is required to <strong className="text-white">0.05 mm/m</strong>, organizational precision requires a 
                    <strong className="text-white"> zero-tolerance policy for bias</strong>.
                </span>
            </li>
            <li className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                <strong className="block text-cyan-400 mb-1">The Human Capital Execution Gap</strong>
                <span className="text-slate-300 text-sm">
                    The loss of a highly skilled female engineer due to a non-inclusive culture is an <strong>Execution Gap</strong>. 
                    Its financial cost is equivalent to a catastrophic component failure.
                </span>
            </li>
        </ul>
      </div>
    )
  },
  {
    id: 'umrezavanje',
    title: '2. System Integration',
    subtitle: 'Building a Diverse Talent Network',
    content: (
        <div className="space-y-4">
            <p>Networking is insufficient. We must engage in <strong>System Integration</strong>, building a robust, diverse talent network capable of upholding the Standard of Excellence.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/50">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-bold text-white text-sm mb-2">Targeted Technical Outreach</h4>
                    <p className="text-xs text-slate-400">Focus on Chief Engineers and Technical Directors. The Standard must be championed by those who own the technical outcomes.</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/50">
                    <div className="text-2xl mb-2">🌱</div>
                    <h4 className="font-bold text-white text-sm mb-2">The Mentorship Mandate</h4>
                    <p className="text-xs text-slate-400">Mentoring the next generation of female engineers to master the non-negotiable principles of precision and discipline.</p>
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
       <div className="space-y-4">
        <p>Vague aspirations are insufficient. We require actionable, engineering-grade protocols.</p>
        <div className="relative p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-cyan-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-cyan-500 text-6xl">📊</div>
            <h4 className="font-bold text-cyan-300 mb-2">NEW PROTOCOL: The "Systemic Bias Audit"</h4>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                We must treat HR data with the same analytical rigor as SCADA data. 
                Using data analytics to identify bottlenecks allows us to move from subjective discussion to <strong className="text-white">objective, diagnostic action</strong>.
            </p>
            <div className="h-px w-full bg-slate-700 my-3"></div>
            <h4 className="font-bold text-cyan-300 mb-2">Leveraging Legal Frameworks</h4>
             <p className="text-sm text-slate-300 leading-relaxed">
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
            glass-panel rounded-2xl mb-4 overflow-hidden transition-all duration-500
            ${isOpen ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-slate-700/50 hover:border-slate-600'}
            animate-fade-in-up
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 transition-colors group"
            aria-expanded={isOpen}
        >
            <div>
                <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-cyan-400' : 'text-white group-hover:text-cyan-200'}`}>
                    {title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
            </div>
            
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${isOpen ? 'bg-cyan-500 text-slate-900 rotate-180' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}
            `}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </button>
        
        <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="p-6 pt-0 border-t border-slate-700/50 mt-2">
                <div className="pt-4 text-slate-300 animate-fade-in">
                    {children}
                </div>
            </div>
        </div>
    </div>
);


const GenderEquity: React.FC = () => {
  const [openSectionId, setOpenSectionId] = useState<string | null>('imperativ');

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };

  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Engineering a Culture of <span className="text-cyan-400">Inclusivity</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            A strategic blueprint for gender equity in hydropower. Applying the same zero-tolerance principles as our technical mandates.
        </p>
      </div>
      
      {/* ACCORDION CONTENT */}
      <div className="mt-8">
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