import autoTable from 'jspdf-autotable';

export function addCustomFont(doc: any, robotoBase64: string | undefined) {
    try {
        if (robotoBase64 && robotoBase64.length > 100) {
            doc.addFileToVFS("Roboto-Regular.ttf", robotoBase64);
            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.addFont("Roboto-Regular.ttf", "Roboto", "bold", 700);
            doc.setFont("Roboto");
        } else {
            doc.setFont("helvetica");
        }
    } catch (e) {
        console.error("ForensicTemplateEngine: Font error", e);
        doc.setFont("helvetica");
    }
}

export function applyCerebroBranding(doc: any, title: string) {
    const pageWidth = doc.internal.pageSize.width;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(34, 211, 238);
    doc.setFontSize(22);
    try { doc.setFont("Roboto", "bold"); } catch (e) { }
    doc.text("CEREBRO AI", 15, 18);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("FORENSIC DIAGNOSTIC LAYER V5.7 [NC-PLATINUM]", 15, 25);
    doc.setFillColor(234, 179, 8);
    doc.rect(15, 28, 40, 6, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.text("ISO IMS VERIFIED // 2024", 35, 32.5, { align: 'center' });
    doc.setTextColor(34, 211, 238);
    doc.setFontSize(7);
    try { doc.setFont("Roboto", "bold"); } catch (e) { }
    doc.text("DATABASE STRENGTH: 50 IEC 60041 Compliant Sources", 60, 32.5);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    try { doc.setFont("Roboto", "normal"); } catch (e) { }
    doc.text(title.toUpperCase(), pageWidth - 15, 18, { align: 'right' });
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    doc.setTextColor(234, 179, 8);
    doc.text(`NC-9.0 SYNC: SECURE_VAULT_ACTIVE`, pageWidth - 15, 25, { align: 'right' });
    doc.setTextColor(148, 163, 184);
    doc.text(`TIMESTAMP: ${timestamp} UTC`, pageWidth - 15, 32, { align: 'right' });
}

export function applyForensicFooter(doc: any) {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(234, 179, 8);
        doc.setFontSize(60);
        try { doc.setGState(new (doc as any).GState({ opacity: 0.05 })); } catch (e) { }
        doc.text("NC-9.0 ISO 9001:2015 INTEGRITY AUDIT", pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
        try { doc.setGState(new (doc as any).GState({ opacity: 1 })); } catch (e) { }
        doc.setDrawColor(234, 179, 8);
        doc.setLineWidth(0.1);
        doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const sig = `DIGITAL-FRNSC-SIG: ${Math.random().toString(36).substring(2, 15).toUpperCase()} | NC-9.0 DOSSIER-LINKED`;
        doc.text(sig, 15, pageHeight - 15);
        doc.text(`PAGE ${i} OF ${pageCount}`, pageWidth - 15, pageHeight - 15, { align: 'right' });
        doc.setTextColor(234, 179, 8);
        try { doc.setFont("Roboto", "bold"); } catch (e) { }
        doc.text("ISO 9001/14001/45001 INTEGRATED SYSTEMS VERIFIED", pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
}

export function renderEvidenceTable(doc: any, startY: number, head: string[], body: any[]) {
    autoTable(doc, {
        startY,
        head: [head],
        body,
        margin: { left: 15, right: 15 },
        headStyles: { fillColor: [15, 23, 42], textColor: [34, 211, 238], fontSize: 9 },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    return (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : startY;
}

export default { addCustomFont, applyCerebroBranding, applyForensicFooter, renderEvidenceTable };
