// Technical Audit Report UI Module
// This module invokes the ReportGenerator to create the "15-Year Experience" PDF.

import React from 'react';
import { FileText, Download, ShieldCheck, AlertTriangle } from 'lucide-react';
import { reportGenerator } from '../features/reporting/ReportGenerator';
import { GlassCard } from '../shared/components/ui/GlassCard';

export const TechnicalAuditReportModule: React.FC = () => {

    const handleGenerateReport = () => {
        // MOCK DATA - In production this comes from SmartStartService, VisualInspectionService, etc.
        const mockData = {
            assetDetails: {
                name: "T2 - KAPLAN PIT (Agregat 2)",
                location: "Powerhouse Level -2",
                timestamp: new Date().toISOString()
            },
            executiveSummary: {
                status: 'YELLOW' as const,
                overallHealth: 78,
                criticalIssues: 1,
                recommendedActions: [
                    'Address Legacy Alert #3: Grease Overfill',
                    'Verify Guide Vane Upper clearance (0.06mm deviation)'
                ]
            },
            siteConditions: {
                grossHead: 45.5,
                waterQuality: 'CLEAN',
                flowRate: 12.5,
                designFlow: 12.5
            },
            hydraulics: {
                staticPressure: 4.5,
                surgePressure: 5.8,
                flowVelocity: 3.2,
                frictionLoss: 0.8,
                netHead: 44.7
            },
            mechanical: {
                boltGrade: '10.9',
                boltCount: 24,
                torqueApplied: 850,
                bearingType: 'Segmental Thrust',
                alignment: 0.04
            },
            thermalAdjustment: {
                ambientTemp: 12,
                operatingTemp: 55,
                thermalExpansion: 0.12,
                appliedOffset: -0.12,
                validationStatus: "COMPLIANT (Physics Model Verified)"
            }
        };

        const blob = reportGenerator.generateTechnicalAuditReport(mockData);
        reportGenerator.downloadReport(blob, `AnoHUB_Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-cyan-400" />
                        Technical Audit Report
                    </h3>
                    <p className="text-sm text-slate-400">Generate certified PDF documentation.</p>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-700">
                    <FileText className="text-slate-500 w-8 h-8" />
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="p-3 bg-slate-900/50 rounded flex items-start gap-3 border border-slate-800">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                        <div className="text-sm font-bold text-slate-200">Mechanical Integrity</div>
                        <div className="text-xs text-slate-500">Includes 0.05mm deviation charts</div>
                    </div>
                </div>
                <div className="p-3 bg-red-950/20 rounded flex items-start gap-3 border border-red-900/30">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                        <div className="text-sm font-bold text-red-200">Legacy Risk Alerts</div>
                        <div className="text-xs text-red-400">Includes "Grease Disaster" prevention ROI</div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleGenerateReport}
                className="w-full py-4 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-400 rounded-lg font-bold flex items-center justify-center gap-2 transition-all group"
            >
                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                DOWNLOAD AUDIT PDF
            </button>
        </GlassCard>
    );
};
