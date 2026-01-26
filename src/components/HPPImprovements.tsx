import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { ModernButton } from '../shared/components/ui/ModernButton';

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

// --- MODERN BADGE ---
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    let colorClass = '';
    switch (category) {
        case 'Mechanical': colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; break;
        case 'Digital': colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20'; break;
        case 'Ecological': colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; break;
        case 'Systemic': colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20'; break;
        default: colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
            {category}
        </span>
    );
};

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const HPPImprovements: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [ideas, setIdeas] = useState<Improvement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Improvement['category']>('Mechanical');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper for category translation
    const getCategoryLabel = (cat: string) => {
        const map: Record<string, string> = {
            'All': t('hppImprovements.categories.all'),
            'Mechanical': t('hppImprovements.categories.mech'),
            'Digital': t('hppImprovements.categories.digi'),
            'Ecological': t('hppImprovements.categories.eco'),
            'Systemic': t('hppImprovements.categories.sys')
        };
        return map[cat] || cat;
    };

    // --- FETCH IDEAS ---
    const fetchIdeas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('hpp_improvements')
            .select('*')
            .order('votes', { ascending: false });

        if (error) {
            console.error('Error fetching ideas:', error);
        } else {
            setIdeas(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchIdeas();
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
        setIsSubmitting(true);

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
            showToast(t('hppImprovements.toastSuccess'), 'success');
            setTitle('');
            setDescription('');
        }
        setIsSubmitting(false);
    };

    const handleVote = async (id: number, currentVotes: number) => {
        // Optimistic update
        setIdeas(prev => prev.map(i => i.id === id ? { ...i, votes: currentVotes + 1 } : i));

        const { error } = await supabase
            .from('hpp_improvements')
            .update({ votes: currentVotes + 1 })
            .eq('id', id);

        if (error) {
            showToast(t('hppImprovements.toastError'), 'error');
            // Revert optimistic update on error if needed, or just let the next fetch fix it
            fetchIdeas();
        }
    };

    const filteredIdeas = filter === 'All' ? ideas : ideas.filter(i => i.category === filter);

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-12 space-y-8">

            {/* HEADER */}
            <div className="text-center space-y-4 pt-6">
                <div className="flex justify-between items-center absolute top-0 w-full max-w-7xl px-4">
                    <BackButton text={t('actions.back')} />
                </div>

                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {t('hppImprovements.title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('hppImprovements.title').split(' ')[1]}</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-light">
                        {t('hppImprovements.subtitle')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: SUBMISSION FORM */}
                <div className="lg:col-span-4">
                    <GlassCard
                        title={t('hppImprovements.logTitle')}
                        subtitle={t('hppImprovements.contributor', { name: user?.email?.split('@')[0] || 'GUEST' })}
                        className="sticky top-24 border-l-4 border-l-cyan-500"
                        action={<span className="text-2xl">💡</span>}
                    >
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <ModernInput
                                label={t('hppImprovements.conceptLabel')}
                                value={title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                placeholder={t('hppImprovements.conceptPlaceholder')}
                                required
                            />

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">{t('hppImprovements.discipline')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Mechanical', 'Digital', 'Ecological', 'Systemic'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat as any)}
                                            className={`
                                                text-xs py-2 rounded-lg border transition-all font-bold uppercase tracking-wider
                                                ${category === cat
                                                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/20'
                                                    : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'}
                                            `}
                                        >
                                            {getCategoryLabel(cat)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">{t('hppImprovements.descLabel')}</label>
                                <textarea
                                    rows={5}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none resize-none transition-all text-sm placeholder-slate-600"
                                    placeholder={t('hppImprovements.descPlaceholder')}
                                    required
                                />
                            </div>

                            <ModernButton
                                type="submit"
                                isLoading={isSubmitting}
                                variant="primary"
                                fullWidth
                                icon={<span>🚀</span>}
                            >
                                {t('hppImprovements.submit')}
                            </ModernButton>
                        </form>
                    </GlassCard>
                </div>

                {/* RIGHT: IDEA FEED */}
                <div className="lg:col-span-8 space-y-6">

                    {/* FILTERS */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`
                                    px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wide border
                                    ${filter === cat
                                        ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                        : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}
                                `}
                            >
                                {getCategoryLabel(cat)}
                            </button>
                        ))}
                    </div>

                    {/* LIST */}
                    <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                        {loading && (
                            <div className="text-center p-12">
                                <div className="animate-spin text-4xl mb-4">⚡</div>
                                <p className="text-slate-500 font-mono animate-pulse">{t('hppImprovements.loading')}</p>
                            </div>
                        )}

                        {!loading && filteredIdeas.length === 0 && (
                            <div className="text-center p-16 border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
                                <div className="text-5xl mb-4 grayscale">💡</div>
                                <p className="text-slate-400">{t('hppImprovements.emptyTitle')}</p>
                                <p className="text-slate-600 text-sm mt-2">{t('hppImprovements.emptyDesc')}</p>
                            </div>
                        )}

                        {filteredIdeas.map((idea) => (
                            <GlassCard key={idea.id} className="p-0 hover:border-cyan-500/30 transition-colors group">
                                <div className="flex">
                                    {/* VOTE COLUMN */}
                                    <div className="flex flex-col items-center justify-center p-4 border-r border-white/5 bg-slate-900/30 w-20">
                                        <button
                                            onClick={() => handleVote(idea.id, idea.votes)}
                                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-900 flex items-center justify-center transition-all text-slate-400 shadow-lg active:scale-95 mb-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <span className="font-mono font-bold text-white text-lg">{idea.votes}</span>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-grow p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight">
                                                {idea.title}
                                            </h4>
                                            <CategoryBadge category={getCategoryLabel(idea.category)} />
                                        </div>

                                        <p className="text-slate-300 text-sm leading-relaxed mb-4 font-light">
                                            {idea.description}
                                        </p>

                                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-4 border-t border-white/5">
                                            <span className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                                {idea.author_id.split('@')[0]}
                                            </span>
                                            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.
