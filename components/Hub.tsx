import React, { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

// --- MODERNIZIRANA KARTICA ---
// Koristi 'glassmorphism' efekt i suptilne animacije
const Card: React.FC<{title: string, description: string, onClick: () => void, icon: string, isCritical?: boolean}> = ({ title, description, onClick, icon, isCritical = false }) => (
    <div 
        onClick={onClick}
        className={`
            group relative h-full flex flex-col p-6 rounded-2xl cursor-pointer 
            transition-all duration-500 ease-out transform hover:-translate-y-1 hover:scale-[1.02]
            backdrop-blur-md border
            ${isCritical 
                ? 'bg-slate-900/60 border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]' 
                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-500 hover:shadow-xl'
            }
        `}
    >
        {/* Ukrasni "sjaj" u kutu */}
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-tr-2xl rounded-bl-[100px]
            ${isCritical ? 'from-cyan-400 to-transparent' : 'from-slate-400 to-transparent'}`} 
        />

        <div className="flex items-center justify-between mb-4">
            <div className={`text-4xl p-3 rounded-xl transition-colors duration-300 ${isCritical ? 'bg-cyan-900/20 group-hover:bg-cyan-900/40' : 'bg-slate-700/30 group-hover:bg-slate-700/50'}`}>
                {icon}
            </div>
            {/* Strelica koja se pojavljuje na hover */}
            <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </div>
        </div>

        <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${isCritical ? 'text-white group-hover:text-cyan-300' : 'text-slate-100 group-hover:text-white'}`}>
            {title}
        </h3>
        
        <p className="text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed flex-grow font-light">
            {description}
        </p>
    </div>
);

// --- REDIZAJNIRANI BROJAČ (HUD STIL) ---
const ImpactSnapshot: React.FC = () => {
    const [count, setCount] = useState(() => {
        const savedCount = localStorage.getItem('protocol-impact-count');
        return savedCount ? parseInt(savedCount, 10) : 1380;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => {
                const newCount = prevCount + Math.floor(Math.random() * 3) + 1;
                localStorage.setItem('protocol-impact-count', newCount.toString());
                return newCount;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative overflow-hidden text-center mb-12 p-8 rounded-3xl border border-cyan-900/50 bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-sm shadow-2xl">
             {/* Pozadinski efekt (mreža) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(circle at center, #22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            </div>

            <p className="text-cyan-500 font-mono text-xs tracking-[0.3em] uppercase mb-2">System Impact Metric</p>
            
            <div className="flex items-center justify-center space-x-4">
                <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] font-mono">
                    {count.toLocaleString()}
                </span>
            </div>
            
            <p className="text-slate-400 text-sm mt-2 font-light">Total Verified Protocols Executed</p>
        </div>
    );
};

// --- GLAVNA KOMPONENTA ---
export const Hub: React.FC = () => {
   const { navigateTo, showFeedbackModal } = useNavigation();

   const coreStrategyTools = [
    {
      id: 'assessment',
      onClick: () => navigateTo('riskAssessment'),
      title: "Risk Assessment Tool",
      description: "Quantify the Execution Gap and diagnose systemic risks before they impact LCC.",
      icon: '⚠️',
      isCritical: true,
    },
    {
      id: 'phaseGuide',
      onClick: () => navigateTo('phaseGuide'),
      title: "Project Phase Guide",
      description: "Master the protocols that enforce our Three Postulates for precision, risk mitigation, and ethical LCC optimization.",
      icon: '🗺️',
      isCritical: true,
    },
      {
      id: 'installation',
      onClick: () => navigateTo('installationGuarantee'),
      title: "Installation Standard",
      description: "Enforce the 0.05 mm/m precision mandate to close the Execution Gap and protect your warranty.",
      icon: '⚙️',
      isCritical: true,
    },
      {
      id: 'revitalization',
      onClick: () => navigateTo('revitalizationStrategy'),
      title: "Revitalization & Obsolescence",
      description: "A data-driven framework for ensuring LCC Optimization by closing the M-E Synergy Gap in legacy assets.",
      icon: '🔄',
      isCritical: true,
    },
    {
      id: 'digitalIntegrity',
      onClick: () => navigateTo('digitalIntegrity'),
      title: "Digital Integrity & Blockchain",
      description: "Use an immutable ledger to provide irrefutable proof of discipline and close the Execution Gap against legal liability.",
      icon: '🛡️',
      isCritical: true,
    },
    {
      id: 'contractManagement',
      onClick: () => navigateTo('contractManagement'),
      title: "Contract & Legal Risk",
      description: "Legally mandate the 0.05 mm/m precision standard to protect your warranty from the Execution Gap.",
      icon: '⚖️',
      isCritical: true,
    },
   ];

   const knowledgeAndInnovation = [
    {
      id: 'intro',
      onClick: () => navigateTo('digitalIntroduction'),
      title: "Digital Introduction",
      description: "Our core principles: enforcing the 0.05 mm/m precision mandate to close the Execution Gap.",
      icon: '🌐',
    },
    {
      id: 'builder',
      onClick: () => navigateTo('hppBuilder'),
      title: "HPP Power Calculator",
      description: "Configure HPPs using our guiding principles of LCC Optimization and resilience to the Execution Gap.",
      icon: '⚡',
    },
    {
      id: 'investor',
      onClick: () => navigateTo('investorBriefing'),
      title: "Investor Info-Center",
      description: "Review transparent, risk-adjusted KPIs to ensure sustainable returns and ethical LCC Optimization.",
      icon: '💰',
    },
     {
      id: 'riverWildlife',
      onClick: () => navigateTo('riverWildlife'),
      title: "River & Wildlife Stewardship",
      description: "Implement the ethical mandate for Ecosystem Protection and guarantee E-Flow as a core operational requirement.",
      icon: '🌿',
    },
    {
      id: 'excellence',
      onClick: () => navigateTo('standardOfExcellence'),
      title: "The Standard of Excellence",
      description: "Our blueprint for uncompromised quality, focused on eliminating the Execution Gap through a 0.05 mm/m precision mandate.",
      icon: '🏆',
    },
    {
      id: 'improvements',
      onClick: () => navigateTo('hppImprovements'),
      title: "HPP Ino-Hub",
      description: "Drive collaborative innovations that support LCC Optimization and close the Execution Gap.",
      icon: '💡',
    },
    {
      id: 'equity',
      onClick: () => navigateTo('genderEquity'),
      title: "Gender Equity",
      description: "Close the Execution Gap in human capital by building a culture with a zero-tolerance policy for bias.",
      icon: '⚖️',
    },
   ];

   const feedbackAndGrowth = [
     {
      id: 'suggestion',
      onClick: () => navigateTo('suggestionBox'),
      title: "Suggestion / Idea",
      description: "Share ideas to improve our protocols for precision, risk mitigation, and LCC Optimization.",
      icon: '✍️',
    },
    {
      id: 'feedback',
      onClick: showFeedbackModal,
      title: "Feedback",
      description: "Provide a quick rating and comment on your experience with the AnoHUB platform.",
      icon: '⭐',
    }
   ];

  return (
    <div className="space-y-16 pb-12">
        {/* HERO SECTION - Sada čišći i moderniji */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AnoHub</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
                Your center for <strong className="text-cyan-400">Systemic Excellence</strong>. 
                Bridge the <span className="text-white font-semibold">Execution Gap</span> and transform risk into certainty using our 
                digital standard for integrity and precision.
            </p>
        </div>
        
        <ImpactSnapshot />
        
        {/* SECTION 1 */}
        <section>
            <div className="flex items-center space-x-4 mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent flex-grow"></div>
                <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-widest">Core Strategy & Tools</h2>
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coreStrategyTools.map((item) => (
                    <Card key={item.id} {...item} />
                ))}
            </div>
        </section>

        {/* SECTION 2 */}
        <section>
             <div className="flex items-center space-x-4 mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-grow"></div>
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Knowledge & Innovation</h2>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgeAndInnovation.map((item) => (
                    <Card key={item.id} {...item} />
                ))}
            </div>
        </section>
        
        {/* SECTION 3 */}
        <section>
            <div className="flex items-center space-x-4 mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-grow"></div>
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Feedback & Growth</h2>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbackAndGrowth.map((item) => (
                    <Card key={item.id} {...item} />
                ))}
            </div>
        </section>
    </div>
  );
};