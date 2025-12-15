import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
import { GlassCard } from './ui/GlassCard.tsx'; 

// --- 1. MOCK DATA (ESG METRICS) ---
const METRICS = {
    totalWorkforce: 142,
    womenCount: 48,
    leadershipWomen: 35, // %
    payGap: 2.1, // %
    departments: [
        { name: 'Engineering', women: 28, total: 60 },
        { name: 'Site Operations', women: 12, total: 50 },
        { name: 'Corporate & Legal', women: 8, total: 32 },
    ]
};

// --- 2. STRATEGIC CONTENT (Your text) ---
const STRATEGY_SECTIONS = [
    {
        id: 'imperativ',
        title: 'The Strategic Imperative',
        subtitle: 'Organizational Flaws Create Systemic Risk',
        content: (
            <div className="space-y-6">
                <p className="leading-relaxed text-slate-300 font-light text-lg">
                    True engineering precision extends beyond mechanical tolerances to the precision of human capital management. 
                    An organization that fails to attract, retain, and promote diverse talent suffers from a <strong className="text-white font-bold">deep, systemic failure</strong>.
                </p>
                <div className="p-6 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-xl">
                    <p className="text-sm text-cyan-200 italic font-medium">
                        "This is not just an HR initiative; it is a strategic imperative for eliminating a critical source of systemic risk and closing the Execution Gap."
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'redefiniranje',
        title: "Redefining 'Excellence'",
        subtitle: 'Inclusive Growth as a Technical Standard',
        content: (
            <div className="space-y-4">
                <div className="grid gap-4">
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <strong className="block text-cyan-400 mb-2 text-sm uppercase tracking-wider">The Inescapable Analogy</strong>
                        <span className="text-slate-300 text-sm leading-relaxed">
                            If we tolerate 10% bias in our hiring, that is equivalent to building a turbine with a <strong className="text-white">10% tolerance gap</strong>. 
                            Both are conscious decisions that knowingly guarantee future system failure.
                        </span>
                    </div>
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <strong className="block text-cyan-400 mb-2 text-sm uppercase tracking-wider">Holistic Precision Mandate</strong>
                        <span className="text-slate-300 text-sm leading-relaxed">
                            Just as technical precision is required to <strong className="text-white">0.05 mm/m</strong>, organizational precision requires a 
                            <strong className="text-white"> zero-tolerance policy for bias</strong>.
                        </span>
                    </div>
                </div>
            </div>
        )
    }
];

// --- 3. COMPONENT ---
// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const GenderEquity: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'strategy'>('dashboard');
    const [openSectionId, setOpenSectionId] = useState<string | null>('imperativ');

    const womenPercentage = Math.round((METRICS.womenCount / METRICS.totalWorkforce) * 100);

    const toggleSection = (id: string) => setOpenSectionId(openSectionId === id ? null : id);

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-8">
            
            {/* HERO HEADER */}
            <div className="relative text-center space-y-4 pt-6">
                <div className="flex justify-between items-center absolute top-0 w-full px-4">
                    <BackButton text="Back to Hub" />
                </div>
                
                <div className="pt-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        Inclusivity <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Analytics</span>
                    </h2>
                    <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto">
                        Tracking real-time metrics on workforce diversity and ESG compliance.
                    </p>
                </div>

                {/* TABS SWITCHER */}
                <div className="flex justify-center gap-4 mt-8">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'dashboard' 
                            ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
                            : 'bg-slate-900/50 text-slate-500 hover:text-white border border-slate-700'
                        }`}
                    >
                        Live Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('strategy')}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                            activeTab === 'strategy' 
                            ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]' 
                            : 'bg-slate-900/50 text-slate-500 hover:text-white border border-slate-700'
                        }`}
                    >
                        Strategic Framework
                    </button>
                </div>
            </div>

            {/* VIEW 1: DASHBOARD (Data) */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlassCard className="text-center py-8 border-t-4 border-t-purple-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Representation</div>
                            <div className="text-5xl font-black text-white mb-2">{womenPercentage}%</div>
                            <div className="text-sm text-purple-400 font-bold">
                                {METRICS.womenCount} / {METRICS.totalWorkforce} Employees
                            </div>
                        </GlassCard>
                        <GlassCard className="text-center py-8 border-t-4 border-t-pink-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Leadership Roles</div>
                            <div className="text-5xl font-black text-white mb-2">{METRICS.leadershipWomen}%</div>
                            <div className="text-sm text-pink-400 font-bold">Above Industry Avg</div>
                        </GlassCard>
                        <GlassCard className="text-center py-8 border-t-4 border-t-emerald-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Adjusted Pay Gap</div>
                            <div className="text-5xl font-black text-white mb-2">{METRICS.payGap}%</div>
                            <div className="text-sm text-emerald-400 font-bold">Parity Target Met</div>
                        </GlassCard>
                    </div>

                    <GlassCard title="Departmental Breakdown">
                        <div className="space-y-6 mt-4">
                            {METRICS.departments.map((dept) => {
                                const pct = Math.round((dept.women / dept.total) * 100);
                                return (
                                    <div key={dept.name}>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="font-bold text-slate-200">{dept.name}</span>
                                            <span className="text-sm font-mono text-purple-300">{dept.women} / {dept.total} ({pct}%)</span>
                                        </div>
                                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full relative"
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* VIEW 2: STRATEGY (Your Text) */}
            {activeTab === 'strategy' && (
                <div className="space-y-4 animate-fade-in-up">
                    {STRATEGY_SECTIONS.map((section) => (
                        <div 
                            key={section.id}
                            className={`
                                group rounded-2xl overflow-hidden transition-all duration-500 ease-out border
                                ${openSectionId === section.id 
                                    ? 'bg-slate-800/80 border-cyan-500/50 shadow-lg shadow-cyan-900/10' 
                                    : 'bg-slate-900/40 border-white/5 hover:border-white/10'}
                            `}
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex justify-between items-center text-left p-6"
                            >
                                <div>
                                    <h3 className={`text-xl font-bold transition-colors ${openSectionId === section.id ? 'text-white' : 'text-slate-300'}`}>
                                        {section.title}
                                    </h3>
                                    <p className="text-sm text-cyan-400 mt-1">{section.subtitle}</p>
                                </div>
                                <span className={`text-2xl transition-transform duration-300 ${openSectionId === section.id ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`}>
                                    ▼
                                </span>
                            </button>
                            
                            {openSectionId === section.id && (
                                <div className="p-6 pt-0 border-t border-white/10 animate-fade-in">
                                    <div className="pt-6">{section.content}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.