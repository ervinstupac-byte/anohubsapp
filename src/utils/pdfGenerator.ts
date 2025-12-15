import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { 
    HPPSettings, 
    CalculationResult, 
    TurbineRecommendation, 
    VerificationData 
} from '../types.ts';

// --- HELPER: FORMAT DATE ---
const formatDate = () => new Date().toLocaleDateString('en-GB');

// --- 1. DESIGN REPORT (HPP BUILDER) ---
export const generateCalculationReport = (
    settings: HPPSettings,
    results: CalculationResult,
    recommendations: TurbineRecommendation[],
    assetName?: string
) => {
    const doc = new jsPDF();

    // HEADER
    doc.setFillColor(6, 182, 212); // Cyan-500
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('HPP DESIGN STUDIO REPORT', 14, 13);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${formatDate()}`, 160, 13);

    // CONTEXT
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Asset Context: ${assetName || 'Unassigned Project'}`, 14, 30);

    // PARAMETERS TABLE
    autoTable(doc, {
        startY: 40,
        head: [['Parameter', 'Value', 'Unit']],
        body: [
            ['Net Head', settings.head, 'm'],
            ['Design Flow', settings.flow, 'm³/s'],
            ['Efficiency', settings.efficiency, '%'],
            ['Hydrology', settings.flowVariation, '-'],
            ['Water Type', settings.waterQuality, '-'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] } // Green
    });

    // RESULTS TABLE
    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Calculation Result', 'Value']],
        body: [
            ['Power Output', `${results.powerMW} MW`],
            ['Annual Generation', `${results.energyGWh} GWh`], // Ovdje koristimo energyGWh
            ['Specific Speed (nq)', results.n_sq],
        ],
        theme: 'striped',
        headStyles: { fillColor: [6, 182, 212] } // Cyan
    });

    // RECOMMENDATION
    const best = recommendations.find(r => r.isBest);
    if (best) {
        doc.setFontSize(14);
        doc.text('Optimal Turbine Selection', 14, (doc as any).lastAutoTable.finalY + 15);
        
        doc.setFontSize(12);
        doc.setTextColor(22, 163, 74); // Green
        doc.text(`RECOMMENDED: ${best.key.toUpperCase()} TURBINE`, 14, (doc as any).lastAutoTable.finalY + 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        best.reasons.forEach((reason, i) => {
            doc.text(reason, 14, (doc as any).lastAutoTable.finalY + 32 + (i * 5));
        });
    }

    doc.save(`HPP_Design_${new Date().getTime()}.pdf`);
};

// --- 2. VERIFICATION PROTOCOL (INSTALLATION GUARANTEE) ---
export const generateVerificationProtocol = (
    data: VerificationData, 
    checks: { id: string; label: string; passed: boolean }[] 
) => {
    const doc = new jsPDF();

    // HEADER
    doc.setFillColor(30, 41, 59); // Slate-900
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(6, 182, 212); // Cyan Text
    doc.setFontSize(14);
    doc.text('INSTALLATION GUARANTEE PROTOCOL', 14, 13);

    // META DATA
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Technician: ${data.technician}`, 14, 30);
    doc.text(`Date: ${data.date}`, 14, 35);
    doc.text(`Location: ${data.location}`, 14, 40);
    
    if (data.notes) {
        doc.text(`Notes: ${data.notes}`, 14, 45);
    }

    // CHECKS TABLE
    const rows = checks.map(c => [
        c.label,
        c.passed ? 'PASS' : 'FAIL'
    ]);

    autoTable(doc, {
        startY: 55,
        head: [['Checklist Item', 'Status']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 1) {
                const text = data.cell.raw;
                if (text === 'PASS') {
                    data.cell.styles.textColor = [0, 150, 0];
                } else {
                    data.cell.styles.textColor = [200, 0, 0];
                }
            }
        }
    });

    // SIGNATURE AREA
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text('_________________________', 14, finalY);
    doc.text('Digital Signature (Tokenized)', 14, finalY + 5);

    doc.save(`Installation_Audit_${data.date}.pdf`);
};

// --- 3. RISK REPORT (RISK ASSESSMENT) ---
export const generateRiskReport = (score: number, answers: Record<string, string>, description: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(220, 38, 38); // Red-600
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('EXECUTION GAP RISK ANALYSIS', 14, 13);

    // Score
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Calculated Risk Score: ${score}/100`, 14, 30);
    
    // Description
    if (description) {
        doc.text('Engineer Notes:', 14, 40);
        doc.setFontSize(10);
        // Split text to fit page width
        const splitDescription = doc.splitTextToSize(description, 180);
        doc.text(splitDescription, 14, 45);
    }

    // Answers Table
    const rows = Object.entries(answers).map(([key, value]) => [key, value]);
    
    // Calculate start Y based on description length
    let startY = 60;
    if (description) {
        startY = 60 + (doc.splitTextToSize(description, 180).length * 5);
    }

    autoTable(doc, {
        startY: startY,
        head: [['Question ID', 'Response']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] }
    });

    doc.save('Risk_Assessment_Report.pdf');
};

// --- 4. FINANCIAL REPORT (INVESTOR BRIEFING) ---
export const generateFinancialReport = (
    assetName: string, 
    kpis: { lcoe: string; roi: string; capex: string }
) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(147, 51, 234); // Purple-600
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('INVESTOR FINANCIAL BRIEFING', 14, 13);

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Asset: ${assetName}`, 14, 30);
    doc.text(`Generated: ${formatDate()}`, 14, 36);

    // KPI Table
    autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value']],
        body: [
            ['LCOE (Levelized Cost)', kpis.lcoe],
            ['ROI (Return on Investment)', kpis.roi],
            ['Total CAPEX', kpis.capex]
        ],
        theme: 'striped',
        headStyles: { fillColor: [147, 51, 234] }
    });

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('* Estimations based on parametric models. Not a binding offer.', 14, (doc as any).lastAutoTable.finalY + 10);

    doc.save('Investor_Briefing.pdf');
};