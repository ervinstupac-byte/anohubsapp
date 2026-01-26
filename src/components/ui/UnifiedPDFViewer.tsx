import React, { useEffect, useRef, useState } from 'react';
import { X, Printer, Download, FileText, Share2 } from 'lucide-react';

interface UnifiedPDFViewerProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string | null;
    title?: string;
    fileName?: string;
}

export const UnifiedPDFViewer: React.FC<UnifiedPDFViewerProps> = ({
    isOpen,
    onClose,
    pdfUrl,
    title = "Engineering Document",
    fileName = "document.pdf"
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Reset loading state when URL changes
    useEffect(() => {
        setIsLoading(true);
    }, [pdfUrl]);

    // Trap focus or handle escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !pdfUrl) return null;

    const handlePrint = () => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print();
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        link.click();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-viewer-title"
        >
            {/* Modal Container */}
            <div className="w-full h-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">

                {/* Header (Toolbar) */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-full">
                            <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h2 id="pdf-viewer-title" className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
                            <p className="text-[10px] text-slate-400 font-mono">{fileName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Print Document"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Download PDF"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-slate-800 mx-2" />
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* PDF Content (Iframe) */}
                <div className="flex-grow bg-slate-800 relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 animate-in fade-in duration-300">
                            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-cyan-400 font-mono text-[10px] tracking-widest animate-pulse uppercase">Rendering Engineering Dossier...</p>
                        </div>
                    )}
                    <iframe
                        ref={iframeRef}
                        src={pdfUrl}
                        className={`w-full h-full border-none transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        title={title}
                        onLoad={() => setIsLoading(false)}
                        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-popups"
                    />
                </div>

                {/* Footer (Status) */}
                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
                    <span>SECURE VIEWING SESSION</span>
                    <span>ANOHUB DOCUMENT RENDERER v2.0</span>
                </div>
            </div>
        </div>
    );
};
