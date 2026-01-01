import React, { useEffect, useRef } from 'react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="w-full h-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">

                {/* Header (Toolbar) */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-full">
                            <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
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
                    <iframe
                        ref={iframeRef}
                        src={pdfUrl}
                        className="w-full h-full border-none"
                        title="PDF Viewer"
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
