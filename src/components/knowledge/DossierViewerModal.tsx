import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, Download, Minimize2, AlertCircle, Activity, PanelRight, FileText, Tag, User, Calendar, Printer, Lock, FileCode, CheckCircle } from 'lucide-react';
import { resolveDossier } from '../../data/knowledge/DossierLibrary';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { useTranslation } from 'react-i18next';
import { dispatch } from '../../lib/events';

interface DossierViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    filePath: string;
    title: string;
    sourceData?: any; // Pass the original library object if available
}

export const DossierViewerModal: React.FC<DossierViewerModalProps> = ({ isOpen, onClose, filePath, title, sourceData }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loadError, setLoadError] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [content, setContent] = useState<string | null>(null);

    // Resolve canonical dossier when possible
    const resolvedSource = sourceData || resolveDossier(filePath) || undefined;
    // Ensure the path is relative to the public root; prefer resolved canonical path
    const resolvedPathCandidate = resolvedSource?.path || filePath || '';
    const normalizedPath = resolvedPathCandidate.startsWith('/') ? resolvedPathCandidate : `/${resolvedPathCandidate}`;
    
    // Fallback mapping to current archival locations (Mock logic for demo)
    const activePath = (() => {
        if (normalizedPath.includes('AnoHub_site')) {
            return normalizedPath.replace('/src/AnoHub_site/', '/docs/archive/').replace('/AnoHub_site/', '/docs/archive/');
        }
        return normalizedPath;
    })();

    useEffect(() => {
        if (isOpen) {
            let mounted = true;
            setIsChecking(true);
            setLoadError(false);

            // Simulate fetching content (In a real app, this would be a real fetch)
            // For now, we simulate a successful "read" of the dossier metadata
            setTimeout(() => {
                if (mounted) {
                    setIsChecking(false);
                    // Mock content for demo purposes if fetch fails or is not implemented
                    setContent(`# ${title}\n\n**Classification:** CONFIDENTIAL\n**Integrity Hash:** 0x7F...9A2\n\n## Executive Summary\nThis document contains sensitive engineering data regarding the ${title}. Access is logged.\n\n## Technical Specifications\n- **Asset ID:** ${resolvedSource?.id || 'UNKNOWN'}\n- **Revision:** 2.4.1\n- **Last Audit:** ${new Date().toLocaleDateString()}\n\n## Operational Constraints\nEnsure all safety protocols are followed when interpreting this data.`);
                }
            }, 800);

            return () => { mounted = false; };
        }
    }, [isOpen, activePath, title]);

    const handleStartAudit = () => {
        onClose();
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
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl shadow-cyan-900/20"
                    >
                        <GlassCard className="flex-1 flex flex-col overflow-hidden border-cyan-500/30 p-0">
                            {/* Header */}
                            <div className="h-14 px-6 bg-slate-950/80 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                        <FileText className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            {title}
                                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400">
                                                READ ONLY
                                            </span>
                                        </h2>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                            <span>INTEGRITY VERIFIED</span>
                                            <span className="text-slate-600">|</span>
                                            <span>{filePath}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <PanelRight className="w-5 h-5" />
                                    </button>
                                    <div className="w-px h-6 bg-white/10 mx-2" />
                                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Main Layout */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Content Area */}
                                <div className="flex-1 bg-slate-900/50 overflow-y-auto custom-scrollbar p-8 relative">
                                    {isChecking ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs text-cyan-400 font-mono animate-pulse">DECRYPTING SECURE DOSSIER...</p>
                                        </div>
                                    ) : loadError ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                                            <h3 className="text-lg font-bold text-white mb-2">Dossier Access Failed</h3>
                                            <p className="text-slate-400 max-w-md">The requested file could not be located in the secure archive. It may have been expunged or moved to cold storage.</p>
                                        </div>
                                    ) : (
                                        <div className="prose prose-invert prose-cyan max-w-3xl mx-auto">
                                            {/* Simulated Markdown Rendering */}
                                            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                                                {content}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Metadata Sidebar */}
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 320, opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            className="border-l border-white/10 bg-slate-950/50 backdrop-blur-sm flex flex-col"
                                        >
                                            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
                                                {/* Actions */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                                                        <Download className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                                                        <span className="text-[10px] font-bold text-slate-400">EXPORT</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => dispatch.triggerForensicExport()}
                                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                                                    >
                                                        <Printer className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                                                        <span className="text-[10px] font-bold text-slate-400">PRINT</span>
                                                    </button>
                                                </div>

                                                {/* Metadata */}
                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Document Metadata</h3>
                                                    
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <Calendar className="w-4 h-4 text-slate-600 mt-0.5" />
                                                            <div>
                                                                <div className="text-xs text-slate-400">Created</div>
                                                                <div className="text-sm font-mono text-white">2024-03-15 09:42 UTC</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <User className="w-4 h-4 text-slate-600 mt-0.5" />
                                                            <div>
                                                                <div className="text-xs text-slate-400">Author</div>
                                                                <div className="text-sm font-mono text-white">Dr. A. Sovereign</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <Lock className="w-4 h-4 text-slate-600 mt-0.5" />
                                                            <div>
                                                                <div className="text-xs text-slate-400">Security Level</div>
                                                                <div className="text-sm font-mono text-amber-400">RESTRICTED / LEVEL 3</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <FileCode className="w-4 h-4 text-slate-600 mt-0.5" />
                                                            <div>
                                                                <div className="text-xs text-slate-400">Format</div>
                                                                <div className="text-sm font-mono text-white">PDF / A-1b</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Tags & Classifiers</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['ENGINEERING', 'AUDIT', 'COMPLIANCE', '2024'].map(tag => (
                                                            <span key={tag} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Audit Trail */}
                                                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-xs font-bold text-emerald-400">Blockchain Verified</span>
                                                    </div>
                                                    <p className="text-[10px] text-emerald-200/60 leading-relaxed">
                                                        This document's integrity has been cryptographically verified against the Sovereign Ledger.
                                                    </p>
                                                </div>
                                                
                                                <button
                                                    onClick={handleStartAudit}
                                                    className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-cyan-900/20"
                                                >
                                                    INITIATE AUDIT
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
