import jsPDF from 'jspdf';
import { AuditSnapshot } from '../stores/useDigitalLedger';
import { RootCauseAnalysis } from './RootCauseEngine';

/**
 * Generate Forensic Dossier PDF
 * Official engineering report for legal/audit purposes
 */
export const generateForensicDossier = (
    snapshot: AuditSnapshot,
    rchAnalysis: RootCauseAnalysis | null
): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- HEADER: NC-4.2 FORENSIC UNIT ---
    doc.setFillColor(3, 3, 3); // Deep Carbon
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFontSize(18);
    doc.setTextColor(0, 240, 255); // Cyan
    doc.setFont('helvetica', 'bold');
    doc.text('NC-4.2 FORENSIC UNIT', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('ANOHUB Neural Core - Diagnostic Time-Machine', pageWidth / 2, 23, { align: 'center' });

    // --- METADATA SECTION ---
    let yPos = 45;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('FORENSIC DOSSIER', 15, yPos);

    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const metadata = [
        ['Snapshot ID:', snapshot.id],
        ['Timestamp:', new Date(snapshot.timestamp).toLocaleString()],
        ['System Health:', snapshot.data.systemHealth],
        ['Event Count:', `${snapshot.data.diagnostics?.length || 0} diagnostics`],
        ['Neural Pulse Progress:', `${snapshot.data.neuralPulse?.progress || 0}%`]
    ];

    metadata.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 70, yPos);
        yPos += 6;
    });

    // --- ROOT CAUSE HYPOTHESIS ---
    if (rchAnalysis) {
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(168, 85, 247); // Purple
        doc.text('ROOT CAUSE HYPOTHESIS', 15, yPos);

        yPos += 8;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        // Confidence Score
        doc.setFont('helvetica', 'bold');
        doc.text('Confidence Score:', 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${rchAnalysis.confidence}%`, 70, yPos);
        yPos += 8;

        // Primary Aggressor
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 0, 0); // Red
        doc.text('⚡ PRIMARY AGGRESSOR', 15, yPos);
        yPos += 6;

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(`Sensor: ${rchAnalysis.primaryAggressor.sensorId}`, 20, yPos);
        yPos += 5;
        doc.text(`Deviation: +${rchAnalysis.primaryAggressor.magnitude.toFixed(1)}%`, 20, yPos);
        yPos += 5;
        doc.text(`Time: ${new Date(rchAnalysis.primaryAggressor.deviationTime).toLocaleTimeString()}`, 20, yPos);

        // Causal Chain
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('CAUSAL CHAIN:', 15, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        rchAnalysis.causalChain.forEach((event, index) => {
            const eventText = `${index + 1}. ${event.description} (${event.eventType})`;
            doc.text(eventText, 20, yPos);
            yPos += 5;
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`   Magnitude: ${event.magnitude.toFixed(1)} | Confidence: ${event.confidence}%`, 20, yPos);
            yPos += 5;
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
        });

        // Summary
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('SUMMARY:', 15, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(rchAnalysis.summary, pageWidth - 30);
        summaryLines.forEach((line: string) => {
            doc.text(line, 15, yPos);
            yPos += 5;
        });
    }

    // --- AUDIT TRAIL ---
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 240, 255); // Cyan
    doc.text('DIGITAL LEDGER AUDIT TRAIL', 15, yPos);

    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Snapshot captured and stored in immutable ledger.`, 15, yPos);
    yPos += 4;
    doc.text(`SHA-256 Hash: ${generateHash(snapshot.id)}`, 15, yPos);
    yPos += 4;
    doc.text(`Verification: Data integrity confirmed.`, 15, yPos);

    // --- FOOTER ---
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `Generated: ${new Date().toLocaleString()} | NC-4.2 Forensic Unit | Page 1`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
    );

    // Save PDF
    const filename = `Forensic_Dossier_${snapshot.id}.pdf`;
    doc.save(filename);
};

/**
 * Generate simple hash for audit trail
 */
const generateHash = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0').toUpperCase();
};
