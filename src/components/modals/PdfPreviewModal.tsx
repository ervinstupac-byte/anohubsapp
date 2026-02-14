import React from 'react';
import { X, Download, Printer, Share2, FileText, Check, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../shared/components/ui/GlassCard';

interface PdfPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfBlob: Blob | null;
    filename: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
    isOpen,
    onClose,
    pdfBlob,
    filename
}) => {
    const { t } = useTranslation();
    const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (isOpen && pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            setBlobUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [isOpen, pdfBlob]);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen || !pdfBlob) return null;

    const handleDownload = () => {
        if (!blobUrl) return;
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.click();
    };

    const handlePrint = () => {
        if (!blobUrl) return;
        const iframe = document.getElementById('pdf-preview-frame') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        }
    };

    const handleShare = () => {
        // Simulate share link copy
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-6xl h-[90vh] flex flex-col"
                >
                    <GlassCard className="flex-1 flex flex-col overflow-hidden border-cyan-500/30 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <FileText className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        {t('common.previewPDF', 'Document Preview')}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                                        <span className="text-slate-300">{filename}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                                        <span>{formatSize(pdfBlob.size)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleShare}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    title="Share Link"
                                >
                                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    title="Print"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-bold rounded-lg transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>{t('actions.download', 'Download')}</span>
                                </button>
                                <div className="w-px h-8 bg-white/10 mx-2" />
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-slate-400 hover:text-red-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Body (Iframe) */}
                        <div className="flex-1 bg-slate-950/50 relative">
                            {blobUrl && (
                                <iframe
                                    id="pdf-preview-frame"
                                    src={blobUrl}
                                    className="w-full h-full border-none"
                                    title="PDF Preview"
                                />
                            )}
                        </div>
                        
                        {/* Footer info */}
                        <div className="px-6 py-2 bg-slate-900/90 border-t border-white/10 text-[10px] text-slate-500 font-mono flex justify-between">
                            <div>SECURE DOCUMENT VIEWER // SOVEREIGN PROTOCOL</div>
                            <div>GENERATED: {new Date().toISOString()}</div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
