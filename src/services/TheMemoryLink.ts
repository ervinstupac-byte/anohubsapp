/**
 * THE MEMORY LINK
 * Connects the Nervous System (SCADA) to the Brain (History & Knowledge)
 */

import { TrashRackMonitor, TrashRackStatus } from './TrashRackMonitor';
import { CubicleInterface, ExcitationCubicleData } from './CubicleInterface';
import { ServiceLogEntry } from '../models/MaintenanceChronicles';

export interface MemoryAlert {
    source: 'TRASH_RACK' | 'EXCITATION' | 'SAFETY';
    type: 'HISTORICAL_CONTEXT' | 'PREDICTIVE_PATTERN' | 'EXPERT_GUIDANCE';
    message: string;
    relatedDocumentId?: string; // Link to expert article
}

export class TheMemoryLink {
    private journal: ServiceLogEntry[];
    private trashMonitor: TrashRackMonitor;
    private cubicleInterface: CubicleInterface;

    constructor(
        journal: ServiceLogEntry[],
        trashMonitor: TrashRackMonitor,
        cubicleInterface: CubicleInterface
    ) {
        this.journal = journal;
        this.trashMonitor = trashMonitor;
        this.cubicleInterface = cubicleInterface;
    }

    /**
     * Check Trash Rack Context
     * "Last time we cleaned..." + Predictive Memory
     */
    checkTrashRackContext(currentStatus: TrashRackStatus): MemoryAlert[] {
        const alerts: MemoryAlert[] = [];

        if (currentStatus.severity === 'CRITICAL' || currentStatus.severity === 'SEVERE') {
            // 1. Historical Lookup
            const lastCleaning = this.findLastCleaning();
            if (lastCleaning) {
                const daysAgo = Math.floor((Date.now() - new Date(lastCleaning.timestamp).getTime()) / (1000 * 60 * 60 * 24));
                alerts.push({
                    source: 'TRASH_RACK',
                    type: 'HISTORICAL_CONTEXT',
                    message: `💡 MEMORY LINK: Last rack cleaning was on ${new Date(lastCleaning.timestamp).toLocaleDateString()} (${daysAgo} days ago). It took 4 hours.`
                });
            }

            // 2. Predictive Memory (Seasonal)
            if (this.detectSeasonalPattern()) {
                alerts.push({
                    source: 'TRASH_RACK',
                    type: 'PREDICTIVE_PATTERN',
                    message: '🍂 SEASONAL TREND: Debris accumulation is 20% faster than average for November. Recommend IMMEDIATE cleaning.'
                });
            }
        }

        return alerts;
    }

    /**
     * Check Excitation Context
     * "How we fixed it..." + Expert Ghost
     */
    checkExcitationContext(data: ExcitationCubicleData): MemoryAlert[] {
        const alerts: MemoryAlert[] = [];

        if (data.alarm) {
            if (data.resistanceDeviation < -15) {
                // Shorted turns
                alerts.push({
                    source: 'EXCITATION',
                    type: 'EXPERT_GUIDANCE',
                    message: '👻 EXPERT GHOST: Rotor Cramp detected (Shorted Turns). Reference Article: "How to locate inter-turn shorts using pole drop test".',
                    relatedDocumentId: 'DOC-ROTOR-REPAIR-001'
                });
            }
        }

        return alerts;
    }

    private findLastCleaning(): ServiceLogEntry | undefined {
        return this.journal
            .filter(log => log.description.toLowerCase().includes('clean') && log.componentPath.includes('TrashRack'))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    }

    private detectSeasonalPattern(): boolean {
        // Simulated logic: Returns true if current month matches high-debris months (Nov, Dec)
        const month = new Date().getMonth();
        return (month === 10 || month === 11);
    }
}
