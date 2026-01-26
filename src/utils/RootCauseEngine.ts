import { AuditSnapshot } from '../stores/useDigitalLedger';
import BaseGuardian from '../services/BaseGuardian';

export interface CausalEvent {
    id: string;
    sensorId: string;
    eventType: 'deviation' | 'threshold_breach' | 'cascade' | 'trip';
    timestamp: number;
    magnitude: number;
    description: string;
    confidence: number;
}

export interface RootCauseAnalysis {
    primaryAggressor: {
        sensorId: string;
        deviationTime: number;
        magnitude: number;
        baselineValue: number;
        actualValue: number;
    };
    causalChain: CausalEvent[];
    confidence: number;
    summary: string;
}

export class RootCauseEngine extends BaseGuardian {
    /**
     * Analyze snapshot to identify root cause and build causal chain
     */
    static analyze(snapshot: AuditSnapshot): RootCauseAnalysis {
        const diagnostics = snapshot.data.diagnostics || [];

        // Sort diagnostics by severity and timestamp
        const sortedDiagnostics = [...diagnostics].sort((a, b) => {
            const severityOrder = { critical: 0, warning: 1, info: 2 };
            const aSeverity = severityOrder[a.type as keyof typeof severityOrder] ?? 3;
            const bSeverity = severityOrder[b.type as keyof typeof severityOrder] ?? 3;

            if (aSeverity !== bSeverity) return aSeverity - bSeverity;
            return (a.timestamp || 0) - (b.timestamp || 0);
        });

        // Identify primary aggressor (first critical deviation)
        const primaryDiag = sortedDiagnostics[0] || {
            id: 'UNKNOWN',
            messageKey: 'Unknown Fault',
            type: 'critical',
            value: 'N/A',
            timestamp: Date.now()
        };

        const primaryAggressor = {
            sensorId: primaryDiag.id || 'SENSOR-UNKNOWN',
            deviationTime: primaryDiag.timestamp || snapshot.timestamp,
            magnitude: this.calculateMagnitude(primaryDiag),
            baselineValue: 0, // Would come from historical data
            actualValue: parseFloat(primaryDiag.value || '0')
        };

        // Build causal chain
        const causalChain = this.buildCausalChain(sortedDiagnostics, snapshot.timestamp);

        // Calculate overall confidence
        const confidence = this.calculateConfidence(causalChain, diagnostics.length);

        // Generate summary
        const summary = this.generateSummary(primaryAggressor, causalChain);

        return {
            primaryAggressor,
            causalChain,
            confidence,
            summary
        };
    }

    /**
     * Calculate deviation magnitude from diagnostic
     */
    private static calculateMagnitude(diagnostic: any): number {
        // Extract numeric value if possible
        const valueStr = diagnostic.value || '0';
        const match = valueStr.match(/[\d.]+/);
        if (!match) return 0;

        const value = parseFloat(match[0]);

        // Simple heuristic: if value > 100, assume percentage deviation
        if (value > 100) return value - 100;

        return value;
    }

    /**
     * Build causal chain from diagnostics
     */
    private static buildCausalChain(diagnostics: any[], snapshotTime: number): CausalEvent[] {
        const chain: CausalEvent[] = [];
        const timeWindow = 5000; // 5 second correlation window

        diagnostics.forEach((diag, index) => {
            const eventTime = diag.timestamp || snapshotTime - (diagnostics.length - index) * 1000;

            let eventType: CausalEvent['eventType'] = 'deviation';
            if (diag.type === 'critical') eventType = 'threshold_breach';
            if (index > 0 && index < diagnostics.length - 1) eventType = 'cascade';
            if (index === diagnostics.length - 1 && diag.type === 'critical') eventType = 'trip';

            chain.push({
                id: `EVENT-${index}`,
                sensorId: diag.id || `SENSOR-${index}`,
                eventType,
                timestamp: eventTime,
                magnitude: this.calculateMagnitude(diag),
                description: diag.messageKey || 'Unknown event',
                confidence: this.calculateEventConfidence(diag, index, diagnostics.length)
            });
        });

        return chain.slice(0, 5); // Limit to 5 events for clarity
    }

    /**
     * Calculate confidence for individual event
     */
    private static calculateEventConfidence(diag: any, index: number, total: number): number {
        let confidence = 70; // Base confidence

        // Higher confidence for critical events
        if (diag.type === 'critical') confidence += 20;

        // Higher confidence for earlier events (likely root cause)
        if (index === 0) confidence += 10;

        // Lower confidence if too many events (noisy data)
        if (total > 10) confidence -= 15;

        return Math.min(Math.max(confidence, 0), 100);
    }

    /**
     * Calculate overall analysis confidence
     */
    private static calculateConfidence(chain: CausalEvent[], totalDiagnostics: number): number {
        if (chain.length === 0) return 0;

        const avgEventConfidence = chain.reduce((sum, e) => sum + e.confidence, 0) / chain.length;

        // Penalize if too few or too many events
        let penalty = 0;
        if (chain.length < 2) penalty = 20;
        if (totalDiagnostics > 20) penalty = 15;

        return Math.round(Math.max(avgEventConfidence - penalty, 0));
    }

    /**
     * Generate human-readable summary
     */
    private static generateSummary(aggressor: RootCauseAnalysis['primaryAggressor'], chain: CausalEvent[]): string {
        const aggressorName = aggressor.sensorId.replace('SENSOR-', '').replace(/_/g, ' ');
        const chainLength = chain.length;

        if (chainLength === 0) {
            return `Primary fault detected in ${aggressorName}. No causal chain identified.`;
        }

        const lastEvent = chain[chain.length - 1];
        const cascadeCount = chain.filter(e => e.eventType === 'cascade').length;

        return `Root cause: ${aggressorName} deviation at ${new Date(aggressor.deviationTime).toLocaleTimeString()}. ` +
            `Triggered ${cascadeCount} cascade event(s) leading to ${lastEvent.description}.`;
    }

    public getConfidenceScore(..._args: any[]): number {
        // Root cause analysis derives confidence from event chain; default neutral fallback
        return this.corrToScore(0);
    }
}
