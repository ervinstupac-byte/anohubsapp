import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- KLJUČNA IZMJENA: SVE FUNKCIJE ĆE SADA VRAĆATI BLOB ILI POZIVATI CREATE DOC ---

// --- HELPER: CREATE DOSSIER PDF OBJECT (Shared Logic) ---
const createDossierDoc = (
    assetName: string,
    riskData: any,
    designData: any,
    engineerName: string
): jsPDF => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // --- 1. COVER PAGE (Ostaje isto) ---
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(6, 182, 212);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('AnoHUB', 105, 100, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('ENTERPRISE PROJECT DOSSIER', 105, 115, { align: 'center' });

    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.5);
    doc.line(60, 125, 150, 125);

    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text(`Target Asset: ${assetName}`, 105, 140, { align: 'center' });
    doc.text(`Engineer: ${engineerName}`, 105, 150, { align: 'center' });
    doc.text(`Generated: ${timestamp}`, 105, 160, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Confidential - Internal Use Only', 105, 280, { align: 'center' });

    // --- 2. RISK ASSESSMENT SECTION (Ostaje isto) ---
    if (riskData) {
        doc.addPage();

        doc.setFillColor(220, 38, 38);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION A: RISK DIAGNOSTIC', 14, 17);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Risk ID: ${riskData.id || 'N/A'}`, 14, 40);

        if (riskData.risk_level === 'High') doc.setTextColor(220, 38, 38);
        else if (riskData.risk_level === 'Medium') doc.setTextColor(234, 179, 8);
        else doc.setTextColor(22, 163, 74);

        doc.text(`Risk Level: ${riskData.risk_level || 'Unknown'}`, 14, 48);
        doc.setTextColor(0, 0, 0);

        doc.text(`Execution Gap Score: ${riskData.risk_score || 0}/100`, 14, 56);

        const notesText = riskData.description || '';
        if (notesText) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(100);
            const notes = doc.splitTextToSize(`Engineer Notes: ${notesText}`, 180);
            doc.text(notes, 14, 66);
        }

        // --- SECTION A.1: AUTOMATED CONSULTATION ---
        if (riskData.consultation) {
            const startY = notesText ? 80 : 70;
            doc.setFillColor(240, 253, 250); // Light teal bg
            doc.setDrawColor(6, 182, 212); // Teal border
            doc.rect(14, startY, 182, 35, 'FD'); // Filled and Draw

            doc.setTextColor(13, 148, 136); // Teal text
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('AI CONSULTATION & ADVICE', 20, startY + 8);

            doc.setTextColor(55);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const adviceText = doc.splitTextToSize(riskData.consultation, 170);
            doc.text(adviceText, 20, startY + 16);
        }

        if (riskData.answers) {
            const answerRows = Object.entries(riskData.answers).map(([k, v]) => {
                const questionNum = k.toUpperCase();
                return [questionNum, v];
            });

            autoTable(doc, {
                startY: riskData.consultation ? 120 : (notesText ? 80 : 70), // Push table down if consultation exists
                head: [['Diagnostic Check', 'Status']],
                body: answerRows as any[],
                theme: 'grid',
                headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3 },
                alternateRowStyles: { fillColor: [254, 242, 242] }
            });
        }
    }

    // --- 3. TECHNICAL DESIGN SECTION (Ostaje isto) ---
    if (designData) {
        doc.addPage();

        doc.setFillColor(8, 145, 178);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION B: TECHNICAL DESIGN', 14, 17);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Design Name: ${designData.design_name}`, 14, 40);
        doc.text(`Recommended Turbine: ${designData.recommended_turbine}`, 14, 48);

        const params = designData.parameters || {};
        autoTable(doc, {
            startY: 55,
            head: [['Input Parameter', 'Value']],
            body: [
                ['Net Head', `${params.head} m`],
                ['Flow Rate', `${params.flow} m³/s`],
                ['Efficiency', `${params.efficiency}%`],
                ['Flow Variation', params.flowVariation || 'Standard']
            ],
            theme: 'striped',
            headStyles: { fillColor: [8, 145, 178] },
            styles: { fontSize: 10 }
        });

        const calcs = designData.calculations || {};
        const finalY = (doc as any).lastAutoTable.finalY || 100;

        autoTable(doc, {
            startY: finalY + 15,
            head: [['Performance Metric', 'Calculated Result']],
            body: [
                ['Power Output', `${calcs.powerMW} MW`],
                ['Annual Generation', `${calcs.energyGWh || calcs.annualGWh} GWh`],
                ['Specific Speed (nq)', parseFloat(calcs.n_sq || 0).toFixed(2)],
            ],
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            columnStyles: { 1: { fontStyle: 'bold', textColor: [8, 145, 178] } }
        });
    }

    // Dodavanje broja stranice na sve stranice
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`AnoHUB Enterprise Platform | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    return doc;
};

// --- FUNKCIJA ZA KONVERTOVANJE DOC U BLOB ---
const docToBlob = (doc: jsPDF): Blob => doc.output('blob');


// --- AŽURIRANI EXPORTI: SVE VRAĆAJU BLOB (ili koriste createDossierDoc) ---

// 1. MASTER DOSSIER (Sastavlja Risk i Design)
export const createMasterDossierBlob = (
    assetName: string,
    riskData: any,
    designData: any,
    engineerName: string
): Blob => {
    const doc = createDossierDoc(assetName, riskData, designData, engineerName);
    return docToBlob(doc);
};

// 2. FINANCIAL REPORT (Investor Briefing)
export const createFinancialReportBlob = (assetName: string, kpis: any): Blob => {
    const doc = new jsPDF();

    // ... Logika za generisanje Financial Reporta (Ostaje skoro ista) ...
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Financial Prospectus', 14, 25);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Asset: ${assetName}`, 14, 50);

    autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Value']],
        body: [
            ['LCOE', kpis.lcoe],
            ['ROI (Annual)', kpis.roi],
            ['Total CAPEX', kpis.capex]
        ],
        theme: 'grid',
        headStyles: { fillColor: [88, 28, 135] }
    });
    // ... (Možeš dodati još detalja iz Investitor Briefinga ovdje) ...

    return docToBlob(doc);
};

// 3. CALCULATION REPORT (HPP Builder)
export const createCalculationReportBlob = (
    settings: any,
    results: any,
    recommendations: any[],
    assetName?: string
): Blob => {
    const doc = new jsPDF();
    const title = assetName ? `HPP Design: ${assetName}` : 'HPP Design Calculation';

    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    autoTable(doc, {
        startY: 35,
        head: [['Input Parameter', 'Value']],
        body: [
            ['Net Head', `${settings.head} m`],
            ['Flow Rate', `${settings.flow} m³/s`],
            ['Efficiency', `${settings.efficiency}%`]
        ],
        theme: 'striped'
    });

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Result', 'Value']],
        body: [
            ['Power Output', `${results.powerMW} MW`],
            ['Annual Energy', `${results.energyGWh || results.annualGWh} GWh`],
            ['Specific Speed (nq)', results.n_sq]
        ],
        theme: 'grid',
        headStyles: { fillColor: [6, 182, 212] }
    });

    const best = recommendations.find(r => r.isBest);
    if (best) {
        const yPos = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.setTextColor(22, 163, 74);
        doc.text(`Recommended Turbine: ${best.key.toUpperCase()}`, 14, yPos);
    }

    return docToBlob(doc);
};

// 4. RISK REPORT (Samo Risk, kao dio glavnog Dossiera)
export const createRiskReportBlob = (
    riskData: any,
    engineerName: string,
    assetName: string,
    notes?: string
): Blob => {
    if (notes) {
        riskData.description = notes;
    }
    // Koristimo istu helper funkciju, ali šaljemo null za designData
    const doc = createDossierDoc(assetName, riskData, null, engineerName);
    return docToBlob(doc);
};

// --- HELPER: Funkcija za otvaranje i preuzimanje (Frontend će je koristiti) ---
export const openAndDownloadBlob = (blob: Blob, filename: string, openPreview: boolean = true) => {
    const url = URL.createObjectURL(blob);

    if (openPreview) {
        // Otvara u novom tabu, što omogućava prirodni Preview/Print
        window.open(url);
    } else {
        // Samo skida (stara funkcionalnost)
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Oslobodi memoriju
    URL.revokeObjectURL(url);
};