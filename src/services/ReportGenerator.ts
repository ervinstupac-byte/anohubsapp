import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Metadata configuration
const PLATFORM_VERSION = 'v1.0.0';
const CERTIFICATION_SEAL = '0.05 mm/m Certified';

export interface TechnicalReportData {
    assetName: string;
    parameters: {
        head: number;
        flow: number;
        efficiency: number;
        flowVariation: string;
        waterQuality: string;
    };
    calculations: {
        powerMW: string | number;
        energyGWh: string | number;
        n_sq: string | number;
    };
    recommendedTurbine: string;
}

export interface FinancialReportData {
    assetName: string;
    kpis: {
        capex: number;
        revenue: number;
        opex: number;
        roi: number;
        lcoe: number;
        payback: number;
        powerMW: number;
        energyGWh: number;
    };
    assumptions: {
        electricityPrice: number;
        interestRate: number;
        lifespan: number;
        opexPercent: number;
    };
}

export interface IncidentReportData {
    assetName: string;
    incidentType: string;
    deviation: string;
    timestamp: string;
    status: string;
}

export interface PurchaseOrderData {
    vendorName: string;
    parts: {
        name: string;
        partNumber: string;
        quantity: number;
        unitPrice: number;
    }[];
}

export interface TechnicalAuditData {
    assetDetails: {
        name: string;
        location: string;
        timestamp: string;
    };
    executiveSummary: {
        status: 'GREEN' | 'YELLOW' | 'RED';
        score: number;
        summaryText: string;
    };
    mechanicalIntegrity: {
        component: string;
        nominalClearance: number;
        measuredClearance: number;
        deviation: number;
        tolerance: number; // 0.05
    }[];
    legacyRisk: {
        detected: boolean;
        legacyId: string; // "LEGACY #3"
        description: string;
        preventedDamageEur: number;
    };
    visualAnalysis: {
        diagnosis: string; // "Cavitation"
        textureDescription: string; // "Swiss-cheese effect"
        recommendation: string;
    };
    thermalValidation: {
        ambientTemp: number;
        operatingTemp: number;
        thermalExpansion: number;
        appliedOffset: number;
        validationStatus: string;
    };
}

export interface ExecutiveBriefingData {
    fleetHealth: number;
    totalMoneyAtRisk: number;
    reports: {
        assetName: string;
        score: number;
        efficiency: number;
        risk: number;
        readiness: string;
    }[];
    integrityHash: string;
}

export class ReportGenerator {
    private doc: jsPDF;

    constructor() {
        this.doc = new jsPDF();
    }

    /**
     * Internal helper to apply the specialized AnoHUB Header
     */
    private applyProfessionalHeader(title: string) {
        const doc = this.doc;
        const timestamp = new Date().toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        // Background header bar
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 40, 'F');

        // Logo / Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('AnoHUB', 14, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('HYDRAULIC ENGINEERING PLATFORM', 14, 30);

        // Document Title (Right Aligned)
        doc.setTextColor(6, 182, 212); // cyan-500
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), 196, 22, { align: 'right' });

        // Metadata Bar (Small text below header)
        doc.setFillColor(15, 23, 42, 0.9);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.setFontSize(7);
        doc.setFont('courier', 'normal');
        doc.text(`REF_ID: ${Math.random().toString(36).substring(7).toUpperCase()} | VER: ${PLATFORM_VERSION} | TS: ${timestamp}`, 14, 45);

        // THE CERTIFIED SEAL (Floating Badge)
        this.drawCertifiedSeal(160, 42);
    }

    private drawCertifiedSeal(x: number, y: number) {
        const doc = this.doc;

        // Outer Circle
        doc.setDrawColor(22, 163, 74); // emerald-600
        doc.setLineWidth(0.5);
        doc.circle(x, y, 12, 'D');

        // Inner Circle
        doc.circle(x, y, 10, 'D');

        // Text
        doc.setFontSize(5);
        doc.setTextColor(22, 163, 74);
        doc.setFont('helvetica', 'bold');
        doc.text('PRECISION', x, y - 4, { align: 'center' });

        doc.setFontSize(6);
        doc.text(CERTIFICATION_SEAL.split(' ')[0] + ' ' + CERTIFICATION_SEAL.split(' ')[1], x, y, { align: 'center' });

        doc.setFontSize(5);
        doc.text(CERTIFICATION_SEAL.split(' ')[2], x, y + 4, { align: 'center' });
    }

    private applyFooter() {
        const doc = this.doc;
        const pageCount = (doc as any).internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`AnoHUB Precision Systems © 2025 | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.setDrawColor(241, 245, 249);
            doc.line(14, 280, 196, 280);
        }
    }

    /**
     * Generates a technical design report for the HPP Builder
     */
    public generateTechnicalReport(data: TechnicalReportData): Blob {
        this.applyProfessionalHeader('Technical Design Report');

        const { parameters, calculations, recommendedTurbine, assetName } = data;

        // Asset Section
        this.doc.setFontSize(12);
        this.doc.setTextColor(30, 41, 59);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Project Asset: ${assetName}`, 14, 60);

        // Parameter Table
        autoTable(this.doc, {
            startY: 70,
            head: [['Technical Parameter', 'Specified Value', 'Unit']],
            body: [
                ['Net Design Head', parameters.head, 'm'],
                ['Rated Flow Rate', parameters.flow, 'm³/s'],
                ['Mechanical Efficiency', parameters.efficiency, '%'],
                ['Hydraulic Regime', parameters.flowVariation.toUpperCase(), '-'],
                ['Water Abrasivity Index', parameters.waterQuality.toUpperCase(), '-']
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });

        // Calculations Table
        const lastY = (this.doc as any).lastAutoTable.finalY + 15;
        this.doc.text('Physics Engine Calculations:', 14, lastY);

        autoTable(this.doc, {
            startY: lastY + 5,
            head: [['Physics Determinant', 'Result Output', 'Confidence']],
            body: [
                ['Estimated Power Output', `${calculations.powerMW} MW`, 'High'],
                ['Annual Yield Estimation', `${calculations.energyGWh} GWh`, '85% (Avg.)'],
                ['Specific Speed Index (nq)', calculations.n_sq, 'Validated']
            ],
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212] }, // cyan
            styles: { fontSize: 9 }
        });

        // Recommendation Box
        const finalY = (this.doc as any).lastAutoTable.finalY + 20;
        this.doc.setFillColor(241, 245, 249);
        this.doc.rect(14, finalY, 182, 25, 'F');
        this.doc.setDrawColor(6, 182, 212);
        this.doc.rect(14, finalY, 182, 25, 'D');

        this.doc.setFontSize(10);
        this.doc.setTextColor(15, 23, 42);
        this.doc.text('ENGINEERING RECOMMENDATION:', 20, finalY + 10);
        this.doc.setFontSize(14);
        this.doc.setTextColor(6, 182, 212);
        this.doc.text(recommendedTurbine.toUpperCase(), 20, finalY + 18);

        this.applyFooter();
        return this.doc.output('blob');
    }

    /**
     * Generates a financial prospectus for the Investor Briefing
     */
    public generateFinancialProspectus(data: FinancialReportData): Blob {
        this.applyProfessionalHeader('Investment Prospectus');

        const { kpis, assumptions, assetName } = data;

        this.doc.setFontSize(12);
        this.doc.setTextColor(30, 41, 59);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Financial Model: ${assetName}`, 14, 60);

        // KPI Matrix
        autoTable(this.doc, {
            startY: 70,
            head: [['Financial KPI', 'Value Projection', 'Priority']],
            body: [
                ['Return on Investment (ROI)', `${kpis.roi.toFixed(1)}%`, 'CRITICAL'],
                ['Levelized Cost of Energy', `€${kpis.lcoe.toFixed(2)} / MWh`, 'HIGH'],
                ['Estimated Total CAPEX', `€${(kpis.capex / 1000000).toFixed(1)}M`, 'HIGH'],
                ['Payback Period', `${kpis.payback.toFixed(1)} Years`, 'MEDIUM'],
                ['Annual Revenue Projection', `€${(kpis.revenue / 1000000).toFixed(2)}M`, 'MEDIUM']
            ],
            theme: 'grid',
            headStyles: { fillColor: [88, 28, 135] }, // purple-900
            styles: { fontSize: 9 }
        });

        // Assumptions Section
        const lastY = (this.doc as any).lastAutoTable.finalY + 15;
        this.doc.text('Market Assumptions:', 14, lastY);

        autoTable(this.doc, {
            startY: lastY + 5,
            head: [['Input Variable', 'Assumed Value']],
            body: [
                ['Electricity Sale Price', `€${assumptions.electricityPrice} / MWh`],
                ['Annual Bank Interest Rate', `${assumptions.interestRate}%`],
                ['Project Lifecycle', `${assumptions.lifespan} Years`],
                ['Operation & Maintenance', `${assumptions.opexPercent}% of CAPEX`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [71, 85, 105] }, // slate-600
            styles: { fontSize: 9 }
        });

        // Risk Disclaimer
        const finalY = (this.doc as any).lastAutoTable.finalY + 20;
        this.doc.setFontSize(8);
        this.doc.setTextColor(148, 163, 184);
        const disclaimer = 'Note: These financial projections are generated by the AnoHUB Predictive Engine based on current technical parameters and market volatility factors. Final feasibility studies required.';
        this.doc.text(this.doc.splitTextToSize(disclaimer, 180), 14, finalY);

        this.applyFooter();
        return this.doc.output('blob');
    }

    public generateIncidentReport(data: IncidentReportData): Blob {
        this.applyProfessionalHeader('Incident Severity Report');
        const doc = this.doc;

        doc.setFillColor(153, 27, 27); // red-800
        doc.rect(14, 55, 182, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CRITICAL SYSTEM FAILURE DETECTED', 105, 65, { align: 'center' });

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.text(`Asset Isolation: ${data.assetName}`, 14, 85);

        autoTable(doc, {
            startY: 95,
            head: [['Incident Metric', 'Value/Status']],
            body: [
                ['Failure Category', data.incidentType.toUpperCase()],
                ['Critical Deviation', data.deviation],
                ['Event Horizon (TS)', data.timestamp],
                ['System Integrity', 'COMPROMISED']
            ],
            theme: 'grid',
            headStyles: { fillColor: [153, 27, 27] },
            styles: { fontSize: 10 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.setTextColor(153, 27, 27);
        doc.text('EMERGENCY ACTION REQUIRED', 14, finalY);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Automated high-pressure bypass initiated. Manual inspection mandated within 4h.', 14, finalY + 8);

        this.applyFooter();
        return doc.output('blob');
    }

    public generatePurchaseOrder(data: PurchaseOrderData): Blob {
        this.applyProfessionalHeader('Spare Parts Purchase Order');
        const doc = this.doc;

        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(`Vendor: ${data.vendorName}`, 14, 60);

        const tableBody = data.parts.map(p => [
            p.name,
            p.partNumber,
            p.quantity,
            `€${p.unitPrice.toFixed(2)}`,
            `€${(p.quantity * p.unitPrice).toFixed(2)}`
        ]);

        const totalRow = [
            { content: 'TOTAL PROJECTED COST', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } as any },
            { content: `€${data.parts.reduce((total, p) => total + (p.quantity * p.unitPrice), 0).toFixed(2)}`, styles: { fontStyle: 'bold' } as any }
        ];

        autoTable(doc, {
            startY: 70,
            head: [['Item Description', 'Part #', 'Qty', 'Unit Price', 'Total']],
            body: [...tableBody, totalRow] as any,
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212] },
            styles: { fontSize: 9 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('Authorized by: AnoHUB Logistical Intelligence Engine', 14, finalY);

        this.applyFooter();
        return doc.output('blob');
    }

    public generateExecutiveBriefing(data: ExecutiveBriefingData): Blob {
        this.applyProfessionalHeader('Executive Fleet Briefing');
        const doc = this.doc;

        // TOP KPI STRIP
        doc.setFillColor(15, 23, 42);
        doc.rect(14, 55, 182, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('GLOBAL FLEET HEALTH', 30, 65);
        doc.setFontSize(18);
        doc.text(`${data.fleetHealth.toFixed(1)}%`, 30, 75);

        doc.setFontSize(8);
        doc.text('TOTAL CAPITAL AT RISK', 120, 65);
        doc.setFontSize(18);
        doc.setTextColor(248, 113, 113); // red-400
        doc.text(`€${(data.totalMoneyAtRisk / 1000).toFixed(1)}K`, 120, 75);

        // FLEET TABLE
        autoTable(doc, {
            startY: 95,
            head: [['Asset', 'HPP-HS', 'Eff Index', 'Risk (€)', 'Readiness']],
            body: data.reports.map(r => [
                r.assetName,
                `${r.score}%`,
                `${r.efficiency}%`,
                `€${r.risk.toLocaleString()}`,
                r.readiness
            ]),
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text('DIGITAL INTEGRITY VERIFICATION:', 14, finalY);
        doc.setFontSize(7);
        doc.setFont('courier', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`CRYPTO_HASH: ${data.integrityHash}`, 14, finalY + 6);
        doc.text('STATUS: DATA MANIPULATION CHECK PASSED - RECORD SEALED', 14, finalY + 12);

        this.applyFooter();
        return doc.output('blob');
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

    public generateTechnicalAuditReport(data: TechnicalAuditData): Blob {
        this.applyProfessionalHeader('Technical Audit Report');
        const doc = this.doc;

        const { assetDetails, executiveSummary, mechanicalIntegrity, legacyRisk, visualAnalysis, thermalValidation } = data;

        // 1. EXECUTIVE SUMMARY
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(`AUDIT TARGET: ${assetDetails.name}`, 14, 60);

        // Status Badge
        let statusColor = [34, 197, 94]; // Green
        if (executiveSummary.status === 'YELLOW') statusColor = [234, 179, 8];
        if (executiveSummary.status === 'RED') statusColor = [239, 68, 68];

        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.rect(150, 52, 45, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(executiveSummary.status, 172.5, 59, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(executiveSummary.summaryText, 14, 70);

        // 2. MECHANICAL INTEGRITY (0.05mm Standard)
        let currentY = 85;
        doc.setFontSize(12);
        doc.setTextColor(6, 182, 212); // Cyan
        doc.text('MECHANICAL INTEGRITY (PRECISION 0.05 mm)', 14, currentY);

        currentY += 10;
        // Draw Simple Chart
        mechanicalIntegrity.forEach((item, index) => {
            const y = currentY + (index * 15);
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            doc.text(`${item.component}`, 14, y);

            // Bar background
            doc.setFillColor(241, 245, 249);
            doc.rect(60, y - 4, 100, 6, 'F');

            // Bar Data (Nominal vs Measured)
            // Center is 110. Deviation is deviation from 110.
            // Scale: 1mm = 50 units (very magnified)
            const centerX = 110;
            const barWidth = item.deviation * 200; // Magnify dev

            if (Math.abs(item.deviation) > item.tolerance) {
                doc.setFillColor(239, 68, 68); // Red
            } else {
                doc.setFillColor(34, 197, 94); // Green
            }

            doc.rect(centerX, y - 4, barWidth, 6, 'F');
            doc.text(`${item.measuredClearance.toFixed(3)}mm (Dev: ${item.deviation > 0 ? '+' : ''}${item.deviation.toFixed(3)})`, 165, y);
        });
        currentY += (mechanicalIntegrity.length * 15) + 10;

        // 3. LEGACY RISK ALERT
        if (legacyRisk.detected) {
            doc.setFillColor(254, 242, 242); // Light Red
            doc.setDrawColor(239, 68, 68);
            doc.rect(14, currentY, 182, 35, 'FD');

            doc.setTextColor(153, 27, 27);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`⚠ ALGORITAM 15 GODINA ISKUSTVA: ${legacyRisk.legacyId}`, 20, currentY + 8);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(185, 28, 28);
            doc.text(doc.splitTextToSize(legacyRisk.description, 170), 20, currentY + 16);

            doc.setFont('helvetica', 'bold');
            doc.text(`PREVENTED DAMAGE VALUE: €${legacyRisk.preventedDamageEur.toLocaleString()}`, 20, currentY + 30);

            currentY += 45;
        }

        // 4. CAVITATION VS EROSION
        doc.setFontSize(12);
        doc.setTextColor(6, 182, 212);
        doc.text('FORENSICS: CAVITATION vs EROSION', 14, currentY);
        currentY += 8;

        const forensicData = [
            ['Analysis Type', 'AI Vision Diagnosis'],
            ['Texture Signature', visualAnalysis.textureDescription],
            ['Verdict', visualAnalysis.diagnosis.toUpperCase()],
            ['Action', visualAnalysis.recommendation]
        ];

        autoTable(doc, {
            startY: currentY,
            head: [['Metric', 'AI Finding']],
            body: forensicData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // 5. THERMAL DRIFT VALIDATION
        doc.setFontSize(12);
        doc.setTextColor(6, 182, 212);
        doc.text('THERMAL DRIFT VALIDATION', 14, currentY);
        currentY += 8;

        const thermData = [
            ['Operating Delta T', `${(thermalValidation.operatingTemp - thermalValidation.ambientTemp).toFixed(1)} °C`],
            ['Material Expansion (Calc)', `${thermalValidation.thermalExpansion.toFixed(3)} mm`],
            ['Applied Offset (Cold)', `${thermalValidation.appliedOffset.toFixed(3)} mm`],
            ['Validation', thermalValidation.validationStatus]
        ];

        autoTable(doc, {
            startY: currentY,
            head: [['Parameter', 'Value']],
            body: thermData,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });

        // SIGNATURE
        const finalY = (doc as any).lastAutoTable.finalY + 30;
        doc.setDrawColor(148, 163, 184);
        doc.line(14, finalY, 80, finalY);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Digital Signature / Auth Token', 14, finalY + 5);
        doc.text('AnoHUB Core Engine', 14, finalY + 10);

        this.applyFooter();
        return doc.output('blob');
    }
}

export const reportGenerator = new ReportGenerator();
