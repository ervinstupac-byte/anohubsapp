/**
 * DATA ENRICHER SERVICE
 * The Archaeologist & The Architect 🏛️📐
 * 
 * 1. Scans existing assets for missing v1.0 passport fields.
 * 2. Re-analyzes historical data using new v1.0 Engines.
 */

import { AssetNode, AssetNodeType } from '../models/AssetHierarchy';
import { VibrationExpert } from './VibrationExpert';
import { SandErosionTracker } from './SandErosionTracker';

export interface MetadataGap {
    assetPath: string;
    missingField: string;
    actionRequired: string;
    criticality: 'HIGH' | 'MEDIUM';
}

export interface HistoricalInsight {
    date: string;
    event: string;
    v1_0_Diagnosis: string;
    missedByLegacy: boolean;
}

export class DataEnricher {
    private vibrationExpert = new VibrationExpert();
    private sandExpert = new SandErosionTracker();

    /**
     * THE METADATA UPGRADE
     * Scans the asset tree for fields required by v1.0
     */
    auditAssetMetadata(root: AssetNode): MetadataGap[] {
        const gaps: MetadataGap[] = [];

        // Helper to traverse
        const traverse = (node: AssetNode) => {
            // Check based on known types
            if (node.name.includes('Runner') || node.name.includes('Blades')) {
                // Check for v1.0 fields
                if (!node.metadata.specifications?.numberOfBlades) {
                    gaps.push({
                        assetPath: node.path,
                        missingField: 'numberOfBlades',
                        actionRequired: 'Count blades from drawings',
                        criticality: 'HIGH'
                    });
                }
                if (!node.metadata.specifications?.material) {
                    gaps.push({
                        assetPath: node.path,
                        missingField: 'material',
                        actionRequired: 'Verify metallurgy (13-4 SS?)',
                        criticality: 'HIGH'
                    });
                }
            }

            if (node.name.includes('Bearing')) {
                if (node.metadata.specifications?.axialSecure === undefined) {
                    gaps.push({
                        assetPath: node.path,
                        missingField: 'axialSecure',
                        actionRequired: 'Determine if gravity bonded or double-acting',
                        criticality: 'HIGH'
                    });
                }
            }

            if (node.name.includes('HPU') || node.name.includes('Oil')) {
                // Hypothetical check for HPU node fields if we had them explicitly in specs
                // For now, let's assume we check for ISO target
            }

            node.children.forEach(traverse);
        };

        traverse(root);
        return gaps;
    }

    /**
     * HISTORICAL PATTERN MATCH
     * Re-runs history through the new Brains.
     */
    analyzeHistory(legacyLog: any[]): HistoricalInsight[] {
        const insights: HistoricalInsight[] = [];

        legacyLog.forEach(entry => {
            // 1. Re-analyze Vibration
            if (entry.type === 'VIBRATION_EVENT') {
                // Simulateding data structure of legacy log
                const diag = this.vibrationExpert.checkFrequencyPeaks(
                    entry.peaks, entry.rpm, entry.blades
                );

                if (diag.danger && !entry.wasFlaggedAsHydraulic) {
                    insights.push({
                        date: entry.date,
                        event: `Legacy Vibration Alert (${entry.amplitude} mm/s)`,
                        v1_0_Diagnosis: `BPF MATCH: ${diag.cause} -> ${diag.recommendation}`,
                        missedByLegacy: true
                    });
                }
            }

            // 2. Re-analyze Sand
            if (entry.type === 'HIGH_TURBIDITY') {
                const report = this.sandExpert.trackErosion(entry.ppm, entry.head, 45); // Assuming head logic
                if (report.severity === 'EXTREME' && entry.actionTaken === 'NONE') {
                    insights.push({
                        date: entry.date,
                        event: `High Turbidity (${entry.ppm} PPM)`,
                        v1_0_Diagnosis: `EROSION CRITICAL: ${(report as any).bucketThinningRate?.toFixed(1)} µm/yr wear rate. Alert should have triggered!`,
                        missedByLegacy: true
                    });
                }
            }
        });

        return insights;
    }
}
