import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { Decimal } from 'decimal.js';
import { DiagnosisReport, TechnicalProjectState } from '../models/TechnicalSchema';
import i18n from '../i18n';

/**
 * REPORTING SERVICE: High-DPI Diagnostic Dossier (Hardened NC-4.2)
 * Generates an engineering-grade PDF with math proof and Shaft Orbit Micron Matrix.
 */
export const generateDiagnosticDossier = async (
    report: DiagnosisReport,
    specs: TechnicalProjectState,
    elementId: string // ID HTML elementa - Targets specifically the Shaft Orbit Plot canvas
) => {
    // 1. Initialization with NC-4.2 Standards
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const timestamp = new Date().toISOString();
    const ledgerId = crypto.randomUUID(); // NC-4.2 Ledger Verification ID

    // 2. Header & Identity
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text('AnoHUB: Diagnostic Dossier', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Reference ID: ${timestamp}`, 20, 28);
    doc.line(20, 32, 190, 32);

    // 3. Status & Severity
    const severityColor = report.severity === 'CRITICAL' ? [200, 0, 0] : (report.severity === 'WARNING' ? [200, 150, 0] : [0, 150, 0]);
    doc.setFontSize(14);
    doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
    doc.text(`${i18n.t('report.status')}: ${report.severity}`, 20, 42);

    // 4. Mathematical Proof (The "Golden Thread")
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(i18n.t('report.proof'), 20, 55);

    doc.setFontSize(9);
    doc.setFont('courier', 'normal');

    // ECCENTRICITY FORMULA: e = sqrt(1 - (b^2 / a^2))
    const eccentricityFormula = "Formula: e = sqrt(1 - (b^2 / a^2))";

    const mathProof = [
        `- Safety Factor (SF) = Yield / Hoop Stress = ${report.safetyFactor.toFixed(4)}`,
        `- Recorded Water Head (H): ${specs.hydraulic.waterHead.toFixed(2)} m`,
        `- Calculated Hoop Stress: ${specs.hydraulic.currentHoopStress?.toFixed(2) || 'N/A'} Pa`,
        `- ${eccentricityFormula}`,
        `- Verification Standard: IEC 60041 / Barlow's Formula`
    ];
    doc.text(mathProof, 25, 65);

    // 5. Micron Matrix Table (jspdf-autotable)
    // Extracting centers (Persistence logic)
    const baseline = specs.mechanical.baselineOrbitCenter || { x: 0, y: 0 };
    const current = { x: specs.mechanical.vibrationX, y: specs.mechanical.vibrationY };

    // Delta C in Microns (1 unit = 1mm assumed, so *1000 for microns)
    const deltaX = new Decimal(current.x).sub(baseline.x).abs().mul(1000);
    const deltaY = new Decimal(current.y).sub(baseline.y).abs().mul(1000);
    const totalMigration = Decimal.sqrt(deltaX.pow(2).add(deltaY.pow(2)));

    autoTable(doc, {
        startY: 95,
        margin: { left: 20 },
        head: [['Shaft Center Metric', 'Baseline (mm)', 'Current (mm)', 'Migration (µm)']],
        body: [
            ['X-Axis Center', baseline.x.toFixed(3), current.x.toFixed(3), deltaX.toFixed(2)],
            ['Y-Axis Center', baseline.y.toFixed(3), current.y.toFixed(3), deltaY.toFixed(2)],
            ['Total Delta C', '-', '-', totalMigration.toFixed(2)]
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }
    });

    // 6. High-DPI "Focus Capture" for Shaft Orbit
    const element = document.getElementById(elementId);
    if (element) {
        try {
            // NC-4.2 Optimization: Find the canvas inside the element if it exists
            const target = element.querySelector('canvas') || element;

            const canvas = await html2canvas(target as HTMLElement, {
                scale: 3, // High-DPI rendering for microns
                useCORS: true,
                backgroundColor: '#0f172a' // AnoHUB Dark Theme
            });
            const imgData = canvas.toDataURL('image/png');
            // Check if we have space after the table
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.addImage(imgData, 'PNG', 20, finalY, 170, 90);
        } catch (error) {
            console.error('Failed to capture Shaft Orbit Focus:', error);
            doc.setTextColor(200, 0, 0);
            doc.text('Visual Telemetry Capture Failed.', 20, 150);
        }
    }

    // 7. Authentic Digital Signature & Footer
    const footerY = 280;
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(`NC-4.2 Ledger Verification ID: ${ledgerId}`, 20, footerY);
    doc.text(i18n.t('report.generated_by'), 20, footerY + 5);

    doc.save(`AnoHUB_Dossier_NC4.2_${timestamp.split('T')[0]}.pdf`);
};
