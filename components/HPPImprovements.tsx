import React, { useState, useEffect } from 'react';
import type { HPPImprovement } from '../types';

// --- DATA & CONSTANTS ---
const LOCAL_STORAGE_KEY = 'hpp-improvement-ideas';

const initialIdeas: HPPImprovement[] = [
    {
        id: 'idea-5',
        title: 'Guide Vane Redesign',
        description: 'Future research into redesigning the guide vanes (GV) using a combination of tubercle and denticle technology principles to optimize flow, reduce vibration, and increase efficiency at partial loads.',
        category: 'Systemic',
    },
    {
        id: 'idea-4',
        title: 'Shark Skin (DENTICLE) Tech',
        description: 'Application of micro-structures inspired by shark skin (denticles) on blade and casing surfaces to reduce friction, prevent biofilm buildup, and improve hydrodynamic efficiency.',
        category: 'Mechanical',
    },
    {
        id: 'idea-1',
        title: '"Whale Fin" Runner-Stator',
        description: 'A biomimetic runner with a leading edge featuring tubercles (inspired by humpback whales) for maximum efficiency in turbulent conditions.',
        category: 'Mechanical',
    },
    {
        id: 'idea-2',
        title: 'Passive Positioning System',
        description: 'An innovative system that uses hydrodynamic fins to passively position a pico-turbine in the main river current.',
        category: 'Ecological',
    },
    {
        id: 'idea-3',
        title: '"Hydraulic Heart" System',
        description: 'A hybrid energy storage concept combining PSH with a mechanical buoyancy engine for dual-cycle generation.',
        category: 'Systemic',
    },
];

// --- HELPER COMPONENTS ---

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    let colorClass = '';
    switch (category) {
        case 'Mechanical': colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]'; break;
        case 'Digital': colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'; break;
        case 'Ecological': colorClass = 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]'; break;
        case 'Systemic': colorClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]'; break;
        default: colorClass = 'bg-slate-500/10 text-slate-400';
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colorClass}`}>
            {category}
        </span>
    );
};

// --- MAIN COMPONENT ---
const HPPImprovements: React.FC = () => {
    // Load Initial State
    const [ideas, setIdeas] = useState<HPPImprovement[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            return saved ? JSON.parse(saved) : initialIdeas;
        } catch { return initialIdeas; }
    });

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<HPPImprovement['category']>('Mechanical');

    // Save on Change
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ideas));
    }, [ideas]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return;
        
        const newIdea: HPPImprovement = {
            id: new Date().toISOString(),
            title,
            description,
            category,
        };
        
        setIdeas(prev => [newIdea, ...prev]);
        setTitle('');
        setDescription('');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this innovation log?')) {
            setIdeas(prev => prev.filter(i => i.id !== id));
        }
    };

    const inputClass = "w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 backdrop-blur-sm";

    return (
        <div className="space-y-8 pb-8 max-w-7xl mx-auto animate-fade-in">
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    HPP <span className="text-cyan-400">Ino-Hub</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Log, categorize, and develop your innovative ideas for hydropower optimization.
                </p>
                
                {/* STATS BAR */}
                <div className="flex justify-center gap-6 mt-4">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-white">{ideas.length}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-widest">Active Concepts</span>
                    </div>
                    <div className="w-px bg-slate-700 h-10"></div>
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-cyan-400">{ideas.filter(i => i.category === 'Systemic').length}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-widest">Systemic</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: INPUT FORM (Sticky on Desktop) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 glass-panel rounded-2xl p-6 border-cyan-500/20 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg mr-3 text-xl">💡</span>
                            Log New Concept
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Biomimetic Runner"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value as any)}
                                    className={inputClass}
                                >
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Digital">Digital</option>
                                    <option value="Ecological">Ecological</option>
                                    <option value="Systemic">Systemic</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className={inputClass}
                                    placeholder="Technical details..."
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={!title || !description}
                                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ADD TO LOG
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: IDEA FEED */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Innovation Registry</h3>
                        <span className="text-xs text-slate-500">Live Database</span>
                    </div>

                    {ideas.length === 0 ? (
                        <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-slate-700">
                            <div className="text-6xl mb-4 opacity-20">📂</div>
                            <p className="text-slate-400">Registry is empty.</p>
                            <p className="text-slate-500 text-sm">Start by logging your first innovation.</p>
                        </div>
                    ) : (
                        ideas.map((idea, index) => (
                            <div 
                                key={idea.id} 
                                className="glass-panel p-6 rounded-2xl group hover:bg-slate-800/60 transition-all duration-300 animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <CategoryBadge category={idea.category} />
                                    <button 
                                        onClick={() => handleDelete(idea.id)}
                                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                        title="Delete Entry"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                    {idea.title}
                                </h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {idea.description}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HPPImprovements;