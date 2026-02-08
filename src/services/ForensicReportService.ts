import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoBase64 } from '../utils/fonts/Roboto-Regular-base64';
import { generateSignature as signMeasurement } from './ForensicSignatureService';
import ForensicTemplateEngine from './ForensicTemplateEngine';
import { buildAnomalyRows } from './ForensicDataAggregator';
import { UnifiedDiagnosis } from './MasterIntelligenceEngine';
import { TechnicalProjectState } from '../core/TechnicalSchema';
import { Asset, AssetHistoryEntry } from '../types';
import { TFunction } from 'i18next';
import { supabase } from './supabaseClient';

/**
 * SCADA-GRADE FORENSIC REPORTING SERVICE
 * Powered by CEREBRO AI
 * 
 * This service consolidates all AnoHUB reporting logic.
 */
export class ForensicReportService {

    /**
     * Generate SHA-256 digital signature for measurement
     */
    public static async generateSignature(
        measurement: {
            parameterId: string;
            value: number;
            measuredAt: string;
        },
        engineerName: string,
        engineerLicense: string
    ): Promise<string> {
        return await signMeasurement(measurement, engineerName, engineerLicense);
    }

    public static async generateDossierChecksum(payload: unknown): Promise<string> {
        const json = JSON.stringify(payload);
        const encoder = new TextEncoder();
        const data = encoder.encode(json);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private static addCustomFont(doc: jsPDF) {
        ForensicTemplateEngine.addCustomFont(doc as any, robotoBase64 as any);
    }

    private static applyCerebroBranding(doc: jsPDF, title: string) {
        ForensicTemplateEngine.applyCerebroBranding(doc as any, title);
    }

    private static applyForensicFooter(doc: jsPDF) {
        ForensicTemplateEngine.applyForensicFooter(doc as any);
    }

    private static addVerifiedAnomaliesSection(doc: jsPDF, y: number, projectState: TechnicalProjectState, diagnosis: UnifiedDiagnosis): number {
        const anomalyData = buildAnomalyRows(projectState as any, diagnosis as any);
        if (!anomalyData || anomalyData.length === 0) return y;
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(14);
        doc.setTextColor(220, 38, 38);
        try { doc.setFont("Roboto", "bold"); } catch (e) { }
        doc.text("VERIFIED ANOMALIES (INVESTIGATION LOG)", 15, y);
        y += 8;
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.5);
        doc.line(15, y, pageWidth - 15, y);
        y += 10;

        const finalY = ForensicTemplateEngine.renderEvidenceTable(doc as any, y, ['Target Component', 'Expert Finding', 'Investigation Status'], anomalyData as any[]);
        return finalY + 15;
    }

    /**
     * UNIFIED FORENSIC DOSSIER
     * The master report generated from the Executive Dashboard.
     */
    public static async generateForensicDossier(params: {
        asset: Asset;
        diagnosis: UnifiedDiagnosis;
        projectState: TechnicalProjectState;
        threeRef?: string; // dataURL captured by UI
        t: TFunction;
        onProgress?: (pct: number, note?: string) => void;
    }): Promise<Blob> {
        const { asset, diagnosis, projectState, threeRef, t, onProgress } = params as any;

        return await new Promise<Blob>((resolve, reject) => {
            try {
                const worker = new (window as any).Worker(new URL('../workers/forensicPdf.worker.ts', import.meta.url), { type: 'module' });
                const timeout = setTimeout(() => { /* noop */ }, 0);
                worker.postMessage({ action: 'generate', payload: { asset, diagnosis, projectState, threeRef } });
                worker.onmessage = (ev: MessageEvent) => {
                    const m = ev.data;
                    if (!m) return;
                    if (m.type === 'progress') {
                        try { if (onProgress) onProgress(m.pct, m.note); } catch (e) { }
                    } else if (m.type === 'done') {
                        try { clearTimeout(timeout); worker.terminate(); resolve(m.blob); } catch (e) { reject(e); }
                    } else if (m.type === 'error') {
                        try {
                            // best-effort telemetry log for worker internal errors
                            (async () => {
                                try {
                                    await supabase.from('telemetry_samples').insert([{ kind: 'worker_error', component: 'forensicPdfWorker', message: String(m.error || 'worker error'), created_at: new Date().toISOString() }]);
                                } catch (e) { /* ignore telemetry write failures */ }
                            })();
                        } catch (e) { }
                        clearTimeout(timeout); worker.terminate(); reject(new Error(m.error || 'worker error'));
                    }
                };
                worker.onerror = (err: ErrorEvent) => {
                    try {
                        // record worker onerror to telemetry_samples
                        (async () => {
                            try {
                                await supabase.from('telemetry_samples').insert([{ kind: 'worker_onerror', component: 'forensicPdfWorker', message: String(err.message || err.filename || 'worker onerror'), created_at: new Date().toISOString() }]);
                            } catch (e) { /* ignore */ }
                        })();
                    } catch (e) { }
                    clearTimeout(timeout); worker.terminate(); reject(err);
                };
            } catch (e) { reject(e); }
        });
    }

    /**
     * HPP CONFIGURATION SPECIFICATION
     * Exported from the HPPBuilder.
     */
    public static generateHPPSpecification(params: {
        asset: Asset;
        projectState: TechnicalProjectState;
        t: TFunction;
    }): Blob {
        const { asset, projectState, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);
        const pageWidth = doc.internal.pageSize.width;

        this.applyCerebroBranding(doc, "Technical Specification");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("TURBINE DESIGN SPECIFICATION", 15, y);

        y += 10;
        const specs = [
            ['Turbine Topology', projectState.identity.turbineType, 'Design Context'],
            ['Rated Head', `${projectState.hydraulic.head} m`, 'Hydrology'],
            ['Rated Flow', `${projectState.hydraulic.flow} m³/s`, 'Hydrology'],
            ['Calculated Efficiency', `${projectState.hydraulic.efficiency}%`, 'V-Engine 1.0'],
            ['Anticipated Power', `${projectState.hydraulic.baselineOutputMW?.toFixed(2) || '0.00'} MW`, 'Physics Core']
        ];

        autoTable(doc, {
            startY: y,
            head: [['Parameter', 'Target Value', 'Constraint Source']],
            body: specs,
            margin: { left: 15, right: 15 }
        });

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    /**
     * EXECUTIVE FIELD AUDIT REPORT
     * Exported from FieldAuditForm.
     */
    public static generateFieldAuditReport(params: {
        auditData: any;
        t: TFunction;
    }): Blob {
        const { auditData, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Executive Condition Report");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text("FIELD CONDITION SUMMARY", 15, y);

        y += 15;
        const tableData = auditData.assessments.map((a: any) => [
            a.field,
            a.value,
            a.status.toUpperCase(),
            a.recommendation
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Component', 'Reading', 'Status', 'Engineering Recommendation']],
            body: tableData,
            margin: { left: 15, right: 15 },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    if (data.cell.text[0] === 'CRITICAL') data.cell.styles.textColor = [220, 38, 38];
                    if (data.cell.text[0] === 'WARNING') data.cell.styles.textColor = [245, 158, 11];
                }
            }
        });

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    public static generateRiskReport(params: {
        riskData: any;
        engineerEmail: string;
        assetName: string;
        t: TFunction;
        description?: string;
    }): Blob {
        const { riskData, engineerEmail, assetName, t, description } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Risk Analysis Report");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text("EXECUTIVE RISK SUMMARY", 15, y);

        y += 15;
        doc.setFontSize(12);
        doc.setFont("Roboto", "normal");
        doc.text(`Asset: ${assetName}`, 15, y);
        y += 7;
        doc.text(`Engineer: ${engineerEmail}`, 15, y);
        y += 7;
        doc.text(`Risk Level: ${riskData.risk_level}`, 15, y);
        y += 10;

        const splitConsultation = doc.splitTextToSize(riskData.consultation || "No data", 180);
        doc.text(splitConsultation, 15, y);
        y += (splitConsultation.length * 5) + 15;

        if (description) {
            doc.setFont("Roboto", "bold");
            doc.text("ENGINEER OBSERVATIONS", 15, y);
            y += 10;
            doc.setFont("Roboto", "normal");
            const splitDesc = doc.splitTextToSize(description, 180);
            doc.text(splitDesc, 15, y);
        }

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    public static generateMasterDossier(params: {
        assetName: string;
        riskData: any;
        designData: any;
        engineerEmail: string;
        t: TFunction;
    }): Blob {
        const { assetName, riskData, designData, engineerEmail, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        // COVER PAGE
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 297, 'F'); // A4

        doc.setTextColor(34, 211, 238); // cyan-400
        doc.setFontSize(32);
        doc.setFont("Roboto", "bold");
        doc.text("CEREBRO MASTER DOSSIER", 105, 100, { align: 'center' });

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("Roboto", "normal");
        doc.text(assetName.toUpperCase(), 105, 120, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`PREPARED BY: ${engineerEmail}`, 105, 250, { align: 'center' });
        doc.text(`AUTHENTICATED BY ANO HUB ENGINEERING DATA EXCELLENCE`, 105, 280, { align: 'center' });

        // RISK PAGE
        if (riskData) {
            doc.addPage();
            this.applyCerebroBranding(doc, "Risk Diagnostic Component");
            let y = 60;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont("Roboto", "bold");
            doc.text("RISK ASSESSMENT SUMMARY", 15, y);
            y += 15;
            doc.setFontSize(11);
            doc.setFont("Roboto", "normal");
            doc.text(`Risk Level: ${riskData.risk_level}`, 15, y);
            y += 10;
            const splitCons = doc.splitTextToSize(riskData.consultation || "N/A", 180);
            doc.text(splitCons, 15, y);
            this.applyForensicFooter(doc);
        }

        // DESIGN PAGE
        if (designData) {
            doc.addPage();
            this.applyCerebroBranding(doc, "Technical Design Component");
            let y = 60;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont("Roboto", "bold");
            doc.text("ENGINEERING DESIGN PARAMETERS", 15, y);
            y += 15;
            doc.setFontSize(11);
            doc.setFont("Roboto", "normal");
            doc.text(`Configuration: ${designData.design_name || 'N/A'}`, 15, y);
            y += 7;
            doc.text(`Turbine Type: ${designData.recommended_turbine || 'N/A'}`, 15, y);

            if (designData.calculations) {
                y += 15;
                const perfData = [
                    ['Rated Power', `${designData.calculations.powerMW} MW`],
                    ['Annual Energy', `${designData.calculations.energyGWh || designData.calculations.annualGWh} GWh`]
                ];
                autoTable(doc, {
                    startY: y,
                    body: perfData,
                    theme: 'plain',
                    styles: { fontSize: 11, font: 'Roboto' }
                });
            }
            this.applyForensicFooter(doc);
        }

        return doc.output('blob');
    }

    public static generateDiagnosticDossier(params: {
        caseId: string;
        insight: any;
        engineerName: string;
        snapshotImage?: string | null;
        ledgerId?: string | null;
        t: TFunction;
    }): Blob {
        const { caseId, insight, engineerName, snapshotImage, ledgerId, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Diagnostic Forensic Dossier");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text(`CASE ID: ${caseId}`, 15, y);

        y += 10;
        doc.setTextColor(220, 38, 38);
        doc.text(`DETECTED PATTERN: ${insight.name?.toUpperCase() || 'UNKNOWN'}`, 15, y);

        y += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("Roboto", "normal");
        doc.text(`CONFIDENCE SCORE: ${((insight.probability || 0) * 100).toFixed(1)}%`, 15, y);

        if (snapshotImage) {
            y += 10;
            try {
                doc.addImage(snapshotImage, 'PNG', 15, y, 180, 90);
                y += 100;
            } catch (e) {
                console.warn("Failed to add image to PDF", e);
                y += 10;
            }
        }

        y += 10;
        doc.setFont("Roboto", "bold");
        doc.text("PHYSICS NARRATIVE", 15, y);
        y += 7;
        doc.setFont("Roboto", "normal");
        const narrative = insight.physicsNarrative || "Standard assessment.";
        const splitNarrative = doc.splitTextToSize(narrative, 180);
        doc.text(splitNarrative, 15, y);

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    public static generateAssetPassport(params: {
        asset: Asset;
        logs: AssetHistoryEntry[];
        t: TFunction;
    }): Blob {
        const { asset, logs, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Asset Integrity Passport");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text("ASSET IDENTITY", 15, y);

        y += 10;
        const identityData = [
            ['Asset Name', asset.name],
            ['Type', `${asset.type} (${asset.turbine_type || 'Generic'})`],
            ['Location', asset.location],
            ['Capacity', `${asset.capacity} MW`],
            ['Status', asset.status]
        ];

        autoTable(doc, {
            startY: y,
            body: identityData,
            theme: 'plain',
            styles: { fontSize: 11, font: 'Roboto' }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text("MAINTENANCE LOG HISTORY", 15, y);
        y += 10;

        if (logs && logs.length > 0) {
            const logData = logs.map(log => [
                new Date(log.date).toLocaleDateString(),
                log.category,
                log.message,
                log.author
            ]);

            autoTable(doc, {
                startY: y,
                head: [['Date', 'Category', 'Action', 'Author']],
                body: logData,
                headStyles: { fillColor: [15, 23, 42], textColor: [34, 211, 238] },
                styles: { fontSize: 10, font: 'Roboto' }
            });
        } else {
            doc.setFontSize(10);
            doc.setFont("Roboto", "normal");
            doc.text("No maintenance history recorded for this asset.", 15, y);
        }

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    public static generateAuditReport(params: {
        contextTitle: string;
        slogan: string;
        metrics: any[];
        diagnostics: any[];
        logs: any[];
        physicsData: any[];
        engineerName: string;
        t: TFunction;
        ledgerId?: string;
    }): Blob {
        const { contextTitle, slogan, metrics, diagnostics, logs, physicsData, engineerName, t, ledgerId } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, contextTitle);

        let y = 55;
        doc.setFontSize(11);
        doc.setFont("Roboto", "italic");
        doc.setTextColor(100, 116, 139);
        doc.text(`"${slogan}"`, 15, y);

        y += 15;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("ENGINEERING METRICS", 15, y);
        y += 8;

        if (metrics && metrics.length > 0) {
            const tableData = metrics.map(m => [
                m.label,
                `${typeof m.value === 'number' ? m.value.toFixed(2) : m.value} ${m.unit || ''}`,
                m.status?.toUpperCase() || 'NOMINAL'
            ]);

            autoTable(doc, {
                startY: y,
                head: [['Metric', 'Value', 'Status']],
                body: tableData,
                headStyles: { fillColor: [15, 23, 42], textColor: [34, 211, 238] },
                styles: { fontSize: 10, font: 'Roboto' }
            });
            y = (doc as any).lastAutoTable.finalY + 15;
        }

        if (diagnostics && diagnostics.length > 0) {
            doc.setFontSize(14);
            doc.setFont("Roboto", "bold");
            doc.text("DIAGNOSTIC INSIGHTS", 15, y);
            y += 8;

            diagnostics.forEach(diag => {
                doc.setFontSize(10);
                doc.setFont("Roboto", "normal");
                const msg = diag.message || diag.messageKey || 'No details provided';
                doc.text(`- ${msg}`, 15, y);
                y += 6;
            });
            y += 10;
        }

        if (ledgerId) {
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`AUTHENTICITY LEDGER ID: ${ledgerId.toUpperCase()}`, 15, y);
        }

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    public static openAndDownloadBlob(blob: Blob, filename: string, openPreview: boolean = false, options?: { assetId?: any; projectState?: any; reportType?: string; metadata?: Record<string, any> }): void {
        const url = URL.createObjectURL(blob);
        if (openPreview) {
            window.open(url, '_blank');
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
        }

        // Best-effort persistence: if caller provided assetId or projectState, persist metadata.
        try {
            if (options && (options.assetId || options.projectState)) {
                // Lazy import to avoid circular deps
                // compute computed_loss_cost using financial engine if projectState provided
                import('./reportService').then(async (rs) => {
                    const reportService = rs.default || rs;
                    let computedLoss = null;
                    try {
                        if (options.projectState) {
                            const { FinancialImpactEngine } = await import('./FinancialImpactEngine');
                            const impact = FinancialImpactEngine.calculateImpact(options.projectState as any, (options.projectState as any).physics || (options.projectState as any).physics);
                            computedLoss = Number((impact.lostRevenueEuro || 0) + (impact.potentialDamageEUR || 0) + (impact.leakageCostYearly || 0));
                        }

                        const savePayload: any = {
                            assetId: options.assetId ?? (options.projectState?.selectedAsset?.id ?? null),
                            reportType: options.reportType || 'AUTOGENERATED',
                            computedLossCost: computedLoss,
                            computedLossCostCurrency: 'EUR',
                            pdfPath: filename,
                            metadata: options.metadata || {}
                        };

                        // Fire-and-forget, swallow errors to avoid blocking UI
                        reportService.saveReport(savePayload).catch((e: any) => console.warn('[ForensicReportService] saveReport failed (fire-and-forget):', e?.message || e));
                    } catch (e) {
                        console.warn('[ForensicReportService] persistence helper failed:', (e as any)?.message || e);
                    }
                }).catch((e) => console.warn('[ForensicReportService] dynamic import reportService failed:', e));
            }
        } catch (e) {
            // Swallow errors — UI should not fail on persistence
            console.warn('[ForensicReportService] persistence attempt failed:', (e as any)?.message || e);
        }

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * ROOT CAUSE DOSSIER (FORENSIC LAB)
     * High-fidelity export for Root Cause Analysis snapshots.
     */
    public static generateRootCauseDossier(params: {
        snapshot: any; // AuditSnapshot
        rchAnalysis: any | null; // RootCauseAnalysis
        t: TFunction;
    }): Blob {
        const { snapshot, rchAnalysis, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);
        const pageWidth = doc.internal.pageSize.width;

        this.applyCerebroBranding(doc, "Neural Root Cause Dossier");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text("FORENSIC SNAPSHOT METADATA", 15, y);

        y += 10;
        const metadata = [
            ['Snapshot ID', snapshot.id],
            ['Timestamp', new Date(snapshot.timestamp).toLocaleString()],
            ['System Health', snapshot.data?.systemHealth || 'UNKNOWN'],
            ['Neural Pulse', `${snapshot.data?.neuralPulse?.progress || 0}%`]
        ];
        autoTable(doc, {
            startY: y,
            body: metadata,
            theme: 'plain',
            styles: { fontSize: 10, font: 'Roboto' }
        });

        y = (doc as any).lastAutoTable.finalY + 15;

        if (rchAnalysis) {
            doc.setFontSize(14);
            doc.setFont("Roboto", "bold");
            doc.setTextColor(168, 85, 247); // Purple-500
            doc.text("ROOT CAUSE HYPOTHESIS", 15, y);
            y += 10;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.text(`CONFIDENCE: ${rchAnalysis.confidence}%`, 15, y);
            y += 10;

            doc.setTextColor(220, 38, 38); // Red-600
            doc.text("PRIMARY AGGRESSOR DETECTED:", 15, y);
            y += 7;
            doc.setTextColor(0, 0, 0);
            doc.setFont("Roboto", "normal");
            doc.text(`Sensor ID: ${rchAnalysis.primaryAggressor?.sensorId}`, 20, y);
            y += 5;
            doc.text(`Magnitude: +${rchAnalysis.primaryAggressor?.magnitude.toFixed(2)}%`, 20, y);
            y += 10;

            doc.setFont("Roboto", "bold");
            doc.text("CAUSAL CHAIN PROPAGATION:", 15, y);
            y += 7;

            const chainData = rchAnalysis.causalChain.map((event: any, idx: number) => [
                `${idx + 1}.`,
                event.description,
                `${event.magnitude.toFixed(1)}%`,
                `${event.confidence}%`
            ]);

            autoTable(doc, {
                startY: y,
                head: [['Step', 'Event Description', 'Mag.', 'Conf.']],
                body: chainData,
                headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
                styles: { fontSize: 9, font: 'Roboto' }
            });
            y = (doc as any).lastAutoTable.finalY + 15;

            doc.setFont("Roboto", "bold");
            doc.text("EXECUTIVE ANALYSIS SUMMARY", 15, y);
            y += 8;
            doc.setFont("Roboto", "normal");
            const splitSummary = doc.splitTextToSize(rchAnalysis.summary, 180);
            doc.text(splitSummary, 15, y);
        }

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    /**
     * FINANCIAL PROSPECTUS
     * Exported from InvestorBriefing.
     */
    public static generateFinancialProspectus(params: {
        assetName: string;
        kpis: any;
        assumptions: any;
        t: TFunction;
    }): Blob {
        const { assetName, kpis, assumptions, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Investment & Yield Prospectus");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text(`PROJECT ASSET: ${assetName.toUpperCase()}`, 15, y);

        y += 10;
        const kpiData = [
            ['Financial Indicator', 'Pro-Forma Value', 'Risk Priority'],
            ['Return on Investment (ROI)', `${kpis.roi.toFixed(1)}%`, 'STRATEGIC'],
            ['Levelized Cost of Energy', `EUR ${kpis.lcoe.toFixed(2)} / MWh`, 'HIGH'],
            ['Estimated CAPEX', `EUR ${(kpis.capex / 1000000).toFixed(2)}M`, 'HIGH'],
            ['Annual Generation', `${kpis.energyGWh.toFixed(2)} GWh/yr`, 'MEDIUM'],
            ['Payback Period', `${kpis.payback.toFixed(1)} Years`, 'MEDIUM']
        ];

        autoTable(doc, {
            startY: y,
            head: [kpiData[0]],
            body: kpiData.slice(1),
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 10, font: 'Roboto' }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text("MARKET ASSUMPTIONS", 15, y);
        y += 8;

        const assumptionData = [
            ['Variable', 'Assumed Value'],
            ['Electricity Sale Price', `EUR ${assumptions.electricityPrice} / MWh`],
            ['Annual Interest Rate', `${assumptions.interestRate}%`],
            ['Lifecycle Projections', `${assumptions.lifespan} Years`],
            ['OPEX Allocation', `${assumptions.opexPercent}% of CAPEX`]
        ];

        autoTable(doc, {
            startY: y,
            body: assumptionData,
            theme: 'striped',
            styles: { fontSize: 9, font: 'Roboto' }
        });

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    /**
     * INCIDENT SEVERITY REPORT
     * High-priority export for failure investigations.
     */
    public static generateIncidentReport(params: {
        assetName: string;
        incidentType: string;
        deviation: string;
        timestamp: string;
        t: TFunction;
    }): Blob {
        const { assetName, incidentType, deviation, timestamp, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Incident Severity Audit");

        let y = 55;
        doc.setFillColor(220, 38, 38); // Red-600
        doc.rect(15, y, 180, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");
        doc.text("CRITICAL ANOMALY DETECTED - SYSTEM ISOLATED", 105, y + 10, { align: 'center' });

        y += 25;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`ASSET: ${assetName}`, 15, y);

        y += 10;
        const incidentData = [
            ['Metric', 'Forensic Value'],
            ['Incident Type', incidentType.toUpperCase()],
            ['Critical Deviation', deviation],
            ['Event Horizon', new Date(timestamp).toLocaleString()],
            ['Integrity Status', 'COMPROMISED']
        ];

        autoTable(doc, {
            startY: y,
            body: incidentData,
            head: [['Incident Vector', 'Diagnostic Output']],
            headStyles: { fillColor: [220, 38, 38] },
            styles: { fontSize: 10, font: 'Roboto' }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("EMERGENCY DIRECTIVE", 15, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text("Manual intervention required. All hydraulic bypasses active. Inspect within 120 minutes.", 15, y);

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    /**
     * PURCHASE ORDER (LOGISTICAL INTELLIGENCE)
     * Exported from MaintenanceDashboard.
     */
    public static generatePurchaseOrder(params: {
        vendorName: string;
        parts: any[];
        t: TFunction;
    }): Blob {
        const { vendorName, parts, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Spare Parts Purchase Order");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text(`VENDOR: ${vendorName.toUpperCase()}`, 15, y);

        y += 10;
        const tableBody = parts.map(p => [
            p.name,
            p.partNumber,
            p.quantity,
            `EUR ${p.unitPrice.toFixed(2)}`,
            `EUR ${(p.quantity * p.unitPrice).toFixed(2)}`
        ]);

        const totalCost = parts.reduce((total, p) => total + (p.quantity * p.unitPrice), 0);
        const totalRow = [
            { content: 'TOTAL PROJECTED COST', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } as any },
            { content: `EUR ${totalCost.toFixed(2)}`, styles: { fontStyle: 'bold' } as any }
        ];

        autoTable(doc, {
            startY: y,
            head: [['Item Description', 'Part #', 'Qty', 'Unit Price', 'Total']],
            body: [...tableBody, totalRow] as any,
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255] },
            styles: { fontSize: 9, font: 'Roboto' }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text("Authorized by: AnoHUB Logistical Intelligence Engine", 15, y);

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    /**
     * GLOBAL PROJECT DOSSIER (NC-4.2)
     * Comprehensive project documentation.
     */
    public static generateProjectDossier(params: {
        state: TechnicalProjectState;
        t: TFunction;
    }): Blob {
        const { state, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Global Project Dossier");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text(`ASSET: ${state.identity.assetName.toUpperCase()}`, 15, y);

        y += 10;
        const identityData = [
            ['Model', state.identity.turbineType],
            ['Location', state.identity.location],
            ['Operating Hours', `${state.identity.totalOperatingHours?.toLocaleString()} h`],
            ['Health Index', `${(state.hydraulic.efficiency * 100).toFixed(1)}% Eff.`]
        ];

        autoTable(doc, {
            startY: y,
            body: identityData,
            theme: 'plain',
            styles: { fontSize: 10, font: 'Roboto' }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text("TECHNICAL PERFORMANCE AUDIT", 15, y);
        y += 8;

        const techData = [
            ['System', 'Parameter', 'Active Value'],
            ['Hydraulic', 'Net Head', `${state.hydraulic.head} m`],
            ['Hydraulic', 'Flow Rate', `${state.hydraulic.flow} m3/s`],
            ['Mechanical', 'Vibration (X)', `${state.mechanical.vibrationX} mm/s`],
            ['Mechanical', 'Vibration (Y)', `${state.mechanical.vibrationY} mm/s`]
        ];

        autoTable(doc, {
            startY: y,
            head: [techData[0]],
            body: techData.slice(1),
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 9, font: 'Roboto' }
        });

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    public static generateServiceAuditReport(params: {
        assetName: string;
        serviceType: string;
        engineerName: string;
        measurements: any[];
        t: TFunction;
    }): Blob {
        const { assetName, serviceType, engineerName, measurements, t } = params;
        const doc = new jsPDF();
        this.addCustomFont(doc);

        this.applyCerebroBranding(doc, "Service Intervention Audit");

        let y = 55;
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.text(`ASSET: ${assetName.toUpperCase()}`, 15, y);

        y += 8;
        doc.setFontSize(10);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Intervention: ${serviceType} | Expert: ${engineerName}`, 15, y);

        y += 12;
        const tableData = measurements.map(m => [
            m.parameter,
            `${m.asFound.toFixed(3)} ${m.unit}`,
            `${m.asLeft.toFixed(3)} ${m.unit}`,
            `${m.standard.toFixed(3)} ${m.unit}`,
            `${m.improvement > 0 ? '+' : ''}${m.improvement.toFixed(1)}%`,
            m.improvement < 0 ? '✓' : '-'
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Parameter', 'As-Found', 'As-Left', 'Standard', 'Delta', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255] },
            styles: { fontSize: 8, font: 'Roboto' },
            columnStyles: {
                5: { halign: 'center', fontStyle: 'bold' }
            }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("AI DIAGNOSTIC INSIGHTS", 15, y);
        y += 8;

        doc.setFontSize(9);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(30, 41, 59);
        doc.text("Analizom parametara utvrđeno je značajno poboljšanje u operativnoj stabilnosti.", 15, y);
        y += 5;
        doc.text("Preporučeno kontinuirano praćenje vibracija u narednih 30 radnih dana.", 15, y);

        this.applyForensicFooter(doc);
        return doc.output('blob');
    }

    /**
     * NC-500: SOVEREIGN DIAGNOSTIC AUDIT
     * The "Sales Closer" PDF - comprehensive forensic report for field evidence.
     * Includes: Unit ID header, RCA verdict, spectrum comparison, Werkmeister tips.
     */
    public static generateSovereignDiagnosticAudit(params: {
        unitId: string;
        rcaResult: {
            cause: string;
            confidence: number;
            severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
            evidence: string[];
            recommendation: string;
        };
        baselineData?: {
            runnerMaterial: string;
            ceramicCoatingApplied: boolean;
            commissioningDate: string;
        } | null;
        telemetrySnapshot: {
            vibrationX: number;
            vibrationY: number;
            bearingTemp: number;
            efficiency: number;
        };
        spectrumBefore: number[];
        spectrumAfter: number[];
        sparklineData: number[];
        fieldTip?: {
            tip: string;
            threshold?: string;
            action?: string;
            reference?: string;
        };
        t: TFunction;
    }): Blob {
        const {
            unitId,
            rcaResult,
            baselineData,
            telemetrySnapshot,
            spectrumBefore,
            spectrumAfter,
            sparklineData,
            fieldTip,
            t
        } = params;

        const doc = new jsPDF();
        this.addCustomFont(doc);
        const pageWidth = doc.internal.pageSize.width;

        // === HEADER BRANDING ===
        doc.setFillColor(15, 23, 42); // Slate-900
        doc.rect(0, 0, pageWidth, 45, 'F');

        doc.setFontSize(22);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("SOVEREIGN DIAGNOSTIC AUDIT", pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(`Unit: ${unitId}`, pageWidth / 2, 32, { align: 'center' });

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${new Date().toISOString().split('T')[0]} | MONOLIT Forensic Engine v2.0`, pageWidth / 2, 40, { align: 'center' });

        let y = 55;

        // === RCA VERDICT (THE MONEY SHOT) ===
        const severityColors: Record<string, [number, number, number]> = {
            'LOW': [34, 197, 94],      // Green
            'MEDIUM': [234, 179, 8],   // Amber
            'HIGH': [249, 115, 22],    // Orange
            'CRITICAL': [239, 68, 68]  // Red
        };
        const sevColor = severityColors[rcaResult.severity] || [100, 116, 139];

        doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
        doc.roundedRect(15, y, pageWidth - 30, 35, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("ROOT CAUSE VERDICT", 25, y + 12);

        doc.setFontSize(18);
        doc.text(rcaResult.cause.toUpperCase(), 25, y + 26);

        // Confidence badge
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(pageWidth - 55, y + 8, 35, 18, 2, 2, 'F');
        doc.setFontSize(14);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
        doc.text(`${rcaResult.confidence}%`, pageWidth - 37, y + 20);

        y += 45;

        // === EVIDENCE CHAIN ===
        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("EVIDENCE CHAIN", 15, y);
        y += 8;

        const evidenceData = rcaResult.evidence.map((e, i) => [`${i + 1}`, e]);
        autoTable(doc, {
            startY: y,
            body: evidenceData,
            theme: 'plain',
            styles: { fontSize: 9, font: 'Roboto', cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 10, fontStyle: 'bold', textColor: [99, 102, 241] }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 10;

        // === TELEMETRY SNAPSHOT ===
        doc.setFontSize(12);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("REAL-TIME TELEMETRY SNAPSHOT", 15, y);
        y += 8;

        const telemetryData = [
            ['Vibration X', `${telemetrySnapshot.vibrationX.toFixed(2)} mm/s`, telemetrySnapshot.vibrationX > 4.5 ? 'ALARM' : 'OK'],
            ['Vibration Y', `${telemetrySnapshot.vibrationY.toFixed(2)} mm/s`, telemetrySnapshot.vibrationY > 4.5 ? 'ALARM' : 'OK'],
            ['Bearing Temp', `${telemetrySnapshot.bearingTemp.toFixed(1)} °C`, telemetrySnapshot.bearingTemp > 80 ? 'ALARM' : 'OK'],
            ['Efficiency', `${telemetrySnapshot.efficiency.toFixed(1)}%`, telemetrySnapshot.efficiency < 88 ? 'WARNING' : 'OK']
        ];

        autoTable(doc, {
            startY: y,
            head: [['Parameter', 'Value', 'Status']],
            body: telemetryData,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
            styles: { fontSize: 10, font: 'Roboto' },
            columnStyles: {
                2: {
                    halign: 'center',
                    fontStyle: 'bold',
                    cellWidth: 25
                }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    const value = data.cell.raw as string;
                    if (value === 'ALARM') {
                        data.cell.styles.textColor = [239, 68, 68];
                    } else if (value === 'WARNING') {
                        data.cell.styles.textColor = [234, 179, 8];
                    } else {
                        data.cell.styles.textColor = [34, 197, 94];
                    }
                }
            }
        });
        y = (doc as any).lastAutoTable.finalY + 12;

        // === BASELINE DNA (if available) ===
        if (baselineData) {
            doc.setFontSize(11);
            doc.setFont("Roboto", "bold");
            doc.setTextColor(99, 102, 241);
            doc.text("BASELINE DNA", 15, y);
            y += 6;
            doc.setFontSize(9);
            doc.setFont("Roboto", "normal");
            doc.setTextColor(71, 85, 105);
            doc.text(`Runner: ${baselineData.runnerMaterial} | Ceramic: ${baselineData.ceramicCoatingApplied ? 'Applied' : 'None'} | Commissioned: ${baselineData.commissioningDate}`, 15, y);
            y += 10;
        }

        // === WERKMEISTER RECOMMENDATION ===
        doc.setFillColor(245, 158, 11, 30); // Amber background
        doc.roundedRect(15, y, pageWidth - 30, 25, 2, 2, 'F');

        doc.setFontSize(10);
        doc.setFont("Roboto", "bold");
        doc.setTextColor(180, 83, 9);
        doc.text("WERKMEISTER RECOMMENDATION", 20, y + 8);

        doc.setFontSize(9);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(120, 53, 15);
        const recText = doc.splitTextToSize(rcaResult.recommendation, pageWidth - 40);
        doc.text(recText, 20, y + 16);
        y += 30;

        // === FIELD TIP (if available) ===
        if (fieldTip) {
            y += 5;
            doc.setFillColor(254, 243, 199); // Amber-100
            doc.roundedRect(15, y, pageWidth - 30, 30, 2, 2, 'F');

            doc.setFontSize(9);
            doc.setFont("Roboto", "bold");
            doc.setTextColor(180, 83, 9);
            doc.text("ARCHITECT'S FIELD TIP", 20, y + 8);

            if (fieldTip.reference) {
                doc.setFontSize(7);
                doc.setTextColor(161, 98, 7);
                doc.text(`[${fieldTip.reference}]`, pageWidth - 20, y + 8, { align: 'right' });
            }

            doc.setFontSize(8);
            doc.setFont("Roboto", "italic");
            doc.setTextColor(120, 53, 15);
            const tipText = doc.splitTextToSize(`"${fieldTip.tip}"`, pageWidth - 45);
            doc.text(tipText, 20, y + 15);

            if (fieldTip.action) {
                doc.setFont("Roboto", "bold");
                doc.text(`Action: ${fieldTip.action}`, 20, y + 26);
            }
        }

        // === FOOTER ===
        this.applyForensicFooter(doc);

        return doc.output('blob');
    }
}
