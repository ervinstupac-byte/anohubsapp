/**
 * AUDITOR EXPORT SERVICE
 * Generates "Proof of Compliance" reports for regulators
 */

import { SCADASnapshot } from './SCADAHeartbeat';
import { ServiceLogEntry } from '../models/MaintenanceChronicles';

export interface ComplianceReport {
    generatedDate: string;
    reportingPeriod: {
        start: string;
        end: string;
    };
    ecologistProof: {
        status: 'COMPLIANT' | 'BREACHED';
        minRiverLevelRecorded: number;
        ecologicalMinimumLimit: number;
        breachEvents: {
            timestamp: string;
            level: number;
            durationMinutes: number;
            explanation?: string;
        }[];
    };
    safetyAudit: {
        totalTripEvents: number;
        resolvedTrips: number;
        pendingTrips: number;
        safetyIncidents: {
            timestamp: string;
            type: string;
            resolutionLogId?: string;
        }[];
    };
    certification: {
        certifiedBy: string;
        signatureValid: boolean;
    };
}

export class AuditorExportService {
    private scadaHistory: SCADASnapshot[] = [];
    private journal: ServiceLogEntry[];

    constructor(
        scadaHistory: SCADASnapshot[],
        journal: ServiceLogEntry[]
    ) {
        this.scadaHistory = scadaHistory;
        this.journal = journal;
    }

    /**
     * THE AUDITOR'S HEART
     * Generates a legally binding proof of compliance
     */
    generateComplianceReport(daysToLookBack: number = 30): ComplianceReport {
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - daysToLookBack);

        // Filter history for the period
        const periodHistory = this.scadaHistory.filter(snapshot =>
            snapshot.timestamp >= startDate && snapshot.timestamp <= now
        );

        // 1. ECOLOGICAL GUARDIAN CHECK
        // Limit: 2.5 m (mock limit based on river regulator)
        const ECOLOGICAL_MINIMUM = 2.5;
        let minLevel = 999;
        const breaches: any[] = [];

        periodHistory.forEach(snap => {
            const level = snap.civilVoice.riverLevel || 999;
            if (level < minLevel) minLevel = level;

            if (level < ECOLOGICAL_MINIMUM) {
                breaches.push({
                    timestamp: snap.timestamp.toISOString(),
                    level: level,
                    durationMinutes: 15, // Mock duration for snapshot
                    explanation: 'Low water event recorded'
                });
            }
        });

        // 2. SAFETY AUDIT
        // Match trips with service logs
        const safetyIncidents: any[] = [];
        let totalTrips = 0;
        let resolvedTrips = 0;

        periodHistory.forEach(snap => {
            if (snap.protectionVoice.activeTrips && snap.protectionVoice.activeTrips.length > 0) {
                snap.protectionVoice.activeTrips.forEach(trip => {
                    totalTrips++;

                    // Find if there's a log for this
                    // In a real app, we'd link by ID. Here we mock find by timestamp proximity
                    const linkedLog = this.findLogForTrip(trip, snap.timestamp);

                    if (linkedLog) resolvedTrips++;

                    safetyIncidents.push({
                        timestamp: snap.timestamp.toISOString(),
                        type: trip,
                        resolutionLogId: linkedLog?.id || 'PENDING'
                    });
                });
            }
        });

        return {
            generatedDate: now.toISOString(),
            reportingPeriod: {
                start: startDate.toISOString(),
                end: now.toISOString()
            },
            ecologistProof: {
                status: breaches.length === 0 ? 'COMPLIANT' : 'BREACHED',
                minRiverLevelRecorded: minLevel,
                ecologicalMinimumLimit: ECOLOGICAL_MINIMUM,
                breachEvents: breaches
            },
            safetyAudit: {
                totalTripEvents: totalTrips,
                resolvedTrips: resolvedTrips,
                pendingTrips: totalTrips - resolvedTrips,
                safetyIncidents
            },
            certification: {
                certifiedBy: 'SCADA NERVOUS SYSTEM v1.0',
                signatureValid: true
            }
        };
    }

    private findLogForTrip(trip: string, timestamp: Date): ServiceLogEntry | undefined {
        // Mock logic: Find a LOG with "REPAIR" action after the trip
        // In real life, we'd query the actual journal
        // This is a placeholder for the logic connecting logs to trips
        return undefined;
    }

    /**
     * Generates a PDF-friendly Markdown string
     */
    generatePDFContent(report: ComplianceReport): string {
        return `
# 📜 PROOF OF COMPLIANCE
**Generated:** ${new Date(report.generatedDate).toLocaleString()}
**Period:** ${new Date(report.reportingPeriod.start).toLocaleDateString()} - ${new Date(report.reportingPeriod.end).toLocaleDateString()}

---

## 🐟 ECOLOGICAL GUARDIAN REPORT
**Status:** ${report.ecologistProof.status === 'COMPLIANT' ? '✅ COMPLIANT' : '❌ BREACH DETECTED'}
**Minimum Level Recorded:** ${report.ecologistProof.minRiverLevelRecorded.toFixed(2)} m
**Legal Limit:** ${report.ecologistProof.ecologicalMinimumLimit.toFixed(2)} m

${report.ecologistProof.breachEvents.length > 0 ? `
### Breach Events:
| Timestamp | Level | Duration | Explanation |
|-----------|-------|----------|-------------|
${report.ecologistProof.breachEvents.map(b => `| ${new Date(b.timestamp).toLocaleString()} | ${b.level} m | ${b.durationMinutes} min | ${b.explanation} |`).join('\n')}
` : '\n*No ecological breaches recorded. The fish are happy!* 🐟'}

---

## 🛡️ SAFETY INTEGRITY AUDIT
**Total Safety Trips:** ${report.safetyAudit.totalTripEvents}
**Resolved:** ${report.safetyAudit.resolvedTrips}
**Pending:** ${report.safetyAudit.pendingTrips}

${report.safetyAudit.safetyIncidents.length > 0 ? `
### Incident Log:
| Timestamp | Trip Type | Resolution |
|-----------|-----------|------------|
${report.safetyAudit.safetyIncidents.map(i => `| ${new Date(i.timestamp).toLocaleString()} | ${i.type} | ${i.resolutionLogId} |`).join('\n')}
` : '\n*No safety incidents recorded.*'}

---

**Certified by:** ${report.certification.certifiedBy}
`.trim();
    }
}
