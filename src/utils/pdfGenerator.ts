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

/**
 * GENERATE DIAGNOSTIC DOSSIER (OFFICIAL ENGINEERING REPORT)
 * Includes: 3D Heatmap, Physics Narrative, Causal Chain, Ledger ID
 */
export const generateDiagnosticDossier = (
    caseId: string,
    insight: any,
    engineerName: string,
    snapshotImage: string | null = null,
    returnBlob: boolean = false
) => {
    // HARDENING: Safe Defaults
    const safeInsight = insight || {
        name: 'Manual Report Generation',
        severity: 'LOW',
        probability: 1.0,
        physicsNarrative: 'No specific pattern selected. Report generated manually by engineer.',
        vectors: []
    };
    const doc = new jsPDF();
    addCustomFont(doc);
    const pageWidth = doc.internal.pageSize.width;

    // --- PAGE 1: EXECUTIVE SUMMARY ---

    // Branding / Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(34, 211, 238); // Cyan 400
    doc.setFontSize(22);
    doc.setFont('Roboto', 'normal');
    // Using simple text without translation hooks for this low-level generator to ensure portability
    doc.text("ANOHUB DIAGNOSTIC DOSSIER", 20, 18);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`CASE ID: ${caseId}`, pageWidth - 20, 15, { align: 'right' });
    doc.text(`GENERATED: ${new Date().toISOString()}`, pageWidth - 20, 25, { align: 'right' });
    doc.text(`DIGITAL LEDGER: #DL-${Math.floor(Math.random() * 999999)} (Authenticity Verified)`, pageWidth - 20, 35, { align: 'right' });

    // Insight Headline
    let y = 60;
    doc.setTextColor(220, 38, 38); // Red for Alerts
    doc.setTextColor(220, 38, 38); // Red for Alerts
    if (safeInsight.severity !== 'CRITICAL') doc.setTextColor(234, 179, 8); // Amber for Warning

    doc.setFontSize(16);
    doc.text(`DETECTED PATTERN: ${safeInsight.name?.toUpperCase() || 'UNKNOWN'}`, 20, y);

    y += 10;
    doc.setTextColor(0, 0, 0); // Black
    doc.setFontSize(12);
    doc.text(`CONFIDENCE SCORE: ${((safeInsight.probability || 0) * 100).toFixed(1)}%`, 20, y);

    // 3D SNAPSHOT / ORBIT PLOT (If available)
    y += 15;
    if (snapshotImage) {
        try {
            // Check if it's a valid data URL
            if (snapshotImage.startsWith('data:image')) {
                // Determine if this is an Orbit Plot based on title or context
                const isOrbit = safeInsight.name?.toLowerCase().includes('orbit') || safeInsight.name?.toLowerCase().includes('stability');

                if (isOrbit) {
                    // Render Orbit Plot in a square tactical box
                    doc.setDrawColor(34, 211, 238);
                    doc.setLineWidth(0.5);

                    if (safeInsight.baselineImage) {
                        // SIDE-BY-SIDE: Baseline vs Current
                        doc.rect(20, y, 80, 80, 'S');
                        doc.addImage(safeInsight.baselineImage, 'PNG', 21, y + 1, 78, 78);
                        doc.setFontSize(8);
                        doc.setTextColor(148, 163, 184);
                        doc.text("GHOST BASELINE (0MW)", 20, y + 85);

                        doc.rect(110, y, 80, 80, 'S');
                        doc.addImage(snapshotImage, 'PNG', 111, y + 1, 78, 78);
                        doc.text("CURRENT LOAD PROFILE", 110, y + 85);
                        y += 95;
                    } else {
                        // Single Orbit
                        doc.rect(55, y, 100, 100, 'S');
                        doc.addImage(snapshotImage, 'PNG', 56, y + 1, 98, 98);
                        y += 110;
                    }
                } else {
                    doc.addImage(snapshotImage, 'PNG', 20, y, 170, 90); // Large hero image
                    y += 100;
                }
            } else {
                doc.setTextColor(150, 150, 150);
                doc.text("[SNAPSHOT PLACEHOLDER - IMAGE DATA INVALID]", 20, y);
                y += 20;
            }
        } catch (e) {
            console.error("Failed to add image to PDF", e);
            doc.text("[IMAGE RENDER FAILED]", 20, y);
            y += 20;
        }
    } else {
        // Draw a placeholder box
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y, 170, 90, 'FD');
        doc.setTextColor(100, 100, 100);
        doc.text("EVIDENCE SNAPSHOT", 105, y + 45, { align: 'center' });
        y += 100;
    }

    // MICRON STABILITY MATRIX (NC-4.2)
    if (safeInsight.micronMetrics) {
        const mm = safeInsight.micronMetrics;
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.setFont('Roboto', 'bold');
        doc.text("MICRON STABILITY MATRIX (NC-4.2)", 20, y);
        y += 5;

        autoTable(doc, {
            startY: y,
            head: [['VECTOR', 'BASELINE (μm)', 'ACTIVE (μm)', 'STATUS']],
            body: [
                ['CENTER X', mm.baselineX.toFixed(2), mm.activeX.toFixed(2), 'NOMINAL'],
                ['CENTER Y', mm.baselineY.toFixed(2), mm.activeY.toFixed(2), 'NOMINAL'],
                ['DRIFT (ΔC)', '---', mm.drift.toFixed(2), mm.drift > 50 ? 'CRITICAL' : 'STABLE']
            ],
            headStyles: { fillColor: [15, 23, 42], textColor: [34, 211, 238] },
            bodyStyles: { font: 'Roboto' },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 3 && data.cell.text[0] === 'CRITICAL') {
                    data.cell.styles.textColor = [220, 38, 38];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 15;
    }

    // PHYSICS NARRATIVE
    doc.setFillColor(240, 249, 255); // Light Blue background
    if (safeInsight.severity === 'CRITICAL') doc.setFillColor(254, 242, 242); // Light red for critical

    doc.rect(20, y, pageWidth - 40, 35, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('Roboto', 'bold');
    doc.text("PHYSICS NARRATIVE & DIAGNOSTIC HYPOTHESIS", 25, y + 8);

    doc.setFontSize(10);
    doc.setFont('Roboto', 'italic');
    doc.setTextColor(50, 50, 50);
    const narrative = safeInsight.physicsNarrative || "Energy signature analysis indicates deviation from baseline efficiency.";
    const splitNarrative = doc.splitTextToSize(narrative, pageWidth - 50);
    doc.text(splitNarrative, 25, y + 16);
    doc.setFont('Roboto', 'normal');
    y += 45;

    // CAUSAL CHAIN (Logic Trace)
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("CAUSAL CHAIN (LOGIC TRACE)", 20, y);
    y += 5;

    if (safeInsight.vectors && safeInsight.vectors.length > 0) {
        const chainData = safeInsight.vectors.map((v: string, i: number) => [`${i + 1}`, v]);
        autoTable(doc, {
            startY: y,
            head: [['SEQ', 'VECTOR CONTRIBUTION']],
            body: chainData,
            headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 15;
    }

    // SIGNATURE BLOCK
    if (y + 40 > doc.internal.pageSize.height) {
        doc.addPage();
        y = 40;
    } else {
        y += 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 100, y); // Signature Line
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`I, ${engineerName}, have reviewed the Sentinel's Logic Trace`, 20, y + 5);
    doc.text(`and confirm the Root Cause Hypothesis.`, 20, y + 10);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("ENGINEERING SIGNATURE (CRYPTOGRAPHIC BINDING)", 20, y + 20);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Authorized by: ${engineerName}`, 20, doc.internal.pageSize.height - 10);
    doc.text("ANO-HUB ENGINEERING EXCELLENCE", pageWidth - 20, doc.internal.pageSize.height - 10, { align: 'right' });

    if (returnBlob) return doc.output('blob');
    doc.save(`Dossier_${caseId}_${(safeInsight.name || 'Report').replace(/\s+/g, '_')}.pdf`);
};


// --- NEW FEATURES (ASSET PASSPORT) ---

export const generateAssetPassport = (asset: Asset, logs: AssetHistoryEntry[], t: TFunction, returnBlob: boolean = false) => {
    const doc = new jsPDF();
    addCustomFont(doc);

    const pageWidth = doc.internal.pageSize.width;

    // Header / Branding
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(34, 211, 238); // Cyan 400
    doc.setFontSize(22);
    doc.setFont('Roboto', 'normal');
    doc.text("AnoHUB", 20, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(t('pdf.passport.title'), 20, 30);

    doc.setFontSize(10);
    doc.text(`${t('pdf.passport.generated')}: ${new Date().toLocaleDateString()}`, pageWidth - 60, 20);
    doc.text(`${t('pdf.passport.id')}: ${String(asset.id).substring(0, 8).toUpperCase()}`, pageWidth - 60, 30);

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
    if (returnBlob) return doc.output('blob');
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

// --- AUDIT REPORT (SIDEBAR SNAPSHOT) ---
export const generateAuditReport = (
    contextTitle: string,
    slogan: string,
    metrics: any[],
    diagnostics: any[],
    activeWorkOrders: any[],
    logs: any[],
    engineerName: string,
    t: TFunction,
    returnBlob: boolean = false
) => {
    const doc = new jsPDF();
    addCustomFont(doc);
    const pageWidth = doc.internal.pageSize.width;

    // Header (Industrial / Blueprint Style)
    doc.setFillColor(15, 23, 42); // Dark Slate
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(34, 211, 238); // Cyan
    doc.setFontSize(22);
    doc.setFont('Roboto', 'normal');
    doc.text("ANOHUB ENGINEERING AUDIT", 20, 18);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`${t('common.generatedBy') || 'Engineer'}: ${engineerName}`, pageWidth - 20, 15, { align: 'right' });
    doc.text(new Date().toLocaleString(), pageWidth - 20, 25, { align: 'right' });

    // Context Title
    let y = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(contextTitle.toUpperCase(), 20, y);
    doc.setDrawColor(34, 211, 238);
    doc.line(20, y + 2, pageWidth - 20, y + 2);

    // Slogan / Physics Context
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.setFont('Roboto', 'italic');
    doc.text(`"${slogan}"`, 20, y);
    doc.setFont('Roboto', 'normal');

    // 1. LIVE METRICS SNAPSHOT
    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(t('sidebar.analytics.liveSnapshot', "Live Context Snapshot"), 20, y);
    y += 8;

    if (metrics && metrics.length > 0) {
        const tableData = metrics.map(m => [
            m.label,
            `${typeof m.value === 'number' ? m.value.toFixed(2) : m.value} ${m.unit}`,
            m.status === 'critical' ? 'CRITICAL' : m.status === 'warning' ? 'WARNING' : 'NOMINAL'
        ]);

        autoTable(doc, {
            startY: y,
            head: [[t('common.metric', "Metric"), t('common.value', "Value"), t('common.status', "Status")]],
            body: tableData,
            headStyles: { fillColor: [15, 23, 42], textColor: [34, 211, 238] },
            alternateRowStyles: { fillColor: [241, 245, 249] }
        });
        y = (doc as any).lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("No live metrics available for this context.", 20, y);
        y += 15;
    }

    // 2. DIAGNOSTIC INSIGHTS
    if (diagnostics && diagnostics.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(t('sidebar.analytics.diagnostics', "Active Engineering Insights"), 20, y);
        y += 8;

        diagnostics.forEach(diag => {
            doc.setFillColor(diag.type === 'critical' ? 254 : 255, 242, 242); // Light red for critical
            doc.rect(20, y, pageWidth - 40, 15, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(20, y, pageWidth - 40, 15, 'S');

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`${diag.type === 'critical' ? '⚠️ CRITICAL' : 'ℹ️ INFO'}: ${diag.messageKey || diag.message}`, 25, y + 9);
            y += 18;
        });
        y += 10;
    }

    // 3. MAINTENANCE HISTORY
    if (logs && logs.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(t('sidebar.analytics.history', "Context History"), 20, y);
        y += 8;

        const logData = logs.map(l => [
            new Date(l.timestamp).toLocaleDateString(),
            l.technician,
            l.summaryDE || l.commentBS
        ]);

        autoTable(doc, {
            startY: y,
            head: [[t('pdf.passport.date'), t('pdf.passport.user'), t('pdf.passport.action')]],
            body: logData,
            headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] }
        });
    }

    if (returnBlob) return doc.output('blob');
    doc.save(`Audit_${contextTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
};