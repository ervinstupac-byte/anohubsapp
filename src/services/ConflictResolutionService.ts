/**
 * ConflictResolutionService.ts
 * 
 * Command Hierarchy & Arbitration
 * Resolves conflicts between competing sub-modules (e.g. Market wants high load, Vibration wants low load).
 * Enforces the "Constitution" of the Monolit.
 */

export interface CommandProposal {
    sourceModule: string;
    proposedAction: string;
    proposedValue: number;
    priorityClass: 'SAFETY' | 'GRID' | 'ASSET' | 'ECO' | 'MARKET';
}

export interface ResolvedCommand {
    finalAction: string;
    finalValue: number;
    winner: string;
    overridden: string[];
}

export class ConflictResolutionService {

    // Priority Map (Higher = More Important)
    private static readonly PRIORITIES = {
        'SAFETY': 5,
        'GRID': 4,
        'ECO': 3,
        'ASSET': 2,
        'MARKET': 1
    };

    /**
     * ARBITRATE COMMANDS
     * Takes a list of conflicting proposals and outputs the Single Truth.
     */
    public static resolve(proposals: CommandProposal[]): ResolvedCommand {
        // Sort by Priority Descending
        const sorted = proposals.sort((a, b) => {
            return this.PRIORITIES[b.priorityClass] - this.PRIORITIES[a.priorityClass];
        });

        const winner = sorted[0];
        const losers = sorted.slice(1).map(p => p.sourceModule);

        // Logic could be more complex (e.g., Asset can cap Market), but 
        // strict hierarchy is safest for industrial control.
        // Example: Market says 100MW, Asset says Max 80MW.
        // If implemented as "constraints", Asset 'wins' the upper bound.
        // Here we assume proposals include limits.

        // Refined Logic: If Asset sets a LIMIT, it modifies the Market proposal?
        // Let's stick to "Winner Takes All" for the base logic layer, 
        // assuming "Asset" proposes a Cap, not a Setpoint.

        // Actually, let's implement a simple override log.

        return {
            finalAction: winner.proposedAction,
            finalValue: winner.proposedValue,
            winner: winner.sourceModule,
            overridden: losers
        };
    }
}
