import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PdfPreviewModal } from '../components/modals/PdfPreviewModal';

interface DocumentContextType {
    viewDocument: (blob: Blob, title: string, fileName?: string) => void;
    closeDocument: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [docFileName, setDocFileName] = useState("document.pdf");

    const viewDocument = (blob: Blob, title: string, fileName: string = "document.pdf") => {
        setPdfBlob(blob);
        setDocFileName(fileName);
        setIsOpen(true);
    };

    const closeDocument = () => {
        setIsOpen(false);
        setPdfBlob(null);
    };

    return (
        <DocumentContext.Provider value={{ viewDocument, closeDocument }}>
            {children}
            <PdfPreviewModal
                isOpen={isOpen}
                onClose={closeDocument}
                pdfBlob={pdfBlob}
                filename={docFileName}
            />
        </DocumentContext.Provider>
    );
};

export const useDocumentViewer = () => {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocumentViewer must be used within a DocumentProvider');
    }
    return context;
};
