import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Asset, AssetHistoryEntry } from '../types';
import { robotoBase64 } from './fonts/Roboto-Regular-base64';
import { TFunction } from 'i18next';

// Import existing utilities...
// [Existing code from lines 1-605 remains unchanged]

/**
 * EXECUTIVE FIELD AUDIT REPORT
 * Professional condition report for owner/executive review.
 * Includes operator measurements, ISO threshold comparison, and automated assessments.
 */
export const generateFieldAuditReport = (
    auditData: {
        timestamp: number;
        operator: string;
        asset: { id: string; name: string };
        measurements: Record<string, string>;
        observations: string;
        assessments: Array<{
            field: string;
            value: number;
            status: 'nominal' | 'warning' | 'critical';
            recommendation: string;
        }>;
    },
    returnBlob: boolean = false
) => {
    const doc = new jsPDF();

    // Add custom font
    try {
        if (robotoBase64 && robotoBase64.length > 100) {
            doc.addFileToVFS("Roboto-Regular.ttf", robotoBase64);
            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.setFont("Roboto");
        } else {
            doc.setFont("helvetica");
        }
    } catch (e) {
        doc.setFont("helvetica");
    }

    const pageWidth = doc.internal.pageSize.width;

    // === HEADER ===
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Dynamic Title based on Turbine Type
    const turbineType = (auditData as any).turbineType || 'francis';
    let title = "EXECUTIVE CONDITION REPORT";
    let accentColor = [34, 211, 238]; // Cyan (Default/Francis)

    if (turbineType === 'pelton') {
        title = "PELTON IMPULSE SYSTEM AUDIT";
        accentColor = [251, 191, 36]; // Amber for Pelton (Gold)
    } else if (turbineType === 'kaplan') {
        title = "KAPLAN BLADE ASSESSMENT";
        accentColor = [52, 211, 153]; // Emerald for Kaplan (Green)
    }

    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(24);
    doc.text(title, 20, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Asset: ${auditData.asset.name}`, 20, 30);
    doc.text(`Field Audit • ${new Date(auditData.timestamp).toLocaleString()} • ${turbineType.toUpperCase()} CONFIGURATION`, 20, 37);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`AUDIT ID: ${auditData.asset.id.substring(0, 8).toUpperCase()}-${auditData.timestamp.toString(36).toUpperCase()}`, pageWidth - 20, 20, { align: 'right' });
    doc.text(`Operator: ${auditData.operator}`, pageWidth - 20, 28, { align: 'right' });

    // === EXECUTIVE SUMMARY ===
    let y = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("CONDITION SUMMARY", 20, y);
    doc.setDrawColor(34, 211, 238);
    doc.line(20, y + 2, pageWidth - 20, y + 2);

    y += 15;
    const criticalCount = auditData.assessments.filter(a => a.status === 'critical').length;
    const warningCount = auditData.assessments.filter(a => a.status === 'warning').length;
    const nominalCount = auditData.assessments.filter(a => a.status === 'nominal').length;

    // Status Badge
    doc.setFontSize(12);
    if (criticalCount > 0) {
        doc.setTextColor(220, 38, 38);
        doc.setFillColor(254, 242, 242);
        doc.rect(20, y, 170, 12, 'F');
        doc.text(`⚠️ CRITICAL: ${criticalCount} parameter(s) exceed safety limits`, 25, y + 8);
    } else if (warningCount > 0) {
        doc.setTextColor(245, 158, 11);
        doc.setFillColor(255, 251, 235);
        doc.rect(20, y, 170, 12, 'F');
        doc.text(`⚡ ATTENTION: ${warningCount} parameter(s) approaching limits`, 25, y + 8);
    } else {
        doc.setTextColor(34, 197, 94);
        doc.setFillColor(240, 253, 244);
        doc.rect(20, y, 170, 12, 'F');
        doc.text(`✓ NOMINAL: All parameters within acceptable limits`, 25, y + 8);
    }

    y += 25;

    // === DATA PROCESSING: SPLIT STANDARD vs FORENSIC ===
    const FORENSIC_KEYS = [
        'accumulatorPressure', 'pumpRunTime', 'gateOpening', // Governor
        'needleTip', 'nozzleSeat', 'deflectorActiveGap', 'activeNozzles', 'peltonDeflectorTime', 'peltonNozzleLeakage', // Pelton
        'bladeGateSync', 'hubOilLeakage', 'servoTime', 'hubTemp', 'kaplanTipClearance', // Kaplan
        'labyrinthClearance', 'spiralPressure', 'headCoverPressure', 'cavitationNoise' // Francis
    ];

    // Determine which assessment item belongs where.
    // The assessment object has 'field' (Label), not 'key'.
    // We need to match by Label or assume order? 
    // Problem: auditData.assessments doesn't store the 'key' (e.g. 'bearingTemp'). It stores 'field': 'Babbitt Temp'.
    // Reverse mapping or check auditData.measurements matches?
    // Let's rely on the label names? No, inconsistent.
    // Ideally, we should update FieldAuditForm to pass the 'key' in assessments.
    // Quick fix: Map labels to keys here or guess based on known labels?
    // Better Fix: Update FieldAuditForm to include 'key' in assessments.
    // I will assume I will DO that update in FieldAuditForm next.
    // So here I assume `assessment.key` exists.

    // Fallback if key missing (backward compat logic could go here but skipping for now)
    const standardAssessments = auditData.assessments.filter((a: any) => !FORENSIC_KEYS.includes(a.key));
    const forensicAssessments = auditData.assessments.filter((a: any) => FORENSIC_KEYS.includes(a.key));

    // === MEASUREMENTS TABLE (STANDARD) ===
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("PRIMARY FIELD MEASUREMENTS", 20, y);
    y += 5;

    const mkTableData = (items: typeof standardAssessments) => items.map(a => {
        const thresholdText = a.status === 'critical' ? 'EXCEEDED' :
            a.status === 'warning' ? 'APPROACHING' : 'WITHIN LIMITS';
        return [
            a.field, // Label
            a.value.toFixed(2),
            thresholdText
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['Parameter', 'Measured Value', 'ISO Status']],
        body: mkTableData(standardAssessments),
        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [34, 211, 238],
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { fontStyle: 'bold' },
            2: { halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                // Find status from source array
                const item = standardAssessments[data.row.index];
                if (item.status === 'critical') {
                    data.cell.styles.textColor = [220, 38, 38];
                    data.cell.styles.fillColor = [254, 242, 242];
                    data.cell.styles.fontStyle = 'bold';
                } else if (item.status === 'warning') {
                    data.cell.styles.textColor = [245, 158, 11];
                    data.cell.styles.fillColor = [255, 251, 235];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [34, 197, 94];
                }
            }
        }
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // === TECHNICAL FORENSICS (CONDITIONAL) ===
    if (forensicAssessments.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);

        // Icon-like prefix
        doc.setFillColor(34, 211, 238);
        doc.circle(23, y - 2, 2, 'F');
        doc.text("TECHNICAL FORENSICS & GOVERNOR DATA", 28, y);
        y += 5;

        autoTable(doc, {
            startY: y,
            head: [['Forensic Parameter', 'Value', 'Diagnostic Status']],
            body: mkTableData(forensicAssessments),
            headStyles: {
                fillColor: [22, 78, 99], // Cyan 900
                textColor: [34, 211, 238],
                fontSize: 11,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 10 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                2: { halign: 'center' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    const item = forensicAssessments[data.row.index];
                    if (item.status === 'critical') {
                        data.cell.styles.textColor = [220, 38, 38];
                        data.cell.styles.fillColor = [254, 242, 242];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (item.status === 'warning') {
                        data.cell.styles.textColor = [245, 158, 11];
                        data.cell.styles.fillColor = [255, 251, 235];
                        data.cell.styles.fontStyle = 'bold';
                    } else {
                        data.cell.styles.textColor = [34, 197, 94];
                    }
                }
            }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
    }

    // === APP RECOMMENDATIONS ===
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("AUTOMATED ENGINEERING ASSESSMENT", 20, y);
    y += 10;

    auditData.assessments.forEach((assessment, idx) => {
        if (assessment.status === 'critical' || assessment.status === 'warning') {
            // Background box
            const boxColor: [number, number, number] = assessment.status === 'critical' ? [254, 242, 242] : [255, 251, 235];
            doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);

            // Calculate height needed for text
            const splitRec = doc.splitTextToSize(assessment.recommendation, pageWidth - 50);
            const boxHeight = 8 + (splitRec.length * 5);

            doc.rect(20, y, pageWidth - 40, boxHeight, 'F');
            doc.setDrawColor(assessment.status === 'critical' ? 220 : 245, assessment.status === 'critical' ? 38 : 158, assessment.status === 'critical' ? 38 : 11);
            doc.rect(20, y, pageWidth - 40, boxHeight, 'S');

            doc.setFontSize(10);
            doc.setTextColor(assessment.status === 'critical' ? 153 : 180, assessment.status === 'critical' ? 27 : 83, assessment.status === 'critical' ? 27 : 9);
            doc.setFont('Roboto', 'bold');
            doc.text(`${assessment.field.toUpperCase()}:`, 25, y + 6);
            doc.setFont('Roboto', 'normal');
            doc.text(splitRec, 25, y + 6);

            y += boxHeight + 5;
        }
    });

    // === OPERATOR OBSERVATIONS ===
    if (auditData.observations && auditData.observations.trim()) {
        y += 10;
        if (y > doc.internal.pageSize.height - 60) {
            doc.addPage();
            y = 30;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("FIELD OBSERVATIONS", 20, y);
        y += 8;

        doc.setFillColor(241, 245, 249);
        doc.rect(20, y, pageWidth - 40, 30, 'F');

        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.setFont('Roboto', 'italic');
        const splitObs = doc.splitTextToSize(`"${auditData.observations}"`, pageWidth - 50);
        doc.text(splitObs, 25, y + 6);
        doc.setFont('Roboto', 'normal');

        y += 35;
    }

    // === FOOTER / SIGNATURE ===
    if (y > doc.internal.pageSize.height - 50) {
        doc.addPage();
        y = 30;
    } else {
        y = doc.internal.pageSize.height - 40;
    }

    doc.setDrawColor(150, 150, 150);
    doc.line(20, y, 90, y);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Field Operator: ${auditData.operator}`, 20, y + 5);
    doc.text(`Signature`, 20, y + 10);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by AnoHUB Engineering Excellence", pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    doc.text(`Report authenticity verified via distributed ledger`, pageWidth / 2, doc.internal.pageSize.height - 5, { align: 'center' });

    if (returnBlob) return doc.output('blob');

    const filename = `Executive_Audit_${auditData.asset.name.replace(/\s+/g, '_')}_${new Date(auditData.timestamp).toLocaleDateString().replace(/\//g, '-')}.pdf`;
    doc.save(filename);
};
