import React, { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { CORE_STRATEGY_TOOLS, KNOWLEDGE_INNOVATION_TOOLS, FEEDBACK_TOOLS } from '../constants.ts';
import type { HubTool } from '../types.ts';

// --- MODERNA KARTICA ---
const Card: React.FC<HubTool & { onClick: () => void }> = ({ title, description, onClick, icon, isCritical = false, delay = 0 }) => (
    <div 
        onClick={onClick}
        style={{ animationDelay: `${delay}ms` }}
        className={`
            animate-fade-in-up opacity-0
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

// --- IMPACT SNAPSHOT BROJAČ ---
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
        <div className="relative overflow-hidden text-center mb-12 p-8 rounded-3xl border border-cyan-900/50 bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-sm shadow-2xl animate-fade-in-up">
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

// --- SEKCIJA (Reusable) ---
const Section: React.FC<{ title: string, tools: HubTool[], navigate: any }> = ({ title, tools, navigate }) => (
    <section>
        <div className="flex items-center space-x-4 mb-8">
            <div className={`h-px bg-gradient-to-r from-transparent flex-grow ${title.includes('Core') ? 'via-cyan-500/50' : 'via-slate-600'} to-transparent`}></div>
            <h2 className={`text-xl font-bold uppercase tracking-widest ${title.includes('Core') ? 'text-cyan-400' : 'text-slate-400'}`}>{title}</h2>
            <div className={`h-px bg-gradient-to-r from-transparent flex-grow ${title.includes('Core') ? 'via-cyan-500/50' : 'via-slate-600'} to-transparent`}></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
                <Card 
                    key={tool.id} 
                    {...tool} 
                    onClick={() => navigate(tool.view)} 
                />
            ))}
        </div>
    </section>
);

// --- GLAVNA KOMPONENTA ---
export const Hub: React.FC = () => {
   const { navigateTo, showFeedbackModal } = useNavigation();

   return (
    <div className="space-y-16 pb-12">
        {/* HERO SECTION */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AnoHub</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
                Your center for <strong className="text-cyan-400">Systemic Excellence</strong>. 
                Bridge the <span className="text-white font-semibold">Execution Gap</span> and transform risk into certainty.
            </p>
        </div>
        
        <ImpactSnapshot />
        
        <Section title="Core Strategy & Tools" tools={CORE_STRATEGY_TOOLS} navigate={navigateTo} />
        <Section title="Knowledge & Innovation" tools={KNOWLEDGE_INNOVATION_TOOLS} navigate={navigateTo} />
        
        {/* Feedback Section (Manual jer ima custom onClick za modal) */}
        <section>
            <div className="flex items-center space-x-4 mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-grow"></div>
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Feedback & Growth</h2>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEEDBACK_TOOLS.map(tool => (
                    <Card 
                        key={tool.id} 
                        {...tool} 
                        onClick={tool.id === 'feedback' ? showFeedbackModal : () => navigateTo(tool.view)} 
                    />
                ))}
            </div>
        </section>
    </div>
  );
};

export default Hub;