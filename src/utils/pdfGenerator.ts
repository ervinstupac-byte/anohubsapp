import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- POMOĆNA FUNKCIJA: KREIRA PDF OBJEKT (Ne sprema ga, samo crta) ---
const createDossierDoc = (
    assetName: string,
    riskData: any,
    designData: any,
    engineerName: string
): jsPDF => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // --- 1. COVER PAGE ---
    // Background
    doc.setFillColor(15, 23, 42); // Slate-900 (Enterprise Dark)
    doc.rect(0, 0, 210, 297, 'F');
    
    // Branding
    doc.setTextColor(6, 182, 212); // Cyan-400
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('AnoHUB', 105, 100, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('ENTERPRISE PROJECT DOSSIER', 105, 115, { align: 'center' });

    // Decorative Line
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.5);
    doc.line(60, 125, 150, 125);

    // Meta Info
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`Target Asset: ${assetName}`, 105, 140, { align: 'center' });
    doc.text(`Engineer: ${engineerName}`, 105, 150, { align: 'center' });
    doc.text(`Generated: ${timestamp}`, 105, 160, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Confidential - Internal Use Only', 105, 280, { align: 'center' });

    // --- 2. RISK ASSESSMENT SECTION ---
    if (riskData) {
        doc.addPage();
        
        // Header Strip
        doc.setFillColor(220, 38, 38); // Red-600
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION A: RISK DIAGNOSTIC', 14, 17);

        // Summary Box
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Risk ID: ${riskData.id || 'N/A'}`, 14, 40);
        doc.text(`Risk Level: ${riskData.risk_level || 'Unknown'}`, 14, 48);
        doc.text(`Execution Gap Score: ${riskData.risk_score || 0}/100`, 14, 56);
        
        // Notes (Sada podržava i notes proslijeđen izvana)
        const notesText = riskData.description || '';
        if (notesText) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(100);
            const notes = doc.splitTextToSize(`Engineer Notes: ${notesText}`, 180);
            doc.text(notes, 14, 66);
        }

        // Table of Answers
        if (riskData.answers) {
            const answerRows = Object.entries(riskData.answers).map(([k, v]) => [k, v]);
            
            autoTable(doc, {
                startY: notesText ? 80 : 70,
                head: [['Diagnostic Check', 'Status']],
                body: answerRows,
                theme: 'grid',
                headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3 },
                alternateRowStyles: { fillColor: [254, 242, 242] } // Light red tint
            });
        }
    }

    // --- 3. TECHNICAL DESIGN SECTION ---
    if (designData) {
        doc.addPage();

        // Header Strip
        doc.setFillColor(8, 145, 178); // Cyan-600
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SECTION B: TECHNICAL DESIGN', 14, 17);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Design Name: ${designData.design_name}`, 14, 40);
        doc.text(`Recommended Turbine: ${designData.recommended_turbine}`, 14, 48);

        // Parameters Table
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

        // Calculation Results Table
        const calcs = designData.calculations || {};
        // Get the Y position where the previous table ended
        const finalY = (doc as any).lastAutoTable.finalY || 100;

        autoTable(doc, {
            startY: finalY + 15,
            head: [['Performance Metric', 'Calculated Result']],
            body: [
                ['Power Output', `${calcs.powerMW} MW`],
                ['Annual Generation', `${calcs.energyGWh || calcs.annualGWh} GWh`],
                ['Specific Speed (nq)', parseFloat(calcs.n_sq || 0).toFixed(2)],
                ['Rotational Speed (Est.)', `${Math.round(calcs.rpm || 0)} rpm`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] }, // Dark header
            columnStyles: { 1: { fontStyle: 'bold', textColor: [8, 145, 178] } }
        });
    }

    // --- FOOTER (Page Numbers) ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`AnoHUB Enterprise Platform | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    return doc;
};

// --- EXPORT 1: DOWNLOAD FUNKCIJA (Za korisnika - Lokalno) ---
export const generateMasterDossier = (
    assetName: string,
    riskData: any,
    designData: any,
    engineerName: string
) => {
    const doc = createDossierDoc(assetName, riskData, designData, engineerName);
    doc.save(`${assetName}_Master_Dossier.pdf`);
};

// --- EXPORT 2: BLOB FUNKCIJA (Za Cloud Upload) ---
export const generateMasterDossierBlob = (
    assetName: string,
    riskData: any,
    designData: any,
    engineerName: string
): Blob => {
    const doc = createDossierDoc(assetName, riskData, designData, engineerName);
    return doc.output('blob');
};

// --- EXPORT 3: FINANCIAL REPORT (Za Investor Briefing) ---
export const generateFinancialReport = (assetName: string, kpis: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Financial Prospectus', 14, 25);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Asset: ${assetName}`, 14, 50);
    
    // KPI Table
    autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Value']],
        body: [
            ['LCOE', kpis.lcoe],
            ['ROI (Annual)', kpis.roi],
            ['Total CAPEX', kpis.capex]
        ],
        theme: 'grid',
        headStyles: { fillColor: [88, 28, 135] } // Purple
    });
    
    doc.save(`${assetName}_Financial_Report.pdf`);
};

// --- EXPORT 4: CALCULATION REPORT (Za HPP Builder) ---
export const generateCalculationReport = (
    settings: any, 
    results: any, 
    recommendations: any[], 
    assetName?: string
) => {
    const doc = new jsPDF();
    const title = assetName ? `HPP Design: ${assetName}` : 'HPP Design Calculation';
    
    // Header
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    
    // Input Parameters
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
    
    // Results
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

    // Best Recommendation
    const best = recommendations.find(r => r.isBest);
    if (best) {
        const yPos = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.setTextColor(0, 150, 0);
        doc.text(`Recommended Turbine: ${best.key.toUpperCase()}`, 14, yPos);
    }
    
    doc.save('HPP_Design_Report.pdf');
};

// --- EXPORT 5: LEGACY SUPPORT (ZA QuestionnaireSummary) ---
// OVO JE ONO ŠTO JE TREBALO POPRAVITI:
// Dodan je treći argument 'notes?: string'
export const generateRiskReport = (
    riskData: any, 
    engineerName: string, 
    notes?: string
) => {
    // Ako je proslijeđen opis, dodaj ga u objekt
    if (notes) {
        riskData.description = notes;
    }

    const assetName = riskData.assetName || "Assessment";
    const doc = createDossierDoc(assetName, riskData, null, engineerName);
    doc.save(`Risk_Assessment_${new Date().toISOString().split('T')[0]}.pdf`);
};