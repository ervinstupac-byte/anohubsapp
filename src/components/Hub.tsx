import React, { useState, useEffect } from 'react';
import { CORE_STRATEGY_TOOLS, KNOWLEDGE_INNOVATION_TOOLS, FEEDBACK_TOOLS } from '../constants';
import { useNavigation } from '../contexts/NavigationContext';
import type { HubTool } from '../types';

// --- KARTICA ALATA ---
const ToolCard: React.FC<{ tool: HubTool; onClick: () => void }> = ({ tool, onClick }) => (
    <div 
        onClick={onClick}
        className={`
            group relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden
            ${tool.isCritical 
                ? 'bg-slate-800/80 border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]' 
                : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'}
        `}
        style={{ animationDelay: `${tool.delay}ms` }}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{tool.icon}</div>
            {tool.isCritical && (
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30 uppercase tracking-wider animate-pulse">
                    Core Tool
                </span>
            )}
        </div>
        <h3 className={`text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors ${tool.isCritical ? 'text-white' : 'text-slate-200'}`}>
            {tool.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300">
            {tool.description}
        </p>
        
        {/* Hover Effect Line */}
        <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 group-hover:w-full"></div>
    </div>
);

export const Hub: React.FC = () => {
    const { navigateTo } = useNavigation();
    const [userName, setUserName] = useState<string | null>(localStorage.getItem('anoHubUser'));

    const handleLogin = () => {
        const name = prompt("Enter your Pilot Callsign (Name):");
        if (name) {
            localStorage.setItem('anoHubUser', name);
            setUserName(name);
        }
    };

    const handleLogout = () => {
        if(confirm("Log out?")) {
            localStorage.removeItem('anoHubUser');
            setUserName(null);
        }
    };

    return (
        <div className="animate-fade-in pb-12">
            
            {/* LOGIN STATUS BAR (Top Left) */}
            <div className="absolute top-0 left-0 p-4 z-50">
                {userName ? (
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-cyan-500/30 hover:bg-red-900/30 hover:border-red-500/50 transition-all group">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse group-hover:bg-red-500"></span>
                        <span className="text-xs font-bold text-cyan-400 group-hover:text-red-400">PILOT: {userName.toUpperCase()}</span>
                    </button>
                ) : (
                    <button onClick={handleLogin} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-600 hover:border-cyan-400 hover:text-white text-slate-400 transition-all text-xs font-bold uppercase tracking-wider">
                        <span>👤</span> Identify Yourself
                    </button>
                )}
            </div>

            {/* HEADER */}
            <div className="text-center py-10 space-y-4">
                <h2 className="text-2xl font-light text-slate-400 uppercase tracking-[0.2em]">Strategic Operations Center</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto rounded-full opacity-50"></div>
            </div>

            <div className="space-y-12 max-w-6xl mx-auto">
                
                {/* SECTION 1: CORE STRATEGY */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-cyan-500">I.</span> Core Strategy & Execution Tools
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CORE_STRATEGY_TOOLS.map(tool => (
                            <ToolCard key={tool.id} tool={tool} onClick={() => navigateTo(tool.view)} />
                        ))}
                    </div>
                </section>

                {/* SECTION 2: KNOWLEDGE & INNOVATION */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-purple-500">II.</span> Knowledge, Innovation & Ethics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {KNOWLEDGE_INNOVATION_TOOLS.map(tool => (
                            <ToolCard key={tool.id} tool={tool} onClick={() => navigateTo(tool.view)} />
                        ))}
                    </div>
                </section>

                {/* SECTION 3: FEEDBACK */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-yellow-500">III.</span> System Improvement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {FEEDBACK_TOOLS.map(tool => (
                            <ToolCard key={tool.id} tool={tool} onClick={() => navigateTo(tool.view)} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};