/**
 * ARCHIVE SEARCH ENGINE
 * The Deep Reader 🔍📚
 * Performs deep keyword search across the station's documentation.
 */

export interface ArchiveDocument {
    id: string;
    title: string;
    type: 'MANUAL' | 'REPORT' | 'LOG' | 'DRAWING';
    date: string;
    contentTag: string; // Simulated full-text index tags
    snippet: string;
}

import BaseGuardian from './BaseGuardian';

export class ArchiveSearchEngine extends BaseGuardian {
    private library: ArchiveDocument[] = [
        {
            id: 'DOC_108',
            title: 'Pelton Runner Operation Manual',
            type: 'MANUAL',
            date: '2020-05-15',
            contentTag: 'cavitation efficiency nozzle needle vibration',
            snippet: '...ensure needle tip alignment to prevent cavitation damage on the buckets...'
        },
        {
            id: 'RPT_2018_04',
            title: 'Incident Report: Unit 2 Thrust Bearing',
            type: 'REPORT',
            date: '2018-04-12',
            contentTag: 'thrust bearing temperature sensor failure te_101',
            snippet: '...false high temperature reading caused by sensor wire fatigue...'
        },
        {
            id: 'DRW_42',
            title: 'Surge Tank Assembly',
            type: 'DRAWING',
            date: '1998-11-20',
            contentTag: 'water hammer surge tank relief valve',
            snippet: '(Drawing Content: Section C shows relief valve piping)'
        }
    ];

    /**
     * SEARCH ARCHIVE
     * Finds documents matching the query.
     */
    search(query: string): ArchiveDocument[] {
        const q = query.toLowerCase();
        return this.library.filter(doc =>
            doc.title.toLowerCase().includes(q) ||
            doc.contentTag.includes(q)
        );
    }

    public getConfidenceScore(..._args: any[]): number {
        // Archive searches are deterministic; return neutral confidence
        return this.corrToScore(0);
    }
}
