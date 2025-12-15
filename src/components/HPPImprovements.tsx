import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useAuth } from '../contexts/AuthContext.tsx'; // Koristimo pravi Auth
import { supabase } from '../services/supabaseClient.ts'; // Spajamo se na bazu
import { useToast } from '../contexts/ToastContext.tsx';

// --- TYPES ---
interface Improvement {
    id: number;
    title: string;
    description: string;
    category: 'Mechanical' | 'Digital' | 'Ecological' | 'Systemic';
    votes: number;
    author_id: string;
    created_at: string;
}

const CATEGORIES = ['All', 'Mechanical', 'Digital', 'Ecological', 'Systemic'];

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
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
            {category}
        </span>
    );
};

// --- MAIN COMPONENT ---
export const HPPImprovements: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    
    const [ideas, setIdeas] = useState<Improvement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Improvement['category']>('Mechanical');

    // --- FETCH IDEAS ---
    const fetchIdeas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('hpp_improvements')
            .select('*')
            .order('votes', { ascending: false }); // Najpopularnije prve

        if (error) {
            console.error('Error fetching ideas:', error);
        } else {
            setIdeas(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchIdeas();
        // Subscribe to changes (Real-time updates)
        const sub = supabase.channel('public:hpp_improvements')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'hpp_improvements' }, () => {
                fetchIdeas();
            }).subscribe();
        return () => { supabase.removeChannel(sub); };
    }, []);

    // --- ACTIONS ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return;

        const newIdea = {
            title,
            description,
            category,
            author_id: user?.email || 'Anonymous',
            votes: 0
        };

        const { error } = await supabase.from('hpp_improvements').insert([newIdea]);

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Innovation logged successfully!', 'success');
            setTitle('');
            setDescription('');
        }
    };

    const handleVote = async (id: number, currentVotes: number) => {
        // Optimistički UI update (odmah pokaži promjenu)
        setIdeas(prev => prev.map(i => i.id === id ? { ...i, votes: currentVotes + 1 } : i));
        
        const { error } = await supabase
            .from('hpp_improvements')
            .update({ votes: currentVotes + 1 })
            .eq('id', id);

        if (error) showToast('Failed to register vote.', 'error');
    };

    const filteredIdeas = filter === 'All' ? ideas : ideas.filter(i => i.category === filter);

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-12">
            <BackButton text="Back to HUB" />
            
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">HPP <span className="text-cyan-400">Ino-Hub</span></h2>
                <p className="text-slate-400">Collaborative Engineering Intelligence.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: SUBMISSION FORM */}
                <div className="lg:col-span-4">
                    <div className="glass-panel p-6 rounded-2xl border-l-4 border-cyan-500 sticky top-24">
                        <div className="mb-6 flex justify-between items-center border-b border-slate-700 pb-4">
                            <h3 className="text-lg font-bold text-white">Log New Concept</h3>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">Contributor: {user?.email?.split('@')[0] || 'GUEST'}</span>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Concept Title</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors" 
                                    placeholder="e.g. Biomimetic Coating" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Discipline</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Mechanical', 'Digital', 'Ecological', 'Systemic'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat as any)}
                                            className={`text-xs py-2 rounded-lg border transition-all ${category === cat ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Technical Description</label>
                                <textarea 
                                    rows={5} 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none resize-none transition-colors text-sm" 
                                    placeholder="Describe the proposed improvement..." 
                                    required 
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg transition-transform hover:-translate-y-1 hover:shadow-cyan-500/20">
                                🚀 SUBMIT FOR REVIEW
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: IDEA FEED */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* FILTERS */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === cat ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* LIST */}
                    <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                        {loading && <div className="text-center p-10 text-slate-500 animate-pulse">Syncing Innovation Database...</div>}
                        
                        {!loading && filteredIdeas.length === 0 && (
                            <div className="text-center p-12 border border-dashed border-slate-700 rounded-2xl">
                                <p className="text-slate-500">No ideas found in this category. Be the first!</p>
                            </div>
                        )}

                        {filteredIdeas.map((idea) => (
                            <div key={idea.id} className="group relative glass-panel p-6 rounded-2xl hover:bg-slate-800/80 transition-all border border-slate-700/50 flex gap-4">
                                {/* VOTE COLUMN */}
                                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                                    <button 
                                        onClick={() => handleVote(idea.id, idea.votes)}
                                        className="w-10 h-10 rounded-full bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 flex items-center justify-center transition-colors text-slate-400"
                                    >
                                        ▲
                                    </button>
                                    <span className="font-mono font-bold text-white text-lg">{idea.votes}</span>
                                </div>

                                {/* CONTENT */}
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{idea.title}</h4>
                                        <CategoryBadge category={idea.category} />
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-3">{idea.description}</p>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-700/50 pt-3">
                                        <span>Submitted by: <span className="text-slate-400">{idea.author_id.split('@')[0]}</span></span>
                                        <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};