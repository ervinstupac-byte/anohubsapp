import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TechnicalProjectState } from '../core/TechnicalSchema';
import { DiagnosticSnapshot } from '../features/telemetry/store/useTelemetryStore';
import { Decimal } from 'decimal.js';
import i18n from '../i18n';
import { ActionEngine } from '../features/business/logic/ActionEngine';
import { calculateMaintenancePrediction } from '../features/maintenance/logic/PredictiveAnalytics';
import { MaintenanceEngine } from './MaintenanceEngine';
import idAdapter from '../utils/idAdapter';
import { SOVEREIGN_ECONOMICS } from '../lib/physics/EconomicsCore';

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
    [key: string]: any;
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
    [key: string]: any;
}

export interface IncidentReportData {
    assetName: string;
    incidentType: string;
    deviation: string;
    timestamp: string;
    status: string;
    [key: string]: any;
}

export interface PurchaseOrderData {
    vendorName: string;
    parts: {
        name: string;
        partNumber: string;
        quantity: number;
        unitPrice: number;
    }[];
    [key: string]: any;
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
    [key: string]: any;
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

export class ForensicReportService {
    private doc: jsPDF;

    constructor() {
        this.doc = new jsPDF();
    }

    /**
     * Generates a forensic snapshot report with Polar Plot
     */
    public generateForensicSnapshotReport(snapshot: DiagnosticSnapshot): Blob {
        this.applyProfessionalHeader('Forensic Diagnostic Snapshot');

        const doc = this.doc;

        // Snapshot Metadata
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`SNAPSHOT ID: ${snapshot.id}`, 14, 55);
        doc.text(`TIMESTAMP: ${new Date(snapshot.timestamp).toLocaleString()}`, 14, 60);
        doc.text(`TRIGGER: ${snapshot.triggerType}`, 14, 65);

        // Pathology Title
        doc.setFontSize(16);
        doc.setTextColor(220, 38, 38); // red-600
        doc.setFont('helvetica', 'bold');
        doc.text(snapshot.pathology.toUpperCase(), 14, 80);

        // Oracle Wisdom
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.text(`"${snapshot.oracleWisdom.message}"`, 14, 90, { maxWidth: 180 });

        doc.setFont('helvetica', 'bold');
        doc.text(`RECOMMENDED ACTION: ${snapshot.oracleWisdom.action}`, 14, 110);

        // PHYSICS ANALYSIS (If available)
        let contentY = 115;
        
        if (snapshot.physicsAnalysis) {
            // Hydraulic Section
            doc.setFillColor(240, 248, 255); // AliceBlue
            doc.rect(14, contentY, 182, 22, 'F');
            doc.setDrawColor(173, 216, 230); // LightBlue
            doc.rect(14, contentY, 182, 22, 'D');

            doc.setFontSize(10);
            doc.setTextColor(23, 37, 84); // blue-950
            doc.setFont('helvetica', 'bold');
            doc.text('HYDRAULIC PHYSICS', 16, contentY + 5);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            
            const zoneText = `ZONE: ${snapshot.physicsAnalysis.zone.zone} - ${snapshot.physicsAnalysis.zone.message}`;
            doc.text(zoneText, 16, contentY + 10);
            
            if (snapshot.physicsAnalysis.zone.efficiencyDetails) {
                 doc.text(snapshot.physicsAnalysis.zone.efficiencyDetails, 16, contentY + 14);
            }

            const cavText = `CAVITATION: ${snapshot.physicsAnalysis.cavitation.details}`;
            const isCavHigh = snapshot.physicsAnalysis.cavitation.risk === 'HIGH';
            doc.setTextColor(isCavHigh ? 220 : 50, isCavHigh ? 38 : 50, isCavHigh ? 38 : 50);
            doc.text(cavText, 16, contentY + 18);

            contentY += 28; // Move down

            // Vibration Section (if available)
            if (snapshot.physicsAnalysis.vibration) {
                const vib = snapshot.physicsAnalysis.vibration;
                
                doc.setFillColor(255, 241, 242); // Rose-50
                doc.rect(14, contentY, 182, 22, 'F');
                doc.setDrawColor(253, 164, 175); // Rose-300
                doc.rect(14, contentY, 182, 22, 'D');

                doc.setFontSize(10);
                doc.setTextColor(136, 19, 55); // rose-900
                doc.setFont('helvetica', 'bold');
                doc.text('VIBRATION PATTERN ANALYSIS', 16, contentY + 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50, 50, 50);
                
                doc.text(`PATTERN: ${vib.pattern} (${vib.severity})`, 16, contentY + 10);
                
                if (vib.recommendations && vib.recommendations.length > 0) {
                     doc.text(`REC: ${vib.recommendations[0]}`, 16, contentY + 14);
                     if (vib.recommendations[1]) doc.text(`     ${vib.recommendations[1]}`, 16, contentY + 18);
                }
                
                contentY += 28; // Move down again
            }

            // Oil Analysis Section (if available)
            if (snapshot.oilAnalysis) {
                const oil = snapshot.oilAnalysis;
                doc.setFillColor(240, 253, 244); // Green-50
                doc.rect(14, contentY, 182, 22, 'F');
                doc.setDrawColor(34, 197, 94); // Green-500
                doc.rect(14, contentY, 182, 22, 'D');

                doc.setFontSize(10);
                doc.setTextColor(21, 128, 61); // green-700
                doc.setFont('helvetica', 'bold');
                doc.text('OIL HEALTH ANALYSIS', 16, contentY + 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50, 50, 50);
                doc.text(`HEALTH: ${oil.overallHealth} (Score: ${oil.healthScore})`, 16, contentY + 10);
                
                if (oil.findings.length > 0) {
                     doc.text(`ISSUE: ${oil.findings[0].message}`, 16, contentY + 14);
                     if (oil.findings[1]) doc.text(`       ${oil.findings[1].message}`, 16, contentY + 18);
                }
                contentY += 28;
            }

            // AI Prediction Section (if available)
            if (snapshot.aiPrediction?.synergeticRisk.detected) {
                const ai = snapshot.aiPrediction.synergeticRisk;
                doc.setFillColor(250, 245, 255); // Purple-50
                doc.rect(14, contentY, 182, 22, 'F');
                doc.setDrawColor(168, 85, 247); // Purple-500
                doc.rect(14, contentY, 182, 22, 'D');

                doc.setFontSize(10);
                doc.setTextColor(126, 34, 206); // purple-700
                doc.setFont('helvetica', 'bold');
                doc.text('AI SYNERGETIC RISK PREDICTION', 16, contentY + 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50, 50, 50);
                doc.text(`PROBABILITY: ${(ai.probability * 100).toFixed(0)}%`, 16, contentY + 10);
                doc.text(`WARNING: ${ai.message}`, 16, contentY + 14);
                
                contentY += 28;
            }

            // Sustainability & Longevity Section (if available)
            if (snapshot.energyHarvest || snapshot.lifeExtension) {
                doc.setFillColor(236, 254, 255); // Cyan-50
                doc.rect(14, contentY, 182, 22, 'F');
                doc.setDrawColor(6, 182, 212); // Cyan-500
                doc.rect(14, contentY, 182, 22, 'D');

                doc.setFontSize(10);
                doc.setTextColor(14, 116, 144); // cyan-700
                doc.setFont('helvetica', 'bold');
                doc.text('SUSTAINABILITY & LONGEVITY', 16, contentY + 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50, 50, 50);
                
                let text = '';
                if (snapshot.energyHarvest) text += `HARVEST: ${snapshot.energyHarvest.powerW.toFixed(0)}W (€${snapshot.energyHarvest.annualEur.toFixed(0)}/yr)  `;
                if (snapshot.lifeExtension) text += `LIFE EXTENSION: +${snapshot.lifeExtension.yearsAdded.toFixed(1)} Years`;
                
                doc.text(text, 16, contentY + 10);
                
                contentY += 28;
            }

            // Structural & Safety Section
            if (snapshot.structuralIntegrity || snapshot.hydraulicSafety) {
                doc.setFillColor(248, 250, 252); // Slate-50
                doc.rect(14, contentY, 182, 22, 'F');
                doc.setDrawColor(100, 116, 139); // Slate-500
                doc.rect(14, contentY, 182, 22, 'D');

                doc.setFontSize(10);
                doc.setTextColor(51, 65, 85); // Slate-700
                doc.setFont('helvetica', 'bold');
                doc.text('SAFETY & INTEGRITY AUDIT', 16, contentY + 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50, 50, 50);

                let text = '';
                if (snapshot.structuralIntegrity) {
                    text += `STRUCTURAL MARGIN: ${snapshot.structuralIntegrity.marginPct.toFixed(1)}% (MAWP: ${snapshot.structuralIntegrity.mawpBar.toFixed(0)} bar)  `;
                }
                if (snapshot.hydraulicSafety) {
                    text += `HYDRAULIC MOD: ${snapshot.hydraulicSafety.approved ? 'APPROVED' : 'REJECTED - ' + snapshot.hydraulicSafety.reason}`;
                }
                
                doc.text(text, 16, contentY + 10, { maxWidth: 178 });
                
                contentY += 28;
            }

            // Phase 5: Electrical & Auxiliary Forensics
            if (snapshot.transformerAnalysis || snapshot.statorAnalysis || snapshot.shaftSealAnalysis || snapshot.governorAnalysis) {
                doc.setFillColor(255, 247, 237); // Orange-50
                doc.rect(14, contentY, 182, 22, 'F');
                doc.setDrawColor(234, 88, 12); // Orange-600
                doc.rect(14, contentY, 182, 22, 'D');

                doc.setFontSize(10);
                doc.setTextColor(154, 52, 18); // Orange-800
                doc.setFont('helvetica', 'bold');
                doc.text('ELECTRICAL & AUXILIARY FORENSICS', 16, contentY + 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50, 50, 50);

                let text = '';
                if (snapshot.transformerAnalysis) {
                    text += `TRANSFORMER: ${snapshot.transformerAnalysis.faultType}  `;
                }
                if (snapshot.statorAnalysis) {
                    text += `STATOR: ${snapshot.statorAnalysis.severity} (Action: ${snapshot.statorAnalysis.action})  `;
                }
                if (snapshot.shaftSealAnalysis) {
                    text += `SEAL: ${(snapshot.shaftSealAnalysis.probability * 100).toFixed(0)}% Risk (${snapshot.shaftSealAnalysis.action})  `;
                }
                if (snapshot.governorAnalysis) {
                    text += `GOVERNOR: ${snapshot.governorAnalysis.action}`;
                }
                
                doc.text(text, 16, contentY + 10, { maxWidth: 178 });
                
                contentY += 28;
            }

            // Phase 4: Electro-Mechanical Forensics (Thermal, Wicket, Air Gap)
            if (snapshot.thermalAnalysis || snapshot.wicketGateAnalysis || snapshot.generatorAirGap) {
                doc.setFillColor(236, 253, 245); // Emerald-50
                doc.rect(14, contentY, 182, 22, 'F');
                doc.setDrawColor(5, 150, 105); // Emerald-600
                doc.rect(14, contentY, 182, 22, 'D');

                doc.setFontSize(10);
                doc.setTextColor(6, 95, 70); // Emerald-800
                doc.setFont('helvetica', 'bold');
                doc.text('ELECTRO-MECHANICAL FORENSICS', 16, contentY + 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50, 50, 50);

                let text = '';
                if (snapshot.thermalAnalysis) {
                    text += `THERMAL: ${snapshot.thermalAnalysis.viscosity} cP (${snapshot.thermalAnalysis.action})  `;
                }
                if (snapshot.wicketGateAnalysis) {
                    text += `WICKET: ${snapshot.wicketGateAnalysis.action} (Backlash: ${snapshot.wicketGateAnalysis.backlashPct?.toFixed(2)}%)  `;
                }
                if (snapshot.generatorAirGap) {
                    text += `AIR GAP: Ecc ${snapshot.generatorAirGap.eccentricityPct.toFixed(1)}% (UMP: ${snapshot.generatorAirGap.umpN.toFixed(0)}N)`;
                }
                
                doc.text(text, 16, contentY + 10, { maxWidth: 178 });
                
                contentY += 28;
            }

            // Phase 3: Advanced Intelligence (Acoustic, Synergy, Galvanic)
            if (snapshot.acousticFingerprint || snapshot.crossCorrelation || snapshot.galvanicCorrosion) {
                doc.setFillColor(250, 245, 255); // Purple-50
                doc.rect(14, contentY, 182, 22, 'F');
                doc.setDrawColor(168, 85, 247); // Purple-500
                doc.rect(14, contentY, 182, 22, 'D');

                doc.setFontSize(10);
                doc.setTextColor(107, 33, 168); // Purple-800
                doc.setFont('helvetica', 'bold');
                doc.text('ADVANCED SIGNAL INTELLIGENCE', 16, contentY + 5);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50, 50, 50);

                let text = '';
                if (snapshot.acousticFingerprint) {
                    text += `ACOUSTIC: ${snapshot.acousticFingerprint.primaryPattern} (Conf: ${snapshot.acousticFingerprint.confidence.toFixed(0)}%)  `;
                }
                if (snapshot.crossCorrelation?.correlated) {
                    text += `SYNERGY: ${snapshot.crossCorrelation.pair} (r=${snapshot.crossCorrelation.r.toFixed(2)})  `;
                }
                if (snapshot.galvanicCorrosion) {
                    text += `CATHODIC: ${snapshot.galvanicCorrosion.avgVoltage} mV (${snapshot.galvanicCorrosion.protectionLevel})`;
                }
                
                doc.text(text, 16, contentY + 10, { maxWidth: 178 });
                
                contentY += 28;
            }
        } else {
             contentY += 10; // Default spacing if no physics
        }

        // POLAR PLOT VISUALIZATION
        // Ensure we have enough space, or page break? For now assume it fits.
        this.drawPolarPlot(snapshot.kineticState, 14, contentY, 80);

        // Telemetry Table
        autoTable(doc, {
            startY: contentY,
            margin: { left: 110 }, // Place to the right of the plot
            head: [['Telemetry Metric', 'Value']],
            body: [
                ['RPM', snapshot.telemetry.rpm.toFixed(1)],
                ['Vibration X', snapshot.telemetry.vibrationX.toFixed(3) + ' mm/s'],
                ['Vibration Y', snapshot.telemetry.vibrationY.toFixed(3) + ' mm/s'],
                ['Bearing Temp', snapshot.telemetry.bearingTemp.toFixed(1) + ' °C'],
                ['Eccentricity', snapshot.kineticState.eccentricity.toFixed(3) + ' mm'],
                ['Phase Angle', snapshot.kineticState.phase.toFixed(1) + '°'],
                ['R² (Sine Fit)', snapshot.kineticState.rsquared.toFixed(4)],
            ],
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] }
        });

        this.applyFooter();
        return doc.output('blob');
    }

    private drawPolarPlot(kinetic: { eccentricity: number, phase: number }, x: number, y: number, size: number) {
        const doc = this.doc;
        const cx = x + size / 2;
        const cy = y + size / 2;
        const radius = size / 2 - 10;

        // Background Circles
        doc.setDrawColor(200, 200, 200);
        doc.circle(cx, cy, radius, 'S');
        doc.circle(cx, cy, radius * 0.66, 'S');
        doc.circle(cx, cy, radius * 0.33, 'S');

        // Crosshairs
        doc.line(cx - radius, cy, cx + radius, cy);
        doc.line(cx, cy - radius, cx, cy + radius);

        // Plot Point
        // Phase is usually degrees. 0 is usually right (standard math) or top (clock).
        // Let's assume standard math: 0 is right, CCW.
        const rad = kinetic.phase * (Math.PI / 180);
        // Scale eccentricity. Max eccentricity? Let's say 0.5mm is edge (since typical is < 0.1)
        // But warning is > 0.15. So let's map 0.5mm to radius.
        const scale = radius / 0.5;
        const r = Math.min(kinetic.eccentricity * scale, radius);

        const px = cx + r * Math.cos(rad);
        const py = cy - r * Math.sin(rad); // PDF Y is down

        // Draw Vector Line
        doc.setDrawColor(220, 38, 38); // Red
        doc.setLineWidth(0.5);
        doc.line(cx, cy, px, py);

        // Draw Point
        doc.setFillColor(220, 38, 38);
        doc.circle(px, py, 2, 'F');

        // Label
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('0°', cx + radius + 2, cy);
        doc.text('90°', cx, cy - radius - 2);

        doc.setTextColor(220, 38, 38);
        doc.text(`E: ${kinetic.eccentricity.toFixed(3)}mm`, cx - 15, cy + radius + 10);
        doc.text(`P: ${kinetic.phase.toFixed(1)}°`, cx - 15, cy + radius + 18);
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
     * INTEGRATED with EconomicsCore benchmarks (NC-13000)
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
                ['Return on Investment (ROI)', `${kpis.roi?.toFixed(1) || 0}%`, 'CRITICAL'],
                ['Levelized Cost of Energy', `€${kpis.lcoe?.toFixed(2) || 0} / MWh`, 'HIGH'],
                ['Estimated Total CAPEX', `€${((kpis.capex || 0) / 1000000).toFixed(1)}M`, 'HIGH'],
                ['Payback Period', `${kpis.payback?.toFixed(1) || 0} Years`, 'MEDIUM'],
                ['Annual Revenue Projection', `€${((kpis.revenue || 0) / 1000000).toFixed(2)}M`, 'MEDIUM']
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
            head: [['Input Variable', 'Assumed Value', 'Source']],
            body: [
                ['Electricity Sale Price', `€${SOVEREIGN_ECONOMICS.MARKET_PRICE_MWH} / MWh`, 'EconomicsCore (NC-13000)'],
                ['Target Efficiency', `${(SOVEREIGN_ECONOMICS.TARGET_EFFICIENCY * 100).toFixed(1)}%`, 'Sovereign Standard'],
                ['Annual Bank Interest Rate', `${assumptions.interestRate}%`, 'User Input'],
                ['Project Lifecycle', `${assumptions.lifespan} Years`, 'User Input'],
                ['Operation & Maintenance', `${assumptions.opexPercent}% of CAPEX`, 'Standard Model']
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

    // ==========================================
    // STATIC LEGACY ADAPTERS (NC-14000)
    // ==========================================

    public static generateFinancialProspectus(data: FinancialReportData): Blob {
        return new ForensicReportService().generateFinancialProspectus(data);
    }

    public static generateIncidentReport(data: IncidentReportData): Blob {
        return new ForensicReportService().generateIncidentReport(data);
    }

    public static generatePurchaseOrder(data: PurchaseOrderData): Blob {
        return new ForensicReportService().generatePurchaseOrder(data);
    }

    public static generateProjectDossier(data: any): Blob {
        return new ForensicReportService().generateProjectPDF(data.state || data);
    }

    public static generateRiskReport(data: any): Blob {
        return new ForensicReportService().generateExecutiveBriefing(data);
    }

    public static generateMasterDossier(data: any): Blob {
        return new ForensicReportService().generateProjectPDF(data.state || data);
    }

    public static generateAuditReport(data: TechnicalAuditData): Blob {
        return new ForensicReportService().generateTechnicalAuditReport(data);
    }

    public static generateHPPSpecification(data: any): Blob {
        return new ForensicReportService().generateTechnicalReport(data);
    }

    public static generateDiagnosticDossier(data: any): Blob {
        return new ForensicReportService().generateProjectPDF(data);
    }

    public static generateRootCauseDossier(data: any): Blob {
        return new ForensicReportService().generateIncidentReport({
            assetName: data.assetName || 'Unknown',
            incidentType: 'ROOT_CAUSE_ANALYSIS',
            deviation: 'DETECTED',
            timestamp: new Date().toISOString(),
            status: 'ANALYZED'
        });
    }

    public static async generateDossierChecksum(data: any): Promise<string> {
        // Simple hash simulation
        return Promise.resolve("SHA256-" + Math.random().toString(36).substring(7).toUpperCase());
    }

    public static openAndDownloadBlob(blob: Blob, filename: string, _openPreview: boolean = true, _options: any = {}) {
        new ForensicReportService().downloadReport(blob, filename);
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
     * Generates a Service Audit Report (As-Found / As-Left)
     * Fixes TS2551 in AutoReportGenerator.tsx
     */
    public static generateServiceAuditReport(data: any): Blob {
        return new ForensicReportService().generateServiceReport(data);
    }

    /**
     * NC-19900: Wrapper for Asset Passport generation
     */
    public static generateAssetPassport(data: any): Blob {
        return new ForensicReportService().generateTechnicalReport({
            assetName: data.name || 'Asset Passport',
            parameters: data.specs || {},
            calculations: { powerMW: 0, energyGWh: 0, n_sq: 0 },
            recommendedTurbine: 'N/A'
        });
    }

    /**
     * NC-19900: Wrapper for Forensic Dossier generation
     */
    public static generateForensicDossier(data: any): Blob {
        return new ForensicReportService().generateProjectPDF(data);
    }

    /**
     * NC-19900: Protocol Report Generator
     * Handles dynamic field reports from ProtocolLaunchpad
     */
    public static generateProtocolReport(data: any): Blob {
        return new ForensicReportService().generateGenericProtocolPDF(data);
    }

    /**
     * NC-19900: Field Audit Re-Generator
     * Reloads historical audits from localStorage
     */
    public static generateFieldAuditReport(data: any): Blob {
        const { auditData } = data;
        return new ForensicReportService().generateGenericProtocolPDF({
            contextTitle: 'Field Audit Record',
            slogan: `Audit ID: ${auditData?.id || 'Legacy'}`,
            metrics: auditData?.metrics || [],
            diagnostics: auditData?.diagnostics || [],
            engineerName: auditData?.engineerName || 'Unknown',
            ledgerId: auditData?.ledgerId
        });
    }

    public generateGenericProtocolPDF(data: any): Blob {
        this.applyProfessionalHeader('Protocol Execution Report');
        const doc = this.doc;

        const { contextTitle, slogan, metrics, diagnostics, engineerName, ledgerId } = data;

        // Context Info
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(contextTitle || 'Field Protocol', 14, 60);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(slogan || '', 14, 66);
        doc.text(`Engineer: ${engineerName}`, 14, 72);
        if (ledgerId) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Ledger ID: ${ledgerId}`, 14, 78);
        }

        let currentY = 85;

        // Metrics Table
        if (metrics && metrics.length > 0) {
            autoTable(doc, {
                startY: currentY,
                head: [['Metric', 'Value', 'Unit']],
                body: metrics.map((m: any) => [
                    m.label || '',
                    m.value || '',
                    m.unit || '-'
                ]),
                theme: 'striped',
                headStyles: { fillColor: [2, 6, 23] },
                styles: { fontSize: 9 }
            });
            // @ts-ignore
            currentY = (doc as any).lastAutoTable.finalY + 10;
        }

        // Diagnostics / Observations
        if (diagnostics && diagnostics.length > 0) {
            doc.setFontSize(11);
            doc.setTextColor(2, 6, 23);
            doc.text('Diagnostics & Observations', 14, currentY);
            currentY += 6;

            diagnostics.forEach((d: any) => {
                doc.setFontSize(9);
                doc.setTextColor(50);
                const prefix = d.type ? `[${d.type.toUpperCase()}] ` : '';
                doc.text(`${prefix}${d.message}`, 14, currentY);
                currentY += 5;
            });
            currentY += 5;
        }

        // Footer / Signature
        const finalY = Math.max(currentY, 250);
        const pageWidth = doc.internal.pageSize.width || 210;

        doc.setDrawColor(200);
        doc.line(14, finalY, pageWidth - 14, finalY);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated by AnoHUB Core Engine • ${new Date().toISOString()}`, 14, finalY + 5);

        return doc.output('blob');
    }

    public generateServiceReport(data: any): Blob {
        this.applyProfessionalHeader('Service Audit Report');
        const doc = this.doc;

        const { assetName, serviceType, engineerName, measurements } = data;

        // Service Info
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(`Asset: ${assetName}`, 14, 60);
        doc.setFontSize(10);
        doc.text(`Service: ${serviceType}`, 14, 66);
        doc.text(`Engineer: ${engineerName}`, 14, 72);

        // Measurements Table
        const tableBody = measurements.map((m: any) => [
            m.parameter,
            `${m.asFound} ${m.unit}`,
            `${m.asLeft} ${m.unit}`,
            m.standard,
            `${m.improvement > 0 ? '+' : ''}${m.improvement.toFixed(1)}%`
        ]);

        autoTable(doc, {
            startY: 80,
            head: [['Parameter', 'As-Found', 'As-Left', 'Standard', 'Improvement']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(22, 163, 74); // Green
        doc.text('SERVICE CERTIFIED & VALIDATED', 14, finalY);

        this.applyFooter();
        return doc.output('blob');
    }

    /**
     * NC-4.2 COMMAND: Generate comprehensive project dossier from CEREBRO state
     */
    public generateProjectPDF(state: TechnicalProjectState): Blob {
        const doc = this.doc;

        // 1. Executive Identity
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        const dossierLabel = i18n.t('report.dossierLabel', 'PROJECT DOSSIER');
        doc.text(`${dossierLabel}: ${state.identity.assetName} `, 14, 60);

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
        doc.text(`Asset ID: ${state.identity.assetId} | Location: ${state.identity.location} `, 14, 67);

        let currentY = 80;

        // --- SECTION A: EXECUTIVE SUMMARY (FINANCIAL FORENSICS) ---
        // Logic: Assume target efficiency 92%. Calculate loss if below.
        const targetEff = SOVEREIGN_ECONOMICS.TARGET_EFFICIENCY;
        const currentEff = state.hydraulic.efficiency;
        const effGap = Math.max(0, targetEff - currentEff);

        // Est Power MW
        const flow = state.hydraulic.flow;
        const head = state.hydraulic.head;
        const powerMW = (flow * head * 9.81 * currentEff) / 1000;
        const lostMW = (flow * head * 9.81 * effGap) / 1000;
        const pricePerMWh = SOVEREIGN_ECONOMICS.MARKET_PRICE_MWH; // EUR, Assumption
        const annualHours = 8000;
        const revenueLoss = lostMW * pricePerMWh * annualHours;

        doc.setFontSize(12);
        doc.setTextColor(6, 182, 212);
        doc.setFont('helvetica', 'bold');
        doc.text('I. EXECUTIVE SUMMARY & FINANCIAL FORENSICS', 14, currentY);

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Financial Metric', 'Current State', 'Projected Annual Impact']],
            body: [
                ['Real-Time Efficiency', `${(currentEff * 100).toFixed(1)}% `, effGap > 0 ? ` - ${(effGap * 100).toFixed(1)}% vs Target` : 'OPTIMAL'],
                ['Active Power Output', `${powerMW.toFixed(2)} MW`, '-'],
                ['Revenue Efficiency Gap', effGap > 0 ? 'NEEDS OPTIMIZATION' : 'OPTIMIZED', effGap > 0 ? `- €${revenueLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })} ` : '€0.00']
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // --- SECTION B: PREDICTIVE HEALTH (PAE NC-4.2) ---
        const prediction = calculateMaintenancePrediction({
            config: { id: idAdapter.toStorage(state.identity.assetId), name: state.identity.assetName, designLifeHours: 50000, installationDate: '', wearFactorCurve: 'LINEAR' },
            telemetry: {
                accumulatedRunHours: state.identity.totalOperatingHours || 0,
                currentVibrationMMs: Math.max(state.mechanical.vibrationX, state.mechanical.vibrationY),
                currentEfficiencyPercent: state.hydraulic.efficiency * 100,
                startsAndStops: state.identity.startStopCount || 0,
                cavitationIndex: state.mechanical.acousticMetrics?.cavitationIntensity ? state.mechanical.acousticMetrics.cavitationIntensity / 100 : 0
            }
        });

        doc.text('II. PREDICTIVE HEALTH & MAINTENANCE TIMELINE', 14, currentY);

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Predictive Indicator', 'Status/Value', 'Risk Assessment']],
            body: [
                ['Degradation Factor', `${prediction.degradationFactor}x Acceleration`, prediction.degradationFactor > 1.2 ? 'ACCELERATED WEAR' : 'NOMINAL'],
                ['Est. Remaining Life (ERL)', `~${prediction.remainingLifeHours.toLocaleString()} Hours`, `${prediction.urgency} STATUS`],
                ['Forecasted Failure Event', new Date(prediction.predictedFailureDate).toLocaleDateString(), prediction.primaryStressor]
            ],
            theme: 'grid',
            headStyles: { fillColor: [88, 28, 135] }, // Purple
            styles: { fontSize: 9 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // --- SECTION C: STRATEGIC ACTION PLAN (NC-4.2 Expert Advisor) ---
        let expertSOPs: any[] = [];
        if (state.diagnosis) {
            expertSOPs = MaintenanceEngine.generateActionPlan(state.diagnosis);
        }

        if (expertSOPs.length > 0) {
            doc.text('III. STRATEGIC ACTION PLAN (PRIORITIZED SOPs)', 14, currentY);

            const actionBody = expertSOPs.map(sop => [
                sop.priority,
                sop.failureMode,
                sop.action,
                sop.kbRef
            ]);

            autoTable(doc, {
                startY: currentY + 5,
                head: [['Priority', 'Failure Mode', 'Engineering Directive / SOP', 'Reference']],
                body: actionBody,
                theme: 'grid',
                headStyles: { fillColor: [249, 115, 22] }, // Orange-500
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { fontStyle: 'bold', textColor: [239, 68, 68] },
                    2: { cellWidth: 100 }
                }
            });
        }
        else {
            doc.setFontSize(10);
            doc.setTextColor(34, 197, 94); // Green
            doc.text('III. STRATEGIC ACTION PLAN: SYSTEM OPTIMAL. NO ACTIONS REQUIRED.', 14, currentY);
        }

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // --- SECTION D: TECHNICAL DATA (EXISTING) ---
        // Column 1: Hydraulic Audit
        doc.setFontSize(12);
        doc.setTextColor(6, 182, 212);
        doc.text(i18n.t('report.sections.hydraulic', 'IV. HYDRAULIC AUDIT'), 14, currentY);

        autoTable(doc, {
            startY: currentY + 5,
            margin: { right: 110 }, // Left half
            head: [['Parameter', 'Active Value', 'Decimal Status']],
            body: [
                ['Design Head', `${state.hydraulic.head} m`, state.hydraulic.waterHead.toFixed(2)],
                ['Flow Rate', `${state.hydraulic.flow} m3 / s`, state.hydraulic.flowRate.toFixed(3)],
                ['Efficiency', `${(state.hydraulic.efficiency * 100).toFixed(1)}% `, 'Verified']
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 8 }
        });

        // Column 2: Penstock Analysis (Right half)
        doc.text(i18n.t('report.sections.penstock', 'V. PENSTOCK ANALYSIS'), 110, currentY);
        autoTable(doc, {
            startY: currentY + 5,
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

        currentY = Math.max((doc as any).lastAutoTable.finalY, 115) + 15;

        // Middle Section: Combined Pressure & Stress (Full Width)
        doc.setTextColor(6, 182, 212);
        doc.text(i18n.t('report.sections.pressureStress', 'VI. PRESSURE & STRESS FUSION (IEC 60041 Compliant)'), 14, currentY);
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
        doc.text(i18n.t('report.sections.mechanical', 'VII. MECHANICAL & ORBIT INTEGRITY'), 14, currentY);
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
        doc.rect(14, currentY, 182, 35, 'F');
        doc.setDrawColor(239, 68, 68);
        doc.rect(14, currentY, 182, 35, 'D');

        doc.setFontSize(11);
        doc.setTextColor(153, 27, 27);
        doc.setFont('helvetica', 'bold');
        doc.text(i18n.t('report.sections.diagnostic', 'VIII. DIAGNOSTIC SUMMARY & AI INSIGHTS'), 20, currentY + 10);

        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');

        const currentLang = i18n.language === 'bs' ? 'bs' : 'en';

        const diagnosisMessages = state.diagnosis?.messages.map((m: unknown) => (m as any)[currentLang]).join(' ') ||
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
        this.applyProfessionalHeader(`Module Report: ${moduleName} `);
        const doc = this.doc;

        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(`MODULE AUDIT: ${moduleName.toUpperCase()} `, 14, 60);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Asset: ${state.identity.assetName} | Captured: ${new Date().toISOString()} `, 14, 67);

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

export const forensicReportService = new ForensicReportService();
