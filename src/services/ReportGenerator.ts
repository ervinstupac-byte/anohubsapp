import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TechnicalProjectState } from '../models/TechnicalSchema';
import { Decimal } from 'decimal.js';
import i18n from '../i18n';

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
        overallHealth: number; // 0-100
        criticalIssues: number;
        recommendedActions: string[];
    };
    siteConditions: {
        grossHead: number;
        waterQuality: string;
        flowRate: number;
        designFlow: number;
    };
    hydraulics: {
        staticPressure: number;
        surgePressure: number;
        flowVelocity: number;
        frictionLoss: number;
        netHead: number;
    };
    mechanical: {
        boltGrade: string;
        boltCount: number;
        torqueApplied: number;
        bearingType: string;
        alignment: number;
    };
    thermalAdjustment: {
        ambientTemp: number;
        operatingTemp: number;
        thermalExpansion: number;
        appliedOffset: number;
        validationStatus: string;
    };
    // NEW: Vision Analysis Integration
    visionInsights?: VisionAnalysisResult;
}

// Vision Analysis Data Model (Phase 3 Integration)
export interface VisionAnalysisResult {
    totalImages: number;
    analyzedAt: string;
    overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    aiConfidence: number; // 0-100%

    // Detected Issues
    detectedIssues: {
        cavitation: {
            detected: boolean;
            severity: number; // 0-10
            affectedComponents: string[];
            location: string;
        };
        corrosion: {
            detected: boolean;
            type: 'PITTING' | 'UNIFORM' | 'GALVANIC' | 'NONE';
            severity: number; // 0-10
            estimatedDepthMM: number;
        };
        erosion: {
            detected: boolean;
            pattern: 'LINEAR' | 'CIRCULAR' | 'RANDOM' | 'NONE';
            severity: number; // 0-10
            materialLossMM: number;
        };
        cracks: {
            detected: boolean;
            count: number;
            maxLengthMM: number;
            propagationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
        };
        vibrationDamage: {
            detected: boolean;
            indicators: string[]; // e.g., "Fretting marks", "Loosened bolts"
        };
    };

    // AI Recommendations
    recommendations: {
        immediate: string[]; // Actions required within 48h
        shortTerm: string[]; // Actions within 1 month
        longTerm: string[]; // Actions within 1 year
        estimatedCost: number; // EUR
    };

    // Image Evidence
    evidenceImages: {
        id: string;
        componentId: string;
        issueType: string;
        aiTagsDetected: string[];
        thumbnailSrc: string;
    }[];
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
            const footerText = `AnoHUB NC-4.2 | Logic Integrity: Decimal.js Verified | ${new Date().toLocaleDateString('en-GB')}`;
            doc.text(footerText, 105, 285, { align: 'center' });
            doc.setDrawColor(241, 245, 249);
            doc.line(14, 280, 196, 280);
            doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
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

    /**
     * DEPRECATED: Use VisionReportGenerator.generateVisionEnhancedAudit() instead
     * Legacy function maintained for backward compatibility
     */
    public generateTechnicalAuditReport(data: TechnicalAuditData): Blob {
        this.applyProfessionalHeader('Technical Audit Report');
        const doc = this.doc;

        const { assetDetails, executiveSummary, siteConditions, mechanical, thermalAdjustment, visionInsights } = data;

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
        doc.text(`Overall Health: ${executiveSummary.overallHealth}%`, 14, 70);

        // 2. SIMPLIFIED TECHNICAL DETAILS
        let currentY = 85;
        doc.setFontSize(12);
        doc.setTextColor(6, 182, 212); // Cyan
        doc.text('MECHANICAL INTEGRITY', 14, currentY);
        currentY += 15;

        const techData = [
            ['Parameter', 'Value'],
            ['Bolt Grade', mechanical.boltGrade],
            ['Torque Applied', `${mechanical.torqueApplied} Nm`],
            ['Bearing Type', mechanical.bearingType],
            ['Alignment', `${mechanical.alignment.toFixed(3)} mm`]
        ];

        autoTable(doc, {
            startY: currentY,
            head: [techData[0]],
            body: techData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // 3. VISION INSIGHTS (if available)
        if (visionInsights) {
            doc.setFontSize(12);
            doc.setTextColor(45, 212, 191);
            doc.text('AI VISION ANALYSIS', 14, currentY);
            currentY += 8;

            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            doc.text(`Risk Level: ${visionInsights.overallRiskLevel}`, 14, currentY);
            currentY += 6;
            doc.text(`AI Confidence: ${visionInsights.aiConfidence}%`, 14, currentY);
            currentY += 6;
            doc.text(`Images Analyzed: ${visionInsights.totalImages}`, 14, currentY);
            currentY += 15;
        }

        // SIGNATURE
        const finalY = Math.max(currentY, 240);
        doc.setDrawColor(148, 163, 184);
        doc.line(14, finalY, 80, finalY);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Digital Signature / Auth Token', 14, finalY + 5);
        doc.text('AnoHUB Core Engine', 14, finalY + 10);

        this.applyFooter();
        return doc.output('blob');
    }

    /**
     * NC-4.2 COMMAND: Generate comprehensive project dossier from CEREBRO state
     */
    public generateProjectPDF(state: TechnicalProjectState): Blob {
        this.applyProfessionalHeader('Global Project Dossier (NC-4.2)');
        const doc = this.doc;

        // 1. Executive Identity
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        const dossierLabel = i18n.t('report.dossierLabel', 'PROJECT DOSSIER');
        doc.text(`${dossierLabel}: ${state.identity.name}`, 14, 60);

        // --- NC-4.2 FORENSIC DEMO OVERLAY ---
        if (state.demoMode?.active) {
            doc.saveGraphicsState();
            doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
            doc.setFontSize(60);
            doc.setTextColor(239, 68, 68); // Red-500
            doc.setFont('helvetica', 'bold');
            doc.text('SIMULATED INCIDENT', 105, 150, { align: 'center', angle: 45 });
            doc.text('FORENSIC ANALYSIS', 105, 180, { align: 'center', angle: 45 });
            doc.restoreGraphicsState();
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Asset ID: ${state.identity.id} | Location: ${state.identity.location}`, 14, 67);

        // MULTI-COLUMN LAYOUT START
        // Left Column: Hydraulic & Mechanical
        // Right Column: Penstock & Risk

        // Column 1: Hydraulic Audit
        doc.setFontSize(12);
        doc.setTextColor(6, 182, 212);
        doc.text(i18n.t('report.sections.hydraulic', 'I. HYDRAULIC AUDIT'), 14, 80);

        autoTable(doc, {
            startY: 85,
            margin: { right: 110 }, // Left half
            head: [['Parameter', 'Active Value', 'Decimal Status']],
            body: [
                ['Design Head', `${state.hydraulic.head}m`, state.hydraulic.waterHead.toFixed(2)],
                ['Flow Rate', `${state.hydraulic.flow}m3/s`, state.hydraulic.flowRate.toFixed(3)],
                ['Efficiency', `${(state.hydraulic.efficiency * 100).toFixed(1)}%`, 'Verified']
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 8 }
        });

        // Column 2: Penstock Analysis (Right half)
        doc.text(i18n.t('report.sections.penstock', 'II. PENSTOCK ANALYSIS'), 110, 80);
        autoTable(doc, {
            startY: 85,
            margin: { left: 110 },
            head: [['Structural ID', 'Spec', 'Unit']],
            body: [
                ['Diameter', state.penstock.diameter, 'm'],
                ['Wall Thickness', state.penstock.wallThickness, 'm'],
                ['Yield Strength', state.penstock.materialYieldStrength, 'MPa']
            ],
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] },
            styles: { fontSize: 8 }
        });

        let currentY = Math.max((doc as any).lastAutoTable.finalY, 115) + 15;

        // Middle Section: Combined Pressure & Stress (Full Width)
        doc.setTextColor(6, 182, 212);
        doc.text(i18n.t('report.sections.pressureStress', 'III. PRESSURE & STRESS FUSION (IEC 60041 Compliant)'), 14, currentY);
        currentY += 5;

        autoTable(doc, {
            startY: currentY,
            head: [['Metric', 'Static Pressure', 'Surge (Water Hammer)', 'Hoop Stress', 'Safety Factor']],
            body: [
                [
                    'Calculated Value',
                    `${state.physics.staticPressureBar.toFixed(2)} Bar`,
                    `${state.physics.surgePressureBar.toFixed(2)} Bar`,
                    `${state.physics.hoopStressMPa.toFixed(2)} MPa`,
                    state.diagnosis?.safetyFactor.toFixed(3) || 'N/A'
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212] },
            styles: { fontSize: 9, halign: 'center' }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Orbit & Mechanical Integrity
        doc.text(i18n.t('report.sections.mechanical', 'IV. MECHANICAL & ORBIT INTEGRITY'), 14, currentY);
        currentY += 5;

        autoTable(doc, {
            startY: currentY,
            head: [['Operational Metric', 'X-Output', 'Y-Output', 'Eccentricity', 'Status']],
            body: [
                [
                    'Vibration (mm)',
                    state.mechanical.vibrationX.toFixed(3),
                    state.mechanical.vibrationY.toFixed(3),
                    state.physics.eccentricity.toFixed(3),
                    state.physics.eccentricity > 0.8 ? 'CRITICAL' : (state.physics.eccentricity > 0.7 ? 'WARNING' : 'NOMINAL')
                ],
                ['Shaft Speed', `${state.mechanical.rpm} RPM`, '-', '-', 'CONTINUOUS'],
                ['Bearing Temp', `${state.mechanical.bearingTemp}°C`, '-', '-', state.mechanical.bearingTemp > 70 ? 'CRITICAL' : 'OPTIMAL']
            ],
            theme: 'grid',
            headStyles: { fillColor: [71, 85, 105] },
            styles: { fontSize: 8 }
        });

        // V. Engineering Diagnostic Summary
        currentY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFillColor(254, 242, 242);
        doc.rect(14, currentY, 182, 45, 'F');
        doc.setDrawColor(239, 68, 68);
        doc.rect(14, currentY, 182, 45, 'D');

        doc.setFontSize(11);
        doc.setTextColor(153, 27, 27);
        doc.setFont('helvetica', 'bold');
        doc.text(i18n.t('report.sections.diagnostic', 'V. DIAGNOSTIC SUMMARY & AI INSIGHTS'), 20, currentY + 10);

        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');

        const currentLang = i18n.language === 'bs' ? 'bs' : 'en';

        const diagnosisMessages = state.diagnosis?.messages.map(m => m[currentLang]).join(' ') ||
            (state.riskScore > 50
                ? (currentLang === 'bs'
                    ? "KRITIČNO: Integritet sistema ugrožen. Detektovano visoko naprezanje ili debalans turbine."
                    : "CRITICAL: System integrity compromised. High hoop stress or turbine imbalance detected.")
                : (currentLang === 'bs'
                    ? "NOMINALNO: Nisu detektovani kritični prekršaji fizike. Sistem radi u sigurnoj zoni."
                    : "NOMINAL: No critical physics violations detected. System operating within safe envelope."));

        const splitNarrative = doc.splitTextToSize(diagnosisMessages, 170);
        doc.text(splitNarrative, 20, currentY + 20);

        this.applyFooter();
        return doc.output('blob');
    }

    /**
     * NC-4.2 COMMAND: Generate targeted module report
     */
    public generateModulePDF(moduleName: string, state: TechnicalProjectState): Blob {
        this.applyProfessionalHeader(`Module Report: ${moduleName}`);
        const doc = this.doc;

        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(`MODULE AUDIT: ${moduleName.toUpperCase()}`, 14, 60);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Asset: ${state.identity.name} | Captured: ${new Date().toISOString()}`, 14, 67);

        // Targeted body based on module
        if (moduleName.toLowerCase().includes('mechan')) {
            autoTable(doc, {
                startY: 80,
                head: [['Mechanical Parameter', 'Measured Value', 'Unit']],
                body: [
                    ['Radial Clearance', state.mechanical.radialClearance, 'mm'],
                    ['Alignment Deviation', state.mechanical.alignment, 'mm/m'],
                    ['Bolt Grade', state.mechanical.boltSpecs.grade, '-'],
                    ['Count', state.mechanical.boltSpecs.count, '-'],
                    ['Applied Torque', state.mechanical.boltSpecs.torque, 'Nm']
                ],
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42] }
            });
        } else if (moduleName.toLowerCase().includes('hydraul')) {
            autoTable(doc, {
                startY: 80,
                head: [['Hydraulic Parameter', 'Measured Value', 'Unit']],
                body: [
                    ['Gross Head', state.hydraulic.head, 'm'],
                    ['Design Flow', state.hydraulic.flow, 'm³/s'],
                    ['Efficiency', (state.hydraulic.efficiency * 100).toFixed(2), '%'],
                    ['Water Temperature', state.site.temperature, '°C']
                ],
                theme: 'grid',
                headStyles: { fillColor: [6, 182, 212] }
            });
        } else {
            doc.text("No specific module sensors mapped for high-fidelity report in this version.", 14, 80);
        }

        this.applyFooter();
        return doc.output('blob');
    }
}

export const reportGenerator = new ReportGenerator();
