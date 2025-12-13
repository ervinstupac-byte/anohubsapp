import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton';
import type { HPPImprovement } from '../types';

// --- DATA: INITIAL IDEAS (Vraćeni tvoji originalni primjeri) ---
const initialIdeas: HPPImprovement[] = [
    {
        id: 'idea-5',
        title: 'Guide Vane Redesign',
        description: 'Future research into redesigning the guide vanes (GV) using a combination of tubercle and denticle technology principles to optimize flow, reduce vibration, and increase efficiency at partial loads.',
        category: 'Systemic',
    },
    {
        id: 'idea-4',
        title: 'Shark Skin (DENTICLE) Technology',
        description: 'Application of micro-structures inspired by shark skin (denticles) on blade and casing surfaces to reduce friction, prevent biofilm buildup, and improve hydrodynamic efficiency.',
        category: 'Mechanical',
    },
    {
        id: 'idea-1',
        title: '"Whale Fin" Runner-Stator Unit',
        description: 'A biomimetic runner with a leading edge featuring tubercles (inspired by humpback whales) for maximum efficiency in turbulent conditions. Includes an integrated conical stator to recover vortex energy.',
        category: 'Mechanical',
    },
    {
        id: 'idea-2',
        title: 'Passive Positioning System',
        description: 'An innovative system that uses hydrodynamic fins to passively position a pico-turbine in the main river current, eliminating the need for energy-intensive active thrusters.',
        category: 'Ecological',
    },
    {
        id: 'idea-3',
        title: '"Hydraulic Heart" System',
        description: 'A hybrid energy storage concept that combines the principles of a pumped-storage hydropower (PSH) with a mechanical buoyancy engine, creating a dual-cycle system for energy generation and storage.',
        category: 'Systemic',
    },
];

const LOCAL_STORAGE_KEY = 'hpp-improvement-ideas';

// --- BADGE COMPONENT ---
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    let colorClass = '';
    switch (category) {
        case 'Mechanical': colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/50'; break;
        case 'Digital': colorClass = 'bg-purple-500/20 text-purple-300 border-purple-500/50'; break;
        case 'Ecological': colorClass = 'bg-green-500/20 text-green-300 border-green-500/50'; break;
        case 'Systemic': colorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'; break;
        default: colorClass = 'bg-slate-500/20 text-slate-300';
    }
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
            {category}
        </span>
    );
};

// --- MAIN COMPONENT ---
const HPPImprovements: React.FC = () => {
    // Učitaj iz LocalStorage ili koristi početne ideje
    const [ideas, setIdeas] = useState<HPPImprovement[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            return saved ? JSON.parse(saved) : initialIdeas;
        } catch { return initialIdeas; }
    });

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<HPPImprovement['category']>('Mechanical');

    // Provjera logina (samo za prikaz forme)
    const user = localStorage.getItem('anoHubUser');

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
        if (confirm('Delete this idea?')) {
            setIdeas(prev => prev.filter(i => i.id !== id));
        }
    };

    const inputClass = "w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none";

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-12">
            <BackButton text="Back to HUB" />
            
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">HPP Ino-Hub</h2>
                <p className="text-slate-400">Log, categorize, and develop innovative ideas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: FORM (Samo za logirane) */}
                <div className="lg:col-span-1">
                    {!user ? (
                        <div className="glass-panel p-8 text-center border-dashed border-slate-600 rounded-2xl">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-white mb-2">Restricted Access</h3>
                            <p className="text-slate-400 text-sm mb-6">Identification required to log new concepts.</p>
                            <button 
                                onClick={() => {
                                    const name = prompt("Enter your Name/Callsign:");
                                    if(name) { localStorage.setItem('anoHubUser', name); window.location.reload(); }
                                }}
                                className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 w-full"
                            >
                                IDENTIFY YOURSELF
                            </button>
                        </div>
                    ) : (
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-cyan-500">
                            <div className="mb-4 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Log New Concept</h3>
                                <span className="text-xs text-cyan-400 font-mono">PILOT: {user}</span>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Biomimetic Coating" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value as any)} className={inputClass}>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Digital">Digital</option>
                                        <option value="Ecological">Ecological</option>
                                        <option value="Systemic">Systemic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                                    <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Technical details..." required />
                                </div>
                                <button type="submit" className="w-full py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 shadow-lg transition-transform hover:-translate-y-1">
                                    ADD TO LOG
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* RIGHT: IDEA FEED */}
                <div className="lg:col-span-2 space-y-4 h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                    {ideas.length === 0 && <p className="text-center text-slate-500 py-10">No ideas logged yet.</p>}
                    {ideas.map((idea) => (
                        <div key={idea.id} className="glass-panel p-6 rounded-xl hover:bg-slate-800/60 transition-all border border-slate-700/50">
                            <div className="flex justify-between items-start mb-3">
                                <CategoryBadge category={idea.category} />
                                <button onClick={() => handleDelete(idea.id)} className="text-slate-600 hover:text-red-400 transition-colors" title="Delete">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">{idea.title}</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{idea.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HPPImprovements;