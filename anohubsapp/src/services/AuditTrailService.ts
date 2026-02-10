// Audit Trail Service - Decision Logging
// Records every decision made by the Decision Engine

export interface AuditEntry {
    id: string;
    timestamp: number;
    assetId: string;
    severity: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'NORMAL';
    action: 'SHUTDOWN' | 'REDUCE_LOAD' | 'OPTIMIZE' | 'MONITOR' | 'NONE';
    diagnosis: string;
    reasoning: string;
    contributingFactors: string[];
    sourceModules: string[];
    confidence: number;

    // Action taken
    actionPlan: {
        step1_immediate: string;
        step2_field: string;
        step3_longterm: string;
    };

    // Operator response
    operatorAcknowledged: boolean;
    operatorNotes?: string;
    timeToAcknowledge?: number; // milliseconds

    // Outcome tracking
    wasCorrect?: boolean; // Did the decision prevent failure?
    actualOutcome?: string;
}

export class AuditTrailService {
    private static entries: Map<string, AuditEntry> = new Map();

    /**
     * Log a decision to audit trail
     */
    static logDecision(
        assetId: string,
        decision: any // TriageDecision type
    ): string {
        const entry: AuditEntry = {
            id: `AUDIT_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            timestamp: decision.timestamp,
            assetId,
            severity: decision.severity,
            action: decision.action,
            diagnosis: decision.primaryDiagnosis,
            reasoning: decision.reasoning,
            contributingFactors: decision.contributingFactors,
            sourceModules: decision.sourceModules,
            confidence: decision.confidence,
            actionPlan: decision.actionPlan,
            operatorAcknowledged: false
        };

        this.entries.set(entry.id, entry);

        // In production: Save to database
        console.log('🧠 DECISION ENGINE AUDIT:', entry);

        return entry.id;
    }

    /**
     * Operator acknowledges decision
     */
    static acknowledgeDecision(
        entryId: string,
        operatorNotes?: string
    ): void {
        const entry = this.entries.get(entryId);
        if (!entry) return;

        entry.operatorAcknowledged = true;
        entry.operatorNotes = operatorNotes;
        entry.timeToAcknowledge = Date.now() - entry.timestamp;

        this.entries.set(entryId, entry);
    }

    /**
     * Record actual outcome (for ML training)
     */
    static recordOutcome(
        entryId: string,
        wasCorrect: boolean,
        actualOutcome: string
    ): void {
        const entry = this.entries.get(entryId);
        if (!entry) return;

        entry.wasCorrect = wasCorrect;
        entry.actualOutcome = actualOutcome;

        this.entries.set(entryId, entry);

        // In production: Use this for ML model re-training
        console.log('📊 OUTCOME RECORDED:', { entryId, wasCorrect, actualOutcome });
    }

    /**
     * Get audit trail for asset
     */
    static getAuditTrail(assetId: string, limit: number = 50): AuditEntry[] {
        return Array.from(this.entries.values())
            .filter(e => e.assetId === assetId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Get critical decisions (for review)
     */
    static getCriticalDecisions(limit: number = 20): AuditEntry[] {
        return Array.from(this.entries.values())
            .filter(e => e.severity === 'CRITICAL')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Generate audit report
     */
    static generateAuditReport(assetId: string, fromDate: number, toDate: number): string {
        const entries = Array.from(this.entries.values())
            .filter(e => e.assetId === assetId && e.timestamp >= fromDate && e.timestamp <= toDate)
            .sort((a, b) => a.timestamp - b.timestamp);

        let report = `AUDIT TRAIL REPORT\n`;
        report += `Asset: ${assetId}\n`;
        report += `Period: ${new Date(fromDate).toLocaleString()} - ${new Date(toDate).toLocaleString()}\n`;
        report += `Total Decisions: ${entries.length}\n\n`;
        report += `=`.repeat(80) + `\n\n`;

        entries.forEach((entry, index) => {
            report += `${index + 1}. ${new Date(entry.timestamp).toLocaleString()}\n`;
            report += `   Severity: ${entry.severity} | Action: ${entry.action}\n`;
            report += `   Diagnosis: ${entry.diagnosis}\n`;
            report += `   Confidence: ${entry.confidence}%\n`;
            report += `   Sources: ${entry.sourceModules.join(', ')}\n`;
            report += `\n   REASONING:\n   ${entry.reasoning.split('\n').join('\n   ')}\n`;
            report += `\n   ACTION PLAN:\n`;
            report += `   1. ${entry.actionPlan.step1_immediate}\n`;
            report += `   2. ${entry.actionPlan.step2_field}\n`;
            report += `   3. ${entry.actionPlan.step3_longterm}\n`;

            if (entry.operatorAcknowledged) {
                report += `\n   ✓ Acknowledged (${(entry.timeToAcknowledge! / 1000).toFixed(0)}s)\n`;
                if (entry.operatorNotes) {
                    report += `   Operator: ${entry.operatorNotes}\n`;
                }
            }

            if (entry.wasCorrect !== undefined) {
                report += `\n   OUTCOME: ${entry.wasCorrect ? '✓ Correct' : '✗ Incorrect'}\n`;
                report += `   Details: ${entry.actualOutcome}\n`;
            }

            report += `\n` + `=`.repeat(80) + `\n\n`;
        });

        return report;
    }
}
