import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Asset, AssetHistoryEntry } from '../types';
import { robotoBase64 } from './fonts/Roboto-Regular-base64';
import { TFunction } from 'i18next';

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

const addCustomFont = (doc: jsPDF) => {
    try {
        if (robotoBase64 && robotoBase64.length > 100) {
            doc.addFileToVFS("Roboto-Regular.ttf", robotoBase64);
            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.setFont("Roboto");
        } else {
            console.warn("Roboto Base64 string is empty or invalid. Falling back to Helvetica.");
            doc.setFont("helvetica");
        }
    } catch (e) {
        console.error("Error adding custom font:", e);
        doc.setFont("helvetica");
    }
};

// --- NEW FEATURES (ASSET PASSPORT) ---

export const generateAssetPassport = (asset: Asset, logs: AssetHistoryEntry[], t: TFunction) => {
    const doc = new jsPDF();
    addCustomFont(doc);

    const pageWidth = doc.internal.pageSize.width;

    // Header / Branding
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(34, 211, 238); // Cyan 400
    doc.setFontSize(22);
    // Use bold if available or simulated, but Roboto regular is loaded as 'normal'
    // To support bold, we would need Roboto-Bold.ttf. For now, we stick to normal or rely on framework
    // If we only loaded Regular, setFont('Roboto', 'bold') might fail or default to normal.
    // Let's stick to 'Roboto', 'normal' for safety unless we have bold.
    doc.setFont('Roboto', 'normal');
    doc.text("AnoHUB", 20, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(t('pdf.passport.title'), 20, 30);

    doc.setFontSize(10);
    doc.text(`${t('pdf.passport.generated')}: ${new Date().toLocaleDateString()}`, pageWidth - 60, 20);
    doc.text(`${t('pdf.passport.id')}: ${asset.id.substring(0, 8).toUpperCase()}`, pageWidth - 60, 30);

    // Section: ASSET IDENTITY
    let yPos = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(t('pdf.passport.assetIdentity'), 20, yPos);

    doc.setDrawColor(15, 23, 42);
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

    yPos += 15;
    doc.setFontSize(12);

    const identityData = [
        [`${t('pdf.passport.assetName')}:`, asset.name],
        [`${t('pdf.passport.type')}:`, `${asset.type} (${asset.turbine_type || 'Generic'})`],
        [`${t('pdf.passport.location')}:`, asset.location],
        [`${t('pdf.passport.capacity')}:`, `${asset.capacity} MW`],
        [`${t('pdf.passport.status')}:`, asset.status]
    ];

    identityData.forEach(([label, value]) => {
        // doc.setFont('Roboto', 'bold'); // We only have regular
        doc.text(String(label), 20, yPos);
        doc.text(String(value), 80, yPos);
        yPos += 10;
    });

    // Section: TECHNICAL SPECIFICATIONS
    yPos += 10;
    doc.setFontSize(16);
    doc.text(t('pdf.passport.technicalSpecs'), 20, yPos);
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

    yPos += 15;
    doc.setFontSize(12);

    if (asset.specs) {
        Object.entries(asset.specs).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            doc.text(formattedKey + ":", 20, yPos);
            doc.text(String(value), 80, yPos);
            yPos += 10;
        });
    } else {
        doc.setTextColor(100, 100, 100);
        doc.text(t('pdf.passport.noSpecs'), 20, yPos);
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`${t('pdf.passport.page')} 1 of 2`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // PAGE 2: MAINTENANCE
    doc.addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(t('pdf.passport.maintenanceLog'), 20, 15);

    yPos = 40;

    if (logs && logs.length > 0) {
        const tableData = logs.map(log => [
            new Date(log.date).toLocaleDateString() + ' ' + new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            log.category,
            log.message,
            log.author
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [[t('pdf.passport.date'), t('pdf.passport.category'), t('pdf.passport.action'), t('pdf.passport.user')]],
            body: tableData,
            headStyles: { fillColor: [15, 23, 42], textColor: [34, 211, 238], font: 'Roboto' },
            bodyStyles: { font: 'Roboto' },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            styles: { fontSize: 10, cellPadding: 5 }
        });
    } else {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(12);
        doc.text(t('pdf.passport.noMaintenance'), 20, yPos);
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`${t('pdf.passport.page')} 2 of 2`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    const safeName = asset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Asset_Passport_${safeName}.pdf`);
};

// --- RESTORED LEGACY FUNCTIONS (Best Effort Recreation with i18n) ---

export const createRiskReportBlob = (riskData: any, email: string, assetName: string, t: TFunction, description?: string) => {
    const doc = new jsPDF();
    addCustomFont(doc);
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(220, 38, 38); // Red-600 logic for risk
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    // Assuming we might add title to i18n later, for now using hardcoded or t() if available
    doc.text(t('questionnaire.title') + " - RISK ANALYSIS", 20, 13);

    // Meta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let y = 35;
    doc.text(`${t('contractManagement.pdf.asset')} ${assetName}`, 20, y);
    doc.text(`Engineer: ${email}`, 20, y + 7);
    doc.text(`${t('contractManagement.pdf.date')} ${new Date().toLocaleDateString()}`, 20, y + 14);

    // Score
    y += 25;
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(`${t('common.riskLevel')}: ${riskData.risk_score} / 100`, 20, y);
    doc.text(`${t('common.riskLevel')}: ${riskData.risk_level}`, 20, y + 7);

    // Content
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(t('questionnaire.overallAssessment') + ":", 20, y);
    y += 7;
    doc.setFontSize(10);

    const splitText = doc.splitTextToSize(riskData.consultation || t('questionnaire.noDataAvailable'), pageWidth - 40);
    doc.text(splitText, 20, y);

    y += (splitText.length * 5) + 10;

    doc.setFontSize(12);
    doc.text(t('questionnaire.warnings') + ":", 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(description || t('questionnaire.noDataAvailable'), 20, y);

    return doc.output('blob');
};

export const createMasterDossierBlob = (assetName: string, riskData: any, designData: any, engineerEmail: string, t: TFunction) => {
    const doc = new jsPDF();
    addCustomFont(doc);
    const pageWidth = doc.internal.pageSize.width;

    // COVER PAGE
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 297, 'F'); // A4 Full background

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.text(t('modules.riskReport').toUpperCase(), pageWidth / 2, 100, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(34, 211, 238);
    doc.text(assetName.toUpperCase(), pageWidth / 2, 120, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text(`Prepared by: ${engineerEmail}`, pageWidth / 2, 250, { align: 'center' });
    doc.text(`${t('contractManagement.pdf.date')} ${new Date().toLocaleDateString()}`, pageWidth / 2, 260, { align: 'center' });

    // PAGE 2: RISK SUMMARY
    if (riskData) {
        doc.addPage();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text("1. " + t('modules.riskAssessment'), 20, 20);

        doc.setFontSize(12);
        doc.text(`${t('common.riskLevel')}: ${riskData.risk_level}`, 20, 40);
        doc.text(`Score: ${riskData.risk_score}`, 20, 50);

        doc.text(t('questionnaire.overallAssessment') + ":", 20, 70);
        const splitCons = doc.splitTextToSize(riskData.consultation || "N/A", pageWidth - 40);
        doc.text(splitCons, 20, 80);
    }

    // PAGE 3: TECHNICAL DESIGN
    if (designData) {
        doc.addPage();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text("2. " + t('assetWizard.steps.specs'), 20, 20);

        doc.setFontSize(12);
        doc.text(`${t('hppStudio.labels.configName')}: ${designData.design_name || 'N/A'}`, 20, 40);
        doc.text(`${t('hppStudio.steps.selection')}: ${designData.recommended_turbine || 'N/A'}`, 20, 50);

        if (designData.calculations) {
            doc.text(`${t('hppStudio.labels.calculatedCapacity')}: ${designData.calculations.powerMW} MW`, 20, 70);
            doc.text(`${t('modules.fleetOutput')}: ${designData.calculations.energyGWh || designData.calculations.annualGWh} GWh`, 20, 80);
        }
    }

    return doc.output('blob');
};