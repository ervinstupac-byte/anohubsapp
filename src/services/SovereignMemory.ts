/**
 * SOVEREIGN MEMORY
 * The Persistence Layer 💾🧠
 * 
 * Ensures that the Fortress never forgets.
 * Stores: Field Notes, Molecular Debt, Vibration Baselines, and Ancestral Wisdom.
 * Persistence Strategy: LocalStorage (Browser) with In-Memory fallback (Node/Test).
 */

export interface FieldNote {
    id: string;
    drawingId: string;
    author: string;
    content: string;
    timestamp: number;
}

export class SovereignMemory {
    private isBrowser: boolean;
    private memoryCache: Map<string, any> = new Map();

    constructor() {
        this.isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    // --- CORE STORAGE METHODS ---

    private setItem(key: string, value: any): void {
        const serialized = JSON.stringify(value);
        if (this.isBrowser) {
            window.localStorage.setItem(`sovereign_${key}`, serialized);
        }
        this.memoryCache.set(key, value);
        console.log(`[MEMORY SAVE] ${key}`);
    }

    private getItem<T>(key: string): T | null {
        // Try Cache First
        if (this.memoryCache.has(key)) {
            return this.memoryCache.get(key) as T;
        }

        // Try Storage
        if (this.isBrowser) {
            const raw = window.localStorage.getItem(`sovereign_${key}`);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    this.memoryCache.set(key, parsed); // Hydrate cache
                    return parsed as T;
                } catch (e) {
                    console.error(`[MEMORY CORRUPTION] Failed to parse ${key}`, e);
                    return null;
                }
            }
        }
        return null;
    }

    // --- DOMAIN SPECIFIC METHODS ---

    /**
     * MOLECULAR DEBT TRACKING
     */
    saveMolecularDebt(unitId: string, debtEur: number): void {
        this.setItem(`molecular_debt_${unitId}`, debtEur);
    }

    getMolecularDebt(unitId: string): number {
        return this.getItem<number>(`molecular_debt_${unitId}`) || 0;
    }

    /**
     * FIELD NOTES (Drawing 42)
     */
    saveFieldNote(note: FieldNote): void {
        const notes = this.getFieldNotes(note.drawingId);
        notes.push(note);
        this.setItem(`notes_${note.drawingId}`, notes);
    }

    getFieldNotes(drawingId: string): FieldNote[] {
        return this.getItem<FieldNote[]>(`notes_${drawingId}`) || [];
    }

    /**
     * VIBRATION BASELINES
     */
    saveBaseline(unitId: string, signature: number[]): void {
        this.setItem(`baseline_${unitId}`, signature);
    }

    getBaseline(unitId: string): number[] | null {
        return this.getItem<number[]>(`baseline_${unitId}`);
    }

    /**
     * ANCESTRAL WISDOM
     */
    saveOverrideRecord(record: any): void {
        const history = this.getOverrideHistory();
        history.push(record);
        this.setItem('ancestral_overrides', history);
    }

    getOverrideHistory(): any[] {
        return this.getItem<any[]>('ancestral_overrides') || [];
    }

    /**
     * RESET MEMORY (For Audits/Tests)
     */
    wipeMemory(): void {
        if (this.isBrowser) {
            window.localStorage.clear();
        }
        this.memoryCache.clear();
        console.log('⚠️ [MEMORY WIPE] The Fortress has been lobotomized.');
    }
    /**
     * HIGH STRESS EVENTS (Synergy > 3.0)
     */
    saveHighStressEvent(event: { timestamp: string, synergyFactor: number, reason: string }) {
        const key = `stress_event_${Date.now()}`;
        this.setItem(key, event);

        // Also add to a daily log list
        const log = this.getItem<any[]>('daily_stress_log') || [];
        log.push(event);
        this.setItem('daily_stress_log', log);
    }

    getDailyStressLog(): any[] {
        return this.getItem<any[]>('daily_stress_log') || [];
    }
}
