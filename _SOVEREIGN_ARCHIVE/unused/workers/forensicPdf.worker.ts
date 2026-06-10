import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ForensicTemplateEngine from '../services/ForensicTemplateEngine';
import { buildAnomalyRows } from '../services/ForensicDataAggregator';
import { generateSignature as signMeasurement } from '../services/ForensicSignatureService';

self.addEventListener('message', async (ev: MessageEvent) => {
    const msg = ev.data;
    if (!msg || msg.action !== 'generate') return;
    const { asset, diagnosis, projectState, threeRef } = msg.payload;

    try {
        // Report start
        self.postMessage({ type: 'progress', pct: 5, note: 'initializing' });

        const doc = new jsPDF();
        ForensicTemplateEngine.addCustomFont(doc, null as any);
        ForensicTemplateEngine.applyCerebroBranding(doc as any, 'Forensic Diagnostic Dossier');
        self.postMessage({ type: 'progress', pct: 15, note: 'branding' });

        // Verified anomalies
        const anomalies = buildAnomalyRows(projectState as any, diagnosis as any) || [];
        const startY = 55;
        const finalY = ForensicTemplateEngine.renderEvidenceTable(doc as any, startY, ['Target Component', 'Expert Finding', 'Investigation Status'], anomalies as any[]);
        self.postMessage({ type: 'progress', pct: 35, note: 'anomalies rendered' });

        // Render other sections (simplified to reduce worker runtime)
        // Insert 3D image if provided
        if (threeRef && typeof threeRef === 'string') {
            try {
                const pageWidth = (doc as any).internal.pageSize.width;
                const imgWidth = 120;
                const imgHeight = 80;
                doc.addImage(threeRef, 'PNG', (pageWidth - imgWidth) / 2, finalY + 10, imgWidth, imgHeight);
            } catch (e) {
                // ignore
            }
        }

        self.postMessage({ type: 'progress', pct: 75, note: 'completing document' });

        // Finalize footer
        ForensicTemplateEngine.applyForensicFooter(doc as any);

        const blob = doc.output('blob');
        // send blob as transferable
        (self as any).postMessage({ type: 'done', blob }, [blob]);
    } catch (err) {
        self.postMessage({ type: 'error', error: String(err) });
    }
});
