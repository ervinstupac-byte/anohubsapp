import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, Download, Minimize2, AlertCircle, Activity, FileText, Clock, Eye } from 'lucide-react';
import { resolveDossier } from '../../data/knowledge/DossierLibrary';

interface DossierViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    filePath: string;
    title: string;
    sourceData?: any; // Pass the original library object if available
}

export const DossierViewerModal: React.FC<DossierViewerModalProps> = ({ isOpen, onClose, filePath, title, sourceData }) => {
    const navigate = useNavigate();
    const [loadError, setLoadError] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [viewCount, setViewCount] = useState(0);
    const [lastViewed, setLastViewed] = useState<string | null>(null);

    // Resolve canonical dossier when possible
    const resolvedSource = sourceData || resolveDossier(filePath) || undefined;
    // Ensure the path is relative to the public root; prefer resolved canonical path
    const resolvedPathCandidate = resolvedSource?.path || filePath || '';
    const normalizedPath = resolvedPathCandidate.startsWith('/') ? resolvedPathCandidate : `/${resolvedPathCandidate}`;
    // Fallback mapping to current archival locations:
    // - Phase 3 migration moved src/AnoHub_site/ → public/anohub_site/ (served at /anohub_site/)
    // - public/archive/ is served directly at /archive/ by Vite
    const activePath = (() => {
        // AnoHub_site paths: Phase 3 moved these to public/anohub_site/
        if (normalizedPath.includes('AnoHub_site')) {
            return normalizedPath
                .replace('/src/AnoHub_site/', '/anohub_site/')
                .replace('/AnoHub_site/', '/anohub_site/');
        }
        // Legacy /public/archive paths → /archive/
        if (normalizedPath.includes('/public/archive')) {
            return normalizedPath.replace('/public/archive', '/archive');
        }
        // /archive/ and /docs/archive/ both remap to /archive/ (public/archive/ is Vite-served)
        if (normalizedPath.startsWith('/docs/archive/')) {
            return normalizedPath.replace('/docs/archive/', '/archive/');
        }
        // Use normalized path as-is (covers /archive/*, /anohub_site/*, and absolute paths)
        return normalizedPath;
    })();

    useEffect(() => {
        if (isOpen) {
            let mounted = true;
            const controller = new AbortController();
            setIsChecking(true);
            setLoadError(false);
            
            // Track view statistics
            setViewCount(prev => prev + 1);
            setLastViewed(new Date().toLocaleString());

            // Physical check for file existence with abort-safe fetch
            fetch(activePath, { method: 'HEAD', signal: controller.signal })
                .then(res => {
                    if (mounted) {
                        if (!res.ok) setLoadError(true);
                    }
                })
                .catch((err) => {
                    if (mounted && err.name !== 'AbortError') setLoadError(true);
                })
                .finally(() => {
                    if (mounted) setIsChecking(false);
                });

            return () => {
                mounted = false;
                controller.abort();
            };
        }
    }, [isOpen, activePath]);

    const handleStartAudit = () => {
        onClose();
        // Navigate to precision audit and pass the file info as state
        navigate('/precision-audit', {
            state: {
                sourceFile: sourceData || { path: filePath, title: title, justification: 'Direct audit from viewer.' }
            }
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-h-cyan/30 rounded-xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(34,211,238,0.2)]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-950 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-h-cyan/10 rounded border border-h-cyan/20">
                                    <ShieldCheck className="w-5 h-5 text-h-cyan" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest truncate max-w-md">
                                        {title || 'Dossier Viewer'}
                                    </h2>
                                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                                        Source: {activePath}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded border border-white/10">
                                    <Eye className="w-3 h-3 text-slate-400" />
                                    <span className="text-[9px] font-mono text-slate-400">Views: {viewCount}</span>
                                </div>
                                {lastViewed && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded border border-white/10">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-[9px] font-mono text-slate-400">Last: {lastViewed}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleStartAudit}
                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-[10px] font-black text-white uppercase tracking-widest transition-all mr-4 shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                                >
                                    <Activity className="w-4 h-4" />
                                    Start Forensic Audit
                                </button>
                                <a
                                    href={activePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => window.print()}
                                    className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
                                    title="Print dossier"
                                >
                                    <FileText className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white/5 hover:bg-h-red/20 rounded text-slate-400 hover:text-h-red transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 bg-white relative">
                            {isChecking ? (
                                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 border-4 border-h-cyan border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-mono text-h-cyan uppercase tracking-widest">Verifying Integrity...</span>
                                </div>
                            ) : loadError ? (
                                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-6 p-8">
                                    <div className="w-20 h-20 bg-h-red/10 border border-h-red/30 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-10 h-10 text-h-red animate-pulse" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">FILE NOT FOUND ON SERVER</h3>
                                        <p className="text-sm text-slate-500 font-mono">
                                            The requested path <span className="text-h-red">{activePath}</span> does not exist in the physical archive.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-h-red/5 border border-h-red/20 rounded-xl max-w-md text-center">
                                        <p className="text-[10px] text-h-red/80 leading-relaxed italic uppercase font-bold">
                                            NC-5.8 Integrity Fault: This entry appears to be a mocked placeholder or the file was removed from the archive; expected locations are /archive/ (public/archive/) or /anohub_site/ (Phase 3 static content).
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="px-8 py-2 bg-h-red text-white font-black text-xs uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all"
                                    >
                                        Close Viewer
                                    </button>
                                </div>
                            ) : (
                                <iframe
                                    src={activePath}
                                    className="w-full h-full border-none"
                                    title="Engineering Dossier Content"
                                    sandbox="allow-scripts allow-forms allow-same-origin"
                                    referrerPolicy="no-referrer"
                                    onLoad={(e: React.SyntheticEvent<HTMLIFrameElement>) => {
                                        try {
                                            // eslint-disable-next-line @typescript-eslint/no-var-requires
                                            const { patchIframe } = require('../../utils/iframeUtils');
                                            const el = e.currentTarget as HTMLIFrameElement;
                                            if (el) patchIframe(el);
                                        } catch (err) { }
                                    }}
                                />
                            )}

                            {/* Loading State Overlay (Subtle) */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
                                <span className="text-4xl font-black text-slate-900 uppercase tracking-[1em]">AnoHUB</span>
                            </div>
                        </div>

                        {/* Footer / Control Bar */}
                        <div className="p-3 bg-slate-950 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                                    NC-9.0 INTEGRITY LOCK ACTIVE
                                </span>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">VERIFIED</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = activePath;
                                        link.download = title || 'dossier.pdf';
                                        link.click();
                                    }}
                                    className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-tighter"
                                >
                                    <Download className="w-3 h-3" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
