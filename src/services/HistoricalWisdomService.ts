/**
 * HISTORICAL WISDOM SERVICE
 * The Time Connector 🕰️📖
 * Correlates current sensor failures or alarms with past incidents.
 */

import { ArchiveSearchEngine, ArchiveDocument } from './ArchiveSearchEngine';

export class HistoricalWisdomService {
    private searchEngine: ArchiveSearchEngine;

    constructor() {
        this.searchEngine = new ArchiveSearchEngine();
    }

    /**
     * FIND PRECEDENT
     * Checks if this failure has happened before.
     */
    findPrecedent(issueType: string, component: string): ArchiveDocument | null {
        // Construct a search query
        const query = `${component} ${issueType}`;
        const results = this.searchEngine.search(query);

        // Return the most relevant/recent report
        return results.find(d => d.type === 'REPORT') || null;
    }
}
