import React, { useState } from 'react';
import { BackButton } from './BackButton';

const sectionsData = [
  {
    id: 'imperativ',
    title: 'The Strategic Imperative: Organizational Flaws Create Systemic Risk',
    content: (
      <p>True engineering precision extends beyond mechanical tolerances to the precision of human capital management. An organization that fails to attract, retain, and promote diverse talent suffers from a deep, systemic failure. This is not just an HR initiative; it is a strategic imperative for eliminating a critical source of systemic risk and closing the Execution Gap where it is most often ignored.</p>
    )
  },
  {
    id: 'redefiniranje',
    title: "1. Redefining 'Excellence' with Inclusive Growth",
    content: (
      <>
        <p className="mb-3">The philosophy of the 'Standard of Excellence' provides a powerful framework. We must connect technical failure to organizational shortcomings.</p>
        <ul className="list-disc list-inside pl-2 space-y-2">
            <li><strong>The Inescapable Analogy:</strong> If we tolerate 10% bias in our hiring or promotion process, that is equivalent to building a turbine with a 10% tolerance gap. Both are conscious decisions that knowingly guarantee future system failure and a wide Execution Gap.</li>
            <li><strong>Holistic Precision Mandate:</strong> Just as technical precision is required to **0.05 mm/m**, organizational precision requires a **zero-tolerance policy for bias**. One cannot exist without the other in a truly excellent system.</li>
            <li><strong>Defining the Human Capital Execution Gap:</strong> The loss of a highly skilled female engineer due to a non-inclusive culture *is* an **Execution Gap in Human Capital**. Its financial cost is equivalent to a catastrophic component failure, stemming from a failure to maintain the system's integrity and optimize LCC.</li>
        </ul>
      </>
    )
  },
  {
    id: 'umrezavanje',
    title: '2. System Integration: Building a Diverse Talent Network',
    content: (
       <>
        <p>Networking is insufficient. We must engage in **System Integration**, building a robust, diverse talent network capable of upholding the Standard of Excellence.</p>
         <ul className="list-disc list-inside pl-2 space-y-2 mt-3">
            <li><strong>Targeted Technical Outreach:</strong> Our focus is on **Chief Engineers and Technical Directors**. The Standard of Excellence is a technical philosophy; it must be adopted and championed by those who own the technical outcomes, not just by HR.</li>
            <li><strong>The Mentorship Mandate (Creating 'Heirs to the Standard'):</strong> The goal of mentorship is explicit: to mentor the next generation of female engineers to master and perpetuate the non-negotiable principles of precision and discipline that define our work.</li>
        </ul>
       </>
    )
  },
  {
    id: 'politike',
    title: '3. Policy, Advocacy, and the Systemic Bias Audit',
    content: (
       <>
        <p>Vague aspirations are insufficient. We require actionable, engineering-grade protocols to close the systemic gaps that hinder true inclusivity.</p>
        <ul className="list-disc list-inside pl-2 space-y-2 mt-3">
            <li><strong>NEW PROTOCOL: The "Systemic Bias Audit":</strong> We must treat HR and talent data with the same analytical rigor as SCADA data from a turbine. Using data analytics to identify bottlenecks in the promotion and retention funnel allows us to move from subjective discussion to objective, diagnostic action.</li>
            <li><strong>Leveraging Legal Frameworks:</strong> An in-depth understanding of Austrian/EU labor law is a strategic asset. It is used to build legally-sound inclusion standards that are robust, enforceable, and resistant to the 'Execution Gap'.</li>
        </ul>
       </>
    )
  },
];

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onClick: () => void }> = ({ title, children, isOpen, onClick }) => (
    <div className="border border-slate-700 rounded-lg bg-slate-800/50 mb-4 overflow-hidden">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 hover:bg-slate-700/50 transition-colors"
            aria-expanded={isOpen}
        >
            <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        {isOpen && (
            <div className="p-6 pt-0 text-slate-300 space-y-2 animate-fade-in">
                {children}
            </div>
        )}
    </div>
);


const GenderEquity: React.FC = () => {
  const [openSectionId, setOpenSectionId] = useState<string | null>(sectionsData[0]?.id ?? null);

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };

  return (
    <div className="animate-fade-in">
      <BackButton text="Back to HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Engineering a Culture of Inclusivity</h2>
        <p className="text-slate-400 mb-8">A strategic blueprint for gender equity in hydropower.</p>
      </div>
      
      <div>
        {sectionsData.map(section => (
           <AccordionSection
            key={section.id}
            title={section.title}
            isOpen={openSectionId === section.id}
            onClick={() => handleToggleSection(section.id)}
          >
            {section.content}
          </AccordionSection>
        ))}
      </div>

    </div>
  );
};

export default GenderEquity;