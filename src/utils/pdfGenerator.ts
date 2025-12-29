import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Asset } from '../types';
import { LogEntry } from '../contexts/MaintenanceContext';

// --- SHARED UTILS ---

export const openAndDownloadBlob = (blob: Blob, filename: string, openPreview: boolean = false) => {
    const url = URL.createObjectURL(blob);
    if (openPreview) {
        window.open(url, '_blank');
    } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// --- NEW FEATURES (ASSET PASSPORT) ---

export const generateAssetPassport = (asset: Asset, logs: LogEntry[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header / Branding
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(34, 211, 238); // Cyan 400
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("AnoHUB", 20, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text("Engineering Dossier", 20, 30);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 20);
    doc.text(`ID: ${asset.id.substring(0, 8).toUpperCase()}`, pageWidth - 60, 30);

    // Section: ASSET IDENTITY
    let yPos = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Asset Identity", 20, yPos);

    doc.setDrawColor(15, 23, 42);
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const identityData = [
        ["Asset Name:", asset.name],
        ["Type:", `${asset.type} (${asset.turbine_type || 'Generic'})`],
        ["Location:", asset.location],
        ["Capacity:", `${asset.capacity} MW`],
        ["Status:", asset.status]
    ];

    identityData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 80, yPos);
        yPos += 10;
    });

    // Section: TECHNICAL SPECIFICATIONS (Polymorphic)
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Technical Specifications", 20, yPos);
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    if (asset.specs) {
        Object.entries(asset.specs).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            doc.setFont('helvetica', 'bold');
            doc.text(formattedKey + ":", 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value), 80, yPos);
            yPos += 10;
        });
    } else {
        doc.setTextColor(100, 100, 100);
        doc.text("No specific technical parameters recorded.", 20, yPos);
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Page 1 of 2", pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // PAGE 2: MAINTENANCE
    doc.addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("Maintenance History Log", 20, 15);

    yPos = 40;

    if (logs && logs.length > 0) {
        const tableData = logs.map(log => [
            new Date(log.timestamp).toLocaleDateString(),
            log.technician,
            log.summaryDE,
            log.measuredValue ? `${log.measuredValue}` : '-',
            log.pass ? 'PASS' : 'FAIL'
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Technician', 'Action / Summary', 'Value', 'Result']],
            body: tableData,
            headStyles: { fillColor: [15, 23, 42], textColor: [34, 211, 238] },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            styles: { fontSize: 10, cellPadding: 5 }
        });
    } else {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(12);
        doc.text("No maintenance history recorded for this asset.", 20, yPos);
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Page 2 of 2", pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    const safeName = asset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Asset_Passport_${safeName}.pdf`);
};

// --- RESTORED LEGACY FUNCTIONS (Best Effort Recreation) ---

export const createRiskReportBlob = (riskData: any, email: string, assetName: string, description?: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(220, 38, 38); // Red-600 logic for risk
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("EXECUTION GAP ANALYSIS RISK REPORT", 20, 13);

    // Meta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let y = 35;
    doc.text(`Asset: ${assetName}`, 20, y);
    doc.text(`Engineer: ${email}`, 20, y + 7);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y + 14);

    // Score
    y += 25;
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(`Risk Score: ${riskData.risk_score} / 100`, 20, y);
    doc.text(`Risk Level: ${riskData.risk_level}`, 20, y + 7);

    // Content
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Consultation / Expert Advice:", 20, y);
    y += 7;
    doc.setFontSize(10);

    const splitText = doc.splitTextToSize(riskData.consultation || "No consultation generated.", pageWidth - 40);
    doc.text(splitText, 20, y);

    y += (splitText.length * 5) + 10;

    doc.setFontSize(12);
    doc.text("Description / Notes:", 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(description || "No notes.", 20, y);

    return doc.output('blob');
};

export const createMasterDossierBlob = (assetName: string, riskData: any, designData: any, engineerEmail: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // COVER PAGE
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 297, 'F'); // A4 Full background

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.text("PROJECT MASTER DOSSIER", pageWidth / 2, 100, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(34, 211, 238);
    doc.text(assetName.toUpperCase(), pageWidth / 2, 120, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text(`Prepared by: ${engineerEmail}`, pageWidth / 2, 250, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 260, { align: 'center' });

    // PAGE 2: RISK SUMMARY
    if (riskData) {
        doc.addPage();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text("1. Risk Assessment Summary", 20, 20);

        doc.setFontSize(12);
        doc.text(`Risk Level: ${riskData.risk_level}`, 20, 40);
        doc.text(`Score: ${riskData.risk_score}`, 20, 50);

        doc.text("Consultation:", 20, 70);
        const splitCons = doc.splitTextToSize(riskData.consultation || "N/A", pageWidth - 40);
        doc.text(splitCons, 20, 80);
    }

    // PAGE 3: TECHNICAL DESIGN
    if (designData) {
        doc.addPage();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text("2. Technical Design Parameters", 20, 20);

        doc.setFontSize(12);
        doc.text(`Design Name: ${designData.design_name || 'N/A'}`, 20, 40);
        doc.text(`Turbine: ${designData.recommended_turbine || 'N/A'}`, 20, 50);

        if (designData.calculations) {
            doc.text(`Rated Power: ${designData.calculations.powerMW} MW`, 20, 70);
            doc.text(`Annual Generation: ${designData.calculations.energyGWh || designData.calculations.annualGWh} GWh`, 20, 80);
        }
    }

    return doc.output('blob');
};