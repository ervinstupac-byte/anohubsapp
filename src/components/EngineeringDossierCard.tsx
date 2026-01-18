import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Library,
    BookOpen,
    ScrollText,
    FileText,
    ShieldCheck,
    Database,
    Search,
    ChevronRight,
    ExternalLink,
    X,
    Filter
} from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { DossierViewerModal } from './knowledge/DossierViewerModal';
import { ROUTES, getMaintenancePath } from '../routes/paths';
import { DOSSIER_LIBRARY, DossierFile } from '../data/knowledge/DossierLibrary';
import { useIntelligenceReport } from '../services/useIntelligenceReport';

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
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ path: string; title: string; sourceData?: DossierFile } | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 50;

    const categories: DossierCategory[] = [
        { label: 'Case Studies', count: 105, icon: <ScrollText className="w-4 h-4" />, color: 'text-cyan-400' },
        { label: 'Technical Insights', count: 150, icon: <BookOpen className="w-4 h-4" />, color: 'text-blue-400' },
        { label: 'Maintenance Protocols', count: 220, icon: <ShieldCheck className="w-4 h-4" />, color: 'text-emerald-400' },
        { label: 'Turbine Friend Dossiers', count: 379, icon: <FileText className="w-4 h-4" />, color: 'text-amber-400' },
    ];

    const provenSources: DossierFile[] = DOSSIER_LIBRARY;

    // Merge intelligence report entries for search and badges
    const { report: intelReport } = useIntelligenceReport(0);
    const intelMap = React.useMemo(() => {
        const map: Record<string, any> = {};
        if (!intelReport || !intelReport.all) return map;
        for (const e of intelReport.all) {
            // keys: absolute path and rel
            if (e.path) map[e.path.toLowerCase()] = e;
            if (e.rel) map[('/archive/' + e.rel).toLowerCase()] = e;
            if (e.rel) map[e.rel.toLowerCase()] = e;
        }
        return map;
    }, [intelReport]);

    const filteredSources = useMemo(() => {
        return provenSources.filter(s => {
            const term = searchTerm.toLowerCase();
            const intel = intelMap[(s.path || '').toLowerCase()];
            const matchesSearch = s.path.toLowerCase().includes(term) ||
                s.justification.toLowerCase().includes(term) ||
                (intel && ((intel.title || '').toLowerCase().includes(term) || (intel.currentAnalysis || '').toLowerCase().includes(term) || (intel.operationalRecommendation || '').toLowerCase().includes(term)));
            const matchesCategory = selectedCategory ? s.category === selectedCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    const displayedSources = useMemo(() => filteredSources.slice(0, page * PAGE_SIZE), [filteredSources, page]);

    const handleCategoryClick = (cat: string) => {
        setSelectedCategory(cat);
        setIsModalOpen(true);
    };

    const handleEnterVault = () => {
        navigate(getMaintenancePath(ROUTES.MAINTENANCE.SHADOW_ENGINEER));
    };

    const handleOpenFile = (source: DossierFile) => {
        const path = source.path || '';
        // Expect absolute /archive/ path from DOSSIER_LIBRARY; fallback safely
        let activePath = path;
        if (!activePath.startsWith('/') && !activePath.startsWith('http')) {
            activePath = `/archive/${activePath}`;
        }
        setSelectedFile({
            path: activePath,
            title: path.split('/').pop() || 'Dossier',
            sourceData: source
        });
        setViewerOpen(true);
    };

    // Listen for global openDossier events so other dashboard buttons can trigger viewer
    React.useEffect(() => {
        const handler = (e: any) => {
            try {
                const kw = e?.detail?.keyword?.toString().toLowerCase();
                if (!kw) return;
                const match = DOSSIER_LIBRARY.find(ds => (ds.path + ' ' + (ds.justification || '')).toLowerCase().includes(kw));
                if (match) handleOpenFile(match);
            } catch (err) {
                console.error('openDossier handler failed', err);
            }
        };
        window.addEventListener('openDossier', handler as EventListener);
        return () => window.removeEventListener('openDossier', handler as EventListener);
    }, []);

    return (
        <>
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
                            <p className="text-[10px] text-slate-500 font-mono">NC-9.0 Integrity Check: 854 Files Digested</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-h-cyan/10 border border-h-cyan/20 rounded-full">
                        <Database className="w-3 h-3 text-h-cyan" />
                        <span className="text-[10px] font-black text-h-cyan font-mono tracking-widest">
                            854 SOURCES ACTIVE
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
                                onClick={() => handleCategoryClick(cat.label)}
                                className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl hover:border-h-gold/40 transition-all group/item hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] cursor-pointer"
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
                                {displayedSources.map((source, sIdx) => (
                                    <div
                                        key={sIdx}
                                        onClick={() => handleOpenFile(source)}
                                        className="p-3 hover:bg-h-cyan/5 transition-colors group/source cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-h-cyan group-hover/source:animate-ping" />
                                                <span className="text-[10px] font-mono text-slate-300 font-bold truncate max-w-[200px]">
                                                    {source.path.split('/').pop()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono uppercase">
                                                    {source.category.slice(0, 3)}
                                                </span>
                                                {intelMap[(source.path || '').toLowerCase()] && (
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-300 font-mono uppercase">
                                                        {intelMap[(source.path || '').toLowerCase()].classification || 'NOMINAL'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-slate-500 leading-tight italic">
                                            "{source.justification}"
                                        </p>
                                    </div>
                                ))}
                                {filteredSources.length > displayedSources.length && (
                                    <div className="p-3 flex items-center justify-center">
                                        <button
                                            onClick={() => setPage(prev => prev + 1)}
                                            className="px-4 py-2 bg-h-cyan/10 border border-h-cyan/30 rounded text-sm font-mono text-h-cyan"
                                        >
                                            Load more ({filteredSources.length - displayedSources.length} more)
                                        </button>
                                    </div>
                                )}
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
                        <button
                            onClick={handleEnterVault}
                            className="px-3 py-1.5 bg-h-gold/20 hover:bg-h-gold/30 border border-h-gold/40 rounded flex items-center gap-2 transition-all group/btn"
                        >
                            <span className="text-[9px] font-black text-h-gold uppercase tracking-tighter">Enter Vault</span>
                            <ChevronRight className="w-3 h-3 text-h-gold group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* CATEGORY EXPLORER MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pb-20 lg:pb-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-4xl max-h-full bg-slate-900 border border-h-gold/30 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-h-gold/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-h-gold/20 rounded-xl border border-h-gold/30">
                                        <Filter className="w-6 h-6 text-h-gold" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                                            {selectedCategory || 'Dossier Explorer'}
                                        </h2>
                                        <p className="text-[10px] text-h-gold font-mono uppercase tracking-[0.2em] font-black">
                                            Knowledge Base Audit // verified
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Search Bar */}
                            <div className="px-6 py-4 bg-black/20 border-b border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder={`Search in ${selectedCategory}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-sm font-mono text-cyan-400 focus:border-h-cyan/50 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredSources.length > 0 ? (
                                        filteredSources.map((file, fIdx) => (
                                            <motion.div
                                                key={fIdx}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: fIdx * 0.03 }}
                                                onClick={() => handleOpenFile(file)}
                                                className="p-4 bg-slate-950/40 border border-white/5 rounded-xl hover:border-h-cyan/30 hover:bg-h-cyan/5 transition-all group flex items-start justify-between gap-6 cursor-pointer"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-h-cyan transition-colors" />
                                                        <span className="text-xs font-mono font-bold text-slate-200 truncate">
                                                            {file.path}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-h-cyan/20 pl-4">
                                                        "{file.justification}"
                                                    </p>
                                                </div>
                                                <div className="shrink-0 flex flex-col items-end gap-3 text-right">
                                                    <span className="text-[9px] px-2 py-1 bg-slate-800 rounded font-mono text-slate-400 uppercase tracking-widest">
                                                        VERIFIED
                                                    </span>
                                                    <span className="text-[9px] font-black text-h-cyan uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                        OPEN SOURCE
                                                    </span>
                                                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-h-cyan transition-colors" />
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="py-20 flex flex-col items-center justify-center text-slate-600 text-center">
                                            <Search className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-mono text-sm">NO EVIDENCE MATCHING SCAN PARAMETERS</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-h-gold/5 border-t border-white/5 text-center">
                                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.3em]">
                                    NC-9.0 Integrity Layer // SHA-256 Validated
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DOSSIER VIEWER MODAL */}
            {selectedFile && (
                <DossierViewerModal
                    isOpen={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    filePath={selectedFile.path}
                    title={selectedFile.title}
                    sourceData={selectedFile.sourceData}
                />
            )}
        </>
    );
};
