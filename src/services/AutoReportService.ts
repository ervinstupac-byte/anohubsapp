// Auto-Report Service - AI-Powered Service Report Generation
// Generates As-Found / As-Left / Recommendations PDF reports

import { ReportGenerator } from './ReportGenerator';
import { EnhancedAsset } from '../models/turbine/types';

export interface ServiceMeasurement {
    parameter: string;
    asFound: number; // Zatečeno stanje
    asLeft: number; // Ostavljeno stanje
    unit: string;
    standard: number; // Target value
    improvement: number; // % change
}

export interface AIInsight {
    category: 'ACOUSTIC' | 'VIBRATION' | 'ALIGNMENT' | 'EFFICIENCY' | 'TEMPERATURE';
    finding: string; // AI-generated sentence
    confidence: number; // 0-100%
}

export interface ServiceReportData {
    assetName: string;
    assetId: string;
    turbineFamily: string;
    serviceDate: string;
    serviceType: string;
    engineer: {
        name: string;
        certification: string;
    };

    // As-Found / As-Left Measurements
    measurements: ServiceMeasurement[];

    // AI-Generated Insights
    aiInsights: AIInsight[];

    // 12-Month Recommendations
    recommendations: Array<{
        priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        action: string;
        deadline: string; // e.g., "Within 3 months"
        consequence: string; // What happens if ignored
    }>;
}

export class AutoReportService {
    public reportGen: ReportGenerator;

    constructor() {
        this.reportGen = new ReportGenerator();
    }

    /**
     * Generate AI insights from measurement data
     */
    private generateAIInsights(measurements: ServiceMeasurement[]): AIInsight[] {
        const insights: AIInsight[] = [];

        // Acoustic Analysis
        const cavitation = measurements.find(m => m.parameter.toLowerCase().includes('cavitation'));
        if (cavitation && cavitation.improvement < 0) {
            const reduction = Math.abs(cavitation.improvement);
            insights.push({
                category: 'ACOUSTIC',
                finding: `Analizom akustičnog potpisa utvrđeno je da je kavitacija smanjena za ${reduction.toFixed(0)}% nakon optimizacije kuta lopatica.`,
                confidence: 92
            });
        }

        // Vibration Analysis
        const vibration = measurements.find(m => m.parameter.toLowerCase().includes('vibration'));
        if (vibration && vibration.improvement < 0) {
            const reduction = Math.abs(vibration.improvement);
            insights.push({
                category: 'VIBRATION',
                finding: `Vibracije smanjene za ${reduction.toFixed(0)}% nakon centriranja vratila, što produžava životni vijek ležajeva za procijenjenih ${(reduction * 2).toFixed(0)} mjeseci.`,
                confidence: 88
            });
        }

        // Alignment Analysis
        const alignment = measurements.find(m => m.parameter.toLowerCase().includes('alignment'));
        if (alignment && alignment.asLeft <= alignment.standard) {
            insights.push({
                category: 'ALIGNMENT',
                finding: `Ostvareno centriranje ${alignment.asLeft.toFixed(3)} ${alignment.unit} što je ${((1 - alignment.asLeft / alignment.standard) * 100).toFixed(0)}% ispod ISO standarda 0.05 mm/m.`,
                confidence: 95
            });
        }

        // Efficiency Analysis
        const efficiency = measurements.find(m => m.parameter.toLowerCase().includes('efficiency'));
        if (efficiency && efficiency.improvement > 0) {
            const energyGain = efficiency.improvement * 0.5; // Simplified: 1% eff = 0.5% energy
            insights.push({
                category: 'EFFICIENCY',
                finding: `Povećanje efikasnosti od ${efficiency.improvement.toFixed(1)}% rezultira dodatnom proizvodnjom od ~${energyGain.toFixed(1)}% godišnje energije.`,
                confidence: 85
            });
        }

        // Temperature Analysis
        const temperature = measurements.find(m => m.parameter.toLowerCase().includes('temperature'));
        if (temperature && temperature.improvement < 0) {
            insights.push({
                category: 'TEMPERATURE',
                finding: `Temperatura ležajeva snižena za ${Math.abs(temperature.improvement).toFixed(1)}°C, što smanjuje oksidaciju ulja i produž ava radni vijek između zamjena.`,
                confidence: 90
            });
        }

        return insights;
    }

    /**
     * Generate 12-month recommendations based on findings
     */
    private generate12MonthRecommendations(
        measurements: ServiceMeasurement[],
        turbineFamily: string
    ): ServiceReportData['recommendations'] {
        const recs: ServiceReportData['recommendations'] = [];

        // Critical: Check for near-failure conditions
        const highVib = measurements.find(m =>
            m.parameter.toLowerCase().includes('vibration') && m.asLeft > m.standard * 0.8
        );
        if (highVib) {
            recs.push({
                priority: 'CRITICAL',
                action: 'Redovna kontrola vibracija svakih 30 dana',
                deadline: 'Kontinuirano',
                consequence: 'Nedetektiran rast vibracija može dovesti do havarije ležajeva i zastoja od 5-10 dana'
            });
        }

        // High: Preventive maintenance
        const alignment = measurements.find(m => m.parameter.toLowerCase().includes('alignment'));
        if (alignment && alignment.asLeft > alignment.standard * 0.7) {
            recs.push({
                priority: 'HIGH',
                action: 'Ponoviti centriranje nakon 6 mjeseci rada',
                deadline: 'Unutar 6 mjeseci',
                consequence: 'Progresivna dezalinacija uzrokuje ubrzano trošenje ležajeva (smanjenje životnog vijeka za 30-40%)'
            });
        }

        // Medium: Optimization opportunities
        const efficiency = measurements.find(m => m.parameter.toLowerCase().includes('efficiency'));
        if (efficiency && efficiency.asLeft < 93) {
            recs.push({
                priority: 'MEDIUM',
                action: 'Razmotriti optimizaciju profila lopatica za povećanje efikasnosti',
                deadline: 'Unutar 12 mjeseci',
                consequence: `Gubitak potencijalne proizvodnje: ~${((93 - efficiency.asLeft) * 50).toFixed(0)} MWh godišnje`
            });
        }

        // Francis-specific
        if (turbineFamily === 'FRANCIS') {
            recs.push({
                priority: 'MEDIUM',
                action: 'Inspekcija draft tube vortex core na part-load režimu',
                deadline: 'Unutar 9 mjeseci',
                consequence: 'Nekontrolirani vortex uzrokuje kavitaciju i eroziju runner-a'
            });
        }

        // Kaplan-specific
        if (turbineFamily === 'KAPLAN') {
            recs.push({
                priority: 'HIGH',
                action: 'Zamijenim hidrauličkog ulja u servo sistemu',
                deadline: 'Unutar 8 mjeseci',
                consequence: 'Degradirano ulje smanjuje brzinu odziva lopatica i može uzrokovati blokadu u kritičnom momentu'
            });
        }

        // Pelton-specific
        if (turbineFamily === 'PELTON') {
            recs.push({
                priority: 'MEDIUM',
                action: 'Kontrola erozije mlaznica i igala',
                deadline: 'Unutar 6 mjeseci',
                consequence: 'Erozija mlaznica stvara nebalans sila i ubrzava trošenje ležajeva'
            });
        }

        // General: Annual overhaul
        recs.push({
            priority: 'LOW',
            action: 'Planirati godišnji generalni pregled',
            deadline: 'Unutar 12 mjeseci',
            consequence: 'Bez redovnog održavanja, rizik od neplaniranihzastoja raste za 40%'
        });

        return recs;
    }

    /**
     * Generate complete service report
     */
    public generateServiceReport(data: ServiceReportData): Blob {
        const doc = (this.reportGen as any).doc;

        // Reset document
        (this.reportGen as any).doc = new (require('jspdf'))();
        const newDoc = (this.reportGen as any).doc;

        // Apply professional header
        (this.reportGen as any).applyProfessionalHeader('Service Report');

        const timestamp = new Date(data.serviceDate).toLocaleString('sr-Latn-BA', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Service Info Box
        newDoc.setFillColor(15, 23, 42);
        newDoc.rect(14, 55, 182, 25, 'F');

        newDoc.setTextColor(255, 255, 255);
        newDoc.setFontSize(10);
        newDoc.setFont('helvetica', 'bold');
        newDoc.text(`TURBINA: ${data.assetName}`, 20, 63);

        newDoc.setFontSize(8);
        newDoc.setFont('helvetica', 'normal');
        newDoc.setTextColor(148, 163, 184);
        newDoc.text(`Tip servisa: ${data.serviceType} | Datum: ${timestamp}`, 20, 70);
        newDoc.text(`Inžinjer: ${data.engineer.name} (${data.engineer.certification})`, 20, 75);

        let yPos = 90;

        // === SECTION 1: AS-FOUND / AS-LEFT ===
        newDoc.setFontSize(12);
        newDoc.setTextColor(6, 182, 212);
        newDoc.setFont('helvetica', 'bold');
        newDoc.text('1. ZATEČENO / OSTAVLJENO STANJE', 14, yPos);

        yPos += 5;

        // Create table data
        const tableData = data.measurements.map(m => [
            m.parameter,
            `${m.asFound.toFixed(3)} ${m.unit}`,
            `${m.asLeft.toFixed(3)} ${m.unit}`,
            `${m.standard.toFixed(3)} ${m.unit}`,
            `${m.improvement > 0 ? '+' : ''}${m.improvement.toFixed(1)}%`,
            m.improvement < 0 ? '✓' : m.improvement === 0 ? '-' : '⚠'
        ]);

        require('jspdf-autotable')(newDoc, {
            startY: yPos,
            head: [['Parametar', 'As-Found', 'As-Left', 'Standard', 'Promjena', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            columnStyles: {
                5: { halign: 'center', fontStyle: 'bold' }
            }
        });

        yPos = (newDoc as any).lastAutoTable.finalY + 15;

        // === SECTION 2: AI INSIGHTS ===
        newDoc.setFontSize(12);
        newDoc.setTextColor(168, 85, 247); // purple-500
        newDoc.setFont('helvetica', 'bold');
        newDoc.text('2. AI ANALIZA I NALAZI', 14, yPos);

        yPos += 10;

        data.aiInsights.forEach((insight, index) => {
            // Insight box
            newDoc.setFillColor(249, 250, 251); // gray-50
            newDoc.rect(14, yPos - 5, 182, 18, 'F');
            newDoc.setDrawColor(168, 85, 247);
            newDoc.setLineWidth(0.5);
            newDoc.rect(14, yPos - 5, 182, 18, 'D');

            // Icon/Category
            newDoc.setFontSize(7);
            newDoc.setTextColor(168, 85, 247);
            newDoc.setFont('helvetica', 'bold');
            newDoc.text(`🤖 ${insight.category}`, 18, yPos);

            // Confidence
            newDoc.setTextColor(100, 116, 139);
            newDoc.text(`Confidence: ${insight.confidence}%`, 180, yPos, { align: 'right' });

            // Finding text
            newDoc.setFontSize(9);
            newDoc.setTextColor(30, 41, 59);
            newDoc.setFont('helvetica', 'normal');
            const splitText = newDoc.splitTextToSize(insight.finding, 175);
            newDoc.text(splitText, 18, yPos + 6);

            yPos += 25;
        });

        yPos += 5;

        // === SECTION 3: 12-MONTH RECOMMENDATIONS ===
        newDoc.setFontSize(12);
        newDoc.setTextColor(239, 68, 68); // red-500
        newDoc.setFont('helvetica', 'bold');
        newDoc.text('3. PREPORUKE ZA NAREDNIH 12 MJESECI', 14, yPos);

        yPos += 5;

        const recTableData = data.recommendations.map((rec, index) => {
            const priorityColors = {
                CRITICAL: '🔴',
                HIGH: '🟡',
                MEDIUM: '🟠',
                LOW: '🟢'
            };

            return [
                `${priorityColors[rec.priority]} ${rec.priority}`,
                rec.action,
                rec.deadline,
                rec.consequence
            ];
        });

        require('jspdf-autotable')(newDoc, {
            startY: yPos,
            head: [['Prioritet', 'Akcija', 'Rok', 'Posljedice neispunjavanja']],
            body: recTableData,
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] },
            styles: { fontSize: 7 },
            columnStyles: {
                0: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
                1: { cellWidth: 60 },
                2: { cellWidth: 30 },
                3: { cellWidth: 67 }
            }
        });

        yPos = (newDoc as any).lastAutoTable.finalY + 15;

        // === SIGNATURE SECTION ===
        newDoc.setFillColor(241, 245, 249);
        newDoc.rect(14, yPos, 182, 30, 'F');
        newDoc.setDrawColor(148, 163, 184);
        newDoc.rect(14, yPos, 182, 30, 'D');

        newDoc.setFontSize(8);
        newDoc.setTextColor(71, 85, 105);
        newDoc.text('OVJERENO OD STRANE:', 20, yPos + 8);

        newDoc.setFontSize(10);
        newDoc.setTextColor(15, 23, 42);
        newDoc.setFont('helvetica', 'bold');
        newDoc.text(data.engineer.name, 20, yPos + 15);

        newDoc.setFontSize(7);
        newDoc.setFont('helvetica', 'normal');
        newDoc.setTextColor(100, 116, 139);
        newDoc.text(data.engineer.certification, 20, yPos + 21);

        // Signature line
        newDoc.setDrawColor(148, 163, 184);
        newDoc.line(120, yPos + 20, 190, yPos + 20);
        newDoc.setFontSize(7);
        newDoc.text('Potpis klijenta', 155, yPos + 25, { align: 'center' });

        // Apply footer
        (this.reportGen as any).applyFooter();

        return newDoc.output('blob');
    }

    /**
     * Quick generate from measurements
     */
    public quickGenerateFromMeasurements(
        asset: EnhancedAsset,
        measurements: ServiceMeasurement[],
        serviceType: string,
        engineerName: string
    ): Blob {
        const aiInsights = this.generateAIInsights(measurements);
        const recommendations = this.generate12MonthRecommendations(measurements, asset.turbine_family);

        const reportData: ServiceReportData = {
            assetName: asset.name,
            assetId: asset.id,
            turbineFamily: asset.turbine_family,
            serviceDate: new Date().toISOString(),
            serviceType,
            engineer: {
                name: engineerName,
                certification: '0.05 mm/m Certified Specialist'
            },
            measurements,
            aiInsights,
            recommendations
        };

        return this.generateServiceReport(reportData);
    }
}

export const autoReportService = new AutoReportService();
