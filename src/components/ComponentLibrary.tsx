import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
import { componentData } from '../data/componentData.ts';
import type { ComponentData } from '../data/componentData.ts';

export const ComponentLibrary: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string>(componentData[0].id);

    const selectedComponent = componentData.find(c => c.id === selectedId) || componentData[0];

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8 h-[calc(100vh-100px)] flex flex-col">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <BackButton text="Back to Hub" />
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Technical <span className="text-cyan-400">Knowledge Base</span>
                    </h2>
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 text-xs font-mono text-slate-400">
                    {componentData.length} CRITICAL SYSTEMS INDEXED
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                
                {/* LEFT SIDEBAR (LIST) */}
                <div className="lg:col-span-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 h-full">
                    {componentData.map((comp) => (
                        <button
                            key={comp.id}
                            onClick={() => setSelectedId(comp.id)}
                            className={`
                                text-left p-4 rounded-xl border transition-all duration-300 group
                                ${selectedId === comp.id 
                                    ? 'bg-cyan-900/20 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-500'}
                            `}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className={`font-bold text-sm ${selectedId === comp.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                    {comp.title}
                                </h3>
                                {selectedId === comp.id && <span className="text-cyan-400">●</span>}
                            </div>
                        </button>
                    ))}
                </div>

                {/* RIGHT CONTENT (DETAILS) */}
                <div className="lg:col-span-8 h-full overflow-y-auto custom-scrollbar">
                    <div className="glass-panel p-8 rounded-2xl bg-slate-800/50 border border-slate-700 h-full animate-fade-in key={selectedId}">
                        
                        {/* TITLE & DESC */}
                        <div className="mb-8 border-b border-slate-700 pb-6">
                            <h2 className="text-2xl font-bold text-white mb-4">{selectedComponent.title}</h2>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                {selectedComponent.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* KPIS */}
                            <div>
                                <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                    <span>📊</span> Performance KPIs
                                </h4>
                                <ul className="space-y-3">
                                    {selectedComponent.kpis.map((kpi, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                            <span className="text-cyan-500 mt-0.5">▹</span>
                                            <span className="text-sm text-slate-200">{kpi}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* RISKS */}
                            <div>
                                <h4 className="text-red-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                    <span>⚠️</span> Key Risk Vectors
                                </h4>
                                <ul className="space-y-3">
                                    {selectedComponent.risks.map((risk, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                            <span className={`
                                                mt-1 w-2 h-2 rounded-full flex-shrink-0
                                                ${risk.level === 'High' ? 'bg-red-500 shadow-[0_0_8px_red]' : 
                                                  risk.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}
                                            `}></span>
                                            <span className="text-sm text-slate-200">{risk.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};