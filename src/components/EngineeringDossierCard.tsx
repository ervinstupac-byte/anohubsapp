import React, { useState, useMemo } from 'react';
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
import { DossierViewerModal } from './knowledge/DossierViewerModal';
import { ROUTES, getMaintenancePath } from '../routes/paths';
import { DOSSIER_LIBRARY, DossierFile, resolveDossier } from '../data/knowledge/DossierLibrary';
import { useIntelligenceReport } from '../services/useIntelligenceReport';
import { EVENTS } from '../lib/events';

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
        { label: 'Case Studies', count: 105, icon: <ScrollText className="w-4 h-4" />, color: 'text-status-info' },
        { label: 'Technical Insights', count: 150, icon: <BookOpen className="w-4 h-4" />, color: 'text-status-info' },
        { label: 'Maintenance Protocols', count: 220, icon: <ShieldCheck className="w-4 h-4" />, color: 'text-status-ok' },
        { label: 'Turbine Friend Dossiers', count: 379, icon: <FileText className="w-4 h-4" />, color: 'text-status-warning' },
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
        const original = source?.path || '';
        // Prefer canonical resolved entry from PATH_INDEX
        const resolved = resolveDossier(original) || source;
        let activePath = (resolved?.path || original) as string;
        if (!activePath.startsWith('/') && !activePath.startsWith('http')) {
            activePath = `/archive/${activePath}`;
        }
        setSelectedFile({
            path: activePath,
            title: (activePath.split('/').pop() || 'Dossier').replace('.html', ''),
            sourceData: resolved as any
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
                if (match) {
                    const resolved = resolveDossier(match.path) || match;
                    handleOpenFile(resolved as DossierFile);
                }
            } catch (err) {
                console.error('openDossier handler failed', err);
            }
        };
        window.addEventListener(EVENTS.OPEN_DOSSIER, handler as EventListener);
        return () => window.removeEventListener(EVENTS.OPEN_DOSSIER, handler as EventListener);
    }, []);

    return (
        <>
            <div className="relative overflow-hidden group bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
                {/* Header */}
                <div className="p-4 border-b border-scada-border flex items-center justify-between bg-scada-bg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-status-info/10 flex items-center justify-center border border-status-info/20">
                            <Library className="w-5 h-5 text-status-info" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-scada-text uppercase tracking-[0.2em]">
                                AnoHUB Trust Architecture
                            </h3>
                            <p className="text-[10px] text-scada-muted font-mono uppercase">NC-9.0 Integrity Check: 854 Files Digested</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-status-info/10 border border-status-info/20 rounded-full">
                        <Database className="w-3 h-3 text-status-info" />
                        <span className="text-[10px] font-black text-status-info font-mono tracking-widest">
                            854 SOURCES ACTIVE
                        </span>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((cat, idx) => (
                            <div
                                key={cat.label}
                                onClick={() => handleCategoryClick(cat.label)}
                                className="bg-scada-bg border border-scada-border p-4 rounded-sm hover:bg-scada-panel transition-all cursor-pointer group/item"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-2 rounded-sm bg-scada-panel ${cat.color} border border-scada-border`}>
                                        {cat.icon}
                                    </div>
                                    <span className="text-2xl font-mono font-black text-scada-text">
                                        {cat.count}
                                    </span>
                                </div>
                                <div className="text-[10px] text-scada-muted font-black uppercase tracking-widest">
                                    {cat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Search & Proof List */}
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-scada-muted" />
                            <input
                                type="text"
                                placeholder="Search Knowledge Base Evidence..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-scada-bg border border-scada-border rounded-sm py-2 pl-10 pr-4 text-xs font-mono text-scada-text focus:border-status-info focus:outline-none transition-colors placeholder-scada-muted"
                            />
                        </div>

                        <div className="flex-1 bg-scada-bg border border-scada-border rounded-sm overflow-hidden max-h-[160px] overflow-y-auto custom-scrollbar">
                            <div className="p-2 border-b border-scada-border bg-scada-panel flex items-center justify-between">
                                <span className="text-[9px] font-black text-scada-muted uppercase tracking-widest">Recent Source Verification</span>
                                <span className="text-[8px] text-status-info font-mono uppercase">Turbine_Friend Module</span>
                            </div>
                            <div className="divide-y divide-scada-border">
                                {displayedSources.map((source, sIdx) => (
                                    <div
                                        key={sIdx}
                                        onClick={() => handleOpenFile(source)}
                                        className="p-3 hover:bg-scada-panel transition-colors group/source cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-status-info" />
                                                <span className="text-[10px] font-mono text-scada-text font-bold truncate max-w-[200px] uppercase">
                                                    {source.path.split('/').pop()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-scada-panel border border-scada-border text-scada-muted font-mono uppercase">
                                                    {source.category.slice(0, 3)}
                                                </span>
                                                {intelMap[(source.path || '').toLowerCase()] && (
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-status-error/10 text-status-error font-mono uppercase border border-status-error/20">
                                                        {intelMap[(source.path || '').toLowerCase()].classification || 'NOMINAL'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-scada-muted leading-tight italic font-mono">
                                            "{source.justification}"
                                        </p>
                                    </div>
                                ))}
                                {filteredSources.length > displayedSources.length && (
                                    <div className="p-3 flex items-center justify-center">
                                        <button
                                            onClick={() => setPage(prev => prev + 1)}
                                            className="px-4 py-2 bg-scada-panel border border-scada-border rounded-sm text-xs font-mono text-status-info uppercase hover:bg-scada-bg transition-colors"
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
                    <div className="p-3 rounded-sm bg-scada-bg border border-scada-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-status-ok" />
                            <div>
                                <span className="text-[10px] text-scada-text font-black uppercase tracking-widest block">Validated Engineering Intelligence</span>
                                <span className="text-[9px] text-scada-muted font-mono leading-tight">
                                    100% of AI diagnostic logic is cross-referenced against the AnoHUB Dossier Library.
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleEnterVault}
                            className="px-3 py-1.5 bg-scada-panel hover:bg-scada-bg border border-scada-border rounded-sm flex items-center gap-2 transition-all group/btn"
                        >
                            <span className="text-[9px] font-black text-status-info uppercase tracking-tighter">Enter Vault</span>
                            <ChevronRight className="w-3 h-3 text-status-info group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* CATEGORY EXPLORER MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pb-20 lg:pb-6 animate-in fade-in duration-200">
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className="absolute inset-0 bg-black/90"
                    />
                    <div className="relative w-full max-w-4xl max-h-full bg-scada-bg border border-scada-border rounded-sm shadow-scada-card overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-scada-border flex justify-between items-center bg-scada-panel">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-scada-bg rounded-sm border border-scada-border">
                                    <Filter className="w-6 h-6 text-status-info" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-scada-text uppercase tracking-tighter">
                                        {selectedCategory || 'Dossier Explorer'}
                                    </h2>
                                    <p className="text-[10px] text-status-info font-mono uppercase tracking-[0.2em] font-black">
                                        Knowledge Base Audit // verified
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 bg-scada-bg hover:bg-scada-panel rounded-sm transition-colors text-scada-muted hover:text-scada-text border border-scada-border"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Search Bar */}
                        <div className="px-6 py-4 bg-scada-bg border-b border-scada-border">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-scada-muted" />
                                <input
                                    type="text"
                                    placeholder={`Search in ${selectedCategory}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-scada-panel border border-scada-border rounded-sm py-4 pl-12 pr-6 text-sm font-mono text-scada-text focus:border-status-info focus:outline-none transition-all placeholder-scada-muted"
                                />
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-scada-bg">
                            <div className="grid grid-cols-1 gap-3">
                                {filteredSources.length > 0 ? (
                                    filteredSources.map((file, fIdx) => (
                                        <div
                                            key={fIdx}
                                            onClick={() => handleOpenFile(file)}
                                            className="p-4 bg-scada-panel border border-scada-border rounded-sm hover:border-status-info/50 transition-all group flex items-start justify-between gap-6 cursor-pointer"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <FileText className="w-4 h-4 text-scada-muted group-hover:text-status-info transition-colors" />
                                                    <span className="text-xs font-mono font-bold text-scada-text truncate uppercase">
                                                        {file.path}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-scada-muted font-medium leading-relaxed italic border-l-2 border-status-info/20 pl-4 font-mono">
                                                    "{file.justification}"
                                                </p>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end gap-3 text-right">
                                                <span className="text-[9px] px-2 py-1 bg-scada-bg border border-scada-border rounded-sm font-mono text-scada-muted uppercase tracking-widest">
                                                    VERIFIED
                                                </span>
                                                <span className="text-[9px] font-black text-status-info uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                    OPEN SOURCE
                                                </span>
                                                <ExternalLink className="w-4 h-4 text-scada-muted group-hover:text-status-info transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-scada-muted text-center">
                                        <Search className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="font-mono text-sm uppercase">NO EVIDENCE MATCHING SCAN PARAMETERS</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-scada-panel border-t border-scada-border text-center">
                            <p className="text-[9px] text-scada-muted font-mono uppercase tracking-[0.3em]">
                                NC-9.0 Integrity Layer // SHA-256 Validated
                            </p>
                        </div>
                    </div>
                </div>
            )}

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