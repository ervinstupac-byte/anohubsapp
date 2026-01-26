import { SovereignMemory } from './SovereignMemory';

/**
 * ANCESTRAL ORACLE
 * The Living Archive 🗣️📜
 * Answers questions from the future using the Master's preserved logic.
 */

export class AncestralOracle {
    private memory: SovereignMemory;

    constructor() {
        this.memory = new SovereignMemory();
    }

    /**
     * CONSULT THE ANCESTORS
     * Responds to a query from the future.
     */
    consult(query: string, yearOfQuery: number): string {
        const overrides = this.memory.getOverrideHistory();

        // Search history first
        const relevantHistory = overrides.find(o => query.includes(o.context.tag) || query.includes('override'));
        if (relevantHistory) {
            return `[ANCESTRAL WISDOM]: In ${new Date(relevantHistory.timestamp).getFullYear()}, the Master overrode this because: "${relevantHistory.reason}". Context: ${JSON.stringify(relevantHistory.context)}`;
        }

        if (query.toLowerCase().includes('spiral casing') && query.toLowerCase().includes('crack')) {
            return `[ARCHIVE RETRIEVAL ${yearOfQuery}]: The Ant-King decreed in 2026: Do not weld the Casing blindly. Check the fillet radius first. Use Generative Design V5.0 (File: D42_Gen5). Maintain the curve.`;
        }

        return `[ARCHIVE RETRIEVAL ${yearOfQuery}]: The wisdom for this is stored in the Deep Library. Search tag: "SOLVED_2026".`;
    }

    /**
     * LEARN FROM OVERRIDE (PHASE 30.0)
     * Captures the "Why" behind manual interventions.
     */
    learnFromOverride(reason: string, context: any): void {
        console.log(`[ORACLE] Absorbing Wisdom: "${reason}"`);
        this.memory.saveOverrideRecord({
            timestamp: Date.now(),
            reason,
            context
        });
    }
}
