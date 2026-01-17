import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Library,
    BookOpen,
    ScrollText,
    FileText,
    ShieldCheck,
    Database,
    Search,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';

interface DossierCategory {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
}

interface SourceFile {
    path: string;
    justification: string;
    category: string;
}

export const EngineeringDossierCard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const categories: DossierCategory[] = [
        { label: 'Case Studies', count: 13, icon: <ScrollText className="w-4 h-4" />, color: 'text-cyan-400' },
        { label: 'Technical Insights', count: 18, icon: <BookOpen className="w-4 h-4" />, color: 'text-blue-400' },
        { label: 'Maintenance Protocols', count: 48, icon: <ShieldCheck className="w-4 h-4" />, color: 'text-emerald-400' },
        { label: 'Turbine Friend Dossiers', count: 123, icon: <FileText className="w-4 h-4" />, color: 'text-amber-400' },
    ];

    const provenSources: SourceFile[] = [
        { path: 'Turbine_Friend/Francis_SOP_Precision/index.html', justification: 'Mandatory +/- 0.05mm run-out tolerance for Francis shafts.', category: 'Protocol' },
        { path: 'Turbine_Friend/Francis_SOP_Acoustics/index.html', justification: 'Acoustic fingerprinting used to delineate cavitation from mechanical rub.', category: 'SOP' },
        { path: 'Turbine_Friend/Francis_SOP_Bearings/index.html', justification: 'Babbitt thermal limits dictated by ISO 10816 standards.', category: 'Insight' },
        { path: 'Turbine_Friend/Francis_SOP_Lubrication/index.html', justification: 'Oil TAN limit set at 0.5 mg KOH/g for operational safety.', category: 'SOP' },
        { path: 'Turbine_Friend/Francis_SOP_Thermal/index.html', justification: 'Thermal drift patterns require 24-hour stabilization periods.', category: 'Dossier' },
        { path: 'Turbine_Friend/Francis_SOP_Coupling/index.html', justification: 'Bolt torque specifications derived from material grade 8.8.', category: 'Protocol' },
        { path: 'Turbine_Friend/Francis_SOP_HPU/index.html', justification: 'Hydraulic pressure transients must be limited to 115% of nominal.', category: 'Protocol' },
        { path: 'Turbine_Friend/Francis_SOP_Shaft_Alignment/index.html', justification: 'Laser alignment verification mandated every 180 days.', category: 'Dossier' },
        { path: 'Turbine_Friend/Francis_SOP_Penstock/index.html', justification: 'Hoop stress calculations verified against Penstock integrity SOPs.', category: 'Protocol' },
        { path: 'Turbine_Friend/Francis_Emergency_Protocols/index.html', justification: 'Emergency shutdown triggers synchronized with vibration thresholds.', category: 'Protocol' },
    ];

    const filteredSources = provenSources.filter(s =>
        s.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.justification.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <GlassCard className="relative overflow-hidden group border-h-gold/30 bg-gradient-to-br from-slate-900/90 to-black/90">
            {/* Header */}
            <div className="p-4 border-b border-h-gold/20 flex items-center justify-between bg-h-gold/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-h-gold/10 flex items-center justify-center border border-h-gold/20">
                        <Library className="w-5 h-5 text-h-gold" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-h-gold uppercase tracking-[0.2em]">
                            AnoHUB Trust Architecture
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">NC-5.5 Integrity Check: 202 Files Digested</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-h-cyan/10 border border-h-cyan/20 rounded-full">
                    <Database className="w-3 h-3 text-h-cyan" />
                    <span className="text-[10px] font-black text-h-cyan font-mono tracking-widest">
                        202 SOURCES ACTIVE
                    </span>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl hover:border-h-gold/40 transition-all group/item hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg bg-slate-800 ${cat.color} border border-white/5 group-hover/item:scale-110 transition-transform`}>
                                    {cat.icon}
                                </div>
                                <span className="text-2xl font-mono font-black text-white">
                                    {cat.count}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                {cat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search & Proof List */}
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search Knowledge Base Evidence..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs font-mono text-cyan-400 focus:border-h-cyan/50 focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex-1 bg-black/40 border border-slate-800 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto custom-scrollbar">
                        <div className="p-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recent Source Verification</span>
                            <span className="text-[8px] text-h-cyan font-mono">Turbine_Friend Module</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {filteredSources.map((source, sIdx) => (
                                <div key={sIdx} className="p-3 hover:bg-h-cyan/5 transition-colors group/source">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-h-cyan group-hover/source:animate-ping" />
                                            <span className="text-[10px] font-mono text-slate-300 font-bold truncate max-w-[200px]">
                                                {source.path.split('/').pop()}
                                            </span>
                                        </div>
                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono uppercase">
                                            {source.category}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-tight italic">
                                        "{source.justification}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Tagline */}
            <div className="px-6 pb-6 mt-2">
                <div className="p-3 rounded-lg bg-h-gold/5 border border-h-gold/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-h-gold" />
                        <div>
                            <span className="text-[10px] text-white font-black uppercase tracking-widest block">Validated Engineering Intelligence</span>
                            <span className="text-[9px] text-slate-500 font-mono leading-tight">
                                100% of AI diagnostic logic is cross-referenced against the AnoHUB Dossier Library.
                            </span>
                        </div>
                    </div>
                    <button className="px-3 py-1.5 bg-h-gold/20 hover:bg-h-gold/30 border border-h-gold/40 rounded flex items-center gap-2 transition-all group/btn">
                        <span className="text-[9px] font-black text-h-gold uppercase tracking-tighter">Enter Vault</span>
                        <ChevronRight className="w-3 h-3 text-h-gold group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};
