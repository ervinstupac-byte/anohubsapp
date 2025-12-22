import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TechnicalAuditData, VisionAnalysisResult } from './ReportGenerator';

/**
 * Vision Enhanced Report Generator (Phase 3)
 * Generates PDF reports with integrated AI Vision Analysis
 */

export class VisionReportGenerator {
    private doc: jsPDF;

    constructor() {
        this.doc = new jsPDF();
    }

    /**
     * Generate comprehensive audit report with Vision insights
     */
    public generateVisionEnhancedAudit(data: TechnicalAuditData): Blob {
        const { assetDetails, executiveSummary, visionInsights, siteConditions, hydraulics, mechanical } = data;

        // Page 1: Executive Summary with AI Risk Assessment
        this.drawHeader(assetDetails.name);
        this.drawExecutiveSummary(executiveSummary, visionInsights);

        // Page 2: Vision Analysis Details (if available)
        if (visionInsights) {
            this.doc.addPage();
            this.drawHeader(assetDetails.name);
            this.drawVisionAnalysisSection(visionInsights);
        }

        // Page 3: Technical Parameters
        this.doc.addPage();
        this.drawHeader(assetDetails.name);
        this.drawTechnicalDetails(siteConditions, hydraulics, mechanical);

        this.applyFooter();
        return this.doc.output('blob');
    }

    private drawHeader(assetName: string) {
        const doc = this.doc;

        // Header bar
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('AnoHUB', 14, 18);

        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('AI-POWERED VISION AUDIT', 14, 25);

        doc.setTextColor(45, 212, 191);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(assetName.toUpperCase(), 196, 20, { align: 'right' });

        // Certification seal
        doc.setDrawColor(45, 212, 191);
        doc.setLineWidth(1);
        doc.circle(185, 28, 8, 'D');
        doc.setFontSize(6);
        doc.text('AI', 185, 29, { align: 'center' });
    }

    private drawExecutiveSummary(
        summary: TechnicalAuditData['executiveSummary'],
        vision: VisionAnalysisResult | undefined
    ) {
        const doc = this.doc;
        let y = 50;

        // Status Banner
        const statusColors = {
            'GREEN': [34, 197, 94],
            'YELLOW': [234, 179, 8],
            'RED': [239, 68, 68]
        };
        const color = statusColors[summary.status];

        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(14, y, 182, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`STATUS: ${summary.status}`, 105, y + 10, { align: 'center' });

        y += 25;

        // Health Score
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('Overall Health Score:', 14, y);
        doc.setFontSize(24);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(`${summary.overallHealth}%`, 80, y);

        // Critical Issues Count
        if (summary.criticalIssues > 0) {
            doc.setFontSize(12);
            doc.setTextColor(239, 68, 68);
            doc.text(`🚨 ${summary.criticalIssues} Critical Issue(s)`, 140, y);
        }

        y += 15;

        // Vision AI Confidence (if available)
        if (vision) {
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`AI Analysis Confidence: ${vision.aiConfidence}%`, 14, y);
            doc.text(`Risk Level: ${vision.overallRiskLevel}`, 120, y);
            y += 10;
        }

        y += 5;

        // Recommended Actions
        if (summary.recommendedActions.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(239, 68, 68);
            doc.setFont('helvetica', 'bold');
            doc.text('⚠️ IMMEDIATE ACTIONS REQUIRED:', 14, y);
            y += 8;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);

            summary.recommendedActions.forEach((action, i) => {
                const lines = doc.splitTextToSize(`${i + 1}. ${action}`, 180);
                doc.text(lines, 14, y);
                y += lines.length * 5;
            });
        }
    }

    private drawVisionAnalysisSection(vision: VisionAnalysisResult) {
        const doc = this.doc;
        let y = 50;

        doc.setFontSize(14);
        doc.setTextColor(45, 212, 191);
        doc.setFont('helvetica', 'bold');
        doc.text('🔍 AI VISION ANALYSIS RESULTS', 14, y);
        y += 10;

        // Detected Issues Summary
        const { detectedIssues } = vision;

        const issuesData = [
            ['Issue Type', 'Detected', 'Severity', 'Details'],
            [
                'Cavitation',
                detectedIssues.cavitation.detected ? '✓ YES' : '✗ NO',
                `${detectedIssues.cavitation.severity}/10`,
                detectedIssues.cavitation.affectedComponents.join(', ') || 'None'
            ],
            [
                'Corrosion',
                detectedIssues.corrosion.detected ? '✓ YES' : '✗ NO',
                `${detectedIssues.corrosion.severity}/10`,
                `Type: ${detectedIssues.corrosion.type}, Depth: ${detectedIssues.corrosion.estimatedDepthMM}mm`
            ],
            [
                'Erosion',
                detectedIssues.erosion.detected ? '✓ YES' : '✗ NO',
                `${detectedIssues.erosion.severity}/10`,
                `Pattern: ${detectedIssues.erosion.pattern}, Loss: ${detectedIssues.erosion.materialLossMM}mm`
            ],
            [
                'Structural Cracks',
                detectedIssues.cracks.detected ? '✓ YES' : '✗ NO',
                detectedIssues.cracks.propagationRisk,
                `Count: ${detectedIssues.cracks.count}, Max Length: ${detectedIssues.cracks.maxLengthMM}mm`
            ]
        ];

        autoTable(doc, {
            startY: y,
            head: [issuesData[0]],
            body: issuesData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [45, 212, 191], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 25 },
                2: { cellWidth: 25 },
                3: { cellWidth: 90 }
            }
        });

        y = (doc as any).lastAutoTable.finalY + 15;

        // Recommendations Section
        doc.setFontSize(12);
        doc.setTextColor(45, 212, 191);
        doc.text('AI RECOMMENDATIONS', 14, y);
        y += 8;

        // Immediate (48h)
        if (vision.recommendations.immediate.length > 0) {
            doc.setFillColor(254, 242, 242);
            doc.rect(14, y, 182, 5 + vision.recommendations.immediate.length * 5, 'F');

            doc.setFontSize(10);
            doc.setTextColor(153, 27, 27);
            doc.setFont('helvetica', 'bold');
            doc.text('⚠️ IMMEDIATE (< 48 hours):', 18, y + 4);
            y += 8;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            vision.recommendations.immediate.forEach(rec => {
                const lines = doc.splitTextToSize(`• ${rec}`, 170);
                doc.text(lines, 18, y);
                y += lines.length * 4;
            });
            y += 5;
        }

        // Short-term (1 month)
        if (vision.recommendations.shortTerm.length > 0) {
            doc.setFillColor(254, 249, 195);
            doc.rect(14, y, 182, 5 + vision.recommendations.shortTerm.length * 5, 'F');

            doc.setFontSize(10);
            doc.setTextColor(146, 64, 14);
            doc.setFont('helvetica', 'bold');
            doc.text('📋 SHORT-TERM (< 1 month):', 18, y + 4);
            y += 8;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            vision.recommendations.shortTerm.forEach(rec => {
                const lines = doc.splitTextToSize(`• ${rec}`, 170);
                doc.text(lines, 18, y);
                y += lines.length * 4;
            });
            y += 5;
        }

        // Cost Estimate
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('ESTIMATED INTERVENTION COST:', 14, y);
        doc.setFontSize(16);
        doc.setTextColor(239, 68, 68);
        doc.text(`€${vision.recommendations.estimatedCost.toLocaleString('de-DE')}`, 100, y);
    }

    private drawTechnicalDetails(
        site: TechnicalAuditData['siteConditions'],
        hydraulics: TechnicalAuditData['hydraulics'],
        mechanical: TechnicalAuditData['mechanical']
    ) {
        const doc = this.doc;
        let y = 50;

        doc.setFontSize(14);
        doc.setTextColor(45, 212, 191);
        doc.text('TECHNICAL PARAMETERS', 14, y);
        y += 10;

        const technicalData = [
            ['Category', 'Parameter', 'Value', 'Unit'],
            ['Site', 'Gross Head', site.grossHead.toFixed(1), 'm'],
            ['Site', 'Design Flow', site.designFlow.toFixed(2), 'm³/s'],
            ['Site', 'Water Quality', site.waterQuality, '-'],
            ['Hydraulics', 'Static Pressure', hydraulics.staticPressure.toFixed(1), 'bar'],
            ['Hydraulics', 'Surge Pressure', hydraulics.surgePressure.toFixed(1), 'bar'],
            ['Hydraulics', 'Flow Velocity', hydraulics.flowVelocity.toFixed(2), 'm/s'],
            ['Hydraulics', 'Net Head', hydraulics.netHead.toFixed(1), 'm'],
            ['Mechanical', 'Bolt Grade ISO', mechanical.boltGrade, '-'],
            ['Mechanical', 'Bolt Count', mechanical.boltCount.toString(), 'pcs'],
            ['Mechanical', 'Torque Applied', mechanical.torqueApplied.toString(), 'Nm'],
            ['Mechanical', 'Bearing Type', mechanical.bearingType, '-'],
            ['Mechanical', 'Radial Clearance', mechanical.alignment.toFixed(3), 'mm']
        ];

        autoTable(doc, {
            startY: y,
            head: [technicalData[0]],
            body: technicalData.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });
    }

    private applyFooter() {
        const doc = this.doc;
        const pageCount = (doc as any).internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
                `AnoHUB Vision Analysis © 2025 | Generated: ${new Date().toLocaleDateString('de-DE')} | Page ${i} of ${pageCount}`,
                105,
                285,
                { align: 'center' }
            );
            doc.setDrawColor(241, 245, 249);
            doc.line(14, 280, 196, 280);
        }
    }

    public downloadReport(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export const visionReportGenerator = new VisionReportGenerator();
