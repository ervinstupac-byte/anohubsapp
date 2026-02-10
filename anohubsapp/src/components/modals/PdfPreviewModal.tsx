import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

    React.useEffect(() => {
        if (isOpen && pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            setBlobUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [isOpen, pdfBlob]);

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
        // Print logic can be tricky with iframes, simple window.open is often reliable
        const printWindow = window.open(blobUrl);
        if (printWindow) {
            // printWindow.print() might be blocked or need timeout
            // Usually just opening the blob in a new tab lets browser handle printing
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl h-[90vh] bg-slate-950 border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/5">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-wide">
                            {t('common.previewPDF', 'Document Preview')}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-1">{filename}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-sm font-bold rounded transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>{t('actions.download', 'Download')}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body (Iframe) */}
                <div className="flex-1 bg-slate-800/50 p-4 relative">
                    {blobUrl && (
                        <iframe
                            src={blobUrl} // #toolbar=0 to hide generic controls if desired, but user controls are good
                            className="w-full h-full rounded shadow-inner border border-white/5"
                            title="PDF Preview"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
