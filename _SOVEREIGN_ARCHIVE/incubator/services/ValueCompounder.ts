/**
 * ValueCompounder.ts
 * 
 * The Eternal Ledger
 * Tracks and compounds ROI across all sessions, creating an immutable
 * record of value generated since Genesis.
 */

export interface LedgerEntry {
    timestamp: number;
    eventType: 'PREVENTED_FAILURE' | 'MARKET_GAIN' | 'HEALING_COST';
    amount: number;
    runningTotal: number;
    sessionId: string;
    description: string;
}

export interface SovereignLedger {
    genesisTimestamp: number;
    currentTotal: number;
    entries: LedgerEntry[];
    sessionCount: number;
}

export class ValueCompounder {
    private static ledger: SovereignLedger | null = null;
    private static currentSessionId: string = ValueCompounder.generateSessionId();

    /**
     * Initialize or load the Sovereign Ledger
     */
    public static async initialize(): Promise<void> {
        // In production: Load from database
        // await supabase.from('sovereign_ledger').select('*').single()

        const stored = this.loadFromStorage();

        if (stored) {
            this.ledger = stored;
            console.log(`[ValueCompounder] 📚 Ledger loaded: €${stored.currentTotal.toLocaleString()} since Genesis`);
        } else {
            // First time initialization
            this.ledger = {
                genesisTimestamp: Date.now(),
                currentTotal: 0,
                entries: [],
                sessionCount: 1
            };
            console.log('[ValueCompounder] 🌟 Genesis Ledger created');
        }

        this.ledger.sessionCount++;
    }

    /**
     * Record value event and compound into ledger
     */
    public static recordValue(
        eventType: 'PREVENTED_FAILURE' | 'MARKET_GAIN' | 'HEALING_COST',
        amount: number,
        description: string
    ): LedgerEntry {
        if (!this.ledger) {
            throw new Error('Ledger not initialized. Call initialize() first.');
        }

        const entry: LedgerEntry = {
            timestamp: Date.now(),
            eventType,
            amount,
            runningTotal: this.ledger.currentTotal + amount,
            sessionId: this.currentSessionId,
            description
        };

        this.ledger.currentTotal = entry.runningTotal;
        this.ledger.entries.push(entry);

        // Persist to storage
        this.saveToStorage();

        console.log(`[ValueCompounder] 💰 €${amount.toLocaleString()} | Total: €${entry.runningTotal.toLocaleString()}`);

        return entry;
    }

    /**
     * Get current total value since Genesis
     */
    public static getTotalValue(): number {
        return this.ledger?.currentTotal || 0;
    }

    /**
     * Get ledger statistics
     */
    public static getStats(): {
        totalValue: number;
        daysSinceGenesis: number;
        sessionsCount: number;
        avgValuePerDay: number;
        entriesCount: number;
    } {
        if (!this.ledger) {
            return {
                totalValue: 0,
                daysSinceGenesis: 0,
                sessionsCount: 0,
                avgValuePerDay: 0,
                entriesCount: 0
            };
        }

        const daysSinceGenesis = (Date.now() - this.ledger.genesisTimestamp) / (1000 * 60 * 60 * 24);

        return {
            totalValue: this.ledger.currentTotal,
            daysSinceGenesis,
            sessionsCount: this.ledger.sessionCount,
            avgValuePerDay: daysSinceGenesis > 0 ? this.ledger.currentTotal / daysSinceGenesis : 0,
            entriesCount: this.ledger.entries.length
        };
    }

    /**
     * Get recent entries
     */
    public static getRecentEntries(count: number = 10): LedgerEntry[] {
        if (!this.ledger) return [];
        return this.ledger.entries.slice(-count);
    }

    /**
     * Export ledger for audit
     */
    public static exportLedger(): SovereignLedger | null {
        return this.ledger ? { ...this.ledger } : null;
    }

    /**
     * Save to persistent storage
     */
    private static saveToStorage(): void {
        if (!this.ledger) return;

        // In production: Save to Supabase
        // await supabase.from('sovereign_ledger').upsert(this.ledger)

        // For now: localStorage (browser) or file system (Node)
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sovereign_ledger', JSON.stringify(this.ledger));
        }
    }

    /**
     * Load from persistent storage
     */
    private static loadFromStorage(): SovereignLedger | null {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('sovereign_ledger');
                if (stored) {
                    return JSON.parse(stored);
                }
            }
        } catch (err) {
            console.error('[ValueCompounder] Failed to load ledger:', err);
        }
        return null;
    }

    /**
     * Generate unique session ID
     */
    private static generateSessionId(): string {
        return `SESSION-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
}
