import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UnifiedPDFViewer } from '../components/ui/UnifiedPDFViewer';

interface DocumentContextType {
    viewDocument: (blob: Blob, title: string, fileName?: string) => void;
    closeDocument: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [docTitle, setDocTitle] = useState("Document");
    const [docFileName, setDocFileName] = useState("document.pdf");

    const viewDocument = (blob: Blob, title: string, fileName: string = "document.pdf") => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setDocTitle(title);
        setDocFileName(fileName);
        setIsOpen(true);
    };

    const closeDocument = () => {
        setIsOpen(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    return (
        <DocumentContext.Provider value={{ viewDocument, closeDocument }}>
            {children}
            <UnifiedPDFViewer
                isOpen={isOpen}
                onClose={closeDocument}
                pdfUrl={pdfUrl}
                title={docTitle}
                fileName={docFileName}
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
