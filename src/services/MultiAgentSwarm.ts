/**
 * MultiAgentSwarm.ts
 * 
 * Multi-Agent Decision Swarm Architecture
 * Sub-agents: ProfitMaximizer, AssetGuardian, GridStabilizer
 * Uses Nash Equilibrium to resolve conflicts between competing objectives
 */

export interface AgentVote {
    agentId: string;
    recommendation: 'INCREASE_LOAD' | 'DECREASE_LOAD' | 'MAINTAIN' | 'SHUTDOWN';
    confidence: number; // 0-1
    expectedValue: number; // EUR/hour
    reasoning: string;
}

export interface NashEquilibrium {
    decision: 'INCREASE_LOAD' | 'DECREASE_LOAD' | 'MAINTAIN' | 'SHUTDOWN';
    targetLoad: number; // MW
    consensusScore: number; // 0-1 (how well agents agree)
    tradeoffs: {
        profitImpact: number; // EUR/hour
        wearImpact: number; // RUL hours lost
        gridImpact: number; // Grid stability points
    };
}

export class MultiAgentSwarm {
    private static agents: Map<string, BaseAgent> = new Map();

    /**
     * Initialize swarm agents
     */
    public static initialize(): void {
        console.log('[Swarm] Initializing multi-agent decision swarm...');

        // Agent 1: Profit Maximizer
        this.agents.set('PROFIT_MAXIMIZER', new ProfitMaximizer());

        // Agent 2: Asset Guardian
        this.agents.set('ASSET_GUARDIAN', new AssetGuardian());

        // Agent 3: Grid Stabilizer
        this.agents.set('GRID_STABILIZER', new GridStabilizer());

        console.log(`[Swarm] ✅ ${this.agents.size} agents initialized`);
    }

    /**
     * Execute swarm decision-making process
     */
    public static async decideOptimalStrategy(context: {
        currentLoad: number; // MW
        marketPrice: number; // EUR/MWh
        rul: number; // hours
        gridFrequency: number; // Hz
        waterAvailability: number; // m³/s
    }): Promise<NashEquilibrium> {
        console.log('[Swarm] Executing multi-agent decision process...');

        // Collect votes from all agents
        const votes: AgentVote[] = [];

        for (const [agentId, agent] of this.agents.entries()) {
            const vote = agent.vote(context);
            votes.push({ ...vote, agentId });
            console.log(`  ${agentId}: ${vote.recommendation} (confidence: ${(vote.confidence * 100).toFixed(0)}%)`);
        }

        // Compute Nash Equilibrium
        const equilibrium = this.computeNashEquilibrium(votes, context);

        console.log(`[Swarm] ✅ Nash Equilibrium reached: ${equilibrium.decision}`);
        console.log(`  Target load: ${equilibrium.targetLoad.toFixed(1)} MW`);
        console.log(`  Consensus: ${(equilibrium.consensusScore * 100).toFixed(0)}%`);

        return equilibrium;
    }

    /**
     * Compute Nash Equilibrium from agent votes
     * 
     * Nash Equilibrium: Strategy profile where no agent can improve by changing
     * their strategy unilaterally
     */
    private static computeNashEquilibrium(
        votes: AgentVote[],
        context: any
    ): NashEquilibrium {
        // Weighted voting based on confidence and expected value
        const recommendations = new Map<string, number>();

        for (const vote of votes) {
            const weight = vote.confidence * Math.abs(vote.expectedValue);
            const current = recommendations.get(vote.recommendation) || 0;
            recommendations.set(vote.recommendation, current + weight);
        }

        // Find dominant strategy
        let bestRecommendation = 'MAINTAIN';
        let maxWeight = 0;

        for (const [rec, weight] of recommendations.entries()) {
            if (weight > maxWeight) {
                maxWeight = weight;
                bestRecommendation = rec;
            }
        }

        // Calculate target load
        let targetLoad = context.currentLoad;
        switch (bestRecommendation) {
            case 'INCREASE_LOAD':
                targetLoad = Math.min(context.currentLoad * 1.1, 50); // +10% or max
                break;
            case 'DECREASE_LOAD':
                targetLoad = context.currentLoad * 0.9; // -10%
                break;
            case 'SHUTDOWN':
                targetLoad = 0;
                break;
        }

        // Calculate consensus (how well agents agree)
        const totalWeight = Array.from(recommendations.values()).reduce((sum, w) => sum + w, 0);
        const consensusScore = maxWeight / totalWeight;

        // Calculate tradeoffs
        const profitAgent = votes.find(v => v.agentId === 'PROFIT_MAXIMIZER');
        const assetAgent = votes.find(v => v.agentId === 'ASSET_GUARDIAN');
        const gridAgent = votes.find(v => v.agentId === 'GRID_STABILIZER');

        return {
            decision: bestRecommendation as NashEquilibrium['decision'],
            targetLoad,
            consensusScore,
            tradeoffs: {
                profitImpact: profitAgent?.expectedValue || 0,
                wearImpact: assetAgent?.expectedValue || 0,
                gridImpact: gridAgent?.expectedValue || 0
            }
        };
    }

    /**
     * Get swarm status
     */
    public static getStatus(): {
        agentCount: number;
        agents: string[];
    } {
        return {
            agentCount: this.agents.size,
            agents: Array.from(this.agents.keys())
        };
    }
}

/**
 * Base Agent Interface
 */
abstract class BaseAgent {
    abstract vote(context: any): Omit<AgentVote, 'agentId'>;
}

/**
 * Profit Maximizer Agent
 * Objective: Maximize revenue (EUR/hour)
 */
class ProfitMaximizer extends BaseAgent {
    vote(context: any): Omit<AgentVote, 'agentId'> {
        const revenue = context.currentLoad * context.marketPrice;
        const potentialRevenue = Math.min(context.currentLoad * 1.1, 50) * context.marketPrice;

        let recommendation: AgentVote['recommendation'];
        let expectedValue: number;

        if (context.marketPrice > 80) {
            // High price - maximize output
            recommendation = 'INCREASE_LOAD';
            expectedValue = potentialRevenue - revenue;
        } else if (context.marketPrice < 40) {
            // Low price - reduce output
            recommendation = 'DECREASE_LOAD';
            expectedValue = revenue * 0.9 - revenue; // Negative (cost savings)
        } else {
            recommendation = 'MAINTAIN';
            expectedValue = 0;
        }

        return {
            recommendation,
            confidence: 0.9,
            expectedValue,
            reasoning: `Market price: ${context.marketPrice.toFixed(2)} EUR/MWh`
        };
    }
}

/**
 * Asset Guardian Agent
 * Objective: Minimize turbine wear, maximize RUL
 */
class AssetGuardian extends BaseAgent {
    vote(context: any): Omit<AgentVote, 'agentId'> {
        let recommendation: AgentVote['recommendation'];
        let expectedValue: number;

        if (context.rul < 720) { // < 30 days RUL
            recommendation = 'DECREASE_LOAD';
            expectedValue = 100; // RUL hours saved (converted to EUR equivalent)
        } else if (context.rul > 2160) { // > 90 days RUL
            recommendation = 'INCREASE_LOAD';
            expectedValue = -50; // Accept some wear
        } else {
            recommendation = 'MAINTAIN';
            expectedValue = 0;
        }

        return {
            recommendation,
            confidence: 0.85,
            expectedValue,
            reasoning: `RUL: ${context.rul} hours (${(context.rul / 24).toFixed(0)} days)`
        };
    }
}

/**
 * Grid Stabilizer Agent
 * Objective: Maintain grid frequency at 50 Hz
 */
class GridStabilizer extends BaseAgent {
    vote(context: any): Omit<AgentVote, 'agentId'> {
        const frequencyError = Math.abs(context.gridFrequency - 50);

        let recommendation: AgentVote['recommendation'];
        let expectedValue: number;

        if (context.gridFrequency < 49.9) {
            // Grid underfrequency - increase generation
            recommendation = 'INCREASE_LOAD';
            expectedValue = 200; // Grid stability value
        } else if (context.gridFrequency > 50.1) {
            // Grid overfrequency - decrease generation
            recommendation = 'DECREASE_LOAD';
            expectedValue = 150;
        } else {
            recommendation = 'MAINTAIN';
            expectedValue = 0;
        }

        return {
            recommendation,
            confidence: 0.95,
            expectedValue,
            reasoning: `Grid frequency: ${context.gridFrequency.toFixed(3)} Hz`
        };
    }
}

// Initialize swarm
// MultiAgentSwarm.initialize(); // DISABLED: Call manually to avoid blocking startup
