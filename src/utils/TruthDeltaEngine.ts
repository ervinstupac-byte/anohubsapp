import { DiagnosticInsight } from '../hooks/useContextEngine';
import BaseGuardian from '../services/BaseGuardian';

export interface TruthDelta {
    componentId: string;
    componentName: string;
    sensorStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
    humanStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
    agreement: 'sync_healthy' | 'sync_fault' | 'conflict' | 'unknown';
    conflictType?: 'false_positive' | 'false_negative';
    color: string;
    confidence: number; // 0-100%
}

export interface TruthDeltaMap {
    runner: TruthDelta;
    crown: TruthDelta;
    band: TruthDelta;
    noseCone: TruthDelta;
}

/**
 * Truth Delta Engine
 * Calculates agreement/conflict between Sentinel diagnostics and human logs
 * with EMA smoothing for stable color transitions
 */
export class TruthDeltaEngine extends BaseGuardian {
    // EMA state cache (component -> smoothed confidence)
    private static emaCache: Record<string, number> = {};
    private static readonly EMA_ALPHA = 0.3; // Smoothing factor (0.3 = 5-second window approx)

    /**
     * Calculate truth delta for all turbine components
     */
    static calculateDeltaMap(
        diagnostics: DiagnosticInsight[],
        humanLogs: any[]
    ): TruthDeltaMap {
        // Component mapping
        const components = ['runner', 'crown', 'band', 'noseCone'] as const;

        const deltaMap: any = {};

        components.forEach(comp => {
            deltaMap[comp] = this.calculateComponentDelta(comp, diagnostics, humanLogs);
        });

        return deltaMap as TruthDeltaMap;
    }

    /**
     * Calculate delta for a single component
     */
    private static calculateComponentDelta(
        componentId: string,
        diagnostics: DiagnosticInsight[],
        humanLogs: any[]
    ): TruthDelta {
        // Extract sensor status from diagnostics
        const sensorDiag = diagnostics.find(d =>
            d.messageKey.toLowerCase().includes(componentId) ||
            d.messageKey.toLowerCase().includes('runner') ||
            d.messageKey.toLowerCase().includes('bearing')
        );

        const sensorStatus = sensorDiag
            ? (sensorDiag.type === 'critical' ? 'critical' : sensorDiag.type === 'warning' ? 'warning' : 'healthy')
            : 'unknown';

        // Extract human status from logs
        const humanLog = humanLogs.find(log => {
            const text = (log.summaryDE || log.commentBS || '').toLowerCase();
            return text.includes(componentId) ||
                text.includes('runner') ||
                text.includes('blade') ||
                text.includes('bearing');
        });

        let humanStatus: 'healthy' | 'warning' | 'critical' | 'unknown' = 'unknown';

        if (humanLog) {
            const text = (humanLog.summaryDE || humanLog.commentBS || '').toLowerCase();
            if (text.includes('critical') || text.includes('fault') || text.includes('failure')) {
                humanStatus = 'critical';
            } else if (text.includes('warning') || text.includes('check') || text.includes('inspect')) {
                humanStatus = 'warning';
            } else {
                humanStatus = 'healthy';
            }
        }

        // Calculate agreement
        const { agreement, conflictType, color, confidence } = this.determineAgreement(
            sensorStatus,
            humanStatus
        );

        // Apply EMA smoothing to confidence
        const cacheKey = `${componentId}_confidence`;
        const previousConfidence = this.emaCache[cacheKey] || confidence;
        const smoothedConfidence = Math.round(
            previousConfidence * (1 - this.EMA_ALPHA) + confidence * this.EMA_ALPHA
        );
        this.emaCache[cacheKey] = smoothedConfidence;

        return {
            componentId,
            componentName: componentId.charAt(0).toUpperCase() + componentId.slice(1),
            sensorStatus,
            humanStatus,
            agreement,
            conflictType,
            color,
            confidence: smoothedConfidence // Use smoothed value
        };
    }

    /**
     * Determine agreement status and color
     */
    private static determineAgreement(
        sensorStatus: string,
        humanStatus: string
    ): {
        agreement: 'sync_healthy' | 'sync_fault' | 'conflict' | 'unknown';
        conflictType?: 'false_positive' | 'false_negative';
        color: string;
        confidence: number;
    } {
        // Unknown state
        if (sensorStatus === 'unknown' || humanStatus === 'unknown') {
            return {
                agreement: 'unknown',
                color: '#64748b', // Slate-500 (neutral gray)
                confidence: 0
            };
        }

        // Perfect sync - both healthy
        if (sensorStatus === 'healthy' && humanStatus === 'healthy') {
            return {
                agreement: 'sync_healthy',
                color: '#22d3ee', // Cyan-500 (tactical healthy)
                confidence: 100
            };
        }

        // Perfect sync - both detect fault
        if ((sensorStatus === 'critical' || sensorStatus === 'warning') &&
            (humanStatus === 'critical' || humanStatus === 'warning')) {
            return {
                agreement: 'sync_fault',
                color: '#ef4444', // Red-500 (tactical critical)
                confidence: 95
            };
        }

        // Conflict - Sensor warns, human says safe (False Positive)
        if ((sensorStatus === 'critical' || sensorStatus === 'warning') && humanStatus === 'healthy') {
            return {
                agreement: 'conflict',
                conflictType: 'false_positive',
                color: '#a855f7', // Purple-500 (AI overcautious)
                confidence: 40
            };
        }

        // Conflict - Sensor says safe, human warns (False Negative - DANGEROUS)
        if (sensorStatus === 'healthy' && (humanStatus === 'critical' || humanStatus === 'warning')) {
            return {
                agreement: 'conflict',
                conflictType: 'false_negative',
                color: '#f59e0b', // Amber-500 (missed detection)
                confidence: 30
            };
        }

        // Default unknown
        return {
            agreement: 'unknown',
            color: '#64748b',
            confidence: 50
        };
    }

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
