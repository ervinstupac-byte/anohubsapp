import React, { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

const Card: React.FC<{title: string, description: string, onClick: () => void, icon: string, isCritical?: boolean}> = ({ title, description, onClick, icon, isCritical = false }) => (
    <div 
        onClick={onClick}
        className={`group h-full flex flex-col bg-slate-800/80 p-6 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl backdrop-blur-sm 
        ${isCritical 
            ? 'border-cyan-500/70 hover:border-cyan-400 hover:shadow-cyan-400/30' 
            : 'border-slate-700 hover:border-cyan-500/50 hover:shadow-cyan-500/25'
        }`}
    >
        <div className="text-4xl mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors duration-300">
            {title}
        </h3>
        <p className="text-sm text-slate-400 flex-grow">
            {description}
        </p>
    </div>
);

const ImpactSnapshot: React.FC = () => {
    const [count, setCount] = useState(() => {
        const savedCount = localStorage.getItem('protocol-impact-count');
        return savedCount ? parseInt(savedCount, 10) : 1380; // Start with a realistic number
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => {
                const newCount = prevCount + Math.floor(Math.random() * 3) + 1;
                localStorage.setItem('protocol-impact-count', newCount.toString());
                return newCount;
            });
        }, 3000); // Increment every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center mb-12 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm tracking-widest uppercase">Impact Snapshot</p>
            <p className="text-4xl font-bold text-cyan-400 mt-1">
                {count.toLocaleString()}
            </p>
            <p className="text-slate-500 text-sm">Total Verified Protocols to Date</p>
        </div>
    );
};


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
    <div className="animate-fade-in space-y-12">
        <div className="p-6 bg-slate-900/50 border-l-4 border-cyan-400 rounded-r-lg text-slate-300 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-2">Welcome to AnoHub: Your center for <span className="text-cyan-400">Systemic Excellence.</span></h2>
            <p className="mb-3 text-slate-300">This is where we bridge the <strong className="font-semibold text-cyan-400">Execution Gap</strong> and transform risk into certainty.</p>
            <p className="text-slate-400">Navigate through the Project Phases to access <strong className="font-semibold text-cyan-400">Hydro-Prijatelj</strong> protocols—our digital standard for integrity, precision (0.05 mm/m), and long-term asset performance.</p>
        </div>
        
        <ImpactSnapshot />
        
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-300 border-b-2 border-cyan-500/30 pb-3">1. CORE STRATEGY & TOOLS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coreStrategyTools.map((item) => (
                    <Card key={item.id} title={item.title} description={item.description} onClick={item.onClick} icon={item.icon} isCritical={item.isCritical} />
                ))}
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-300 border-b-2 border-slate-700/50 pb-3">2. KNOWLEDGE & INNOVATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgeAndInnovation.map((item) => (
                    <Card key={item.id} title={item.title} description={item.description} onClick={item.onClick} icon={item.icon} />
                ))}
            </div>
        </div>
        
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-300 border-b-2 border-slate-700/50 pb-3">3. FEEDBACK & GROWTH</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbackAndGrowth.map((item) => (
                    <Card key={item.id} title={item.title} description={item.description} onClick={item.onClick} icon={item.icon} />
                ))}
            </div>
        </div>
    </div>
  );
};